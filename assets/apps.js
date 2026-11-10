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

function appendText(parent, tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  node.textContent = text;
  parent.append(node);
  return node;
}

function createTag(parent, value) {
  if (!value) return;
  value.split(/[,;|]/).map((tag) => tag.trim()).filter(Boolean).forEach((tag) => {
    appendText(parent, 'span', 'app-tag', tag);
  });
}

function licenseUrl(part) {
  const normalized = part
    .replace(/^Creative Commons\s*/i, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/CC-?/i, 'CC ')
    .replace(/-(\d+\.\d)$/, ' $1')
    .replace(/\s+/g, ' ')
    .trim();
  const cc = normalized.match(/(?:CC\s*)?(BY(?:-NC)?-SA)(?:\s+(\d+\.\d))?/i);
  if (cc) {
    return cc[2]
      ? `https://creativecommons.org/licenses/${cc[1].toLowerCase()}/${cc[2]}/deed.es`
      : 'https://creativecommons.org/share-your-work/cclicenses/';
  }
  if (/AGPL/i.test(part)) return 'https://www.gnu.org/licenses/agpl-3.0.html';
  return '';
}

function renderLicense(parent, license) {
  appendText(parent, 'span', 'license-label', 'Licencia declarada');
  const parts = document.createElement('div');
  parts.className = 'license-list';
  license.split(/[·;]/).map((part) => part.trim()).filter(Boolean).forEach((part, index, all) => {
    const url = licenseUrl(part);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = part;
      parts.append(link);
    } else {
      parts.append(document.createTextNode(part));
    }
    if (index < all.length - 1) parts.append(document.createTextNode(' · '));
  });
  parent.append(parts);
}

function getAreaClass(area) {
  if (!area) return 'area-docencia';
  const a = area.toLowerCase();
  if (a.includes('idioma') || a.includes('lengua') || a.includes('inglés') || a.includes('español') || a.includes('francés') || a.includes('italiano')) return 'area-idiomas';
  if (a.includes('ciencia') || a.includes('biología') || a.includes('química') || a.includes('física') || a.includes('naturales')) return 'area-ciencias';
  if (a.includes('matemática') || a.includes('cálculo') || a.includes('álgebra')) return 'area-matematicas';
  if (a.includes('historia') || a.includes('geografía') || a.includes('humanidad') || a.includes('social') || a.includes('filosofía')) return 'area-humanidades';
  if (a.includes('tecnolog') || a.includes('informática') || a.includes('programación') || a.includes('digital')) return 'area-tecnologia';
  if (a.includes('arte') || a.includes('música') || a.includes('plástica') || a.includes('expresión')) return 'area-arte';
  if (a.includes('educación física') || a.includes('deporte')) return 'area-educacion-fisica';
  return 'area-docencia';
}

function getAreaIcon(area) {
  if (!area) return '📚';
  const a = area.toLowerCase();
  if (a.includes('idioma') || a.includes('lengua') || a.includes('inglés') || a.includes('español') || a.includes('francés') || a.includes('italiano')) return '🗣️';
  if (a.includes('ciencia') || a.includes('biología') || a.includes('química') || a.includes('física')) return '🔬';
  if (a.includes('matemática')) return '📐';
  if (a.includes('historia') || a.includes('geografía') || a.includes('social')) return '🌍';
  if (a.includes('tecnolog') || a.includes('informática') || a.includes('programación')) return '💻';
  if (a.includes('arte') || a.includes('música')) return '🎨';
  if (a.includes('docencia') || a.includes('recurso') || a.includes('organización')) return '🧑‍🏫';
  return '📚';
}

function renderCard(app) {
  const areaClass = getAreaClass(app.area);
  const icon = getAreaIcon(app.area);
  const tags = app.tags ? app.tags.split(',').slice(0,3).map(t => `<span class="app-tag">${t.trim()}</span>`).join('') : '';
  const licenseShort = app.license ? (app.license.includes('BY-SA') ? 'CC BY-SA 4.0' : app.license.includes('BY-NC') ? 'CC BY-NC-SA 4.0' : 'CC BY 4.0') : 'CC BY-SA 4.0';

  const card = document.createElement('a');
  card.className = `app-card-new ${areaClass}`;
  card.href = app.url || '#';
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.innerHTML = `
    <div class="app-card-toprow">
      <div class="app-card-icon" aria-hidden="true">${icon}</div>
      <span class="app-card-license">${licenseShort}</span>
    </div>
    <h3>${app.title || 'Sin título'}</h3>
    <p class="app-description">${app.description || ''}</p>
    <div class="app-meta">${tags}</div>
    <span class="app-open-new">Ver aplicación <span class="app-open-arrow">↗</span></span>
  `;
  return card;
}

function createAppCard(app) {
  return renderCard(app);
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
