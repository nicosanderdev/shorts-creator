# Juzgar el short

Status: ready-for-agent

Spec para juzgar el short en el editor y sacarlo como archivo. El glosario vive en el contexto del proyecto. Las decisiones que este spec recoge están cerradas en el mapa Juzgar el short. El documento, la biblioteca, la narración, las reglas del fundido y la apariencia siguen en el spec del editor.

## Problem Statement

Una persona ya puede armar un proyecto a mano: medios, escenas, textos, narración y el corte entre dos escenas. Lo que ve en Escena es un cuadro de esa escena que además recorre el short. No tiene un modo para mirar el short entero, oír la narración y juzgar el fundido, ni una forma de llevarse el short como archivo.

Quiere juzgarlo en el editor, en este navegador, y descargar el video. No quiere un servicio, una cuenta ni una cola.

## Solution

Vista previa es un modo más, el último de la barra. Ahí están el cuadro, la lista de escenas y el recorrido, y los botones Reproducir, Pausar y Renderizar. El cuadro de Vista previa, en pausa y al reproducir, es la composición del archivo.

Escena conserva un cuadro chico al lado de sus datos. Muestra el inicio de la escena elegida, quieto, y deja de recorrer el short. El fundido se edita ahí, en un bloque llamado Fundido, y se juzga en Vista previa.

Renderizar produce, en este navegador, un video vertical igual a esa composición y lo descarga. El proyecto no cambia.

## User Stories

1. Como usuario, quiero que Vista previa sea el último modo de la barra, después de Biblioteca, Escenas, Escena y Apariencia, para juzgar el short cuando ya terminé de editarlo.
2. Como usuario, quiero ver un solo modo a la vez, para que el cuadro de Vista previa quede grande.
3. Como usuario, quiero que la barra siga visible en Vista previa, con el nombre del proyecto y la duración del short, para no perder el documento que estoy juzgando.
4. Como usuario, quiero en Vista previa, de arriba abajo, el cuadro, la lista de escenas y el recorrido, para ver el short, las escenas y el momento en ese orden.
5. Como usuario, quiero que el cuadro de Vista previa use la altura que le deja el modo y conserve la proporción del short, para juzgarlo grande y en vertical.
6. Como usuario, quiero que ese cuadro sea más grande que el de Escena, para distinguir mirar el short de editar una escena.
7. Como usuario, quiero que el cuadro de Vista previa, en pausa y al reproducir, sea la composición del archivo, para juzgar lo mismo que voy a descargar.
8. Como usuario, quiero los botones Reproducir, Pausar y Renderizar en Vista previa, para mirar el short y sacarlo desde el mismo modo.
9. Como usuario, quiero ver las escenas de la lista en el orden del proyecto, para reconocer cómo va a quedar el short.
10. Como usuario, quiero que cada escena de la lista muestre su medio visual con el mismo encaje, para verla como en el cuadro.
11. Como usuario, quiero que, en un video, la imagen de la lista sea el fotograma de la entrada, para reconocer el inicio del recorte.
12. Como usuario, quiero que una imagen de la lista sea esa imagen, para reconocer la escena.
13. Como usuario, quiero que un GIF, que es un video, muestre en la lista el fotograma de la entrada, para no verlo correr dentro de la lista.
14. Como usuario, quiero que desde la lista no se añada, no se elimine y no se reordene, para que juzgar no cambie el proyecto.
15. Como usuario, quiero que la lista no marque la escena por la que pasa el recorrido, para que el momento viva solo en el recorrido.
16. Como usuario, quiero que elegir una escena lleve el recorrido al inicio de esa escena, para saltar sin buscar el momento a mano.
17. Como usuario, quiero que elegir una escena deje el proyecto igual, para que el salto no edite nada.
18. Como usuario, quiero que el recorrido viva en Vista previa, para juzgar el short en su modo.
19. Como usuario, quiero que Escena no tenga recorrido, para editar la escena sin mover el short.
20. Como usuario, quiero que, con la vista previa detenida, mover el recorrido deje el cuadro en el momento nuevo, fundido incluido, en silencio, y siga pausada, para inspeccionar un fotograma.
21. Como usuario, quiero que un gesto que no cambia el momento no pause ni arranque la reproducción, para que un toque vacío no cambie el estado.
22. Como usuario, quiero que un proyecto sin escenas dure cero, con la lista vacía, el cuadro sin nada que mostrar y el recorrido sin otro momento, para no inventar un short.
23. Como usuario, quiero que el cuadro de Escena mida 120 px de ancho, con la proporción del short, al lado de los datos, para ver el texto mientras edito.
24. Como usuario, quiero que el cuadro de Escena muestre el inicio de la escena elegida, sola y a opacidad plena, para colocar el texto sobre esa imagen.
25. Como usuario, quiero que el recorrido no mueva el cuadro de Escena, para que editar no dependa del momento del short.
26. Como usuario, quiero que, en un video o un GIF, ese cuadro sea el fotograma de la entrada, quieto, para ver el inicio del recorte.
27. Como usuario, quiero que, en una imagen, ese cuadro sea la imagen, para ver lo que la escena muestra.
28. Como usuario, quiero ver en ese cuadro el medio visual, con el encaje de siempre, y los textos de la escena, para juzgar la posición y el tamaño.
29. Como usuario, quiero que un fundido no cambie el cuadro de Escena y que la escena vecina no aparezca, aunque esté editando el fundido, para no confundir el cruce con la escena.
30. Como usuario, quiero que, sin escena elegida, el cuadro de Escena no tenga nada que mostrar, para saber que no hay una escena que editar.
31. Como usuario, quiero juzgar el fundido en Vista previa, para ver el solape donde se mira el short.
32. Como usuario, quiero editar el fundido en Escena, en un bloque llamado Fundido, arriba de los textos, para tener el corte junto a la escena y antes del copy.
33. Como usuario, quiero que el bloque elija corte directo o fundido y, si es fundido, el tiempo, para definir el corte con la escena siguiente.
34. Como usuario, quiero que en la última escena el bloque no esté, para no ofrecer un corte que no existe.
35. Como usuario, quiero que el fundido nazca en medio segundo, o en la duración de la escena más corta del corte si esa dura menos, para no rehacer la regla al mover el bloque.
36. Como usuario, quiero que pedir cero, o más tiempo del que cabe, se niegue y siga el tiempo anterior, para que el bloque conserve los rechazos ya cerrados.
37. Como usuario, quiero que volver a corte directo olvide el tiempo, para que un fundido nuevo vuelva a nacer con la regla de alta.
38. Como usuario, quiero editar la posición y el tamaño de un texto en porcentaje del cuadro, para escribir 50 y no una fracción.
39. Como usuario, quiero que el documento guarde la fracción, para que 50 y 50 sigan siendo el centro.
40. Como usuario, quiero que un texto nuevo muestre 50, 50 y 8, para ver el centro y el tamaño con el que nace.
41. Como usuario, quiero que el tamaño quede por encima de cero y que pedir cero o menos se niegue y siga el tamaño anterior, para no perder el texto.
42. Como usuario, quiero que la posición pueda caer fuera de 0 a 100, para sacar un texto del cuadro si lo necesito.
43. Como usuario, quiero que la duración de la escena y el tiempo del fundido sigan en segundos, para no mezclarlos con el porcentaje del texto.
44. Como usuario, quiero que Reproducir tome el short desde el momento del recorrido, con la narración, y que el recorrido avance, para ver y oír a partir de donde estoy.
45. Como usuario, quiero que, al llegar al final, la reproducción se detenga y el recorrido quede ahí, para que el short no vuelva a empezar solo.
46. Como usuario, quiero que Pausar detenga la vista previa, deje el recorrido donde está y calle la narración, para parar sin perder el momento.
47. Como usuario, quiero que, mientras la vista previa corre, Pausar esté listo y Reproducir no, para tener un solo control de reproducción.
48. Como usuario, quiero que, mientras corre, Renderizar siga listo, para poder producir el archivo sin pausar a mano.
49. Como usuario, quiero que, al detenerse, sola o con Pausar, solo Reproducir esté listo entre los dos, para no ofrecer una pausa que no corre.
50. Como usuario, quiero que, con el recorrido al final, Reproducir siga listo y el pulso se niegue, sin un texto, para no reiniciar el short desde el botón.
51. Como usuario, quiero que, sin escenas, Reproducir siga listo y el pulso se niegue, sin un texto, para que la duración cero se comporte como el final.
52. Como usuario, quiero que mover el recorrido mientras corre pause al primer movimiento que cambia el momento, para soltar el short donde yo lo llevo.
53. Como usuario, quiero que, en ese movimiento, el cuadro siga el momento, en silencio, fundido incluido, para ver el fotograma sin oír la narración.
54. Como usuario, quiero que, al soltar, la vista previa quede pausada ahí, para seguir desde ese momento si reproduzco de nuevo.
55. Como usuario, quiero que elegir una escena mientras corre lleve el recorrido al inicio de esa escena y pause, para saltar sin dejar el short andando.
56. Como usuario, quiero ver, al reproducir un fundido, las dos imágenes y los textos de las dos escenas, para juzgar el cruce.
57. Como usuario, quiero oír las dos narraciones durante el fundido, para que cada voz acompañe a su escena.
58. Como usuario, quiero que la pista del medio visual no se oiga en la vista previa, para que el único audio sea la narración.
59. Como usuario, quiero que la narración termine cuando termina la escena y no se repita, para no oírla en la escena siguiente ni en bucle.
60. Como usuario, quiero no oír la narración con la vista previa en pausa o mientras muevo el recorrido, para que solo suene al reproducir.
61. Como usuario, quiero que un video en el cuadro de Vista previa muestre su recorte, desde la entrada, para juzgar el tramo que usa la escena.
62. Como usuario, quiero que un GIF se vea en movimiento, una sola pasada, para que no se repita y rellene la escena.
63. Como usuario, quiero que el medio llene el cuadro y que lo que sobra quede fuera, centrado, en la vista previa y en el archivo, para ver el mismo encaje.
64. Como usuario, quiero una sola fuente, la misma de la interfaz, en el cuadro y en el archivo, para no elegir una familia al producir el short.
65. Como usuario, quiero que, sin escenas, Renderizar se niegue, sin espera y sin archivo, y que se lea «No hay escenas», para saber por qué no hay descarga.
66. Como usuario, quiero que, en esa negación, el editor siga usable, para poder ir a armar el proyecto.
67. Como usuario, quiero que, si la vista previa iba reproduciéndose, Renderizar la pause y deje el recorrido donde está, para producir el archivo desde un short quieto.
68. Como usuario, quiero que, mientras se produce el archivo, no pueda cambiar de modo, no pueda editar y no pueda volver a pulsar Renderizar, para esperar sin tocar el proyecto.
69. Como usuario, quiero leer «Produciendo el archivo» mientras se produce, sin porcentaje y sin ver pasar los fotogramas, para saber que el navegador está trabajando.
70. Como usuario, quiero que, al terminar, el navegador descargue el archivo con el nombre del proyecto y la extensión mp4, «Proyecto.mp4», para encontrarlo entre las descargas.
71. Como usuario, quiero que, si el navegador repite ese nombre, lo numere él, para no pisar un archivo ya descargado.
72. Como usuario, quiero que, al terminar, el texto se vaya, Vista previa quede lista y no haya un aviso de éxito, para seguir juzgando sin un diálogo de más.
73. Como usuario, quiero que producir el archivo no cambie el proyecto, para que la descarga no edite el short.
74. Como usuario, quiero un video vertical de 1080 por 1920, a 30 fotogramas por segundo, para verlo en el celular como el cuadro.
75. Como usuario, quiero que el archivo dure lo que dura el short, fundidos incluidos, para que el cruce acorte el total igual que en la barra.
76. Como usuario, quiero que el archivo tenga los textos, la narración y el medio visual en silencio, para que lo descargado sea el short que juzgué.
77. Como usuario, quiero que la pista de audio del archivo quede, para que la narración se oiga en el video.
78. Como usuario, quiero el video en h264 y el audio en aac, los dos con bitrate medium, a 48000, con un keyframe cada 5 segundos, y que el navegador elija la aceleración, para no configurar el archivo a mano.
79. Como usuario, quiero que el archivo no lleve título ni autor, y que el comentario sea el que pone la función, incluido «Made with Remotion», para no inventar metadatos.
80. Como usuario, quiero que, si no llega a haber archivo, se lea «No se pudo producir el archivo», para saber que la descarga no está.
81. Como usuario, quiero que, si la producción no llegó a arrancar, ese texto aparezca directo, para no ver una espera que no empezó.
82. Como usuario, quiero que, si falla, el proyecto quede igual y pueda volver a pulsar Renderizar, para reintentar sin haber perdido nada.
83. Como usuario, quiero que un medio que no se puede leer use ese mismo fallo, para no recibir un archivo a medias.
84. Como usuario, quiero que «No hay escenas» y «No se pudo producir el archivo» sigan en Vista previa hasta que salga del modo, aparezca una escena o pulse Renderizar otra vez, para leer el motivo mientras sigo en el modo.
85. Como usuario, quiero que «Produciendo el archivo» dure solo mientras se produce, para que la espera no se quede pegada.
86. Como usuario, quiero que esos tres textos sean texto en Vista previa, para no tener un diálogo aparte.
87. Como usuario, quiero que el editor no me avise de la telemetría ni me pida un sí, para producir el archivo sin un paso de más.
88. Como usuario, quiero que el editor no me muestre el texto de una política de privacidad, para que ese texto no forme parte de juzgar el short.

## Implementation Decisions

- La aplicación sigue siendo web, en React y TypeScript, un proyecto a la vez, de nombre «Proyecto». Este spec no crea, no renombra y no cambia de proyecto. La biblioteca, el proyecto y la apariencia siguen en este navegador, como en el spec del editor.
- Vista previa es el quinto modo y cierra la barra: Biblioteca, Escenas, Escena, Apariencia, Vista previa. Se muestra uno por vez. La barra sigue visible.
- En Vista previa, de arriba abajo: el cuadro, la lista de escenas, el recorrido. El cuadro usa la altura que le deja el modo y conserva la proporción del short. El cuadro de Escena mide 120 px de ancho, con esa proporción, al lado de los datos, y es más chico.
- La lista muestra cada medio visual con el encaje del cuadro, en el orden del proyecto. En un video, incluido un GIF, esa imagen es el fotograma de la entrada, quieto. No se añade, no se elimina y no se reordena. La lista no marca la escena del recorrido. Elegir una escena lleva el recorrido al inicio de esa escena y el proyecto queda igual. Si la vista previa corría, además pausa.
- El recorrido vive solo en Vista previa. Entre Reproducir y Pausar hay un solo control listo: Pausar mientras corre, Reproducir cuando está detenida. Al final, y sin escenas, Reproducir sigue listo y el pulso se niega, sin texto. Renderizar sigue listo mientras no se está produciendo el archivo.
- Mover el recorrido mientras corre pausa al primer movimiento que cambia el momento. El cuadro sigue ese momento, en silencio, fundido incluido. Al soltar, queda pausada. Un gesto que no cambia el momento no pausa. Con la vista previa ya detenida, mover el recorrido deja el cuadro en el momento nuevo, en silencio, y sigue pausada.
- Reproducir, cuando el recorrido no está al final, toma el short desde ese momento, con la narración, y el recorrido avanza. Al llegar al final se detiene y el recorrido queda ahí. Pausar deja el recorrido donde está y calla la narración. No hay bucle.
- El cuadro de Escena muestra el inicio de la escena elegida, sola y a opacidad plena. En un video o un GIF es el fotograma de la entrada, quieto. En una imagen, la imagen. Se ven el medio visual, con el encaje, y los textos. El recorrido no lo mueve. La escena vecina no aparece, aunque el bloque Fundido se esté editando. Sin escena elegida, el cuadro no tiene nada que mostrar. Ese cuadro no es el recorrido de la composición.
- El bloque Fundido está en Escena, arriba de los textos. Elige corte directo o fundido y, si es fundido, el tiempo. Es el corte con la escena siguiente. En la última escena no está. El tiempo, el solape y el acortamiento del short siguen como en el spec del editor: nace en medio segundo o en la escena más corta, no baja a cero, no pasa de esa escena, y volver a corte directo olvida el tiempo.
- La posición y el tamaño del texto se nombran en porcentaje del cuadro. El documento guarda la fracción. 50 y 50 es el centro. 8 es el tamaño con el que nace un texto, la fracción ocho centésimos. El número del campo es esa fracción por cien. El tamaño queda por encima de cero. La posición puede caer fuera de 0 a 100. La duración y el tiempo del fundido siguen en segundos. Lo que el campo de fracción ya aceptaba o rechazaba se conserva; cambia la unidad que ve la persona.
- Hay una composición por proyecto y una secuencia por escena. El corte directo no solapa. El fundido solapa las dos escenas y acorta el total en la suma de los tiempos de fundido. Cada escena conserva su duración. Un proyecto sin escenas dura cero. El cuadro de Vista previa, en pausa y al reproducir, es esa composición. El archivo sale de la misma composición.
- La composición la pintan los fotogramas del compositor del DOM. HTML-in-canvas queda apagado. El medio visual y la narración entran por la vía de medios de Remotion. El `blob:` de este navegador vale como origen del medio visual y de la narración. El premontaje queda apagado: la narración suena solo dentro de la escena, y ese tramo extra no entra en el archivo.
- El medio visual llena el cuadro, centrado, sin bandas. No es un dato de la escena. La pista del medio visual va en silencio. La pista de audio del archivo queda, para que la narración se oiga. Callar el archivo entero no sirve, porque se llevaría la narración. Sin narración, la escena no suena. La narración sale del inicio del archivo, sin punto de inicio, sin volumen y sin bucle, y termina con la escena. Durante el fundido se oyen las dos. Un GIF es un video: una sola pasada, sin repetirse.
- Un texto de la composición dura la escena entera y guarda contenido, posición, tamaño, color y alineación, en las fracciones del documento. Hay una sola fuente, la misma de la interfaz.
- Renderizar usa la función de Remotion que escribe el video en este navegador, sin servidor de Node ni cola. El cuadro es 1080 por 1920, a 30 fotogramas por segundo. El largo es el del short. El contenedor es mp4. El video es h264 y el audio es aac. El bitrate de los dos es medium. La tasa de muestreo es 48000. Hay un keyframe cada 5 segundos. La aceleración queda a elección del navegador. No se escribe título ni autor. El comentario es el que pone la función, e incluye «Made with Remotion».
- La salida es la descarga del blob, no el selector de guardado. El nombre que se pide es `Proyecto.mp4`. Si el navegador repite el nombre, lo numera él.
- Sin escenas, Renderizar se niega: no hay espera ni archivo, se lee «No hay escenas» y el editor sigue usable. Con escenas, si iba reproduciéndose, se pausa y el recorrido queda donde está. El editor espera: no se cambia de modo, no se edita el proyecto y no se vuelve a pulsar Renderizar. Se lee «Produciendo el archivo», sin porcentaje y sin ver pasar los fotogramas. La vista previa permanece pausada durante la espera.
- Al terminar, el texto se va, Vista previa queda lista y no hay un aviso de éxito. El proyecto no cambia. Si no llega a haber archivo, se lee «No se pudo producir el archivo». Si la producción no llegó a arrancar, ese texto aparece directo. El proyecto queda igual y Renderizar se puede volver a pulsar. Un medio que no se puede leer usa ese fallo.
- «No hay escenas» y «No se pudo producir el archivo» siguen en Vista previa hasta que la persona sale del modo, aparece una escena o pulsa Renderizar otra vez. «Produciendo el archivo» dura solo mientras se produce. Los tres son texto en ese modo.
- La telemetría de la función sale siempre. El editor no avisa ni pide un sí. La licencia es la gratuita si quien hace el producto entra, y de empresa si no. Safari puede dejar en silencio el arranque de la narración, y este spec no lo corrige. Un blob sin tipo no tiene otra promesa.

## Testing Decisions

La costura es el editor en marcha, la misma de los tests del editor. Un buen test hace lo que hace la persona: cambia de modo, mueve el recorrido, reproduce, pausa, elige una escena, pulsa Renderizar. Después comprueba lo que esa persona puede observar: el cuadro, la lista, qué control está listo, los textos «No hay escenas», «Produciendo el archivo» y «No se pudo producir el archivo», y que el navegador descarga `Proyecto.mp4`.

No se afirma la estructura interna del documento ni los nombres de los componentes de Remotion. El momento, el fundido, los textos, el silencio del medio visual y la narración dentro de la escena se comprueban por lo que muestra el cuadro de Vista previa y por lo que se oye al reproducir.

El navegador de los tests no codifica video. Igual que los tests del editor simulan la duración de un medio, estos simulan la escritura del archivo y miran la espera, el nombre de la descarga y el fallo. El bitrate, el códec, la tasa, el intervalo de keyframes y la aceleración no están en pantalla: se comprueban en esa misma escritura, no en un segundo módulo.

No hay otra costura. Cada ticket trae los suyos en esta y los deja verdes.

## Out of Scope

- El servicio de render, Supabase, Cloudflare y el login. Este spec termina en el archivo que produce el navegador.
- Publicar el short en TikTok y en Facebook.
- Armar un proyecto a partir de un guion, y elegir un proveedor de IA.
- Música de fondo, subtítulos automáticos, colaboración y plantillas.
- El catálogo de estilos de texto.
- Los huecos de la narración: un control para el audio más corto que la escena, el punto de inicio y el volumen. El audio sigue sonando desde el inicio del archivo, sin bucle, y no sigue fuera de la escena.
- Crear, renombrar o cambiar de proyecto.
- Repetir la vista previa en bucle.
- Cambiar las reglas ya cerradas del fundido: su tiempo, el solape y que el short se acorte.
- El texto de una política de privacidad. El editor no avisa de la telemetría.
- HTML-in-canvas, el selector de guardado, un porcentaje de avance, ver pasar los fotogramas y un aviso de éxito.
- Marcar en la lista la escena del recorrido, dejar el recorrido en Escena y mostrar el solape en el cuadro de Escena.
- Corregir el silencio inicial de la narración en Safari.
- Una promesa distinta para un blob sin tipo.
- Numerar desde el editor un `Proyecto.mp4` repetido. Lo numera el navegador.

## Further Notes

El spec del editor dejaba el servicio de render fuera y prefería Remotion para la composición. Este spec construye esa composición en el navegador y produce el archivo aquí. No construye el servicio.

Queda atrás, para el cuadro, la parte de aquel spec que dejaba el cuadro grande en Escena y le hacía recorrer el short. El documento, la biblioteca, la narración, las reglas del fundido y la apariencia siguen allí.

La captura es el compositor del DOM. El archivo muestra lo que ese compositor dibuja, opacidad del fundido incluida. Este spec no promete el CSS que ese compositor no dibuja.
