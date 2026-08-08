import { MapData } from './Types';
import { HidingSpot } from './HidingSpot';

export class GameMap {
  public data: MapData;

  constructor(mapData: MapData) {
    this.data = mapData;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 1. Map Background Base
    ctx.fillStyle = this.data.bgColor;
    ctx.fillRect(0, 0, this.data.width, this.data.height);

    // Grid lines for modern polished aesthetic
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < this.data.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.data.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.data.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.data.width, y);
      ctx.stroke();
    }

    // 2. Map Border Wall
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, this.data.width - 12, this.data.height - 12);

    // 3. Draw Obstacles
    for (const obs of this.data.obstacles) {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(obs.x + 6, obs.y + 6, obs.width, obs.height);

      ctx.fillStyle = obs.color || this.getObstacleColor(obs.type);
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

      // Specific icon detail for obstacles
      if (obs.type === 'house' || obs.type === 'building') {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(obs.x + 10, obs.y + 10, obs.width - 20, 15);
      }
    }

    ctx.restore();
  }

  private getObstacleColor(type: string): string {
    switch (type) {
      case 'house': return '#b45309';
      case 'building': return '#475569';
      case 'tree': return '#15803d';
      case 'fence': return '#78350f';
      case 'rock': return '#64748b';
      case 'car': return '#0284c7';
      default: return '#334155';
    }
  }
}

// Map Presets
export const MAP_PRESETS: MapData[] = [
  {
    id: 'taman',
    name: 'Taman Asri',
    description: 'Taman terbuka dengan pohon-pohon rimbun dan semak persembunyian.',
    difficultyLabel: 'Mudah',
    width: 1000,
    height: 650,
    bgColor: '#15803d',
    pathColor: '#fef08a',
    playerSpawn: { x: 100, y: 100 },
    seekerSpawn: { x: 900, y: 550 },
    waypoints: [
      { x: 900, y: 550 },
      { x: 800, y: 150 },
      { x: 450, y: 120 },
      { x: 500, y: 500 },
      { x: 150, y: 500 },
      { x: 150, y: 250 }
    ],
    obstacles: [
      { id: 'o1', x: 250, y: 150, width: 180, height: 40, type: 'rock', color: '#475569' },
      { id: 'o2', x: 600, y: 120, width: 50, height: 220, type: 'fence', color: '#78350f' },
      { id: 'o3', x: 200, y: 380, width: 220, height: 50, type: 'rock', color: '#475569' },
      { id: 'o4', x: 650, y: 420, width: 160, height: 80, type: 'house', color: '#b45309' }
    ],
    hidingSpots: [
      { id: 'h1', x: 120, y: 280, width: 55, height: 55, type: 'bush' },
      { id: 'h2', x: 480, y: 180, width: 55, height: 55, type: 'bush' },
      { id: 'h3', x: 820, y: 240, width: 55, height: 55, type: 'bush' },
      { id: 'h4', x: 140, y: 520, width: 55, height: 55, type: 'tree' },
      { id: 'h5', x: 500, y: 480, width: 55, height: 55, type: 'bush' }
    ]
  },

  {
    id: 'desa',
    name: 'Desa Suka Sukat',
    description: 'Permukiman desa dengan rumah-rumah kecil, lemari, dan gudang kayu.',
    difficultyLabel: 'Sedang',
    width: 1050,
    height: 700,
    bgColor: '#166534',
    pathColor: '#e2e8f0',
    playerSpawn: { x: 90, y: 90 },
    seekerSpawn: { x: 950, y: 600 },
    waypoints: [
      { x: 950, y: 600 },
      { x: 900, y: 200 },
      { x: 550, y: 150 },
      { x: 550, y: 500 },
      { x: 250, y: 550 },
      { x: 150, y: 300 }
    ],
    obstacles: [
      { id: 'o1', x: 200, y: 120, width: 220, height: 120, type: 'house', color: '#9a3412' },
      { id: 'o2', x: 650, y: 100, width: 220, height: 140, type: 'house', color: '#9a3412' },
      { id: 'o3', x: 300, y: 360, width: 320, height: 50, type: 'fence', color: '#78350f' },
      { id: 'o4', x: 120, y: 450, width: 140, height: 180, type: 'building', color: '#334155' },
      { id: 'o5', x: 700, y: 420, width: 180, height: 160, type: 'house', color: '#9a3412' }
    ],
    hidingSpots: [
      { id: 'h1', x: 120, y: 280, width: 45, height: 50, type: 'box' },
      { id: 'h2', x: 450, y: 180, width: 50, height: 50, type: 'bush' },
      { id: 'h3', x: 580, y: 280, width: 40, height: 55, type: 'locker' },
      { id: 'h4', x: 280, y: 480, width: 55, height: 55, type: 'tree' },
      { id: 'h5', x: 630, y: 480, width: 45, height: 50, type: 'box' },
      { id: 'h6', x: 900, y: 300, width: 55, height: 55, type: 'bush' }
    ]
  },

  {
    id: 'kota',
    name: 'Pusat Kota',
    description: 'Gang-gang sempit kota, gedung bertingkat, mobil, dan kotak kargo.',
    difficultyLabel: 'Sulit',
    width: 1100,
    height: 720,
    bgColor: '#1e293b',
    pathColor: '#334155',
    playerSpawn: { x: 100, y: 100 },
    seekerSpawn: { x: 1000, y: 620 },
    waypoints: [
      { x: 1000, y: 620 },
      { x: 850, y: 150 },
      { x: 550, y: 200 },
      { x: 550, y: 550 },
      { x: 200, y: 600 },
      { x: 150, y: 350 },
      { x: 400, y: 350 }
    ],
    obstacles: [
      { id: 'o1', x: 220, y: 100, width: 260, height: 150, type: 'building', color: '#475569' },
      { id: 'o2', x: 620, y: 100, width: 280, height: 160, type: 'building', color: '#334155' },
      { id: 'o3', x: 180, y: 340, width: 140, height: 180, type: 'building', color: '#475569' },
      { id: 'o4', x: 420, y: 320, width: 220, height: 180, type: 'building', color: '#334155' },
      { id: 'o5', x: 740, y: 380, width: 240, height: 180, type: 'building', color: '#475569' }
    ],
    hidingSpots: [
      { id: 'h1', x: 120, y: 280, width: 40, height: 55, type: 'locker' },
      { id: 'h2', x: 500, y: 120, width: 45, height: 50, type: 'box' },
      { id: 'h3', x: 350, y: 420, width: 55, height: 40, type: 'bed' },
      { id: 'h4', x: 660, y: 320, width: 40, height: 55, type: 'locker' },
      { id: 'h5', x: 340, y: 550, width: 45, height: 50, type: 'box' },
      { id: 'h6', x: 700, y: 580, width: 55, height: 55, type: 'bush' },
      { id: 'h7', x: 920, y: 280, width: 45, height: 50, type: 'box' }
    ]
  }
];
