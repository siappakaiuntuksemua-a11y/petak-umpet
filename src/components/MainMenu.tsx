import React from 'react';
import { Play, HelpCircle, Trophy, Volume2, VolumeX, Music, Shield, MapPin, Gauge } from 'lucide-react';
import { Difficulty, MapData } from '../game/Types';
import { MAP_PRESETS } from '../game/GameMap';
import { Game } from '../game/Game';

interface MainMenuProps {
  game: Game;
  selectedMap: MapData;
  selectedDifficulty: Difficulty;
  onSelectMap: (map: MapData) => void;
  onSelectDifficulty: (diff: Difficulty) => void;
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onOpenHighScores: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  game,
  selectedMap,
  selectedDifficulty,
  onSelectMap,
  onSelectDifficulty,
  onStartGame,
  onOpenHowToPlay,
  onOpenHighScores,
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
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-between p-4 md:p-8 overflow-y-auto z-40 text-slate-100">
      {/* Header / Hero Title */}
      <div className="text-center mt-4 md:mt-8 max-w-xl">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-amber-400 font-bold text-xs uppercase tracking-widest mb-3 shadow-lg shadow-amber-500/10">
          <Shield className="w-4 h-4 text-amber-400" /> 2D Hide & Seek Game
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
          PETAK <span className="text-amber-400">UMPET</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2">
          Bersembunyi dari NPC Pencari, kecoh pandangannya, dan bertahan hingga timer habis!
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6 my-auto">
        {/* Map Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
            <MapPin className="w-4 h-4 text-emerald-400" /> Pilih Lokasi Map
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MAP_PRESETS.map((m) => {
              const isSelected = m.id === selectedMap.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMap(m)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block mb-0.5">
                      {m.difficultyLabel}
                    </span>
                    <h3 className="font-bold text-slate-100 text-sm">{m.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{m.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{m.hidingSpots.length} Tempat Sembunyi</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
            <Gauge className="w-4 h-4 text-blue-400" /> Tingkat Kesulitan & Waktu
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => {
              const isSelected = d === selectedDifficulty;
              const timeLabel = d === 'easy' ? '3 Menit' : d === 'normal' ? '2 Menit' : '1 Menit';
              const nameLabel = d === 'easy' ? 'Mudah' : d === 'normal' ? 'Sedang' : 'Sulit';

              return (
                <button
                  key={d}
                  onClick={() => onSelectDifficulty(d)}
                  className={`py-3 px-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/30 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-extrabold uppercase block">{nameLabel}</span>
                  <span className="text-[11px] font-mono text-slate-300 block mt-0.5">{timeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={onStartGame}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/25 active:scale-98"
        >
          <Play className="w-6 h-6 fill-current" /> MULAI PERMAINAN (PLAY)
        </button>

        {/* Secondary Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onOpenHowToPlay}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700/60 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" /> CARA BERMAIN
          </button>

          <button
            onClick={onOpenHighScores}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700/60 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" /> REKOR SKOR
          </button>
        </div>
      </div>

      {/* Footer Settings & Audio Toggles */}
      <div className="flex items-center justify-between w-full max-w-2xl text-xs text-slate-500 pt-4">
        <span>© 2026 Hide and Seek 2D Game</span>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{soundOn ? 'SFX ON' : 'SFX OFF'}</span>
          </button>

          <button
            onClick={toggleMusic}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
          >
            <Music className={`w-4 h-4 ${musicOn ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>{musicOn ? 'BGM ON' : 'BGM OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
