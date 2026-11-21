# Qué variables entran en el panel de apariencia

Type: grilling
Status: resolved

## Question

La apariencia es el feeling de la aplicación del editor. Se abre desde un menú, los valores se ven y se cambian en el momento, con barras donde haga falta. No quedan fijos en el código. No es el texto de una escena, ni el fondo del short, ni un archivo de configuración aparte.

Hay que decidir:

- Qué variables entran en este spec. La semilla es el tamaño de la tipografía de los menús, el color, el color de fondo, y otras combinaciones en barras para ir probando el feeling.
- Que cada control muestre el valor actual.
- Dónde quedan entre una apertura y la siguiente. Este mapa asume un usuario ya identificado y no diseña Supabase; si alcanzan con quedar en este navegador, esa es la respuesta.

Al cerrar, afinar **Apariencia** en `CONTEXT.md` si la lista cambia el significado. [Cómo se ve el editor](07-como-se-ve-el-editor.md) espera esta lista para mostrar el panel.

## Comments

La lista cerró en siete valores, guardados en este navegador. Cada tamaño se edita solo. Barras y secciones comparten el suyo por clase de lugar. **Apariencia**, **Feeling inicial**, **Barra**, **Sección**, **Icono** y **Elemento** quedaron en `CONTEXT.md`.

## Answer

La apariencia son siete valores de la aplicación en este navegador. El proyecto y el usuario no los guardan. Otro navegador, o este mismo si se borran los datos del sitio, arranca en el feeling inicial.

Cada control muestra el valor vigente y el cambio se ve en el momento. El panel agrupa los tres de la interfaz y, aparte, los de las barras y los de las secciones. El tamaño va en una barra con el número. El color muestra el color aplicado. El panel usa la misma tipografía que el resto.

Los cinco tamaños son píxeles enteros, del 8 al 96. El de un icono es el lado del glifo. El de un elemento es el alto del control. Todas las barras comparten sus dos tamaños. Todas las secciones comparten los otros dos. Mover uno deja quietos a los demás.

| Valor | Feeling inicial |
| --- | --- |
| Tipografía de la interfaz | 16 px, tamaño de la letra |
| Color del texto | `#1a1a1a` |
| Color de fondo | `#f7f7f5` |
| Iconos de las barras | 20 px |
| Elementos de las barras | 36 px |
| Iconos de las secciones | 20 px |
| Elementos de las secciones | 36 px |

Barras y secciones arrancan con los mismos números y siguen siendo valores distintos.

El color del texto pinta la letra, los iconos y el texto de los elementos. El color de fondo pinta las barras, las secciones y los elementos. Cualquier par vale, incluso los dos iguales. Hover, foco y selección invierten el par.

**Restablecer**, en el panel, devuelve los siete valores al feeling inicial. No toca el proyecto ni la biblioteca.

Quedan fuera de esta lista la familia tipográfica, el peso, los bordes y un tercer color. **Apariencia** en `CONTEXT.md` ya nombra estos siete valores y qué pinta cada color.
