import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// 3D Bar component
function Bar({ position, height, color, label, value }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Bar */}
      <mesh ref={meshRef} position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.5}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Top glow */}
      <mesh position={[0, height + 0.1, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Label - using HTML overlay instead */}
      <mesh position={[0, height + 1.2, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Value indicator */}
      <mesh position={[0, -0.3, 0]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

// Floating particles
function Particles({ count = 50 }) {
  const mesh = useRef();
  const light = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      particles.forEach((particle, i) => {
        let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
        t = particle.t += speed / 2;
        const a = Math.cos(t) + Math.sin(t * 1) / 10;
        const b = Math.sin(t) + Math.cos(t * 2) / 10;
        const s = Math.cos(t);
        particle.mx += (state.mouse.x * 0.5 - particle.mx) * 0.02;
        particle.my += (state.mouse.y * 0.5 - particle.my) * 0.02;

        const positions = mesh.current.geometry.attributes.position.array;
        positions[i * 3] = (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10;
        positions[i * 3 + 1] = (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10;
        positions[i * 3 + 2] = (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10;
      });
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length}
            array={new Float32Array(particles.length * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#2563eb" transparent opacity={0.6} />
      </points>
    </>
  );
}

// Main 3D Chart Component
function ThreeDChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const spacing = 2;
  const startX = -(data.length - 1) * spacing / 2;

  const colors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading 3D Chart...</div>}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#2563eb" />
      <pointLight position={[10, -10, -5]} intensity={0.5} color="#7c3aed" />

      {/* Grid floor */}
      <gridHelper args={[20, 20, '#e2e8f0', '#e2e8f0']} position={[0, -2, 0]} />

      {/* Bars */}
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 5 + 0.5;
        const x = startX + index * spacing;
        return (
          <Bar
            key={index}
            position={[x, 0, 0]}
            height={height}
            color={colors[index % colors.length]}
            label={item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name}
            value={item.value}
          />
        );
      })}

      {/* Floating particles */}
      <Particles count={30} />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={20}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
      </Canvas>
    </Suspense>
  );
}

export default ThreeDChart;
