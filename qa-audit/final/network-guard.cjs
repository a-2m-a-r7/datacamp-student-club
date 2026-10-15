// Local-only Node transport guard. Test adapters may replace fetch; real transport
// remains loopback-only. Never load environment files from this module.
const http=require('node:http'),https=require('node:https');
function allowed(input){const host=typeof input==='string'||input instanceof URL?new URL(input).hostname:input?.hostname||input?.host||'localhost';if(!['localhost','127.0.0.1','[::1]','::1'].includes(host))throw Error('QA_NETWORK_BLOCKED: '+host);}
for(const mod of [http,https])for(const key of ['request','get']){const original=mod[key];mod[key]=function(input,...rest){allowed(input);return original.call(this,input,...rest);};}
const original=globalThis.fetch;globalThis.fetch=function(input,...rest){allowed(typeof input==='object'&&input?.url?input.url:input);return original.call(this,input,...rest);};
