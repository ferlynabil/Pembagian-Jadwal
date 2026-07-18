// ===== PARTICLES =====
(function initParticles() {
    const c = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const s = Math.random() * 6 + 2;
        p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*20}s;animation-duration:${15+Math.random()*15}s;`;
        c.appendChild(p);
    }
})();

// ===== FULLSCREEN TOGGLE =====
(function initFullscreen() {
    const btn = document.getElementById('fullscreenBtn');
    const iconExpand = document.getElementById('fsIconExpand');
    const iconCompress = document.getElementById('fsIconCompress');
    if (!btn) return;

    function isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement ||
                  document.mozFullScreenElement || document.msFullscreenElement);
    }

    function updateIcon() {
        const active = isFullscreen();
        iconExpand.style.display = active ? 'none' : 'block';
        iconCompress.style.display = active ? 'block' : 'none';
        btn.title = active ? 'Keluar Layar Penuh' : 'Mode Layar Penuh';
        btn.setAttribute('aria-label', btn.title);
    }

    function enterFullscreen() {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen ||
                    el.mozRequestFullScreen || el.msRequestFullscreen;
        if (req) req.call(el);
    }

    function exitFullscreen() {
        const exit = document.exitFullscreen || document.webkitExitFullscreen ||
                     document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) exit.call(document);
    }

    btn.addEventListener('click', () => {
        if (isFullscreen()) exitFullscreen();
        else enterFullscreen();
    });

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
        .forEach(evt => document.addEventListener(evt, updateIcon));
})();

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    document.querySelectorAll('.nav-link').forEach(l => {
        const sec = document.querySelector(l.getAttribute('href'));
        if (sec) {
            const top = sec.offsetTop - 120, bot = top + sec.offsetHeight;
            l.classList.toggle('active', window.scrollY >= top && window.scrollY < bot);
        }
    });
});

// ===== STAT COUNTER ANIMATION =====
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('[data-count]').forEach(el => {
                const target = +el.dataset.count;
                let current = 0;
                const step = target / 40;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) { el.textContent = target; clearInterval(timer); }
                    else el.textContent = Math.floor(current);
                }, 30);
            });
            statObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('.stats-grid').forEach(g => statObserver.observe(g));

// ===== RENDER STAFF CARDS =====
function renderCards(data) {
    const grid = document.getElementById('staffGrid');
    if (!data.length) {
        grid.innerHTML = '<div class="no-results">Tidak ditemukan guru dengan nama tersebut</div>';
        return;
    }
    grid.innerHTML = data.map((s, i) => `
        <div class="staff-card" data-index="${staffData.indexOf(s)}" style="animation:fadeInUp 0.5s ease ${i*0.04}s both">
            <img class="staff-card-photo" src="${encodeURI(s.foto)}" alt="${s.nama}" loading="lazy" onerror="this.style.background='linear-gradient(135deg,#1e3a5f,#0f172a)';this.style.minHeight='280px'">
            <div class="staff-card-overlay">
                <span class="staff-card-number">${s.no}</span>
                <h3 class="staff-card-name">${s.nama}</h3>
                <p class="staff-card-mapel">${s.tugas.length ? s.tugas[0].t : (s.ket || '-')}</p>
                ${s.beban ? `<span class="staff-card-jam">⏱ ${s.beban} JP / Minggu</span>` : (s.ket ? `<span class="staff-card-jam">${s.ket}</span>` : '')}
            </div>
            <div class="staff-card-click">Lihat Detail</div>
        </div>
    `).join('');

    grid.querySelectorAll('.staff-card').forEach(card => {
        card.addEventListener('click', () => openModal(+card.dataset.index));
    });
}
renderCards(staffData);

// ===== SEARCH =====
document.getElementById('searchInput').addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    renderCards(q ? staffData.filter(s => s.nama.toLowerCase().includes(q)) : staffData);
});

// ===== MODAL =====
const overlay = document.getElementById('modalOverlay');
const closeBtn = document.getElementById('modalClose');
let currentModalIndex = 0;

function openModal(idx) {
    currentModalIndex = idx;
    const s = staffData[idx];
    document.getElementById('modalPhoto').src = encodeURI(s.foto);
    document.getElementById('modalPhoto').alt = s.nama;
    document.getElementById('modalNumber').textContent = `Guru #${s.no}`;
    document.getElementById('modalName').textContent = s.nama;
    document.getElementById('modalNip').textContent = s.nip;
    document.getElementById('modalJam').textContent = s.jam || '-';
    document.getElementById('modalBeban').textContent = s.beban || '-';
    document.getElementById('modalTugas').textContent = s.tugas.length || '-';

    const list = document.getElementById('modalTasksList');
    if (!s.tugas.length) {
        list.innerHTML = '<div class="task-item"><div class="task-content"><span class="task-name" style="color:#64748b">Tidak ada data tugas</span></div></div>';
    } else {
        list.innerHTML = s.tugas.map((t, i) => `
            <div class="task-item">
                <div class="task-bullet"></div>
                <div class="task-content">
                    <div class="task-name">${i+1}. ${t.t}</div>
                    <div class="task-meta">
                        ${t.rombel ? `<span class="task-meta-item">Rombel: <span>${t.rombel}</span></span>` : ''}
                        ${t.jam ? `<span class="task-meta-item">Jam: <span>${t.jam} JP</span></span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    const ketEl = document.getElementById('modalKeterangan');
    const ketText = document.getElementById('modalKeteranganText');
    if (s.ket) { ketEl.style.display = 'block'; ketText.textContent = s.ket; }
    else { ketEl.style.display = 'none'; }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function prevModal(e) {
    if(e) e.stopPropagation();
    if (currentModalIndex > 0) openModal(currentModalIndex - 1);
    else openModal(staffData.length - 1);
}

function nextModal(e) {
    if(e) e.stopPropagation();
    if (currentModalIndex < staffData.length - 1) openModal(currentModalIndex + 1);
    else openModal(0);
}

document.getElementById('modalPrev').addEventListener('click', prevModal);
document.getElementById('modalNext').addEventListener('click', nextModal);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { 
    if (e.key === 'Escape') closeModal(); 
    if (overlay.classList.contains('active')) {
        if (e.key === 'ArrowLeft') prevModal();
        if (e.key === 'ArrowRight') nextModal();
    }
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.stat-card, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    revealObserver.observe(el);
});
