# Mis Coches · PWA

PWA sencilla para iPhone para controlar los gastos de 3 coches por separado:

- Mercedes-Benz Serie C
- Mercedes-Benz GLB
- Ford Fiesta (apartado preparado para añadir las fotos más adelante)

## Categorías

La aplicación NO registra combustible ni calcula consumos.

Categorías actuales:

1. Mantenimiento
2. Neumáticos
3. Seguro
4. ITV
5. Impuestos
6. Otros gastos

Cada coche tiene:
- Total acumulado
- Número de registros
- Importe medio por registro
- Kilometraje de cada registro
- Kilometraje actual
- Intervalo entre los dos últimos registros de neumáticos
- Intervalo entre los dos últimos registros de mantenimiento
- Distribución por categoría
- Historial de gastos
- Añadir / editar / borrar gastos

La pantalla "General" reúne los 3 coches.

## Datos

Los gastos se guardan localmente en `localStorage` del navegador/dispositivo. Esta primera versión no necesita base de datos ni cuenta de usuario. El kilometraje se guarda junto a cada gasto para poder medir la duración entre operaciones.

**Importante:** si borras los datos del navegador o cambias de dispositivo, los registros locales pueden perderse. Más adelante podemos añadir sincronización/backup.

## Subir a GitHub

1. Crea un repositorio nuevo en GitHub.
2. Sube todo el contenido de esta carpeta manteniendo la estructura.
3. En GitHub entra en **Settings → Pages**.
4. Selecciona **Deploy from a branch**, elige `main` y `/ (root)`.
5. Guarda y espera a que GitHub publique la página.

La aplicación usa rutas relativas (`./`), por lo que funciona también cuando GitHub Pages la publica dentro de `https://usuario.github.io/nombre-del-repositorio/`.

## Instalar en iPhone

Abre la URL publicada con Safari y usa:

**Compartir → Añadir a pantalla de inicio → Abrir como app web**

## Próximas mejoras posibles

- Filtro por año/mes.
- Gráficos mensuales.
- Adjuntar foto de factura.
- Exportar/importar los gastos en CSV/JSON.
- Copia de seguridad.
- Sincronización entre dispositivos.
- Recordatorios de ITV, seguro y mantenimiento.
- Añadir las imágenes definitivas del Ford Fiesta.
