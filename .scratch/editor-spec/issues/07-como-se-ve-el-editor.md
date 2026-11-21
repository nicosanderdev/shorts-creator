# Cómo se ve el editor

Type: prototype
Status: resolved
Blocked by: 01, 08

## Question

Cómo se dispone el editor para que una persona trabaje un proyecto a mano. El artefacto es un prototipo para reaccionar, hecho con el skill prototype. La construcción del editor queda para después del spec.

Tiene que poder alcanzarse, desde esa superficie:

- La biblioteca del usuario.
- Las escenas en orden, y las operaciones de añadir, eliminar y reordenar. Donde el comportamiento siga abierto, el control se muestra en su estado más obvio y se marca como supuesto.
- La escena elegida: su medio visual, la duración o el recorte, sus textos (con los datos de [Qué datos tiene un texto de escena](01-datos-del-texto.md)), su narración y la transición del corte con la escena siguiente.
- El panel de apariencia, con las variables de [Qué variables entran en el panel de apariencia](08-panel-de-apariencia.md). Desde ahí se ven y se cambian en vivo. El prototipo no inventa la lista.

Estas reglas ya están cerradas. El prototipo las muestra así, sin marcarlas como supuesto:

- Añadir, eliminar y reordenar, en [Qué pasa al añadir, eliminar y reordenar escenas](02-anadir-eliminar-reordenar.md). Una escena nueva dura tres segundos, o el largo del archivo si el video es más corto, con la entrada al inicio, en [Con qué duración y recorte nace la escena](12-duracion-al-anadir.md).
- La biblioteca, en [Qué operaciones tiene la biblioteca](04-operaciones-biblioteca.md).
- Reemplazar el medio, en [Qué queda al reemplazar el medio visual](03-reemplazar-medio.md). Si el video nuevo no cubre la duración, la escena se acorta, en [Qué pasa si el video no alcanza la duración](11-video-mas-corto-que-la-duracion.md).
- El fundido, en [Cuánto dura el fundido](05-duracion-del-fundido.md).
- El encaje: el medio llena el cuadro desde el centro, y un GIF es un video, en [Cómo entra el medio en el cuadro](10-encaje-del-medio.md).
- La pista del video no se oye, en [Si se oye el audio del video](09-audio-del-video.md).

## Comments

Prototipo para reaccionar, todavía sin elegir. Tres variantes en [como-se-ve-el-editor.html](../prototype/como-se-ve-el-editor.html): Mesa de corte, Documento y Un modo por vez. Se cambia con `?variant=A`, `?variant=B` o `?variant=C`, con las flechas de la barra negra, o con las teclas de dirección cuando el cursor no está en un campo. El estado del documento se abre con Estado, en esa misma barra.

La persona eligió Un modo por vez. Le resultó amplio: el cuadro se ve grande, y ahí se puede mirar el video, la tipografía y dónde queda cada cosa. Además se aparta de la mesa de corte habitual.

## Answer

El editor muestra un modo por vez. Los modos son Biblioteca, Escenas, Escena y Apariencia. En la pantalla hay uno solo, además de la barra con el nombre del proyecto, la duración del short y el paso de un modo a otro.

En Escena, el cuadro vertical queda grande, al lado de los datos de esa escena: el medio, la duración o el recorte, la narración, el corte con la siguiente y los textos. Así se ve el encaje, la tipografía y la posición mientras se editan. En Escenas se añade, se elimina y se reordena. En Biblioteca están los medios. En Apariencia están los siete valores, y el cambio se ve en el momento.

No es una mesa de corte: la biblioteca, la lista de escenas y la apariencia no quedan en columnas fijas ni en una tira de tiempo. Esas dos disposiciones se vieron en el prototipo y quedaron afuera.

El prototipo, con las tres variantes, sigue en [como-se-ve-el-editor.html](../prototype/como-se-ve-el-editor.html). La construcción del editor queda para después del spec. **Modo** quedó en `CONTEXT.md`.
