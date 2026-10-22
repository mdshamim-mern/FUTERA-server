import {randomBytes,randomUUID,createHash} from "node:crypto";
import mongoose,{Schema} from "mongoose";
import {createRemoteJWKSet,jwtVerify} from "jose";
import {z} from "zod";
import {env} from "../lib/env.ts";
import {cookies} from "../platform.ts";
import {commerceEnabled,HttpError} from "./guards.ts";
import {limitAuth} from "./auth-rate.ts";
import {UserModel} from "./models/commerce.ts";
import {issueSession} from "../auth.ts";
import {hashPassword} from "../lib/password.ts";
const schema=new Schema({_id:String,verifier:String,nonce:String,expiresAt:Date},{autoIndex:false});schema.index({expiresAt:1},{expireAfterSeconds:0});
export const OAuthModel=mongoose.models.OAuthAttempt??mongoose.model("OAuthAttempt",schema);
const jwks=createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const digest=(s:string)=>createHash("sha256").update(s).digest("hex");
export const googleEnabled=()=>Boolean(env.COMMERCE_ENABLED==="true"&&env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET);
function configured(){commerceEnabled();if(!googleEnabled())throw new HttpError(503,"Google sign-in is not configured.");}
export async function beginGoogle(){
 configured();await limitAuth("google-start-global",200);const state=randomBytes(32).toString("hex"),verifier=randomBytes(48).toString("base64url"),nonce=randomBytes(32).toString("hex");
 await OAuthModel.create({_id:digest(state),verifier,nonce,expiresAt:new Date(Date.now()+600000)});
 (await cookies()).set("futera-oauth",state,{httpOnly:true,secure:env.APP_URL.startsWith("https:"),sameSite:"lax",path:"/",maxAge:600});
 const query=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID!,redirect_uri:new URL("/auth/google/callback",env.APP_URL).href,response_type:"code",scope:"openid email profile",state,nonce,code_challenge:createHash("sha256").update(verifier).digest("base64url"),code_challenge_method:"S256"});
 return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}
export async function completeGoogle(raw:unknown){
 configured();const input=z.object({state:z.string().regex(/^[a-f0-9]{64}$/),code:z.string().min(1).max(4096)}).parse(raw);const jar=await cookies();const expected=jar.get("futera-oauth")?.value;jar.delete("futera-oauth");if(!expected||expected!==input.state)throw new HttpError(401,"Invalid sign-in state.");
 await limitAuth("google-complete-global",200);const attempt=await OAuthModel.findOneAndDelete({_id:digest(input.state),expiresAt:{$gt:new Date()}});if(!attempt)throw new HttpError(401,"Sign-in expired. Try again.");
 const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID!,client_secret:env.GOOGLE_CLIENT_SECRET!,redirect_uri:new URL("/auth/google/callback",env.APP_URL).href,grant_type:"authorization_code",code:input.code,code_verifier:attempt.verifier}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new HttpError(401,"Google sign-in failed.");const token=z.object({id_token:z.string()}).parse(await response.json());const {payload}=await jwtVerify(token.id_token,jwks,{issuer:["https://accounts.google.com","accounts.google.com"],audience:env.GOOGLE_CLIENT_ID!,algorithms:["RS256"]});
 if(payload.nonce!==attempt.nonce||payload.email_verified!==true||!payload.sub)throw new HttpError(401,"Google identity could not be verified.");const email=z.email().parse(payload.email).toLowerCase();
 let user=await UserModel.findOne({googleSub:payload.sub});if(!user){if(await UserModel.exists({email}))throw new HttpError(409,"This email already has an account. Sign in with your password.");user=await UserModel.create({_id:randomUUID(),email,name:typeof payload.name==="string"?payload.name.slice(0,80):"FUTERA customer",googleSub:payload.sub,passwordHash:await hashPassword(randomBytes(48).toString("hex")),role:"customer"});}
 if(user.disabled)throw new HttpError(403,"Account disabled.");return issueSession(user);
}
