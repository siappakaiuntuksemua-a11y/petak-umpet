import { Vector2D, SeekerState, Difficulty, ObstacleData } from './Types';
import { CollisionSystem } from './CollisionSystem';
import { Player } from './Player';
import { HidingSpot } from './HidingSpot';
import { AudioManager } from './AudioManager';

export class Seeker {
  public x: number;
  public y: number;
  public radius: number = 15;
  public speed: number = 130;
  public state: SeekerState = 'PATROL';

  // Vision cone parameters
  public visionRange: number = 220;
  public fovAngle: number = (75 * Math.PI) / 180; // Radians
  public facingAngle: number = 0;

  // Waypoints & Navigation
  public waypoints: Vector2D[] = [];
  public currentWaypointIdx: number = 0;
  public targetPos: Vector2D;

  // AI & Alert state
  public alertLevel: 0 | 1 | 2 | 3 = 0; // 0: None, 1: !, 2: !!, 3: !!!
  public lastKnownPlayerPos: Vector2D | null = null;
  public suspiciousSpot: HidingSpot | null = null;
  public stateTimer: number = 0;
  public catchRadius: number = 22;

  private animTimer: number = 0;
  private soundAlertCooldown: number = 0;

  constructor(spawn: Vector2D, waypoints: Vector2D[], difficulty: Difficulty) {
    this.x = spawn.x;
    this.y = spawn.y;
    this.waypoints = waypoints.length > 0 ? waypoints : [{ x: spawn.x, y: spawn.y }];
    this.targetPos = { ...this.waypoints[0] };
    this.applyDifficultySettings(difficulty);
  }

  public applyDifficultySettings(difficulty: Difficulty) {
    switch (difficulty) {
      case 'easy':
        this.speed = 110;
        this.visionRange = 180;
        this.fovAngle = (65 * Math.PI) / 180;
        break;
      case 'normal':
        this.speed = 140;
        this.visionRange = 220;
        this.fovAngle = (75 * Math.PI) / 180;
        break;
      case 'hard':
        this.speed = 165;
        this.visionRange = 270;
        this.fovAngle = (90 * Math.PI) / 180;
        break;
    }
  }

  public update(
    dt: number,
    player: Player,
    hidingSpots: HidingSpot[],
    obstacles: ObstacleData[],
    mapBounds: { width: number; height: number },
    audioManager: AudioManager
  ) {
    this.animTimer += dt * 8;
    this.stateTimer += dt;
    this.soundAlertCooldown -= dt;

    // 1. Check Vision Cone vs Player
    const canSeePlayer = this.checkVisionForPlayer(player, obstacles);

    // 2. State Machine Logic
    switch (this.state) {
      case 'IDLE': {
        this.alertLevel = 0;
        if (canSeePlayer) {
          this.switchState('CHASE', player, audioManager);
        } else if (this.stateTimer > 2.0) {
          // Move to next waypoint
          this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
          this.targetPos = { ...this.waypoints[this.currentWaypointIdx] };
          this.switchState('PATROL', player, audioManager);
        }
        break;
      }

      case 'PATROL': {
        this.alertLevel = 0;
        if (canSeePlayer) {
          this.switchState('CHASE', player, audioManager);
        } else {
          // Move towards current waypoint
          const reached = this.moveTowards(this.targetPos, this.speed, dt, obstacles, mapBounds);
          if (reached) {
            this.switchState('IDLE', player, audioManager);
          }
        }
        break;
      }

      case 'INVESTIGATE': {
        this.alertLevel = 2; // !!
        if (canSeePlayer) {
          this.switchState('CHASE', player, audioManager);
        } else if (this.targetPos) {
          const reached = this.moveTowards(this.targetPos, this.speed * 1.1, dt, obstacles, mapBounds);
          if (reached || this.stateTimer > 5.0) {
            // Check if there is a suspicious hiding spot nearby to inspect
            if (this.suspiciousSpot && CollisionSystem.distance(this, this.suspiciousSpot.getCenter()) < 30) {
              this.suspiciousSpot.isInspectedBySeeker = true;
              if (this.suspiciousSpot.isOccupied && player.isHiding) {
                // Caught player inside spot!
                player.unhide(audioManager);
                this.switchState('CHASE', player, audioManager);
                break;
              }
            }
            this.switchState('SEARCH', player, audioManager);
          }
        }
        break;
      }

      case 'SEARCH': {
        this.alertLevel = 1; // !
        if (canSeePlayer) {
          this.switchState('CHASE', player, audioManager);
        } else if (this.stateTimer > 3.5) {
          // Return to patrol
          this.targetPos = { ...this.waypoints[this.currentWaypointIdx] };
          this.switchState('PATROL', player, audioManager);
        } else {
          // Look around / slow search movement
          this.facingAngle += Math.sin(this.animTimer * 0.5) * 0.05;
        }
        break;
      }

      case 'CHASE': {
        this.alertLevel = 3; // !!!
        if (canSeePlayer) {
          this.lastKnownPlayerPos = { x: player.x, y: player.y };
          if (player.currentHidingSpot) {
            this.suspiciousSpot = player.currentHidingSpot;
          }
          this.targetPos = { x: player.x, y: player.y };
          this.moveTowards(this.targetPos, this.speed * 1.25, dt, obstacles, mapBounds);

          // Check if caught player
          if (CollisionSystem.distance(this, player) <= this.catchRadius) {
            player.isCaught = true;
            audioManager.playSpotted();
          }
        } else {
          // Lost direct line of sight! Go to last known position
          this.switchState('INVESTIGATE', player, audioManager);
        }
        break;
      }
    }
  }

  private switchState(newState: SeekerState, player: Player, audioManager: AudioManager) {
    if (this.state === newState) return;

    this.state = newState;
    this.stateTimer = 0;

    if (newState === 'CHASE') {
      this.alertLevel = 3;
      if (this.soundAlertCooldown <= 0) {
        audioManager.playAlert(3);
        audioManager.playSpotted();
        this.soundAlertCooldown = 1.5;
      }
    } else if (newState === 'INVESTIGATE') {
      this.alertLevel = 2;
      if (this.soundAlertCooldown <= 0) {
        audioManager.playAlert(2);
        this.soundAlertCooldown = 1.2;
      }
    } else if (newState === 'SEARCH') {
      this.alertLevel = 1;
      if (this.soundAlertCooldown <= 0) {
        audioManager.playAlert(1);
        this.soundAlertCooldown = 1.0;
      }
    }
  }

  public checkVisionForPlayer(player: Player, obstacles: ObstacleData[]): boolean {
    // If player is hidden, seeker cannot see them unless seeker saw them enter or is checking the spot
    if (player.isHiding) {
      return false;
    }

    const dist = CollisionSystem.distance(this, player);
    if (dist > this.visionRange) return false;

    // Check angle relative to seeker facing angle
    const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
    let diffAngle = angleToPlayer - this.facingAngle;

    // Normalize angle to -PI to +PI
    while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
    while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

    if (Math.abs(diffAngle) > this.fovAngle / 2) {
      return false;
    }

    // Line of sight check against obstacles
    return CollisionSystem.hasLineOfSight(this, player, obstacles);
  }

  private moveTowards(
    target: Vector2D,
    moveSpeed: number,
    dt: number,
    obstacles: ObstacleData[],
    mapBounds: { width: number; height: number }
  ): boolean {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 8) {
      return true; // Reached target
    }

    const dirX = dx / dist;
    const dirY = dy / dist;

    this.facingAngle = Math.atan2(dirY, dirX);

    const stepX = this.x + dirX * moveSpeed * dt;
    const stepY = this.y + dirY * moveSpeed * dt;

    const newPos = CollisionSystem.resolveMovement(
      { x: this.x, y: this.y },
      { x: stepX, y: stepY },
      { width: this.radius * 2, height: this.radius * 2 },
      obstacles,
      mapBounds
    );

    this.x = newPos.x;
    this.y = newPos.y;

    return false;
  }

  public draw(ctx: CanvasRenderingContext2D, obstacles: ObstacleData[]) {
    ctx.save();

    // 1. Draw Vision Cone (Raycast Mask)
    this.drawVisionCone(ctx, obstacles);

    // 2. Seeker Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius - 2, this.radius, this.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Seeker Body (Evil Red/Purple Villian)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Flashy Seeker Headband / Hat
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Angry eyes
    const eyeX1 = this.x + Math.cos(this.facingAngle - 0.35) * (this.radius * 0.55);
    const eyeY1 = this.y + Math.sin(this.facingAngle - 0.35) * (this.radius * 0.55);
    const eyeX2 = this.x + Math.cos(this.facingAngle + 0.35) * (this.radius * 0.55);
    const eyeY2 = this.y + Math.sin(this.facingAngle + 0.35) * (this.radius * 0.55);

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(eyeX1, eyeY1, 3, 0, Math.PI * 2);
    ctx.arc(eyeX2, eyeY2, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Alert Indicator (! / !! / !!!) overhead
    if (this.alertLevel > 0) {
      let alertText = '!';
      let badgeColor = '#eab308'; // Yellow
      if (this.alertLevel === 2) {
        alertText = '!!';
        badgeColor = '#f97316'; // Orange
      } else if (this.alertLevel === 3) {
        alertText = '!!!';
        badgeColor = '#dc2626'; // Red
      }

      ctx.font = 'black 14px sans-serif';
      ctx.textAlign = 'center';

      // Floating bounce
      const bounce = Math.sin(this.animTimer) * 4;

      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.radius - 20 + bounce, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(alertText, this.x, this.y - this.radius - 15 + bounce);
    }

    ctx.restore();
  }

  private drawVisionCone(ctx: CanvasRenderingContext2D, obstacles: ObstacleData[]) {
    ctx.save();

    const startAngle = this.facingAngle - this.fovAngle / 2;
    const endAngle = this.facingAngle + this.fovAngle / 2;
    const raySteps = 30;

    let visionColor = 'rgba(234, 179, 8, 0.2)'; // Yellow patrol
    if (this.alertLevel === 2) visionColor = 'rgba(249, 115, 22, 0.25)'; // Orange search
    if (this.alertLevel === 3) visionColor = 'rgba(239, 68, 68, 0.35)'; // Red chase

    ctx.fillStyle = visionColor;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);

    for (let i = 0; i <= raySteps; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / raySteps);
      const rayEnd: Vector2D = {
        x: this.x + Math.cos(angle) * this.visionRange,
        y: this.y + Math.sin(angle) * this.visionRange
      };

      // Raycast against obstacles
      let closestPoint = rayEnd;
      let minDistance = this.visionRange;

      for (const obs of obstacles) {
        const topLeft: Vector2D = { x: obs.x, y: obs.y };
        const topRight: Vector2D = { x: obs.x + obs.width, y: obs.y };
        const bottomLeft: Vector2D = { x: obs.x, y: obs.y + obs.height };
        const bottomRight: Vector2D = { x: obs.x + obs.width, y: obs.y + obs.height };

        const sides = [
          [topLeft, topRight],
          [topRight, bottomRight],
          [bottomRight, bottomLeft],
          [bottomLeft, topLeft]
        ];

        for (const side of sides) {
          const hit = CollisionSystem.lineSegmentIntersection(
            { x: this.x, y: this.y },
            rayEnd,
            side[0],
            side[1]
          );
          if (hit) {
            const hitDist = CollisionSystem.distance(this, hit);
            if (hitDist < minDistance) {
              minDistance = hitDist;
              closestPoint = hit;
            }
          }
        }
      }

      ctx.lineTo(closestPoint.x, closestPoint.y);
    }

    ctx.closePath();
    ctx.fill();

    // Vision arc boundary outline
    ctx.strokeStyle = visionColor.replace('0.2', '0.5').replace('0.25', '0.6').replace('0.35', '0.8');
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
