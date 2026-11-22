# 08 — La duración y el reemplazo del medio

**What to build:** La persona cambia cuánto dura la escena y reemplaza su medio visual por otra imagen u otro video de la biblioteca. En un video, cambiar la duración mueve la salida y no pasa del final del archivo. Al reemplazar, la escena sigue en su sitio: textos, narración y cortes se conservan. Un video más corto acorta la escena. Elegir el mismo medio no cambia nada.

**Blocked by:** 05 — Los textos de la escena; 06 — La narración de la escena

**Status:** ready-for-agent

- [ ] Cambiar la duración de una imagen cambia cuánto se muestra, y una imagen no tiene tope de archivo
- [ ] Pedir duración cero se niega y la duración anterior sigue
- [ ] En un video, cambiar la duración mueve la salida y la entrada se queda donde está
- [ ] Pedir una duración que sacaría la salida del archivo se niega, la duración anterior sigue y la escena no se queda en el último fotograma
- [ ] Cuando el archivo sí alcanza, el cambio se aplica
- [ ] No hay una operación para mover la entrada a otro punto
- [ ] Reemplazar cambia el medio de esa escena y la deja en su sitio
- [ ] Los cortes de al lado conservan su transición
- [ ] El medio anterior sigue en la biblioteca y las otras escenas que lo usan siguen igual
- [ ] El medio nuevo puede ser una imagen o un video, y puede cambiar de clase
- [ ] Un audio no entra en el reemplazo
- [ ] Elegir el mismo medio deja la escena como está; en un video, la entrada sigue donde está
- [ ] Los textos se quedan, con su contenido, posición, tamaño, color, alineación y orden
- [ ] La narración se queda y termina cuando termina la escena
- [ ] Si el medio nuevo es una imagen, la escena conserva su duración y no tiene recorte
- [ ] Si el medio nuevo es otro video, la entrada queda al inicio de ese archivo y el recorte dura lo que ya duraba la escena
- [ ] Si ese archivo es más corto que la duración, la duración pasa a ser el largo del archivo; los textos y la narración se conservan y terminan con la escena
- [ ] Un video sin duración positiva se niega como reemplazo, la escena queda como estaba y el medio puede seguir en la biblioteca
- [ ] La pista del video sigue sin oírse
