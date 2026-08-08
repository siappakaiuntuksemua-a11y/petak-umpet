import React from 'react';
import { Shield, Eye, MapPin, Award, X } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-amber-400 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-400" /> Cara Bermain (How to Play)
        </h2>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" /> Misi Utama
            </h3>
            <p>
              Bersembunyilah dari NPC Pencari (Seeker) sampai waktu timer habis! Jika kamu berhasil bertahan sampai waktu 00:00, kamu Menang.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <h3 className="font-bold text-slate-100 mb-2">🎮 Kontrol Pergerakan</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong className="text-amber-300">Keyboard PC:</strong> Gunakan tombol <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">WASD</code> atau <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">Tombol Panah</code>.</li>
              <li><strong className="text-amber-300">Bersembunyi:</strong> Tekan tombol <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">E</code> atau <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">H</code> saat dekat tempat persembunyian.</li>
              <li><strong className="text-amber-300">Mobile HP:</strong> Gunakan Virtual Joystick di kiri bawah dan tombol <strong className="text-emerald-400">HIDE</strong> di kanan bawah.</li>
              <li><strong className="text-amber-300">Pause:</strong> Tekan <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">ESC</code>.</li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Tempat Persembunyian
            </h3>
            <p>
              Kamu bisa bersembunyi di <strong>Semak-semak, Lemari, Rumah, Kotak, Pohon, dan Kasur</strong>. Tempat yang siap digunakan akan menyala kebiruan saat kamu mendekatinya.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <h3 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" /> Indikator Bahaya NPC
            </h3>
            <p className="mb-1">NPC memiliki cone penglihatan dan tanda peringatan:</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold mt-2">
              <div className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 p-2 rounded-lg">
                ! (Search)
              </div>
              <div className="bg-orange-500/20 text-orange-300 border border-orange-500/40 p-2 rounded-lg">
                !! (Investigate)
              </div>
              <div className="bg-red-500/20 text-red-300 border border-red-500/40 p-2 rounded-lg">
                !!! (CHASE)
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          MENGERTI, SIAP BERMAIN!
        </button>
      </div>
    </div>
  );
};
