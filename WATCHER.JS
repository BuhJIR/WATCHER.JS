(function() {
    'use strict';

    // Check if already loaded
    if (window.WATCHER_LOADED) {
        console.log('WATCHER already loaded! Remove it first with: removeWatcher()');
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
            filter: drop-shadow(0 0 20px rgba(212,187,255,0.4));
            will-change: left, top;
        }

        .watcher-eye {
            width: 70px;
            height: 70px;
            border: 3px solid #D4BBFF;
            border-radius: 50%;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease;
            background-color: #1a1625;
            box-shadow:
                0 0 30px rgba(212,187,255,0.5),
                inset 0 0 20px rgba(0,0,0,0.5);
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
            box-shadow: 0 0 20px #FF4444 !important;
        }

        .watcher-iris {
            width: 28px;
            height: 28px;
            background: radial-gradient(circle, transparent 0%, transparent 50%, #D4BBFF 51%, #D4BBFF 100%);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transition: background 0.3s ease, opacity 0.3s ease;
            will-change: transform;
            box-shadow:
                inset 0 0 8px rgba(212,187,255,0.4),
                0 0 12px rgba(212,187,255,0.3);
        }

        .watcher-pupil {
            width: 12px;
            height: 12px;
            background: #FFB3D9;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            box-shadow: 0 0 15px #FFB3D9;
            transition: background 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
            will-change: transform;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            --pupil-x: 0px;
            --pupil-y: 0px;
            animation: watcher-pupilShakeSubtle 2s ease-in-out infinite;
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

        .watcher-menu-item:nth-child(1) { background: rgba(212,187,255,0.6); box-shadow: 0 0 15px rgba(212,187,255,0.5); }
        .watcher-menu-item:nth-child(2) { background: rgba(255,179,217,0.6); box-shadow: 0 0 15px rgba(255,179,217,0.5); }
        .watcher-menu-item:nth-child(3) { background: rgba(165,216,255,0.6); box-shadow: 0 0 15px rgba(165,216,255,0.5); }
        .watcher-menu-item:nth-child(4) { background: rgba(178,245,234,0.6); box-shadow: 0 0 15px rgba(178,245,234,0.5); }
        .watcher-menu-item:nth-child(5) { background: rgba(255,184,184,0.6); box-shadow: 0 0 15px rgba(255,184,184,0.5); }
        .watcher-menu-item:nth-child(6) { background: rgba(255,244,179,0.6); box-shadow: 0 0 15px rgba(255,244,179,0.5); }
        .watcher-menu-item:nth-child(7) { background: rgba(200,150,255,0.6); box-shadow: 0 0 15px rgba(200,150,255,0.5); }
        .watcher-menu-item:nth-child(8) { background: rgba(255,150,200,0.6); box-shadow: 0 0 15px rgba(255,150,200,0.5); }

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

    // Create HTML structure
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
    document.body.appendChild(container);

    // Get elements
    const eyeContainer = container;
    const eye = container.querySelector('.watcher-eye');
    const eyeHemisphere = container.querySelector('.watcher-eye-hemisphere');
    const iris = container.querySelector('.watcher-iris');
    const pupil = container.querySelector('.watcher-pupil');
    const pupilIcon = container.querySelector('.watcher-pupil-icon');
    const pupilLetter = container.querySelector('.watcher-pupil-letter');
    const radialMenu = container.querySelector('.watcher-radial-menu');
    const menuItems = container.querySelectorAll('.watcher-menu-item');

    // Position menu items in circle
    menuItems.forEach((item, index) => {
        const angle = (index / menuItems.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 90;
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

    // Update hemisphere
    function updateHemisphere(angle) {
        const R = 35;
        const shadowOffset = -0.4;
        const hw = Math.abs(shadowOffset) * R;
        const lightAngle = angle + Math.PI;
        const degrees = lightAngle * 180 / Math.PI;
        const brightColor = 'rgba(255, 255, 255, 0.25)';

        eyeHemisphere.style.cssText = `
            position: absolute;
            right: 0;
            width: ${R + hw}px;
            height: 70px;
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
        if(elem.nodeType == elem.TEXT_NODE) {
            var range = elem.ownerDocument.createRange();
            range.selectNodeContents(elem);
            var currentPos = 0;
            var endPos = range.endOffset;
            while(currentPos+1 < endPos) {
                range.setStart(elem, currentPos);
                range.setEnd(elem, currentPos+1);
                if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
                   range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
                    range.expand("word");
                    var ret = range.toString();
                    range.detach();
                    return ret;
                }
                currentPos += 1;
            }
        } else {
            for(var i = 0; i < elem.childNodes.length; i++) {
                var childRange = elem.childNodes[i].ownerDocument.createRange();
                childRange.selectNodeContents(elem.childNodes[i]);
                if(childRange.getBoundingClientRect().left <= x && childRange.getBoundingClientRect().right >= x &&
                   childRange.getBoundingClientRect().top <= y && childRange.getBoundingClientRect().bottom >= y) {
                    childRange.detach();
                    return getWordAtPoint(elem.childNodes[i], x, y);
                } else {
                    childRange.detach();
                }
            }
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
        tarPupilX = Math.cos(angle) * Math.min(16, dist / 12);
        tarPupilY = Math.sin(angle) * Math.min(16, dist / 12);
        tarIrisX = Math.cos(angle) * Math.min(10, dist / 18);
        tarIrisY = Math.sin(angle) * Math.min(10, dist / 18);

        updateHemisphere(angle);

        if (menuOpen) {
            let hoveredIcon = null;
            menuItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                if (e.clientX >= itemRect.left && e.clientX <= itemRect.right &&
                    e.clientY >= itemRect.top && e.clientY <= itemRect.bottom) {
                    hoveredIcon = item.dataset.icon;
                }
            });

            if (hoveredIcon) {
                pupilIcon.src = hoveredIcon;
                pupilIcon.classList.add('active');
                pupilLetter.classList.remove('active');
            } else {
                pupilIcon.classList.remove('active');
            }
        } else {
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
        requestAnimationFrame(animate);
    }
    animate();

    // Glitch blink
    function glitchBlink() {
        if (!menuOpen) {
            blinking = true;
            const glitchColors = ['#FF00FF', '#00FFFF', eyeColor];
            let glitchStep = 0;

            const glitchInterval = setInterval(() => {
                if (glitchStep < 6) {
                    const randColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];
                    eye.style.borderColor = randColor;
                    eye.style.boxShadow = `0 0 30px ${randColor}, inset 0 0 20px rgba(0,0,0,0.5), inset -3px -3px 10px rgba(255,255,255,0.08), inset 3px 3px 10px rgba(0,0,0,0.3)`;
                    eye.style.transform = `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 4}px)`;
                    glitchStep++;
                } else {
                    clearInterval(glitchInterval);
                    eye.style.borderColor = eyeColor;
                    eye.style.boxShadow = `0 0 30px rgba(212,187,255,0.5), inset 0 0 20px rgba(0,0,0,0.5), inset -3px -3px 10px rgba(255,255,255,0.08), inset 3px 3px 10px rgba(0,0,0,0.3)`;
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

    // Drag/Click
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
                menuOpen = !menuOpen;
                radialMenu.classList.toggle('active');

                if (!menuOpen) {
                    pupilIcon.classList.remove('active');
                    pupil.style.width = '12px';
                    pupil.style.height = '12px';
                    pupil.style.background = eyeColor;
                    pupil.style.boxShadow = `0 0 15px ${eyeColor}`;
                    if (selectedItem) {
                        selectedItem.style.transform = 'translate(-50%, -50%)';
                        selectedItem.style.filter = '';
                        selectedItem.style.background = '';
                        selectedItem = null;
                    }
                } else {
                    pupilLetter.classList.remove('active');
                    if (!selectedItem) {
                        pupil.style.background = eyeColor;
                        pupil.style.boxShadow = `0 0 15px ${eyeColor}`;
                    }
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
            pupilIcon.classList.remove('active');
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

            pupilIcon.src = item.dataset.icon;
            pupilIcon.classList.add('active');
            pupil.style.width = '13.8px';
            pupil.style.height = '13.8px';

            pupil.style.background = itemColor;
            pupil.style.boxShadow = `0 0 20px ${itemColor}`;
        });
    });

    // Global remove function
    window.removeWatcher = function() {
        document.getElementById('watcher-widget')?.remove();
        document.getElementById('watcher-styles')?.remove();
        delete window.WATCHER_LOADED;
        delete window.removeWatcher;
        console.log('WATCHER removed!');
    };

    console.log('%c👁️ WATCHER loaded!', 'font-size: 20px; color: #D4BBFF;');
    console.log('%cDrag to move, click to open menu', 'color: #FFB3D9;');
    console.log('%cRemove with: removeWatcher()', 'color: #A5D8FF;');
})();
