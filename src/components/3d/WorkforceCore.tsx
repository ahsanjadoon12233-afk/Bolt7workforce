import { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, Billboard, Sparkles, Environment } from '@react-three/drei';
import * as THREE from 'three';

export interface AIEmployee3D {
  id: string;
  name: string;
  role: string;
  tagline: string;
  color: string;
  capabilities: string[];
  languages: string[];
  voice: string;
  status: string;
}

export const AI_EMPLOYEES: AIEmployee3D[] = [
  { id: 'aria', name: 'ARIA', role: 'AI Receptionist', tagline: 'Your front desk, always available.', color: '#d4af37', capabilities: ['Calls', 'Chat', 'Appointments', 'Lead Capture', 'CRM'], languages: ['EN', 'UR', 'AR', 'ES'], voice: 'Warm · Female · Neutral', status: 'ACTIVE' },
  { id: 'nova', name: 'NOVA', role: 'AI Sales', tagline: 'Closes while you sleep.', color: '#4fc3f7', capabilities: ['Qualification', 'Quotes', 'Follow-ups', 'CRM Sync'], languages: ['EN', 'UR', 'AR'], voice: 'Confident · Female · Neutral', status: 'ACTIVE' },
  { id: 'maya', name: 'MAYA', role: 'AI Support', tagline: 'Answers before you can.', color: '#66bb6a', capabilities: ['FAQ', 'Troubleshooting', 'Tickets', 'Escalation'], languages: ['EN', 'ES', 'AR'], voice: 'Calm · Female · Neutral', status: 'IDLE' },
  { id: 'kai', name: 'KAI', role: 'AI Recruiting', tagline: 'Finds the right people.', color: '#ab47bc', capabilities: ['Screening', 'Scheduling', 'Outreach', 'Notes'], languages: ['EN', 'UR'], voice: 'Professional · Male · Neutral', status: 'ACTIVE' },
  { id: 'zen', name: 'ZEN', role: 'AI Scheduler', tagline: 'Never double-books again.', color: '#ff7043', capabilities: ['Calendar', 'Reminders', 'Rescheduling', 'Conflicts'], languages: ['EN', 'AR', 'ES'], voice: 'Precise · Neutral', status: 'ACTIVE' },
  { id: 'rex', name: 'REX', role: 'AI Dispatcher', tagline: 'Routes and dispatches instantly.', color: '#ef5350', capabilities: ['Routing', 'Dispatch', 'Status Updates', 'GPS'], languages: ['EN', 'UR'], voice: 'Direct · Male · Neutral', status: 'IDLE' },
  { id: 'echo', name: 'ECHO', role: 'Custom AI', tagline: 'Build anything you imagine.', color: '#78909c', capabilities: ['Custom Workflow', 'API', 'Webhooks', 'Integrations'], languages: ['EN', 'UR', 'AR', 'ES'], voice: 'Adaptive · Neutral', status: 'DRAFT' },
];

function CoreSphere({ onHover }: { onHover: (id: string | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
      meshRef.current.scale.set(s, s, s);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      {/* Inner glowing core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 4]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#d4af37"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      {/* Wireframe shell */}
      <mesh ref={ringRef}>
        <icosahedronGeometry args={[1.6, 2]} />
        <meshBasicMaterial color="#d4af37" wireframe transparent opacity={0.25} />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial color="#d4af37" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

function EmployeeNode({
  employee,
  index,
  total,
  onHover,
  onSelect,
  hovered,
}: {
  employee: AIEmployee3D;
  index: number;
  total: number;
  onHover: (id: string | null) => void;
  onSelect: (e: AIEmployee3D) => void;
  hovered: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 4.2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = Math.sin(index * 1.3) * 0.4;

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.position.y = y + Math.sin(t * 0.8 + index) * 0.15;
      ref.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group
      ref={ref}
      position={[x, y, z]}
      onPointerOver={(e) => { e.stopPropagation(); onHover(employee.id); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(employee); }}
    >
      {/* Node sphere */}
      <mesh scale={hovered ? 0.42 : 0.32}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color={employee.color}
          emissive={employee.color}
          emissiveIntensity={hovered ? 1.2 : 0.5}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      {/* Halo when hovered */}
      {hovered && (
        <mesh>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshBasicMaterial color={employee.color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Label */}
      <Billboard position={[0, 0.65, 0]}>
        <Text
          fontSize={0.22}
          color={hovered ? employee.color : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {employee.name}
        </Text>
        <Text
          position={[0, -0.25, 0]}
          fontSize={0.11}
          color="#888888"
          anchorX="center"
          anchorY="middle"
        >
          {employee.role}
        </Text>
      </Billboard>
    </group>
  );
}

function ConnectionLines({ hoveredId }: { hoveredId: string | null }) {
  const lines = useMemo(() => {
    return AI_EMPLOYEES.map((emp, i) => {
      const angle = (i / AI_EMPLOYEES.length) * Math.PI * 2;
      const radius = 4.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(i * 1.3) * 0.4;
      return new THREE.Vector3(x, y, z);
    });
  }, []);

  const geometry = useMemo(() => {
    const points: number[] = [];
    lines.forEach((p) => {
      points.push(0, 0, 0, p.x, p.y, p.z);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [lines]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#d4af37" transparent opacity={0.12} />
    </lineSegments>
  );
}

function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 1.5 - camera.position.x) * 0.03;
    camera.position.y += (1 + pointer.y * 0.8 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

interface WorkforceCoreProps {
  onSelectEmployee: (e: AIEmployee3D) => void;
}

export default function WorkforceCore({ onSelectEmployee }: WorkforceCoreProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 1, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#d4af37" />
          <pointLight position={[-10, -5, -10]} intensity={0.4} color="#4fc3f7" />
          <Environment preset="night" />

          <CameraRig />

          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <CoreSphere onHover={setHoveredId} />
          </Float>

          <ConnectionLines hoveredId={hoveredId} />

          {AI_EMPLOYEES.map((emp, i) => (
            <EmployeeNode
              key={emp.id}
              employee={emp}
              index={i}
              total={AI_EMPLOYEES.length}
              onHover={setHoveredId}
              onSelect={onSelectEmployee}
              hovered={hoveredId === emp.id}
            />
          ))}

          <Sparkles count={80} scale={12} size={2} speed={0.3} color="#d4af37" opacity={0.4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
