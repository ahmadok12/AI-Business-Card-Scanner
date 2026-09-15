import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, SwitchCamera, Zap, ZapOff, Upload, X, Loader2, Sparkles, AlertCircle, PenLine } from 'lucide-react';
import { processCardWithGemini } from '../services/gemini';
import { getUsageStats } from '../services/db';
import { OCRResult } from '../types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scannedImage: string, ocrResult: OCRResult) => void;
  apiKey: string;
  modelName: string;
  autoCaptureDefault?: boolean;
  autoCaptureHoldTime?: number;
  onLimitReached?: () => void;
  onOpenManualEntry?: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  apiKey,
  modelName,
  autoCaptureDefault = false,
  autoCaptureHoldTime = 1.2,
  onLimitReached,
  onOpenManualEntry
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyzeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isAutoCapture, setIsAutoCapture] = useState(autoCaptureDefault);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Analyzing business card...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stabilityProgress, setStabilityProgress] = useState(0);

  const stabilityCounterRef = useRef(0);
  const lastSampleRef = useRef<Uint8ClampedArray | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setIsProcessing(false);
      setStabilityProgress(0);
      stabilityCounterRef.current = 0;
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const track = stream.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        setHasTorch(!!capabilities.torch);

        startAutoCaptureLoop();
      }
    } catch (err: any) {
      console.warn('Camera initialization error:', err);
      setErrorMsg('Unable to open live camera. You can upload a photo of the card below.');
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setIsTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle not supported', err);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const startAutoCaptureLoop = useCallback(() => {
    let lastCheckTime = performance.now();

    const checkFrame = () => {
      if (!videoRef.current || !isOpen || isProcessing) return;

      const now = performance.now();
      if (now - lastCheckTime >= 150) {
        lastCheckTime = now;

        if (isAutoCapture && videoRef.current.readyState >= 2) {
          const video = videoRef.current;
          const canvas = analyzeCanvasRef.current || document.createElement('canvas');
          analyzeCanvasRef.current = canvas;
          canvas.width = 120;
          canvas.height = 70;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (ctx) {
            const sx = video.videoWidth * 0.15;
            const sy = video.videoHeight * 0.25;
            const sw = video.videoWidth * 0.7;
            const sh = video.videoHeight * 0.5;

            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 120, 70);
            const imgData = ctx.getImageData(0, 0, 120, 70);
            const pixels = imgData.data;

            if (lastSampleRef.current) {
              let diffSum = 0;
              let nonZeroContrast = 0;
              const prev = lastSampleRef.current;

              for (let i = 0; i < pixels.length; i += 4) {
                const lumNow = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
                const lumPrev = 0.299 * prev[i] + 0.587 * prev[i + 1] + 0.114 * prev[i + 2];
                diffSum += Math.abs(lumNow - lumPrev);
                if (lumNow > 40 && lumNow < 230) nonZeroContrast++;
              }

              const avgDiff = diffSum / (pixels.length / 4);

              if (avgDiff < 7.5 && nonZeroContrast > 1500) {
                stabilityCounterRef.current += 0.15;
                const required = autoCaptureHoldTime || 1.2;
                const pct = Math.min(100, Math.round((stabilityCounterRef.current / required) * 100));
                setStabilityProgress(pct);

                if (stabilityCounterRef.current >= required) {
                  captureAndProcess();
                  return;
                }
              } else {
                stabilityCounterRef.current = Math.max(0, stabilityCounterRef.current - 0.2);
                setStabilityProgress(0);
              }
            }

            lastSampleRef.current = new Uint8ClampedArray(pixels);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkFrame);
    };

    animationFrameRef.current = requestAnimationFrame(checkFrame);
  }, [isOpen, isAutoCapture, isProcessing, autoCaptureHoldTime]);

  const captureAndProcess = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessingStatus('Capturing image...');

    try {
      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Camera not initialized');
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not access canvas context');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.92);

      stopCamera();
      await runGeminiOCR(base64Image);
    } catch (err: any) {
      console.error('Capture error:', err);
      setErrorMsg(err.message || 'Failed to capture business card');
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        stopCamera();
        await runGeminiOCR(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const [capturedImageForRetry, setCapturedImageForRetry] = useState<string | null>(null);

  const runGeminiOCR = async (base64Image: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setCapturedImageForRetry(base64Image);
    setProcessingStatus('Extracting contact details with Gemini AI...');
    try {
      const ocrResult = await processCardWithGemini(base64Image, apiKey, modelName);
      onScanComplete(base64Image, ocrResult);
      onClose();
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMsg(`AI OCR Error: ${err.message || 'Could not extract details'}. Please retry or enter manually.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedManually = () => {
    if (!capturedImageForRetry) return;
    const fallbackResult: OCRResult = {
      name: '',
      title: '',
      company: '',
      phone: '',
      secondaryPhone: '',
      whatsapp: '',
      wechat: '',
      email: '',
      website: '',
      address: '',
      socialLinks: '',
      notes: '',
      tags: ['Scanned Card']
    };
    onScanComplete(capturedImageForRetry, fallbackResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#181716] text-white animate-in fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#181716]/90 backdrop-blur-md z-20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF5722]" />
          <span className="font-syne font-bold text-sm text-white">Smart Card Scanner</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenManualEntry && (
            <button
              onClick={() => {
                onClose();
                onOpenManualEntry();
              }}
              className="px-3 py-1 rounded-full text-xs font-grotesk font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 transition-colors"
              title="Add card info manually without AI or camera"
            >
              <PenLine className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Manual Entry</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsAutoCapture(!isAutoCapture);
              setStabilityProgress(0);
              stabilityCounterRef.current = 0;
            }}
            className={`px-3 py-1 rounded-full text-xs font-grotesk font-semibold flex items-center gap-1.5 transition-all ${
              isAutoCapture
                ? 'bg-[#FF5722]/20 text-[#FF8A65] border border-[#FF5722]/50'
                : 'bg-white/10 text-white/60 border border-white/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAutoCapture ? 'bg-[#FF5722] animate-ping' : 'bg-white/40'}`} />
            Auto-Capture {isAutoCapture ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Section */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Business Card Guide Box Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
          <div className="w-full max-w-sm aspect-7/4 rounded-2xl relative border-2 border-dashed border-[#FF5722]/80 flex flex-col items-center justify-between p-4 shadow-[0_0_0_9999px_rgba(24,23,22,0.65)]">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#FF5722] rounded-tl-xl -mt-1 -ml-1" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#FF5722] rounded-tr-xl -mt-1 -mr-1" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#FF5722] rounded-bl-xl -mb-1 -ml-1" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#FF5722] rounded-br-xl -mb-1 -mr-1" />

            <div className="bg-[#181716]/85 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-grotesk font-medium text-white/90 tracking-wide border border-white/10">
              Align card edges inside frame
            </div>

            {isAutoCapture && stabilityProgress > 0 && (
              <div className="w-full bg-[#181716]/80 backdrop-blur-md rounded-full h-2 p-0.5 border border-[#FF5722]/50">
                <div
                  className="bg-gradient-to-r from-[#FF5722] to-[#FF4500] h-full rounded-full transition-all duration-150 shadow-[0_0_10px_#FF5722]"
                  style={{ width: `${stabilityProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-[#181716]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-in fade-in">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full border-4 border-[#FF5722]/20 border-t-[#FF5722] animate-spin flex items-center justify-center" />
              <Sparkles className="w-8 h-8 text-[#FF5722] absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="text-base font-syne font-bold text-white mb-1">Processing Business Card</h3>
            <p className="text-xs text-white/70 font-grotesk text-center max-w-xs">{processingStatus}</p>
          </div>
        )}

        {/* Error Notification & Action Overlay */}
        {errorMsg && (
          <div className="absolute inset-0 bg-[#181716]/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center z-40 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-syne font-bold text-white mb-1">OCR Scan Notice</h3>
            <p className="text-xs text-rose-200/90 font-grotesk max-w-xs mb-5 leading-relaxed">{errorMsg}</p>

            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              {capturedImageForRetry && (
                <button
                  type="button"
                  onClick={() => runGeminiOCR(capturedImageForRetry)}
                  className="w-full py-2.5 bg-gradient-to-r from-[#FF5722] to-[#FF4500] text-white font-grotesk font-semibold text-xs rounded-full shadow-lg transition-all active:scale-98"
                >
                  Retry AI Extraction
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenManualEntry) {
                    onOpenManualEntry();
                  } else {
                    handleProceedManually();
                  }
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-grotesk font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-1.5"
              >
                <PenLine className="w-3.5 h-3.5 text-[#FF5722]" />
                <span>Enter Details Manually (Offline)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  startCamera();
                }}
                className="w-full py-2 bg-transparent text-white/60 hover:text-white font-grotesk font-medium text-xs transition-colors"
              >
                Scan Another Card
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shutter & Tool Controls */}
      <div className="bg-[#181716] px-6 py-6 flex items-center justify-between z-20 border-t border-white/5">
        <label className="p-3.5 bg-white/10 hover:bg-white/15 rounded-full text-white/80 hover:text-white cursor-pointer transition-colors shadow-sm">
          <Upload className="w-5 h-5" />
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        <button
          onClick={captureAndProcess}
          disabled={isProcessing}
          className="w-18 h-18 rounded-full border-4 border-[#FF5722]/80 p-1.5 flex items-center justify-center transition-transform active:scale-90 hover:border-[#FF5722] shadow-[0_0_24px_rgba(255,87,34,0.45)]"
        >
          <div className="w-full h-full rounded-full bg-white hover:bg-[#F8F6F4] flex items-center justify-center text-[#181716] font-bold">
            <Camera className="w-7 h-7 text-[#FF5722]" />
          </div>
        </button>

        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-3.5 rounded-full transition-colors ${
                isTorchOn ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white/80 hover:text-white'
              }`}
            >
              {isTorchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}

          <button
            onClick={switchCamera}
            className="p-3.5 bg-white/10 hover:bg-white/15 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
