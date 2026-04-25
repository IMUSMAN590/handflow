interface StatusIndicatorProps {
  isEnabled: boolean;
  isTracking: boolean;
  isCameraReady: boolean;
  fps?: number;
  lastGesture?: string;
}

export function StatusIndicator({
  isEnabled,
  isTracking,
  isCameraReady,
  fps,
  lastGesture,
}: StatusIndicatorProps) {
  const getStatusColor = () => {
    if (!isEnabled) return 'bg-dark-border';
    if (!isCameraReady) return 'bg-warning';
    if (isTracking) return 'bg-accent';
    return 'bg-primary';
  };

  const getStatusText = () => {
    if (!isEnabled) return 'Disabled';
    if (!isCameraReady) return 'Camera Off';
    if (isTracking) return 'Active';
    return 'Ready';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${getStatusColor()}`}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-light-bg">{getStatusText()}</span>
        <div className="flex items-center gap-2">
          {fps !== undefined && isEnabled && (
            <span className="text-[10px] text-text-muted">{fps} FPS</span>
          )}
          {lastGesture && (
            <span className="text-[10px] text-primary truncate max-w-[120px]">
              Last: {lastGesture}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
