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
}
