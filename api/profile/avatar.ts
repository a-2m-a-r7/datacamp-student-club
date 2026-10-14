import { authorizedProfile, persistProviderAvatar } from '../_lib/profile-avatar.js';
export default async function handler(req:any,res:any) {
 if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 const auth=await authorizedProfile(req,res);if(!auth)return;
 const action=req.body?.action||'persist-current';
 if(!['persist-current','use-google'].includes(action))return res.status(400).json({error:'Unknown avatar action.'});
 try {return res.status(200).json(await persistProviderAvatar(auth.client,auth.user,auth.profile,action));}
 catch{return res.status(502).json({error:'Unable to store the account image. Your existing photo was preserved.'});}
}
