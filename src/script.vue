<script setup>
import * as THREE from 'three';
import CANNON from 'cannon';
import { ref } from 'vue';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

//Debug
const gui = new GUI();
const debugObject = {};

debugObject.createSphere = () =>
{
    createSphere(Math.random() * 0.5, {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3
    });
}

gui.add(debugObject, 'createSphere');




//Canvas
const canvas = document.querySelector('canvas.webgl');

//Scene
const scene = new THREE.Scene();

//Physics world
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

//Physics deault material
const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.1,
    restitution: 0.7
});
world.addContactMaterial(defaultContactMaterial);

//Floor physics
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

const objectsToUpdate = [];

//Create sphere (mesh and body)
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3, 
    roughness: 0.4,
    color: 0xff0000
});

const createSphere = (radius, position) => {
    //THREE.js
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    //Cannon.js body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape, 
        material: defaultMaterial
    });
    body.position.copy(position);
    world.addBody(body);
    
    //Save in objects array:
    objectsToUpdate.push({mesh, body})
}


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
    // sizes.width = 600;
    // sizes.height = 800;

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

    //Update physics world
    world.step(1 / 60, deltaTime, 3);

    for(const objects of objectsToUpdate)
    {
        objects.mesh.position.copy(objects.body.position);
        objects.mesh.quaternion.copy(objects.body.quaternion);
    }

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