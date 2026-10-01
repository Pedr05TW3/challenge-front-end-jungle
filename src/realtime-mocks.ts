import { WebSocketInterceptor } from '@mswjs/interceptors/WebSocket';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { catalog, updateMarketPrice } from './mocks';
const interceptor=new WebSocketInterceptor();
interceptor.on('connection',connection=>{const {client}=toSocketIo({...connection,params:{}});client.on('subscribe',()=>{const nft=catalog.find(entry=>entry.id==='ape-042')!;client.emit('nft.updated',{id:nft.id,resource:'nft',price:nft.price,supply:nft.supply,version:nft.version})});const nft=catalog.find(entry=>entry.id==='ape-042')!;const timer=window.setTimeout(()=>{updateMarketPrice(nft.id,'0.89',Math.max(0,nft.supply-1));client.emit('nft.updated',{id:nft.id,resource:'nft',price:nft.price,supply:nft.supply,version:nft.version})},15_000);connection.server.addEventListener('close',()=>window.clearTimeout(timer))});
interceptor.apply();
