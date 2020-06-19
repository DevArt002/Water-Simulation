const stats = new Stats();
stats.showPanel(0);
stats.domElement.setAttribute("style", "position: absolute; top: 0;");
document.body.appendChild(stats.domElement);

const canvas = document.getElementById("canvas");

const width = canvas.clientWidth * window.devicePixelRatio;
const height = canvas.clientHeight * window.devicePixelRatio;

// Colors
const black = new THREE.Color("black");
const white = new THREE.Color("white");
// Constants
const waterPosition = new THREE.Vector3(0, 0, 0.8);
const near = 0;
const far = 2;
const waterSize = 512;

// Create directional light
// TODO Replace this by a THREE.DirectionalLight and use the provided matrix (check that it's an Orthographic matrix as expected)
const light = [0, 0, -1];
const lightCamera = new THREE.OrthographicCamera(
    -1.2,
    1.2,
    1.2,
    -1.2,
    near,
    far
);
lightCamera.position.set(0, 0, 1.5);
lightCamera.lookAt(0, 0, 0);

// Create Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
camera.position.set(-1.5, -1.5, 1);
camera.up.set(0, 0, 1);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
});
renderer.setSize(width, height);
renderer.autoClear = false;

// Create mouse Controls
const controls = new THREE.OrbitControls(camera, canvas);

controls.target = waterPosition;

controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2 - 0.1;

controls.minDistance = 1.5;
controls.maxDistance = 3;

// Target for computing the water refraction
const temporaryRenderTarget = new THREE.WebGLRenderTarget(width, height);

// Clock
const clock = new THREE.Clock();

// Ray caster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const targetgeometry = new THREE.PlaneGeometry(2, 2);
for (let vertex of targetgeometry.vertices) {
    vertex.z = waterPosition.z;
}
const targetmesh = new THREE.Mesh(targetgeometry);

// Geometries
const waterGeometry = new THREE.PlaneBufferGeometry(2, 2, waterSize, waterSize);
const vertices = new Float32Array([
    -1,
    -1,
    -1,
    -1,
    -1,
    1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    1,
    -1,
    -1,
    1,
    1,
    -1,
    1,
    -1,
    1,
    1,
    1,
    1,
    -1,
    -1,
    -1,
    1,
    -1,
    -1,
    -1,
    -1,
    1,
    1,
    -1,
    1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    1,
    1,
    -1,
    1,
    1,
    1,
    -1,
    -1,
    -1,
    -1,
    1,
    -1,
    1,
    -1,
    -1,
    1,
    1,
    -1,
    -1,
    -1,
    1,
    1,
    -1,
    1,
    -1,
    1,
    1,
    1,
    1,
    1,
]);
const indices = new Uint32Array([
    0,
    1,
    2,
    2,
    1,
    3,
    4,
    5,
    6,
    6,
    5,
    7,
    12,
    13,
    14,
    14,
    13,
    15,
    16,
    17,
    18,
    18,
    17,
    19,
    20,
    21,
    22,
    22,
    21,
    23,
]);

// Environment
const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1);

const objLoader = new THREE.OBJLoader();
let shark;
const sharkLoaded = new Promise((resolve) => {
    objLoader.load("assets/WhiteShark.obj", (sharkGeometry) => {
        sharkGeometry = sharkGeometry.children[0].geometry;
        sharkGeometry.computeVertexNormals();
        sharkGeometry.scale(0.12, 0.12, 0.12);
        sharkGeometry.rotateX(Math.PI / 2);
        sharkGeometry.rotateZ(-Math.PI / 2);
        sharkGeometry.translate(0, 0, 0.4);

        shark = sharkGeometry;
        resolve();
    });
});

let rock1;
let rock2;
const rockLoaded = new Promise((resolve) => {
    objLoader.load("assets/rock.obj", (rockGeometry) => {
        rockGeometry = rockGeometry.children[0].geometry;
        rockGeometry.computeVertexNormals();

        rock1 = new THREE.BufferGeometry().copy(rockGeometry);
        rock1.scale(0.05, 0.05, 0.02);
        rock1.translate(0.2, 0, 0.1);

        rock2 = new THREE.BufferGeometry().copy(rockGeometry);
        rock2.scale(0.05, 0.05, 0.05);
        rock2.translate(-0.5, 0.5, 0.2);
        rock2.rotateZ(Math.PI / 2);

        resolve();
    });
});

let plant;
const plantLoaded = new Promise((resolve) => {
    objLoader.load("assets/plant.obj", (plantGeometry) => {
        plantGeometry = plantGeometry.children[0].geometry;
        plantGeometry.computeVertexNormals();

        plant = plantGeometry;
        plant.rotateX(Math.PI / 6);
        plant.scale(0.03, 0.03, 0.03);
        plant.translate(-0.5, 0.5, 0);

        resolve();
    });
});
