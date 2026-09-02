import React, { useState, useRef, useEffect } from 'react';
import { Camera, SwitchCamera, X, Check, RefreshCw, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Data: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Photo'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedPhoto]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Unable to access camera. You can upload a photo from your gallery instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPhoto(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      setCapturedPhoto(null);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900/90 z-10">
          <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Captured Photo */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            <img src={capturedPhoto} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95">
                  <Camera className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-xs text-slate-300 mb-4">{cameraError}</p>
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload from Gallery
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom controls */}
        <div className="p-5 flex items-center justify-around bg-slate-950">
          {capturedPhoto ? (
            <div className="flex items-center justify-between w-full px-4">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white shadow-lg transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                Use Photo
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full px-6">
              {/* File upload fallback */}
              <label className="p-3 text-slate-400 hover:text-white rounded-full bg-slate-800 cursor-pointer transition-colors">
                <Upload className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Shutter Button */}
              <button
                onClick={takeSnapshot}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 transition-transform active:scale-90"
              >
                <div className="w-full h-full rounded-full bg-white hover:bg-slate-200" />
              </button>

              {/* Flip camera */}
              <button
                onClick={switchCamera}
                className="p-3 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
