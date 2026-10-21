import { randomBytes, scrypt as nativeScrypt, timingSafeEqual } from "node:crypto";
const derive=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>nativeScrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));
export async function hashPassword(password:string){const salt=randomBytes(16).toString("hex");return `scrypt-v1:${salt}:${(await derive(password,salt)).toString("hex")}`;}
export async function verifyPassword(password:string,encoded:string){const [version,salt,hash]=encoded.split(":");if(version!=="scrypt-v1"||!salt||!hash)return false;const actual=await derive(password,salt);const expected=Buffer.from(hash,"hex");return actual.length===expected.length&&timingSafeEqual(actual,expected);}
