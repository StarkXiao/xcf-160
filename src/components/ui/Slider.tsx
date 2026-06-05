import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  gradient?: string;
  showValue?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit = '',
  gradient,
  showValue = true,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      onChange(Math.max(min, Math.min(max, steppedValue)));
    },
    [isDragging, min, max, step, onChange]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      onChange(Math.max(min, Math.min(max, steppedValue)));
    },
    [min, max, step, onChange]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDragging) return;
      if (e.key === 'ArrowLeft') {
        onChange(Math.max(min, value - step));
      } else if (e.key === 'ArrowRight') {
        onChange(Math.min(max, value + step));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDragging, value, step, min, max, onChange]);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-white/70">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-gold">
              {value.toFixed(step < 1 ? 1 : 0)}
              {unit}
            </span>
          )}
        </div>
      )}
      <div
        ref={trackRef}
        className="relative h-1.5 bg-gallery-border rounded-full cursor-pointer"
        onClick={handleTrackClick}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-75"
          style={{
            width: `${percentage}%`,
            background: gradient || 'linear-gradient(to right, #d4af37, #e6c866)',
          }}
        />
        <motion.div
          className="slider-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${percentage}%` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          tabIndex={0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  );
};
