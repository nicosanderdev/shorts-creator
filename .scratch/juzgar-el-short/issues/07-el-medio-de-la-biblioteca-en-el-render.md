# Si el medio de la biblioteca entra en el render

Type: research

## Question

Las páginas oficiales leídas en [Cómo puede el navegador producir el archivo](03-archivo-en-el-navegador.md) no dicen dos cosas que el spec necesita antes de elegir forma.

La biblioteca de este editor guarda el medio con `URL.createObjectURL`: el `src` es un `blob:` de este navegador. Averiguar, en el código o en la documentación oficial de `@remotion/media` y de `renderMediaOnWeb()`, si ese `blob:` vale como `src` de `<Video>` y de `<Audio>`.

La narración tiene que terminar con la escena. Las páginas no dicen si el audio premontado (`premountFor`, `postmountFor`) entra en la mezcla del archivo. Averiguar qué hace el render en el navegador con ese tramo.

El informe cita la fuente de cada afirmación. Si el código y las páginas siguen en silencio, lo dice y no completa el hueco.
