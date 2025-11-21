import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const celebrateTopThree = useCallback((rank: number) => {
    const duration = rank === 1 ? 3000 : 2000;
    const particleCount = rank === 1 ? 200 : rank === 2 ? 150 : 100;
    
    // Gold for 1st, silver for 2nd, bronze for 3rd
    const colors = rank === 1 
      ? ['#FFD700', '#FFA500', '#FF8C00'] 
      : rank === 2 
      ? ['#C0C0C0', '#D3D3D3', '#A9A9A9']
      : ['#CD7F32', '#B87333', '#8B4513'];

    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleRatio = particleCount / 150;

      confetti({
        particleCount: Math.floor(50 * particleRatio),
        spread: rank === 1 ? 100 : 70,
        origin: { y: 0.6 },
        colors: colors,
        startVelocity: rank === 1 ? 45 : 30,
        gravity: 1,
        drift: randomInRange(-0.5, 0.5),
        ticks: 300,
        scalar: rank === 1 ? 1.2 : 1,
      });
    }, 250);
  }, []);

  const celebrateNewSubmission = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#006400', '#228B22', '#32CD32'],
    });
  }, []);

  return { celebrateTopThree, celebrateNewSubmission };
};
