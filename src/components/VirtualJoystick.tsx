import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number, active: boolean) => void;
  onHidePress: () => void;
  isHiding: boolean;
  canHide: boolean;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onHidePress,
  isHiding,
  canHide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touching, setTouching] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setTouching(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setTouching(false);
        setKnobPos({ x: 0, y: 0 });
        onMove(0, 0, false);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });
    onMove(dx / maxRadius, dy / maxRadius, true);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-between items-end pointer-events-none z-30 select-none">
      {/* Joystick Base */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-400/40 backdrop-blur-md relative flex items-center justify-center pointer-events-auto touch-none shadow-2xl"
      >
        <div
          className="w-12 h-12 rounded-full bg-blue-500/80 border-2 border-blue-200 shadow-lg absolute transition-transform duration-75"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Action Hide / Unhide Button */}
      <button
        onClick={onHidePress}
        onTouchStart={(e) => {
          e.stopPropagation();
          onHidePress();
        }}
        disabled={!canHide && !isHiding}
        className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold shadow-2xl border-2 pointer-events-auto transition-all active:scale-95 touch-none ${
          isHiding
            ? 'bg-emerald-600 border-emerald-300 text-white animate-pulse'
            : canHide
            ? 'bg-amber-500 border-amber-200 text-slate-900 font-extrabold shadow-amber-500/30'
            : 'bg-slate-800/60 border-slate-600 text-slate-500 opacity-60'
        }`}
      >
        <span className="text-xl">{isHiding ? 'EXIT' : 'HIDE'}</span>
        <span className="text-[10px] tracking-wider uppercase">
          {isHiding ? 'KELUAR' : 'SEMBUNYI'}
        </span>
      </button>
    </div>
  );
};
