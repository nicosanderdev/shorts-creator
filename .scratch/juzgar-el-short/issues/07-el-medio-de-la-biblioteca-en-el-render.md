# Si el medio de la biblioteca entra en el render

Type: research
Status: resolved
Claimed by: investigación del medio en el render

## Question

Las páginas oficiales leídas en [Cómo puede el navegador producir el archivo](03-archivo-en-el-navegador.md) no dicen dos cosas que el spec necesita antes de elegir forma.

La biblioteca de este editor guarda el medio con `URL.createObjectURL`: el `src` es un `blob:` de este navegador. Averiguar, en el código o en la documentación oficial de `@remotion/media` y de `renderMediaOnWeb()`, si ese `blob:` vale como `src` de `<Video>` y de `<Audio>`.

La narración tiene que terminar con la escena. Las páginas no dicen si el audio premontado (`premountFor`, `postmountFor`) entra en la mezcla del archivo. Averiguar qué hace el render en el navegador con ese tramo.

El informe cita la fuente de cada afirmación. Si el código y las páginas siguen en silencio, lo dice y no completa el hueco.

## Answer

Un `blob:` creado en este navegador vale como `src` de `<Video>` en `renderMediaOnWeb()`: el test del paquete lo crea con `URL.createObjectURL` y comprueba que el audio de ese video queda en el archivo. `<Audio>` recibe el mismo string y lo manda al mismo `fetch`, sin una rama que rechace el esquema. No hay un test que pase un `blob:` a `<Audio>`. Las páginas de `src` no nombran `blob:`.

`premountFor` y `postmountFor` no entran en la mezcla de este render. Con el render, el premontaje queda apagado y el audio solo se codifica dentro de `from` y la duración. La narración puede terminar con la escena sin que ese tramo extra pase al archivo.

Sigue en silencio qué hace el render si el `Blob` no trae tipo. El informe está en [El medio de la biblioteca en el render](../research/medio-de-la-biblioteca-en-el-render.md).
