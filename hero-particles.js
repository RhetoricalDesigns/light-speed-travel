(() => {
  const canvases = document.querySelectorAll('[data-hero-particles]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  canvases.forEach((canvas) => {
    const surface = canvas.parentElement;
    const context = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let pointer = null;
    let frameId = 0;

    const resize = () => {
      const bounds = surface.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const count = Math.max(24, Math.min(88, Math.round(width * height / 8500)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.2 + 0.5
      }));
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        if (pointer) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 180 && distance > 0) {
            const influence = (1 - distance / 180) * 0.00045;
            particle.vx += dx * influence;
            particle.vy += dy * influence;
          }
        }

        particle.vx *= 0.995;
        particle.vy *= 0.995;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        context.fillStyle = 'rgba(0, 240, 255, 0.58)';
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < 120) {
            context.strokeStyle = `rgba(0, 240, 255, ${0.13 * (1 - distance / 120)})`;
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      }

      if (pointer) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 100);
        glow.addColorStop(0, 'rgba(0, 240, 255, 0.11)');
        glow.addColorStop(1, 'rgba(0, 240, 255, 0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(pointer.x, pointer.y, 100, 0, Math.PI * 2);
        context.fill();
      }
    };

    const animate = () => {
      draw();
      if (!reduceMotion) frameId = window.requestAnimationFrame(animate);
    };

    surface.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = surface.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      if (reduceMotion) draw();
    }, { passive: true });

    surface.addEventListener('pointerleave', () => {
      pointer = null;
      if (reduceMotion) draw();
    });

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (!document.hidden && !reduceMotion && !frameId) {
        frameId = window.requestAnimationFrame(animate);
      }
    });

    resize();
    if (!reduceMotion) frameId = window.requestAnimationFrame(animate);
  });
})();
