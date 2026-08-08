import { Vector2D, Particle, ObstacleData } from './Types';
import { CollisionSystem } from './CollisionSystem';
import { HidingSpot } from './HidingSpot';
import { AudioManager } from './AudioManager';

export class Player {
  public x: number;
  public y: number;
  public radius: number = 14;
  public speed: number = 175; // Pixels per second
  public isHiding: boolean = false;
  public currentHidingSpot: HidingSpot | null = null;
  public isCaught: boolean = false;

  public facingAngle: number = 0; // In radians
  private animFrame: number = 0;
  private footstepTimer: number = 0;
  private particles: Particle[] = [];

  constructor(spawn: Vector2D) {
    this.x = spawn.x;
    this.y = spawn.y;
  }

  public update(
    dt: number,
    moveDir: { x: number; y: number },
    obstacles: ObstacleData[],
    mapBounds: { width: number; height: number },
    audioManager: AudioManager
  ) {
    // Update dust particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    if (this.isHiding) {
      if (this.currentHidingSpot) {
        const center = this.currentHidingSpot.getCenter();
        this.x = center.x;
        this.y = center.y;
      }
      return;
    }

    if (moveDir.x !== 0 || moveDir.y !== 0) {
      this.facingAngle = Math.atan2(moveDir.y, moveDir.x);
      this.animFrame += dt * 10;

      const targetX = this.x + moveDir.x * this.speed * dt;
      const targetY = this.y + moveDir.y * this.speed * dt;

      const newPos = CollisionSystem.resolveMovement(
        { x: this.x, y: this.y },
        { x: targetX, y: targetY },
        { width: this.radius * 2, height: this.radius * 2 },
        obstacles,
        mapBounds
      );

      // Check if actual movement occurred
      const movedDist = CollisionSystem.distance({ x: this.x, y: this.y }, newPos);
      this.x = newPos.x;
      this.y = newPos.y;

      // Play footstep sounds and spawn dust particles
      if (movedDist > 0.5) {
        this.footstepTimer += dt;
        if (this.footstepTimer > 0.28) {
          this.footstepTimer = 0;
          audioManager.playFootstep();

          // Spawn dust particle
          this.particles.push({
            x: this.x - Math.cos(this.facingAngle) * 10,
            y: this.y - Math.sin(this.facingAngle) * 10,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            radius: 3 + Math.random() * 3,
            color: '#cbd5e1',
            alpha: 0.6,
            life: 0,
            maxLife: 0.4
          });
        }
      }
    }
  }

  public hide(spot: HidingSpot, audioManager: AudioManager) {
    this.isHiding = true;
    this.currentHidingSpot = spot;
    spot.isOccupied = true;
    audioManager.playHide();
  }

  public unhide(audioManager: AudioManager) {
    if (this.currentHidingSpot) {
      this.currentHidingSpot.isOccupied = false;
      this.currentHidingSpot = null;
    }
    this.isHiding = false;
    audioManager.playUnhide();
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Draw dust particles first
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();

    if (this.isHiding) {
      // Translucent rendering when hidden inside bush / spot
      ctx.globalAlpha = 0.45;
    }

    // Shadow under player
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius - 2, this.radius, this.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Hero Cartoon Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Head / Cap indicator
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Eyes / Facing directional indicator
    const eyeX1 = this.x + Math.cos(this.facingAngle - 0.35) * (this.radius * 0.5);
    const eyeY1 = this.y + Math.sin(this.facingAngle - 0.35) * (this.radius * 0.5);
    const eyeX2 = this.x + Math.cos(this.facingAngle + 0.35) * (this.radius * 0.5);
    const eyeY2 = this.y + Math.sin(this.facingAngle + 0.35) * (this.radius * 0.5);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, 2.5, 0, Math.PI * 2);
    ctx.arc(eyeX2, eyeY2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // If hiding, render "HIDDEN" floating badge over head
    if (this.isHiding) {
      ctx.globalAlpha = 1.0;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';

      ctx.fillStyle = 'rgba(22, 163, 74, 0.9)';
      ctx.beginPath();
      ctx.roundRect(this.x - 28, this.y - this.radius - 26, 56, 18, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText('HIDDEN', this.x, this.y - this.radius - 13);
    }

    ctx.restore();
  }
}
