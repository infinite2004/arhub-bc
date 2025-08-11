"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Text } from "@react-three/drei"
import type * as THREE from "three"

export default function ModelViewer() {
  const boxRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.x += delta * 0.5
      boxRef.current.rotation.y += delta * 0.5
    }
  })

  return (
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
  )
}
