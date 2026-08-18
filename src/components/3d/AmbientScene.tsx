import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function Particle({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.5;
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

function ParticleField() {
  const particles = useMemo(() => {
    const arr: { position: [number, number, number]; color: string; speed: number }[] = [];
    for (let i = 0; i < 60; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8 - 2,
        ],
        color: Math.random() > 0.7 ? '#d4af37' : '#ffffff',
        speed: 0.3 + Math.random() * 0.5,
      });
    }
    return arr;
  }, []);

  return (
    <>
      {particles.map((p, i) => (
        <Particle key={i} position={p.position} color={p.color} speed={p.speed} />
      ))}
    </>
  );
}

function GridFloor() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[40, 40, 40, 40]} />
      <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.1} />
    </mesh>
  );
}

export default function AmbientScene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
            <ParticleField />
          </Float>
          <GridFloor />
          <Sparkles count={50} scale={14} size={1.5} speed={0.2} color="#d4af37" opacity={0.3} />
        </Suspense>
      </Canvas>
    </div>
  );
}
