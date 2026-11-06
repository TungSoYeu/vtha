window.addEventListener("load", () => {
  const startTimer = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    clearTimeout(startTimer);
  }, 800);

  // Đổi chủ đề màu sắc của hoa
  const themeButtons = document.querySelectorAll("[data-theme-select]");
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const theme = btn.getAttribute("data-theme-select");
      document.body.setAttribute("data-theme", theme);
      themeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Canvas bầu trời sao lấp lánh, sao băng & bụi sao tương tác (hỗ trợ màn hình Retina / Điện thoại)
  const canvas = document.getElementById("sky-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = window.innerWidth;
  let height = window.innerHeight;
  let isMobile = width <= 768;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    isMobile = width <= 768;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const starColors = ["#ffffff", "#ffe4e6", "#bae6fd", "#fef08a", "#e9d5ff"];
  const starCount = isMobile ? 110 : 170;
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * 0.85,
    r: Math.random() * 1.4 + 0.3,
    alpha: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.006,
    color: starColors[Math.floor(Math.random() * starColors.length)],
  }));

  // Đom đóm lơ lửng quanh vườn hoa
  const fireflyCount = isMobile ? 18 : 28;
  const fireflies = Array.from({ length: fireflyCount }, () => ({
    x: width * 0.15 + Math.random() * width * 0.7,
    y: height * 0.35 + Math.random() * height * 0.6,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -Math.random() * 0.5 - 0.15,
    r: Math.random() * 2 + 1,
    phase: Math.random() * Math.PI * 2,
    hue: Math.random() > 0.45 ? 48 : 180,
  }));

  // Sao băng
  const meteors = [];
  function spawnMeteor() {
    if (meteors.length > 2) return;
    meteors.push({
      x: Math.random() * width * 0.85 + width * 0.1,
      y: Math.random() * height * 0.28,
      len: isMobile ? Math.random() * 60 + 45 : Math.random() * 90 + 60,
      speed: isMobile ? Math.random() * 5 + 6 : Math.random() * 7 + 8,
      alpha: 1,
      angle: Math.PI * 0.78,
    });
  }

  setInterval(() => {
    if (Math.random() < 0.65) spawnMeteor();
  }, 3400);

  // Hạt bụi sao khi di chuột hoặc chạm tay trên điện thoại
  const sparkles = [];
  function addSparkles(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 2 + 0.4;
      sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.35,
        r: Math.random() * 2.2 + 0.8,
        alpha: 1,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }
  }

  window.addEventListener("pointermove", (e) => {
    if (Math.random() < 0.55) addSparkles(e.clientX, e.clientY, 2);
  });

  window.addEventListener("pointerdown", (e) => {
    addSparkles(e.clientX, e.clientY, 14);
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Vẽ sao lấp lánh
    for (const s of stars) {
      s.alpha += s.speed;
      const a = 0.25 + ((Math.sin(s.alpha) + 1) / 2) * 0.75;
      ctx.globalAlpha = a;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vẽ đom đóm bay lên
    for (const f of fireflies) {
      f.x += f.vx + Math.sin(f.phase) * 0.22;
      f.y += f.vy;
      f.phase += 0.03;

      if (f.y < height * 0.15) {
        f.y = height * 0.92;
        f.x = width * 0.18 + Math.random() * width * 0.64;
      }

      const glow = 0.35 + ((Math.sin(f.phase * 2) + 1) / 2) * 0.65;
      ctx.save();
      ctx.globalAlpha = glow;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsl(${f.hue}, 100%, 70%)`;
      ctx.fillStyle = `hsl(${f.hue}, 100%, 80%)`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Vẽ sao băng
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      const dx = Math.cos(m.angle) * m.speed;
      const dy = Math.sin(m.angle) * m.speed;
      m.x += dx;
      m.y += dy;
      m.alpha -= 0.015;

      if (m.alpha <= 0 || m.x < -100 || m.y > height) {
        meteors.splice(i, 1);
        continue;
      }

      const tailX = m.x - Math.cos(m.angle) * m.len;
      const tailY = m.y - Math.sin(m.angle) * m.len;
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
      grad.addColorStop(0.4, `rgba(244, 114, 182, ${m.alpha * 0.6})`);
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      ctx.restore();
    }

    // Vẽ hạt bụi sao tương tác
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= 0.024;
      if (sp.alpha <= 0) {
        sparkles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = sp.alpha;
      ctx.shadowBlur = 8;
      ctx.shadowColor = sp.color;
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }

  render();
});
