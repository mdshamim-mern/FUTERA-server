import {existsSync} from "node:fs";
import {loadEnvFile} from "node:process";
for(const file of [".env.local",".env"])if(existsSync(file))loadEnvFile(file);
const {default:app}=await import("./app.ts");
if(!process.env.VERCEL){const port=Number(process.env.PORT??4000);if(!Number.isInteger(port)||port<1||port>65535)throw Error("Invalid PORT");app.listen(port,"127.0.0.1",()=>console.log(`FUTERA API listening on ${port}`));}
export default app;
