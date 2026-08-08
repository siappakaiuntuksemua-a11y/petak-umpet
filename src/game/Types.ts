export type Difficulty = 'easy' | 'normal' | 'hard';

export type GameState = 'menu' | 'playing' | 'paused' | 'victory' | 'defeated';

export type SeekerState = 'IDLE' | 'PATROL' | 'SEARCH' | 'CHASE' | 'INVESTIGATE';

export type HidingType = 'bush' | 'locker' | 'house' | 'box' | 'tree' | 'bed';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface ObstacleData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'house' | 'tree' | 'fence' | 'rock' | 'building' | 'car';
  color?: string;
}

export interface HidingSpotData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: HidingType;
  label?: string;
}

export interface MapData {
  id: string;
  name: string;
  description: string;
  difficultyLabel: string;
  width: number;
  height: number;
  bgColor: string;
  pathColor: string;
  playerSpawn: Vector2D;
  seekerSpawn: Vector2D;
  waypoints: Vector2D[];
  obstacles: ObstacleData[];
  hidingSpots: HidingSpotData[];
}

export interface HighScore {
  mapId: string;
  difficulty: Difficulty;
  score: number;
  survivedTime: number;
  date: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}
