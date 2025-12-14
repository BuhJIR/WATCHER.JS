(function() {
    'use strict';

    // Check if already loaded
    if (window.WATCHER_LOADED) {
        return;
    }
    window.WATCHER_LOADED = true;

    // Inject CSS
    const style = document.createElement('style');
    style.id = 'watcher-styles';
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
            z-index: 999999;
            cursor: pointer;
            will-change: left, top;
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
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
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
            0%, 100% { transform: translate(calc(-50% + var(--pupil-x, 0px)), calc(-50% + var(--pupil-y, 0px))); }
            25% { transform: translate(calc(-50% + var(--pupil-x, 0px) + 0.3px), calc(-50% + var(--pupil-y, 0px) + 0.2px)); }
            50% { transform: translate(calc(-50% + var(--pupil-x, 0px) - 0.2px), calc(-50% + var(--pupil-y, 0px) - 0.3px)); }
            75% { transform: translate(calc(-50% + var(--pupil-x, 0px) + 0.2px), calc(-50% + var(--pupil-y, 0px) - 0.2px)); }
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

        .watcher-emoji {
            font-size: 22px;
            filter: drop-shadow(0 0 4px rgba(255,179,217,0.4));
            transition: transform 0.3s ease;
        }

        .watcher-menu-item:hover {
            border-color: rgba(255,255,255,0.6);
            filter: brightness(1.2);
        }

        .watcher-menu-item:hover .watcher-emoji {
            transform: scale(1.2);
        }

        .watcher-pupil-emoji {
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.2s ease;
            position: absolute;
        }

        .watcher-pupil-emoji.active {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Create HTML structure
    const container = document.createElement('div');
    container.id = 'watcher-widget';
    container.innerHTML = `
        <div class="watcher-eye">
            <div class="watcher-eye-hemisphere"></div>
            <div class="watcher-iris"></div>
            <div class="watcher-pupil">
                <canvas class="watcher-pupil-canvas" width="28" height="28"></canvas>
                <span class="watcher-pupil-emoji"></span>
                <span class="watcher-pupil-letter"></span>
            </div>
        </div>
        <div class="watcher-radial-menu">
            <div class="watcher-menu-item" data-emoji="🎨"><span class="watcher-emoji">🎨</span></div>
            <div class="watcher-menu-item" data-emoji="💡"><span class="watcher-emoji">💡</span></div>
            <div class="watcher-menu-item" data-emoji="🧱"><span class="watcher-emoji">🧱</span></div>
            <div class="watcher-menu-item" data-emoji="🔗"><span class="watcher-emoji">🔗</span></div>
            <div class="watcher-menu-item" data-emoji="💥"><span class="watcher-emoji">💥</span></div>
            <div class="watcher-menu-item" data-emoji="✂️"><span class="watcher-emoji">✂️</span></div>
            <div class="watcher-menu-item" data-emoji="🗑️"><span class="watcher-emoji">🗑️</span></div>
            <div class="watcher-menu-item" data-emoji="⚙️"><span class="watcher-emoji">⚙️</span></div>
        </div>
    `;
    document.body.appendChild(container);

    // Get elements
    const eyeContainer = container;
    const eye = container.querySelector('.watcher-eye');
    const eyeHemisphere = container.querySelector('.watcher-eye-hemisphere');
    const iris = container.querySelector('.watcher-iris');
    const pupil = container.querySelector('.watcher-pupil');
    const pupilCanvas = container.querySelector('.watcher-pupil-canvas');
    const pupilCtx = pupilCanvas.getContext('2d');
    const pupilEmoji = container.querySelector('.watcher-pupil-emoji');
    const pupilLetter = container.querySelector('.watcher-pupil-letter');
    const radialMenu = container.querySelector('.watcher-radial-menu');
    const menuItems = container.querySelectorAll('.watcher-menu-item');

    // Position menu items in circle
    menuItems.forEach((item, index) => {
        const angle = (index / menuItems.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 100;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        item.style.left = `calc(50% + ${x}px)`;
        item.style.top = `calc(50% + ${y}px)`;
        item.style.transform = 'translate(-50%, -50%)';
    });

    // State
    let curPupilX = 0, curPupilY = 0, curIrisX = 0, curIrisY = 0;
    let tarPupilX = 0, tarPupilY = 0, tarIrisX = 0, tarIrisY = 0;
    let eyeTime = 0, eyeColor = '#D4BBFF', menuOpen = false, blinking = false;
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0, wasDragged = false;
    let selectedItem = null;
    let mouseDownX = 0, mouseDownY = 0;
    let currentMouseX = 0, currentMouseY = 0;

    // Integration with DREAM LIGHT ENGINE
    let dreamColorPicker = null;
    let dreamClearScene = null;

    // Sync colors with external color picker
    window.WATCHER = {
        setColorPicker: function(picker) {
            dreamColorPicker = picker;
            updateColorsFromPicker();
        },
        setClearSceneCallback: function(callback) {
            dreamClearScene = callback;
        }
    };

    function updateColorsFromPicker() {
        if (!dreamColorPicker || !dreamColorPicker.colors || dreamColorPicker.colors.length < 3) return;

        // ÐÐ¾Ð»ÑÑÐ°ÐµÐ¼ hex ÑÐ²ÐµÑÐ° Ð¸Ð· color picker
        const color1 = dreamColorPicker.colors[0].hexString; // Light colour (Ð·ÑÐ°ÑÐ¾Ðº)
        const color2 = dreamColorPicker.colors[1].hexString; // Square colour
        const color3 = dreamColorPicker.colors[2].hexString; // Window colour (ÐÐÐ Ð¿ÑÐ¸Ð³Ð»ÑÑÐµÐ½Ð¸Ñ)

        // ÐÑÐ¸Ð¼ÐµÐ½ÑÐµÐ¼ ÑÐ²ÐµÑÐ°
        eyeColor = color1; // ÐÑÐ½Ð¾Ð²Ð½Ð¾Ð¹ ÑÐ²ÐµÑ Ð³Ð»Ð°Ð·Ð°

        // ÐÐ±Ð½Ð¾Ð²Ð»ÑÐµÐ¼ ÑÐ²ÐµÑ Ð³ÑÐ°Ð½Ð¸ÑÑ Ð³Ð»Ð°Ð·Ð°
        eye.style.borderColor = color1;
        eye.style.boxShadow = `inset 0 0 20px rgba(0,0,0,0.5)`;

        // ÐÐ±Ð½Ð¾Ð²Ð»ÑÐµÐ¼ ÑÐ²ÐµÑ Ð¸ÑÐ¸ÑÐ°
        iris.style.background = `radial-gradient(circle, transparent 0%, transparent 50%, ${color2} 51%, ${color2} 100%)`;

        // ÐÐ±Ð½Ð¾Ð²Ð»ÑÐµÐ¼ ÑÐ²ÐµÑÐ° Ð¼ÐµÐ½Ñ (Ð¸ÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÐ¼ Ð²ÑÐµ ÑÑÐ¸ ÑÐ²ÐµÑÐ° ÐÐÐ Ð¿ÑÐ¸Ð³Ð»ÑÑÐµÐ½Ð¸Ñ)
        const menuColorsPalette = [
            color1,
            color2,
            color3, // ÐÐÐ ÐÐÐÐ¬ÐÐ«Ð ÑÑÐµÑÐ¸Ð¹ ÑÐ²ÐµÑ Ð±ÐµÐ· Ð¿ÑÐ¸Ð³Ð»ÑÑÐµÐ½Ð¸Ñ
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

    // Helper functions
    function hexToRgba(hex, alpha = 1) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return `rgba(212, 187, 255, ${alpha})`;

        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function adjustBrightness(hex, percent) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return hex;

        const r = Math.max(0, Math.min(255, parseInt(result[1], 16) + (parseInt(result[1], 16) * percent / 100)));
        const g = Math.max(0, Math.min(255, parseInt(result[2], 16) + (parseInt(result[2], 16) * percent / 100)));
        const b = Math.max(0, Math.min(255, parseInt(result[3], 16) + (parseInt(result[3], 16) * percent / 100)));

        return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }

    function mixColors(color1, color2) {
        const result1 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color1);
        const result2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color2);
        if (!result1 || !result2) return color1;

        const r = Math.round((parseInt(result1[1], 16) + parseInt(result2[1], 16)) / 2);
        const g = Math.round((parseInt(result1[2], 16) + parseInt(result2[2], 16)) / 2);
        const b = Math.round((parseInt(result1[3], 16) + parseInt(result2[3], 16)) / 2);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Draw magnified view in pupil (eyedropper style)
    function drawPupilMagnification() {
        // Clear canvas
        pupilCtx.clearRect(0, 0, pupilCanvas.width, pupilCanvas.height);

        // Get main canvas
        const mainCanvas = document.getElementById('c');
        if (!mainCanvas || mainCanvas.width === 0 || mainCanvas.height === 0) {
            // Fallback color if no canvas
            pupilCtx.fillStyle = eyeColor;
            pupilCtx.beginPath();
            pupilCtx.arc(14, 14, 14, 0, Math.PI * 2);
            pupilCtx.fill();
            return;
        }

        const mainRect = mainCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Use current mouse position
        const x = currentMouseX;
        const y = currentMouseY;

        // Calculate source region
        const canvasX = x - mainRect.left;
        const canvasY = y - mainRect.top;
        const sourceX = canvasX * dpr;
        const sourceY = canvasY * dpr;

        // Zoom settings (smaller than main cursor)
        const PUPIL_ZOOM = 2;
        const sourceSize = (pupilCanvas.width / PUPIL_ZOOM) * dpr;

        try {
            // Clip to circle
            pupilCtx.save();
            pupilCtx.beginPath();
            pupilCtx.arc(14, 14, 14, 0, Math.PI * 2);
            pupilCtx.clip();

            // Draw magnified portion
            pupilCtx.imageSmoothingEnabled = false;
            pupilCtx.drawImage(
                mainCanvas,
                sourceX - sourceSize / 2, sourceY - sourceSize / 2, sourceSize, sourceSize,
                0, 0, pupilCanvas.width, pupilCanvas.height
            );
            pupilCtx.imageSmoothingEnabled = true;

            pupilCtx.restore();
        } catch (err) {
            // Fallback
            pupilCtx.fillStyle = eyeColor;
            pupilCtx.beginPath();
            pupilCtx.arc(14, 14, 14, 0, Math.PI * 2);
            pupilCtx.fill();
        }
    }

    // Update hemisphere
    function updateHemisphere(angle) {
        const R = 45;
        const shadowOffset = -0.4;
        const hw = Math.abs(shadowOffset) * R;
        const lightAngle = angle + Math.PI;
        const degrees = lightAngle * 180 / Math.PI;
        const brightColor = dreamColorPicker && dreamColorPicker.colors && dreamColorPicker.colors[2]
            ? hexToRgba(dreamColorPicker.colors[2].hexString, 0.25)
            : 'rgba(255, 255, 255, 0.25)';

        eyeHemisphere.style.cssText = `
            position: absolute;
            right: 0;
            width: ${R + hw}px;
            height: 90px;
            border-top-left-radius: ${hw}px ${R}px;
            border-bottom-left-radius: ${hw}px ${R}px;
            border-top-right-radius: ${R}px ${R}px;
            border-bottom-right-radius: ${R}px ${R}px;
            background-color: ${brightColor};
            transform: rotate(${degrees}deg);
            transform-origin: ${R}px ${R}px;
            pointer-events: none;
        `;
    }

    // Word detection
    function getWordAtPoint(elem, x, y) {
        if (!elem) return null;
        try {
            if (elem.nodeType === elem.TEXT_NODE) {
                const range = elem.ownerDocument.createRange();
                range.selectNodeContents(elem);
                const endPos = range.endOffset;
                for (let pos = 0; pos + 1 < endPos; pos++) {
                    range.setStart(elem, pos);
                    range.setEnd(elem, pos + 1);
                    const rect = range.getBoundingClientRect();
                    if (rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y) {
                        try {
                            range.expand("word");
                            const ret = range.toString();
                            range.detach();
                            return ret;
                        } catch (e) {
                            range.detach();
                            return null;
                        }
                    }
                }
                range.detach();
            } else if (elem.childNodes) {
                for (let i = 0; i < elem.childNodes.length; i++) {
                    const child = elem.childNodes[i];
                    if (!child || !child.ownerDocument) continue;
                    const childRange = child.ownerDocument.createRange();
                    childRange.selectNodeContents(child);
                    const rect = childRange.getBoundingClientRect();
                    childRange.detach();
                    if (rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y) {
                        return getWordAtPoint(child, x, y);
                    }
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    // Auto movement
    function moveEye() {
        if (!isDragging && !wasDragged) {
            eyeTime += 0.0005;
            const w1 = Math.sin(eyeTime * 0.5), w2 = Math.sin(eyeTime * 0.7 + 1.5) * 0.5, w3 = Math.sin(eyeTime * 0.3 + 3) * 0.3;
            const combined = (w1 + w2 + w3) / 1.8;
            const sw = window.innerWidth, margin = 80;
            eyeContainer.style.left = (margin + ((combined + 1) / 2) * (sw - margin * 2)) + 'px';
            eyeContainer.style.top = (30 + Math.sin(eyeTime * 1.3) * 8) + 'px';
        }
        requestAnimationFrame(moveEye);
    }
    moveEye();

    // Mouse tracking
    document.addEventListener('mousemove', e => {
        currentMouseX = e.clientX;
        currentMouseY = e.clientY;

        if (isDragging) {
            eyeContainer.style.left = (e.clientX - dragOffsetX) + 'px';
            eyeContainer.style.top = (e.clientY - dragOffsetY) + 'px';
            return;
        }

        if (blinking) return;

        const rect = eyeContainer.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
        tarPupilX = Math.cos(angle) * Math.min(20, dist / 12);
        tarPupilY = Math.sin(angle) * Math.min(20, dist / 12);
        tarIrisX = Math.cos(angle) * Math.min(14, dist / 18);
        tarIrisY = Math.sin(angle) * Math.min(14, dist / 18);

        updateHemisphere(angle);

        if (menuOpen) {
            let hoveredEmoji = null;
            menuItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                if (e.clientX >= itemRect.left && e.clientX <= itemRect.right &&
                    e.clientY >= itemRect.top && e.clientY <= itemRect.bottom) {
                    hoveredEmoji = item.dataset.emoji;
                }
            });

            if (hoveredEmoji) {
                pupilEmoji.textContent = hoveredEmoji;
                pupilEmoji.classList.add('active');
                pupilLetter.classList.remove('active');
                pupilCanvas.style.opacity = '0';
            } else {
                pupilEmoji.classList.remove('active');
                pupilCanvas.style.opacity = '1';
            }
        } else {
            pupilCanvas.style.opacity = '1';
            const elem = document.elementFromPoint(e.clientX, e.clientY);
            let word = null;

            if (elem && elem !== eyeContainer && !eyeContainer.contains(elem)) {
                word = getWordAtPoint(elem, e.clientX, e.clientY);
                if (word) {
                    word = word.trim().toUpperCase();
                }
            }

            if (word) {
                pupilLetter.textContent = word;
                pupilLetter.classList.add('active');
            } else {
                pupilLetter.classList.remove('active');
            }
        }
    });

    // Animation loop
    function animate() {
        const smooth = blinking ? 0.4 : 0.15;
        curPupilX += (tarPupilX - curPupilX) * smooth;
        curPupilY += (tarPupilY - curPupilY) * smooth;
        curIrisX += (tarIrisX - curIrisX) * smooth;
        curIrisY += (tarIrisY - curIrisY) * smooth;

        pupil.style.setProperty('--pupil-x', curPupilX + 'px');
        pupil.style.setProperty('--pupil-y', curPupilY + 'px');

        iris.style.transform = `translate(calc(-50% + ${curIrisX}px), calc(-50% + ${curIrisY}px))`;

        // Update pupil magnification
        if (!menuOpen && !selectedItem) {
            drawPupilMagnification();
        }

        requestAnimationFrame(animate);
    }
    animate();

    // Glitch blink with dynamic colors
    function glitchBlink() {
        if (!menuOpen) {
            blinking = true;
            const glitchColors = ['#FF00FF', '#00FFFF', eyeColor];
            let glitchStep = 0;

            const glitchInterval = setInterval(() => {
                if (glitchStep < 6) {
                    const randColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];
                    eye.style.borderColor = randColor;
                    eye.style.transform = `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 4}px)`;
                    glitchStep++;
                } else {
                    clearInterval(glitchInterval);
                    eye.style.borderColor = eyeColor;
                    eye.style.transform = '';
                    blinking = false;
                }
            }, 40);
        }
        setTimeout(glitchBlink, Math.random() * 6000 + 4000);
    }
    setTimeout(glitchBlink, 3000);

    // Hover animation
    let hoverTimeout;
    eye.addEventListener('mouseenter', () => {
        if (!isDragging && !menuOpen) {
            eye.classList.add('hovering');
            hoverTimeout = setTimeout(() => {
                pupil.classList.add('hovering');
                tarPupilX = 0;
                tarPupilY = 0;
            }, 500);
        }
    });

    eye.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        eye.classList.remove('hovering');
        pupil.classList.remove('hovering');
    });

    // Drag/Click/Double-click
    let lastClickTime = 0;
    const DOUBLE_CLICK_DELAY = 300; // ms

    eye.addEventListener('mousedown', e => {
        if (e.button === 0) {
            mouseDownX = e.clientX;
            mouseDownY = e.clientY;
            isDragging = true;
            const rect = eyeContainer.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            e.preventDefault();
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            eyeContainer.style.cursor = 'pointer';

            const moveDistance = Math.sqrt(Math.pow(e.clientX - mouseDownX, 2) + Math.pow(e.clientY - mouseDownY, 2));

            if (moveDistance < 5) {
                const now = Date.now();
                const timeSinceLastClick = now - lastClickTime;

                // Double click detected
                if (timeSinceLastClick < DOUBLE_CLICK_DELAY) {
                    // Reset scene
                    if (dreamClearScene && typeof dreamClearScene === 'function') {
                        // Ð­ÑÑÐµÐºÑ ÑÐ±ÑÐ¾ÑÐ°
                        eye.classList.add('hovering');
                        pupil.classList.add('hovering');

                        setTimeout(() => {
                            dreamClearScene();
                            eye.classList.remove('hovering');
                            pupil.classList.remove('hovering');
                        }, 600);
                    }
                    lastClickTime = 0; // Reset to prevent triple-click
                } else {
                    // Single click - toggle menu
                    menuOpen = !menuOpen;
                    radialMenu.classList.toggle('active');

                    if (!menuOpen) {
                        pupilEmoji.classList.remove('active');
                        pupil.style.width = '28px';
                        pupil.style.height = '28px';
                        pupilCanvas.style.opacity = '1';
                        if (selectedItem) {
                            selectedItem.style.transform = 'translate(-50%, -50%)';
                            selectedItem.style.filter = '';
                            selectedItem.style.background = '';
                            selectedItem = null;
                        }
                    } else {
                        pupilLetter.classList.remove('active');
                        pupilCanvas.style.opacity = '1';
                    }

                    lastClickTime = now;
                }
            } else {
                wasDragged = true;
            }
        }
    });

    document.addEventListener('click', e => {
        if (!isDragging && !eyeContainer.contains(e.target) && menuOpen) {
            menuOpen = false;
            radialMenu.classList.remove('active');
            pupilEmoji.classList.remove('active');
        }
    });

    // Menu item colors
    const menuColors = [
        '#D4BBFF', '#FFB3D9', '#A5D8FF', '#B2F5EA',
        '#FFB8B8', '#FFF4B3', '#C896FF', '#FF96C8'
    ];

    menuItems.forEach((item, index) => {
        item.addEventListener('click', e => {
            e.stopPropagation();

            if (selectedItem) {
                selectedItem.style.transform = 'translate(-50%, -50%)';
                selectedItem.style.filter = '';
                selectedItem.style.background = '';
            }

            selectedItem = item;
            const itemColor = menuColors[index];

            item.style.transform = 'translate(-50%, -50%) scale(1.3)';
            item.style.background = itemColor;
            item.style.filter = 'brightness(1.3) saturate(1.2)';

            pupilEmoji.textContent = item.dataset.emoji;
            pupilEmoji.classList.add('active');
            pupil.style.width = '30px';
            pupil.style.height = '30px';
            pupilCanvas.style.opacity = '0';
        });
    });

    // Global remove function
    window.removeWatcher = function() {
        document.getElementById('watcher-widget')?.remove();
        document.getElementById('watcher-styles')?.remove();
        delete window.WATCHER_LOADED;
        delete window.removeWatcher;
        delete window.WATCHER;
    };

    // Single startup message
    console.log('%c👁️ WATCHER ready %c| drag to move | click for menu | double-click to reset',
        'background: linear-gradient(90deg, #D4BBFF, #FFB3D9); color: #1a1625; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
        'background: #1a1625; color: #D4BBFF; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );
})();