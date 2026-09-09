/**
 * @file volume-slider.tsx
 * @description Audio volume control with fun styling.
 */

import { useCallback } from 'react';
import { cn } from '@/lib/cn';

interface VolumeSliderProps {
  /** Current volume (0-1) */
  volume: number;
  /** Callback when volume changes */
  onVolumeChange: (volume: number) => void;
  /** Additional CSS classes */
  className?: string;
}

export function VolumeSlider({ volume, onVolumeChange, className }: VolumeSliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onVolumeChange(parseFloat(e.target.value));
    },
    [onVolumeChange]
  );

  const volumeIcon = volume === 0 ? '\u{1F507}' : volume < 0.5 ? '\u{1F509}' : '\u{1F50A}';

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-full',
        'bg-shell-dark/50',
        className
      )}
    >
      <span className="text-sm" role="img" aria-hidden="true">
        {volumeIcon}
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleChange}
        aria-label="Volume"
        className="w-16 h-1 accent-accent cursor-pointer"
      />
    </div>
  );
}
