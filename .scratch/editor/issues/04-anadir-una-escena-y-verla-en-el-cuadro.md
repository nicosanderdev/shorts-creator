# 04 — Añadir una escena y verla en el cuadro

**What to build:** La persona elige una imagen o un video de la biblioteca y añade una escena al final del proyecto. La ve en Escenas y, en Escena, el cuadro queda grande al lado de sus datos. El medio llena el cuadro desde el centro, el video no suena y la escena nace en tres segundos, o en el largo del archivo si el video es más corto. El corte nuevo es corte directo y la barra muestra la suma de las duraciones.

**Blocked by:** 03 — La biblioteca incorpora y muestra los medios

**Status:** done

- [x] Si la biblioteca no tiene una imagen o un video, no se puede añadir una escena
- [x] Un audio no sirve como medio visual
- [x] Añadir pone la escena al final, con el medio visual elegido, sin textos y sin narración
- [x] Una imagen nace con una duración de tres segundos y no tiene recorte
- [x] Un video nace con la entrada al inicio; el recorte dura tres segundos, o el largo del archivo si dura menos
- [x] Un video sin duración positiva no se añade y el proyecto queda como estaba
- [x] Un GIF se ve en movimiento, una sola pasada, y no se repite para llenar la escena
- [x] La primera escena no crea un corte; si ya había escenas, el corte con la anterior nace en corte directo
- [x] Escenas muestra las escenas en el orden del proyecto
- [x] Al añadir, Escena muestra esa escena nueva
- [x] En Escena el cuadro queda grande, al lado de los datos de la escena
- [x] El medio llena el cuadro, lo que sobra queda fuera y se ve el centro; no hay bandas
- [x] La imagen y el video usan el mismo encaje, y el encaje no es un control
- [x] La pista del video no se oye, tampoco la de un GIF, y no hay un control para encenderla
- [x] Sin narración, la escena no suena
- [x] Con todos los cortes en corte directo, la barra muestra la suma de las duraciones
- [x] Sigue habiendo un solo modo a la vez
