import * as THREE from 'three';
import { createRoot } from 'react-dom/client';
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, ThreeElements, Vector3 } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { IMUData, Quaternion } from '@/types/binding';

interface ModelProps {
  orientation: Quaternion;
  position: Vector3;
}

function Model({ orientation, position }: ModelProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometry = useLoader(STLLoader, '../../public/AS5600Mount_nema17.stl');

  // Compute quaternion to rotate the model
  const quaternion = useMemo(() => {
    return new THREE.Quaternion(
      orientation.x,
      orientation.y,
      orientation.z,
      orientation.w
    );
  }, [orientation.x, orientation.y, orientation.z, orientation.w]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.setFromQuaternion(quaternion);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={position}>
      <meshStandardMaterial color="#2f74c0" />
    </mesh>
  );
}

export const IMUDisplay = ({ imu }: { imu?: IMUData }) => {
  return (
    <div
      className="w-80 h-80 rounded-[50%]"
      style={{
        border: '5px solid teal',
        overflow: 'hidden',
        background: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {imu?.orientation && <Model position={[0, 0, 0]} orientation={imu.orientation} />}
      </Canvas>
    </div>
  );
};
