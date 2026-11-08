"use client";

import { useMemo } from "react";
import { clock, useClock } from "@/lib/store";
import { dayGradientCss, formatHour, phaseName } from "@/lib/sky";

const PRESETS = [
  { label: "Dawn", h: 6 },
  { label: "Noon", h: 12.5 },
  { label: "Golden", h: 17.75 },
  { label: "Night", h: 22.5 },
];

export default function TimeHud() {
  const { hour, dragging } = useClock();
  const track = useMemo(dayGradientCss, []);
  const isDay = hour >= 5.5 && hour <= 19.5;

  return (
    <div className={`time-hud glass ${dragging ? "is-dragging" : ""}`}>
      <div className="time-hud__readout">
        <span className="time-hud__icon" aria-hidden>{isDay ? "☀" : "☾"}</span>
        <span className="time-hud__time">{formatHour(hour)}</span>
        <span className="time-hud__phase">{phaseName(hour)}</span>
      </div>
      <input
        className="time-hud__slider"
        type="range"
        min={0}
        max={23.99}
        step={0.05}
        value={hour}
        aria-label="Time of day"
        aria-valuetext={`${formatHour(hour)}, ${phaseName(hour)}`}
        style={{ ["--track" as string]: track }}
        onChange={(e) => clock.set({ hour: Number(e.target.value), dragging: false })}
      />
      <div className="time-hud__presets">
        {PRESETS.map((p) => (
          <button key={p.label} onClick={() => clock.set({ hour: p.h, dragging: false })}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
