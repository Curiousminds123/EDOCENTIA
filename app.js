/* =========================================
   AutoDocente CV – App Logic
   ========================================= */

// ── SIDEBAR TOGGLE ──────────────────────
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('overlay');
const burgerBtn = document.getElementById('burgerBtn');
const sidebarClose = document.getElementById('sidebarClose');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

burgerBtn   && burgerBtn.addEventListener('click', openSidebar);
sidebarClose && sidebarClose.addEventListener('click', closeSidebar);

// ── SECTION NAVIGATION ──────────────────
function showSection(sectionId, clickedNavItem) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  // Show target section
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (clickedNavItem) clickedNavItem.classList.add('active');

  // Close sidebar on mobile
  if (window.innerWidth < 900) closeSidebar();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── TAB SWITCHING ────────────────────────
function switchTab(tabId, clickedTab) {
  // Deactivate all tabs and contents in the same section
  const section = clickedTab.closest('.section');
  section.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  section.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  // Activate clicked
  clickedTab.classList.add('active');
  const content = document.getElementById('tab-' + tabId);
  if (content) content.classList.add('active');
}

// ── KEYBOARD NAVIGATION ─────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

// ── Prevent default on nav links ────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => e.preventDefault());
});

// ── INIT ────────────────────────────────
console.log('%cAutoDocente CV 🎓 | Comunitat Valenciana', 'color:#a855f7;font-weight:800;font-size:14px;');
console.log('%cNormativa ESO · Bachillerato · FP | Curso 2025-2026', 'color:#60a5fa;font-size:12px;');
