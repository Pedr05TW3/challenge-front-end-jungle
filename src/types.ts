export type NFT = { id:string; name:string; creator:string; collection:string; price:string; supply:number; image:string; category:string; network:string; description:string; version:number };
export type User = { id:string; name:string; email:string; avatar:string };
export type CartItem = { nftId:string; quantity:number };
export type Wallet = { id:string; name:string; address:string; network:string; primary:boolean; alias?:string; profile?:string; ens?:string; type?:string; referral?:string; email?:string; ensName?:string };
export type Order = { id:string; status:'pending'|'confirmed'|'rejected'; items:Array<{nft:NFT;quantity:number}>; subtotal:string; fee:string; total:string; tx:string; createdAt:string };
