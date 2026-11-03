# EDOCENTIA

Portal de herramientas para el trabajo docente, creado por Ana Hernández Iranzo. La web reúne las herramientas originales de EDOCENTIA y una biblioteca de recursos externos con atribución y licencia declarada.

## Estructura

- `index.html`: portada y acceso a las diez herramientas docentes.
- `apps.html`: catálogo con búsqueda y filtro por área.
- `data/apps.json`: selección de fichas del repositorio comunitario Vibe Coding Educativo con licencias que incluyen una cláusula de compartir igual (CC BY-SA y CC BY-NC-SA).
- `modulo-*`: herramientas docentes de EDOCENTIA.
- `app-ia.html`, `app-prompts.html`, `app-rubricas.html`: herramientas complementarias.
- `normativa-cv/`: recursos de normativa docente de la Comunitat Valenciana.
- `assets/`: estilos, navegación compartida y lógica de la portada y el catálogo.

## Catálogo abierto y atribución

Las fichas de `data/apps.json` se han seleccionado del [Repositorio de recursos educativos digitales de Vibe Coding Educativo](https://github.com/Vibe-Coding-Educativo/app_edu), consultado el 3 de noviembre de 2026. Se conservan el título, la descripción, el enlace, el autor y la licencia declarada por cada recurso. La selección incluye licencias CC BY-SA y CC BY-NC-SA; algunas fichas distinguen entre AGPL para el código y CC BY-SA para los contenidos. La página muestra esas licencias sin sustituirlas por una licencia única ni eliminar las restricciones de uso comercial.

La biblioteca aloja las fichas, no copia ni vuelve a publicar las aplicaciones enlazadas. Las aplicaciones se abren en los sitios de sus autores. La licencia de cada herramienta propia de EDOCENTIA no se infiere de la licencia de las fichas externas.

## Vista local

Sirve la carpeta desde un servidor HTTP local (por ejemplo, `python -m http.server 8080`) y abre `http://localhost:8080`. El catálogo carga su archivo JSON local, por lo que no debe abrirse como archivo `file://`.

GitHub Pages puede publicar el sitio desde la raíz de la rama principal.
