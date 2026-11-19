"use client";

import { useEffect, useRef } from "react";

export default function AmbientLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const count = window.innerWidth < 768 ? 18 : 30;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.9,
    }));

    function drawParticles() {
      if (!canvas || !ctx) return;
      if (!document.hidden) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ffaa";
        ctx.strokeStyle = "rgba(0, 255, 170, 0.08)";
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!reduced) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 120) {
              ctx.lineWidth = 1 - dist / 120;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      if (!reduced) {
        rafId = requestAnimationFrame(drawParticles);
      }
    }
    drawParticles();

    let glowRaf = 0;
    let mx = 0;
    let my = 0;
    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!glowRaf) {
        glowRaf = requestAnimationFrame(() => {
          glowRaf = 0;
          if (glowRef.current) {
            glowRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
          }
        });
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
      if (glowRaf) cancelAnimationFrame(glowRaf);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="neural-canvas" aria-hidden="true" />
      <div ref={glowRef} id="cursorGlow" aria-hidden="true" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[950px] h-[400px] bg-gradient-to-b from-brandNeon/15 via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-32 w-[450px] h-[450px] bg-cyan-600/12 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-2/3 -left-32 w-[450px] h-[450px] bg-brandGreen/12 blur-[130px] rounded-full pointer-events-none -z-10" />
    </>
  );
}
