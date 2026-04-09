import React, { useRef } from 'react';
import { useGLTF, OrbitControls, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';

function Loader() {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[#00ff88] font-mono font-bold text-lg mb-4 uppercase tracking-widest animate-pulse">
                    Loading 3D Model
                </div>
                <div className="w-[200px] h-[6px] bg-[#333] rounded-full overflow-hidden border border-[#444]">
                    <div 
                        className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc66] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-[#00ff88] font-mono text-xs mt-2 font-bold z-10 w-full text-center">
                    {progress.toFixed(0)}%
                </div>
            </div>
        </Html>
    );
}

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
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />
            <React.Suspense fallback={<Loader />}>
                <Model url={url} />
                <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
            </React.Suspense>
            <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} enableZoom={true} minDistance={1.5} maxDistance={10} minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} />
        </Canvas>
    );
}
