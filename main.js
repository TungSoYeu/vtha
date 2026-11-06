window.addEventListener("load", () => {
  const introOverlay = document.getElementById("intro-overlay");
  const startBtn = document.getElementById("start-btn");
  const bgMusic = document.getElementById("bg-music");
  const goodnightMsg = document.getElementById("goodnight-message");
  const moonTrigger = document.getElementById("moon-trigger");
  const moonModal = document.getElementById("moon-modal");
  const closeModal = document.getElementById("close-modal");

  let started = false;

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.85;
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
  }

  function startExperience() {
    if (started) return;
    started = true;

    if (introOverlay) {
      introOverlay.classList.add("hidden");
    }

    // Phát nhạc ngay khi hoa bắt đầu mọc lên
    playMusic();

    // Kích hoạt hoa chồi lên từ mặt đất
    setTimeout(() => {
      document.body.classList.remove("not-loaded");
    }, 200);

    // Hiện dòng chữ chúc Võ Thúy Hà ngủ ngon khi hoa vừa bung nở
    setTimeout(() => {
      if (goodnightMsg) {
        goodnightMsg.classList.add("show");
      }
    }, 3400);
  }

  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addSparkles(window.innerWidth / 2, window.innerHeight / 2, 24, true);
      startExperience();
    });
  }

  if (introOverlay) {
    introOverlay.addEventListener("click", () => {
      addSparkles(window.innerWidth / 2, window.innerHeight / 2, 24, true);
      startExperience();
    });
  }

  // Mở / đóng thiệp khi chạm vào Mặt Trăng
  if (moonTrigger && moonModal) {
    moonTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      moonModal.classList.add("open");
      moonModal.setAttribute("aria-hidden", "false");
    });
  }

  if (closeModal && moonModal) {
    closeModal.addEventListener("click", (e) => {
      e.stopPropagation();
      moonModal.classList.remove("open");
      moonModal.setAttribute("aria-hidden", "true");
    });
    moonModal.addEventListener("click", (e) => {
      if (e.target === moonModal) {
        moonModal.classList.remove("open");
        moonModal.setAttribute("aria-hidden", "true");
      }
    });
  }

  // Các câu chúc nhỏ dễ thương bay lên khi chạm màn hình
  const whispers = [
    "Ngủ ngoan nhé Hà ơi ✨",
    "Mơ thật đẹp nha công chúa 💗",
    "Goodnight Võ Thúy Hà 🌙",
    "Đắp chăn ấm kẻo lạnh nha 🌸",
    "Mai lại là một ngày thật vui nhé 💕",
    "Gác lại âu lo và ngủ thật sâu nha 🌷",
    "Chúc Hà một đêm bình yên 💫",
  ];
  let whisperIdx = 0;

  function spawnWhisper(x, y) {
    const el = document.createElement("div");
    el.className = "whisper-bubble";
    el.textContent = whispers[whisperIdx % whispers.length];
    whisperIdx++;
    const clampedX = Math.max(90, Math.min(window.innerWidth - 90, x));
    const clampedY = Math.max(60, Math.min(window.innerHeight - 60, y));
    el.style.left = `${clampedX}px`;
    el.style.top = `${clampedY}px`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 2200);
  }

  // Canvas bầu trời sao hồng lấp lánh, sao băng & tim hồng tương tác
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

  const pinkPalette = ["#ffffff", "#ffe5ec", "#ffb3c6", "#ff8fab", "#fef08a"];
  const starCount = isMobile ? 110 : 170;
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * 0.85,
    r: Math.random() * 1.4 + 0.3,
    alpha: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.006,
    color: pinkPalette[Math.floor(Math.random() * pinkPalette.length)],
  }));

  // Đom đóm hồng & vàng ấm lơ lửng quanh vườn hoa
  const fireflyCount = isMobile ? 18 : 28;
  const fireflies = Array.from({ length: fireflyCount }, () => ({
    x: width * 0.15 + Math.random() * width * 0.7,
    y: height * 0.35 + Math.random() * height * 0.6,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -Math.random() * 0.5 - 0.15,
    r: Math.random() * 2 + 1,
    phase: Math.random() * Math.PI * 2,
    hue: Math.random() > 0.35 ? 340 : 48,
  }));

  // Sao băng hồng lãng mạn
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

  // Vẽ hình trái tim nhỏ xinh trên canvas
  function drawHeart(x, y, size, color, alpha, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(size, size);
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0.3);
    ctx.bezierCurveTo(-0.5, -0.3, -1, 0.2, 0, 0.9);
    ctx.bezierCurveTo(1, 0.2, 0.5, -0.3, 0, 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Hạt tim hồng & bụi sao khi chạm tay hoặc di chuột
  const sparkles = [];
  const heartColors = ["#ff8fab", "#ffb3c6", "#fb6f92", "#ffc2d1", "#ffe5ec"];

  function addSparkles(x, y, count = 3, withHearts = false) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 2 + 0.4;
      const isHeart = withHearts ? Math.random() < 0.65 : Math.random() < 0.4;
      sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.55,
        r: isHeart ? Math.random() * 6 + 6 : Math.random() * 2.2 + 0.8,
        alpha: 1,
        isHeart,
        rot: (Math.random() - 0.5) * 0.5,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
      });
    }
  }

  window.addEventListener("pointermove", (e) => {
    if (Math.random() < 0.55) addSparkles(e.clientX, e.clientY, 2, false);
  });

  window.addEventListener("pointerdown", (e) => {
    addSparkles(e.clientX, e.clientY, 14, true);
    if (started && (!moonModal || !moonModal.classList.contains("open"))) {
      spawnWhisper(e.clientX, e.clientY);
    }
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
      ctx.shadowColor = `hsl(${f.hue}, 100%, 75%)`;
      ctx.fillStyle = `hsl(${f.hue}, 100%, 85%)`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Vẽ sao băng hồng
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
      grad.addColorStop(0.4, `rgba(255, 143, 171, ${m.alpha * 0.7})`);
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

    // Vẽ tim hồng & hạt bụi sao tương tác
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.alpha -= 0.02;
      if (sp.alpha <= 0) {
        sparkles.splice(i, 1);
        continue;
      }
      if (sp.isHeart) {
        drawHeart(sp.x, sp.y, sp.r, sp.color, sp.alpha, sp.rot);
      } else {
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
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }

  render();
});
