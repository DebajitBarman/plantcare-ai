import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, FileCheck } from 'lucide-react';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ImageUploader({ selectedFile, setSelectedFile, previewUrl, setPreviewUrl, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      onError('Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP leaf image.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 10 MB limit.`);
      return;
    }

    if (file.size === 0) {
      onError('The selected image file is empty.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onError(null);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        /* Drag and Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-white'
          } shadow-xs hover:shadow-sm`}
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            Drag & drop your leaf photo here
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            or click to browse from your device (JPG, PNG, WEBP up to 10MB)
          </p>

          <div className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-semibold px-4 py-2 rounded-xl text-xs transition-colors">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>Choose Image</span>
          </div>
        </div>
      ) : (
        /* Preview Zone */
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-72 flex items-center justify-center group">
            <img
              src={previewUrl}
              alt="Leaf Preview"
              className="w-full h-full object-contain"
            />
            {/* Quick Action Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 bg-white text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center space-x-1.5 bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-red-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-600 truncate max-w-xs">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold truncate">{selectedFile?.name}</span>
              <span className="text-slate-400">({(selectedFile?.size / 1024).toFixed(0)} KB)</span>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-800 font-bold cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
