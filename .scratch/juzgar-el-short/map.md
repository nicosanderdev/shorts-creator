# Juzgar el short

Label: wayfinder:map

## Destination

Un spec en el que la persona puede juzgar el short en el editor y sacarlo como archivo. El mapa termina cuando no queda ninguna decisión abierta antes de escribir ese spec.

## Notes

Dominio: editor de shorts. Leer [CONTEXT.md](../../CONTEXT.md) al empezar. El spec ya construido es [Editor de shorts](../editor-spec/spec.md); su mapa es [Editor de shorts](../editor-spec/map.md). En cada ticket, usar el skill de su tipo: grilling y domain-modeling en la conversación, prototype en el de aspecto, research en el del archivo.

Marco cerrado al chartar. Las sesiones siguientes lo toman como dado:

- Vista previa es un modo más. Se muestra uno por vez, en la misma barra que Biblioteca, Escenas, Escena y Apariencia.
- En Vista previa, de arriba abajo: el cuadro, la lista de escenas, el recorrido. Cada escena de la lista muestra su medio visual con el mismo encaje, en el orden del proyecto. En un video, esa imagen es el fotograma de la entrada. No se añade, no se elimina y no se reordena. Elegir una escena lleva el recorrido al inicio de esa escena y el proyecto queda igual.
- El recorrido vive en Vista previa.
- Escena conserva un cuadro al lado de sus datos, más chico que el de Vista previa, para ver el texto mientras se edita.
- Los botones de Vista previa son Reproducir, Pausar y Renderizar.
- Reproducir toma el short entero desde el momento del recorrido, con la narración, y el recorrido avanza. Al llegar al final se detiene.
- Pausar detiene la vista previa y deja el recorrido donde está.
- Renderizar produce, en este navegador, un video vertical igual al cuadro: 1080 por 1920, 30 fotogramas por segundo, con la duración, los fundidos, los textos y la narración. La pista del video va en silencio. El navegador lo descarga. No hay servicio ni cuenta.
- La posición y el tamaño del texto se nombran en porcentaje del cuadro. El documento guarda la fracción. 50 y 50 es el centro. 8 es el tamaño con el que nace un texto. El número del campo es esa fracción por cien. Siguen las mismas aceptaciones y rechazos de antes: el tamaño queda por encima de cero, y la posición puede caer fuera de 0 a 100.
- El fundido se edita en Escena, en un bloque llamado Fundido, arriba de los textos. El bloque elige corte directo o fundido y, si es fundido, el tiempo. Es el corte con la escena siguiente. En la última escena el bloque no está.
- El documento, la biblioteca, la narración, las reglas del fundido y la apariencia siguen como en el spec del editor.

## Decisions so far

<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [Cómo puede el navegador producir el archivo](issues/03-archivo-en-el-navegador.md) — `renderMediaOnWeb` escribe el video en el navegador y lo descarga; el bitrate, el códec y la extensión siguen abiertos.

## Not yet specified

<!-- nada en alcance que todavía no se pueda escribir como ticket -->

## Out of scope

- El servicio de render, Supabase, Cloudflare y el login. Este esfuerzo termina en el archivo que produce el navegador.
- Publicar el short en TikTok y en Facebook.
- Armar un proyecto a partir de un guion, y elegir un proveedor de IA.
- Música de fondo, subtítulos automáticos, colaboración y plantillas.
- El catálogo de estilos de texto.
- Los huecos de la narración: audio más corto que la escena, punto de inicio y volumen.
- Crear, renombrar o cambiar de proyecto.
- Repetir la vista previa en bucle. Al llegar al final se detiene.
- Cambiar las reglas ya cerradas del fundido: su tiempo, el solape y que el short se acorte.
