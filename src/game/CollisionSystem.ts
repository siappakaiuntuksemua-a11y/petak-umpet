import { Rect, Vector2D, Circle, ObstacleData } from './Types';

export class CollisionSystem {
  public static rectRectCollision(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  public static circleRectCollision(circle: Circle, rect: Rect): boolean {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;

    return distanceX * distanceX + distanceY * distanceY < circle.radius * circle.radius;
  }

  public static pointInRect(p: Vector2D, rect: Rect): boolean {
    return (
      p.x >= rect.x &&
      p.x <= rect.x + rect.width &&
      p.y >= rect.y &&
      p.y <= rect.y + rect.height
    );
  }

  public static distance(p1: Vector2D, p2: Vector2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static distanceSq(p1: Vector2D, p2: Vector2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
  }

  /**
   * Line Segment Intersection check between (p1->p2) and (p3->p4)
   */
  public static lineSegmentIntersection(
    p1: Vector2D,
    p2: Vector2D,
    p3: Vector2D,
    p4: Vector2D
  ): Vector2D | null {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return null; // Parallel

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1)
      };
    }
    return null;
  }

  /**
   * Check if line segment (from -> to) intersects with a box obstacle
   */
  public static lineIntersectsRect(from: Vector2D, to: Vector2D, rect: Rect): boolean {
    // If either point is inside rect
    if (this.pointInRect(from, rect) || this.pointInRect(to, rect)) {
      return true;
    }

    const topLeft: Vector2D = { x: rect.x, y: rect.y };
    const topRight: Vector2D = { x: rect.x + rect.width, y: rect.y };
    const bottomLeft: Vector2D = { x: rect.x, y: rect.y + rect.height };
    const bottomRight: Vector2D = { x: rect.x + rect.width, y: rect.y + rect.height };

    if (
      this.lineSegmentIntersection(from, to, topLeft, topRight) ||
      this.lineSegmentIntersection(from, to, topRight, bottomRight) ||
      this.lineSegmentIntersection(from, to, bottomRight, bottomLeft) ||
      this.lineSegmentIntersection(from, to, bottomLeft, topLeft)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Line of sight check. Returns true if NO obstacles block the view between p1 and p2
   */
  public static hasLineOfSight(p1: Vector2D, p2: Vector2D, obstacles: ObstacleData[]): boolean {
    for (const obs of obstacles) {
      if (this.lineIntersectsRect(p1, p2, obs)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Resolve box collision and return adjusted target position
   */
  public static resolveMovement(
    currentPos: Vector2D,
    targetPos: Vector2D,
    size: { width: number; height: number },
    obstacles: ObstacleData[],
    mapBounds: { width: number; height: number }
  ): Vector2D {
    let newX = targetPos.x;
    let newY = targetPos.y;

    // Map bounds check
    const halfW = size.width / 2;
    const halfH = size.height / 2;

    newX = Math.max(halfW, Math.min(mapBounds.width - halfW, newX));
    newY = Math.max(halfH, Math.min(mapBounds.height - halfH, newY));

    // Try moving X first
    let rectX: Rect = {
      x: newX - halfW,
      y: currentPos.y - halfH,
      width: size.width,
      height: size.height
    };

    let collisionX = false;
    for (const obs of obstacles) {
      if (this.rectRectCollision(rectX, obs)) {
        collisionX = true;
        break;
      }
    }

    if (collisionX) {
      newX = currentPos.x;
    }

    // Try moving Y
    let rectY: Rect = {
      x: newX - halfW,
      y: newY - halfH,
      width: size.width,
      height: size.height
    };

    let collisionY = false;
    for (const obs of obstacles) {
      if (this.rectRectCollision(rectY, obs)) {
        collisionY = true;
        break;
      }
    }

    if (collisionY) {
      newY = currentPos.y;
    }

    return { x: newX, y: newY };
  }
}
