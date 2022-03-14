// import './style.css'

// document.querySelector('#app').innerHTML = `
//   <h1>Hello Vite!</h1>
//   <h1>Hello Jake!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `

// Find the latest version by visiting https://cdn.skypack.dev/three.

import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

//dat.gui
import * as dat from "dat.gui";
// console.log(dat)

const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50,
  },
};

gui.add(world.plane, "width", 1, 500).onChange(generatePlane);
gui.add(world.plane, "height", 1, 500).onChange(generatePlane);
gui.add(world.plane, "widthSegments", 1, 100).onChange(generatePlane);
gui.add(world.plane, "heightSegments", 1, 100).onChange(generatePlane);

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  )

//vertices position randomization

const { array } = planeMesh.geometry.attributes.position;
const randomValues = []

for (let i = 0; i < array.length; i++) {

  if (i%3 === 0) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];
    // console.log(array[i])
    // console.log(i)
    // console.log(x, y, z)
  
    //randomize
    // array[i] = x + 2
    // console.log(x, y, z)
    array[i] = x + (Math.random() - 0.5)*3;
    array[i+1] = y + (Math.random() - 0.5)*3;
    array[i + 2] = z + (Math.random() - 0.5)*3;
  }

  randomValues.push(Math.random() * Math.PI * 2)
}
// console.log(randomValues)


planeMesh.geometry.attributes.position.randomValues = randomValues
//create new property called "originalPosition" by cloning the current array
planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array


  const colors = [];

  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    // console.log(i)
    colors.push(0, 0.19, 0.4);
  }
  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

//create Scene
const scene = new THREE.Scene();

//call raycaster
const raycaster = new THREE.Raycaster();

//create camera
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);

//create renderer
const renderer = new THREE.WebGLRenderer();

// console.log(scene);
// console.log(camera);
// console.log(renderer);

renderer.setSize(window.innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments);
// const planeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide} )

//Phong requires the light
// const planeMaterial = new THREE.MeshPhongMaterial({color: 0xff0000, side: THREE.DoubleSide, flatShading: THREE.FlatShading, vertexColors: true} )
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

// console.log(planeGeometry);
console.log(planeMesh.geometry.attributes.position.array);

scene.add(planeMesh)
generatePlane()

// color attribute addition
// const colors = [];

// for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
//   // console.log(i)
//   colors.push(0, 0.19, 0.4);
// }

// planeMesh.geometry.setAttribute(
//   "color",
//   new THREE.BufferAttribute(new Float32Array(colors), 3)
// );

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -1, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

// console.log(geometry)
// console.log(material)
// console.log(mesh)

// scene.add(boxMesh)

new OrbitControls(camera, renderer.domElement);

camera.position.z = 50;

//Mouse Event

const mouse = {
  x: undefined,
  y: undefined,
};

let frame = 0

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // boxMesh.rotation.x += 0.01;
  // boxMesh.rotation.y -= 0.01;
  // boxMesh.rotation.z += 0.01;
  // planeMesh.rotation.x = -0.11;
  // planeMesh.rotation.y -= 0.01;
  // planeMesh.rotation.z += 0.01;

  raycaster.setFromCamera(mouse, camera);
  frame += 0.01



  const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
  for (let i=0; i < array.length; i+=3){
    //x cordinates
    // array[i] = originalPosition[i] + Math.cos(frame) * 0.01
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01

    //y cordinates
    array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1]) * 0.01
    
    // if (i===0) {
    //   console.log(Math.cos(frame))
    // }
  }
  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(planeMesh);
  // console.log(intersects)
  if (intersects.length > 0) {
    // console.log('intersecting')
    // console.log(intersects[0].face)
    // console.log()

    const { color } = intersects[0].object.geometry.attributes;

    //vertice 1
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    //vertice 2
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    //vertice 3
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };
    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        //vertice 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        //vertice 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        //vertice 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
      },
    });
  }
}

[];

// renderer.render(scene, camera);

animate();

addEventListener("mousemove", (event) => {
  //normalize the mouse coordinate
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  // console.log(event.clientX, event.clientY)
  // console.log(mouse)
});
