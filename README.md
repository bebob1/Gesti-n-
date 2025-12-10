# 🎯 Sistema de Administración - Agrosavia

Sistema de gestión administrativa para eventos, foros y videos.

## 📋 Características

- ✅ Gestión de **Eventos**, **Foros** y **Videos**
- 🔐 Autenticación Basic Auth
- 📊 Paginación dinámica (10, 20, 50, 100 registros)
- 🔍 Filtros avanzados por ID, fecha, departamento y cadena
- 🎨 Interfaz moderna y responsive
- 🐘 PostgreSQL como base de datos
- 🐳 Docker y Docker Compose para despliegue

## 🚀 Instalación

### Requisitos previos

- Node.js 18+
- PostgreSQL 15+
- Docker y Docker Compose

### Instalación con Docker

1. **Configurar variables de entorno**
```bash
cp .env.example .env
```

2. **Construir y levantar contenedores**
```bash
docker-compose up -d
```

3. **Verificar logs**
```bash
docker-compose logs -f app
```

4. **Acceder a la aplicación**
```
http://localhost:8200
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express.js** - Framework web minimalista y flexible
- **PostgreSQL 15+** - Base de datos relacional
- **pg** - Cliente PostgreSQL para Node.js

### Frontend
- **EJS** - Motor de plantillas para renderizado del lado del servidor
- **HTML5/CSS3** - Interfaz moderna y responsive
- **JavaScript Vanilla** - Interactividad del cliente sin frameworks

### DevOps & Tools
- **Docker** - Contenedorización de la aplicación
- **Docker Compose** - Orquestación de servicios
- **dotenv** - Gestión de variables de entorno

### Seguridad
- **Basic Authentication** - Autenticación HTTP básica
- **Queries Parametrizadas** - Prevención de SQL Injection
- **CORS** - Control de recursos de origen cruzado

## 🎨 Estilos y Diseño

### CSS Centralizado

Todos los estilos de la aplicación están centralizados en un único archivo:

📂 **Ubicación:** `/public/css/admin-styles.css`

**Paleta de Colores:**
- **Fondo principal:** `#ffffff` (blanco)
- **Texto principal:** `#2c3e50` (gris oscuro)
- **Acento primario:** `#4ecdc4` (turquesa)
- **Éxito:** `#27ae60` (verde)
- **Error:** `#e74c3c` (rojo)
- **Bordes:** `#e8ecef` (gris claro)

**Estructura del CSS:**
```
admin-styles.css
├── Reset y configuración base
├── Header y navegación
├── Contenedores principales
├── Filtros y búsqueda
├── Tablas y paginación
├── Botones y formularios
├── Modales y alertas
└── Responsive (media queries)
```

### Cómo Modificar Estilos

Para cambiar estilos en toda la aplicación:

1. Edita el archivo `/public/css/admin-styles.css`
2. Los cambios se aplicarán a todas las vistas automáticamente
3. Refresca el navegador para ver los cambios

**Ejemplo:** Cambiar el color de acento principal
```css
/* Busca y reemplaza #4ecdc4 por tu color preferido */
.btn-back, .btn-logout {
    color: #4ecdc4; /* ← Cambiar aquí */
    border: 2px solid #4ecdc4; /* ← Y aquí */
}
```

## ⚙️ Configuraciones Especiales

### Filtro de Eventos Activos por Defecto

La página de eventos está configurada para mostrar **solo eventos activos** por defecto.

📂 **Archivo:** `views/eventos.ejs`

**Comportamiento:**
- Al cargar la página: muestra solo eventos activos
- Al limpiar filtros: vuelve a mostrar solo eventos activos
- El usuario puede cambiar manualmente a "Todos" o "Inactivos" si lo necesita

**Código relevante:**
```html
<!-- Select con "Activo" preseleccionado -->
<select id="filterEstado" class="filter-select">
    <option value="">Todos los estados</option>
    <option value="1" selected>Activo</option>
    <option value="0">Inactivo</option>
</select>
```

```javascript
// Función clearFilters mantiene el filtro en "Activo"
function clearFilters() {
    document.getElementById('filterEstado').value = '1'; // Activos por defecto
    // ... resto del código
}
```

## 🔧 Configuración

### Variables de Entorno

Consulta `.env.example` para las variables requeridas:

- **Base de datos**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- **Servidor**: `PORT`
- **Autenticación**: `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`

## 📖 Cómo Agregar un Nuevo Gestor

Sigue estos pasos para agregar un nuevo módulo (ejemplo: "Noticias"):

### Paso 1: Crear el Modelo

📂 **Ubicación:** `models/noticias.model.js`

Este archivo contiene todas las operaciones con la base de datos

### Paso 2: Crear las Rutas

📂 **Ubicación:** `routes/noticias.js`

Define todos los endpoints de tu módulo

### Paso 3: Registrar las Rutas

📂 **Ubicación:** `server.js`

Agrega estas dos líneas en el archivo principal:

```javascript
// 1. Importar las rutas (junto con las otras importaciones)
const noticiasRoutes = require('./routes/noticias');

// 2. Usar las rutas (junto con las otras rutas)
app.use('/noticias', noticiasRoutes);
```

Ejemplo de cómo debería verse:

```javascript
// ============================
// IMPORTAR RUTAS
// ============================
const indexRoutes = require('./routes/index');
const eventosRoutes = require('./routes/eventos');
const videosRoutes = require('./routes/videos');
const forosRoutes = require('./routes/foros');
const noticiasRoutes = require('./routes/noticias');  // ← AGREGAR AQUÍ

// ============================
// USAR RUTAS
// ============================
app.use('/', indexRoutes);
app.use('/eventos', eventosRoutes);
app.use('/videos', videosRoutes);
app.use('/foros', forosRoutes);
app.use('/noticias', noticiasRoutes);  // ← AGREGAR AQUÍ
```

### Paso 4: Crear la Vista

📂 **Ubicación:** `views/noticias.ejs`

### 🎯 Resumen de Archivos a Crear/Modificar

✅ **Crear:**
- `models/noticias.model.js` - Lógica de base de datos
- `routes/noticias.js` - Endpoints del API
- `views/noticias.ejs` - Interfaz visual

✏️ **Modificar:**
- `server.js` - Registrar las rutas (2 líneas)
- `views/menu.ejs` - Agregar tarjeta al menú

### 💡 Consejos

- **Usa naming consistente:** Si tu tabla se llama `intb_noticias`, usa `noticia_*` para las columnas
- **Copia y adapta:** Los archivos existentes tienen toda la estructura necesaria
- **Colores únicos:** Cada módulo debe tener su propio esquema de colores para distinguirlos
- **Prueba cada endpoint:** Verifica que todos los endpoints funcionen antes de continuar

## 🔐 Seguridad

- Basic Auth implementado para todas las rutas protegidas
- Sanitización de entradas SQL mediante queries parametrizadas
- Escape HTML en la renderización de datos
- Variables de entorno para credenciales sensibles

## 🐛 Debugging

### Ver logs del contenedor
```bash
docker-compose logs -f app
```

### Reiniciar servicios
```bash
docker-compose restart
```

## 📦 Dependencias Principales

- **express**: Framework web
- **pg**: Cliente PostgreSQL
- **ejs**: Motor de plantillas
- **dotenv**: Variables de entorno
- **cors**: CORS middleware