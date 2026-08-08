export class InputManager {
  private keys: Record<string, boolean> = {};
  private hidePressedThisFrame: boolean = false;
  private pausePressedThisFrame: boolean = false;

  // Virtual Joystick values (-1 to 1)
  private joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  private isJoystickActive: boolean = false;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Prevent page scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!this.keys[e.code]) {
        if (e.code === 'KeyE' || e.code === 'KeyH') {
          this.hidePressedThisFrame = true;
        }
        if (e.code === 'Escape' || e.code === 'KeyP') {
          this.pausePressedThisFrame = true;
        }
      }

      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  public setJoystickVector(x: number, y: number, active: boolean) {
    this.joystickVector = { x, y };
    this.isJoystickActive = active;
  }

  public triggerHideAction() {
    this.hidePressedThisFrame = true;
  }

  public triggerPauseAction() {
    this.pausePressedThisFrame = true;
  }

  public getMovementVector(): { x: number; y: number } {
    let dx = 0;
    let dy = 0;

    // Keyboard controls
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      // Normalize keyboard input vector
      const len = Math.sqrt(dx * dx + dy * dy);
      return { x: dx / len, y: dy / len };
    }

    // Touch joystick input
    if (this.isJoystickActive) {
      return this.joystickVector;
    }

    return { x: 0, y: 0 };
  }

  public consumeHidePressed(): boolean {
    if (this.hidePressedThisFrame) {
      this.hidePressedThisFrame = false;
      return true;
    }
    return false;
  }

  public consumePausePressed(): boolean {
    if (this.pausePressedThisFrame) {
      this.pausePressedThisFrame = false;
      return true;
    }
    return false;
  }

  public reset() {
    this.keys = {};
    this.hidePressedThisFrame = false;
    this.pausePressedThisFrame = false;
    this.joystickVector = { x: 0, y: 0 };
    this.isJoystickActive = false;
  }
}
