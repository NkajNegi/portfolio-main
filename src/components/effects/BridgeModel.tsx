import { ContactShadows, Environment, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { Suspense, useRef, useState } from 'react'
import * as THREE from 'three'

// --------------------------------------------------------
// ANIMATION KEYFRAMES (Pre-calculated for zero-allocation)
// --------------------------------------------------------
const keyframes = [
  {
    scale: 1.46,
    position: new THREE.Vector3(-13.1, -6.5, 10.2),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0.29, 0))
  },
  {
    scale: 1.71,
    position: new THREE.Vector3(-0.5, -12.0, 7.9),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.1, -1.5, 0.10))
  },
  {
    scale: 1.70,
    position: new THREE.Vector3(-1.5, -9.1, 20.0),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.15, -1.5, 0.50))
  },
  {
    scale: 1.32,
    position: new THREE.Vector3(-6.2, -16.0, 3.2),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.6, 2.40, 0))
  }
]

// Reusable quaternion to avoid Garbage Collection stutter during scroll
const currentQuat = new THREE.Quaternion()

function Model() {
  const { scene } = useGLTF('/baker_compressed.glb')
  const group = useRef<THREE.Group>(null)

  // Track the native page scroll
  const { scrollY } = useScroll()

  // Track if the model is covered by the content below the fold
  const [isVisible, setIsVisible] = useState(true)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    // Spacer is 1500svh, so at 15 * innerHeight it's completely covered
    const threshold = window.innerHeight * 15.0
    if (latest > threshold && isVisible) setIsVisible(false)
    if (latest <= threshold && !isVisible) setIsVisible(true)
  })

  // We use useFrame to update the model 60 times a second
  useFrame(() => {
    if (!group.current || !isVisible) return

    // We want the animation to complete BEFORE the Welcome section is fully revealed.
    // The spacer is 1500svh (15.0), so if we set maxScroll to 10.0, the animation finishes at 1000svh
    // and stays locked on Frame 4 for the remaining 500svh before the Welcome section comes up!
    const maxScroll = window.innerHeight * 10.0
    
    // Calculate a value between 0 (top of page) and 1 (scrolled past maxScroll)
    const scrollProgress = Math.min(Math.max(scrollY.get() / maxScroll, 0), 1)

    // Calculate which keyframes to interpolate between
    const totalSegments = keyframes.length - 1
    const progressIndex = scrollProgress * totalSegments
    const startIndex = Math.min(Math.floor(progressIndex), totalSegments - 1)
    const endIndex = startIndex + 1
    const localProgress = progressIndex - startIndex

    const startFrame = keyframes[startIndex]
    const endFrame = keyframes[endIndex]

    // Interpolate Scale
    const currentScale = THREE.MathUtils.lerp(startFrame.scale, endFrame.scale, localProgress)
    group.current.scale.setScalar(currentScale)

    // Interpolate Rotation (Zero-allocation!)
    currentQuat.slerpQuaternions(startFrame.quaternion, endFrame.quaternion, localProgress)
    group.current.setRotationFromQuaternion(currentQuat)

    // Interpolate Position
    group.current.position.lerpVectors(startFrame.position, endFrame.position, localProgress)
  })

  return (
    <group ref={group} visible={isVisible}>
      <primitive object={scene} />
    </group>
  )
}

export function BridgeModel() {
  return (
    <div className="fixed inset-0 z-0 h-[100svh] w-full pointer-events-none">
      {/* dpr={[1, 2]} clamps resolution to save massive amounts of GPU power */}
      <Canvas camera={{ position: [3, 11, 22], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <Model />
          {/* A shadow to ground the model */}
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/baker_compressed.glb')
