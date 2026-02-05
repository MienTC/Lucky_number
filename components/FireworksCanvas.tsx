"use client";

import React, { useRef, useEffect, useCallback, useMemo } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
  friction: number;
}

interface Firework {
  x: number;
  y: number;
  particles: Particle[];
  exploded: boolean;
  launchTime: number;
}

const FireworksCanvas: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const fireworksRef = useRef<Firework[]>([]);

  const colors = useMemo(() => ['#FFD700', '#FF1493', '#00F5FF', '#FF69B4', '#7B68EE', '#FFA500', '#32CD32', '#FF6347'], []);

  const createParticle = useCallback((x: number, y: number, color: string): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 2;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 120 + Math.random() * 80, // Increased duration (120-200 frames)
      color,
      size: Math.random() * 3 + 1,
      gravity: 0.08, // Slightly less gravity for longer fall
      friction: 0.995 // Less friction for longer travel
    };
  }, []);

  const createFirework = useCallback((): Firework => {
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight;

    return {
      x,
      y,
      particles: [],
      exploded: false,
      launchTime: Date.now()
    };
  }, []);

  const updateParticles = useCallback((particles: Particle[]): Particle[] => {
    return particles
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * particle.friction,
        vy: (particle.vy * particle.friction) + particle.gravity,
        life: particle.life + 1
      }))
      .filter(particle => particle.life < particle.maxLife);
  }, []);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = 1 - (particle.life / particle.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Slower fade for longer lasting effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw fireworks
    fireworksRef.current = fireworksRef.current
      .map(firework => {
        if (!firework.exploded) {
          // Launch phase
          firework.y -= 8;
          if (firework.y <= window.innerHeight * 0.3) {
            firework.exploded = true;
            // Create explosion particles - increased count
            const particleCount = 120 + Math.random() * 60; // More particles (120-180)
            const explosionColor = colors[Math.floor(Math.random() * colors.length)];
            for (let i = 0; i < particleCount; i++) {
              firework.particles.push(createParticle(firework.x, firework.y, explosionColor));
            }
          }
          // Draw launch trail
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(firework.x, window.innerHeight);
          ctx.lineTo(firework.x, firework.y);
          ctx.stroke();
        } else {
          // Update particles
          firework.particles = updateParticles(firework.particles);
        }

        // Draw particles
        firework.particles.forEach(particle => drawParticle(ctx, particle));

        return firework;
      })
      .filter(firework => firework.particles.length > 0 || !firework.exploded);

    // Increased frequency - higher probability of creating new fireworks
    if (isActive && Math.random() < 0.25) { // Increased from 0.1 to 0.25 (25% chance)
      fireworksRef.current.push(createFirework());
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isActive, colors, createParticle, updateParticles, drawParticle, createFirework]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (isActive) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, animate]);

  useEffect(() => {
    if (!isActive) {
      fireworksRef.current = [];
    }
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ background: 'transparent' }}
    />
  );
};

export default FireworksCanvas;
