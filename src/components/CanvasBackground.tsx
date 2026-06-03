import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates tracking
    const mouse = { x: null as number | null, y: null as number | null, radius: 160 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let lowQualityMode = false;
    const handleOptimize = (e: Event) => {
      const customEvent = e as CustomEvent;
      lowQualityMode = customEvent.detail?.optimize || false;
    };
    window.addEventListener('mylife_optimize_rendering', handleOptimize);

    // --- CYBERPUNK: NEURAL PARTICLES ---
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }
    const particles: Particle[] = [];
    const particleCount = Math.min(100, Math.floor((width * height) / 16000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.8,
      });
    }

    // --- MATRIX: DIGITAL CODE RAIN ---
    const fontSize = 14;
    const columns = Math.floor(width / fontSize) + 1;
    const drops: number[] = Array(columns).fill(1);
    const matrixChars = "0101010101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+-/<>".split("");

    // --- SYNTHWAVE: DRIFTING RETRO STARS ---
    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
    }
    const stars: Star[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.05 + 0.01,
      });
    }

    // --- RENDER TICK ---
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      if (theme === 'matrix') {
        // Overlay transparent black for code rain trails
        ctx.fillStyle = 'rgba(2, 2, 2, 0.08)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00ff41';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      } else if (theme === 'synthwave') {
        // Drifting stars
        ctx.fillStyle = 'rgba(21, 2, 40, 0.18)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.alpha += s.speed;
          if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
          s.alpha = Math.max(0, Math.min(1, s.alpha));

          ctx.fillStyle = `rgba(255, 110, 199, ${s.alpha * 0.75})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();

          s.x -= 0.12;
          if (s.x < 0) {
            s.x = width;
            s.y = Math.random() * height;
          }
        }
      } else {
        // Cyberpunk Neural Nodes
        ctx.fillStyle = 'rgba(5, 5, 12, 0.25)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx = -p.vx;
          if (p.y < 0 || p.y > height) p.vy = -p.vy;

          ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Connect particles within proximity (skipped in low-quality optimization mode for high FPS)
          if (!lowQualityMode) {
            for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 110) {
                const alpha = (1 - dist / 110) * 0.12;
                ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
            }
          }

          // Interact with mouse cursor
          if (mouse.x !== null && mouse.y !== null) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < mouse.radius) {
              const alpha = (1 - dist / mouse.radius) * 0.22;
              ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mylife_optimize_rendering', handleOptimize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-10] w-full h-full"
    />
  );
};
