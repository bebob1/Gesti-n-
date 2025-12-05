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
 * GET /videos/api/cadenas
 * Devuelve todas las cadenas en formato JSON
 */
router.get('/api/cadenas', async (req, res) => {
    try {
        const cadenas = await VideosModel.getAllCadenas();
        res.json(cadenas);
    } catch (err) {
        console.error('ERROR al cargar cadenas:', err);
        res.status(500).json({ error: true, message: 'Error al cargar cadenas' });
    }
});

/**
 * POST /videos/api/create
 * Crea un nuevo video
 */
router.post('/api/create', async (req, res) => {
    const { 
        invid_video_id, 
        invid_titulo, 
        invid_published_at, 
        invid_url, 
        invid_fuente_origen, 
        invid_categoria 
    } = req.body;

    try {
        // Validar campos obligatorios
        if (!invid_video_id || !invid_titulo || !invid_published_at || !invid_url) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos obligatorios: video_id, titulo, fecha y url son requeridos' 
            });
        }

        // Obtener descripciones si se proporcionan IDs
        let fuenteOrigenDesc = invid_fuente_origen;
        let categoriaDesc = invid_categoria;

        // Si fuente origen es un ID de departamento, obtener descripción
        if (invid_fuente_origen && !isNaN(invid_fuente_origen)) {
            const departamento = await VideosModel.getDepartamentoById(invid_fuente_origen);
            if (departamento) {
                fuenteOrigenDesc = departamento.dep_desc;
            }
        }

        // Si categoría es un ID de cadena, obtener descripción
        if (invid_categoria && !isNaN(invid_categoria)) {
            const cadena = await VideosModel.getCadenaById(invid_categoria);
            if (cadena) {
                categoriaDesc = cadena.espcad_cad_desc;
            }
        }

        // Crear el video
        const videoData = {
            videoId: invid_video_id,
            titulo: invid_titulo,
            publishedAt: invid_published_at,
            url: invid_url,
            fuenteOrigen: fuenteOrigenDesc || null,
            categoria: categoriaDesc || null
        };

        const newVideo = await VideosModel.createVideo(videoData);

        if (newVideo) {
            res.json({ 
                success: true, 
                message: 'Video creado correctamente',
                video: newVideo 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Error al crear el video' 
            });
        }

    } catch (err) {
        console.error('ERROR al crear video:', err);
        
        // Verificar si es error de duplicado
        if (err.code === '23505') { // Código de PostgreSQL para unique violation
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un video con ese Video ID' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear video: ' + err.message 
        });
    }
});

/**
 * POST /videos/api/:id
 * Actualiza la fuente origen y categoría de un video
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { invid_fuente_origen, invid_categoria } = req.body;

    try {
        // Validar que se reciban los datos
        if (!invid_fuente_origen && !invid_categoria) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debe proporcionar fuente origen o categoría' 
            });
        }

        // Obtener descripciones si se proporcionan IDs
        let fuenteOrigenDesc = invid_fuente_origen;
        let categoriaDesc = invid_categoria;

        // Si fuente origen es un ID de departamento, obtener descripción
        if (invid_fuente_origen && !isNaN(invid_fuente_origen)) {
            const departamento = await VideosModel.getDepartamentoById(invid_fuente_origen);
            if (departamento) {
                fuenteOrigenDesc = departamento.dep_desc;
            }
        }

        // Si categoría es un ID de cadena, obtener descripción
        if (invid_categoria && !isNaN(invid_categoria)) {
            const cadena = await VideosModel.getCadenaById(invid_categoria);
            if (cadena) {
                categoriaDesc = cadena.espcad_cad_desc;
            }
        }

        // Actualizar el video
        const updated = await VideosModel.updateVideoCategoria(
            id,
            fuenteOrigenDesc,
            categoriaDesc
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