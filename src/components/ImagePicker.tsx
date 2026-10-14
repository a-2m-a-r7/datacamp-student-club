import { AssetImage } from './AssetImage';
import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Camera, Image as ImageIcon, X } from 'lucide-react';
import { Button } from './ui/Button';

interface ImagePickerProps {
  onImageSelected: (base64: string) => void;
  currentImage?: string;
  label?: string;
  disabled?: boolean;
  allowRemoteUrl?: boolean;
  onReadingChange?: (reading:boolean) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ onImageSelected, currentImage, label, disabled=false, allowRemoteUrl=true, onReadingChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (disabled) return;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds maximum allowed limit of 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Unsupported file format. Please upload JPEG, PNG, or WebP images only.');
        return;
      }
      const reader = new FileReader();
      onReadingChange?.(true);
      reader.onerror = () => {onReadingChange?.(false);alert('Unable to read this image. Please choose it again.');};
      reader.onload = () => {
        onImageSelected(reader.result as string);
        onReadingChange?.(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="space-y-4">
      {label && <label className="text-[10px] font-cyber uppercase tracking-widest text-muted-foreground">{label}</label>}

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Preview Area */}
        <div className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-white/10 glass flex items-center justify-center overflow-hidden group">
          {currentImage ? (
            <>
              <AssetImage src={currentImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-dark-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button type="button" aria-label="Remove image" disabled={disabled} variant="ghost" size="icon" onClick={() => onImageSelected('')} className="text-destructive">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground opacity-20" />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <input type="file" ref={cameraInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileChange} />
          <Button type="button" disabled={disabled} variant="outline" size="sm" className="justify-start" onClick={triggerUpload}>
            <Upload className="w-4 h-4 mr-2" />
            IMPORT_FROM_DEVICE
          </Button>

          {allowRemoteUrl && <Button type="button" disabled={disabled} variant="outline" size="sm" className="justify-start" onClick={() => {
            const value = prompt('Enter the image HTTPS URL:');
            if (!value) return;
            try { const url = new URL(value); if (url.protocol !== 'https:') throw Error(); onImageSelected(url.href); }
            catch { alert('Enter a valid HTTPS image URL.'); }
          }}>
            <ImageIcon className="w-4 h-4 mr-2" />
            SELECT_PHOTO_ARCHIVE
          </Button>}

          <Button type="button" disabled={disabled} variant="outline" size="sm" className="justify-start" onClick={() => cameraInputRef.current?.click()}>
            <Camera className="w-4 h-4 mr-2" />
            TAKE_PHOTO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePicker;
