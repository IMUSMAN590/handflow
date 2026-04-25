import { useRef, useEffect, useState } from 'react';

interface CameraPreviewProps {
  isEnabled: boolean;
}

export function CameraPreview({ isEnabled }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isEnabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isEnabled]);

  return (
    <div className="relative rounded-card overflow-hidden bg-dark-surface border border-dark-border">
      <div className="aspect-[4/3] relative">
        {isCameraActive && videoRef.current ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-bg">
            {error ? (
              <div className="text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" className="mx-auto mb-1">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <span className="text-[10px] text-error">{error}</span>
              </div>
            ) : isEnabled ? (
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-text-muted">Starting camera...</span>
              </div>
            ) : (
              <div className="text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" className="mx-auto mb-1">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="text-[10px] text-text-muted">Enable to start camera</span>
              </div>
            )}
          </div>
        )}

        {isCameraActive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/50 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[9px] text-white font-medium">LIVE</span>
          </div>
        )}
      </div>

      {!isEnabled && (
        <div className="absolute inset-0 bg-dark-bg/60 flex items-center justify-center">
          <span className="text-xs text-text-muted">GestureFlow is disabled</span>
        </div>
      )}
    </div>
  );
}
