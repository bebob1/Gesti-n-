const express = require('express');
const router = express.Router();
const basicAuth = require('../middleware/auth');

/**
 * GET /
 * Página principal - Menú de módulos
 */
router.get('/', basicAuth, (req, res) => {
    res.render('menu');
});

/**
 * GET /logout
 * Cierra la sesión del usuario
 */
router.get('/logout', (req, res) => {
    res.status(401).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sesión Cerrada</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    text-align: center;
                }
                h1 { color: #333; margin-bottom: 20px; }
                p { color: #666; margin-bottom: 30px; }
                .btn {
                    background: #4CAF50;
                    color: white;
                    padding: 12px 30px;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                }
                .btn:hover { background: #45a049; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✅ Sesión Cerrada</h1>
                <p>Has cerrado sesión exitosamente.</p>
                <a href="/" class="btn">Volver a Iniciar Sesión</a>
            </div>
        </body>
        </html>
    `);
});

module.exports = router;