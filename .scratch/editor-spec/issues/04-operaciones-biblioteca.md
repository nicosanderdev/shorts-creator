# Qué operaciones tiene la biblioteca

Type: grilling
Status: resolved

## Question

La biblioteca es del usuario y cualquier proyecto suyo puede usar esos medios. Este spec asume un usuario ya identificado. Hay que decidir qué puede hacer esa persona con la biblioteca en el editor.

- Incorporar un medio (video, imagen o audio), ver los suyos y asignarlo a una escena.
- Quitar un medio de la biblioteca cuando una escena lo está usando: qué le pasa al proyecto.
- Qué queda fuera de estas operaciones. El login ya está fuera.

Al cerrar, actualizar **Biblioteca** o **Medio** en `CONTEXT.md` solo si el significado cambia.

## Comments

Ronda 1, las cuatro recomendaciones. Incorporar crea un medio nuevo desde un archivo de la máquina: video, imagen o audio. Se ven todos los medios del usuario, en uso o no, con su clase. La narración de una escena se pone, se sustituye o se quita; el audio sigue en la biblioteca. Quitar de la biblioteca se niega si alguna escena de cualquier proyecto suyo lo usa; si ninguna lo usa, el medio sale. **Biblioteca** y **Medio** no cambian de significado.

Ronda 2, las dos recomendaciones. El medio guarda el nombre del archivo con el que entró; dos medios pueden llamarse igual y no se renombra. Fuera quedan carpetas, etiquetas, búsqueda, orden manual, pasar un medio a otro usuario, cambiar el archivo de un medio ya incorporado y recortar en la biblioteca. **Medio** ahora incluye ese nombre.

Ronda 3, las dos recomendaciones. La lista sigue el orden de incorporación, el más reciente primero. Un archivo que no es video, imagen ni audio no entra. El GIF sigue en [Cómo entra el medio en el cuadro](10-encaje-del-medio.md). El modelo completo quedó confirmado.

## Answer

Incorporar toma un archivo de la máquina y crea un medio nuevo. Es un video, una imagen o un audio. El mismo archivo, traído dos veces, son dos medios. El nombre es el del archivo, sin la carpeta de donde salió. Dos medios pueden llamarse igual. Un archivo de otra clase no crea un medio y la biblioteca queda como estaba. Un GIF sigue en [Cómo entra el medio en el cuadro](10-encaje-del-medio.md).

Ver muestra todos los medios de ese usuario, los use o no una escena, con su clase. Van en orden de incorporación, el más reciente primero. Es una sola lista, compartida por sus proyectos.

Poner la narración elige un audio de la biblioteca y lo deja en esa escena. Otro audio la sustituye. Quitar la narración deja la escena sin ella, y el audio sigue en la biblioteca. Hay una narración por escena y termina con la escena. El mismo audio puede estar en varias escenas. El medio visual se elige al añadir una escena o al reemplazarlo.

Quitar de la biblioteca se niega si alguna escena de cualquiera de sus proyectos usa el medio, como medio visual o como narración. En ese caso la biblioteca y los proyectos quedan igual. Si ninguna escena lo usa, el medio sale.

Fuera quedan las carpetas, las etiquetas, la búsqueda, el orden armado a mano, renombrar, pasar un medio a otro usuario, cambiar el archivo de un medio ya incorporado y recortar en la biblioteca. El recorte es de la escena. El login ya estaba fuera.

La duración del archivo y el audio propio del video siguen en sus tickets. **Medio** en `CONTEXT.md` dice que cada incorporación crea uno y que conserva el nombre con el que entró. **Biblioteca** no cambió.
