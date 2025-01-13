<script setup>
import * as THREE from 'three';
import CANNON from 'cannon';
import { ref } from 'vue';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'dat.gui';


//Canvas
const canvas = document.querySelector('canvas.webgl');

//Scene
const scene = new THREE.Scene();

//Create sphere - mesh
// const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
// const sphereMaterial = new THREE.MeshStandardMaterial({
//     metalness: 0.3, 
//     roughness: 0.4,
//     color: 0xff0000
// });

//Light
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

//Sizes
const sizes = {
    width: 600, 
    height: 800
}
window.addEventListener('resize', () => {
    //Update sizes
    sizes.width = 600;
    sizes.height = 800;

    //Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    //Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
   
});

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-3, 3, 3);
scene.add(camera);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);

//Animate
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
    //Clock
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    //Update controls
    controls.update();

    //Render
    renderer.render(scene, camera);

    //Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();









</script>
<template>

</template>