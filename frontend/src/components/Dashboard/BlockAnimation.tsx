// Enhanced 3D Block Animation with Slower Speed and Improved Scattering
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Block {
  id: number;
  position: THREE.Vector3;
  scale: number;
  color: string;
  rotationSpeed: THREE.Vector3;
  isCentral?: boolean;
}

function generateRandomPosition(radius: number): THREE.Vector3 {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 2;
  return new THREE.Vector3(
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta)
  );
}

function DynamicBlocks() {
  const { viewport, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const blockRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const nextBlockId = useRef(0);
  const [centralBlockScale, setCentralBlockScale] = useState(2);
  const [isScattering, setIsScattering] = useState(false);
  const scatterTimeoutRef = useRef<NodeJS.Timeout>();
  const [mergeCount, setMergeCount] = useState(0);
  const [scatteredBlocks, setScatteredBlocks] = useState<Block[]>([]);

  // Initialize central block
  useEffect(() => {
    setBlocks([{
      id: nextBlockId.current++,
      position: new THREE.Vector3(0, 0, 0),
      scale: 2,
      color: '#00FFFF',
      rotationSpeed: new THREE.Vector3(0.002, 0.002, 0.002), // Slowed down rotation
      isCentral: true
    }]);
  }, []);

  // Spawn new blocks periodically (slower rate)
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (isScattering) return;
      const spawnRadius = 30;
      const newBlock: Block = {
        id: nextBlockId.current++,
        position: generateRandomPosition(spawnRadius),
        scale: 0.3 + Math.random() * 0.3,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`,
        rotationSpeed: new THREE.Vector3(
          (Math.random() * 0.01) - 0.005, // Slowed down rotation
          (Math.random() * 0.01) - 0.005,
          (Math.random() * 0.01) - 0.005
        )
      };
      setBlocks(prev => [...prev, newBlock]);
    }, 1000); // Slower spawn rate (1 second)
    return () => clearInterval(spawnInterval);
  }, [isScattering]);

  // Create scattered blocks when central block gets too large
  const createScatteredBlocks = (count: number, centralScale: number) => {
    const scatterRadius = viewport.width * 1.5; // Wider scatter
    const newBlocks: Block[] = [];
    
    // Create more scattered blocks based on central block size
    const scatterCount = Math.min(Math.floor(centralScale * 3), 20);
    
    for (let i = 0; i < scatterCount; i++) {
      newBlocks.push({
        id: nextBlockId.current++,
        position: generateRandomPosition(scatterRadius),
        scale: 0.5 + Math.random() * 0.8, // Slightly larger scattered blocks
        color: `hsl(${Math.random() * 360}, 100%, 60%)`,
        rotationSpeed: new THREE.Vector3(
          (Math.random() * 0.006) - 0.003,
          (Math.random() * 0.006) - 0.003,
          (Math.random() * 0.006) - 0.003
        )
      });
    }
    
    return newBlocks;
  };

  // Frame loop
  useFrame(() => {
    const centralBlock = blocks.find(b => b.isCentral);
    if (!centralBlock) return;

    // Apply central block scale directly in the frame loop
    const centralBlockRef = blockRefs.current.find((_, i) => 
      blocks[i] && blocks[i].isCentral
    );
    
    if (centralBlockRef && centralBlock.isCentral) {
      centralBlockRef.scale.set(centralBlockScale, centralBlockScale, centralBlockScale);
    }

    // Check if central block exceeds 40% of screen width
    const screenSizeThreshold = viewport.width * 0.4;
    const shouldScatter = centralBlockScale > screenSizeThreshold;

    if (shouldScatter && !isScattering) {
      setIsScattering(true);
      scatterTimeoutRef.current && clearTimeout(scatterTimeoutRef.current);

      // Create scattered blocks based on central block size
      const newScatteredBlocks = createScatteredBlocks(
        Math.floor(centralBlockScale * 2), 
        centralBlockScale
      );
      
      setScatteredBlocks(newScatteredBlocks);
      
      // Remove central block and add scattered blocks
      setBlocks(prev => {
        const nonCentralBlocks = prev.filter(b => !b.isCentral);
        return [...nonCentralBlocks, ...newScatteredBlocks];
      });

      // Visual explosion effect
      if (groupRef.current) {
        groupRef.current.scale.set(1.2, 1.2, 1.2);
        setTimeout(() => {
          if (groupRef.current) {
            groupRef.current.scale.set(1, 1, 1);
          }
        }, 200);
      }

      // Reset after scattering animation
      scatterTimeoutRef.current = setTimeout(() => {
        setCentralBlockScale(2);
        setIsScattering(false);
        setBlocks([{
          id: nextBlockId.current++,
          position: new THREE.Vector3(0, 0, 0),
          scale: 2,
          color: '#00FFFF',
          rotationSpeed: new THREE.Vector3(0.002, 0.002, 0.002),
          isCentral: true
        }]);
        setMergeCount(0);
        setScatteredBlocks([]);
      }, 3000); // Longer scatter duration
    }

    blocks.forEach((block, idx) => {
      const ref = blockRefs.current[idx];
      if (!ref) return;

      // Slower rotation
      ref.rotation.x += block.rotationSpeed.x * 0.7;
      ref.rotation.y += block.rotationSpeed.y * 0.7;
      ref.rotation.z += block.rotationSpeed.z * 0.7;

      if (!block.isCentral && !isScattering) {
        // Slower movement toward center
        const targetPos = new THREE.Vector3(0, 0, 0);
        ref.position.lerp(targetPos, 0.02); // Slower lerp factor

        const distance = ref.position.distanceTo(targetPos);
        if (distance < 1) {
          // Visual merge effect with significant size increase
          const scaleIncrease = block.scale * 1.0; // Increased from 0.25 to 1.0 for more noticeable growth
          setCentralBlockScale(prev => {
            const newScale = prev + scaleIncrease;
            console.log('Central block scale increased:', newScale); // For debugging
            return newScale;
          });
          
          // Flash effect on merge
          const centralBlockRef = blockRefs.current.find((_, i) => 
            blocks[i] && blocks[i].isCentral
          );
          
          if (centralBlockRef) {
            const originalColor = (centralBlockRef.material as THREE.MeshPhongMaterial).color.clone();
            (centralBlockRef.material as THREE.MeshPhongMaterial).color.set('#FFFFFF');
            setTimeout(() => {
              if (centralBlockRef) {
                (centralBlockRef.material as THREE.MeshPhongMaterial).color.copy(originalColor);
              }
            }, 100);
            
            // Force apply scale to ensure it updates visually
            const centralBlockIdx = blocks.findIndex(b => b.isCentral);
            if (centralBlockIdx >= 0) {
              centralBlockRef.scale.set(centralBlockScale + scaleIncrease, centralBlockScale + scaleIncrease, centralBlockScale + scaleIncrease);
            }
          }
          
          setMergeCount(prev => prev + 1);
          setBlocks(prev => prev.filter(b => b.id !== block.id));
        }
      } else if (isScattering) {
        // Move scattered blocks to their target positions
        const targetPos = block.position;
        ref.position.lerp(targetPos, 0.05);
      }

      // Pulse central block color more subtly
      if (block.isCentral) {
        const hue = (Date.now() * 0.05) % 360; // Slower color cycle
        (ref.material as THREE.MeshPhongMaterial).color.set(`hsl(${hue}, 100%, 70%)`);
      }
    });

    // Smoother camera adjustment based on central block size
    if (centralBlock) {
      const targetZoom = 20 + (centralBlockScale * 0.5);
      camera.position.lerp(new THREE.Vector3(targetZoom, targetZoom, targetZoom), 0.01); // Slower camera movement
    }
  });

  return (
    <group ref={groupRef}>
      {blocks.map((block, idx) => (
        <mesh
          key={block.id}
          ref={el => (blockRefs.current[idx] = el)}
          castShadow
          receiveShadow
          position={block.position.clone()}
          scale={block.isCentral ? centralBlockScale : block.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshPhongMaterial
            color={block.color}
            transparent
            opacity={0.9}
            shininess={100}
            specular={new THREE.Color('white')}
          />
        </mesh>
      ))}
      
      {/* Debug display for central block scale */}
      <mesh position={[0, -5, 0]} visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

export function BlockAnimation() {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas shadows camera={{ position: [20, 20, 20], fov: 60 }}>
        <PerspectiveCamera makeDefault position={[20, 20, 20]} />
        <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={0.3} /> {/* Slower auto-rotation */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
        <DynamicBlocks />
      </Canvas>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-4 left-4 text-white text-lg bg-black bg-opacity-50 p-4 rounded-lg"
      >
        <p className="font-bold">3D Block Fusion</p>
        <p className="text-sm text-gray-300">Blocks merge into the center and scatter after reaching critical mass.</p>
        <p className="text-xs mt-2">Use your mouse to rotate, pan, and zoom the view.</p>
      </motion.div>
    </div>
  );
}