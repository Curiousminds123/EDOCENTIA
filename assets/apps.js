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

function createAppCard(app) {
  const card = document.createElement('article');
  card.className = 'app-card';
  appendText(card, 'h3', '', app.title);
  appendText(card, 'p', 'app-author', `Por ${app.author}`);
  appendText(card, 'p', 'app-description', app.description || 'La ficha no incluye una descripción.');

  const meta = document.createElement('div');
  meta.className = 'app-meta';
  createTag(meta, app.area);
  createTag(meta, app.level);
  createTag(meta, app.type);
  card.append(meta);

  const license = document.createElement('div');
  license.className = 'app-license';
  renderLicense(license, app.license);
  card.append(license);

  const open = document.createElement('a');
  open.className = 'app-open';
  open.href = app.url;
  open.target = '_blank';
  open.rel = 'noopener';
  open.append(document.createTextNode('Abrir aplicación'));
  appendText(open, 'span', '', '↗');
  card.append(open);
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
