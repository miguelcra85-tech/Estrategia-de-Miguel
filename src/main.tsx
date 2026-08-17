import React from 'react';
import { createRoot } from 'react-dom/client';
import CursorDrivenParticleTypography from './components/CursorDrivenParticleTypography';

// Vanilla JavaScript for Migue Strategy Landing Page

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
  // Initial check
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
          
          // Close mobile menu if open
          headerContainer?.classList.remove('nav-active');
          menuToggle?.classList.remove('active');
        }
      }
    });
  });

  // 4. Background Video Scroll Controller with Frame Caching
  const bgVideo = document.getElementById('bg-video') as HTMLVideoElement;
  const bgPoster = document.getElementById('bg-poster') as HTMLImageElement;
  const bgCanvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
  const heroContent = document.getElementById('hero-content');
  
  if (bgVideo && bgCanvas && bgPoster) {
    const ctx = bgCanvas.getContext('2d');
    const videoUrl = bgVideo.querySelector('source')?.src || '';
    
    let frames: ImageBitmap[] = [];
    let isCaching = false;
    let cachingComplete = false;
    let targetProgress = 0;
    let smoothedProgress = 0;
    let videoDuration = 0;
    
    // Calculate global Scroll Progress (0 to 1)
    const calculateProgress = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      return maxScroll > 0 ? Math.max(0, Math.min(1, scrollY / maxScroll)) : 0;
    };
    
    // Draw image matching object-cover behavior
    const drawObjectCover = (img: ImageBitmap, context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      
      // Update canvas internal resolution if needed
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
      const drawY = (canvasH - drawH) * 0.2; // 20% from top instead of centered
      
      context.clearRect(0, 0, canvasW, canvasH);
      context.drawImage(img, drawX, drawY, drawW, drawH);
    };
    
    // Render loop triggered via requestAnimationFrame
    const render = () => {
      targetProgress = calculateProgress();
      // Lerp for smoothness
      smoothedProgress += (targetProgress - smoothedProgress) * 0.12;
      
      // Optional: Fade out hero content slightly based on scroll distance (parallax)
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
        // Draw cached frame
        const frameIndex = Math.min(
          frames.length - 1,
          Math.floor(smoothedProgress * frames.length)
        );
        const frame = frames[frameIndex];
        if (frame && ctx) {
          drawObjectCover(frame, ctx, bgCanvas);
        }
        
        // Ensure video is hidden and canvas is visible
        if (!bgVideo.classList.contains('opacity-0')) {
          bgVideo.classList.remove('opacity-100');
          bgVideo.classList.add('opacity-0');
          bgCanvas.classList.remove('opacity-0');
          bgCanvas.classList.add('opacity-100');
        }
      } else {
        // Fallback: seek the actual video element
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
    
    // Frame extraction logic
    const cacheFrames = async (url: string, duration: number) => {
      try {
        const offVideo = document.createElement('video');
        offVideo.muted = true;
        offVideo.playsInline = true;
        offVideo.crossOrigin = 'anonymous';
        offVideo.src = url;
        
        await new Promise<void>((resolve) => {
          offVideo.onloadeddata = () => resolve();
          offVideo.load();
        });
        
        // 90 frames max, 24 min, or 12 fps
        let numFrames = Math.min(90, Math.max(24, Math.floor(duration * 12)));
        const timeStep = duration / numFrames;
        
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        if (!offCtx) return;
        
        let w = offVideo.videoWidth;
        let h = offVideo.videoHeight;
        
        // Scale down large videos to max 960px width
        if (w > 960) {
          h = Math.floor(h * (960 / w));
          w = 960;
        }
        offCanvas.width = w;
        offCanvas.height = h;
        
        for (let i = 0; i < numFrames; i++) {
          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              offVideo.removeEventListener('seeked', onSeeked);
              resolve();
            };
            offVideo.addEventListener('seeked', onSeeked);
            offVideo.currentTime = i * timeStep;
          });
          
          offCtx.drawImage(offVideo, 0, 0, w, h);
          const bitmap = await createImageBitmap(offCanvas);
          frames.push(bitmap);
        }
        
        cachingComplete = true;
      } catch (e) {
        console.error("Frame caching failed:", e);
      }
    };

    // Wait until video has metadata
    const initCaching = () => {
      if (bgVideo.readyState >= 1) {
        videoDuration = bgVideo.duration;
        
        // Fade out poster
        bgPoster.classList.remove('opacity-100');
        bgPoster.classList.add('opacity-0');
        
        // Delay extraction to avoid locking UI
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
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve to only reveal once
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

  // 6. Mount React Components
  const heroTitleContainer = document.querySelector('.hero-title');
  if (heroTitleContainer) {
    // We create a wrapper div with a fixed size or responsive size suitable for the canvas
    const wrapper = document.createElement('div');
    // Ensure the container has responsive dimensions and allows the typography to overflow slightly
    wrapper.style.width = '100%';
    wrapper.style.height = '400px'; 
    wrapper.style.position = 'relative';
    wrapper.style.margin = '0 auto';
    wrapper.style.zIndex = '20';
    wrapper.style.pointerEvents = 'auto'; // allow mouse interaction
    
    // Replace the inner HTML with our wrapper
    heroTitleContainer.innerHTML = '';
    heroTitleContainer.appendChild(wrapper);

    // Make the screen smaller font on mobile
    const isMobile = window.innerWidth < 768;
    const particleFontSize = isMobile ? 80 : 140;

    createRoot(wrapper).render(
      <CursorDrivenParticleTypography 
        text={"Migue\nStrategy"}
        fontSize={particleFontSize}
        particleDensity={6}
        dispersionStrength={18}
        color="#ff6600"
      />
    );
  }
});
