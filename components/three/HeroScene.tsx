"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useCallback, useMemo, useRef } from "react";
import { Vector3, type Group, type Mesh } from "three";
import styles from "./HeroScene.module.css";

interface HeroSceneProps {
  labels: string[];
  active: boolean;
}

function Core() {
  const shell = useRef<Mesh>(null);
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (shell.current) {
      shell.current.rotation.y += delta * 0.18;
      shell.current.rotation.x += delta * 0.07;
    }
    // Mouse parallax: ease the whole composition toward the pointer.
    if (group.current) {
      group.current.rotation.y += (state.pointer.x * 0.45 - group.current.rotation.y) * 0.05;
      group.current.rotation.x += (-state.pointer.y * 0.3 - group.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh>
          <icosahedronGeometry args={[1.35, 24]} />
          <MeshDistortMaterial
            color="#0a1c26"
            emissive="#0b3a48"
            emissiveIntensity={0.6}
            roughness={0.25}
            metalness={0.85}
            distort={0.38}
            speed={1.6}
          />
        </mesh>
        <mesh ref={shell} scale={1.75}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#22e4ff" wireframe transparent opacity={0.28} />
        </mesh>
      </Float>
      <Rings />
      <Cubes />
    </group>
  );
}

function Rings() {
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (a.current) a.current.rotation.z += delta * 0.25;
    if (b.current) b.current.rotation.z -= delta * 0.18;
  });
  return (
    <>
      <mesh ref={a} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[2.45, 0.012, 16, 160]} />
        <meshBasicMaterial color="#22e4ff" transparent opacity={0.7} />
      </mesh>
      <mesh ref={b} rotation={[Math.PI / 1.8, -0.5, 0.4]}>
        <torusGeometry args={[2.85, 0.008, 16, 160]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.65} />
      </mesh>
    </>
  );
}

function Cubes() {
  const cubes = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        return {
          position: [Math.cos(angle) * 3.2, Math.sin(i * 1.7) * 1.4, Math.sin(angle) * 1.6] as [number, number, number],
          scale: 0.09 + (i % 3) * 0.05,
          color: i % 3 === 0 ? "#c6ff3d" : i % 2 ? "#22e4ff" : "#8b5cf6",
        };
      }),
    [],
  );
  return (
    <>
      {cubes.map((cube, i) => (
        <Float key={i} speed={2 + (i % 3)} rotationIntensity={2} floatIntensity={1.5}>
          <mesh position={cube.position} scale={cube.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={cube.color} emissive={cube.color} emissiveIntensity={0.6} />
          </mesh>
        </Float>
      ))}
    </>
  );
}

type Project = (index: number, x: number, y: number, depth: number) => void;

/**
 * Orbiting technology labels. Instead of one React root per label (Drei <Html>), the labels are
 * plain DOM nodes outside the canvas; each frame we project their 3D orbit position to screen space.
 */
function OrbitProjector({ count, onProject }: { count: number; onProject: Project }) {
  const angle = useRef(0);
  const point = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    angle.current += delta * 0.16;
    const { width, height } = state.size;
    for (let i = 0; i < count; i++) {
      const a = angle.current + (i / count) * Math.PI * 2;
      point.set(Math.cos(a) * 2.65, Math.sin(i * 2.1) * 0.9 + Math.sin(a) * 0.55, Math.sin(a) * 2.65);
      const depth = point.z; // -2.65 (back) … 2.65 (front)
      point.project(state.camera);
      const x = (point.x * 0.5 + 0.5) * width;
      const y = (-point.y * 0.5 + 0.5) * height;
      onProject(i, x, y, (depth + 2.65) / 5.3);
    }
  });
  return null;
}

export default function HeroScene({ labels, active }: HeroSceneProps) {
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  // t: 0 = back of the orbit, 1 = front. Labels shrink and fade as they pass behind the core.
  const place = useCallback<Project>((i, x, y, t) => {
    const el = nodes.current[i];
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${0.72 + t * 0.4})`;
    el.style.opacity = String(0.25 + t * 0.75);
    el.style.zIndex = t > 0.5 ? "2" : "0";
  }, []);
  return (
    <div className={styles.stage}>
      <Canvas
        className={styles.canvas}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={active ? "always" : "never"}
        aria-hidden="true"
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 3]} intensity={2.2} color="#22e4ff" />
        <pointLight position={[-4, -2, 2]} intensity={30} color="#8b5cf6" />
        <pointLight position={[2, -3, -2]} intensity={12} color="#c6ff3d" />
        <Core />
        <OrbitProjector count={labels.length} onProject={place} />
        <Sparkles count={70} scale={[9, 6, 4]} size={2.2} speed={0.35} color="#22e4ff" opacity={0.6} />
      </Canvas>
      <div className={styles.labels} aria-hidden="true">
        {labels.map((label, i) => (
          <span
            key={label}
            className={styles.label}
            ref={(el) => {
              nodes.current[i] = el;
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
