import { useEffect, useRef, useState } from 'react';

/**
 * Pure-CSS 3D animated scene: rotating wireframe polyhedra, floating orbs,
 * and a parallax tilt card. No WebGL libraries — uses CSS 3D transforms.
 */
export default function Scene3D() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = (e.clientX / w - 0.5) * 20;
      const y = (e.clientY / h - 0.5) * 20;
      setTilt({ x, y });
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-gold-400/20 animate-pulse-glow" />
      <div
        className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/10 animate-pulse-glow"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-gold-300/10 animate-pulse-glow"
        style={{ animationDelay: '3s' }}
      />

      {/* Rotating wireframe cube */}
      <div
        className="perspective absolute right-[8%] top-[18%] hidden md:block"
        style={{ transform: `translateY(${tilt.y * 0.5}px)` }}
      >
        <div className="preserve-3d h-48 w-48 animate-spin-slow">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 border border-gold-400/40"
              style={{
                transform: [
                  'translateZ(96px)',
                  'rotateY(180deg) translateZ(96px)',
                  'rotateY(90deg) translateZ(96px)',
                  'rotateY(-90deg) translateZ(96px)',
                  'rotateX(90deg) translateZ(96px)',
                  'rotateX(-90deg) translateZ(96px)',
                ][i],
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating octahedron (two pyramids) */}
      <div
        className="perspective absolute left-[6%] top-[55%] hidden lg:block"
        style={{ transform: `translateY(${tilt.y * -0.3}px)` }}
      >
        <div className="preserve-3d h-32 w-32 animate-spin-slower">
          <div
            className="absolute inset-0"
            style={{ transform: 'rotateX(45deg)', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', border: '1px solid rgba(212,175,55,0.35)' }}
          />
          <div
            className="absolute inset-0"
            style={{ transform: 'rotateX(45deg) rotateY(90deg)', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', border: '1px solid rgba(212,175,55,0.25)' }}
          />
        </div>
      </div>

      {/* Floating rings */}
      <div className="absolute left-[12%] top-[15%] hidden md:block">
        <div className="h-24 w-24 rounded-full border border-gold-400/20 animate-float-slow" />
      </div>
      <div className="absolute right-[20%] bottom-[20%] hidden md:block">
        <div className="h-16 w-16 rounded-full border border-white/10 animate-float-mid" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to top, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />
    </div>
  );
}
