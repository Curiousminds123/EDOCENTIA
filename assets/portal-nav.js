const portalScript = document.currentScript;

if (portalScript) {
  const siteRoot = new URL('../', portalScript.src);
  const navigation = document.createElement('nav');
  navigation.className = 'portal-shortcuts';
  navigation.setAttribute('aria-label', 'Navegación EDOCENTIA');

  [
    { href: 'index.html', label: 'EDOCENTIA' },
    { href: 'apps.html', label: 'Biblioteca abierta' }
  ].forEach(({ href, label }) => {
    const link = document.createElement('a');
    link.href = new URL(href, siteRoot).href;
    link.textContent = label;
    navigation.append(link);
  });

  document.body.append(navigation);

  // Pie de página unificado para todos los módulos y herramientas
  const portalFooter = document.createElement('footer');
  portalFooter.className = 'portal-footer-bar';
  portalFooter.innerHTML = '<div class="portal-footer-inner"><span>Creado por <strong>Ana H. Iranzo</strong>, asistida con IA.</span> · <a href="' + new URL('index.html', siteRoot).href + '">EDOCENTIA</a> · <a href="https://t.me/+F0qGBNdHTVowZjI0" target="_blank" rel="noopener">Comunidad Telegram</a></div>';
  document.body.append(portalFooter);
}
