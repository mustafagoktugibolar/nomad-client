import React, { useMemo } from "react";
import { Slider } from "../ui/slider.js";

interface SingleValueSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const SingleValueSlider: React.FC<SingleValueSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}) => {
  const percentage = useMemo(() => {
    const clamped = Math.min(Math.max(value, min), max);
    return ((clamped - min) / (max - min)) * 100;
  }, [value, min, max]);

  return (
    <div className="w-full relative mt-12">
      <div
        className="absolute -top-10 z-10 transform -translate-x-1/2"
        style={{ left: `${percentage}%` }}
      >
        <div className="bg-black text-white text-xs px-2 py-1 rounded-md relative">
          ${value}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-black" />
        </div>
      </div>

      {/* Slider */}
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
      />

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
};

export default SingleValueSlider;
