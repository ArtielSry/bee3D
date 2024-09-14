const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(1, 1, 1).normalize();
directionalLight1.castShadow = true;
directionalLight1.shadow.mapSize.width = 2048;
directionalLight1.shadow.mapSize.height = 2048;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-1, 1, -1).normalize();
directionalLight2.castShadow = true;
directionalLight2.shadow.mapSize.width = 2048;
directionalLight2.shadow.mapSize.height = 2048;
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight3.position.set(0, 1, -1).normalize();
directionalLight3.castShadow = true;
directionalLight3.shadow.mapSize.width = 2048;
directionalLight3.shadow.mapSize.height = 2048;
scene.add(directionalLight3);

const loader = new THREE.GLTFLoader();
let model = null;
let mixer = null;

loader.load(
  "static/source/Flyingbee.glb",
  (gltf) => {
    model = gltf.scene;

    model.position.set(8, -3, 0);
    model.rotation.y = -Math.PI / 1.5;
    model.scale.set(0.15, 0.15, 0.15);

    scene.add(model);

    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material.envMapIntensity = 1;
      }
    });

    mixer = new THREE.AnimationMixer(model);

    if (gltf.animations && gltf.animations.length > 0) {
      const firstAnimation = gltf.animations[0];
      mixer.clipAction(firstAnimation).play();
    }

    function updateCameraPosition() {
      camera.position.z = window.innerWidth < 768 ? 12 : 10;
    }

    updateCameraPosition();

    function animate() {
      requestAnimationFrame(animate);
      if (mixer) mixer.update(0.01);
      renderer.render(scene, camera);
    }
    animate();

    const animations = [
      () => {
        gsap.to(model.position, { x: 0, y: 3, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: -Math.PI / 3, duration: 0.3 });
        gsap.to(model.scale, { x: 0.17, y: 0.17, z: 0.17, duration: 0.3 });
      },
      () => {
        gsap.to(model.position, { x: 0, y: -4, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: -Math.PI / 2, duration: 0.3 });
        gsap.to(model.scale, { x: 0.25, y: 0.25, z: 0.25, duration: 0.3 });
      },
      () => {
        gsap.to(model.position, { x: 0, y: -4, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: Math.PI / 2, duration: 0.3 });
        gsap.to(model.scale, { x: 0.25, y: 0.25, z: 0.25, duration: 0.3 });
      },
      () => {
        gsap.to(model.position, { x: 0, y: -4, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: -Math.PI / 4, duration: 0.3 });
        gsap.to(model.scale, { x: 0.25, y: 0.25, z: 0.25, duration: 0.3 });
      },
      () => {
        gsap.to(model.position, { x: 0, y: -4, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: 0, duration: 0.3 });
        gsap.to(model.scale, { x: 0.25, y: 0.25, z: 0.25, duration: 0.3 });
      },
    ];

    const sections = document.querySelectorAll(".block");
    const observerOptions = {
      root: null,
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const sectionIndex = parseInt(sectionId.replace("section", "")) - 1;
          animations[sectionIndex]();
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (model) {
    updateModelScale();
  }
  updateCameraPosition();
});
