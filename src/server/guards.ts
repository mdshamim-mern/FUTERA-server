import {env} from "../lib/env.ts";
import {context} from "../platform.ts";
import {UserModel} from "./models/commerce.ts";
export class HttpError extends Error{constructor(public status:number,message:string){super(message);}}
export function commerceEnabled(){if(env.COMMERCE_ENABLED!=="true")throw new HttpError(503,"Commerce is not configured.");}
export async function currentUser(){const id=context.getStore()?.userId;return id?UserModel.findById(id):null;}
export async function requireUser(){commerceEnabled();const user=await currentUser();if(!user||user.disabled)throw new HttpError(401,"Please log in.");return user;}
export async function requireAdmin(){const user=await requireUser();if(user.role!=="admin")throw new HttpError(403,"Forbidden");return user;}
