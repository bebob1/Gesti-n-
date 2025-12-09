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
        espcad_id 
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
        let escaEspDesc = null;

        // Si fuente origen es un ID de departamento, obtener descripción
        if (invid_fuente_origen && !isNaN(invid_fuente_origen)) {
            const departamento = await VideosModel.getDepartamentoById(invid_fuente_origen);
            if (departamento) {
                fuenteOrigenDesc = departamento.dep_desc;
            }
        }

        // Si espcad_id es un ID, obtener la descripción de la CADENA
        if (espcad_id && !isNaN(espcad_id)) {
            const cadena = await VideosModel.getCadenaById(espcad_id);
            if (cadena) {
                escaEspDesc = cadena.espcad_cad_desc;
            }
        }

        // Crear el video
        const videoData = {
            videoId: invid_video_id,
            titulo: invid_titulo,
            publishedAt: invid_published_at,
            url: invid_url,
            fuenteOrigen: fuenteOrigenDesc || null,
            espcadId: espcad_id || null,
            escaEspDesc: escaEspDesc
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
        if (err.code === '23505') {
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
 * Actualiza la fuente origen y cadena (especie) de un video
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { invid_fuente_origen, espcad_id } = req.body;

    try {
        // Obtener el video actual para mantener valores existentes
        const videoActual = await VideosModel.getVideoById(id);
        
        if (!videoActual) {
            return res.status(404).json({ 
                success: false, 
                message: 'Video no encontrado' 
            });
        }

        // Usar valores actuales si no se envían nuevos
        let fuenteOrigenFinal = invid_fuente_origen || videoActual.invid_fuente_origen;
        let espcadIdFinal = espcad_id || videoActual.espcad_id;
        let escaEspDescFinal = videoActual.esca_esp_desc;

        // Si se envió una nueva fuente origen que es ID, obtener descripción
        if (invid_fuente_origen && !isNaN(invid_fuente_origen)) {
            const departamento = await VideosModel.getDepartamentoById(invid_fuente_origen);
            if (departamento) {
                fuenteOrigenFinal = departamento.dep_desc;
            }
        }

        // Si se envió un nuevo espcad_id, obtener la descripción de la CADENA
        if (espcad_id && !isNaN(espcad_id)) {
            const cadena = await VideosModel.getCadenaById(espcad_id);
            if (cadena) {
                escaEspDescFinal = cadena.espcad_cad_desc;
            }
        }

        // Actualizar el video con los valores finales
        const updated = await VideosModel.updateVideoFuenteCadena(
            id,
            fuenteOrigenFinal,
            espcadIdFinal,
            escaEspDescFinal
        );

        if (updated) {
            res.json({ success: true, message: 'Video actualizado correctamente' });
        } else {
            res.status(500).json({ success: false, message: 'Error al actualizar video' });
        }

    } catch (err) {
        console.error('ERROR al actualizar video:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar video' });
    }
});

module.exports = router;