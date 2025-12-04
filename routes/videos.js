const express = require('express');
const router = express.Router();
const VideosModel = require('../models/videos.model');
const basicAuth = require('../middleware/auth');

// Aplicar autenticación a todas las rutas de videos
router.use(basicAuth);

/**
 * GET /videos
 * Renderiza la página principal de gestión de videos
 */
router.get('/', async (req, res) => {
    try {
        const videos = await VideosModel.getAllVideos();
        res.render('videos', { videos });
    } catch (err) {
        console.error('ERROR al cargar videos:', err);
        res.status(500).send('Error al cargar videos');
    }
});

/**
 * GET /videos/api/departamentos
 * Devuelve todos los departamentos en formato JSON
 */
router.get('/api/departamentos', async (req, res) => {
    try {
        const departamentos = await VideosModel.getAllDepartamentos();
        res.json(departamentos);
    } catch (err) {
        console.error('ERROR al cargar departamentos:', err);
        res.status(500).json({ error: true, message: 'Error al cargar departamentos' });
    }
});

/**
 * GET /videos/api/categorias
 * Devuelve todas las categorías únicas
 */
router.get('/api/categorias', async (req, res) => {
    try {
        const categorias = await VideosModel.getAllCategorias();
        res.json(categorias);
    } catch (err) {
        console.error('ERROR al cargar categorías:', err);
        res.status(500).json({ error: true, message: 'Error al cargar categorías' });
    }
});

/**
 * GET /videos/api/fuentes
 * Devuelve todas las fuentes de origen únicas
 */
router.get('/api/fuentes', async (req, res) => {
    try {
        const fuentes = await VideosModel.getAllFuentes();
        res.json(fuentes);
    } catch (err) {
        console.error('ERROR al cargar fuentes:', err);
        res.status(500).json({ error: true, message: 'Error al cargar fuentes' });
    }
});

/**
 * POST /videos/api/:id
 * Actualiza la categorización de un video
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { invid_fuente_origen, invid_categoria, invid_depto_desc } = req.body;
    
    try {
        // Actualizar el video
        const updated = await VideosModel.updateVideoCategorizacion(
            id,
            invid_fuente_origen || null,
            invid_categoria || null,
            invid_depto_desc || null
        );
        
        if (updated) {
            res.json({ success: true, message: 'Video actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Video no encontrado' });
        }
    } catch (err) {
        console.error('ERROR al actualizar video:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar video' });
    }
});

module.exports = router;