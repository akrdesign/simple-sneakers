import "./style.css";

import { animate, inView } from "motion";
import {
    Scene,
    Clock,
    PerspectiveCamera,
    WebGLRenderer,
    TorusKnotGeometry,
    MeshStandardMaterial,
    Mesh,
    MeshBasicMaterial,
    AmbientLight,
    DirectionalLight,
    MeshLambertMaterial,
    Group
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { NoiseShader } from "./noise-shader";
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const sneakerTag = document.querySelector("section.sneaker");
const loaderTag = document.querySelector("div.loader");

animate("section.content p, section.content img", { opacity: 0 });
inView("section.content", (info) => {
  animate(info.target.querySelectorAll("p, img"), { opacity: 1 }, { duration: 1, delay: 1 });
});


let currentEffect = 0
let aimEffect = 0
let timeoutEffect

const clock = new Clock();

const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.add(camera)
camera.position.z = 2;


const renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000, 0)
sneakerTag.appendChild( renderer.domElement );

// LIGHTS
const ambientLight = new AmbientLight(0x404040)
camera.add(ambientLight)

const keyLight = new DirectionalLight(0xffffff, 1)
keyLight.position.set(-1, 1, 3)
camera.add(keyLight)

const fillLight = new DirectionalLight(0xffffff, 0.5)
fillLight.position.set(1, 1, 3)
camera.add(fillLight)

const backLight = new DirectionalLight(0xffffff, 1)
backLight.position.set(-1, 3, -1)
camera.add(backLight)

// const geometry = new TorusKnotGeometry( 1, 0.25, 100, 16 );
// const material = new MeshLambertMaterial( { color: 0x00ff00 } );
// const shape = new Mesh( geometry, material );

// LOAD MODEL
const gltfLoader = new GLTFLoader()

const loadGroup = new Group()
loadGroup.position.y = -10
// loadGroup.add(shape)

const scrollGroup = new Group()
scrollGroup.add(loadGroup)
scene.add( scrollGroup );

gltfLoader.load("sneaker.glb", (gltf) => {
  loadGroup.add(gltf.scene)

  animate(
    "header",
    {
      y: [-100, 0],
      opacity: [0, 1],
    },
    {
      duration: 1,
      delay: 2.5,
    }
  );
  
  animate(
    "section.new-drop",
    {
      y: [-100, 0],
      opacity: [0, 1],
    },
    {
      duration: 1,
      delay: 2,
    }
  );

  animate((t) => {
    loadGroup.position.y = -10 + 10 * t
  }, {
    duration: 2, delay: 1
  })

  animate(
    "div.loader",
    {
      y: "-100%"
    },
    {
      duration: 1, delay: 1
    }
  )
}, 
  (xhr) => {
    const p = Math.round((xhr.loaded / xhr.total) * 100)
    loaderTag.querySelector("span").innerHTML = p + "%"
  }, 
  (error) => {
    console.log("error", error)
  }
)


// CONTROLS
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = false
controls.enablePen = false
controls.autoRotate = true
controls.autoRotateSpeed = 2


// POST PROCESSING
const composer = new EffectComposer(renderer)

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const noisePass = new ShaderPass(NoiseShader)
noisePass.uniforms.time.value = clock.getElapsedTime();
noisePass.uniforms.effect.value = currentEffect
noisePass.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight
composer.addPass(noisePass)

const outputPass = new OutputPass();
composer.addPass( outputPass );

function render() {
  controls.update();
  scrollGroup.rotation.y = window.scrollY * 0.001

  currentEffect += (aimEffect - currentEffect) * 0.01;

  noisePass.uniforms.time.value = clock.getElapsedTime();
  noisePass.uniforms.effect.value = currentEffect
	requestAnimationFrame( render );
	composer.render()
}

const resize = () => {
  camera.aspect = window.innerWidth / window.innerHeight

  noisePass.uniforms.aspectRatio.value = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

const scroll = () => {
  clearTimeout(timeoutEffect)

  aimEffect = 1

  timeoutEffect = setTimeout(() => {
    aimEffect = 0
  }, 300)
}

window.addEventListener("resize", resize)
window.addEventListener("scroll", scroll)

render();
