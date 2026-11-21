# Cómo entra el medio en el cuadro

Type: grilling
Status: resolved

## Question

El short es vertical y el medio visual de la escena casi nunca tiene esa proporción. Remotion, si nadie elige, encaja el video entero y puede dejar bandas. Llenar el cuadro recortando es la otra forma. La imagen se encaja por su propio estilo, no por la prop del video.

Hay que decidir si el medio llena el cuadro recortando o cabe entero con bandas, y si imagen y video siguen la misma regla. Un GIF no se muestra como una imagen quieta: decir si en este spec entra como video o queda fuera.

## Comments

El short es vertical. Casi ninguna foto ni ningún video tienen esa forma. Hay dos maneras de meterlos en el cuadro.

Una es mostrar el medio entero. Sobra espacio a los lados o arriba y abajo, y ese espacio queda en bandas vacías. La otra es llenar el cuadro: lo que no entra queda fuera, y se ve la parte del centro. En un short, las bandas se leen como un hueco. Llenar el cuadro es la imagen que una persona espera ver en el celular.

Imagen y video usan la misma regla. Si no, reemplazar una foto por un video cambiaría el encuadre sin que nadie lo pidiera. La persona no elige, en este spec, entre bandas y llenar. Tampoco elige qué zona se ve: se ve el centro. Elegir un punto distinto sería otro control, y no hace falta para cerrar el documento.

Un GIF se mueve, así que no es una foto del primer fotograma ni un archivo que la biblioteca rechaza. Entra como video: se incorpora como video, se ve en movimiento y sigue las reglas de duración y de recorte de un video. Se ve una pasada, no un bucle que rellene la escena. El sonido del archivo, si lo trajera, no se oye: eso quedó en [Si se oye el audio del video](09-audio-del-video.md).

## Answer

El medio visual llena el cuadro. Lo que no cabe queda fuera, y lo que se ve es el centro. No quedan bandas. La imagen y el video usan ese mismo encaje. No es un dato de la escena: la persona no lo cambia.

Un GIF es un video. Se incorpora como video, anima, y usa este encaje. No es una imagen quieta y no se rechaza por ser GIF. Su duración y su recorte son los de un video. No se repite para llenar un tiempo más largo que el archivo.

**Cuadro** y **Encaje** quedaron en `CONTEXT.md`. **Medio** y **Medio visual** ahora dicen que un GIF es un video.
