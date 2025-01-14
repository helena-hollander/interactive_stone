<script setup>
import * as THREE from 'three';
import CANNON from 'cannon';
import { ref } from 'vue';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import GUI from 'lil-gui';
//import model from './assets/models/sten2.glb';

//Debug
const gui = new GUI();
const debugObject = {};

debugObject.createSphere = () =>
{
    createSphere(Math.random() * 0.2, { //Her styres størrelsen på kuglen
        x: (Math.random() - 0.5) * 3, //Placeringen af kuglen
        y: 0.5, //Falder fra denne højde
        z: (Math.random() - 0.5) * 3
        
    });

}

gui.add(debugObject, 'createSphere');




//Canvas
const canvas = document.querySelector('canvas.webgl');

//Scene
const scene = new THREE.Scene();


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );



// Load a glTF resource
loader.load(
	// resource URL
	'/models/sten2.glb',
	// called when the resource is loaded
	function ( gltf ) {

		scene.add( gltf.scene );

		// gltf.animations; // Array<THREE.AnimationClip>
		// gltf.scene; // THREE.Group
		// gltf.scenes; // Array<THREE.Group>
		// gltf.cameras; // Array<THREE.Camera>
		// gltf.asset; // Object

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);




//Physics world
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

//Physics deault material
const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.1,
    restitution: 0.9
});
world.defaultContactMaterial = defaultContactMaterial;

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
    metalness: 0.8, 
    roughness: 0.4,
    color: 0xdd0000
});

const createSphere = (radius, position) => {
    //THREE.js
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    //Cannon.js body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 1, 0),
        shape, 
        material: defaultMaterial
    });
    body.position.copy(position);
    world.addBody(body);
    
    //Save in objects array:
    objectsToUpdate.push({mesh, body})
}

//Floor mesh
const floorGeometry = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 20),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.4
    })
);
floorGeometry.rotation.x = -Math.PI * 0.5;
floorGeometry.receiveShadow = true;
scene.add(floorGeometry);

//Light
const ambientLight = new THREE.AmbientLight(0x4466ff, 2.1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfb6989, 1.7);
dirLight.position.set(0, 8, 15);
dirLight.castShadow = true;
dirLight.shadow.camera.far = 35; //Længden af skyggen
scene.add(dirLight);

//Sizes
const sizes = {
    width: 1080/3, 
    height: 2340/3

    //2340x1080
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
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 10, 0);
camera.rotation.x = -Math.PI * 0.5;
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