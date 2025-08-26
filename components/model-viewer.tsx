"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Text, OrbitControls, Environment, useGLTF } from "@react-three/drei";
import type * as THREE from "three";

function GLB({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ModelViewer(props: { url?: string }) {
  const boxRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.x += delta * 0.5;
      boxRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <>
      {props.url ? (
        <>
          <ambientLight intensity={0.7} />
          <Environment preset="city" />
          <OrbitControls />
          <GLB url={props.url} />
        </>
      ) : (
        <>
          <Box ref={boxRef} args={[1, 1, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#4f46e5" />
          </Box>
          <Text position={[0, -1.5, 0]} fontSize={0.2} color="#000000" anchorX="center" anchorY="middle">
            3D Model Preview
          </Text>
          <Text position={[0, -1.8, 0]} fontSize={0.1} color="#666666" anchorX="center" anchorY="middle">
            Actual model will be displayed here
          </Text>
        </>
      )}
    </>
  );
}
