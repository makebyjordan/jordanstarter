/* ==========================================================================
   jordanstarter - app.js
   Dynamic Animations, 3D Tilts, and ScrollTrigger Integrations
   ========================================================================== */

// --- 1. ALPINE.JS STORE INITIALIZATION & SYNC ---
document.addEventListener('alpine:init', () => {
  function deepMerge(target, source) {
    if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
      return source !== undefined ? source : target;
    }
    if (Array.isArray(target) || Array.isArray(source)) {
      return source;
    }
    const result = { ...target };
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (typeof source[key] === 'object' && source[key] !== null && key in target) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  let loadedData = localStorage.getItem('jordan_portal_data');
  if (loadedData) {
    try {
      loadedData = JSON.parse(loadedData);
    } catch (e) {
      loadedData = window.websiteDataDefault;
    }
  } else {
    loadedData = window.websiteDataDefault;
  }
  
  // Merge loaded structure with defaults in case of missing keys
  loadedData = deepMerge(window.websiteDataDefault, loadedData);
  
  Alpine.store('websiteData', loadedData);

  // Automatically refresh ScrollTrigger and resize Lenis when store data changes (skip initial run)
  let isInitialStoreSync = true;
  Alpine.effect(() => {
    const tracking = JSON.stringify(Alpine.store('websiteData'));
    if (isInitialStoreSync) {
      isInitialStoreSync = false;
      return;
    }
    setTimeout(() => {
      if (window.ScrollTrigger) {
        ScrollTrigger.refresh();
      }
      if (window.lenis) {
        window.lenis.resize();
      }
    }, 150);
  });

  // Global save function to write clean object (stripping Alpine reactivity proxies)
  window.saveWebsiteData = (storeData) => {
    try {
      const rawData = Alpine.raw(storeData);
      localStorage.setItem('jordan_portal_data', JSON.stringify(rawData));
      window.location.reload();
    } catch (e) {
      console.error('Error saving website data:', e);
      alert('Error al guardar los datos.');
    }
  };
});

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Initialize site logic once all assets and Alpine have loaded
  window.addEventListener('load', () => {
    setTimeout(initSiteLogic, 50);
  });

  function initSiteLogic() {
    // --- 2. LENIS SMOOTH SCROLLING ---
    window.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);


    // --- 3. CUSTOM CURSOR TRACKING ---
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');

    if (cursor && cursorDot) {
      document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.02 });
      });

      // Hover effects for clickable items
      const hoverElements = document.querySelectorAll('a, button, .tilt-element, input, textarea');
      hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursor.style.width = '40px';
          cursor.style.height = '40px';
          cursor.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          cursor.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        });
        el.addEventListener('mouseleave', () => {
          cursor.style.width = '20px';
          cursor.style.height = '20px';
          cursor.style.backgroundColor = 'transparent';
          cursor.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        });
      });
    }


    // --- 4. 3D CARD TILT EFFECT (Section 1) ---
    const tiltContainers = document.querySelectorAll('.tilt-element');
    tiltContainers.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate tilts
        const rotateX = -((y - centerY) / centerY) * 15; // Max 15 degrees tilt
        const rotateY = ((x - centerX) / centerX) * 15;
        
        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.04,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    });


    // --- 5. GSAP SCROLLTRIGGER ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    // Section 1: Hero entrance & parallax
    gsap.from('#hero-intro-text', {
      opacity: 0,
      x: -50,
      duration: 1.2,
      ease: 'power3.out'
    });

    gsap.from('#hero-cards-grid .tilt-element', {
      opacity: 0,
      y: 100,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power4.out',
      delay: 0.2
    });

    // Parallax shifts on hero cards as you scroll down
    gsap.to('#hero-cards-grid .tilt-element:nth-child(1)', {
      y: -50,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
    gsap.to('#hero-cards-grid .tilt-element:nth-child(2)', {
      y: -20,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
    gsap.to('#hero-cards-grid .tilt-element:nth-child(3)', {
      y: 10,
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Section 2: Tools section intro fade-in
    gsap.fromTo('#stats-intro', 
      { opacity: 0, x: -60 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#tools',
          start: 'top 75%',
          toggleActions: "play none none none"
        }
      }
    );

    // Section 2: Tools progress circle & sparkline drawing (Scrub animation)
    const ring = document.getElementById('radial-progress-bar');
    const ringText = document.getElementById('radial-percent-text');
    const websiteData = Alpine.store('websiteData');
    
    if (ring && ringText && websiteData) {
      const totalCircumference = 339.29; // 2 * Math.PI * r (54)
      const targetProgressPercent = parseInt(websiteData.tools.percent) || 85;
      const targetDashoffset = totalCircumference - (targetProgressPercent / 100) * totalCircumference;

      const radialTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#tools',
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 1.2
        }
      });

      radialTl.to(ring, {
        strokeDashoffset: targetDashoffset,
        ease: 'power2.out',
        duration: 2
      }, 0);

      const numberProxy = { value: 0 };
      radialTl.to(numberProxy, {
        value: targetProgressPercent,
        ease: 'power2.out',
        duration: 2,
        onUpdate: () => {
          ringText.textContent = Math.round(numberProxy.value) + '%';
        }
      }, 0);
    }

    // Sparkline graph path drawing
    const sparkline = document.getElementById('sparkline-path');
    if (sparkline) {
      const pathLength = sparkline.getTotalLength();
      gsap.set(sparkline, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength
      });

      gsap.to(sparkline, {
        strokeDashoffset: 0,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: '#tools',
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: 1
        }
      });
    }

    // Section 3: Portfolio items entry
    gsap.fromTo('#portfolio .glass-panel', 
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
        clearProps: "transform",
        scrollTrigger: {
          trigger: '#portfolio',
          start: 'top 75%',
          toggleActions: "play none none none"
        }
      }
    );

    // Section 4: Startups chat logs entry
    const chatMessages = document.querySelectorAll('.chat-message-row');
    if (chatMessages.length > 0) {
      gsap.fromTo(chatMessages,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.3,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: "transform",
          scrollTrigger: {
            trigger: '#startups',
            start: 'top 65%',
            toggleActions: "play none none none"
          }
        }
      );
    }

    gsap.fromTo('#chat-intro', 
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#startups',
          start: 'top 70%',
          toggleActions: "play none none none"
        }
      }
    );


    // Section 5: Contact panel bounce
    gsap.fromTo('#contact-container', 
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 80%',
          toggleActions: "play none none none"
        }
      }
    );


    // --- 6. SIDEBAR ACTIVE SECTION HIGHLIGHTING ---
    const sections = document.querySelectorAll('section[id]');
    const navIcons = document.querySelectorAll('.nav-icon');

    window.addEventListener('scroll', () => {
      let current = 'hero';
      sections.forEach((sec) => {
        const secTop = sec.offsetTop;
        if (pageYOffset >= secTop - 250) {
          current = sec.getAttribute('id');
        }
      });

      navIcons.forEach((icon) => {
        icon.classList.remove('active', 'text-[#00f2fe]', 'text-[#ff7a00]', 'text-[#fff000]', 'text-[#e100ff]', 'text-red-500');
        icon.classList.add('text-[#8b92bf]');
        
        const secTarget = icon.getAttribute('data-sec');
        if (secTarget === current) {
          icon.classList.add('active');
          icon.classList.remove('text-[#8b92bf]');
          
          // Match icon color based on section
          if (current === 'hero') icon.classList.add('text-[#00f2fe]');
          if (current === 'tools') icon.classList.add('text-[#fff000]');
          if (current === 'portfolio') icon.classList.add('text-[#ff7a00]');
          if (current === 'startups') icon.classList.add('text-[#e100ff]');
          if (current === 'contact') icon.classList.add('text-red-500');
        }
      });
    });

    // Handle Form Submission Mockup
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        
        alert(`¡Gracias ${name}! Tu solicitud ha sido registrada. Jordan se pondrá en contacto contigo a través de ${email} lo antes posible.`);
        contactForm.reset();
      });
    }
  }


  // --- 7. STATIC TEMPLATE EXPORT UTILITY ---
  window.exportUpdatedHTML = function() {
    // Fetch the clean index.html template from the server
    fetch('./index.html')
      .then(response => response.text())
      .then(cleanHTML => {
        const dataScriptRegex = /<script id="website-data-script">([\s\S]*?)<\/script>/;
        const currentStoreData = JSON.stringify(Alpine.raw(Alpine.store('websiteData')), null, 2);
        
        // Formulate script tag with indentation matching the file structure
        const newScriptContent = `\n    window.websiteDataDefault = ${currentStoreData};\n  `;
        
        // Perform template replacement
        const updatedHTMLString = cleanHTML.replace(dataScriptRegex, `<script id="website-data-script">${newScriptContent}</script>`);
        
        // Trigger browser download dialog
        const blob = new Blob([updatedHTMLString], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error('Error fetching clean HTML template:', err);
        alert('Error al exportar. Comprueba tu servidor local o acceso a archivos.');
      });
  };

});
