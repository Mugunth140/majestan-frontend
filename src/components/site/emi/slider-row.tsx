"use client";

export function SliderRow({
  label,
  display,
  minLabel,
  maxLabel,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  display: string;
  minLabel: string;
  maxLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const fillPct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div>
      <div className="flex! items-baseline! justify-between! gap-4!">
        <label className="text-base! font-semibold! text-gray-700!">{label}</label>
        <span className="rounded-md! bg-gray-100! px-2! py-0.5! text-sm! font-semibold! text-gray-800! tabular-nums!">
          {display}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${fillPct}%` } as React.CSSProperties}
        className="emi-range mt-3! w-full! cursor-pointer!"
      />
      <div aria-hidden="true" className="mt-1.5! flex! justify-between! text-[13px]! text-gray-400! tabular-nums!">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
