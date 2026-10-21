import type {BuildReference} from "../builder/schema.ts";
export type PricedProduct={slug:string;name:string;priceMinor:number;stock:number;active:boolean;isSample:boolean};
export type Coupon={percent:number;minimumMinor:number;maximumDiscountMinor:number;startsAt:number;endsAt:number;maxUses:number;used:number;active:boolean;sampleOnly:boolean};
export function calculateOrder(refs:BuildReference[],products:PricedProduct[],coupon:Coupon|null,shippingMinor:number,now=Date.now()){
  if(!refs.length)throw Error("Your cart is empty.");
  const lines=refs.map(r=>{const p=products.find(p=>p.slug===r.id);if(!p?.active||p.stock<r.quantity)throw Error("A component is unavailable or exceeds stock. Review your cart.");return {id:p.slug,name:p.name,quantity:r.quantity,unitMinor:p.priceMinor};});
  const isSample=products.every(p=>p.isSample);
  if(products.some(p=>p.isSample)!==isSample)throw Error("Sample and live products cannot be ordered together.");
  const subtotalMinor=lines.reduce((n,l)=>n+l.unitMinor*l.quantity,0);
  if(coupon&&(!coupon.active||coupon.startsAt>now||coupon.endsAt<=now||coupon.used>=coupon.maxUses||subtotalMinor<coupon.minimumMinor||(coupon.sampleOnly&&!isSample)))throw Error("Coupon is expired, exhausted or not eligible.");
  const discountMinor=coupon?Math.min(subtotalMinor,coupon.maximumDiscountMinor,Math.floor(subtotalMinor*coupon.percent/100)):0;
  return {lines,subtotalMinor,discountMinor,shippingMinor,totalMinor:subtotalMinor-discountMinor+shippingMinor,isSample};
}
export const paymentMethods=[{id:"COD",label:"Cash on Delivery",enabled:true},{id:"bkash",label:"bKash — coming soon",enabled:false},{id:"nagad",label:"Nagad — coming soon",enabled:false},{id:"card",label:"Card — coming soon",enabled:false}] as const;
