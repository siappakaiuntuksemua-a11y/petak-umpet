import React from 'react';
import { Trophy, Skull, RotateCcw, Home, Clock, Award, Eye } from 'lucide-react';
import { Game } from '../game/Game';

interface GameResultModalProps {
  game: Game;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  game,
  onPlayAgain,
  onMainMenu,
}) => {
  const isVictory = game.state === 'victory';
  const score = game.scoreManager.currentScore;
  const timeFormatted = game.scoreManager.formatTime(game.scoreManager.elapsedTime);
  const hidesCount = game.scoreManager.hidesCount;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-slate-100 text-center relative overflow-hidden">
        {/* Glow Header Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 ${
            isVictory ? 'bg-emerald-500 shadow-lg shadow-emerald-500' : 'bg-red-500 shadow-lg shadow-red-500'
          }`}
        />

        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isVictory ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400' : 'bg-red-500/20 border-2 border-red-400 text-red-400'
            }`}
          >
            {isVictory ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
          </div>
        </div>

        <h2 className={`text-3xl font-black mb-1 ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
          {isVictory ? 'KAMU MENANG!' : 'KAMU KETAHUAN!'}
        </h2>
        <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold">
          {isVictory ? 'You successfully survived!' : 'You were found by the seeker!'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 mb-6">
          <div className="flex flex-col items-center">
            <Award className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Skor Akhir</span>
            <span className="text-lg font-black text-amber-300 font-mono">{score}</span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-700">
            <Clock className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Waktu</span>
            <span className="text-lg font-black text-blue-300 font-mono">{timeFormatted}</span>
          </div>

          <div className="flex flex-col items-center">
            <Eye className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Sembunyi</span>
            <span className="text-lg font-black text-emerald-300 font-mono">{hidesCount}x</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-5 h-5" /> MAIN LAGI (PLAY AGAIN)
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" /> MENU UTAMA
          </button>
        </div>
      </div>
    </div>
  );
};
