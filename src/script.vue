<script setup>
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { ref } from 'vue';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import GUI from 'lil-gui';



//Mouse move
let mousePosition = { x: 0, y: 0 };

// Function to get mouse position
const getMousePosition = (event) => {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
    //console.log(`Mouse position: X=${mousePosition.x}, Y=${mousePosition.y}`);

    // Wake up all bodies in the physics world
    world.bodies.forEach((body) => {
        body.wakeUp();
    });
};

// Add event listener for mousemove
window.addEventListener('mousemove', getMousePosition);

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


//Load stone
let stoneModel = null;

//Sizes
const sizes = {
    width: 1080/3, 
    height: 2340/3,

    //2340x1080
}


//Canvas
const canvas = document.querySelector('canvas.webgl');


//Scene
const scene = new THREE.Scene();

//Sound
const hitSound = new Audio('/sounds/tinystone.mp3');
const playHitSound = (collision) => {

    const impactStrength = collision.contact.getImpactVelocityAlongNormal();
    //console.log(impactStrength);

    if(impactStrength > 3)
    {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        hitSound.play();
    }
   
}

//Axes helper
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);


//Physics world
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0); //Gravity



//Physics deault material
const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.7,
    restitution: 0
});
world.defaultContactMaterial = defaultContactMaterial;

const colors = [
    0xff2222, // Red
    0x22ff22, // Green
    0x2222ff, // Blue
    0xffff22, // Yellow
    0xff22ff  // Magenta
];

//Def loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco copy/');

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

// Load a glTF resource


loader.load(
	// resource URL
	'/models/sten_tex2.glb',
	// called when the resource is loaded
	function ( gltf ) {

        stoneModel = gltf.scene;
        console.log(stoneModel);
        //createStone();

        stoneModel.traverse((child) => {
            if (child.isMesh) {
                child.material.roughness = 0.02; // Set the desired roughness value
                child.material.metalness = 0.1; // Set the desired metalness value
                child.material.color = new THREE.Color(0x9fcbe0); // Set the desired color
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
 
        // gltf.scene.scale.set(0.5, 0.9, 0.5);
        // gltf.scene.position.set(0, 1, 0);
		//scene.add( gltf.scene );

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

// const stoneGeometry = stoneModel;
// const stoneMaterial = new THREE.MeshStandardMaterial({
//     metalness: 2, 
//     roughness: 0,
//     color: 0xdd0000
// });

const objectsToUpdate = [];



const createStone = (position, radius) => {
    if(!stoneModel) return;
    // Clone the stone model
    const stone = stoneModel.clone();
    stone.scale.set(radius, radius, radius*0.8);
    stone.position.copy(position);
    scene.add(stone);

    // Cannon.js body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(position.x, position.y, position.z),
        scale: new CANNON.Vec3(radius, radius, radius*0.4),
        shape,
        material: defaultMaterial
    });
    body.position.copy(position);
    body.addEventListener('collide', playHitSound);
    console.log(body);
    world.addBody(body);
    objectsToUpdate.push({mesh:stone, body});
};


canvas.addEventListener('click', () => {
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
    );
    const radius = Math.random() * 0.3 + 0.04; //Størrelse på sten - * styrrer de helt store, + styrrer at de ikke bliver alt for små
    createStone(position, radius);
    console.log('click', stoneModel);
});





//Floor physics
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);


// Walls physics
const createWall = (position, rotation) => {
    const wallShape = new CANNON.Plane();
    const wallBody = new CANNON.Body({
        mass: 0,
        shape: wallShape,
        material: defaultMaterial,
        axesHelper: true
    });
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotation); // Rotate the wall to be vertical
    wallBody.position.copy(position);
    world.addBody(wallBody);
}

createWall({x: sizes.width *0.01 *0.5, y: 0, z: 0}, - Math.PI * 0.5);
createWall({x: -sizes.width *0.01 *0.5, y: 0, z: 0}, Math.PI * 0.5);
createWall({x: 0, y: 0, z: sizes.height *0.01 *0.5}, Math.PI);
createWall({x: 0, y: 0, z: -sizes.height *0.01 *0.5}, 0);




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
        position: new CANNON.Vec3(0, 4, 0),
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
    new THREE.PlaneGeometry(sizes.width * 0.01, sizes.height * 0.01),
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
const ambientLight = new THREE.AmbientLight(0x66aaff, 5.1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(2, 8, 4);
dirLight.castShadow = true;
dirLight.shadow.camera.far = 35; //Længden af skyggen
scene.add(dirLight);
const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight2.position.set(-2, 8, -4);
dirLight2.castShadow = true;
dirLight2.shadow.camera.far = 35; //Længden af skyggen
scene.add(dirLight2);



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
camera.position.set(0, 17.5, 0);
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

      // Map mouse position to gravity values
      const gravityX = (mousePosition.x / window.innerWidth - 0.5) * 20; // Adjust the multiplier as needed
    const gravityZ = (mousePosition.y / window.innerHeight - 0.5) * 20; // Adjust the multiplier as needed

    // Update the physics world gravity
    world.gravity.set(gravityX, -9.82, gravityZ);

    //Update physics world
    world.step(1 / 60, deltaTime, 3);

    for(const objects of objectsToUpdate)
    {
        objects.mesh.position.copy(objects.body.position);
        objects.mesh.quaternion.copy(objects.body.quaternion);
    }


    //Update controls
    controls.update();

    //cannonDebugRenderer.update(); 

    //Render
    renderer.render(scene, camera);

    //Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();









</script>
<template>

</template>