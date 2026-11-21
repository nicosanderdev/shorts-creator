# Editor de shorts

Label: wayfinder:map

## Destination

Un spec implementable del editor: el documento (usuario, biblioteca, proyecto, escenas) y las operaciones para trabajarlo a mano, más la forma de la composición que lo renderiza (una composición por proyecto, una secuencia por escena). El mapa termina cuando no queda ninguna decisión abierta antes de escribir ese spec.

## Notes

Dominio: editor de shorts. Leer [CONTEXT.md](../../CONTEXT.md) al empezar. En cada ticket, usar el skill de su tipo: grilling y domain-modeling en la conversación, prototype en el de aspecto, research en el de Remotion.

Preferencia de stack, anotada en este mapa y sin diseñar todavía: React y TypeScript en la aplicación web, Remotion para la composición, Node.js para el servicio de render, FFmpeg para el procesamiento, Supabase para usuarios, proyectos y metadatos, Cloudflare para los archivos de medios.

Marco cerrado al chartar. Las sesiones siguientes lo toman como dado:

- El editor lo usa una persona, a mano. El repo arranca vacío.
- El short es vertical.
- Una escena tiene un medio visual. Con una imagen, la duración es cuánto se muestra. Con un video, el recorte (entrada y salida) es la duración; cambiar la duración mueve la salida.
- La narración es un audio de la biblioteca, acotado a la escena.
- La transición pertenece al corte entre dos escenas. Los valores son corte directo y fundido.
- La biblioteca es del usuario y la comparten sus proyectos. Este spec asume un usuario ya identificado.
- El spec fija el documento, las operaciones y la forma de la composición. La infraestructura de render queda en la preferencia de stack de arriba.
- La apariencia de la aplicación se cambia en vivo desde un panel. Esos valores no quedan fijos en el código. No es el texto ni el fondo de una escena.

## Decisions so far

<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [Cuánto dura el fundido](issues/05-duracion-del-fundido.md) — La persona elige el tiempo de cada fundido; las escenas se solapan y el short se acorta; nace en medio segundo o en la escena más corta, y no pasa de esa escena ni baja a cero.
- [Cómo se mapea un proyecto a Remotion](issues/06-mapeo-remotion.md) — Una composición por proyecto y una secuencia por escena cubren imagen, video recortado, textos y narración; el corte es en serie y el fundido puede solapar y acortar el total, o ocurrir dentro de la duración de cada escena.
- [Qué datos tiene un texto de escena](issues/01-datos-del-texto.md) — Cada texto dura toda la escena; puede haber varios a la vez, apilados por el orden de la lista, con contenido, posición, tamaño, color y alineación.
- [Qué pasa al añadir, eliminar y reordenar escenas](issues/02-anadir-eliminar-reordenar.md) — La escena nueva va al final y nace con un medio visual; el corte es el par vecino en ese orden, sobrevive solo si sigue así, y todo corte nuevo es corte directo.
- [Qué queda al reemplazar el medio visual](issues/03-reemplazar-medio.md) — Reemplazar cambia el medio de esa escena y la deja en su sitio; textos, narración, duración y cortes se conservan; un video nuevo entra desde el inicio con esa duración; elegir el mismo medio no cambia nada.
- [Qué operaciones tiene la biblioteca](issues/04-operaciones-biblioteca.md) — Incorporar crea un medio con el nombre del archivo; se ven todos, el más reciente primero; la narración se pone o se quita de la escena; quitar de la biblioteca se niega si alguna escena lo usa.
- [Qué variables entran en el panel de apariencia](issues/08-panel-de-apariencia.md) — Siete valores viven en este navegador, con feeling inicial y Restablecer: tipografía, color del texto, color de fondo, e iconos y elementos de las barras y de las secciones.

## Not yet specified

- Cómo el documento deja lugar, más adelante, a que un texto o una narración lleguen desde una API, sin elegir proveedor ni diseñar ese flujo.
- Qué significa que el short sea un archivo exportable, sin diseñar el servicio de render ni el almacenamiento de los archivos.
- Huecos de la narración que no cambian el modelo ya cerrado: audio más corto que la escena, punto de inicio dentro de la escena, volumen.
- Idioma de la interfaz.
- Catálogo de estilos de texto (fuentes, presets, animación) más allá de los datos que cierre el ticket del texto.

## Out of scope

- Publicar el short en TikTok y en Facebook. Este esfuerzo termina en el spec del editor.
- Armar un proyecto entero a partir de un guion.
- Música de fondo.
- Subtítulos automáticos.
- Colaboración entre varias personas.
- Plantillas de proyectos.
- Elegir, contratar o integrar un proveedor de IA. La puerta queda en la niebla; el proveedor queda fuera de este esfuerzo.
