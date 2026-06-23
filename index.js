// -------------------------------------------------------------
// MATRIX RAIN BACKDROP WITH MOUSE-TRAIL GLOW INTERACTION
// -------------------------------------------------------------
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const characters = "0101010110101010ABCDEFxX$_<>[]{}+-*%#!?";
const charArray = characters.split('');
const fontSize = 14;
const columns = width / fontSize;

const rainDrops = Array.from({ length: columns }).fill(1);

// Mouse tracking variables
let mouseX = -1000;
let mouseY = -1000;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouseX = -1000;
    mouseY = -1000;
});

function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 8, 0.12)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < rainDrops.length; i++) {
        const charX = i * fontSize;
        const charY = rainDrops[i] * fontSize;
        
        const text = charArray[Math.floor(Math.random() * charArray.length)];

        // Calculate distance from mouse to character
        const dx = charX - mouseX;
        const dy = charY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Interactive highlighting - turns cyan near cursor
        if (distance < 120) {
            ctx.fillStyle = '#00f0ff'; // Cyan hover glow
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
        } else {
            ctx.fillStyle = '#00ff9d'; // Normal green
            ctx.shadowBlur = 0;
        }

        ctx.fillText(text, charX, charY);
        ctx.shadowBlur = 0; // reset shadow for performance

        if (charY > height && Math.random() > 0.975) {
            rainDrops[i] = 0;
        }
        rainDrops[i]++;
    }
}

let matrixInterval = setInterval(drawMatrix, 35);

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const newColumns = width / fontSize;
    if (newColumns > rainDrops.length) {
        for (let i = rainDrops.length; i < newColumns; i++) {
            rainDrops.push(Math.floor(Math.random() * height / fontSize));
        }
    }
});


// -------------------------------------------------------------
// HUD CLOCK REAL-TIME TICKER
// -------------------------------------------------------------
function updateHUDClock() {
    const clockEl = document.getElementById('hud-clock');
    if (!clockEl) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    clockEl.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
setInterval(updateHUDClock, 1000);
updateHUDClock();


// -------------------------------------------------------------
// TEXT SCRAMBLER DECRYPTION HOVER EFFECT
// -------------------------------------------------------------
class TextScrambler {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.textContent;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 30);
            const end = start + Math.floor(Math.random() * 30);
            this.queue.push({ from, to, start, end, char: '' });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="text-accent-cyan">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// -------------------------------------------------------------
// INTERACTION SYSTEM: SCROLL REVEALS & ACTIVE SLIDE OBSERVER
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Bidirectional Reveal Elements on Scroll
    const revealElements = document.querySelectorAll('.reveal-element');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // Re-trigger movement when scrolling back up/down out of view
                entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Dynamic Progress Bars Fill & Reset on Scroll
    const progressFills = document.querySelectorAll('.scroll-fill');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetWidth = entry.target.getAttribute('data-width');
                entry.target.style.width = targetWidth;
            } else {
                // Reset to 0% to re-trigger fill animation on scroll up
                entry.target.style.width = '0%';
            }
        });
    }, { threshold: 0.1 });

    progressFills.forEach(bar => progressObserver.observe(bar));

    // 3. Highlight Slide indicators during scroll
    const sections = document.querySelectorAll('.slide-section');
    const dotLinks = document.querySelectorAll('.slide-nav a');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                
                dotLinks.forEach(dot => {
                    dot.classList.remove('active');
                    if (dot.getAttribute('href') === `#${activeId}`) {
                        dot.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3 // Active when 30% of section covers the viewport
    });

    sections.forEach(sec => sectionObserver.observe(sec));

    // 4. Attach Text Scrambler to all headings on hover
    const scrambleElements = document.querySelectorAll('.scramble-text');
    scrambleElements.forEach(el => {
        const scrambler = new TextScrambler(el);
        const originalText = el.getAttribute('data-value') || el.textContent;
        let isScrambling = false;

        el.addEventListener('mouseenter', () => {
            if (isScrambling) return;
            isScrambling = true;
            scrambler.setText(originalText).then(() => {
                isScrambling = false;
            });
        });
    });

    // 5. Interactive Comfort Mode Toggle (Bypasses matrix rain and CRT overlays)
    const comfortBtn = document.getElementById('comfort-mode-btn');
    let comfortActive = false;

    if (comfortBtn) {
        comfortBtn.addEventListener('click', () => {
            comfortActive = !comfortActive;
            document.body.classList.toggle('comfort-mode', comfortActive);
            
            if (comfortActive) {
                comfortBtn.textContent = '[👁️ COMFORT: ON]';
                // Stop matrix loop to save CPU and reduce visual movement
                clearInterval(matrixInterval);
                ctx.fillStyle = 'var(--bg-primary)';
                ctx.fillRect(0, 0, width, height); // Clear code characters
            } else {
                comfortBtn.textContent = '[👁️ COMFORT: OFF]';
                // Restart matrix rain loop
                matrixInterval = setInterval(drawMatrix, 35);
            }
        });
    }
});


// -------------------------------------------------------------
// INTERACTIVE TERMINAL ENGINE
// -------------------------------------------------------------
const terminalBody = document.getElementById('terminal-body');
const terminalInput = document.getElementById('terminal-input');
const shortcutButtons = document.querySelectorAll('.shortcut-btn');

const ipList = ['192.168.1.104', '10.0.0.8', '172.16.254.1', '192.168.80.72'];
document.getElementById('hud-ip').textContent = ipList[Math.floor(Math.random() * ipList.length)];

// Command database (Scrubbed user phone number)
const COMMANDS = {
    help: `Available CLI commands:
  - <span class="text-accent-cyan">about</span> | <span class="text-accent-cyan">cat about_me.md</span> : Load profile about me details
  - <span class="text-accent-cyan">key_components</span> | <span class="text-accent-cyan">cat key_components.cfg</span> : View core mindset competencies
  - <span class="text-accent-cyan">experience</span> | <span class="text-accent-cyan">ls experience/</span> : Load professional internship syslog
  - <span class="text-accent-cyan">skills</span> | <span class="text-accent-cyan">cat skills.db</span> : Load technical skills & certifications
  - <span class="text-accent-cyan">home_lab</span> | <span class="text-accent-cyan">sh home_lab.sh</span> : Diagnostic details of local lab
  - <span class="text-accent-cyan">contact</span> | <span class="text-accent-cyan">cat contact.info</span> : Load secure gateway channels
  - <span class="text-accent-cyan">clear</span> : Clear command terminal buffer`,
    
    about: `Driven Cybersecurity and IT aspirant with a strong foundation in programming, Linux, and security fundamentals. Gaining hands-on experience through internships, workshops, labs, and continuous self-learning. Actively building practical skills with a strong security mindset and a passion for continuous improvement in the cybersecurity domain. B.Sc. Computer Science student at Madras Christian College (2024-2027).`,
    
    key_components: `CORE COMPETENCIES DECRYPTED:
  • Security Mindset        - Defense-in-depth principles
  • Threat Awareness        - Exploit models & attack surface analysis
  • Reconnaissance Basics   - Network mapping, OSINT, and active scanning
  • Monitoring Basics       - Packet inspector, logs, and vulnerability audits
  • Incident Awareness      - Security alert response and threat analysis
  • Analytical Thinking     - Script diagnostics & problem solving
  • Ethical Responsibility  - Absolute trust, integrity, and compliance
  • Team Collaboration      - Cross-functional alignment & team sprints`,
    
    experience: `LOGGING OPERATIONS HISTORY:
  [Jan 2026 - Apr 2026] :: UPTO_SKILLS - Cybersecurity Intern | Red Team Operations
  --> Penetration testing, vulnerability assessment, Red Team fundamentals, security risk reporting.
  
  [Jan 2026 - Mar 2026] :: APEXPLANET_SOFTWARE - Cybersecurity Intern | Ethical Hacking & VAPT
  --> Lab exploitation, network audits, Kali Linux tools, Burp Suite, Wireshark, Metasploit, Nessus.
  --> Simulated SQLi, XSS, CSRF, Password Cracking. Incidents & Cryptography Capstone.
  
  [Dec 2025 - Jan 2026] :: HEBESEC_TECHNOLOGIES - Cybersecurity Intern | Vulnerability Assessment
  --> Nmap audits, Burp Suite intercepting, basic Metasploit payloads, threat documentation.
  
  [Oct 2025 - Oct 2025] :: IIT_MADRAS (TECHOBYTES) - Ethical Hacking Workshop
  --> Hands-on training on system hacking, server vectors, and defensive setups.`,
    
    skills: `TECHNICAL SKILLS INVENTORY:
  • Python Scripting          [████████░░] 80% (System automation, script writing)
  • Linux & CLI Operations    [█████████░] 85% (Kernel settings, bash scripts)
  • Network Security & TCP/IP [███████░░░] 75% (Protocol analysis, IP layout)
  • Ethical Hacking Tools     [█████████░] 90% (Nmap scanner, Wireshark packet capture)
  • Pen-testing Suite         [████████░░] 80% (Burp Suite proxy, Metasploit framework)
  • MySQL Database Security   [███████░░░] 70% (SQLi protection, table setup)
  • Java / C++ & DSA          [███████░░░] 75% (Structure logic, algorithms)
  
  // DEFENSE OBJECTIVES MET:
  CIA Triad Alignment, Cryptography Fundamentals, Web Vulnerability Remediation (OWASP).`,
    
    home_lab: `DIAGNOSTIC REPORT - personal_home_lab:
  [+] Platform: VMware / VirtualBox Node Cluster
  [+] Active Target: Metasploitable 2 VM (192.168.56.102)
  [+] Attack Controller: Kali Linux 2026.1 (192.168.56.101)
  [+] Active learning modules: TryHackMe challenges (Jr. Pentester path, privilege escalation), automated security audits, custom Python port scanning scripts, packet traffic profiling in Wireshark.`,
    
    contact: `SECURE COMMUNICATIONS GATEWAY:
  • Secure Email: priscillamuthaiah@gmail.com
  • Location: Chennai, Tamil Nadu, India
  • Secure Keyprint: A7F3 92B1 C048 55E9 8D22 3E71 FB80 7263 6701`
};

// Aliases
COMMANDS['cat about_me.md'] = COMMANDS.about;
COMMANDS['cat key_components.cfg'] = COMMANDS.key_components;
COMMANDS['cat skills.db'] = COMMANDS.skills;
COMMANDS['ls experience/'] = COMMANDS.experience;
COMMANDS['sh home_lab.sh'] = COMMANDS.home_lab;
COMMANDS['cat contact.info'] = COMMANDS.contact;

// Function to print terminal logs
function printTerminalLine(text, className = '') {
    const outputDiv = terminalBody.querySelector('.terminal-output');
    const p = document.createElement('p');
    p.className = `terminal-line ${className}`;
    p.innerHTML = text;
    outputDiv.appendChild(p);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Command execution handler
function executeCommand(cmdText) {
    const cleanedCmd = cmdText.trim();
    if (cleanedCmd === '') return;

    printTerminalLine(`<span class="text-accent-cyan">priscilla@cybersec-port:~$</span> ${cleanedCmd}`);

    const lowerCmd = cleanedCmd.toLowerCase();

    if (lowerCmd === 'clear') {
        const outputDiv = terminalBody.querySelector('.terminal-output');
        outputDiv.innerHTML = '';
        printTerminalLine(`Terminal history cleared. Type <span class="text-accent-green">help</span>.`, 'comment-line');
    } else if (COMMANDS.hasOwnProperty(cleanedCmd)) {
        printTerminalLine(COMMANDS[cleanedCmd], 'response-line');
    } else if (COMMANDS.hasOwnProperty(lowerCmd)) {
        printTerminalLine(COMMANDS[lowerCmd], 'response-line');
    } else {
        printTerminalLine(`bash: command not found: ${cleanedCmd}. Type <span class="text-accent-green">help</span> for a list of valid commands.`, 'text-accent-green');
    }
}

// Typewriter sequence simulation on load
function runWelcomeSequence() {
    const outputDiv = terminalBody.querySelector('.terminal-output');
    outputDiv.innerHTML = '';
    
    printTerminalLine(`[SYSTEM SECURITY SUBSYSTEM DEPLOYING...]`, 'system-line');
    
    setTimeout(() => {
        printTerminalLine(`Priscilla Security Core Portal loaded successfully. [OK]`, 'comment-line');
    }, 400);

    setTimeout(() => {
        printTerminalLine(`Initializing interactive CLI interface...`, 'comment-line');
    }, 850);

    setTimeout(() => {
        printTerminalLine(`<span class="text-accent-cyan">priscilla@cybersec-port:~$</span> <span class="typing-seq">cat about_me.md</span>`);
    }, 1400);

    setTimeout(() => {
        printTerminalLine(COMMANDS.about, 'response-line');
        printTerminalLine(`Type <span class="text-accent-green">help</span> to view available terminal commands or select shortcuts below.`, 'comment-line');
    }, 2200);
}

runWelcomeSequence();

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = terminalInput.value;
        executeCommand(cmd);
        terminalInput.value = '';
    }
});

shortcutButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        executeCommand(cmd);
    });
});

terminalBody.addEventListener('click', () => {
    terminalInput.focus();
});


// -------------------------------------------------------------
// SECURE CONTACT GATEWAY LOGIC (Custom Node.js Backend Server)
// -------------------------------------------------------------
const contactForm = document.getElementById('secure-contact-form');
const submitBtn = document.getElementById('form-submit-btn');

// Configurable endpoint URL (Change to production URL when hosting online, e.g. on Render/Railway)
const BACKEND_API_URL = 'https://protfolio-beta-ivory.vercel.app/api/send-email';

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const sender = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const subject = document.getElementById('form-subject').value;
    const message = document.getElementById('form-message').value;
    
    submitBtn.disabled = true;
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="btn-text">CONNECTING & HANDSHAKING...</span>`;
    
    // Print interactive logs in terminal showing secure transmission initiation
    executeCommand(`ssh-send --payload-sender "${sender}" --subj "${subject}"`);
    
    setTimeout(() => {
        printTerminalLine(`[SSH-TRANSMIT] Connecting to custom proxy node [localhost:5000]...`, 'comment-line');
    }, 400);

    setTimeout(() => {
        printTerminalLine(`[SSH-TRANSMIT] Initializing 4096-bit RSA handshake...`, 'comment-line');
    }, 900);

    // Prepare JSON payload for the express backend server
    const payload = { name: sender, email, subject, message };

    // Send backend fetch silently in background
    fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            setTimeout(() => {
                printTerminalLine(`[SSH-TRANSMIT] Authenticated. Encrypting message envelope payload.`, 'comment-line');
            }, 1400);

            setTimeout(() => {
                printTerminalLine(`[SSH-TRANSMIT] Success! Secure transmission complete. Packet received.`, 'system-line');
                
                // Re-enable form button & reset form
                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
                contactForm.reset();
                
                alert(`Secure transmission packet from ${sender} has been successfully sent to Priscilla's inbox!`);
            }, 2100);
        } else {
            setTimeout(() => {
                printTerminalLine(`[SSH-TRANSMIT] Server error: ${data.message || 'SMTP handshaking failed.'}`, 'system-line');
                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
            }, 1400);
        }
    })
    .catch(error => {
        setTimeout(() => {
            printTerminalLine(`[SSH-TRANSMIT] Connection failed: Local backend host offline or endpoint not found.`, 'system-line');
            printTerminalLine(`[INFO] Run 'npm start' in the backend directory!`, 'comment-line');
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        }, 1400);
    });
});
