/**
 * @file volume-slider.tsx
 * @description Audio volume control slider.
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

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-pixel text-[7px] text-shell-dark">VOL</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleChange}
        aria-label="Volume"
        className="w-20 h-1 accent-shell-dark"
      />
    </div>
  );
}