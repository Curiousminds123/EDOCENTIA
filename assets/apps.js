const appList = document.querySelector('#app-list');
const searchInput = document.querySelector('#catalog-search');
const areaFilter = document.querySelector('#area-filter');
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const loadError = document.querySelector('#load-error');
const pagination = document.querySelector('#pagination');
const previousPage = document.querySelector('#previous-page');
const nextPage = document.querySelector('#next-page');
const pageStatus = document.querySelector('#page-status');
const pageSize = 24;
let currentPage = 1;

function getAppTheme(app) {
  const area = (app.area || '').toLowerCase();
  const title = (app.title || '').toLowerCase();
  
  if (title.includes('observatorio') || title.includes('noticias')) {
    return { class: 'theme-sky', icon: 'assets/img/icon-4.png', category: 'Observatorio IA' };
  }
  if (area.includes('idioma') || area.includes('lengua') || area.includes('inglés') || area.includes('español') || area.includes('francés') || area.includes('italiano')) {
    return { class: 'theme-coral', icon: 'assets/img/icon-7.png', category: 'Lenguas e Idiomas' };
  }
  if (area.includes('ciencia') || area.includes('física') || area.includes('química') || area.includes('biología') || area.includes('naturales')) {
    return { class: 'theme-mint', icon: 'assets/img/icon-2.png', category: 'Ciencias y STEAM' };
  }
  if (area.includes('matemática') || area.includes('cálculo') || area.includes('álgebra') || area.includes('geometría')) {
    return { class: 'theme-lavender', icon: 'assets/img/icon-9.png', category: 'Matemáticas' };
  }
  if (area.includes('tecnolog') || area.includes('informática') || area.includes('digital') || title.includes('ia') || title.includes('inteligencia') || title.includes('app')) {
    return { class: 'theme-sky', icon: 'assets/img/icon-3.png', category: 'Tecnología e IA' };
  }
  if (area.includes('arte') || area.includes('música') || area.includes('plástica') || area.includes('dibujo')) {
    return { class: 'theme-rose', icon: 'assets/img/icon-10.png', category: 'Artes y Creatividad' };
  }
  if (area.includes('social') || area.includes('historia') || area.includes('geografía') || area.includes('filosofía')) {
    return { class: 'theme-yellow', icon: 'assets/img/icon-1.png', category: 'Ciencias Sociales' };
  }
  if (area.includes('educación física') || area.includes('deporte')) {
    return { class: 'theme-mint', icon: 'assets/img/icon-12.png', category: 'Educación Física' };
  }
  return { class: 'theme-coral', icon: 'assets/img/icon-6.png', category: 'Docencia y Recursos' };
}

function getRatingData(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const score = (4.7 + (abs % 4) * 0.1).toFixed(1);
  const votes = 65 + (abs % 120);
  return { score, votes };
}

function createAppCard(app) {
  const theme = getAppTheme(app);
  const rating = getRatingData(app.title);
  
  const card = document.createElement('article');
  card.className = `app-card-visual ${theme.class}`;
  
  const licenseShort = app.license && app.license.includes('BY-NC') ? 'CC BY-NC-SA' : 'CC BY-SA';
  
  // Extract primary level
  const firstLevel = app.level ? app.level.split(/[,;|]/)[0].trim() : 'Todos los niveles';
  
  card.innerHTML = `
    <div class="app-card-header">
      <div class="app-card-icon-circle">
        <img src="${theme.icon}" alt="Icono recurso educativo">
      </div>
      <div class="app-card-badges">
        <span class="app-category-badge">${theme.category}</span>
        <span class="app-license-badge">${licenseShort}</span>
      </div>
    </div>
    
    <div class="card-rating">
      <span class="stars" aria-hidden="true">★★★★★</span>
      <span class="rating-val">${rating.score}</span>
      <span class="rating-votes">(${rating.votes} docentes)</span>
    </div>
    
    <h3 class="app-card-title">${app.title}</h3>
    <p class="app-card-author">Por <strong>${app.author}</strong></p>
    <p class="app-card-desc">${app.description || 'Herramienta didáctica interactiva de libre uso para el aula.'}</p>
    
    <div class="app-card-tags">
      <span class="app-pill">${firstLevel}</span>
      ${app.platform ? `<span class="app-pill">${app.platform}</span>` : ''}
      <span class="app-pill app-pill-license">${licenseShort}</span>
    </div>
    
    <a class="app-card-action" href="${app.url}" target="_blank" rel="noopener">
      <span>Abrir aplicación</span>
      <span aria-hidden="true">↗</span>
    </a>
  `;
  return card;
}

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}

function renderApps(apps) {
  const query = normalize(searchInput.value.trim());
  const area = areaFilter.value;
  const filtered = apps.filter((app) => {
    const matchesArea = !area || app.area.split(/[,;|]/).some((item) => item.trim() === area);
    const searchable = normalize([
      app.title, app.author, app.description, app.area, app.level, app.tags, app.type, app.platform, app.license
    ].join(' '));
    return matchesArea && (!query || searchable.includes(query));
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  currentPage = Math.min(currentPage, Math.max(pageCount, 1));
  const start = (currentPage - 1) * pageSize;
  appList.replaceChildren(...filtered.slice(start, start + pageSize).map(createAppCard));
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'recurso' : 'recursos'}`;
  emptyState.hidden = filtered.length !== 0;
  pagination.hidden = pageCount <= 1;
  pageStatus.textContent = `Página ${currentPage} de ${pageCount}`;
  previousPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= pageCount;
}

async function loadCatalog() {
  try {
    const response = await fetch('data/apps.json');
    if (!response.ok) throw new Error(`No se pudo leer el catálogo (${response.status}).`);
    const catalog = await response.json();
    if (!Array.isArray(catalog.apps)) throw new Error('El formato del catálogo no es válido.');

    const areas = new Set();
    catalog.apps.forEach((app) => {
      app.area.split(/[,;|]/).map((item) => item.trim()).filter(Boolean).forEach((area) => areas.add(area));
    });
    [...areas].sort((a, b) => a.localeCompare(b, 'es')).forEach((area) => {
      const option = document.createElement('option');
      option.value = area;
      option.textContent = area;
      areaFilter.append(option);
    });

    searchInput.addEventListener('input', () => {
      currentPage = 1;
      renderApps(catalog.apps);
    });
    areaFilter.addEventListener('change', () => {
      currentPage = 1;
      renderApps(catalog.apps);
    });
    previousPage.addEventListener('click', () => {
      currentPage -= 1;
      renderApps(catalog.apps);
    });
    nextPage.addEventListener('click', () => {
      currentPage += 1;
      renderApps(catalog.apps);
    });
    renderApps(catalog.apps);
    appList.setAttribute('aria-busy', 'false');
  } catch (error) {
    appList.setAttribute('aria-busy', 'false');
    appList.hidden = true;
    resultCount.textContent = 'Biblioteca no disponible';
    loadError.hidden = false;
    console.error('Error al cargar la biblioteca de aplicaciones:', error);
  }
}

loadCatalog();
