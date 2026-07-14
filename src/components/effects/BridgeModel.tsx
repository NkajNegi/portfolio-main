import { ContactShadows, Environment, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useScroll } from 'framer-motion'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'

function Model() {
  const { scene } = useGLTF('/baker_and_the_bridge.glb')
  const group = useRef<THREE.Group>(null)

  // Track the native page scroll
  const { scrollY } = useScroll()

  const { override, scale, posX, posY, posZ, rotX, rotY, rotZ } = useControls('Find Next Frame', {
    override: { value: true, label: 'Override Scroll' },
    scale: { value: 1.70, min: 0.01, max: 2, step: 0.01 },
    posX: { value: -1.5, min: -20, max: 20, step: 0.1 },
    posY: { value: -9.1, min: -20, max: 20, step: 0.1 },
    posZ: { value: 20.0, min: -20, max: 20, step: 0.1 },
    rotX: { value: 0.15, min: -Math.PI, max: Math.PI, step: 0.05 },
    rotY: { value: -1.5, min: -Math.PI, max: Math.PI, step: 0.05 },
    rotZ: { value: 0.50, min: -Math.PI, max: Math.PI, step: 0.05 },
  })

  // --------------------------------------------------------
  // ANIMATION KEYFRAMES
  // --------------------------------------------------------
  
  const keyframes = [
    {
      // Frame 1 (Start / Top of page)
      scale: 1.46,
      position: new THREE.Vector3(-13.1, -6.5, 10.2),
      rotation: new THREE.Euler(-0.5, 0.29, 0)
    },
    {
      // Frame 2
      scale: 1.71,
      position: new THREE.Vector3(-0.5, -12.0, 7.9),
      rotation: new THREE.Euler(-0.1, -1.5, 0.10)
    },
    {
      // Frame 3
      scale: 1.70,
      position: new THREE.Vector3(-1.5, -9.1, 20.0),
      rotation: new THREE.Euler(0.15, -1.5, 0.50)
    },
    {
      // Frame 4
      scale: 1.32,
      position: new THREE.Vector3(-6.2, -16.0, 3.2),
      rotation: new THREE.Euler(-0.6, 2.40, 0)
    }
  ]

  // We use useFrame to update the model 60 times a second
  useFrame(() => {
    if (!group.current) return

    // If override is enabled via Leva, ignore scrolling and use the Leva sliders directly
    if (override) {
      group.current.scale.setScalar(scale)
      group.current.position.set(posX, posY, posZ)
      group.current.rotation.set(rotX, rotY, rotZ)
      return
    }

    // We want the animation to complete BEFORE the Welcome section is fully revealed.
    // The spacer is 1500svh (15.0), so if we set maxScroll to 12.0, the animation finishes at 1200svh
    // and stays locked on Frame 4 for the remaining 300svh before the Welcome section comes up!
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

    // Interpolate Rotation
    const startQuat = new THREE.Quaternion().setFromEuler(startFrame.rotation)
    const endQuat = new THREE.Quaternion().setFromEuler(endFrame.rotation)
    const currentQuat = new THREE.Quaternion().slerpQuaternions(startQuat, endQuat, localProgress)
    group.current.setRotationFromQuaternion(currentQuat)

    // Interpolate Position
    group.current.position.lerpVectors(startFrame.position, endFrame.position, localProgress)
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

export function BridgeModel() {
  return (
    // Changed to pointer-events-none since we are no longer dragging the model
    <div className="fixed inset-0 z-0 h-[100svh] w-full pointer-events-none">
      <Canvas camera={{ position: [3, 11, 22], fov: 45 }} dpr={[3, 8]}>
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

useGLTF.preload('/baker_and_the_bridge.glb')
