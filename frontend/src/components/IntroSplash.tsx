import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const HELIX_PAIRS = 16;
const HELIX_RADIUS = 0.9;
const HELIX_HEIGHT = 9;

const NEON_BLUE = "hsl(210, 100%, 60%)";
const DARK_BLUE = "hsl(230, 80%, 45%)";

/* Chaotic DNA strands that swirl around the screen */
function ChaoticDNA({ index, total }: { index: number; total: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Spread strands evenly in a grid-like pattern across the viewport
  const initialPos = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacingX = 22 / cols;
    const spacingY = 14 / Math.ceil(total / cols);
    return new THREE.Vector3(
      -11 + spacingX * (col + 0.5),
      -7 + spacingY * (row + 0.5),
      (Math.random() - 0.5) * 4
    );
  }, [index, total]);

  const { spheres, connections, tubes } = useMemo(() => {
    const s: { pos: THREE.Vector3; color: string; sideIdx: number }[] = [];
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
      s.push({ pos: pos1, color: NEON_BLUE, sideIdx: 0 });
      s.push({ pos: pos2, color: DARK_BLUE, sideIdx: 1 });
      c.push({ start: pos1, end: pos2 });
    }
    const tubeData = [0, 1].map((sideIdx) => {
      const points = s.filter((sp) => sp.sideIdx === sideIdx).map((sp) => sp.pos);
      const curve = new THREE.CatmullRomCurve3(points);
      return { geom: new THREE.TubeGeometry(curve, 48, 0.035, 6, false), sideIdx };
    });
    return { spheres: s, connections: c, tubes: tubeData };
  }, []);

  const speed = useMemo(() => 0.2 + Math.random() * 0.4, []);
  const rotAxis = useMemo(() => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), []);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(initialPos);
    groupRef.current.scale.set(0.45, 0.45, 0.45);

    // Gentle drift within a small radius so they don't overlap
    const drift = 2.5;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(groupRef.current.position, {
      x: initialPos.x + (Math.random() - 0.5) * drift,
      y: initialPos.y + (Math.random() - 0.5) * drift,
      z: initialPos.z + (Math.random() - 0.5) * 2,
      duration: 4 + Math.random() * 3,
      ease: "sine.inOut",
    });
    tl.to(groupRef.current.position, {
      x: initialPos.x + (Math.random() - 0.5) * drift,
      y: initialPos.y + (Math.random() - 0.5) * drift,
      z: initialPos.z + (Math.random() - 0.5) * 2,
      duration: 4 + Math.random() * 3,
      ease: "sine.inOut",
    });

    return () => { tl.kill(); };
  }, [initialPos]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotateOnAxis(rotAxis, speed * 0.02);
    }
  });

  return (
    <group ref={groupRef} scale={0.5}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.6} roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {connections.map((c, i) => {
        const mid = new THREE.Vector3().addVectors(c.start, c.end).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(c.end, c.start);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        return (
          <mesh key={`c-${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.012, 0.012, len, 5]} />
            <meshStandardMaterial color={NEON_BLUE} transparent opacity={0.25} emissive={NEON_BLUE} emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      {tubes.map((t) => (
        <mesh key={t.sideIdx} geometry={t.geom}>
          <meshStandardMaterial
            color={t.sideIdx === 0 ? NEON_BLUE : DARK_BLUE}
            emissive={t.sideIdx === 0 ? NEON_BLUE : DARK_BLUE}
            emissiveIntensity={0.4} transparent opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}



/* Floating particles */
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={NEON_BLUE} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

/* Brand text — letters drop on strings with pendulum physics */
function BrandZoom({ onTextDone }: { onTextDone: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stringRefs = useRef<(HTMLDivElement | null)[]>([]);

  const brandName = "GenieDose";

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.5 });

    brandName.split("").forEach((_, i) => {
      const letterEl = letterRefs.current[i];
      const stringEl = stringRefs.current[i];
      if (!letterEl || !stringEl) return;

      const staggerDelay = i * 0.18;

      // String drops down from top
      tl.fromTo(stringEl,
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: 1, duration: 0.4, ease: "power2.out" },
        staggerDelay
      );

      // Letter drops, attached to string, with elastic bounce
      tl.fromTo(letterEl,
        { y: -120, opacity: 0, rotateZ: (Math.random() - 0.5) * 30 },
        {
          y: 0,
          opacity: 1,
          rotateZ: 0,
          duration: 1.2,
          ease: "elastic.out(1, 0.35)",
        },
        staggerDelay
      );

      // Pendulum swing after landing
      tl.to(letterEl, {
        rotateZ: 6,
        duration: 0.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 3,
        transformOrigin: "top center",
      }, staggerDelay + 1.0);
    });

    // Glow pulse after all letters settle
    const allDoneTime = brandName.length * 0.18 + 2.5;
    tl.to(letterRefs.current.filter(Boolean), {
      textShadow: "0 0 40px hsla(210,100%,60%,0.8), 0 0 80px hsla(210,100%,60%,0.4)",
      duration: 0.6,
      ease: "power2.inOut",
      yoyo: true,
      repeat: 1,
    }, allDoneTime);

    tl.fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, allDoneTime + 0.3);

    tl.call(() => onTextDone(), [], "+=1.2");

    return () => { tl.kill(); };
  }, [onTextDone]);

  return (
    <div ref={containerRef} className="relative z-20 text-center pointer-events-none flex flex-col items-center justify-center">
      <div className="flex justify-center gap-[2px] mb-4">
        {brandName.split("").map((letter, i) => (
          <div key={i} className="flex flex-col items-center">
            {/* String thread */}
            <div
              ref={(el) => { stringRefs.current[i] = el; }}
              className="w-[1.5px] rounded-full"
              style={{
                height: "50px",
                background: "linear-gradient(to bottom, transparent, hsl(210, 100%, 60%), hsl(210, 100%, 60%))",
                opacity: 0.45,
                transformOrigin: "top center",
                transform: "scaleY(0)",
              }}
            />
            {/* Letter hanging from string */}
            <div
              ref={(el) => { letterRefs.current[i] = el; }}
              className="font-display text-6xl md:text-8xl lg:text-9xl font-bold gradient-text"
              style={{
                opacity: 0,
                willChange: "transform, opacity",
                transformOrigin: "top center",
              }}
            >
              {letter}
            </div>
          </div>
        ))}
      </div>
      <p
        ref={subtitleRef}
        className="text-sm md:text-base text-muted-foreground tracking-[0.3em] uppercase opacity-0"
      >
        Precision Medicine, Decoded
      </p>
    </div>
  );
}

export default function IntroSplash({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  const handleTextDone = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        setVisible(false);
        onComplete();
      },
    });
  };

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "hsl(270, 40%, 8%)" }}
    >
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
          <ambientLight intensity={0.15} />
          <pointLight position={[6, 6, 6]} intensity={0.7} color={NEON_BLUE} />
          <pointLight position={[-6, -4, 4]} intensity={0.5} color={DARK_BLUE} />
          <pointLight position={[0, 0, 8]} intensity={0.3} color="hsl(210, 100%, 65%)" />
          {Array.from({ length: 8 }).map((_, i) => (
            <ChaoticDNA key={i} index={i} total={8} />
          ))}
          <FloatingParticles />
        </Canvas>
      </div>

      {/* Dark purple vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, transparent 30%, hsl(270, 40%, 8%) 80%)"
      }} />

      {/* Text overlay */}
      <BrandZoom onTextDone={handleTextDone} />
    </div>
  );
}
