export async function downloadMemberCard(profile: {fullName: string; memberId: string; role: string}, qr: SVGSVGElement) {
  const canvas=document.createElement('canvas'); canvas.width=1586; canvas.height=1000;
  const context=canvas.getContext('2d'); if(!context)throw new Error('Image export is unavailable.');
  context.fillStyle='#071120'; context.fillRect(0,0,1586,1000);
  context.strokeStyle='#39ff14'; context.lineWidth=8; context.strokeRect(24,24,1538,952);
  context.fillStyle='#39ff14'; context.font='bold 90px Arial'; context.fillText('DataCamp',90,160);
  context.fillStyle='#cbd5e1'; context.font='40px Arial'; context.fillText('STUDENT CLUB · MEMBERSHIP CARD',90,235);
  context.fillStyle='#94a3b8'; context.font='32px Arial'; context.fillText('FULL NAME / الاسم',90,410);
  context.fillStyle='#ffffff'; context.font='bold 66px Arial';
  context.fillText(profile.fullName,90,510,1040);
  context.fillStyle='#94a3b8'; context.font='32px Arial'; context.fillText('MEMBER ID / رقم العضوية',90,650);
  context.fillStyle='#00e5ff'; context.font='bold 40px monospace'; context.fillText(profile.memberId,90,725,1000);
  context.fillStyle='#ffffff'; context.font='36px Arial'; context.fillText(profile.role.toUpperCase(),90,870);
  const qrUrl=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(qr)],{type:'image/svg+xml'}));
  try {const image=new Image(); image.src=qrUrl; await image.decode(); context.fillStyle='#fff';context.fillRect(1180,580,330,330);context.drawImage(image,1180,580,330,330);}
  finally {URL.revokeObjectURL(qrUrl);}
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Image export failed.')),'image/png'));
  const url=URL.createObjectURL(blob); const link=document.createElement('a');link.href=url;link.download=`DataCamp-ID-${profile.memberId.replace(/[^a-zA-Z0-9_-]/g,'_')}.png`;
  document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
