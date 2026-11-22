# 02 — La apariencia cambia en vivo

**What to build:** La persona abre Apariencia y cambia el feeling de la aplicación en este navegador. Ve el valor vigente de cada control, el cambio se aplica en el momento y, al volver a entrar, los siete valores siguen ahí. Restablecer los devuelve al feeling inicial y no toca el proyecto ni la biblioteca.

**Blocked by:** 01 — El editor abre con un proyecto vacío

**Status:** ready-for-agent

- [ ] El panel agrupa los tres valores de la interfaz y, aparte, los de las barras y los de las secciones
- [ ] Cada control muestra el valor vigente y el panel usa la misma tipografía que el resto
- [ ] Los cinco tamaños son píxeles enteros del 8 al 96; el del icono es el lado del glifo y el del elemento es el alto del control
- [ ] Todas las barras comparten el tamaño de sus iconos y el de sus elementos; todas las secciones comparten los otros dos
- [ ] Mover un valor deja quietos a los demás
- [ ] El color del texto pinta la letra, los iconos y el texto de los elementos
- [ ] El color de fondo pinta las barras, las secciones y los elementos
- [ ] Cualquier par de colores vale, incluso los dos iguales
- [ ] Hover, foco y selección invierten el par
- [ ] El cambio se ve en el momento
- [ ] Los siete valores quedan en este navegador y siguen al volver
- [ ] Otro navegador, o este mismo si se borran los datos del sitio, arranca en el feeling inicial
- [ ] El feeling inicial es tipografía 16 px, texto `#1a1a1a`, fondo `#f7f7f5`, iconos de las barras 20 px, elementos de las barras 36 px, iconos de las secciones 20 px, elementos de las secciones 36 px
- [ ] Restablecer devuelve los siete valores a ese feeling inicial
- [ ] Restablecer no cambia el proyecto ni la biblioteca
