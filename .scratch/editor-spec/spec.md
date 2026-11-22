# Editor de shorts

Status: ready-for-agent

Spec del editor. El glosario vive en el contexto del proyecto. Las decisiones que este spec recoge están cerradas en el mapa Editor de shorts.

## Problem Statement

Una persona quiere armar un short vertical a mano. Tiene medios propios (video, imagen, audio), los reparte en escenas ordenadas, les pone textos y una narración, y elige si el paso entre dos escenas es un corte directo o un fundido. Necesita ver el cuadro mientras edita, saber cuánto dura el short y cambiar el feeling de la aplicación en el momento.

Hoy no hay editor: el repositorio no tiene aplicación. El trabajo de decidir el documento, las operaciones y la forma de la composición ya está hecho. Falta la herramienta que esa persona usa.

## Solution

Un editor de un proyecto a la vez. La pantalla muestra un solo modo, además de una barra con el nombre del proyecto, la duración del short y el paso de un modo a otro. Los modos son Biblioteca, Escenas, Escena y Apariencia.

La biblioteca guarda los medios del usuario. El proyecto es una lista ordenada de escenas. Cada escena tiene un medio visual, una duración, cero o más textos y, si la persona lo pone, una narración. Entre dos escenas vecinas hay un corte, con corte directo o fundido.

El cuadro muestra el short: una composición por proyecto y una secuencia por escena. La persona edita en el modo Escena, con el cuadro grande al lado de los datos de esa escena, y la duración de la barra responde a lo que el short dura de verdad, fundidos incluidos.

La apariencia (el feeling de la aplicación en este navegador) se cambia en vivo y no forma parte del proyecto.

## User Stories

1. Como usuario, quiero abrir el editor y ver mi proyecto, para empezar a trabajar sin identificarme de nuevo.
2. Como usuario, quiero ver el nombre del proyecto en la barra, para saber qué documento tengo abierto.
3. Como usuario, quiero ver la duración del short en la barra, para saber cuánto dura lo que estoy armando.
4. Como usuario, quiero que un proyecto sin escenas dure cero, para que la barra no invente tiempo.
5. Como usuario, quiero pasar entre Biblioteca, Escenas, Escena y Apariencia, para llegar a cada superficie de trabajo.
6. Como usuario, quiero ver un solo modo a la vez, para que el cuadro quede grande y la pantalla no sea una mesa de corte.
7. Como usuario, quiero que la barra siga visible al cambiar de modo, para no perder el nombre ni la duración.
8. Como usuario, quiero ver la biblioteca vacía al empezar, para saber que todavía no incorporé medios.
9. Como usuario, quiero ver la lista de escenas vacía al empezar, para saber que el proyecto no tiene escenas.
10. Como usuario, quiero abrir Escena sin tener una escena, para que el modo exista y me diga que no hay nada que editar.
11. Como usuario, quiero que el editor arranque en el feeling inicial, para ver la aplicación con sus colores y tamaños de partida.
12. Como usuario, quiero incorporar un video desde mi máquina, para usarlo después en una escena.
13. Como usuario, quiero incorporar una imagen desde mi máquina, para usarla como medio visual.
14. Como usuario, quiero incorporar un audio desde mi máquina, para usarlo como narración.
15. Como usuario, quiero que un GIF entre como video, para verlo en movimiento y no como una foto quieta.
16. Como usuario, quiero que el medio conserve el nombre del archivo, sin la carpeta, para reconocerlo en la lista.
17. Como usuario, quiero incorporar dos veces el mismo archivo y obtener dos medios, para usar cada copia por su cuenta.
18. Como usuario, quiero que dos medios puedan llamarse igual, para no renombrar nada al incorporar.
19. Como usuario, quiero que un archivo que no es video, imagen ni audio no cree un medio, para que la biblioteca quede como estaba.
20. Como usuario, quiero ver todos mis medios, los use o no una escena, para saber qué tengo.
21. Como usuario, quiero ver la clase de cada medio, para distinguir video, imagen y audio.
22. Como usuario, quiero ver la lista con el más reciente primero, para encontrar lo último que incorporé.
23. Como usuario, quiero una sola biblioteca compartida por mis proyectos, para no duplicar medios por proyecto.
24. Como usuario, quiero añadir una escena al final del proyecto, para alargar el short sin insertar en medio de la lista.
25. Como usuario, quiero elegir el medio visual al añadir la escena, para que la escena nazca ya con imagen o video.
26. Como usuario, quiero que no se pueda añadir una escena si la biblioteca no tiene una imagen o un video, para no crear una escena vacía.
27. Como usuario, quiero que un audio no sirva como medio visual, para que la narración y la imagen no se confundan.
28. Como usuario, quiero que la escena nueva nazca sin textos y sin narración, para completarlos después.
29. Como usuario, quiero que una imagen nazca mostrándose tres segundos, para tener un tramo corto y legible.
30. Como usuario, quiero que un video nazca con la entrada al inicio y un recorte de tres segundos, para no traer el archivo entero.
31. Como usuario, quiero que un video más corto que tres segundos nazca con el largo del archivo, para no pedir un recorte que no existe.
32. Como usuario, quiero que un video sin duración positiva no se añada, para que el proyecto quede como estaba.
33. Como usuario, quiero que la primera escena no cree un corte, para que un corte solo exista entre dos escenas.
34. Como usuario, quiero que el corte con la escena anterior nazca en corte directo, para que el fundido sea una elección posterior.
35. Como usuario, quiero ver las escenas en el orden del proyecto, para saber cómo va a quedar el short.
36. Como usuario, quiero elegir una escena y verla en Escena, para editar sus datos.
37. Como usuario, quiero que, al añadir, la escena nueva sea la que muestra Escena, para seguir trabajando sobre lo que acabo de crear.
38. Como usuario, quiero el cuadro grande al lado de los datos de la escena, para ver el encaje, la tipografía y la posición mientras edito.
39. Como usuario, quiero que el medio llene el cuadro y que lo que sobra quede fuera, centrado, para ver el short como en el celular, sin bandas.
40. Como usuario, quiero que la imagen y el video usen el mismo encaje, para que reemplazar uno por el otro no cambie el encuadre.
41. Como usuario, quiero que el encaje no sea un control, para que ninguna escena guarde una excepción.
42. Como usuario, quiero que la pista del video no se oiga, para que el único audio posible sea la narración.
43. Como usuario, quiero que un GIF se vea en movimiento, una sola pasada, para que no se repita y rellene la escena.
44. Como usuario, quiero que una escena sin narración no suene, para distinguir el silencio de un audio puesto.
45. Como usuario, quiero que la barra sume la duración de las escenas mientras todos los cortes sean directos, para ver el largo del short.
46. Como usuario, quiero añadir un texto a la escena, para poner copy sobre el medio.
47. Como usuario, quiero que el texto nuevo diga «Texto», en el centro del cuadro, en blanco, alineado al centro y con un tamaño de ocho centésimos de la altura, para tener un punto de partida visible.
48. Como usuario, quiero varios textos a la vez en la misma escena, para apilar más de un bloque.
49. Como usuario, quiero que cada texto dure la escena entera, para no recortar el copy por dentro de la escena.
50. Como usuario, quiero editar el contenido, la posición, el tamaño, el color y la alineación de cada texto, para colocarlo en el cuadro.
51. Como usuario, quiero la posición como el centro del bloque, en fracción horizontal y vertical del cuadro, para que no dependa del tamaño en píxeles.
52. Como usuario, quiero el tamaño como fracción de la altura del cuadro, para que el texto escale con el short.
53. Como usuario, quiero alinear el bloque a la izquierda, al centro o a la derecha, para componer la línea.
54. Como usuario, quiero que el orden de la lista sea el apilado, con el último dibujado arriba, para tapar o destapar un texto reordenando.
55. Como usuario, quiero quitar un texto, para sacarlo de la escena sin tocar el medio.
56. Como usuario, quiero reordenar los textos, para cambiar cuál queda arriba.
57. Como usuario, quiero que al cambiar la duración de la escena los textos sigan ocupándola entera, con la misma posición, tamaño, color y alineación, para no rehacer el copy.
58. Como usuario, quiero ver el texto en el cuadro mientras lo edito, para juzgar la posición y el tamaño.
59. Como usuario, quiero una sola fuente en el cuadro y en la interfaz, para no elegir familia, caja, borde, sombra, animación ni preset.
60. Como usuario, quiero poner una narración eligiendo un audio de la biblioteca, para que la escena hable.
61. Como usuario, quiero sustituir la narración por otro audio, para cambiar lo que se oye sin tocar el medio visual.
62. Como usuario, quiero quitar la narración y que el audio siga en la biblioteca, para silenciar la escena sin perder el medio.
63. Como usuario, quiero una sola narración por escena, para que no se mezclen dos audios de biblioteca en el mismo tramo.
64. Como usuario, quiero usar el mismo audio en varias escenas, para no incorporarlo de nuevo.
65. Como usuario, quiero que la narración termine cuando termina la escena, para que no siga en la escena siguiente.
66. Como usuario, quiero que, en un corte directo, la narración no entre en la escena siguiente, para oír solo la escena que corresponde.
67. Como usuario, quiero que la narración no se repita para llenar la escena, para que un audio corto no invente un bucle.
68. Como usuario, quiero quitar de la biblioteca un medio que ninguna escena usa, para limpiar lo que no sirve.
69. Como usuario, quiero que se niegue quitar un medio usado como medio visual, para no romper la escena que lo muestra.
70. Como usuario, quiero que se niegue quitar un medio usado como narración, para no romper la escena que lo oye.
71. Como usuario, quiero que, si el medio se niega, la biblioteca y los proyectos queden igual, para no perder nada en el intento.
72. Como usuario, quiero que baste con que una escena lo use, aunque otras no, para que la negación mire todos los usos.
73. Como usuario, quiero cambiar la duración de una imagen, para decidir cuánto se muestra.
74. Como usuario, quiero cambiar la duración de un video y que se mueva la salida, para alargar o acortar el recorte sin mover la entrada.
75. Como usuario, quiero que la entrada del video no tenga un control propio, para que solo se mueva al nacer la escena o al reemplazar el video.
76. Como usuario, quiero que pedir duración cero se niegue y siga la duración anterior, para que una escena nunca dure nada.
77. Como usuario, quiero que pedir un recorte que se sale del archivo se niegue y siga la duración anterior, para no congelar el último fotograma.
78. Como usuario, quiero que, cuando el archivo sí alcanza, el cambio de duración se aplique, para obtener el recorte que pedí.
79. Como usuario, quiero que una imagen no tenga el tope del archivo, para que su duración sea solo cuánto se muestra.
80. Como usuario, quiero reemplazar el medio visual y que la escena siga en su sitio, para cambiar la imagen sin reordenar.
81. Como usuario, quiero que los cortes de al lado conserven su transición al reemplazar, para no rehacer el fundido.
82. Como usuario, quiero que el medio anterior siga en la biblioteca, para usarlo en otra escena.
83. Como usuario, quiero que las otras escenas que usan ese medio sigan igual, para que el reemplazo sea de una sola escena.
84. Como usuario, quiero reemplazar una imagen por un video o un video por una imagen, para cambiar de clase.
85. Como usuario, quiero que un audio no entre en el reemplazo, para no poner un audio donde va el medio visual.
86. Como usuario, quiero que elegir el mismo medio no cambie la escena, para que la entrada de un video siga donde está.
87. Como usuario, quiero que los textos sobrevivan al reemplazo, con su contenido, posición, tamaño, color, alineación y orden, para no rehacer el copy.
88. Como usuario, quiero que la narración sobreviva al reemplazo y termine con la escena, para no reponer el audio.
89. Como usuario, quiero que una imagen nueva conserve la duración de la escena, para que el tiempo mostrado siga igual.
90. Como usuario, quiero que, al pasar de video a imagen, la duración que queda sea la que tenía el recorte, para no inventar otro largo.
91. Como usuario, quiero que un video nuevo entre desde el inicio y dure lo que ya duraba la escena, para reemplazar sin heredar la entrada vieja.
92. Como usuario, quiero que, si ese video es más corto que la duración, la escena pase a durar lo que dura el archivo, para no mostrar un fotograma congelado.
93. Como usuario, quiero que, en ese acortamiento, los textos y la narración se conserven y terminen con la escena, para que el copy y el audio acompañen el nuevo largo.
94. Como usuario, quiero que un video sin duración positiva se niegue como reemplazo y la escena quede como estaba, para no vaciarla.
95. Como usuario, quiero pasar un corte de corte directo a fundido, para que las dos escenas se crucen.
96. Como usuario, quiero que el fundido nazca en medio segundo, para tener un cruce corto sin escribir el tiempo.
97. Como usuario, quiero que, si la escena más corta del corte dura menos de medio segundo, el fundido nazca con esa duración, para que el cruce quepa.
98. Como usuario, quiero elegir el tiempo de cada fundido, para que cada corte tenga el suyo.
99. Como usuario, quiero un tiempo mayor que cero y como máximo la escena más corta del corte, inclusive, para usar hasta el scene entero en el cruce.
100. Como usuario, quiero que pedir más tiempo del que cabe se niegue y siga el tiempo anterior, para no desbordar la escena.
101. Como usuario, quiero que pedir cero en el fundido se niegue, para que quitar el cruce sea volver a corte directo.
102. Como usuario, quiero que volver a corte directo olvide el tiempo, para que un fundido nuevo vuelva a nacer con la regla de alta.
103. Como usuario, quiero que un fundido nuevo nazca otra vez en medio segundo o en la escena más corta, para no heredar un tiempo ya olvidado.
104. Como usuario, quiero que una escena pueda estar en dos fundidos a la vez, para cruzar con la anterior y con la siguiente.
105. Como usuario, quiero que durante el fundido se solapen el final de la escena que sale y el inicio de la que entra, para ver el cruce.
106. Como usuario, quiero que cada escena conserve su duración durante el fundido, para que el cruce no me recorte las escenas.
107. Como usuario, quiero que el short dure la suma de las duraciones menos la suma de los tiempos de fundido, para que la barra baje cuando hay cruces.
108. Como usuario, quiero ver las dos imágenes y los textos de las dos escenas durante el solape, para leer el cruce.
109. Como usuario, quiero oír las dos narraciones durante el solape, para que cada voz acompañe a su escena.
110. Como usuario, quiero que durante el solape no se oiga ninguna pista de video, para que solo hablen las narraciones.
111. Como usuario, quiero acortar una escena y que el acortamiento siempre se aplique, para no quedar trabado por un fundido.
112. Como usuario, quiero que cada fundido vecino que ya no cabe baje hasta la escena más corta del corte, para que el tiempo quepa.
113. Como usuario, quiero que ese tiempo bajado pase a ser el tiempo del fundido, para que alargar la escena después no lo restaure.
114. Como usuario, quiero que el acortamiento por un video de reemplazo más corto baje los fundidos vecinos igual que un cambio de duración, para que las dos formas de acortar se comporten igual.
115. Como usuario, quiero que añadir una escena no cree un fundido, para que el corte nuevo siga siendo corte directo.
116. Como usuario, quiero eliminar una escena con sus textos y su narración, para sacarla del short.
117. Como usuario, quiero que al eliminar el medio siga en la biblioteca, para no perder el archivo.
118. Como usuario, quiero que desaparezcan los cortes que tocaban a la escena eliminada, con su tiempo de fundido, para no dejar un cruce huérfano.
119. Como usuario, quiero que, si dos escenas quedan vecinas y antes no lo eran, ese corte nazca en corte directo, para no inventar un fundido.
120. Como usuario, quiero eliminar la primera, la última o la única sin que eso cree un corte de más, para que solo queden cortes entre vecinas reales.
121. Como usuario, quiero poder dejar el proyecto sin escenas, para volver a una duración de cero.
122. Como usuario, quiero reordenar una escena a otra posición, para cambiar el orden del short.
123. Como usuario, quiero que un corte conserve su transición solo si esas dos escenas siguen juntas y en el mismo orden, para no aplicar un fundido a otro par.
124. Como usuario, quiero que, si el par se separa o se invierte, el corte desaparezca con su tiempo, para no guardar un fundido que ya no tiene esas dos escenas.
125. Como usuario, quiero que cada par vecino nuevo nazca en corte directo, para elegir el fundido a propósito.
126. Como usuario, quiero que eliminar y reordenar no creen un fundido, para que el fundido solo nazca cuando yo lo pido.
127. Como usuario, quiero ver y cambiar los siete valores de la apariencia, para ajustar el feeling sin tocar el short.
128. Como usuario, quiero que cada control muestre el valor vigente, para saber de dónde parto.
129. Como usuario, quiero el tamaño de la tipografía, el color del texto y el color de fondo como grupo de la interfaz, para distinguirlos de las barras y las secciones.
130. Como usuario, quiero los tamaños de iconos y de elementos de las barras, aparte de los de las secciones, para mover cada lugar por su cuenta.
131. Como usuario, quiero tamaños en píxeles enteros, del 8 al 96, para tener un rango acotado.
132. Como usuario, quiero que el tamaño de un icono sea el lado del glifo y el de un elemento sea el alto del control, para saber qué estoy agrandando.
133. Como usuario, quiero que todas las barras compartan sus dos tamaños y todas las secciones los otros dos, para no ajustar control por control.
134. Como usuario, quiero que mover un valor deje quietos a los demás, para cambiar una cosa cada vez.
135. Como usuario, quiero que el color del texto pinte la letra, los iconos y el texto de los elementos, para un solo color de trazo.
136. Como usuario, quiero que el color de fondo pinte las barras, las secciones y los elementos, para un solo color de superficie.
137. Como usuario, quiero poder dejar los dos colores iguales, para probar el feeling sin una combinación prohibida.
138. Como usuario, quiero que hover, foco y selección inviertan el par de colores, para ver el estado del control.
139. Como usuario, quiero que el cambio se vea en el momento, para juzgar el feeling sin guardar.
140. Como usuario, quiero que la apariencia quede en este navegador, para encontrarla al volver.
141. Como usuario, quiero que otro navegador, o este mismo si borro los datos del sitio, arranque en el feeling inicial, para no depender de una cuenta.
142. Como usuario, quiero Restablecer, para devolver los siete valores al feeling inicial de un golpe.
143. Como usuario, quiero que Restablecer no toque el proyecto ni la biblioteca, para no perder el short al limpiar el feeling.
144. Como usuario, quiero que el panel de apariencia use la misma tipografía que el resto, para que el feeling se aplique también ahí.
145. Como usuario, quiero que el proyecto y la biblioteca sigan en este navegador, para retomar el short al volver.
146. Como usuario, quiero que borrar los datos del sitio deje la biblioteca y el proyecto vacíos, para que ese almacenamiento sea de este navegador y no de una cuenta.
147. Como usuario, quiero ver el short en vertical en el cuadro, para juzgarlo como se va a ver en el celular.

## Implementation Decisions

- La aplicación es web, en React y TypeScript. La composición es de Remotion. El servicio de render, FFmpeg, Supabase y Cloudflare no entran en este spec: la preferencia de stack queda anotada y sin construir.
- Hay un usuario ya identificado por este navegador. El editor no pide login. Ese usuario tiene una biblioteca y una lista de proyectos. Este spec abre un solo proyecto, de nombre «Proyecto», y no incluye crearlo, renombrarlo ni cambiar de proyecto. Quitar un medio consulta todos los proyectos de ese usuario; con un solo proyecto, el caso visible es el proyecto abierto. La operación queda escrita sobre la lista completa.
- La biblioteca y el proyecto persisten en este navegador. Otro navegador, o este mismo si se borran los datos del sitio, abre una biblioteca vacía y un proyecto sin escenas. La apariencia persiste aparte, en este navegador, y no viaja dentro del proyecto.
- El documento habla en segundos. La composición es un cuadro de 1080 por 1920 a 30 fotogramas por segundo. Un segundo son 30 fotogramas. La duración que muestra la barra es la de la composición.
- Una composición por proyecto. Cada escena es una secuencia en orden. El corte directo no pone transición entre las dos secuencias. El fundido es un fundido de opacidad que solapa las dos escenas y acorta el total: el short dura la suma de las duraciones de las escenas menos la suma de los tiempos de fundido. Cada escena conserva su duración. Un proyecto sin escenas dura cero.
- El medio visual llena el cuadro, centrado, sin bandas. No es un dato de la escena. La imagen y el video usan ese mismo encaje. Un GIF es un video: se incorpora como video, se muestra en movimiento, no se repite y su recorte es el de un video.
- La pista del video no se oye. La composición la deja en silencio siempre. No hay dato ni control. Vale al nacer, al reemplazar y al elegir el mismo video. La narración es el único audio de la escena. Sin narración, la escena no suena.
- La narración es un audio de la biblioteca colocado en la escena, desde el inicio del archivo, sin punto de inicio, sin volumen y sin bucle. Termina cuando termina la escena y no sigue en la siguiente. Si el archivo se acaba antes, el resto de la escena queda en silencio. Durante un fundido se oyen las dos narraciones, porque las dos escenas están montadas.
- Un texto es una capa durante toda la secuencia de la escena. Guarda contenido, posición, tamaño, color y alineación. La posición es el centro del bloque, como fracción horizontal y vertical del cuadro. El tamaño es una fracción de la altura del cuadro. La alineación es izquierda, centro o derecha. El orden de la lista es el apilado: el último se dibuja arriba. Al añadir, el contenido es «Texto», la posición es el centro, el tamaño es ocho centésimos de la altura, el color es blanco y la alineación es al centro. Hay una sola fuente, la misma en la interfaz y en el cuadro. No es un dato del texto ni un valor de la apariencia.
- La interfaz está en español. Los modos se llaman Biblioteca, Escenas, Escena y Apariencia. El control que devuelve el feeling se llama Restablecer.
- En Escena, el cuadro queda grande al lado de los datos de la escena elegida: el medio, la duración o el recorte, la narración, el corte con la siguiente y los textos. Al añadir, esa escena nueva es la elegida. El cuadro puede recorrer el short, de modo que un fundido se vea como solape. La barra muestra siempre la duración del short entero.
- La apariencia son siete valores. El feeling inicial es: tipografía de la interfaz 16 px, color del texto `#1a1a1a`, color de fondo `#f7f7f5`, iconos de las barras 20 px, elementos de las barras 36 px, iconos de las secciones 20 px, elementos de las secciones 36 px. Los tamaños son píxeles enteros del 8 al 96. El de un icono es el lado del glifo. El de un elemento es el alto del control. Todas las barras comparten sus dos tamaños. Todas las secciones comparten los otros dos. El color del texto pinta la letra, los iconos y el texto de los elementos. El color de fondo pinta las barras, las secciones y los elementos. Hover, foco y selección invierten el par. El panel agrupa los tres de la interfaz y, aparte, los de las barras y los de las secciones. El tamaño se edita con el número visible. El color muestra el color aplicado.
- El tiempo de un fundido pertenece al corte. Al pasar de corte directo a fundido nace en medio segundo, o en la duración de la escena más corta del corte si esa dura menos. El tiempo es mayor que cero y puede llegar hasta esa escena, inclusive. Pedir más, o pedir cero, se niega y el tiempo anterior sigue. Volver a corte directo olvida el tiempo. Acortar una escena siempre se aplica, venga de un cambio de duración o de un video de reemplazo más corto. Cada fundido vecino que ya no cabe baja hasta la escena más corta de ese corte. Alargar después no restaura el tiempo. Añadir, eliminar y reordenar no crean un fundido. Un corte sobrevive, con su transición, solo cuando esas dos escenas siguen juntas y en el mismo orden.
- Reemplazar cambia el medio de esa escena y la deja en su sitio. Elegir el mismo medio no es un reemplazo. Un video nuevo pone la entrada al inicio del archivo y el recorte en la duración que la escena ya tenía, salvo que el archivo sea más corto: entonces la duración pasa a ser el largo del archivo. Una imagen nueva no tiene recorte y conserva la duración. Un video sin duración positiva no se añade y no reemplaza.
- La duración de una escena es siempre mayor que cero. En una imagen es cuánto se muestra. En un video es el largo del recorte: la entrada más esa duración es la salida, y la salida no pasa del final del archivo. Cambiar la duración mueve la salida. No hay operación para mover la entrada, salvo el alta y el reemplazo por otro video, que la dejan al inicio.

## Testing Decisions

La costura es el editor en marcha. Un buen test hace lo que hace la persona: cambia de modo, incorpora, añade, edita la escena, cambia la apariencia. Después comprueba lo que esa persona puede observar: la biblioteca, el proyecto, la duración del short en la barra, el modo que está en pantalla y los siete valores de la apariencia.

No se afirma la estructura interna del documento ni los nombres de los componentes de Remotion. El silencio del video, el encaje y el solape del fundido se comprueban por lo que muestra el cuadro y por la duración de la barra.

No hay tests previos en el repositorio. Cada ticket trae los suyos en esta misma costura y los deja verdes. Se prueba el comportamiento visible, incluidos los rechazos en los que la biblioteca o el proyecto quedan como estaban.

## Out of Scope

- Publicar el short en TikTok o en Facebook.
- Armar un proyecto a partir de un guion.
- Música de fondo.
- Subtítulos automáticos.
- Colaboración entre varias personas.
- Plantillas de proyectos.
- Elegir, contratar o integrar un proveedor de IA.
- El servicio de render, el archivo exportable y el almacenamiento en Supabase o en Cloudflare.
- El login y el alta de usuarios.
- Crear, renombrar o cambiar de proyecto.
- Carpetas, etiquetas, búsqueda, orden armado a mano, renombrar un medio, pasar un medio a otro usuario, cambiar el archivo de un medio ya incorporado y recortar en la biblioteca.
- Mover la entrada del video a un punto elegido.
- Un control para oír la pista del video, para el volumen, para el punto de inicio de la narración o para rellenar una narración más corta que la escena.
- Elegir el encaje, las bandas o la zona visible del medio.
- Familia tipográfica, caja de fondo, borde, sombra, animación y presets del texto.
- Un catálogo de fuentes.
- En la apariencia: la familia, el peso, los bordes y un tercer color.

## Further Notes

El mapa deja lugar, más adelante, a que un texto o una narración lleguen desde una API. Este spec no agrega un dato de origen ni ese flujo: el contenido del texto y el audio de la narración son datos de la escena, y quien escriba después puede asignarlos por las mismas operaciones.

Qué significa que el short sea un archivo exportable queda fuera. La persona ve el short en el cuadro y lee su duración en la barra.

Los huecos de la narración (archivo más corto que la escena, punto de inicio, volumen) no cambian el modelo. Este spec no les pone control. El audio suena desde el inicio del archivo mientras la escena está en pantalla, no se repite, y no sigue fuera de la escena.
