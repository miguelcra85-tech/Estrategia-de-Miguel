// Particle Typography Logic translated to Vanilla JS
class ParticleTypography {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    this.text = options.text || "Migue\nStrategy";
    this.fontSize = options.fontSize || 140;
    this.particleDensity = options.particleDensity || 6;
    this.dispersionStrength = options.dispersionStrength || 18;
    this.color = options.color || '#ff6600';
    
    this.particles = [];
    this.animationFrameId = null;
    
    this.mouse = {
      x: -1000,
      y: -1000,
      radius: 100 // Area of effect
    };
    
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.init = this.init.bind(this);
    this.animate = this.animate.bind(this);
    
    this.setupEventListeners();
    
    // Wait for fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.init();
        this.animate();
      });
    } else {
      setTimeout(() => {
        this.init();
        this.animate();
      }, 500);
    }
  }

  createParticleClass() {
    const parent = this;
    return class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 2; // Fixed particle size
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
      }

      draw() {
        if (!parent.ctx) return;
        parent.ctx.fillStyle = parent.color;
        parent.ctx.beginPath();
        parent.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        parent.ctx.closePath();
        parent.ctx.fill();
      }

      update() {
        const dx = parent.mouse.x - this.x;
        const dy = parent.mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) distance = 1;
        
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        
        const maxDistance = parent.mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        if (force < 0) force = 0;

        const directionX = forceDirectionX * force * parent.dispersionStrength * this.density;
        const directionY = forceDirectionY * force * parent.dispersionStrength * this.density;

        if (distance < parent.mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            const dx = this.x - this.baseX;
            this.x -= dx / 10;
          }
          if (this.y !== this.baseY) {
            const dy = this.y - this.baseY;
            this.y -= dy / 10;
          }
        }
      }
    };
  }

  init() {
    this.particles = [];
    const parent = this.canvas.parentElement;
    if (!parent) return;
    
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx.fillStyle = 'black';
    this.ctx.font = `bold ${this.fontSize}px "Poppins", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const lines = this.text.split('\n');
    const lineHeight = this.fontSize * 1.1;
    const startY = (height / 2) - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      this.ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });

    const textCoordinates = this.ctx.getImageData(0, 0, width, height);
    this.ctx.clearRect(0, 0, width, height); 

    const ParticleClass = this.createParticleClass();

    for (let y = 0; y < textCoordinates.height; y += this.particleDensity) {
      for (let x = 0; x < textCoordinates.width; x += this.particleDensity) {
        const index = (y * 4 * textCoordinates.width) + (x * 4) + 3;
        if (textCoordinates.data[index] > 128) {
          this.particles.push(new ParticleClass(x, y));
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw();
      this.particles[i].update();
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  handleMouseLeave() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }
  
  handleTouchMove(e) {
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.touches[0].clientX - rect.left;
      this.mouse.y = e.touches[0].clientY - rect.top;
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', this.init);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.canvas.addEventListener('touchend', this.handleMouseLeave);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.init);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleMouseLeave);
  }
}

// ----------------------------------------------------------------------
// Main Application Logic
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.getElementById('main-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const headerContainer = document.querySelector('.header-container');
  
  menuToggle?.addEventListener('click', () => {
    headerContainer?.classList.toggle('nav-active');
    menuToggle.classList.toggle('active');
  });

  // 3. Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      if (targetId && targetId !== '#') {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
  
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          headerContainer?.classList.remove('nav-active');
          menuToggle?.classList.remove('active');
        }
      }
    });
  });

  // 4. Background Video Scroll Controller
  const bgVideo = document.getElementById('bg-video');
  const bgPoster = document.getElementById('bg-poster');
  const bgCanvas = document.getElementById('bg-canvas');
  const heroContent = document.getElementById('hero-content');
  
  if (bgVideo && bgCanvas && bgPoster) {
    const ctx = bgCanvas.getContext('2d');
    const sourceEl = bgVideo.querySelector('source');
    const videoUrl = sourceEl ? sourceEl.src : '';
    
    let frames = [];
    let isCaching = false;
    let cachingComplete = false;
    let targetProgress = 0;
    let smoothedProgress = 0;
    let videoDuration = 0;
    
    const calculateProgress = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      return maxScroll > 0 ? Math.max(0, Math.min(1, scrollY / maxScroll)) : 0;
    };
    
    const drawObjectCover = (img, context, canvas) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      
      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }
      
      const canvasW = canvas.width;
      const canvasH = canvas.height;
      const imgW = img.width;
      const imgH = img.height;
      
      const scale = Math.max(canvasW / imgW, canvasH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const drawX = (canvasW - drawW) / 2;
      const drawY = (canvasH - drawH) * 0.2; 
      
      context.clearRect(0, 0, canvasW, canvasH);
      context.drawImage(img, drawX, drawY, drawW, drawH);
    };
    
    const render = () => {
      targetProgress = calculateProgress();
      smoothedProgress += (targetProgress - smoothedProgress) * 0.12;
      
      if (heroContent) {
        const heroProgress = Math.min(1, window.scrollY / window.innerHeight);
        const opacity = 1 - (heroProgress * 2.5);
        const translateY = heroProgress * 150;
        
        if (opacity <= 0) {
          heroContent.style.opacity = '0';
          heroContent.style.pointerEvents = 'none';
        } else {
          heroContent.style.opacity = opacity.toString();
          heroContent.style.transform = `translateY(${translateY}px)`;
          heroContent.style.pointerEvents = 'auto';
        }
      }

      if (cachingComplete && frames.length > 0) {
        const frameIndex = Math.min(
          frames.length - 1,
          Math.floor(smoothedProgress * frames.length)
        );
        const frame = frames[frameIndex];
        if (frame && ctx) {
          drawObjectCover(frame, ctx, bgCanvas);
        }
        
        if (!bgVideo.classList.contains('opacity-0')) {
          bgVideo.classList.remove('opacity-100');
          bgVideo.classList.add('opacity-0');
          bgCanvas.classList.remove('opacity-0');
          bgCanvas.classList.add('opacity-100');
        }
      } else {
        if (videoDuration > 0 && Number.isFinite(videoDuration)) {
          const targetTime = smoothedProgress * (videoDuration - 0.05);
          if (Math.abs(bgVideo.currentTime - targetTime) > 0.04) {
            bgVideo.currentTime = targetTime;
          }
        }
      }
      
      requestAnimationFrame(render);
    };
    
    requestAnimationFrame(render);
    
    const cacheFrames = async (url, duration) => {
      try {
        const offVideo = document.createElement('video');
        offVideo.muted = true;
        offVideo.playsInline = true;
        offVideo.crossOrigin = 'anonymous';
        offVideo.src = url;
        
        await new Promise((resolve) => {
          offVideo.onloadeddata = () => resolve();
          offVideo.load();
        });
        
        let numFrames = Math.min(90, Math.max(24, Math.floor(duration * 12)));
        const timeStep = duration / numFrames;
        
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        if (!offCtx) return;
        
        let w = offVideo.videoWidth;
        let h = offVideo.videoHeight;
        
        if (w > 960) {
          h = Math.floor(h * (960 / w));
          w = 960;
        }
        offCanvas.width = w;
        offCanvas.height = h;
        
        for (let i = 0; i < numFrames; i++) {
          await new Promise((resolve) => {
            const onSeeked = () => {
              offVideo.removeEventListener('seeked', onSeeked);
              resolve();
            };
            offVideo.addEventListener('seeked', onSeeked);
            offVideo.currentTime = i * timeStep;
          });
          
          offCtx.drawImage(offVideo, 0, 0, w, h);
          const bitmap = await window.createImageBitmap(offCanvas);
          frames.push(bitmap);
        }
        
        cachingComplete = true;
      } catch (e) {
        console.error("Frame caching failed:", e);
      }
    };

    const initCaching = () => {
      if (bgVideo.readyState >= 1) {
        videoDuration = bgVideo.duration;
        
        bgPoster.classList.remove('opacity-100');
        bgPoster.classList.add('opacity-0');
        
        setTimeout(() => {
          if (!isCaching && videoUrl) {
            isCaching = true;
            cacheFrames(videoUrl, videoDuration);
          }
        }, 300);
      }
    };
    
    bgVideo.addEventListener('loadeddata', initCaching);
    if (bgVideo.readyState >= 2) initCaching();
  }

  // 5. Scroll Reveal Effect
  const revealElements = document.querySelectorAll('.reveal');
  
  if (window.IntersectionObserver) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback if IntersectionObserver not supported
    revealElements.forEach(element => element.classList.add('active'));
  }

  // 6. Init Particle Typography
  const heroTitleContainer = document.querySelector('.hero-title');
  if (heroTitleContainer) {
    heroTitleContainer.innerHTML = ''; // Clear previous contents
    
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '400px'; 
    wrapper.style.position = 'relative';
    wrapper.style.margin = '0 auto';
    wrapper.style.zIndex = '20';
    wrapper.style.pointerEvents = 'auto';
    
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    
    wrapper.appendChild(canvas);
    heroTitleContainer.appendChild(wrapper);

    const isMobile = window.innerWidth < 768;
    const particleFontSize = isMobile ? 80 : 140;

    new ParticleTypography(canvas, {
      text: "Migue\nStrategy",
      fontSize: particleFontSize,
      particleDensity: 6,
      dispersionStrength: 18,
      color: "#ff6600"
    });
  }
});
