import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

const HELIX_PAIRS = 20;
const HELIX_RADIUS = 1.2;
const HELIX_HEIGHT = 12;

const NEON_BLUE = "hsl(210, 100%, 60%)";
const DARK_BLUE = "hsl(230, 80%, 45%)";

const PAIR_COLORS = [
  new THREE.Color(NEON_BLUE),
  new THREE.Color(DARK_BLUE),
  new THREE.Color("hsl(210, 100%, 50%)"),
  new THREE.Color("hsl(230, 80%, 35%)"),
];

function HelixStrand() {
  const groupRef = useRef<THREE.Group>(null);

  const { spheres, connections } = useMemo(() => {
    const s: { pos: THREE.Vector3; color: THREE.Color; side: number }[] = [];
    const c: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

    for (let i = 0; i < HELIX_PAIRS; i++) {
      const t = i / HELIX_PAIRS;
      const angle = t * Math.PI * 4;
      const y = (t - 0.5) * HELIX_HEIGHT;

      const x1 = Math.cos(angle) * HELIX_RADIUS;
      const z1 = Math.sin(angle) * HELIX_RADIUS;
      const x2 = Math.cos(angle + Math.PI) * HELIX_RADIUS;
      const z2 = Math.sin(angle + Math.PI) * HELIX_RADIUS;

      const pos1 = new THREE.Vector3(x1, y, z1);
      const pos2 = new THREE.Vector3(x2, y, z2);

      s.push({ pos: pos1, color: PAIR_COLORS[i % 2], side: 0 });
      s.push({ pos: pos2, color: PAIR_COLORS[(i % 2) + 2], side: 1 });
      c.push({ start: pos1, end: pos2 });
    }
    return { spheres: s, connections: c };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {spheres.map((s, i) => (
        <mesh key={`sphere-${i}`} position={s.pos}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}
      {connections.map((c, i) => {
        const mid = new THREE.Vector3().addVectors(c.start, c.end).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(c.end, c.start);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.normalize()
        );
        return (
          <mesh key={`conn-${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.02, 0.02, len, 8]} />
            <meshStandardMaterial
              color={NEON_BLUE}
              transparent
              opacity={0.3}
              emissive={NEON_BLUE}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}
      {/* Backbone strands */}
      {[0, 1].map((side) => {
        const points = spheres
          .filter((s) => s.side === side)
          .map((s) => s.pos);
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
        return (
          <mesh key={`backbone-${side}`} geometry={tubeGeom}>
            <meshStandardMaterial
              color={side === 0 ? NEON_BLUE : DARK_BLUE}
              emissive={side === 0 ? NEON_BLUE : DARK_BLUE}
              emissiveIntensity={0.4}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={NEON_BLUE} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

export default function DNAHelix() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color={NEON_BLUE} />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color={DARK_BLUE} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <HelixStrand />
        </Float>
        <Particles />
      </Canvas>
    </div>
  );
}
