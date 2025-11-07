(function () {
'use strict';

const WATCHER_KEY = 'WATCHER_ACTIVE';
const POSITION_KEY = 'WATCHER_POS';

// === Восстановление после reload ===
if (sessionStorage.getItem(WATCHER_KEY)) {
  const pos = JSON.parse(sessionStorage.getItem(POSITION_KEY) || '{"x":30,"y":30}');
  loadWatcher(pos.x, pos.y);
  return;
}

// === Защита от дубля ===
if (window.WATCHER_LOADED) {
  console.log('👁️ WATCHER уже запущен. removeWatcher() чтобы удалить.');
  return;
}
window.WATCHER_LOADED = true;

// === Основная функция загрузки ===
function loadWatcher(x = 30, y = 30) {
  // === CSS (оригинал + 5 кнопок + стили для красных иконок) ===
  const style = document.createElement('style');
  style.id = 'watcher-styles';
  style.textContent = `
    #watcher-widget * { margin:0; padding:0; box-sizing:border-box; }
    #watcher-widget {
      position:fixed; top:${y}px; left:${x}px; z-index:2147483647;
      cursor:pointer; filter:drop-shadow(0 0 20px rgba(212,187,255,0.4));
      will-change:left,top;
    }
    .watcher-eye {
      width:70px; height:70px; border:3px solid #D4BBFF; border-radius:50%;
      position:relative; overflow:hidden; transition:transform 0.3s;
      background:#1a1625;
      box-shadow:0 0 30px rgba(212,187,255,0.5), inset 0 0 20px rgba(0,0,0,0.5);
    }
    .watcher-eye::after {
      content:''; position:absolute; top:0; left:0; width:100%; height:100%;
      border-radius:50%;
      background:radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.15) 100%);
    }
    .watcher-eye-hemisphere {
      position:absolute; width:50%; height:100%; pointer-events:none;
      transition:transform 0.05s;
    }

    @keyframes watcher-eyeShake {0%,100%{transform:translate(0,0);}10%{transform:translate(-2px,1px);}20%{transform:translate(2px,-1px);}30%{transform:translate(-1px,2px);}40%{transform:translate(1px,-2px);}50%{transform:translate(-2px,-1px);}60%{transform:translate(2px,1px);}70%{transform:translate(-1px,-2px);}80%{transform:translate(1px,2px);}90%{transform:translate(-2px,1px);}}
    @keyframes watcher-pupilShakeSubtle {0%,100%{transform:translate(calc(-50% + var(--pupil-x)),calc(-50% + var(--pupil-y)));}25%{transform:translate(calc(-50% + var(--pupil-x)+0.3px),calc(-50% + var(--pupil-y)+0.2px));}50%{transform:translate(calc(-50% + var(--pupil-x)-0.2px),calc(-50% + var(--pupil-y)-0.3px));}75%{transform:translate(calc(-50% + var(--pupil-x)+0.2px),calc(-50% + var(--pupil-y)-0.2px));}}
    @keyframes watcher-pupilShakeStrong {0%,100%{transform:translate(-50%,-50%);}10%{transform:translate(calc(-50%+2px),calc(-50%+1px));}20%{transform:translate(calc(-50%-2px),calc(-50%-1px));}30%{transform:translate(calc(-50%+1px),calc(-50%+2px));}40%{transform:translate(calc(-50%-1px),calc(-50%-2px));}50%{transform:translate(calc(-50%+2px),calc(-50%-1px));}60%{transform:translate(calc(-50%-2px),calc(-50%+1px));}70%{transform:translate(calc(-50%+1px),calc(-50%-2px));}80%{transform:translate(calc(-50%-1px),calc(-50%+2px));}90%{transform:translate(calc(-50%+2px),calc(-50%+1px));}}

    .watcher-eye.hovering { animation:watcher-eyeShake 0.5s ease-in-out; }
    .watcher-pupil.hovering {
      animation:watcher-pupilShakeStrong 0.6s infinite !important;
      background:#FF4444 !important;
      box-shadow:0 0 20px #FF4444 !important;
    }

    .watcher-iris {
      width:28px; height:28px;
      background:radial-gradient(circle,transparent 0%,transparent 50%,#D4BBFF 51%,#D4BBFF 100%);
      border-radius:50%; position:absolute; top:50%; left:50%;
      box-shadow:inset 0 0 8px rgba(212,187,255,0.4),0 0 12px rgba(212,187,255,0.3);
    }
    .watcher-pupil {
      width:12px; height:12px; background:#FFB3D9; border-radius:50%;
      position:absolute; top:50%; left:50%;
      box-shadow:0 0 15px #FFB3D9;
      --pupil-x:0px; --pupil-y:0px;
      animation:watcher-pupilShakeSubtle 2s infinite;
    }
    .watcher-pupil-icon { width:10px; height:10px; opacity:0; transition:opacity 0.2s; position:absolute; }
    .watcher-pupil-icon.active { opacity:0.9; }
    .watcher-pupil-letter {
      font:7px/1 sans-serif; font-weight:900; color:white; opacity:0;
      transition:opacity 0.2s; position:absolute;
      text-shadow:0 0 3px rgba(0,0,0,0.5);
      max-width:18px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
    }
    .watcher-pupil-letter.active { opacity:1; }

    .watcher-radial-menu {
      position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
      opacity:0; pointer-events:none; transition:opacity 0.4s;
    }
    .watcher-radial-menu.active { opacity:1; pointer-events:all; }

    .watcher-menu-item {
      position:absolute; width:45px; height:45px;
      border:2px solid rgba(255,255,255,0.3); border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      transition:all 0.3s; cursor:pointer;
    }
    .watcher-menu-item:nth-child(1){background:rgba(255,85,85,0.6);box-shadow:0 0 15px rgba(255,85,85,0.5);}
    .watcher-menu-item:nth-child(2){background:rgba(170,51,51,0.6);box-shadow:0 0 15px rgba(170,51,51,0.5);}
    .watcher-menu-item:nth-child(3){background:rgba(221,51,51,0.6);box-shadow:0 0 15px rgba(221,51,51,0.5);}
    .watcher-menu-item:nth-child(4){background:rgba(119,34,34,0.6);box-shadow:0 0 15px rgba(119,34,34,0.5);}
    .watcher-menu-item:nth-child(5){background:rgba(204,34,68,0.6);box-shadow:0 0 15px rgba(204,34,68,0.5);}
    .watcher-menu-item img { width:24px; height:24px; filter:drop-shadow(0 0 4px rgba(255,85,85,0.4)); }
    .watcher-menu-item:hover { border-color:rgba(255,255,255,0.8); }
    .watcher-menu-item:hover img { transform:scale(1.2); }
  `;
  document.head.appendChild(style);

  // === HTML (5 кнопок) ===
  const container = document.createElement('div');
  container.id = 'watcher-widget';
  container.innerHTML = `
    <div class="watcher-eye">
      <div class="watcher-eye-hemisphere"></div>
      <div class="watcher-iris"></div>
      <div class="watcher-pupil">
        <img class="watcher-pupil-icon" src="" alt="">
        <span class="watcher-pupil-letter"></span>
      </div>
    </div>
    <div class="watcher-radial-menu">
      <div class="watcher-menu-item" data-action="pick" data-icon="https://cdn-icons-png.flaticon.com/128/1044/1044679.png"><img src="https://cdn-icons-png.flaticon.com/128/1044/1044679.png" alt="🎨"></div>
      <div class="watcher-menu-item" data-action="close" data-icon="https://cdn-icons-png.flaticon.com/128/1828/1828778.png"><img src="https://cdn-icons-png.flaticon.com/128/1828/1828778.png" alt="CloseOperation"></div>
      <div class="watcher-menu-item" data-action="reload" data-icon="https://cdn-icons-png.flaticon.com/128/126/126469.png"><img src="https://cdn-icons-png.flaticon.com/128/126/126469.png" alt="🔄"></div>
      <div class="watcher-menu-item" data-action="console" data-icon="https://cdn-icons-png.flaticon.com/128/11986/11986510.png"><img src="https://cdn-icons-png.flaticon.com/128/11986/11986510.png" alt="⌨️"></div>
      <div class="watcher-menu-item" data-action="task" data-icon="https://cdn-icons-png.flaticon.com/128/3916/3916088.png"><img src="https://cdn-icons-png.flaticon.com/128/3916/3916088.png" alt="📋"></div>
    </div>
  `;
  document.body.appendChild(container);

  // === ЭЛЕМЕНТЫ ===
  const eye = container.querySelector('.watcher-eye');
  const hemi = container.querySelector('.watcher-eye-hemisphere');
  const iris = container.querySelector('.watcher-iris');
  const pupil = container.querySelector('.watcher-pupil');
  const icon = container.querySelector('.watcher-pupil-icon');
  const letter = container.querySelector('.watcher-pupil-letter');
  const menu = container.querySelector('.watcher-radial-menu');
  const items = container.querySelectorAll('.watcher-menu-item');

  // === РАСПОЛОЖЕНИЕ МЕНЮ ===
  items.forEach((item, i) => {
    const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
    const r = 90;
    item.style.left = `calc(50% + ${Math.cos(a) * r}px)`;
    item.style.top = `calc(50% + ${Math.sin(a) * r}px)`;
    item.style.transform = 'translate(-50%, -50%)';
  });

  // === СОСТОЯНИЯ ===
  let curPX = 0, curPY = 0, curIX = 0, curIY = 0;
  let tarPX = 0, tarPY = 0, tarIX = 0, tarIY = 0;
  let eyeTime = 0, eyeColor = '#D4BBFF', menuOpen = false, blinking = false;
  let isDragging = false, dX = 0, dY = 0, wasDragged = false;
  let selectedItem = null;
  let mDownX = 0, mDownY = 0;

  // === Hemisphere update ===
  function updateHemisphere(angle) {
    const R = 35, hw = 0.4 * R, lightAngle = angle + Math.PI, deg = lightAngle * 180 / Math.PI;
    hemi.style.cssText = `
      position:absolute; right:0; width:${R + hw}px; height:70px;
      border-radius:${hw}px ${R}px ${R}px ${hw}px;
      background-color:rgba(255,255,255,0.25);
      transform:rotate(${deg}deg); transform-origin:${R}px ${R}px;
    `;
  }

  // === БЕЗОПАСНОЕ выделение слова — ИСПРАВЛЕНО ===
  function getWordAtPoint(node, x, y) {
    if (!node || !node.ownerDocument) return null;

    if (node.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      range.selectNodeContents(node);
      for (let i = 0; i < node.textContent.length; i++) {
        try {
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const rect = range.getBoundingClientRect();
          if (rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom) {
            range.expand('word');
            const word = range.toString().trim().toUpperCase();
            range.detach();
            return word;
          }
        } catch (e) {}
      }
      range.detach();
      return null;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const cr = child.getBoundingClientRect();
          if (cr.left <= x && x <= cr.right && cr.top <= y && y <= cr.bottom) {
            return getWordAtPoint(child, x, y);
          }
        } else if (child.nodeType === Node.TEXT_NODE) {
          const w = getWordAtPoint(child, x, y);
          if (w) return w;
        }
      }
    }
    return null;
  }

  // === АВТОДВИЖЕНИЕ ===
  function moveEye() {
    if (!isDragging && !wasDragged) {
      eyeTime += 0.0005;
      const w = Math.sin(eyeTime * 0.5) + Math.sin(eyeTime * 0.7 + 1.5) * 0.5 + Math.sin(eyeTime * 0.3 + 3) * 0.3;
      const px = 30 + ((w / 1.8 + 1) / 2) * (window.innerWidth - 60);
      const py = 30 + Math.sin(eyeTime * 1.3) * 8;
      container.style.left = px + 'px';
      container.style.top = py + 'px';
    }
    requestAnimationFrame(moveEye);
  }
  moveEye();

  // === ОТСЛЕЖИВАНИЕ КУРСОРА ===
  document.addEventListener('mousemove', e => {
    if (isDragging) {
      container.style.left = (e.clientX - dX) + 'px';
      container.style.top = (e.clientY - dY) + 'px';
      return;
    }
    if (blinking) return;

    const r = container.getBoundingClientRect();
    const cx = r.left + 35, cy = r.top + 35;
    const a = Math.atan2(e.clientY - cy, e.clientX - cx);
    const d = Math.hypot(e.clientX - cx, e.clientY - cy);
    tarPX = Math.cos(a) * Math.min(16, d / 12);
    tarPY = Math.sin(a) * Math.min(16, d / 12);
    tarIX = Math.cos(a) * Math.min(10, d / 18);
    tarIY = Math.sin(a) * Math.min(10, d / 18);
    updateHemisphere(a);

    if (menuOpen) {
      let hovered = null;
      items.forEach(i => {
        const ir = i.getBoundingClientRect();
        if (e.clientX >= ir.left && e.clientX <= ir.right && e.clientY >= ir.top && e.clientY <= ir.bottom) {
          hovered = i.dataset.icon;
        }
      });
      if (hovered) {
        icon.src = hovered;
        icon.classList.add('active');
        letter.classList.remove('active');
      } else {
        icon.classList.remove('active');
      }
    } else {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const word = el && el !== container && !container.contains(el) ? getWordAtPoint(el, e.clientX, e.clientY) : null;
      if (word) {
        letter.textContent = word;
        letter.classList.add('active');
      } else {
        letter.classList.remove('active');
      }
    }
  });

  // === АНИМАЦИЯ ЗРАЧКА ===
  function animate() {
    const s = blinking ? 0.4 : 0.15;
    curPX += (tarPX - curPX) * s;
    curPY += (tarPY - curPY) * s;
    curIX += (tarIX - curIX) * s;
    curIY += (tarIY - curIY) * s;
    pupil.style.setProperty('--pupil-x', curPX + 'px');
    pupil.style.setProperty('--pupil-y', curPY + 'px');
    iris.style.transform = `translate(calc(-50% + ${curIX}px), calc(-50% + ${curIY}px))`;
    requestAnimationFrame(animate);
  }
  animate();

  // === ГЛИТЧ-МИГАНИЕ ===
  function glitchBlink() {
    if (!menuOpen) {
      blinking = true;
      const cols = ['#FF00FF', '#00FFFF', eyeColor];
      let step = 0;
      const int = setInterval(() => {
        if (step < 6) {
          const c = cols[Math.floor(Math.random() * cols.length)];
          eye.style.borderColor = c;
          eye.style.boxShadow = `0 0 30px ${c}, inset 0 0 20px rgba(0,0,0,0.5)`;
          step++;
        } else {
          clearInterval(int);
          eye.style.borderColor = eyeColor;
          eye.style.boxShadow = `0 0 30px rgba(212,187,255,0.5), inset 0 0 20px rgba(0,0,0,0.5)`;
          blinking = false;
        }
      }, 40);
    }
    setTimeout(glitchBlink, Math.random() * 6000 + 4000);
  }
  setTimeout(glitchBlink, 3000);

  // === HOVER ===
  let hoverTO;
  eye.addEventListener('mouseenter', () => {
    if (!isDragging && !menuOpen) {
      eye.classList.add('hovering');
      hoverTO = setTimeout(() => pupil.classList.add('hovering'), 500);
    }
  });
  eye.addEventListener('mouseleave', () => {
    clearTimeout(hoverTO);
    eye.classList.remove('hovering');
    pupil.classList.remove('hovering');
  });

  // === DRAG & CLICK ===
  eye.addEventListener('mousedown', e => {
    if (e.button === 0) {
      mDownX = e.clientX; mDownY = e.clientY;
      isDragging = true;
      const r = container.getBoundingClientRect();
      dX = e.clientX - r.left; dY = e.clientY - r.top;
      e.preventDefault();
    }
  });

  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const dist = Math.hypot(e.clientX - mDownX, e.clientY - mDownY);
    if (dist < 5) {
      menuOpen = !menuOpen;
      menu.classList.toggle('active', menuOpen);
      if (!menuOpen) {
        icon.classList.remove('active');
        if (selectedItem) selectedItem.style.transform = 'translate(-50%,-50%)';
        selectedItem = null;
      } else {
        letter.classList.remove('active');
      }
    } else {
      wasDragged = true;
    }
  });

  document.addEventListener('click', e => {
    if (menuOpen && !container.contains(e.target)) {
      menuOpen = false;
      menu.classList.remove('active');
      icon.classList.remove('active');
    }
  });

  // === ЦВЕТА И ДЕЙСТВИЯ ===
  const menuColors = ['#FF5555', '#AA3333', '#DD3333', '#772222', '#CC2244'];
  items.forEach((item, i) => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      if (selectedItem) {
        selectedItem.style.transform = 'translate(-50%,-50%)';
        selectedItem.style.filter = '';
        selectedItem.style.background = '';
      }
      selectedItem = item;
      const col = menuColors[i];
      item.style.transform = 'translate(-50%,-50%) scale(1.3)';
      item.style.background = col;
      item.style.filter = 'brightness(1.3) saturate(1.2)';
      icon.src = item.dataset.icon;
      icon.classList.add('active');
      pupil.style.background = col;
      pupil.style.boxShadow = `0 0 20px ${col}`;

      // === ДЕЙСТВИЯ ===
      switch (item.dataset.action) {
        case 'pick':
          const c = prompt('🎨 Введите HEX-цвет (напр. #FF5555):', eyeColor);
          if (c && /^#[0-9A-F]{6}$/i.test(c)) {
            eyeColor = c;
            eye.style.borderColor = c;
            eye.style.boxShadow = `0 0 30px ${c}, inset 0 0 20px rgba(0,0,0,0.5)`;
            iris.style.background = `radial-gradient(circle,transparent 0%,transparent 50%,${c} 51%,${c} 100%)`;
          }
          break;

        case 'close':
          removeWatcher();
          break;

        case 'reload':
          const r = container.getBoundingClientRect();
          sessionStorage.setItem(WATCHER_KEY, '1');
          sessionStorage.setItem(POSITION_KEY, JSON.stringify({ x: r.left, y: r.top }));
          location.reload();
          break;

        case 'console':
          console.clear();
          console.log('%c✅ Консоль активирована через WATCHER', 'color:#FF5555;font-weight:bold;');
          new Function('debugger')();
          break;

        case 'task':
          const urls = ['about:performance', 'chrome://system', 'edge://performance'];
          let opened = false;
          for (const u of urls) {
            try {
              const w = window.open(u, '_blank', 'width=900,height=600');
              if (w && !w.closed) { opened = true; break; }
            } catch (e) {}
          }
          if (!opened) {
            console.table(performance.getEntries().slice(-5));
            alert('📋 Открыто: 5 последних записей performance в консоли.\nПолный диспетчер задач недоступен из соображений безопасности.');
          }
          break;
      }
    });
  });

  // === MUTATION OBSERVER — защита ===
  const obs = new MutationObserver(() => {
    if (!document.body.contains(container)) {
      document.body.appendChild(container);
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  // === УДАЛЕНИЕ ===
  window.removeWatcher = function () {
    obs.disconnect();
    container.remove();
    style.remove();
    sessionStorage.removeItem(WATCHER_KEY);
    sessionStorage.removeItem(POSITION_KEY);
    delete window.WATCHER_LOADED;
    delete window.removeWatcher;
    console.log('👁️ WATCHER удалён.');
  };

  // === ПЕРЕД ВЫХОДОМ — сохранить позицию ===
  window.addEventListener('beforeunload', () => {
    const r = container.getBoundingClientRect();
    sessionStorage.setItem(POSITION_KEY, JSON.stringify({ x: r.left, y: r.top }));
  });

  console.log('%c👁️ WATCHER v3 — финальная версия', 'color:#FF5555;font-weight:bold;');
  console.log('%c→ Перетащи. Клик — меню. Reload — глаз остаётся.', 'color:#AA3333');
}

loadWatcher();
})();