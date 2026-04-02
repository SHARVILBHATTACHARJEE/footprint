import React, { useRef } from 'react';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';

function Model({ url }) {
    const { scene } = useGLTF(url);
    const ref = useRef();
    
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        ref.current.rotation.y = Math.sin(t / 4) / 4;
        ref.current.position.y = Math.sin(t / 1.5) / 10;
    });

    return <primitive object={scene} ref={ref} scale={1} />;
}

export default function ShoeModel({ url }) {
    return (
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />
            <React.Suspense fallback={null}>
                <Model url={url} />
                <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
            </React.Suspense>
            <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} enableZoom={true} minDistance={2} maxDistance={10} minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} />
        </Canvas>
    );
}
