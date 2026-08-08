import React, { useRef, useEffect, useState } from 'react';
import { Game } from './game/Game';
import { Difficulty, GameState, MapData, HighScore } from './game/Types';
import { MAP_PRESETS } from './game/GameMap';
import { MainMenu } from './components/MainMenu';
import { InGameHUD } from './components/InGameHUD';
import { PauseMenu } from './components/PauseMenu';
import { GameResultModal } from './components/GameResultModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { HighScoresModal } from './components/HighScoresModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedMap, setSelectedMap] = useState<MapData>(MAP_PRESETS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  // Trigger HUD updates
  const [, setHudTick] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new Game(canvasRef.current);
    gameRef.current = game;

    game.onStateChange = (newState) => {
      setGameState(newState);
    };

    game.onHUDUpdate = () => {
      setHudTick((prev) => prev + 1);
    };

    // Responsive Canvas Resizing via ResizeObserver
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      game.destroy();
    };
  }, []);

  const handleStartGame = () => {
    if (!gameRef.current) return;
    gameRef.current.initMap(selectedMap, selectedDifficulty);
    gameRef.current.start();
  };

  const handlePause = () => {
    gameRef.current?.pause();
  };

  const handleResume = () => {
    gameRef.current?.resume();
  };

  const handleRestart = () => {
    gameRef.current?.restart();
  };

  const handleMainMenu = () => {
    gameRef.current?.returnToMenu();
  };

  const handleOpenHighScores = () => {
    if (gameRef.current) {
      setHighScores(gameRef.current.scoreManager.getHighScores());
    }
    setShowHighScores(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 2D Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-crosshair"
      />

      {/* 1. Main Menu Overlay */}
      {gameState === 'menu' && gameRef.current && (
        <MainMenu
          game={gameRef.current}
          selectedMap={selectedMap}
          selectedDifficulty={selectedDifficulty}
          onSelectMap={setSelectedMap}
          onSelectDifficulty={setSelectedDifficulty}
          onStartGame={handleStartGame}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenHighScores={handleOpenHighScores}
        />
      )}

      {/* 2. In-Game HUD Overlay */}
      {gameState === 'playing' && gameRef.current && (
        <InGameHUD game={gameRef.current} onPause={handlePause} />
      )}

      {/* 3. Pause Menu Modal */}
      {gameState === 'paused' && gameRef.current && (
        <PauseMenu
          game={gameRef.current}
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* 4. Victory / Defeat Modal */}
      {(gameState === 'victory' || gameState === 'defeated') && gameRef.current && (
        <GameResultModal
          game={gameRef.current}
          onPlayAgain={handleStartGame}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* 5. How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* 6. High Scores Modal */}
      {showHighScores && (
        <HighScoresModal
          scores={highScores}
          onClose={() => setShowHighScores(false)}
        />
      )}
    </div>
  );
}
