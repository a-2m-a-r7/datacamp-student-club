import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

/** Missing or unavailable media never impersonates a real club photo. */
export function AssetImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!src || failedSource === src) return (
    <div role="img" aria-label={alt || 'Image unavailable'} className={`flex items-center justify-center bg-white/5 text-muted-foreground ${className || ''}`}>
      <ImageIcon aria-hidden="true" className="h-8 w-8 opacity-40" />
    </div>
  );
  return <img {...props} src={src} alt={alt} className={className} onError={() => setFailedSource(src)} />;
}
