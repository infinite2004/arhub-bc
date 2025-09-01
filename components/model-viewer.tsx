"use client";
import { useRef, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { 
  Box, 
  Text, 
  OrbitControls, 
  Environment, 
  useGLTF, 
  Html, 
  PerspectiveCamera,
  Grid,
  Stats
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

function GLB({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  
  // Center and scale the model
  const box = new THREE.Box3().setFromObject(scene);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;
  
  scene.position.sub(center);
  scene.scale.setScalar(scale);
  
  return <primitive object={scene} />;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </Html>
  );
}

function ErrorMessage() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-xs text-center">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-lg">!</span>
        </div>
        <div>
          <p className="text-sm font-medium text-red-800">Failed to load model</p>
          <p className="text-xs text-red-600 mt-1">Please check the file format and try again</p>
        </div>
      </div>
    </Html>
  );
}

function DefaultScene() {
  const boxRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.x += delta * 0.3;
      boxRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Box 
        ref={boxRef} 
        args={[1, 1, 1]} 
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={hovered ? "#4f46e5" : "#6366f1"} 
          metalness={0.3}
          roughness={0.4}
        />
      </Box>
      
      <Text 
        position={[0, -1.5, 0]} 
        fontSize={0.2} 
        color="#374151" 
        anchorX="center" 
        anchorY="middle"
      >
        3D Model Preview
      </Text>
      <Text 
        position={[0, -1.8, 0]} 
        fontSize={0.1} 
        color="#6b7280" 
        anchorX="center" 
        anchorY="middle"
      >
        Upload a model to see it here
      </Text>
      
      <Grid 
        args={[10, 10]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#e5e7eb" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#d1d5db" 
        fadeDistance={25} 
        fadeStrength={1} 
        followCamera={false} 
        infiniteGrid={true} 
      />
    </>
  );
}

function ModelScene({ url }: { url: string }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      <spotLight 
        position={[0, 10, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={0.8} 
        castShadow 
      />
      
      <Environment preset="studio" />
      
      <Suspense fallback={<LoadingSpinner />}>
        <GLB url={url} />
      </Suspense>
      
      <Grid 
        args={[10, 10]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#e5e7eb" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#d1d5db" 
        fadeDistance={25} 
        fadeStrength={1} 
        followCamera={false} 
        infiniteGrid={true} 
      />
    </>
  );
}

export default function ModelViewer(props: { url?: string }) {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [3, 3, 3], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true
        }}
        onError={handleError}
      >
        <PerspectiveCamera makeDefault position={[3, 3, 3]} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
          autoRotate={false}
          autoRotateSpeed={1}
          dampingFactor={0.05}
          enableDamping={true}
        />
        
        {error ? (
          <ErrorMessage />
        ) : props.url ? (
          <ModelScene url={props.url} />
        ) : (
          <DefaultScene />
        )}
        
        {/* Performance stats in development */}
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
      
      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="text-xs text-gray-600 space-y-1">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>🖱️ Right drag to pan</div>
        </div>
      </div>
    </div>
  );
}
