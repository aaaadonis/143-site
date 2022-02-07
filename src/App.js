import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Canvas,
  extend,
  useFrame,
  useLoader,
  useThree,
} from "react-three-fiber";
import Heart from "./imgs/heart.png";
import { Suspense, useCallback, useMemo, useRef, useState, memo } from "react";
import Mix from "./vday.mp3";
import React from 'react';


extend({ OrbitControls });

function CameraControls() {
  const {
    camera,
    gl: { domElement },
  } = useThree();

  const controlsRef = useRef();
  useFrame(() => controlsRef.current.update());

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, domElement]}
      autoRotate
      autoRotateSpeed={-0.2}
    />
  );
}

function HeartCenter() {
  const heartShape = new THREE.Shape();
  const heartRef = useRef();

  heartShape.moveTo(-25 / 3, -25 / 3);
  heartShape.bezierCurveTo(-25 / 3, -25 / 3, -35 / 3, 0, 0, 0);
  heartShape.bezierCurveTo(30 / 3, 0, 30 / 3, -35 / 3, 30 / 3, -35 / 3);
  heartShape.bezierCurveTo(30 / 3, -55 / 3, 10 / 3, -77 / 3, -25 / 3, -95 / 3);
  heartShape.bezierCurveTo(
    -60 / 3,
    -77 / 3,
    -80 / 3,
    -55 / 3,
    -80 / 3,
    -35 / 3
  );
  heartShape.bezierCurveTo(-80 / 3, -35 / 3, -80 / 3, 0 / 3, -50 / 3, 0);
  heartShape.bezierCurveTo(-35 / 3, 0, -25 / 3, -25 / 3, -25 / 3, -25 / 3);

  const extrudeSettings = {
    depth: 8,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1,
  };

  const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());

  return (
    <mesh geometry={geometry} position={[6, 35, -8]}>
      <meshBasicMaterial attach="material" color={0xc00000} />
    </mesh>
  );
}

function Points() {
  const imgTex = useLoader(THREE.TextureLoader, Heart);
  const bufferRef = useRef();

  let t = 0;
  let f = 0.002;
  let a = 3;
  const graph = useCallback(
    (x, z) => {
      return Math.sin(f * (x ** 2 + z ** 2 + t)) * a;
    },
    [t, f, a]
  );

  const count = 100;
  const sep = 3;
  let positions = useMemo(() => {
    let positions = [];

    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = sep * (xi - count / 2);
        let z = sep * (zi - count / 2);
        let y = graph(x, z);
        positions.push(x, y, z);
      }
    }

    return new Float32Array(positions);
  }, [count, sep, graph]);

  useFrame(() => {
    t += 15;

    const positions = bufferRef.current.array;

    let i = 0;
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = sep * (xi - count / 2);
        let z = sep * (zi - count / 2);

        positions[i + 1] = graph(x, z);
        i += 3;
      }
    }

    bufferRef.current.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          ref={bufferRef}
          attachObject={["attributes", "position"]}
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        attach="material"
        map={imgTex}
        color={0xff8896}
        size={0.5}
        sizeAttenuation
        transparent={false}
        alphaTest={0.0}
        opacity={0.0}
      />
    </points>
  );
}

function AnimationCanvas() {
  return (
    <Canvas
      colorManagement={false}
      camera={{ position: [100, 10, 0], fov: 75 }}
    >
      <Suspense fallback={null}>
        <Points />
        <HeartCenter />
      </Suspense>
      <CameraControls />
    </Canvas>
  );
}

const MemoCanvas = React.memo(AnimationCanvas);


function App() {
  const [toggle, setToggle] = useState(true);
  const toggler = () => setToggle(!toggle);

  const mixRef = useRef();
  const mixPlay = () => {
    mixRef.current.play();
  }

  return (
    <div className="anim">
      <Suspense fallback={<div>Loading...</div>}>
        <MemoCanvas />
      </Suspense>
      <audio id="myAudio" src={Mix} autoPlay={!toggle} loop ref={mixRef}/>
      {toggle ? (
        <div id="overlay">
          <button
            id="startButton"
            onClick={function () {
              toggler();
              mixPlay();
            }}
          >
            Play
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
export default App;
