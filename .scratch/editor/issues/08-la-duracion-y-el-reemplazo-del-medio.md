# 08 — La duración y el reemplazo del medio

**What to build:** La persona cambia cuánto dura la escena y reemplaza su medio visual por otra imagen u otro video de la biblioteca. En un video, cambiar la duración mueve la salida y no pasa del final del archivo. Al reemplazar, la escena sigue en su sitio: textos, narración y cortes se conservan. Un video más corto acorta la escena. Elegir el mismo medio no cambia nada.

**Blocked by:** 05 — Los textos de la escena; 06 — La narración de la escena

**Status:** done

- [x] Cambiar la duración de una imagen cambia cuánto se muestra, y una imagen no tiene tope de archivo
- [x] Pedir duración cero se niega y la duración anterior sigue
- [x] En un video, cambiar la duración mueve la salida y la entrada se queda donde está
- [x] Pedir una duración que sacaría la salida del archivo se niega, la duración anterior sigue y la escena no se queda en el último fotograma
- [x] Cuando el archivo sí alcanza, el cambio se aplica
- [x] No hay una operación para mover la entrada a otro punto
- [x] Reemplazar cambia el medio de esa escena y la deja en su sitio
- [x] Los cortes de al lado conservan su transición
- [x] El medio anterior sigue en la biblioteca y las otras escenas que lo usan siguen igual
- [x] El medio nuevo puede ser una imagen o un video, y puede cambiar de clase
- [x] Un audio no entra en el reemplazo
- [x] Elegir el mismo medio deja la escena como está; en un video, la entrada sigue donde está
- [x] Los textos se quedan, con su contenido, posición, tamaño, color, alineación y orden
- [x] La narración se queda y termina cuando termina la escena
- [x] Si el medio nuevo es una imagen, la escena conserva su duración y no tiene recorte
- [x] Si el medio nuevo es otro video, la entrada queda al inicio de ese archivo y el recorte dura lo que ya duraba la escena
- [x] Si ese archivo es más corto que la duración, la duración pasa a ser el largo del archivo; los textos y la narración se conservan y terminan con la escena
- [x] Un video sin duración positiva se niega como reemplazo, la escena queda como estaba y el medio puede seguir en la biblioteca
- [x] La pista del video sigue sin oírse
