# Cómo se mapea un proyecto a Remotion

Type: research
Status: resolved
Claimed by: investigación del mapeo a Remotion

## Question

Averiguar, en la documentación oficial de Remotion, cómo se representa este documento. FFmpeg entra solo para marcar el límite: qué preparación del medio, si alguna, la composición no hace sola.

Documento ya cerrado:

- Un short vertical. Una composición por proyecto. Una secuencia por escena, en orden.
- Cada escena tiene un medio visual. Imagen: se muestra durante la duración de la escena. Video: el recorte (entrada y salida) es la duración; cambiar la duración mueve la salida.
- Cero o más textos por escena. Los campos de cada texto todavía no están decididos: el informe tiene que decir qué puede colocar Remotion (contenido, posición, estilo, intervalo dentro de la escena) sin elegir el modelo.
- Una narración opcional, audio de la biblioteca, que termina con la escena y no cruza a la siguiente.
- Entre dos escenas, corte directo o fundido. La duración del fundido y si se superpone o se descuenta están abiertas: describir qué formas ofrece Remotion, sin elegir una.

El informe separa lo que el spec puede prometer de lo que Remotion no cubre. Si hay más de una forma de armarlo, las describe y no elige.

## Answer

Remotion puede representar el documento cerrado. Un proyecto es una composición (`width`, `height`, `fps`, `durationInFrames` y un componente). El short vertical es ese rectángulo con el alto mayor que el ancho. Cada escena es una secuencia en orden: `<Series>` cuando los cortes no se solapan, o `<TransitionSeries>` cuando un corte lleva fundido. La imagen se monta durante la escena. El video no se pre-corta: `trimBefore` es la entrada y `durationInFrames` es la duración, así que cambiar la duración mueve la salida. Los textos son capas HTML dentro de la escena: Remotion puede colocar contenido, posición, estilo CSS, fuente cargada y un intervalo dentro de la escena, sin traer un modelo de campos. La narración es un audio con `src` dentro de la secuencia; en un corte sin solape termina con la escena.

El spec puede prometer ese árbol. Lo que no puede cerrar todavía, porque Remotion ofrece más de una forma y este ticket no elige, es el fundido. Con `<TransitionSeries>` y `fade()`, las dos escenas se solapan y el total del short se acorta en la duración del fundido; cada escena conserva su duración declarada. Sin solape, la opacidad se anima dentro de la duración de cada escena y el total sigue siendo la suma. En el solape, el fundido es de opacidad: las dos narraciones coinciden en el tiempo salvo que el volumen se anime aparte. El audio de un video suena salvo que se silencie. Un archivo que ni Mediabunny ni el respaldo pueden decodificar sí hay que convertirlo antes; recortar un medio decodificable no. Codificar el archivo exportado es el render, fuera de esta composición.

La rama es `research/mapeo-remotion`. El informe está en [`.scratch/editor-spec/research/mapeo-remotion.md`](../research/mapeo-remotion.md).
