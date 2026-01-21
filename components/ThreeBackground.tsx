'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  
  // 生成粒子位置 - 增加粒子数量
  const particlesCount = 5000;
  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      
      // 在更大的空间中随机分布
      const radius = Math.random() * 35 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, []);
  
  // 动画效果
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (ref.current) {
      // 缓慢旋转
      ref.current.rotation.x = time * 0.03;
      ref.current.rotation.y = time * 0.05;
      
      // 粒子呼吸效果
      const scale = 1 + Math.sin(time * 0.3) * 0.05;
      ref.current.scale.set(scale, scale, scale);
    }
  });
  
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#0099cc"
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.4}
        toneMapped={false}
      />
    </Points>
  );
}

function SecondaryParticles() {
  const ref = useRef<THREE.Points>(null!);
  
  const particlesCount = 2000;
  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 40;
      positions[i3 + 1] = (Math.random() - 0.5) * 40;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;
    }
    
    return positions;
  }, []);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (ref.current) {
      ref.current.rotation.x = -time * 0.02;
      ref.current.rotation.y = -time * 0.04;
    }
  });
  
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#6644aa"
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.3}
        toneMapped={false}
      />
    </Points>
  );
}

function FloatingCrystals() {
  const groupRef = useRef<THREE.Group>(null!);
  
  const crystals = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
      ] as [number, number, number],
      scale: Math.random() * 0.6 + 0.4,
      rotationSpeed: [
        Math.random() * 0.5,
        Math.random() * 0.5,
        Math.random() * 0.5,
      ] as [number, number, number],
    }));
  }, []);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.02;
      
      groupRef.current.children.forEach((child, i) => {
        const crystal = crystals[i];
        child.rotation.x += crystal.rotationSpeed[0] * 0.01;
        child.rotation.y += crystal.rotationSpeed[1] * 0.01;
        child.rotation.z += crystal.rotationSpeed[2] * 0.01;
        
        // 浮动效果
        child.position.y = crystal.position[1] + Math.sin(time * 0.5 + i) * 0.8;
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {crystals.map((crystal, i) => (
        <mesh key={i} position={crystal.position} scale={crystal.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color={i % 2 === 0 ? "#6644aa" : "#cc4488"}
            transparent
            opacity={0.15}
            roughness={0.2}
            metalness={0.8}
            transmission={0.5}
            thickness={0.4}
            envMapIntensity={1}
            emissive={i % 2 === 0 ? "#6644aa" : "#cc4488"}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 75 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        {/* 深色背景 */}
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 35, 70]} />
        
        {/* 柔和光照 */}
        <ambientLight intensity={0.3} />
        <pointLight position={[15, 15, 15]} intensity={0.8} color="#0099cc" distance={50} />
        <pointLight position={[-15, -15, -15]} intensity={0.6} color="#6644aa" distance={50} />
        <pointLight position={[0, 20, 0]} intensity={0.4} color="#cc4488" distance={40} />
        
        {/* 主粒子场（青色） */}
        <ParticleField />
        
        {/* 次要粒子场（紫色） */}
        <SecondaryParticles />
        
        {/* 浮动水晶 */}
        <FloatingCrystals />
      </Canvas>
    </div>
  );
}
