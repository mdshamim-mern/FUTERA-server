import {randomUUID,randomBytes} from "node:crypto";
import {z} from "zod";
import {requireUser,HttpError} from "./guards.ts";
import {BuildModel} from "./models/commerce.ts";
export async function mutateBuild(form:FormData){
 const user=await requireUser();const id=z.uuid().parse(form.get("id"));const build=await BuildModel.findOne({_id:id,ownerId:user._id});if(!build)throw new HttpError(404,"Build not found.");
 const operation=z.enum(["delete","rename","duplicate","share","unshare"]).parse(form.get("operation"));
 if(operation==="delete")await BuildModel.deleteOne({_id:id,ownerId:user._id});
 else if(operation==="rename"){build.name=z.string().trim().min(1).max(80).parse(form.get("name"));await build.save();}
 else if(operation==="duplicate")await BuildModel.create({_id:randomUUID(),ownerId:user._id,name:`Copy of ${build.name}`.slice(0,80),refs:build.refs.map(r=>({id:r.id,quantity:r.quantity}))});
 else if(operation==="share"){build.shareToken=randomBytes(24).toString("hex");await build.save();}
 else if(operation==="unshare"){build.shareToken=null;await build.save();}
}

