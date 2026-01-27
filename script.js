// ============================================
// NEWSLETTER SITE - INTERACTIVE LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. PARALLAX & ANIMATION ENGINE ---

    // Elements
    const sidebarBg = document.querySelector('.sidebar-bg');
    const topicIcons = document.querySelectorAll('.topic-icon');

    // Prepare Icons for 'Draw' Animation (Dash Offset)
    topicIcons.forEach(svg => {
        const paths = svg.querySelectorAll('path, rect, circle, line');
        paths.forEach(path => {
            const length = path.getTotalLength();
            // Set up stroke-dash for animation
            path.style.transition = 'none'; // reset
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length; // Hidden

            // Force layout reflow
            path.getBoundingClientRect();

            // Add transition back
            path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.25, 1, 0.5, 1)';
        });
    });

    // Observer for Icon Animation
    const iconObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const card = entry.target.closest('.bento-card');
            const paths = entry.target.querySelectorAll('path, rect, circle, line');

            if (entry.isIntersecting) {
                // 1. Activate CSS Animations (Pulse, Float, etc.)
                if (card) card.classList.add('active');

                // 2. Play 'Draw' Animation
                paths.forEach(path => {
                    // Ensure transition is active
                    path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.25, 1, 0.5, 1)';
                    // Draw (offset 0)
                    path.style.strokeDashoffset = '0';
                });

            } else {
                // 1. Deactivate CSS Animations
                if (card) card.classList.remove('active');

                // 2. Reset 'Draw' Animation (Hide)
                paths.forEach(path => {
                    // Disable transition for instant reset
                    path.style.transition = 'none';
                    // Reset offset to match the length (stored in strokeDasharray)
                    path.style.strokeDashoffset = path.style.strokeDasharray;
                });
            }
        });
    }, {
        threshold: 0.25 // Trigger when 25% visible
    });

    topicIcons.forEach(icon => iconObserver.observe(icon));


    // Scroll Event Listener (Throttled via requestAnimationFrame for performance)
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollY = window.pageYOffset;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax(lastScrollY);
                ticking = false;
            });
            ticking = true;
        }
    });

    function updateParallax(scrollY) {
        // Move Sidebar Background specifically (Parallax 1/3 section)
        if (sidebarBg) {
            // Move partially against scroll to create depth
            // The sidebar is sticky (top:0), so we translate the BG inside it
            // Moving it UP (negative Y) as we scroll DOWN simulates it being 'further back'
            sidebarBg.style.transform = `translateY(${scrollY * 0.1}px) scale(1.1)`;
        }
    }


    // --- 2. FOOTER INTERACTION ---

    const mainFooter = document.querySelector('.main-footer');
    const sidebarHelpers = document.querySelector('.sidebar-helpers');

    if (mainFooter && sidebarHelpers) {
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sidebarHelpers.classList.add('hidden');
                } else {
                    sidebarHelpers.classList.remove('hidden');
                }
            });
        }, { threshold: 0.1 });

        footerObserver.observe(mainFooter);
    }


    // --- 3. NEWSLETTER FORM (Sidebar) ---

    const submitBtn = document.querySelector('.sidebar-submit');
    const emailInput = document.querySelector('.sidebar-input');

    if (submitBtn && emailInput) {
        submitBtn.addEventListener('click', handleSubscribe);
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubscribe();
        });
    }

    function handleSubscribe() {
        const email = emailInput.value.trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (valid) {
            const substackUrl = `https://lucacutrono.substack.com/subscribe?email=${encodeURIComponent(email)}`;
            window.open(substackUrl, '_blank');

            submitBtn.innerText = "Reindirizzamento...";
            emailInput.value = "";
            setTimeout(() => submitBtn.innerText = "ISCRIVITI", 2500);
        } else {
            // Shake Input
            emailInput.style.color = '#ff4444';
            setTimeout(() => emailInput.style.color = 'white', 500);
        }
    }

    // --- 4. COOKIE BANNER ---
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieAccept = document.getElementById('cookieAccept');
    const cookieReject = document.getElementById('cookieReject');

    if (cookieBanner && cookieAccept && cookieReject) {
        // Check if user has already made a choice
        const cookieChoice = localStorage.getItem('cookieConsent');

        // If no choice, show banner after a short delay
        if (!cookieChoice) {
            setTimeout(() => {
                cookieBanner.classList.add('visible');
            }, 500);
        }

        // Handle Accept (Gravity Physics Explosion)
        cookieAccept.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');

            // 1. Trigger Banner Explosion
            cookieBanner.classList.add('explode');

            const rect = cookieBanner.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;

            // Physics Constants
            const particleCount = 80;
            const gravity = 0.5;
            const floor = window.innerHeight;

            // Store particles to animate
            const particles = [];

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('cookie-particle');

                // Random Style Variation (v1, v2, v3) based on probability
                const r = Math.random();
                if (r < 0.33) particle.classList.add('v1');
                else if (r < 0.66) particle.classList.add('v2');
                else particle.classList.add('v3');

                // Initial State
                const size = 20 + Math.random() * 15; // Variable size
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = '0px';
                particle.style.top = '0px';

                // Physics State
                const pObj = {
                    element: particle,
                    x: startX,
                    y: startY,
                    vx: (Math.random() - 0.5) * 20, // Explode horizontal
                    vy: -(Math.random() * 20 + 10), // Explode UP
                    rot: Math.random() * 360,
                    vRot: (Math.random() - 0.5) * 20,
                    type: 'cookie'
                };

                particles.push(pObj);
                document.body.appendChild(particle);
            }

            // Animation Loop
            let startTime = null;
            function updatePhysics(time) {
                if (!startTime) startTime = time;
                const progress = time - startTime;

                // Loop backwards so we can add new particles safely
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];

                    // Apply Gravity
                    p.vy += gravity;

                    // Update Position
                    p.x += p.vx;
                    p.y += p.vy;
                    p.rot += p.vRot;

                    // Floor Collision (Bounce/Slide)
                    if (p.y > floor - 30) {
                        p.y = floor - 30;
                        p.vy *= -0.5; // Bounce damp
                        p.vx *= 0.95; // Friction
                        p.vRot *= 0.9;

                        // Spawn Crumbs (Only big cookies, chance based)
                        if (p.type === 'cookie' && Math.abs(p.vy) > 2 && Math.random() > 0.7) {
                            // Create Crumb
                            const crumb = document.createElement('div');
                            crumb.classList.add('crumb-particle');
                            crumb.style.left = '0px'; crumb.style.top = '0px';
                            document.body.appendChild(crumb);

                            particles.push({
                                element: crumb,
                                x: p.x,
                                y: p.y,
                                vx: (Math.random() - 0.5) * 10,
                                vy: (Math.random() * -5), // Low hop
                                rot: 0,
                                vRot: 0,
                                type: 'crumb'
                            });
                        }
                    }

                    // Render
                    p.element.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
                }

                // Continue loop for 4 seconds, then cleanup
                if (progress < 4000) {
                    requestAnimationFrame(updatePhysics);
                } else {
                    // Fade out phase
                    particles.forEach(p => {
                        p.element.style.opacity = '0';
                        setTimeout(() => p.element.remove(), 1000);
                    });
                }
            }
            requestAnimationFrame(updatePhysics);

            // 4. Remove Banner Logic
            setTimeout(() => {
                cookieBanner.classList.remove('visible');
                cookieBanner.classList.remove('explode');
            }, 600);
        });

        // Handle Reject (Essential Only - Milk Dunk Animation)
        cookieReject.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'essential');

            // 1. Hide Banner immediately
            cookieBanner.classList.remove('visible');

            // 2. Activate Milk Scene
            const milkScene = document.getElementById('milkScene');
            const milkCup = document.getElementById('milkCup');
            const actorCookie = document.getElementById('actorCookie');

            if (milkScene && milkCup && actorCookie) {
                milkScene.classList.add('active'); // Visible container

                // Allow browser paint
                setTimeout(() => {
                    // Slide Cup In
                    milkCup.classList.add('center');
                }, 100);

                // 3. Cookie Appears & Dunks
                setTimeout(() => {
                    actorCookie.classList.add('appear'); // Pop up

                    setTimeout(() => {
                        actorCookie.classList.add('dunk'); // Dunk
                    }, 500); // Wait for appear
                }, 800); // Wait for cup to center

                // 4. Cup Departs (Wheelie)
                setTimeout(() => {
                    milkCup.classList.add('depart'); // Vroom to left
                }, 2500); // After dunk finishes

                // 5. Cleanup
                setTimeout(() => {
                    milkScene.classList.remove('active');
                    // Reset classes for replayability if needed (DEV mode)
                    milkCup.classList.remove('center', 'depart');
                    actorCookie.classList.remove('appear', 'dunk');
                }, 3200);
            }
        });
    }

    // Console Signature
    console.log('Luca Cutrono - Tech & Strategy. System Active.');
});
