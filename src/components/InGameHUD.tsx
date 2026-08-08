import React from 'react';
import { Pause, Clock, Award, MapPin, Eye, AlertTriangle } from 'lucide-react';
import { Game } from '../game/Game';
import { VirtualJoystick } from './VirtualJoystick';

interface InGameHUDProps {
  game: Game;
  onPause: () => void;
}

export const InGameHUD: React.FC<InGameHUDProps> = ({ game, onPause }) => {
  const timeFormatted = game.scoreManager.formatTime(game.scoreManager.timeRemaining);
  const score = game.scoreManager.currentScore;
  const isHiding = game.player.isHiding;
  const canHide = game.nearestHidingSpot !== null;
  const alertLevel = game.seeker.alertLevel;
  const isSeekerNear = game.isSeekerNear;

  return (
    <>
      {/* Top Floating HUD Bar */}
      <div className="fixed top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        {/* Left Stats: Timer & Score */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Timer Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xl">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Waktu</span>
              <span className="text-base font-black font-mono text-amber-300 leading-none">{timeFormatted}</span>
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xl">
            <Award className="w-4 h-4 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Skor</span>
              <span className="text-base font-black font-mono text-blue-300 leading-none">{score}</span>
            </div>
          </div>
        </div>

        {/* Center Banner: Map & Danger Indicator */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">{game.currentMapData.name}</span>
          </div>

          {/* Seeker Proximity Warning */}
          {isSeekerNear && (
            <div className="mt-1.5 bg-red-600/90 border border-red-400 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-bounce flex items-center gap-1 shadow-lg shadow-red-600/30">
              <AlertTriangle className="w-3 h-3" /> PENCARI DEKAT!
            </div>
          )}
        </div>

        {/* Right Controls: Pause Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          {isHiding && (
            <div className="bg-emerald-600/90 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xl animate-pulse">
              <Eye className="w-4 h-4" /> HIDDEN
            </div>
          )}

          <button
            onClick={onPause}
            className="p-2.5 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Alert Level Overhead Notification */}
      {alertLevel > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-xl flex items-center gap-1.5 animate-pulse ${
              alertLevel === 3
                ? 'bg-red-600 border-red-400 text-white shadow-red-600/40'
                : alertLevel === 2
                ? 'bg-orange-500 border-orange-300 text-white shadow-orange-500/40'
                : 'bg-yellow-500 border-yellow-300 text-slate-950 shadow-yellow-500/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {alertLevel === 3 ? 'NPC MENGEJARMU (CHASE!)' : alertLevel === 2 ? 'NPC MEMERIKSA AREA!' : 'NPC MENCARI!'}
          </div>
        </div>
      )}

      {/* Desktop Key Helper Legend */}
      <div className="fixed bottom-3 left-3 hidden md:flex items-center gap-3 bg-slate-900/80 border border-slate-800 text-slate-400 text-[11px] px-3 py-1.5 rounded-xl backdrop-blur-md pointer-events-none">
        <span><strong className="text-slate-200">WASD / Panah</strong> : Jalan</span>
        <span>•</span>
        <span><strong className="text-amber-400">E</strong> : Sembunyi / Keluar</span>
        <span>•</span>
        <span><strong className="text-slate-200">ESC</strong> : Pause</span>
      </div>

      {/* Virtual Joystick for Mobile Touch */}
      <VirtualJoystick
        onMove={(x, y, active) => game.inputManager.setJoystickVector(x, y, active)}
        onHidePress={() => game.inputManager.triggerHideAction()}
        isHiding={isHiding}
        canHide={canHide}
      />
    </>
  );
};
