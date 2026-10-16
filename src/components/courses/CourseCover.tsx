import React from 'react';
import {BookOpen} from 'lucide-react';
import {AssetImage} from '../AssetImage';

/** Only stored course images are displayed; missing covers use a neutral graphic. */
export function CourseCover({src,title,children}:{src?:string;title:string;children?:React.ReactNode}) {
 return <div className="relative aspect-video w-full overflow-hidden bg-dark-navy">
  {src ? <AssetImage src={src} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"/> :
   <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10" aria-hidden="true">
    <span className="rounded-3xl border border-primary/20 bg-dark-navy/50 p-5"><BookOpen className="h-10 w-10 text-primary/70"/></span>
   </div>}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-navy/70 via-transparent to-black/10"/>
  {children}
 </div>;
}
