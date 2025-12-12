// src/utils/confetti.js
import confetti from "canvas-confetti";

export function softCelebrate() {
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
}

export function strongCelebrate() {
  confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } });
  confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } });
  confetti({ particleCount: 50, spread: 100, origin: { y: 0.6 } });
}

export function fireworks(duration = 2500) {
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 5,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: ["#ff6f91", "#ff9671", "#ffc75f", "#f9f871"]
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
