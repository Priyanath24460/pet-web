"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { Loader2, X, Check } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({ imageSrc, onCropComplete, onCancel }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Crop Image (1:1)</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition bg-slate-100 hover:bg-slate-200 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-[400px] bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            cropShape="rect"
            showGrid={true}
          />
        </div>

        <div className="p-6 bg-slate-50 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-500">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007BFF]"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 text-slate-600 font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-1 py-3 text-white font-bold bg-[#007BFF] rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Save Crop
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
