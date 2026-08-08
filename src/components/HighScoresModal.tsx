import React from 'react';
import { Trophy, X } from 'lucide-react';
import { HighScore } from '../game/Types';

interface HighScoresModalProps {
  scores: HighScore[];
  onClose: () => void;
}

export const HighScoresModal: React.FC<HighScoresModalProps> = ({ scores, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl text-slate-100 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-amber-400 mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" /> Papan Skor Tertinggi
        </h2>

        {scores.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-800/50 rounded-xl border border-slate-700/50">
            Belum ada skor tersimpan. Mainkan game untuk mencetak rekor baru!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-amber-400">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Map</th>
                  <th className="py-3 px-3">Level</th>
                  <th className="py-3 px-3">Skor</th>
                  <th className="py-3 px-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scores.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-400">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="py-2.5 px-3 capitalize font-semibold text-slate-200">{s.mapId}</td>
                    <td className="py-2.5 px-3 capitalize text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        s.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                        s.difficulty === 'normal' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {s.difficulty}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-300">{s.score}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-400">{s.survivedTime}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
        >
          TUTUP
        </button>
      </div>
    </div>
  );
};
