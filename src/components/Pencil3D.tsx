import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import styled from 'styled-components';

const PencilContainer = styled.div`
  position: fixed;
  right: -50px;
  top: -20px;
  width: 300px;
  height: 400px;
  cursor: pointer;
  transform-origin: top right;
  transition: transform 0.3s ease;
  z-index: 9999;

  &:hover {
    transform: scale(1.1);
  }
`;

const ClickableArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
`;

function PencilModel() {
  const { scene } = useGLTF('/src/assets/models/pencil.glb');
  
  return (
    <primitive 
      object={scene} 
      scale={12}
      rotation={[-Math.PI / 6, Math.PI / 4, Math.PI / 6]}
      position={[0, 2, 0]}
    />
  );
}

const Pencil3D: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <PencilContainer>
      <ClickableArea 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} />
        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.4} />
        <Suspense fallback={null}>
          <group rotation={[0, isHovered ? Math.PI * 2 : 0, 0]}>
            <PencilModel />
          </group>
        </Suspense>
        {isHovered && <OrbitControls 
          enableZoom={false}
          autoRotate
          autoRotateSpeed={4}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />}
      </Canvas>
    </PencilContainer>
  );
};

export default Pencil3D;