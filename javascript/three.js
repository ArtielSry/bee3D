// Current section (there are 5 section)
let currentSection = 1;

// create scene, camera and render
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Render configuration
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; // Increase the exposure for more brightness
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Añade iluminación a la escena
const ambientLight = new THREE.AmbientLight(0x404040); // Light
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(1, 1, 1).normalize();
directionalLight1.castShadow = true; // Shadow fot this light
directionalLight1.shadow.mapSize.width = 2048; // More shadows resolution
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

// Load the model
const loader = new THREE.GLTFLoader();
let model = null; // First is null
let mixer = null;

loader.load(
  "static/source/Flyingbee.glb",
  (gltf) => {
    model = gltf.scene;

    model.position.set(8, -3, 0); // Initial position
    model.rotation.y = -Math.PI / 1.5; // Rotation Y
    model.scale.set(0.15, 0.15, 0.15); // Initial Scale

    scene.add(model);

    // Materialss for the model
    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true; // Shadow for the 3d model
        node.receiveShadow = true; // Allow shadows for model
        node.material.envMapIntensity = 1; // Adjusts the intensity of the environment map
      }
    });

    // Animations
    mixer = new THREE.AnimationMixer(model);

    // This 3D model has 3 animations / So just render the first one
    if (gltf.animations && gltf.animations.length > 0) {
      const firstAnimation = gltf.animations[0]; // First one
      mixer.clipAction(firstAnimation).play(); // Just the first one / play
    }

    // Camera
    function updateCameraPosition() {
      camera.position.z = window.innerWidth < 768 ? 12 : 10; // Camera position based on window
    }

    updateCameraPosition();

    // Animation function
    function animate() {
      requestAnimationFrame(animate);
      if (mixer) mixer.update(0.01); // Mixer update
      renderer.render(scene, camera);
    }
    animate();

    // GSAP to animate the 3d Model based on each section
    const animations = [
      () => {
        gsap.to(model.position, { x: 8, y: -3, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: -Math.PI / 1.5, duration: 0.3 });
        gsap.to(model.scale, { x: 0.15, y: 0.15, z: 0.15, duration: 0.3 });
      },
      () => {
        gsap.to(model.position, { x: 4, y: -4, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: -Math.PI / 2, duration: 0.3 });
        gsap.to(model.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.3 });
      },
      () => {
        gsap.to(model.position, { x: -6.5, y: -4, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: Math.PI / 2, duration: 0.3 });
        gsap.to(model.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.3 });
      },
      () => {
        gsap.to(model.position, { x: 4, y: -4, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: -Math.PI / 4, duration: 0.3 });
        gsap.to(model.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.3 });
      },
      () => {
        gsap.to(model.position, { x: 0, y: -4, z: 0, duration: 0.3 });
        gsap.to(model.rotation, { y: 0, duration: 0.3 });
        gsap.to(model.scale, { x: 0.25, y: 0.25, z: 0.25, duration: 0.3 });
      },
    ];

    // IntersectionObserver to see when the new section is in the window
    const sections = document.querySelectorAll(".block"); // Select all the sections
    const observerOptions = {
      root: null, // Use the window
      threshold: 0.6, // When 60% of section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const sectionIndex = parseInt(sectionId.replace("section", "")) - 1; // Take the index section

          // Update the current section
          currentSection = sectionIndex + 1;

          // Make the animation based on the section
          animations[sectionIndex]();
        }
      });
    }, observerOptions);

    // Observar cada sección
    sections.forEach((section) => observer.observe(section));

    // 3D model following mouse
    const followSpeed = 0.02; // Reducir la velocidad para que siga más despacio

    // Posición objetivo que se actualizará cuando el ratón se mueva
    let targetPosition = new THREE.Vector3();

    // Función para actualizar la posición del cursor
    function onMouseMove(event) {
      if (currentSection === 5 && model) {
        // Convertir las coordenadas del cursor a coordenadas de la cámara
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // Crear un vector de la posición del cursor en el espacio de la cámara
        const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
        vector.unproject(camera);

        // Calcular la dirección del cursor
        const dir = vector.sub(camera.position).normalize();

        // Definir la distancia del modelo desde la cámara
        const distance = 20;

        // Calcular la nueva posición objetivo del modelo
        targetPosition = camera.position
          .clone()
          .add(dir.multiplyScalar(distance));
      }
    }

    // Añadir listener para actualizar la posición objetivo cuando el ratón se mueva
    window.addEventListener("mousemove", onMouseMove);

    // Función de animación que mueve el modelo hacia la posición objetivo constantemente
    function animate() {
      requestAnimationFrame(animate);

      if (mixer) mixer.update(0.01); // Actualizar las animaciones del modelo

      if (model && currentSection === 5) {
        // Mover el modelo hacia la posición objetivo almacenada
        model.position.lerp(targetPosition, followSpeed);

        // Verificar si el modelo está muy cerca de la posición objetivo
        if (model.position.distanceTo(targetPosition) < 0.01) {
          model.position.copy(targetPosition); // Asegurar que llegue completamente
        }
      }

      renderer.render(scene, camera); // Renderizar la escena
    }

    // Iniciar la animación
    animate();
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

  // Update scale and position based on size of window
  if (model) {
    updateModelScale();
  }
  updateCameraPosition();
});
