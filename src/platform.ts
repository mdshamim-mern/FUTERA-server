import {AsyncLocalStorage} from "node:async_hooks";
import type {Request,Response,CookieOptions} from "express";
export const context=new AsyncLocalStorage<{req:Request;res:Response;userId?:string}>();
export const cache=<T>(value:T):T=>value;
export async function cookies(){const ctx=context.getStore();if(!ctx)throw Error("Request context missing");return {get(name:string){const pairs=(ctx.req.headers.cookie??"").split(";").map(v=>v.trim());const value=pairs.find(v=>v.startsWith(name+"="))?.slice(name.length+1);if(value===undefined)return undefined;try{return {value:decodeURIComponent(value)};}catch{return undefined;}},set(name:string,value:string,options:CookieOptions&{maxAge?:number}){ctx.res.cookie(name,value,{...options,maxAge:options.maxAge===undefined?undefined:options.maxAge*1000});},delete(name:string){ctx.res.clearCookie(name,{path:"/"});}};}
