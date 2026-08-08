import { Difficulty, HighScore } from './Types';

export class ScoreManager {
  public currentScore: number = 0;
  public elapsedTime: number = 0; // Total seconds played
  public timeRemaining: number = 120; // Default 2 minutes
  public totalDuration: number = 120;
  public hidingSpotsUsed: Set<string> = new Set();
  public hidesCount: number = 0;

  private scoreTimer: number = 0;
  private readonly LOCAL_STORAGE_KEY = 'petak_umpet_high_scores_v1';

  public init(difficulty: Difficulty) {
    this.currentScore = 0;
    this.elapsedTime = 0;
    this.hidingSpotsUsed.clear();
    this.hidesCount = 0;
    this.scoreTimer = 0;

    switch (difficulty) {
      case 'easy':
        this.totalDuration = 180; // 3 mins
        break;
      case 'normal':
        this.totalDuration = 120; // 2 mins
        break;
      case 'hard':
        this.totalDuration = 60; // 1 min
        break;
    }
    this.timeRemaining = this.totalDuration;
  }

  public update(dt: number, isHiding: boolean, isChased: boolean): boolean {
    this.elapsedTime += dt;
    this.timeRemaining = Math.max(0, this.totalDuration - this.elapsedTime);

    // Score accumulation over time
    this.scoreTimer += dt;
    if (this.scoreTimer >= 1.0) {
      this.scoreTimer = 0;
      this.currentScore += 10; // Base survival score per sec

      if (isHiding) {
        this.currentScore += 15; // Stealth bonus
      }
      if (isChased) {
        this.currentScore += 25; // Evasion adrenaline bonus
      }
    }

    return this.timeRemaining <= 0; // Returns true when timer expires (Victory!)
  }

  public recordHideSpot(spotId: string) {
    if (!this.hidingSpotsUsed.has(spotId)) {
      this.hidingSpotsUsed.add(spotId);
      this.currentScore += 100; // Bonus for discovering & using new hiding spot
    }
    this.hidesCount++;
  }

  public calculateVictoryBonus(): number {
    const victoryBonus = 1000;
    this.currentScore += victoryBonus;
    return victoryBonus;
  }

  public formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  public saveHighScore(mapId: string, difficulty: Difficulty): HighScore[] {
    const scores = this.getHighScores();
    const newRecord: HighScore = {
      mapId,
      difficulty,
      score: this.currentScore,
      survivedTime: Math.floor(this.elapsedTime),
      date: new Date().toLocaleDateString('id-ID')
    };

    scores.push(newRecord);
    scores.sort((a, b) => b.score - a.score);

    // Keep top 10
    const topScores = scores.slice(0, 10);
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(topScores));
    } catch (e) {
      console.warn('Failed to save high score to localStorage:', e);
    }
    return topScores;
  }

  public getHighScores(): HighScore[] {
    try {
      const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to read high scores from localStorage:', e);
    }
    return [];
  }
}
