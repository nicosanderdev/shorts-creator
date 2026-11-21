# Qué datos tiene un texto de escena

Type: grilling
Status: resolved

## Question

Una escena puede tener varios textos. Hay que decidir qué datos tiene cada uno para que el editor pueda editarlos y la composición pueda mostrarlos.

- Qué campos lleva: contenido, posición, tamaño, y qué más del aspecto entra en el dato (color, alineación, caja).
- Si el texto ocupa toda la duración de la escena, o tiene un intervalo propio dentro de esa duración.
- Qué les pasa a los textos cuando la duración de la escena cambia.
- Qué queda fuera de este dato: animación del texto, presets y subtítulos automáticos. Esos últimos ya están fuera del mapa.

Al cerrar, actualizar el término **Texto** en `CONTEXT.md` si la definición se afina.

El aspecto del editor está bloqueado por este ticket: la respuesta cambia si la escena es una ficha o si necesita un tiempo interno.

## Comments

Los datos de cada texto quedaron así: contenido, posición como fracción horizontal y vertical del cuadro, tamaño como fracción de la altura del cuadro, color, y alineación del bloque (izquierda, centro o derecha). El orden en la lista es el apilado: el último se dibuja arriba. La familia tipográfica, la caja de fondo, el borde, la sombra, la animación y los presets quedan fuera del dato. Cada texto dura la escena entera. Una escena puede tener varios a la vez. Falta decidir con qué valores nace un texto nuevo, si se puede quitar y reordenar, y dejar asentado qué pasa al cambiar la duración.

## Answer

Un texto dura la escena entera. Una escena puede tener varios a la vez. No hay tramo propio: si la duración de la escena cambia, el texto sigue ocupándola entera, y la posición, el tamaño, el color y la alineación no cambian.

Cada texto guarda el contenido, la posición, el tamaño, el color y la alineación. La posición es el centro del bloque, como fracción horizontal y vertical del cuadro. El tamaño es una fracción de la altura del cuadro. La alineación del bloque es izquierda, centro o derecha. El orden en la lista es el apilado: el último se dibuja arriba. Se puede quitar un texto y se puede reordenar.

Al añadir un texto, nace con el contenido «Texto», en el centro del cuadro, con un tamaño de ocho centésimos de la altura, en blanco y alineado al centro.

Quedan fuera del dato la familia tipográfica, la caja de fondo, el borde, la sombra, la animación y los presets. Hay una sola fuente. El catálogo de fuentes sigue en la niebla del mapa. **Texto** en `CONTEXT.md` ya dice que es un bloque visible durante toda la escena y que puede haber varios a la vez.
