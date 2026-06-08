import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  alpha: number;
  targetAlpha: number;
  delay: number;
}

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  decay: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const drawHeartParticle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.beginPath();
  const topY = y - size * 0.25;
  ctx.moveTo(x, topY);
  ctx.bezierCurveTo(x - size, topY - size * 0.8, x - size * 1.3, y + size * 0.3, x, y + size * 0.95);
  ctx.bezierCurveTo(x + size * 1.3, y + size * 0.3, x + size, topY - size * 0.8, x, topY);
  ctx.closePath();
  ctx.fill();
};

export default function TextHeart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    const text = "i love you";
    const fontSize = 14;
    let sparkles: Sparkle[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initPoints();
    };

    const initPoints = () => {
      points = [];
      const width = window.innerWidth;
      const height = window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) / 45;

      // Heart equation: 
      // x = 16 sin^3(t)
      // y = -(13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))
      
      for (let t = 0; t < Math.PI * 2; t += 0.05) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        points.push({
          x: centerX + x * scale,
          y: centerY + y * scale,
          alpha: 0,
          targetAlpha: 0.8 + Math.random() * 0.2,
          delay: Math.random() * 2000
        });
      }

      // Add inner layers
      for (let s = 0.2; s < 1; s += 0.2) {
          for (let t = 0; t < Math.PI * 2; t += 0.1) {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            points.push({
              x: centerX + x * scale * s,
              y: centerY + y * scale * s,
              alpha: 0,
              targetAlpha: 0.4 + Math.random() * 0.4,
              delay: Math.random() * 3000
            });
          }
      }
    };

    let start: number | null = null;
    const draw = (time: number) => {
      if (!start) start = time;
      const elapsed = time - start;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px "Fira Code", monospace`;
      
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) / 45;

      // Draw the glowing text heart
      ctx.shadowColor = 'rgba(255, 77, 109, 0.8)';
      ctx.shadowBlur = 10;

      points.forEach(p => {
        if (elapsed > p.delay) {
            p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        }

        ctx.fillStyle = `rgba(255, 77, 109, ${p.alpha})`;
        ctx.fillText(text, p.x - ctx.measureText(text).width / 2, p.y);
      });

      // Reset shadow for sparkle drawing
      ctx.shadowBlur = 0;

      // Floating Sparkles Effect (Option 3)
      // Spawn new sparkles from revealed points
      const revealedPoints = points.filter(p => elapsed > p.delay && p.alpha > 0.15);
      if (revealedPoints.length > 0 && sparkles.length < 350 && Math.random() < 0.6) {
        // Spawn 2-4 sparkles
        const numToSpawn = Math.floor(Math.random() * 3) + 2;
        for (let k = 0; k < numToSpawn; k++) {
          const parentPoint = revealedPoints[Math.floor(Math.random() * revealedPoints.length)];
          const textWidth = ctx.measureText(text).width;
          
          // Spread spawn positions slightly across the text width/height
          const offsetX = (Math.random() - 0.5) * textWidth;
          const offsetY = (Math.random() - 0.5) * fontSize;
          
          // Vary the color (pinkish to warm gold/white)
          const colors = [
            'rgba(255, 120, 150, ', // Pink
            'rgba(255, 200, 220, ', // Light Pink/White
            'rgba(255, 255, 255, ', // White
            'rgba(255, 180, 100, ', // Warm Gold/Orange
          ];
          const colorPrefix = colors[Math.floor(Math.random() * colors.length)];

          sparkles.push({
            x: parentPoint.x + offsetX,
            y: parentPoint.y + offsetY,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.6 - 0.2, // slow drift upwards
            alpha: 0.8 + Math.random() * 0.2,
            size: Math.random() * 4.0 + 2.5, // size range from 2.5 to 6.5px to make shape clearly visible
            decay: Math.random() * 0.004 + 0.002, // slower decay for longer life
            color: colorPrefix,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03
          });
        }
      }

      // Update and draw sparkles
      sparkles = sparkles.filter(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;
        s.rotation += s.rotationSpeed;

        if (s.alpha <= 0) {
          return false;
        }

        // Slight horizontal swaying motion using sine
        s.vx += Math.sin(time * 0.01 + s.y) * 0.01;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.fillStyle = `${s.color}${s.alpha})`;
        drawHeartParticle(ctx, 0, 0, s.size);
        ctx.restore();
        return true;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  );
}
