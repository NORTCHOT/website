(() => {
    const routes = {
        home: document.getElementById('view-home'),
        about: document.getElementById('view-about')
    };

    function getRouteFromHash() {
        const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
        if (hash === 'about' || hash.startsWith('sec-')) {
            return 'about';
        }
        return 'home';
    }

    function setActiveRoute(route, scrollTop = false) {
        Object.entries(routes).forEach(([name, el]) => {
            el.classList.toggle('active', name === route);
        });
        document.title = route === 'about' ? 'About me - NORTCHOT' : 'NORTCHOT';
        if (scrollTop) {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }

    setActiveRoute(getRouteFromHash(), false);

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace(/^#\/?/, '');
        if (hash.startsWith('sec-')) {
            setActiveRoute('about', false);
            const target = document.getElementById(hash);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        } else {
            setActiveRoute(getRouteFromHash(), true);
        }
    });

    document.querySelectorAll('[data-route]').forEach((el) => {
        el.addEventListener('click', (e) => {
            const targetRoute = el.dataset.route;
            if (!targetRoute || !routes[targetRoute]) return;
            if (window.location.hash === '#' + targetRoute) {
                e.preventDefault();
                setActiveRoute(targetRoute, true);
            }
        });
    });

    const tocLinks = document.querySelectorAll('.toc-link[data-section]');
    const sections = Array.from(tocLinks)
        .map((link) => document.getElementById(link.dataset.section))
        .filter(Boolean);

    function setActiveToc(id) {
        tocLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id);
        });
    }

    tocLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.dataset.section;
            const sec = document.getElementById(id);
            if (!sec) return;
            setActiveToc(id);
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) {
                    setActiveToc(visible.target.id);
                }
            },
            { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.4] }
        );
        sections.forEach((sec) => observer.observe(sec));
    }

    const bootScreen = document.getElementById('boot-screen');
    const bootLogs = document.getElementById('boot-logs');
    const app = document.getElementById('app');

    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function finishBoot() {
        document.body.classList.remove('booting');
        app.classList.add('ready');
        bootScreen.classList.add('fade-out');
        setTimeout(() => {
            bootScreen.classList.add('hidden');
        }, 360);
    }

    if (prefersReducedMotion) {
        bootScreen.classList.add('hidden');
        document.body.classList.remove('booting');
        app.classList.add('ready');
        return;
    }

    const bootEntries = [
        { type: 'kernel', ts: '0.000000', msg: 'Linux version 7.3.6-1-cachyos (linux-cachyos@cachyos) (clang version 23.1.5, LLD 23.1.5) #1 SMP PREEMPT_DYNAMIC Wed, 25 Nov 2026 11:06:17 +0000' },
        { type: 'kernel', ts: '0.000000', msg: 'Command line: nowatchdog rw rootflags=subvol=/@ root=UUID=53e984c2-9e03-46b4-b042-3d5b3f12a362' },
        { type: 'kernel', ts: '0.044210', msg: 'smpboot: CPU0: AMD Ryzen 5 3550H with Radeon Vega Mobile Gfx (family: 0x17, model: 0x18, stepping: 0x1)' },
        { type: 'kernel', ts: '0.119840', msg: 'smp: Brought up 1 node, 8 CPUs' },
        { type: 'kernel', ts: '0.145300', msg: 'Memory: 14102288K/14612044K available (23446K kernel code, 2970K rwdata, 17724K rodata)' },
        { type: 'kernel', ts: '0.281040', msg: 'sd 1:0:0:0: [sda] 2000409264 512-byte logical blocks: (1.02 TB/954 GiB)' },
        { type: 'kernel', ts: '0.294510', msg: 'nvme nvme0: pci function 0000:03:00.0' },
        { type: 'kernel', ts: '0.412680', msg: 'BTRFS info (device sda2): first mount of filesystem 53e984c2-9e03-46b4-b042-3d5b3f12a362' },
        { type: 'kernel', ts: '0.419120', msg: 'BTRFS info (device sda2 state M): use zstd compression, level 3' },
        { type: 'kernel', ts: '0.734190', msg: 'NVRM: loading NVIDIA UNIX Open Kernel Module for x86_64  620.73.04  Release Build' },
        { type: 'kernel', ts: '0.912440', msg: 'amdgpu 0000:05:00.0: initializing kernel modesetting (RAVEN 0x1002:0x15D8 0x1043:0x18F1 0xC2).' },
        { type: 'info',   msg: 'systemd[1]: systemd 262 (262.2-1-arch) running in system mode (+PAM +AUDIT -SELINUX +APPARMOR +SECCOMP)' },
        { type: 'ok',     msg: 'Started Journal Service.' },
        { type: 'ok',     msg: 'Started Rule-based Manager for Device Events and Files.' },
        { type: 'ok',     msg: 'Started Network Manager.' },
        { type: 'ok',     msg: 'Started Bluetooth service.' },
        { type: 'ok',     msg: 'Started Ananicy-Cpp - ANother Auto NICe daemon in C++.' },
        { type: 'ok',     msg: 'Started Power Profiles daemon.' },
        { type: 'ok',     msg: 'Started User Login Management.' },
        { type: 'ok',     msg: 'Started Plasma Login Manager.' },
        { type: 'info',   msg: 'systemd[1]: Startup finished in 1.164s (kernel) + 1.330s (initrd) + 9.208s (userspace).' },
        { type: 'dim',    msg: 'nrt-cachy login: nrtcht (automatic login)' }
    ];

    function appendBootLine(entry) {
        const line = document.createElement('span');
        line.className = 'boot-line';

        if (entry.type === 'kernel') {
            const ts = document.createElement('span');
            ts.className = 'boot-ts';
            ts.textContent = `[${entry.ts.padStart(12, ' ')}] `;
            line.appendChild(ts);
            line.appendChild(document.createTextNode(entry.msg));
        } else if (entry.type === 'ok') {
            const left = document.createElement('span');
            left.className = 'boot-ok-tag';
            left.textContent = '[  ';

            const ok = document.createElement('span');
            ok.className = 'boot-ok-word';
            ok.textContent = 'OK';

            const right = document.createElement('span');
            right.className = 'boot-ok-tag';
            right.textContent = '  ] ';

            line.appendChild(left);
            line.appendChild(ok);
            line.appendChild(right);
            line.appendChild(document.createTextNode(entry.msg));
        } else {
            line.classList.add(entry.type === 'dim' ? 'boot-dim' : 'boot-info');
            line.textContent = entry.msg;
        }

        bootLogs.appendChild(line);
        bootScreen.scrollTop = bootScreen.scrollHeight;
    }

    let idx = 0;
    function nextStep() {
        if (idx < bootEntries.length) {
            const entry = bootEntries[idx];
            appendBootLine(entry);
            idx++;

            const delay = entry.type === 'kernel'
                ? 30 + Math.floor(Math.random() * 25)
                : 60 + Math.floor(Math.random() * 40);
            setTimeout(nextStep, delay);
        } else {
            setTimeout(finishBoot, 250);
        }
    }

    setTimeout(nextStep, 50);
})();
