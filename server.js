const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos
app.set("view engine", "ejs");

// ============================
// IMPORTAR RUTAS
// ============================
const indexRoutes = require('./routes/index');
const eventosRoutes = require('./routes/eventos');
const videosRoutes = require('./routes/videos');
const forosRoutes = require('./routes/foros');

// ============================
// USAR RUTAS
// ============================
app.use('/', indexRoutes);
app.use('/eventos', eventosRoutes);
app.use('/videos', videosRoutes);
app.use('/foros', forosRoutes);

// ============================
// START SERVER
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`🔒 Basic Auth habilitado - Usuario: ${process.env.BASIC_AUTH_USER}`);
});