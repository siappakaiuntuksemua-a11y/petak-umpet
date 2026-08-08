import { Difficulty, GameState, MapData } from './Types';
import { Player } from './Player';
import { Seeker } from './Seeker';
import { HidingSpot } from './HidingSpot';
import { GameMap, MAP_PRESETS } from './GameMap';
import { InputManager } from './InputManager';
import { AudioManager } from './AudioManager';
import { ScoreManager } from './ScoreManager';
import { CollisionSystem } from './CollisionSystem';

export class Game {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public state: GameState = 'menu';
  public currentMapData: MapData = MAP_PRESETS[0];
  public difficulty: Difficulty = 'normal';

  public player!: Player;
  public seeker!: Seeker;
  public gameMap!: GameMap;
  public hidingSpots: HidingSpot[] = [];

  public inputManager: InputManager;
  public audioManager: AudioManager;
  public scoreManager: ScoreManager;

  public nearestHidingSpot: HidingSpot | null = null;
  public isSeekerNear: boolean = false;

  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private camera: { x: number; y: number } = { x: 0, y: 0 };

  // Callbacks for React UI updates
  public onStateChange?: (state: GameState) => void;
  public onHUDUpdate?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get Canvas 2D context');
    this.ctx = ctx;

    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.scoreManager = new ScoreManager();

    this.initMap(MAP_PRESETS[0], 'normal');
  }

  public initMap(mapData: MapData, difficulty: Difficulty) {
    this.currentMapData = mapData;
    this.difficulty = difficulty;
    this.gameMap = new GameMap(mapData);

    this.player = new Player(mapData.playerSpawn);
    this.seeker = new Seeker(mapData.seekerSpawn, mapData.waypoints, difficulty);

    this.hidingSpots = mapData.hidingSpots.map(data => new HidingSpot(data));
    this.scoreManager.init(difficulty);

    this.nearestHidingSpot = null;
    this.isSeekerNear = false;
  }

  public start() {
    this.initMap(this.currentMapData, this.difficulty);
    this.state = 'playing';
    this.audioManager.startBGM();

    if (this.onStateChange) this.onStateChange(this.state);

    this.lastTime = performance.now();
    if (!this.animFrameId) {
      this.loop(this.lastTime);
    }
  }

  public pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  public resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.lastTime = performance.now();
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  public restart() {
    this.start();
  }

  public returnToMenu() {
    this.state = 'menu';
    this.audioManager.stopBGM();
    if (this.onStateChange) this.onStateChange(this.state);
  }

  private loop = (currentTime: number) => {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap delta time
    this.lastTime = currentTime;

    if (this.state === 'playing') {
      this.update(dt);
    }

    this.render();

    if (this.onHUDUpdate && this.state === 'playing') {
      this.onHUDUpdate();
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // Check Pause Key (Esc / P)
    if (this.inputManager.consumePausePressed()) {
      this.pause();
      return;
    }

    // 1. Move Player
    const moveDir = this.inputManager.getMovementVector();
    this.player.update(
      dt,
      moveDir,
      this.currentMapData.obstacles,
      { width: this.currentMapData.width, height: this.currentMapData.height },
      this.audioManager
    );

    // 2. Nearest Hiding Spot Detection
    let closestSpot: HidingSpot | null = null;
    let minSpotDist = Infinity;

    for (const spot of this.hidingSpots) {
      spot.update(dt);
      if (spot.isPlayerNear({ x: this.player.x, y: this.player.y })) {
        const dist = CollisionSystem.distance(this.player, spot.getCenter());
        if (dist < minSpotDist) {
          minSpotDist = dist;
          closestSpot = spot;
        }
      }
    }
    this.nearestHidingSpot = closestSpot;

    // 3. Handle Hide / Unhide Action (Keyboard 'E' or Touch 'HIDE')
    if (this.inputManager.consumeHidePressed()) {
      if (this.player.isHiding) {
        this.player.unhide(this.audioManager);
      } else if (this.nearestHidingSpot && !this.nearestHidingSpot.isOccupied) {
        this.player.hide(this.nearestHidingSpot, this.audioManager);
        this.scoreManager.recordHideSpot(this.nearestHidingSpot.id);
      }
    }

    // 4. Update Seeker AI
    this.seeker.update(
      dt,
      this.player,
      this.hidingSpots,
      this.currentMapData.obstacles,
      { width: this.currentMapData.width, height: this.currentMapData.height },
      this.audioManager
    );

    // Check seeker proximity to player for visual HUD alert
    const seekerDist = CollisionSystem.distance(this.player, this.seeker);
    this.isSeekerNear = seekerDist < 160;

    // 5. Update Timer & Score
    const isChased = this.seeker.state === 'CHASE';
    const timerExpired = this.scoreManager.update(dt, this.player.isHiding, isChased);

    // 6. Check Win/Loss Conditions
    if (this.player.isCaught) {
      this.state = 'defeated';
      this.audioManager.playDefeat();
      this.scoreManager.saveHighScore(this.currentMapData.id, this.difficulty);
      if (this.onStateChange) this.onStateChange(this.state);
    } else if (timerExpired) {
      this.state = 'victory';
      this.audioManager.playVictory();
      this.scoreManager.calculateVictoryBonus();
      this.scoreManager.saveHighScore(this.currentMapData.id, this.difficulty);
      if (this.onStateChange) this.onStateChange(this.state);
    }

    // 7. Update Camera Centered on Player
    this.updateCamera();
  }

  private updateCamera() {
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;

    // Center camera on player with smooth boundaries
    if (this.currentMapData.width <= canvasW) {
      this.camera.x = -(canvasW - this.currentMapData.width) / 2;
    } else {
      this.camera.x = Math.max(0, Math.min(this.currentMapData.width - canvasW, this.player.x - canvasW / 2));
    }

    if (this.currentMapData.height <= canvasH) {
      this.camera.y = -(canvasH - this.currentMapData.height) / 2;
    } else {
      this.camera.y = Math.max(0, Math.min(this.currentMapData.height - canvasH, this.player.y - canvasH / 2));
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'menu') return;

    this.ctx.save();
    // Apply Camera Translation
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Render Map
    this.gameMap.draw(this.ctx);

    // 2. Render Hiding Spots
    for (const spot of this.hidingSpots) {
      const isNear = spot === this.nearestHidingSpot;
      spot.draw(this.ctx, isNear);
    }

    // 3. Render Player (if not hiding or translucent if hiding)
    this.player.draw(this.ctx);

    // 4. Render Seeker NPC & Vision Cone
    this.seeker.draw(this.ctx, this.currentMapData.obstacles);

    this.ctx.restore();

    // 5. Render Canvas Overlays (Screen-space: Minimap & Seeker Radar Indicator)
    if (this.state === 'playing') {
      this.drawSeekerIndicator();
      this.drawMinimap();
    }
  }

  private drawSeekerIndicator() {
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;

    // Convert seeker world pos to screen pos
    const seekerScreenX = this.seeker.x - this.camera.x;
    const seekerScreenY = this.seeker.y - this.camera.y;

    const margin = 45;
    const isOffscreen =
      seekerScreenX < margin ||
      seekerScreenX > canvasW - margin ||
      seekerScreenY < margin ||
      seekerScreenY > canvasH - margin;

    // Draw directional radar arrow if offscreen or if seeker is chasing
    if (isOffscreen || this.seeker.alertLevel > 0) {
      const centerX = canvasW / 2;
      const centerY = canvasH / 2;

      const angle = Math.atan2(seekerScreenY - centerY, seekerScreenX - centerX);

      // Clamp position along screen edge
      const edgeX = Math.max(margin, Math.min(canvasW - margin, centerX + Math.cos(angle) * (canvasW / 2 - margin)));
      const edgeY = Math.max(margin, Math.min(canvasH - margin, centerY + Math.sin(angle) * (canvasH / 2 - margin)));

      this.ctx.save();
      this.ctx.translate(edgeX, edgeY);
      this.ctx.rotate(angle);

      // Arrow color based on alert level
      let color = '#facc15'; // Yellow
      if (this.seeker.alertLevel === 2) color = '#f97316'; // Orange
      if (this.seeker.alertLevel === 3) color = '#ef4444'; // Red

      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 10;

      // Draw pointer triangle
      this.ctx.beginPath();
      this.ctx.moveTo(12, 0);
      this.ctx.lineTo(-8, -8);
      this.ctx.lineTo(-4, 0);
      this.ctx.lineTo(-8, 8);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  private drawMinimap() {
    const isMobile = this.canvas.width < 640;
    const miniW = isMobile ? 85 : 120;
    const miniH = isMobile ? 60 : 80;
    const margin = isMobile ? 10 : 16;
    const miniX = this.canvas.width - miniW - margin;
    const miniY = isMobile ? 55 : 16;

    const scaleX = miniW / this.currentMapData.width;
    const scaleY = miniH / this.currentMapData.height;

    this.ctx.save();

    // Minimap Container Box
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(miniX, miniY, miniW, miniH, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Minimap Title Label
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = 'bold 8px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('RADAR MAP', miniX + 6, miniY + 10);

    // Draw Obstacles in Minimap
    this.ctx.fillStyle = '#334155';
    for (const obs of this.currentMapData.obstacles) {
      this.ctx.fillRect(
        miniX + obs.x * scaleX,
        miniY + obs.y * scaleY,
        Math.max(2, obs.width * scaleX),
        Math.max(2, obs.height * scaleY)
      );
    }

    // Draw Hiding Spots in Minimap
    this.ctx.fillStyle = '#22c55e';
    for (const spot of this.hidingSpots) {
      const sx = miniX + (spot.x + spot.width / 2) * scaleX;
      const sy = miniY + (spot.y + spot.height / 2) * scaleY;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw Seeker in Minimap
    const seekerMx = miniX + this.seeker.x * scaleX;
    const seekerMy = miniY + this.seeker.y * scaleY;
    this.ctx.fillStyle = this.seeker.alertLevel === 3 ? '#ef4444' : '#f59e0b';
    this.ctx.beginPath();
    this.ctx.arc(seekerMx, seekerMy, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw Player in Minimap
    const playerMx = miniX + this.player.x * scaleX;
    const playerMy = miniY + this.player.y * scaleY;
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.beginPath();
    this.ctx.arc(playerMx, playerMy, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw Viewport Box
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      miniX + this.camera.x * scaleX,
      miniY + this.camera.y * scaleY,
      this.canvas.width * scaleX,
      this.canvas.height * scaleY
    );

    this.ctx.restore();
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.audioManager.stopBGM();
  }
}
