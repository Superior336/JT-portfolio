/* ===================================================================
   JT Portfolio — Optimized JavaScript
   Features: Custom cursor, loader, particles, lazy video, 
   scroll reveal, video lightbox, mobile menu
   =================================================================== */

(function () {
    'use strict';

    // --- Detect touch device ---
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // =========================================================
    // 0. CUSTOM CURSOR (desktop only)
    // =========================================================
    if (!isTouchDevice) {
        const cursor = document.getElementById('custom-cursor');
        const trail = document.getElementById('cursor-trail');
        let mouseX = 0, mouseY = 0;
        let trailX = 0, trailY = 0;
        let cursorRAF = false;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!cursorRAF) {
                cursorRAF = true;
                requestAnimationFrame(function () {
                    cursor.style.left = mouseX + 'px';
                    cursor.style.top = mouseY + 'px';
                    document.body.style.setProperty('--mouse-x', mouseX + 'px');
                    document.body.style.setProperty('--mouse-y', mouseY + 'px');
                    cursorRAF = false;
                });
            }
        }, { passive: true });

        // Smooth trail follow
        function animateTrail() {
            trailX += (mouseX - trailX) * 0.15;
            trailY += (mouseY - trailY) * 0.15;
            trail.style.left = trailX + 'px';
            trail.style.top = trailY + 'px';
            requestAnimationFrame(animateTrail);
        }
        animateTrail();

        // Cursor grow on hover over interactive elements
        var interactiveEls = document.querySelectorAll('a, button, .cursor-pointer, .hover-video, input, textarea, select');
        interactiveEls.forEach(function (el) {
            el.addEventListener('mouseenter', function () { cursor.classList.add('hovered'); });
            el.addEventListener('mouseleave', function () { cursor.classList.remove('hovered'); });
        });
    }

    // =========================================================
    // 1. LOADING SCREEN
    // =========================================================
    window.addEventListener('load', function () {
        var loaderBar = document.getElementById('loader-bar');
        var loader = document.getElementById('loader');

        if (!loader) return;

        requestAnimationFrame(function () {
            loaderBar.style.width = '100%';
        });

        setTimeout(function () {
            loader.style.opacity = '0';
            loader.style.transform = 'translateY(-20%)';
            loader.style.pointerEvents = 'none';

            setTimeout(function () {
                document.querySelectorAll('#hero .reveal').forEach(function (el) {
                    el.classList.add('active');
                });
            }, 300);

            setTimeout(function () { loader.remove(); }, 1000);
        }, 1500);
    });

    // =========================================================
    // 2. FLOATING PARTICLES (hero only, capped, with visibility check)
    // =========================================================
    if (!prefersReducedMotion) {
        var particlesContainer = document.getElementById('particles');
        var heroSection = document.getElementById('hero');
        var MAX_PARTICLES = 20;
        var heroVisible = true;

        // Only create particles when hero is visible
        var heroObserver = new IntersectionObserver(function (entries) {
            heroVisible = entries[0].isIntersecting;
        }, { threshold: 0 });

        if (heroSection) heroObserver.observe(heroSection);

        function createParticle() {
            if (!heroVisible || !particlesContainer) return;
            if (particlesContainer.childElementCount >= MAX_PARTICLES) return;

            var p = document.createElement('div');
            p.classList.add('particle');
            p.style.left = Math.random() * 100 + '%';
            p.style.bottom = '-10px';
            p.style.animationDuration = (8 + Math.random() * 12) + 's';
            var size = (2 + Math.random() * 4) + 'px';
            p.style.width = size;
            p.style.height = size;
            var colors = ['rgba(168,85,247,0.6)', 'rgba(6,182,212,0.4)', 'rgba(236,72,153,0.3)'];
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            particlesContainer.appendChild(p);
            p.addEventListener('animationend', function () { p.remove(); });
        }

        setInterval(createParticle, 1000);
        for (var i = 0; i < 8; i++) setTimeout(createParticle, i * 400);
    }

    // =========================================================
    // 3. LAZY VIDEO LOADING (IntersectionObserver)
    // =========================================================
    var videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            var video = entry.target;
            if (entry.isIntersecting) {
                if (video.preload === 'none') {
                    video.preload = 'auto';
                    video.load();
                }
                video.play().catch(function () { });
            } else {
                video.pause();
            }
        });
    }, { rootMargin: '200px' });

    document.querySelectorAll('video[data-lazy-video]').forEach(function (v) {
        videoObserver.observe(v);
    });

    // =========================================================
    // 4. SCROLL REVEAL (IntersectionObserver)
    // =========================================================
    if (!prefersReducedMotion) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.reveal:not(#hero .reveal), .reveal-left').forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        // If reduced motion, show everything immediately
        document.querySelectorAll('.reveal, .reveal-left').forEach(function (el) {
            el.classList.add('active');
        });
    }

    // =========================================================
    // 5. VIDEO LIGHTBOX MODAL
    // =========================================================
    var modal = document.getElementById('video-modal');
    var modalVideo = document.getElementById('modal-video');
    var modalContent = document.getElementById('modal-content');
    var closeBtn = document.getElementById('close-modal');

    if (modal && modalVideo && modalContent && closeBtn) {
        document.querySelectorAll('.hover-video .cursor-pointer').forEach(function (triggerBlock) {
            triggerBlock.addEventListener('click', function () {
                var sourceElement = triggerBlock.querySelector('source');
                if (!sourceElement) return;

                modalVideo.querySelector('source').src = sourceElement.src;
                modalVideo.load();

                modal.classList.remove('opacity-0', 'pointer-events-none');
                modal.setAttribute('aria-hidden', 'false');

                setTimeout(function () {
                    modalContent.classList.remove('scale-95');
                    modalContent.classList.add('scale-100');
                }, 50);

                modalVideo.play();

                // Trap focus inside modal
                closeBtn.focus();
            });
        });

        var closeVideoModal = function () {
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
            modal.classList.add('opacity-0');
            modal.classList.add('pointer-events-none');
            modal.setAttribute('aria-hidden', 'true');

            setTimeout(function () {
                modalVideo.pause();
                modalVideo.currentTime = 0;
                modalVideo.querySelector('source').src = '';
            }, 500);
        };

        closeBtn.addEventListener('click', closeVideoModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal || e.target === modalContent) {
                closeVideoModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('pointer-events-none')) {
                closeVideoModal();
            }
        });
    }

    // =========================================================
    // 6. MOBILE HAMBURGER MENU
    // =========================================================
    var hamburgerBtn = document.getElementById('hamburger-btn');
    var mobileMenu = document.getElementById('mobile-menu');

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', function () {
            var isOpen = mobileMenu.classList.contains('open');
            if (isOpen) {
                mobileMenu.classList.remove('open');
                hamburgerBtn.classList.remove('active');
                document.body.style.overflow = '';
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            } else {
                mobileMenu.classList.add('open');
                hamburgerBtn.classList.add('active');
                document.body.style.overflow = 'hidden';
                hamburgerBtn.setAttribute('aria-expanded', 'true');
            }
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('open');
                hamburgerBtn.classList.remove('active');
                document.body.style.overflow = '';
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // =========================================================
    // 7. DYNAMIC COPYRIGHT YEAR
    // =========================================================
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

})();
