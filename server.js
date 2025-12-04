const express = require("express");
const path = require("path");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// DB Connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false
});

// ============================
// BASIC AUTH MIDDLEWARE
// ============================
function basicAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Eventos"');
        return res.status(401).send('Autenticación requerida');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const validUsername = process.env.BASIC_AUTH_USER;
    const validPassword = process.env.BASIC_AUTH_PASSWORD;

    if (username === validUsername && password === validPassword) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Eventos"');
        return res.status(401).send('Credenciales inválidas');
    }
}

// Aplicar Basic Auth a todas las rutas
app.use(basicAuth);

// ============================
// RENDER PÁGINA PRINCIPAL
// ============================
app.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM intb_integracion_eventos
            ORDER BY event_id DESC
        `);

        res.render("index", { eventos: result.rows });

    } catch (err) {
        console.error("ERROR SELECT EVENTOS:", err);
        res.send("Error cargando eventos");
    }
});

// ============================
// API: TRAER DEPARTAMENTOS
// ============================
app.get("/api/departamentos", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT dep_id, dep_desc
            FROM intb_depto
            ORDER BY dep_desc ASC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("ERROR SELECT DEPTO:", err);
        res.status(500).json({ error: true });
    }
});

// ============================
// API: TRAER CIUDADES POR DEPTO
// ============================
app.get("/api/ciudades/:depId", async (req, res) => {
    const { depId } = req.params;

    try {
        const result = await pool.query(`
            SELECT ciu_id, ciu_desc
            FROM intb_ciudad
            WHERE dep_id = $1
            ORDER BY ciu_desc ASC
        `, [depId]);

        res.json(result.rows);
    } catch (err) {
        console.error("ERROR SELECT CIUD:", err);
        res.status(500).json({ error: true });
    }
});

// ============================
// API: GUARDAR CAMBIOS
// ============================
app.post("/api/eventos/:id", async (req, res) => {
    const { id } = req.params;
    const { event_depto_id, event_munic_id } = req.body;

    try {
        // Traer desc del depto
        const dep = await pool.query(
            `SELECT dep_desc FROM intb_depto WHERE dep_id = $1`,
            [event_depto_id]
        );

        // Traer desc del municipio
        const mun = await pool.query(
            `SELECT ciu_desc FROM intb_ciudad WHERE ciu_id = $1`,
            [event_munic_id]
        );

        if (dep.rowCount === 0 || mun.rowCount === 0) {
            return res.status(400).json({ success: false, msg: "Depto o municipio no existen" });
        }

        const dep_desc = dep.rows[0].dep_desc;
        const mun_desc = mun.rows[0].ciu_desc;

        // Actualizar
        await pool.query(`
            UPDATE intb_integracion_eventos
            SET 
                event_depto_id = $1,
                event_depto_desc = $2,
                event_munic_id = $3,
                event_munic_desc = $4,
                event_fec_actualizacion = NOW()
            WHERE event_id = $5
        `, [event_depto_id, dep_desc, event_munic_id, mun_desc, id]);

        res.json({ success: true });

    } catch (err) {
        console.error("ERROR UPDATE EVENTO:", err);
        res.status(500).json({ success: false });
    }
});

// ============================
// START SERVER
// ============================
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Basic Auth habilitado - Usuario: ${process.env.BASIC_AUTH_USER}`);
});