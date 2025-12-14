(function () {
  'use strict';

  /**
   * Simple guard to avoid injecting multiple times
   */
  if (window.WATCHER_LOADED) {
    console.warn('WATCHER already loaded! Remove it first with: window.removeWatcher()');
    return;
  }
  window.WATCHER_LOADED = true;

  /**
   * Utility: create element with attributes and optional parent
   */
  function createEl(tag, attrs = {}, parent) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    });
    if (parent) parent.appendChild(el);
    return el;
  }

  /**
   * =========================
   *  STYLES
   * =========================
   */
  const STYLE_ID = 'watcher-styles';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #watcher-widget * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      #watcher-widget {
        position: fixed;
        top: 30px;
        left: 30px;
        z-index: 2147483647;
        cursor: pointer;
        will-change: left, top;
        user-select: none;
      }

      .watcher-eye {
        width: 90px;
        height: 90px;
        border: 3px solid #D4BBFF;
        border-radius: 50%;
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease;
        background-color: #1a1625;
        box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
      }

      .watcher-eye-hemisphere {
        position: absolute;
        width: 50%;
        height: 100%;
        pointer-events: none;
        transition: transform 0.05s ease-out, border-radius 0.05s ease-out;
      }

      .watcher-eye::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle at 50% 50%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.15) 100%);
        pointer-events: none;
      }

      @keyframes watcher-eyeShake {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-2px, 1px); }
        20% { transform: translate(2px, -1px); }
        30% { transform: translate(-1px, 2px); }
        40% { transform: translate(1px, -2px); }
        50% { transform: translate(-2px, -1px); }
        60% { transform: translate(2px, 1px); }
        70% { transform: translate(-1px, -2px); }
        80% { transform: translate(1px, 2px); }
        90% { transform: translate(-2px, 1px); }
      }

      @keyframes watcher-pupilShakeSubtle {
        0%, 100% {
          transform: translate(calc(-50% + var(--pupil-x, 0px)), calc(-50% + var(--pupil-y, 0px)));
        }
        25% {
          transform: translate(calc(-50% + var(--pupil-x, 0px) + 0.3px), calc(-50% + var(--pupil-y, 0px) + 0.2px));
        }
        50% {
          transform: translate(calc(-50% + var(--pupil-x, 0px) - 0.2px), calc(-50% + var(--pupil-y, 0px) - 0.3px));
        }
        75% {
          transform: translate(calc(-50% + var(--pupil-x, 0px) + 0.2px), calc(-50% + var(--pupil-y, 0px) - 0.2px));
        }
      }

      @keyframes watcher-pupilShakeStrong {
        0%, 100% { transform: translate(-50%, -50%); }
        10% { transform: translate(calc(-50% + 2px), calc(-50% + 1px)); }
        20% { transform: translate(calc(-50% - 2px), calc(-50% - 1px)); }
        30% { transform: translate(calc(-50% + 1px), calc(-50% + 2px)); }
        40% { transform: translate(calc(-50% - 1px), calc(-50% - 2px)); }
        50% { transform: translate(calc(-50% + 2px), calc(-50% - 1px)); }
        60% { transform: translate(calc(-50% - 2px), calc(-50% + 1px)); }
        70% { transform: translate(calc(-50% + 1px), calc(-50% - 2px)); }
        80% { transform: translate(calc(-50% - 1px), calc(-50% + 2px)); }
        90% { transform: translate(calc(-50% + 2px), calc(-50% + 1px)); }
      }

      .watcher-eye.hovering {
        animation: watcher-eyeShake 0.5s ease-in-out;
      }

      .watcher-pupil.hovering {
        animation: watcher-pupilShakeStrong 0.6s ease-in-out infinite !important;
        background: #FF4444 !important;
      }

      .watcher-iris {
        width: 36px;
        height: 36px;
        background: radial-gradient(circle, transparent 0%, transparent 50%, #D4BBFF 51%, #D4BBFF 100%);
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transition: background 0.3s ease, opacity 0.3s ease;
        will-change: transform;
      }

      .watcher-pupil {
        width: 28px;
        height: 28px;
        background: #FFB3D9;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transition: background 0.3s ease, opacity 0.3s ease;
        will-change: transform;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        --pupil-x: 0px;
        --pupil-y: 0px;
        animation: watcher-pupilShakeSubtle 2s ease-in-out infinite;
      }

      .watcher-pupil-canvas {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        pointer-events: none;
      }

      .watcher-pupil-icon {
        width: 10px;
        height: 10px;
        opacity: 0;
        transition: opacity 0.2s ease;
        position: absolute;
      }

      .watcher-pupil-icon.active {
        opacity: 0.9;
      }

      .watcher-pupil-letter {
        font-size: 7px;
        font-weight: 900;
        color: white;
        opacity: 0;
        transition: opacity 0.2s ease;
        position: absolute;
        text-shadow: 0 0 3px rgba(0,0,0,0.5);
        max-width: 18px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .watcher-pupil-letter.active {
        opacity: 1;
      }

      .watcher-radial-menu {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
      }

      .watcher-radial-menu.active {
        opacity: 1;
        pointer-events: all;
      }

      .watcher-menu-item {
        position: absolute;
        width: 45px;
        height: 45px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        cursor: pointer;
        transform-origin: center;
      }

      .watcher-menu-item:nth-child(1) { background: rgba(212,187,255,0.6); }
      .watcher-menu-item:nth-child(2) { background: rgba(255,179,217,0.6); }
      .watcher-menu-item:nth-child(3) { background: rgba(165,216,255,0.6); }
      .watcher-menu-item:nth-child(4) { background: rgba(178,245,234,0.6); }
      .watcher-menu-item:nth-child(5) { background: rgba(255,184,184,0.6); }
      .watcher-menu-item:nth-child(6) { background: rgba(255,244,179,0.6); }
      .watcher-menu-item:nth-child(7) { background: rgba(200,150,255,0.6); }
      .watcher-menu-item:nth-child(8) { background: rgba(255,150,200,0.6); }

      .watcher-menu-item img {
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 0 4px rgba(255,179,217,0.4));
        transition: transform 0.3s ease;
      }

      .watcher-menu-item:hover {
        border-color: rgba(255,255,255,0.6);
        filter: brightness(1.2);
      }

      .watcher-menu-item:hover img {
        transform: scale(1.2);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * =========================
   *  DOM
   * =========================
   */
  const container = createEl('div', { id: 'watcher-widget' }, document.body);
  container.innerHTML = `
    <div class="watcher-eye">
      <div class="watcher-eye-hemisphere"></div>
      <div class="watcher-iris"></div>
      <div class="watcher-pupil">
        <canvas class="watcher-pupil-canvas" width="28" height="28"></canvas>
        <img class="watcher-pupil-icon" src="" alt="">
        <span class="watcher-pupil-letter"></span>
      </div>
    </div>
    <div class="watcher-radial-menu">
      <div class="watcher-menu-item" data-icon="https://cdn-icons-png.flaticon.com/128/1946/1946488.png"><img src="https://cdn-icons-png.flaticon.com/128/1946/1946488.png" alt=""></div>
      <div class="watcher-menu-item" data-icon="https://cdn-icons-png.flaticon.com/128/3687/3687412.png"><img src="https://cdn-icons-png.flaticon.com/128/3687/3687412.png" alt=""></div>
      <div class="watcher-menu-item" data-icon="https://cdn-icons-png.flaticon.com/128/3767/3767084.png"><img src="https://cdn-icons-png.flaticon.com/128/3767/3767084.png" alt=""></div>
      <div class="watcher-menu-item" data-icon="https://cdn-icons-png.flaticon.com/128/3524/3524388.png"><img src="https://cdn-icons-png.flaticon.com/128/3524/3524388.png" alt=""></div>
      <div class="watcher-menu-item" data-icon="https://cdn-icons-png.flaticon.com/128/2618/2618245.png"><img src="https://cdn-icons-png.flaticon.com/128/2618/2618245.png" alt=""></div>
      <div class="watcher-menu-item" data-icon="https://cdn-icons-png.flaticon.com/128/15869/15869386.png"><img src="https://cdn-icons-png.flaticon.com/128/15869/15869386.png" alt=""></div>
      <div class="watcher-menu-item" data-icon="https://cdn-icons-png.flaticon.com/128/471/471662.png"><img src="https://cdn-icons-png.flaticon.com/128/471/471662.png" alt=""></div>
      <div class="watcher-menu-item" data-icon="https://cdn-icons-png.flaticon.com/128/2491/2491199.png"><img src="https://cdn-icons-png.flaticon.com/128/2491/2491199.png" alt=""></div>
    </div>
  `;

  const eyeContainer = container;
  const eye = container.querySelector('.watcher-eye');
  const eyeHemisphere = container.querySelector('.watcher-eye-hemisphere');
  const iris = container.querySelector('.watcher-iris');
  const pupil = container.querySelector('.watcher-pupil');
  const pupilCanvas = container.querySelector('.watcher-pupil-canvas');
  const pupilCtx = pupilCanvas.getContext('2d');
  const pupilIcon = container.querySelector('.watcher-pupil-icon');
  const pupilLetter = container.querySelector('.watcher-pupil-letter');
  const radialMenu = container.querySelector('.watcher-radial-menu');
  const menuItems = container.querySelectorAll('.watcher-menu-item');

  // Position menu items in a circle
  (function positionMenuItems() {
    const radius = 100;
    const count = menuItems.length;
    menuItems.forEach((item, index) => {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      item.style.left = `calc(50% + ${x}px)`;
      item.style.top = `calc(50% + ${y}px)`;
      item.style.transform = 'translate(-50%, -50%)';
    });
  })();

  /**
   * =========================
   *  STATE
   * =========================
   */
  let curPupilX = 0;
  let curPupilY = 0;
  let curIrisX = 0;
  let curIrisY = 0;
  let tarPupilX = 0;
  let tarPupilY = 0;
  let tarIrisX = 0;
  let tarIrisY = 0;

  let eyeColor = '#D4BBFF';
  let menuOpen = false;

  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let wasDragged = false;

  let mouseDownX = 0;
  let mouseDownY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  let animationFrameId = null;

  // DREAM LIGHT ENGINE integration
  let dreamColorPicker = null;
  let dreamClearScene = null;

  /**
   * =========================
   *  COLOR HELPERS
   * =========================
   */

  function parseHex(hex) {
    const normalized = hex.trim();
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    if (!result) return null;
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  function hexToRgba(hex, alpha = 1) {
    const rgb = parseHex(hex);
    if (!rgb) {
      return `rgba(212, 187, 255, ${alpha})`;
    }
    const { r, g, b } = rgb;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function clampByte(value) {
    return Math.max(0, Math.min(255, value));
  }

  function adjustBrightness(hex, percent) {
    const rgb = parseHex(hex);
    if (!rgb) return hex;

    const factor = percent / 100;
    const r = clampByte(rgb.r + rgb.r * factor);
    const g = clampByte(rgb.g + rgb.g * factor);
    const b = clampByte(rgb.b + rgb.b * factor);

    const toHex = (v) => Math.round(v).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function mixColors(hex1, hex2, weight = 0.5) {
    const c1 = parseHex(hex1);
    const c2 = parseHex(hex2);
    if (!c1 || !c2) return hex1;

    const w = Math.max(0, Math.min(1, weight));
    const r = clampByte(c1.r * (1 - w) + c2.r * w);
    const g = clampByte(c1.g * (1 - w) + c2.g * w);
    const b = clampByte(c1.b * (1 - w) + c2.b * w);

    const toHex = (v) => Math.round(v).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * =========================
   *  COLOR PICKER INTEGRATION
   * =========================
   */

  function updateColorsFromPicker() {
    if (!dreamColorPicker || !Array.isArray(dreamColorPicker.colors) || dreamColorPicker.colors.length < 3) {
      return;
    }

    const color1 = dreamColorPicker.colors[0].hexString; // Light color
    const color2 = dreamColorPicker.colors[1].hexString; // Square color
    const color3 = dreamColorPicker.colors[2].hexString; // Window color

    eyeColor = color1;

    // Eye border / base
    eye.style.borderColor = color1;
    eye.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.5)';

    // Iris ring
    iris.style.background = `radial-gradient(circle, transparent 0%, transparent 50%, ${color2} 51%, ${color2} 100%)`;

    // Menu palette (no assumptions about meaning, just use palette)
    const menuColorsPalette = [
      color1,
      color2,
      color3,
      adjustBrightness(color1, 15),
      adjustBrightness(color2, -10),
      adjustBrightness(color3, 20),
      mixColors(color1, color2),
      mixColors(color2, color3)
    ];

    menuItems.forEach((item, index) => {
      const bgColor = menuColorsPalette[index % menuColorsPalette.length];
      item.style.background = hexToRgba(bgColor, 0.6);
    });
  }

  /**
   * Public API
   */
  window.WATCHER = {
    /**
     * Connect external color picker object
     */
    setColorPicker(picker) {
      dreamColorPicker = picker;
      updateColorsFromPicker();
    },
    /**
     * Register callback that clears external scene
     */
    setClearSceneCallback(callback) {
      dreamClearScene = typeof callback === 'function' ? callback : null;
    }
  };

  /**
   * =========================
   *  EYE BEHAVIOR
   * =========================
   */

  function updateEyeTargetsFromMouse() {
    const rect = eye.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = currentMouseX - centerX;
    const dy = currentMouseY - centerY;

    const maxPupilOffset = 8;
    const maxIrisOffset = 4;

    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    tarPupilX = nx * maxPupilOffset;
    tarPupilY = ny * maxPupilOffset;

    tarIrisX = nx * maxIrisOffset;
    tarIrisY = ny * maxIrisOffset;
  }

  function renderPupil() {
    pupilCtx.clearRect(0, 0, pupilCanvas.width, pupilCanvas.height);
    const radius = pupilCanvas.width / 2 - 2;
    pupilCtx.beginPath();
    pupilCtx.arc(pupilCanvas.width / 2, pupilCanvas.height / 2, radius, 0, Math.PI * 2);
    pupilCtx.fillStyle = eyeColor;
    pupilCtx.fill();
  }

  function animateEye() {
    // Smooth interpolation
    const lerpFactor = 0.15;
    curPupilX += (tarPupilX - curPupilX) * lerpFactor;
    curPupilY += (tarPupilY - curPupilY) * lerpFactor;
    curIrisX += (tarIrisX - curIrisX) * lerpFactor;
    curIrisY += (tarIrisY - curIrisY) * lerpFactor;

    pupil.style.setProperty('--pupil-x', `${curPupilX}px`);
    pupil.style.setProperty('--pupil-y', `${curPupilY}px`);
    iris.style.transform = `translate(calc(-50% + ${curIrisX}px), calc(-50% + ${curIrisY}px))`;

    animationFrameId = requestAnimationFrame(animateEye);
  }

  /**
   * =========================
   *  EVENTS
   * =========================
   */

  function onMouseMove(e) {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;

    if (!isDragging) {
      updateEyeTargetsFromMouse();
    } else {
      const newLeft = e.clientX - dragOffsetX;
      const newTop = e.clientY - dragOffsetY;
      eyeContainer.style.left = `${newLeft}px`;
      eyeContainer.style.top = `${newTop}px`;
      wasDragged = true;
    }
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;

    isDragging = true;
    wasDragged = false;

    const rect = eyeContainer.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    mouseDownX = e.clientX;
    mouseDownY = e.clientY;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseUp(e) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    if (!wasDragged) {
      toggleMenu();
    }

    isDragging = false;
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
    radialMenu.classList.toggle('active', menuOpen);

    if (!menuOpen && dreamClearScene) {
      dreamClearScene();
    }
  }

  function onMenuItemClick(e) {
    const item = e.currentTarget;
    const iconUrl = item.getAttribute('data-icon');
    if (!iconUrl) return;

    pupilIcon.src = iconUrl;
    pupilIcon.classList.add('active');
    pupilLetter.classList.remove('active');

    if (dreamClearScene) {
      dreamClearScene(iconUrl);
    }
  }

  /**
   * =========================
   *  INIT
   * =========================
   */

  // Base render
  renderPupil();
  animationFrameId = requestAnimationFrame(animateEye);

  // Eye drag & hover
  eye.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);

  // Radial menu interactions
  menuItems.forEach((item) => {
    item.addEventListener('click', onMenuItemClick);
  });

  /**
   * Optional cleanup API
   */
  window.removeWatcher = function removeWatcher() {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('mousemove', onMouseMove);

    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }

    const styleEl = document.getElementById(STYLE_ID);
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }

    delete window.WATCHER;
    delete window.WATCHER_LOADED;
    delete window.removeWatcher;
  };
})();