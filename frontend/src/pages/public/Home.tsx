import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { BookOpen, Coffee, Gamepad2, Wifi, Instagram, Twitter, Phone } from 'lucide-react';

const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mugGroupRef = useRef<THREE.Group | null>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const introDone = useRef(false);
  const introStartTime = useRef<number | null>(null);
  const baseRotationY = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showHeroText, setShowHeroText] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing canvas elements (prevents duplicates on HMR/StrictMode)
    const container = containerRef.current;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0xffd699, 0.6);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);
    
    // Front light for pop-out effect
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
    frontLight.position.set(0, 0, 10);
    scene.add(frontLight);

    // Mug group
    const mugGroup = new THREE.Group();
    mugGroupRef.current = mugGroup;
    scene.add(mugGroup);

    // Create mug
    const points = [];
    const segments = 64;
    
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(1.2, 0));
    points.push(new THREE.Vector2(1.8, 0.2));
    points.push(new THREE.Vector2(2.0, 0.5));
    points.push(new THREE.Vector2(2.0, 1.8));
    points.push(new THREE.Vector2(2.05, 2.0));
    points.push(new THREE.Vector2(2.1, 2.1));
    points.push(new THREE.Vector2(2.05, 2.15));
    points.push(new THREE.Vector2(0, 2.15));

    const mugGeometry = new THREE.LatheGeometry(points, segments);
    const mugMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff8f0,
      roughness: 0.1,
      metalness: 0.1,
      emissive: 0x331100,
      emissiveIntensity: 0.05,
    });
    const mug = new THREE.Mesh(mugGeometry, mugMaterial);
    mug.castShadow = true;
    mugGroup.add(mug);

    // Decorative stripes
    const stripePositions = [0.8, 1.3];
    stripePositions.forEach((yPos) => {
      const stripeGeometry = new THREE.TorusGeometry(2.02, 0.075, 16, 64);
      const stripeMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.2,
      });
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = yPos;
      mugGroup.add(stripe);
    });

    // Decorative dots
    const dotGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const dotMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a574,
      roughness: 0.2,
    });

    const numDots = 12;
    for (let i = 0; i < numDots; i++) {
      const angle = (i / numDots) * Math.PI * 2;
      const dot = new THREE.Mesh(dotGeometry, dotMaterial.clone());
      dot.position.x = Math.cos(angle) * 2.05;
      dot.position.z = Math.sin(angle) * 2.05;
      dot.position.y = 1.05;
      mugGroup.add(dot);
    }

    // Coffee liquid
    const coffeeGeometry = new THREE.CylinderGeometry(1.98, 1.95, 0.15, segments);
    const coffeeMaterial = new THREE.MeshStandardMaterial({
      color: 0xa0522d,
      roughness: 0.25,
      metalness: 0.15,
    });
    const coffee = new THREE.Mesh(coffeeGeometry, coffeeMaterial);
    coffee.position.y = 1.9;
    mugGroup.add(coffee);

    // Coffee cream
    const creamGeometry = new THREE.CircleGeometry(0.4, 32);
    const creamMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5deb3,
      transparent: true,
      opacity: 0.8,
    });
    const cream = new THREE.Mesh(creamGeometry, creamMaterial);
    cream.rotation.x = -Math.PI / 2;
    cream.position.y = 1.98;
    cream.position.x = 0.3;
    mugGroup.add(cream);

    // Handle
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.0, 1.6, 0),
      new THREE.Vector3(2.8, 1.6, 0),
      new THREE.Vector3(3.0, 1.2, 0),
      new THREE.Vector3(3.0, 0.8, 0),
      new THREE.Vector3(2.8, 0.4, 0),
      new THREE.Vector3(2.0, 0.4, 0),
    ]);

    const handleGeometry = new THREE.TubeGeometry(handleCurve, 64, 0.18, 16, false);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    mugGroup.add(handle);

    mugGroup.rotation.y = -0.2;
    mugGroup.rotation.x = 0.05;
    mugGroup.position.set(0, 0.8, 0);
    mugGroup.scale.set(1.3, 1.3, 1.3);

    // Mouse tracking for interactive rotation
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Track if component is mounted for animation loop
    let isMounted = true;

    // Animation loop with entrance choreography and smooth hover rotation
    const animate = (time?: number) => {
      if (!isMounted) return;
      requestAnimationFrame(animate);

      if (!introDone.current && mugGroupRef.current) {
        if (!introStartTime.current) introStartTime.current = time ?? 0;

        const elapsed = ((time ?? 0) - introStartTime.current) / 1000;
        const duration = 1.4; // seconds
        const t = Math.min(elapsed / duration, 1);

        // easeOutCubic
        const ease = 1 - Math.pow(1 - t, 3);

        // 360 spin
        mugGroupRef.current.rotation.y = ease * Math.PI * 2;

        // gentle settle
        mugGroupRef.current.rotation.x = 0.05 * (1 - ease);

        // slight X offset synced with text
        mugGroupRef.current.position.x = 0.6 * (1 - ease);

        if (t === 1) {
          introDone.current = true;
          baseRotationY.current = mugGroupRef.current.rotation.y;
        }
      } else if (mugGroupRef.current) {
        // Hover rotation (only after intro) - ADD to base rotation
        const targetY = baseRotationY.current + mouseX.current * 0.25;
        mugGroupRef.current.rotation.x += (mouseY.current * 0.15 - mugGroupRef.current.rotation.x) * 0.05;
        mugGroupRef.current.rotation.y += (targetY - mugGroupRef.current.rotation.y) * 0.05;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      // Clean up Three.js resources
      if (mugGroupRef.current) {
        mugGroupRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
              object.material.dispose();
            }
          }
        });
      }
      
      renderer.dispose();
      
      // Remove canvas from DOM
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Reset refs
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      mugGroupRef.current = null;
      introDone.current = false;
      introStartTime.current = null;
      baseRotationY.current = 0;
    };
  }, []);

  // Smooth parallax scroll animation
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrolled / maxScroll;
      setScrollProgress(progress);

      if (mugGroupRef.current && introDone.current) {
        const baseY = 0.8;
        mugGroupRef.current.position.y = baseY - progress * 1.2;
        mugGroupRef.current.position.z = -progress * 1.5;
        // Subtle rotation on scroll - ADD to base rotation from intro
        const targetRotationY = baseRotationY.current + progress * Math.PI * 0.6;
        mugGroupRef.current.rotation.y += (targetRotationY - mugGroupRef.current.rotation.y) * 0.05;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger text slide-in animation
  useEffect(() => {
    const t = setTimeout(() => setShowHeroText(true), 300);
    return () => clearTimeout(t);
  }, []);

  const menuItems = [
    { name: 'Espresso', price: '₹120', desc: 'Rich and bold' },
    { name: 'Cappuccino', price: '₹150', desc: 'Creamy and smooth' },
    { name: 'Latte', price: '₹160', desc: 'Silky perfection' },
    { name: 'Cold Brew', price: '₹180', desc: 'Refreshingly smooth' },
    { name: 'Mocha', price: '₹170', desc: 'Chocolate delight' },
    { name: 'Americano', price: '₹130', desc: 'Classic strength' },
  ];

  const features = [
    { icon: 'wifi', title: 'Study Space', desc: 'Quiet zones with fast WiFi' },
    { icon: 'coffee', title: 'Premium Coffee', desc: 'Artisan roasted beans' },
    { icon: 'gamepad', title: 'Gaming Zone', desc: 'Latest games & consoles' },
    { icon: 'book', title: 'Book Library', desc: 'Curated collection' },
  ];
  const getIcon = (iconName: string) => {
    const iconProps = { size: 56, strokeWidth: 1.5, className: 'text-[#8b6347]' };
    switch (iconName) {
      case 'wifi': return <Wifi {...iconProps} />;
      case 'coffee': return <Coffee {...iconProps} />;
      case 'gamepad': return <Gamepad2 {...iconProps} />;
      case 'book': return <BookOpen {...iconProps} />;
      default: return <Coffee {...iconProps} />;
    }
  };
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section id="home" className="min-h-screen relative bg-gradient-to-br from-[#faf8f5] via-[#f5ede3] to-[#ede4d9]">
        <div className="h-full flex flex-col md:flex-row items-center">
          {/* Left Half - Text Content */}
          <div className="w-full md:w-1/2 relative z-20 px-8 md:pl-16 lg:pl-20 py-20">
            <div className={`max-w-2xl transform transition-all duration-1000 ease-out ${
              showHeroText ? 'translate-x-0 opacity-100' : 'translate-x-24 opacity-0'
            }`}>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 text-[#5d3a1a] leading-tight">
                BookAVibe
              </h2>
              <p className="text-3xl md:text-4xl lg:text-5xl text-[#8b6f47] mb-6 font-normal tracking-wide" style={{ fontFamily: '"Dancing Script", cursive' }}>
                Sip. Study. Play. Repeat.
              </p>
              <p className="text-lg md:text-xl text-[#6b5744] mb-10 max-w-lg leading-relaxed">
                Your perfect blend of coffee, books, and games in one cozy space
              </p>
              <Link to="/menu" className="inline-block bg-[#6b4423] hover:bg-[#5d3a1a] text-white px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all duration-300 shadow-lg">
                Explore Our Menu
              </Link>
            </div>
          </div>

          {/* Right Half - 3D Canvas */}
          <div className="w-full md:w-1/2 h-96 md:h-screen relative pointer-events-none" style={{ zIndex: 30 }}>
            <div ref={containerRef} className="w-full h-full" />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-32 left-10 w-20 h-20 bg-[#d4b89f]/20 rounded-full blur-xl" style={{ zIndex: 10 }} />
        <div className="absolute bottom-32 right-10 w-32 h-32 bg-[#c9a882]/20 rounded-full blur-2xl" style={{ zIndex: 10 }} />
      </section>

      {/* About Section */}
      <section id="about" className="relative min-h-screen flex items-center justify-center px-6 py-20 bg-white overflow-hidden">
        {/* Soft background shapes */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#d4b89f]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-[#c9a882]/20 rounded-full blur-2xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heroic heading with accent underline */}
          <div className="text-center mb-6">
            <h2 className="text-5xl md:text-6xl font-bold text-[#5d3a1a] inline-block">
              Where Coffee Meets Community
            </h2>
            <span className="block mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-[#8b6347] to-[#6b4423] rounded-full"></span>
          </div>
          
          {/* Subtitle */}
          <p className="text-xl text-[#8b6f47] text-center max-w-3xl mx-auto mb-16">
            A space designed for focus, creativity, connection, and comfort
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left text block with vertical accent */}
            <div className="relative pl-6">
              <div className="absolute left-0 top-2 h-full w-1 bg-gradient-to-b from-[#8b6347] to-[#6b4423] rounded-full opacity-40"></div>
              <p className="text-lg text-[#6b5744] mb-8 leading-relaxed">
                BookCafe isn't just a café—it's a lifestyle. We've created a unique space where you can fuel your productivity with premium coffee, lose yourself in a good book, challenge friends to board games, or simply unwind in our cozy atmosphere.
              </p>
              <p className="text-lg text-[#6b5744] leading-relaxed">
                Whether you're a student cramming for exams, a remote worker seeking inspiration, or a book lover looking for your next adventure, BookCafe is your second home.
              </p>
            </div>
            
            {/* Premium interactive cards */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="group bg-gradient-to-br from-[#faf8f5] to-[#f5ede3] p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#d4b89f]/30 border border-[#e8dfd3]"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  {/* Icon container */}
                  <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8dfd3] to-[#d4b89f] mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {getIcon(feature.icon)}
                  </div>
                  <h3 className="text-xl font-bold text-[#5d3a1a] mb-2">{feature.title}</h3>
                  <p className="text-[#8b6f47]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gentle CTA hint */}
          <p className="text-center text-[#8b6f47] mt-16 italic text-lg">
            Come for the coffee. Stay for the experience.
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="min-h-screen flex items-center justify-center px-6 py-20 bg-[#faf8f5]">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-4 text-[#5d3a1a]">
            Our Signature Menu
          </h2>
          <p className="text-xl text-center text-[#8b6f47] mb-12">
            Crafted with love, served with passion
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {menuItems.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-2xl hover:shadow-xl transition hover:-translate-y-2 border border-[#e8dfd3]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-[#5d3a1a]">{item.name}</h3>
                  <span className="text-2xl font-bold text-[#8b6347]">{item.price}</span>
                </div>
                <p className="text-[#6b5744]">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/menu" className="inline-block bg-[#6b4423] hover:bg-[#5d3a1a] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition shadow-lg">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="features" className="min-h-screen flex items-center justify-center px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 text-[#5d3a1a]">
            More Than Just Coffee
          </h2>
          <div className="space-y-20">
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="flex-1">
                <h3 className="text-4xl font-bold mb-4 text-[#6b4423]">Study Haven</h3>
                <p className="text-xl text-[#6b5744] leading-relaxed">
                  Dedicated quiet zones with comfortable seating, power outlets at every table, and lightning-fast WiFi. Perfect for students, freelancers, and anyone needing focus time.
                </p>
              </div>
              <div className="group flex-1 bg-white/80 backdrop-blur-md p-12 rounded-3xl text-center border border-[#e8dfd3] transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#d4b89f]/40">
                <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5ede3] to-[#e8dfd3] mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Wifi size={56} strokeWidth={1.5} className="text-[#8b6347]" />
                </div>
                <p className="text-2xl font-semibold text-[#6b5744]">Free WiFi • Power Outlets • Quiet Zones</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row-reverse items-center gap-12"
            >
              <div className="flex-1">
                <h3 className="text-4xl font-bold mb-4 text-[#6b4423]">Gaming Lounge</h3>
                <p className="text-xl text-[#6b5744] leading-relaxed">
                  Latest board games, card games, and video game consoles. Challenge your friends or make new ones in our vibrant gaming community.
                </p>
              </div>
              <div className="group flex-1 bg-white/80 backdrop-blur-md p-12 rounded-3xl text-center border border-[#e8dfd3] transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#d4b89f]/40">
                <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5ede3] to-[#e8dfd3] mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 size={56} strokeWidth={1.5} className="text-[#8b6347]" />
                </div>
                <p className="text-2xl font-semibold text-[#6b5744]">Board Games • Consoles • Tournaments</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="flex-1">
                <h3 className="text-4xl font-bold mb-4 text-[#6b4423]">Book Paradise</h3>
                <p className="text-xl text-[#6b5744] leading-relaxed">
                  Curated collection of bestsellers, classics, and indie gems. Free to read while you sip your favorite brew. Take recommendations from our resident book club.
                </p>
              </div>
              <div className="group flex-1 bg-white/80 backdrop-blur-md p-12 rounded-3xl text-center border border-[#e8dfd3] transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#d4b89f]/40">
                <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5ede3] to-[#e8dfd3] mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={56} strokeWidth={1.5} className="text-[#8b6347]" />
                </div>
                <p className="text-2xl font-semibold text-[#6b5744]">500+ Books • Book Club • Reading Nooks</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center px-6 py-20 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto w-full text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#5d3a1a]">
            Visit Us Today
          </h2>
          <p className="text-2xl text-[#8b6f47] mb-12">
            Your next favorite spot awaits
          </p>
          
          <div className="bg-white p-10 rounded-3xl shadow-lg mb-12 border border-[#e8dfd3]">
            <div className="grid md:grid-cols-2 gap-12 text-left">
              {/* LEFT COLUMN: Location → Map → Hours */}
              <div className="flex flex-col gap-8">
                {/* Location */}
                <div>
                  <h3 className="text-2xl font-bold text-[#6b4423] mb-2">Location</h3>
                  <p className="text-[#6b5744] leading-relaxed">
                    123 Cafe Street<br />
                    Koregaon Park, Pune<br />
                    Maharashtra 411001
                  </p>
                </div>
                
                {/* Map */}
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-[#e8dfd3] shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.171503760869!2d73.83912117343948!3d18.521150382572475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf3a8ba88529%3A0xeaa025180f30ba3d!2sBookCafe%20-%20Book%20Cafe%20and%20Co-working%20space!5e0!3m2!1sen!2sin!4v1766226487922!5m2!1sen!2sin"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    title="BookCafe Location Map"
                  ></iframe>
                </div>
                
                {/* Hours */}
                <div>
                  <h3 className="text-2xl font-bold text-[#6b4423] mb-2">Hours</h3>
                  <p className="text-[#6b5744]">
                    Monday – Friday: 8 AM – 11 PM<br />
                    Saturday – Sunday: 9 AM – Midnight
                  </p>
                </div>
              </div>
              
              {/* RIGHT COLUMN: Contact → Follow Us */}
              <div className="flex flex-col gap-8">
                {/* Contact */}
                <div>
                  <h3 className="text-2xl font-bold text-[#6b4423] mb-4">Contact</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Phone size={20} className="text-[#8b6f47]" />
                    <p className="text-[#6b5744]">+91 98765 43210</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#8b6f47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[#6b5744]">hello@BookCafe.com</p>
                  </div>
                </div>
                
                {/* Follow Us */}
                <div>
                  <h3 className="text-2xl font-bold text-[#6b4423] mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    <button className="bg-[#f5ede3] hover:bg-[#8b6f47] p-4 rounded-full transition-all duration-300 hover:scale-110 group">
                      <Instagram size={24} className="text-[#8b6f47] group-hover:text-white" />
                    </button>
                    <button className="bg-[#f5ede3] hover:bg-[#8b6f47] p-4 rounded-full transition-all duration-300 hover:scale-110 group">
                      <Twitter size={24} className="text-[#8b6f47] group-hover:text-white" />
                    </button>
                    <button className="bg-[#f5ede3] hover:bg-[#8b6f47] p-4 rounded-full transition-all duration-300 hover:scale-110 group">
                      <Phone size={24} className="text-[#8b6f47] group-hover:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link to="/menu" className="inline-block bg-[#6b4423] hover:bg-[#5d3a1a] text-white px-12 py-4 rounded-full text-xl font-semibold hover:scale-105 transition shadow-lg">
            Order Now
          </Link>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 right-8 bg-[#6b4423] text-white p-4 rounded-full shadow-lg opacity-75">
        <div className="text-sm font-semibold">
          {Math.round(scrollProgress * 100)}%
        </div>
      </div>
    </div>
  );
};

export default Home;
