import { Canvas as NativeCanvas } from '@react-three/fiber/native';
import { Canvas as WebCanvas, useFrame } from '@react-three/fiber';
import { Platform, StyleSheet, View } from 'react-native';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type BattlefieldProps = {
  aim: { x: number; y: number };
  moving: boolean;
  enemyCount: number;
  tutorial: boolean;
  pulseCount: number;
};

const crystalSites: [number, number, number, number][] = [
  [-8, 0, -13, 2.7], [-5, 0, -7, 1.7], [-2, 0, -18, 3.4], [2, 0, -10, 2.1],
  [5, 0, -16, 3.1], [8, 0, -8, 1.6], [-9, 0, -3, 1.3], [10, 0, -21, 3.7],
];

function Crystal({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.22;
    ref.current.position.y = Math.sin(clock.elapsedTime * 1.1 + position[0]) * 0.06 + scale / 2;
  });
  return (
    <mesh ref={ref} position={[position[0], scale / 2, position[2]]} scale={[0.55 * scale, scale, 0.55 * scale]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#15D7C3" emissive="#0CA796" emissiveIntensity={1.7} roughness={0.2} metalness={0.5} />
    </mesh>
  );
}

function Walker({ index }: { index: number }) {
  const group = useRef<THREE.Group>(null!);
  const x = [-3.2, 0.5, 4][index] ?? 0;
  useFrame(({ clock }) => {
    group.current.position.x = x + Math.sin(clock.elapsedTime * 0.65 + index) * 0.35;
    group.current.position.y = Math.sin(clock.elapsedTime * 1.5 + index) * 0.05;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.8 + index) * 0.18;
  });
  return (
    <group ref={group} position={[x, 0.8, -10 - index * 2]}>
      <mesh castShadow position={[0, 0.8, 0]}><boxGeometry args={[1.1, 0.75, 0.9]} /><meshStandardMaterial color="#232E38" metalness={0.85} roughness={0.25} /></mesh>
      <mesh castShadow position={[0, 1.4, 0.1]}><boxGeometry args={[0.55, 0.48, 0.52]} /><meshStandardMaterial color="#74889A" metalness={0.75} roughness={0.2} /></mesh>
      <mesh position={[0, 1.42, 0.39]}><sphereGeometry args={[0.12, 16, 16]} /><meshBasicMaterial color="#FF7758" /></mesh>
      {[-0.43, 0.43].map((legX) => <mesh key={legX} position={[legX, 0.25, 0]} rotation={[0, 0, legX * 0.25]}><boxGeometry args={[0.16, 1.05, 0.18]} /><meshStandardMaterial color="#111920" metalness={0.9} /></mesh>)}
    </group>
  );
}

function Pulse() {
  const ring = useRef<THREE.Mesh>(null!);
  const launchedAt = useRef<number | null>(null);
  useFrame(({ clock }) => {
    launchedAt.current ??= clock.elapsedTime;
    const age = Math.min(1, (clock.elapsedTime - launchedAt.current) / 0.55);
    ring.current.position.z = 3 - age * 14;
    ring.current.scale.setScalar(0.3 + age * 3.2);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 1 - age;
  });
  return <mesh ref={ring} position={[0, 1.5, 3]} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[0.26, 0.38, 28]} /><meshBasicMaterial color="#8DFFF1" transparent opacity={0} /></mesh>;
}

function Scene({ aim, moving, enemyCount, tutorial, pulseCount }: BattlefieldProps) {
  const cameraRig = useRef<THREE.Group>(null!);
  const stars = useMemo(() => Array.from({ length: 70 }, (_, index) => ({
    x: ((index * 47) % 37) - 18, y: 4 + ((index * 31) % 16) / 2, z: -24 - ((index * 17) % 24),
  })), []);

  useFrame(({ clock }) => {
    const sway = moving ? Math.sin(clock.elapsedTime * 8) * 0.035 : 0;
    cameraRig.current.rotation.y = aim.x * -0.009;
    cameraRig.current.rotation.x = aim.y * -0.006;
    cameraRig.current.position.y = 1.5 + sway;
  });

  return (
    <>
      <color attach="background" args={['#04101A']} />
      <fog attach="fog" args={['#09212D', 9, 35]} />
      <ambientLight intensity={0.42} color="#6FD3E9" />
      <directionalLight position={[6, 10, 5]} intensity={2.2} color="#A9FFF3" castShadow />
      <pointLight position={[-5, 3, -9]} intensity={24} distance={13} color="#14D6C3" />
      <pointLight position={[4, 2, -12]} intensity={10} distance={10} color="#FF7056" />
      <group ref={cameraRig}>
        <mesh position={[0.6, -0.35, 1.7]} rotation={[0.3, 0.7, 0]}>
          <icosahedronGeometry args={[0.36, 2]} />
          <meshStandardMaterial color="#22D4C6" emissive="#0A897E" emissiveIntensity={2} roughness={0.12} metalness={0.5} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[65, 65, 32, 32]} />
        <meshStandardMaterial color="#0A2833" roughness={0.86} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.07, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.2, 32]} />
        <meshBasicMaterial color="#0D9E98" transparent opacity={0.19} />
      </mesh>
      {crystalSites.map(([x, , z, scale]) => <Crystal key={`${x}-${z}`} position={[x, 0, z]} scale={scale} />)}
      {tutorial ? [-4, 0, 4].map((x, index) => <group key={x} position={[x, 1.7, -9 - index * 2]}><mesh><octahedronGeometry args={[0.45, 1]} /><meshStandardMaterial color="#9FFFF2" emissive="#20D9C4" emissiveIntensity={2.5} /></mesh><pointLight color="#2CE0C6" intensity={8} distance={5} /></group>) : Array.from({ length: enemyCount }).map((_, index) => <Walker key={index} index={index} />)}
      <group position={[0, 9, -25]}><mesh><sphereGeometry args={[4.3, 32, 32]} /><meshBasicMaterial color="#123646" /></mesh><mesh position={[0.5, 0.1, 4]}><torusGeometry args={[5.6, 0.12, 8, 64]} /><meshBasicMaterial color="#2CE0C6" transparent opacity={0.5} /></mesh></group>
      {stars.map((star, index) => <mesh key={index} position={[star.x, star.y, star.z]}><sphereGeometry args={[0.028, 5, 5]} /><meshBasicMaterial color="#C7FFF8" /></mesh>)}
      {pulseCount > 0 ? <Pulse key={pulseCount} /> : null}
    </>
  );
}

export function AlienBattlefield(props: BattlefieldProps) {
  const Canvas = (Platform.OS === 'web' ? WebCanvas : NativeCanvas) as typeof NativeCanvas;
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}><Canvas shadows camera={{ position: [0, 1.5, 6], fov: 68 }}><Scene {...props} /></Canvas></View>;
}