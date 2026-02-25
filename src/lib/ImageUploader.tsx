import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { cn, fileToBase64 } from './utils';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = "Upload Image",
  className
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) { // 500KB limit
      setError("Файл слишком большой (макс 500KB)");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
      setError(null);
    } catch (err) {
      setError("Ошибка при загрузке файла");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs rounded-md border transition-colors",
            mode === 'upload' 
              ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          <Upload size={14} />
          Загрузить
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs rounded-md border transition-colors",
            mode === 'url' 
              ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          <LinkIcon size={14} />
          Ссылка
        </button>
      </div>

      {mode === 'upload' ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {value ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
              <img src={value} alt="Preview" className="w-full h-48 object-cover bg-gray-50" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-gray-900 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100"
                  >
                    Изменить
                  </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors bg-gray-50 hover:bg-indigo-50/10"
            >
              <ImageIcon size={24} className="mb-2" />
              <span className="text-sm">Нажмите для загрузки</span>
              <span className="text-xs text-gray-400 mt-1">Макс. 500KB</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
           <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          {value && (
             <div className="relative rounded-lg overflow-hidden border border-gray-200 h-48">
              <img src={value} alt="Preview" className="w-full h-full object-cover bg-gray-50" />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
