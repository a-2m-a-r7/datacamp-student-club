import React, {useId, useRef, useState} from 'react';
import {FileText, Film, Subtitles, UploadCloud} from 'lucide-react';
import {useLanguage} from '../../contexts/LanguageContext';

type Props = {
 kind: 'video' | 'material' | 'subtitle';
 accept: string;
 inputLabel: string;
 disabled: boolean;
 onFile: (file: File) => void;
 onReject: (message: string) => void;
};

/** Selection only: the existing upload service owns hashing, resume and saving. */
export function CourseFileDropzone({kind,accept,inputLabel,disabled,onFile,onReject}: Props) {
 const {isArabic}=useLanguage();
 const input=useRef<HTMLInputElement>(null),depth=useRef(0);
 const id=useId();
 const [dragging,setDragging]=useState(false);
 const video=kind==='video';
 const Icon=video?Film:kind==='subtitle'?Subtitles:FileText;
 const title=video?(isArabic?'فيديو الدرس':'Lesson video'):kind==='material'?(isArabic?'ملفات الماتريال':'Lesson materials'):(isArabic?'ملف الترجمة':'Lesson subtitles');
 const choose=video?(isArabic?'اختيار فيديو الدرس':'Choose lesson video'):kind==='material'?(isArabic?'اختيار ملفات الماتريال':'Choose lesson material'):(isArabic?'اختيار ملف الترجمة':'Choose lesson subtitles');
 const hint=video?'MP4 · WebM · MOV':kind==='subtitle'?'SRT · VTT':'PDF · Documents · Slides · Code · ZIP';
 const fileDrag=(e:React.DragEvent)=>Array.from(e.dataTransfer.types).includes('Files');
 const reset=()=>{depth.current=0;setDragging(false);};
 return <div className="relative min-w-0"
  onDragEnter={e=>{if(!fileDrag(e))return;e.preventDefault();if(!disabled){depth.current++;setDragging(true);}}}
  onDragOver={e=>{if(!fileDrag(e))return;e.preventDefault();e.dataTransfer.dropEffect=disabled?'none':'copy';}}
  onDragLeave={e=>{e.preventDefault();if(--depth.current<=0)reset();}}
  onDrop={e=>{e.preventDefault();e.stopPropagation();reset();if(disabled)return;
   if(e.dataTransfer.files.length!==1){onReject(isArabic?'اختر ملفًا واحدًا في كل مرة.':'Choose one file at a time.');return;}
   onFile(e.dataTransfer.files[0]);
  }}>
  <input ref={input} id={id} aria-label={inputLabel} disabled={disabled} type="file" accept={accept}
   className="sr-only" tabIndex={-1} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(file&&!disabled)onFile(file);}} />
  <button type="button" aria-label={choose} aria-controls={id} disabled={disabled}
   onClick={()=>input.current?.click()}
   className={`group w-full rounded-2xl border-2 border-dashed p-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-navy disabled:cursor-not-allowed disabled:opacity-50 ${video?'min-h-48':'min-h-36'} ${dragging&&!disabled?'border-primary bg-primary/15':'border-white/15 bg-white/[0.025] enabled:hover:border-primary/60 enabled:hover:bg-primary/5'}`}>
   <span className={`mx-auto mb-3 flex w-12 h-12 items-center justify-center rounded-2xl border ${dragging&&!disabled?'bg-primary/20 border-primary/40':'bg-primary/10 border-primary/15'}`}>
    {dragging&&!disabled?<UploadCloud className="h-6 w-6 text-primary" aria-hidden="true"/>:<Icon className="h-6 w-6 text-primary" aria-hidden="true"/>}
   </span>
   <span className="block text-sm font-semibold text-foreground">{title}</span>
   <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
    {dragging&&!disabled?(isArabic?'أفلت الملف هنا لبدء الرفع':'Drop the file here to upload'):(isArabic?'اسحب الملف وأفلته هنا، أو اضغط لاختياره من جهازك':'Drag and drop a file here, or click to browse')}
   </span>
   <span dir="ltr" className="mt-3 block text-[11px] text-muted-foreground">{hint} · {kind==='subtitle'?'5 MiB':'2 GiB'}</span>
  </button>
 </div>;
}
