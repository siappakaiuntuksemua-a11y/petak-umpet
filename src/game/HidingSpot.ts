import { HidingSpotData, HidingType, Vector2D } from './Types';
import { CollisionSystem } from './CollisionSystem';

export class HidingSpot {
  public id: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: HidingType;
  public label: string;
  public isOccupied: boolean = false;
  public isInspectedBySeeker: boolean = false;
  private animTimer: number = 0;

  constructor(data: HidingSpotData) {
    this.id = data.id;
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.type = data.type;
    this.label = data.label || this.getDefaultLabel(data.type);
  }

  private getDefaultLabel(type: HidingType): string {
    switch (type) {
      case 'bush': return 'Semak-semak';
      case 'locker': return 'Lemari';
      case 'house': return 'Rumah';
      case 'box': return 'Kotak';
      case 'tree': return 'Pohon';
      case 'bed': return 'Kasur';
    }
  }

  public isPlayerNear(playerPos: Vector2D, interactionDistance: number = 40): boolean {
    const center = this.getCenter();
    return CollisionSystem.distance(playerPos, center) <= interactionDistance + Math.max(this.width, this.height) / 2;
  }

  public getCenter(): Vector2D {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  public update(dt: number) {
    this.animTimer += dt * 3;
  }

  public draw(ctx: CanvasRenderingContext2D, isPlayerNear: boolean) {
    ctx.save();

    // Glow effect if player is near
    if (isPlayerNear && !this.isOccupied) {
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 12 + Math.sin(this.animTimer) * 4;
    }

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    switch (this.type) {
      case 'bush': {
        // Bush visual - fluffy green circles
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(cx - this.width * 0.2, cy - this.height * 0.1, this.width * 0.35, 0, Math.PI * 2);
        ctx.arc(cx + this.width * 0.2, cy + this.height * 0.1, this.width * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Bush outline detail
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }
      case 'locker': {
        // Locker - dark metallic rectangle
        ctx.fillStyle = '#475569';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Locker slats
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y + 10);
        ctx.lineTo(this.x + this.width - 8, this.y + 10);
        ctx.moveTo(this.x + 8, this.y + 16);
        ctx.lineTo(this.x + this.width - 8, this.y + 16);
        ctx.stroke();
        break;
      }
      case 'house': {
        // House roof / entry doorway
        ctx.fillStyle = '#b45309';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);

        // Door visual
        ctx.fillStyle = '#451a03';
        ctx.fillRect(cx - 8, cy - 2, 16, this.height / 2);
        break;
      }
      case 'box': {
        // Cardboard box
        ctx.fillStyle = '#d97706';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Tape on top
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(this.x + this.width * 0.3, this.y, this.width * 0.4, this.height);
        break;
      }
      case 'tree': {
        // Tree trunk & canopy
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(cx, cy, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 6, this.width * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'bed': {
        // Bed with pillow and blanket
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Blanket
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(this.x, this.y + this.height * 0.3, this.width, this.height * 0.7);
        // Pillow
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, 10);
        break;
      }
    }

    // Label if player is near
    if (isPlayerNear && !this.isOccupied) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';

      // Tooltip banner background
      const text = `[E] Sembunyi di ${this.label}`;
      const textWidth = ctx.measureText(text).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(cx - textWidth / 2 - 8, this.y - 28, textWidth + 16, 22, 6);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.fillText(text, cx, this.y - 13);
    }

    ctx.restore();
  }
}
