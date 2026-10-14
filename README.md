# Mis Coches · PWA

PWA en español para iPhone para controlar los gastos de tres coches por separado:

- Mercedes-Benz Serie C
- Mercedes-Benz GLB
- Ford Fiesta (apartado preparado para añadir las fotos más adelante)

## Categorías y funciones

La aplicación **no registra combustible ni calcula consumos**.

Categorías: Mantenimiento, Neumáticos, Seguro, ITV, Impuestos y Otros gastos.

Cada registro incluye fecha, importe, kilometraje, categoría, concepto y notas. Cada coche muestra el total acumulado, número de registros, importe medio, kilometraje más alto registrado, intervalo entre los dos últimos registros de neumáticos y de mantenimiento, distribución por categoría e historial.

La pantalla **General** compara los gastos de los tres coches.

## Ajustes, copias e informes

- **Exportar copia:** descarga un archivo JSON con los registros de todos los coches.
- **Importar copia:** permite recuperar un archivo JSON exportado por la aplicación. La importación sustituye los registros que haya actualmente; por seguridad, confirma la operación antes de aplicarla.
- **Informe por correo:** permite preparar un CSV de un coche o de todos. En iPhone, si el sistema ofrece compartir archivos, se abre la hoja de compartir para elegir Mail u otra aplicación. En navegadores sin compartir archivos, se descarga el CSV y se abre el borrador de correo; puede ser necesario adjuntar el CSV manualmente.

Las copias y los informes contienen información de los gastos y kilometrajes. Guárdalos en un lugar seguro.

## Datos

Los registros se guardan en `localStorage` del navegador/dispositivo. No hay servidor ni sincronización automática. Exporta copias periódicamente y antes de importar otra copia o borrar los datos de Safari.

## Publicar en GitHub Pages

1. Sube el contenido de esta carpeta al directorio raíz del repositorio.
2. En GitHub abre **Settings → Pages**.
3. Selecciona **Deploy from a branch**, elige `main` y `/ (root)`.
4. Guarda y espera a que GitHub publique la página.

La aplicación usa rutas relativas (`./`) y funciona también si GitHub Pages publica bajo la ruta del repositorio.

## Instalar en iPhone

Abre la URL publicada con Safari y selecciona **Compartir → Añadir a pantalla de inicio**. El icono de la aplicación usa `assets/logo_app.png`.

## Versión 0.4.0

- Nuevo icono de la aplicación proporcionado por el usuario.
- Ajuste de espaciado superior en las pantallas.
- Tarjetas de la pantalla principal sin logos superpuestos y con fotos algo más compactas.
- Nuevo encuadre del fondo del GLB, orientado a la parte derecha y algo más abajo.
- Gesto de deslizar desde el borde izquierdo hacia la derecha para volver.
- Ajustes para exportar/importar copia de seguridad y preparar informes CSV por coche o globales.
- Tarjetas de General con fondo negro, logo a la izquierda y gasto total a la derecha.
- Se mantienen los datos locales y las categorías existentes; no se añaden gastos de combustible.
