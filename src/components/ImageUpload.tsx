import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function ImageUpload({ value, onChange, className = '', placeholder = 'Загрузить изображение' }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUrlInput('');
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const isGif = value?.includes('.gif') || value?.startsWith('data:image/gif');

  return (
    <div className={`w-full ${className}`}>
      {/* Mode Toggle */}
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg border transition-colors ${
            mode === 'upload' 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Upload size={12} />
          Файл
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg border transition-colors ${
            mode === 'url' 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <LinkIcon size={12} />
          Ссылка
        </button>
      </div>

      {value ? (
        <div className="relative rounded-lg overflow-hidden group border border-gray-200">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-40 object-cover bg-gray-50" 
          />
          {isGif && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded font-medium">
              GIF
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
              title="Удалить"
            >
              <X size={18} />
            </button>
            {mode === 'upload' && (
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <div className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors" title="Заменить">
                  <Upload size={18} />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : mode === 'upload' ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors h-40 flex flex-col items-center justify-center
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
          `}
        >
          <input {...getInputProps()} />
          <ImageIcon className={`w-8 h-8 mb-2 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600 font-medium">
            {isDragActive ? 'Отпустите файл' : placeholder}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF, WebP (макс. 5MB)
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              OK
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Вставьте ссылку на изображение или GIF
          </p>
        </div>
      )}
    </div>
  );
}
