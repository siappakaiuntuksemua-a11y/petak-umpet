import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { Game } from '../game/Game';

interface PauseMenuProps {
  game: Game;
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  game,
  onResume,
  onRestart,
  onMainMenu,
}) => {
  const [soundOn, setSoundOn] = React.useState(game.audioManager.isSoundOn());
  const [musicOn, setMusicOn] = React.useState(game.audioManager.isMusicOn());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    game.audioManager.setSoundEnabled(next);
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    game.audioManager.setMusicEnabled(next);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-slate-100 text-center">
        <h2 className="text-2xl font-black text-amber-400 mb-6">GAME DIPAUS (PAUSED)</h2>

        <div className="space-y-3 mb-6">
          <button
            onClick={onResume}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Play className="w-5 h-5 fill-current" /> LANJUTKAN (RESUME)
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> ULANGI (RESTART)
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" /> MENU UTAMA
          </button>
        </div>

        {/* Audio Toggles */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-around">
          <button
            onClick={toggleSound}
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
              soundOn ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            SFX: {soundOn ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={toggleMusic}
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
              musicOn ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <Music className={`w-4 h-4 ${musicOn ? 'text-amber-400' : 'text-slate-500'}`} />
            BGM: {musicOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};
