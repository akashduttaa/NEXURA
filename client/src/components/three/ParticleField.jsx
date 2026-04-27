import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 1500 }) {
  const mesh = useRef();
  const light = useRef();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // Cyan to purple gradient
      const t = Math.random();
      colors[i * 3] = t < 0.5 ? 0 : 0.66 * t;
      colors[i * 3 + 1] = t < 0.5 ? 0.94 * (1 - t) : 0.33 * (1 - t);
      colors[i * 3 + 2] = 1;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { positions, colors, sizes };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime() * 0.1;
    mesh.current.rotation.y = t * 0.15;
    mesh.current.rotation.x = Math.sin(t * 0.3) * 0.1;

    const pos = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3 + 1] += Math.sin(t * 2 + pos[i3]) * 0.002;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={particles.colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function FloatingLines() {
  const ref = useRef();
  
  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      points.push(new THREE.Vector3(x, y, z));
      points.push(new THREE.Vector3(x + (Math.random() - 0.5) * 5, y + (Math.random() - 0.5) * 5, z + (Math.random() - 0.5) * 5));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#00f0ff" transparent opacity={0.1} />
    </lineSegments>
  );
}

export default function ParticleField({ className = '' }) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: true }}>
        <ambientLight intensity={0.1} />
        <Particles />
        <FloatingLines />
      </Canvas>
    </div>
  );
}
