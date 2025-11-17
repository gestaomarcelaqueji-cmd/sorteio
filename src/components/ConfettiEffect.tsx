import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiEffect() {
  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#00FF85", "#E6E6E6"],
        disableForReducedMotion: true,
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#00FF85", "#E6E6E6"],
        disableForReducedMotion: true,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return null;
}
