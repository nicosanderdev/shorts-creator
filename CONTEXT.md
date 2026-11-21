# Editor de shorts

El contexto del editor con el que una persona modifica un proyecto a mano, hasta producir un short.

## Language

**Usuario**:
La persona dueña de una biblioteca y de los proyectos que usan esos medios.
_Avoid_: cuenta, perfil

**Proyecto**:
El documento que se edita. Una lista ordenada de escenas, vacía o no, que al renderizarse produce un short.
_Avoid_: video, short

**Escena**:
Un tramo ordenado de un proyecto. Tiene una duración, un medio visual (video o imagen), cero o más textos y, si hace falta, una narración.
_Avoid_: clip, toma, slide

**Duración**:
Cuánto dura una escena, siempre más que cero. En una imagen, es cuánto se muestra. En un video, es el largo del recorte.
_Avoid_: largo, tiempo

**Recorte**:
El tramo de un video que usa una escena. Va de la entrada a la salida, sin pasar del final del archivo, y ese largo es la duración de la escena.
_Avoid_: trim, corte

**Texto**:
Un bloque de copy en pantalla durante toda la escena. Una escena puede tener varios a la vez.
_Avoid_: título, subtítulo, caption

**Short**:
El video ya renderizado, vertical, listo para ver en el celular.
_Avoid_: video, proyecto, reel

**Cuadro**:
El rectángulo vertical del short, donde se ven el medio visual y los textos.
_Avoid_: lienzo, frame, pantalla

**Biblioteca**:
El conjunto de medios de un usuario. Cualquier proyecto de ese usuario puede usarlos.
_Avoid_: galería, assets

**Medio**:
Un video, una imagen o un audio de la biblioteca. Un GIF cuenta como video. Cada incorporación crea uno, y conserva el nombre con el que entró.
_Avoid_: archivo, asset, clip

**Medio visual**:
La imagen o el video de una escena. Es un medio de la biblioteca. Un GIF es un video. El sonido del archivo no se oye en el short.
_Avoid_: clip, asset

**Encaje**:
Cómo el medio visual ocupa el cuadro: lo llena por completo y lo que no cabe queda fuera, centrado. Una imagen y un video usan el mismo.
_Avoid_: object-fit, cover, bandas, recorte

**Editor**:
La herramienta con la que una persona modifica un proyecto a mano.
_Avoid_: motor, generador

**Modo**:
Una superficie de trabajo del editor. Se muestra una por vez: la biblioteca, las escenas, la escena elegida o la apariencia.
_Avoid_: pestaña, vista, pantalla

**Apariencia**:
Los valores del feeling de la aplicación en este navegador: tamaño de la tipografía, color del texto, color de fondo, y tamaño de los iconos y de los elementos de las barras y de las secciones. El color del texto pinta la letra, los iconos y el texto de los elementos; el color de fondo pinta las barras, las secciones y los elementos.
_Avoid_: tema, variables, configuración, tabla de configuración, estilo del texto

**Feeling inicial**:
Los valores de la apariencia con los que arranca la aplicación cuando este navegador todavía no guardó ninguno.
_Avoid_: tema por defecto, valores por defecto, preset

**Barra**:
Una franja de controles del editor. Todas las barras comparten el tamaño de sus iconos y el de sus elementos.
_Avoid_: barra de tareas, toolbar

**Sección**:
Una región del editor fuera de las barras. Todas las secciones comparten el tamaño de sus iconos y el de sus elementos.
_Avoid_: panel, zona

**Icono**:
El glifo de una barra o de una sección.
_Avoid_: símbolo, pictograma

**Elemento**:
Un control de una barra o de una sección, como un botón o un campo.
_Avoid_: widget, componente

**Narración**:
El audio hablado de una escena. Sale de la biblioteca y termina cuando termina la escena. Durante un fundido las dos escenas comparten tiempo, y los dos audios también.
_Avoid_: voiceover, locución, pista

**Corte**:
El límite entre una escena y la que la sigue. Ahí vive la transición.
_Avoid_: empalme, unión

**Transición**:
El paso de un corte: corte directo, que no ocupa tiempo, o fundido. El fundido tiene un tiempo propio de ese corte y, durante ese tiempo, las dos escenas se solapan.
_Avoid_: efecto, animación
