'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

interface PresetItem {
  label: string;
  url: string;
}

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  presets?: PresetItem[];
  fallbackImage?: string;
  required?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  label = 'Product Image',
  presets = [],
  fallbackImage = '/products/inverter-demo-1.jpg',
  required = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    setUploadError(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    // Immediate local visual preview via FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onChange(e.target.result);
      }
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image file');
      }

      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      console.warn('Upload API notice, local preview preserved:', err);
      // Notice: If server upload had an issue, the FileReader data URL set above is already active
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // Reset file input value so re-selecting same file triggers onChange
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-[#142B55] hover:text-[#D52B30] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL field' : 'Enter URL manually'}</span>
        </button>
      </div>

      {uploadError && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Upload / Drag & Drop Zone */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`sm:col-span-2 border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            isDragging
              ? 'border-[#142B55] bg-blue-50/70 scale-[0.99]'
              : 'border-slate-300 hover:border-[#142B55] bg-white hover:bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#142B55] shadow-2xs">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#D52B30]" />
            ) : (
              <Upload className="w-5 h-5 text-[#142B55]" />
            )}
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-slate-800">
              {isUploading ? 'Uploading Image to Server...' : 'Click to Pick Image from Computer / Phone'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              PNG, JPG, WEBP, or SVG • Drag & drop supported
            </p>
          </div>
        </div>

        {/* Live Active Preview Card */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2 relative">
          <div className="w-full h-24 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-100 p-1">
            {value ? (
              <img
                src={value}
                alt="Selected preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackImage;
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[9px]">No image selected</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between w-full px-1">
            <span className="text-[10px] font-bold text-slate-600 truncate flex items-center gap-1">
              {value ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700">Image Ready</span>
                </>
              ) : (
                'Pending'
              )}
            </span>

            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="text-[10px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manual URL Input (collapsible) */}
      {showUrlInput && (
        <div className="pt-1">
          <input
            type="text"
            placeholder="Or paste external Image URL / Path (e.g. /products/... or https://...)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono text-[11px] focus:outline-none focus:border-[#142B55]"
          />
        </div>
      )}

      {/* Quick Presets (if provided) */}
      {presets.length > 0 && (
        <div className="pt-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Or Choose from High-Res Presets
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presets.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-[#142B55] ring-2 ring-[#142B55]/20 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center p-0.5">
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 truncate w-full text-center">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
