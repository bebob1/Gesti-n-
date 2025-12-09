const express = require('express');
const router = express.Router();
const VideosModel = require('../models/videos.model');
const basicAuth = require('../middleware/auth');

// Aplicar autenticación a todas las rutas de videos
router.use(basicAuth);

/**
 * GET /videos
 * Renderiza la página principal de gestión de videos (sin datos, se cargan por API)
 */
router.get('/', async (req, res) => {
    try {
        res.render('videos', { videos: [] });
    } catch (err) {
        console.error('ERROR al cargar videos:', err);
        res.status(500).send('Error al cargar videos');
    }
});

/**
 * GET /videos/api/videos
 * Obtiene videos paginados con filtros aplicados en BD
 */
router.get('/api/videos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Filtros
        const filters = {
            searchText: req.query.searchText || '',
            filterID: req.query.filterID || '',
            filterFechaDesde: req.query.filterFechaDesde || '',
            filterFechaHasta: req.query.filterFechaHasta || '',
            filterDepartamento: req.query.filterDepartamento || '',
            filterCadena: req.query.filterCadena || ''
        };

        // Obtener videos paginados y total
        const result = await VideosModel.getVideosPaginated(limit, offset, filters);

        res.json({
            success: true,
            videos: result.videos,
            totalCount: result.totalCount,
            currentPage: page,
            totalPages: Math.ceil(result.totalCount / limit),
            limit: limit
        });
    } catch (err) {
        console.error('ERROR al cargar videos paginados:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al cargar videos' 
        });
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
 * GET /videos/api/filter-options
 * Obtiene las opciones únicas de departamentos y cadenas para los filtros
 */
router.get('/api/filter-options', async (req, res) => {
    try {
        const options = await VideosModel.getFilterOptions();
        res.json(options);
    } catch (err) {
        console.error('ERROR al cargar opciones de filtros:', err);
        res.status(500).json({ error: true, message: 'Error al cargar opciones' });
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
        dep_id,
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
        let depDesc = null;
        let espcadEspDesc = null;

        // Si se proporciona dep_id, obtener descripción
        if (dep_id && !isNaN(dep_id)) {
            const departamento = await VideosModel.getDepartamentoById(dep_id);
            if (departamento) {
                depDesc = departamento.dep_desc;
            }
        }

        // Si se proporciona espcad_id, obtener la descripción de la especie
        if (espcad_id && !isNaN(espcad_id)) {
            const cadena = await VideosModel.getCadenaById(espcad_id);
            if (cadena) {
                espcadEspDesc = cadena.espcad_esp_desc;
            }
        }

        // Crear el video
        const videoData = {
            videoId: invid_video_id,
            titulo: invid_titulo,
            publishedAt: invid_published_at,
            url: invid_url,
            depId: dep_id || null,
            depDesc: depDesc,
            espcadId: espcad_id || null,
            espcadEspDesc: espcadEspDesc
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
 * Actualiza el departamento y/o cadena de un video
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { dep_id, espcad_id } = req.body;

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
        let depIdFinal = dep_id || videoActual.dep_id;
        let depDescFinal = videoActual.dep_desc;
        let espcadIdFinal = espcad_id || videoActual.espcad_id;
        let espcadEspDescFinal = videoActual.espcad_esp_desc;

        // Si se envió un nuevo departamento, obtener su descripción
        if (dep_id && !isNaN(dep_id)) {
            const departamento = await VideosModel.getDepartamentoById(dep_id);
            if (departamento) {
                depDescFinal = departamento.dep_desc;
            }
        }

        // Si se envió un nuevo espcad_id, obtener la descripción de la especie
        if (espcad_id && !isNaN(espcad_id)) {
            const cadena = await VideosModel.getCadenaById(espcad_id);
            if (cadena) {
                espcadEspDescFinal = cadena.espcad_esp_desc;
            }
        }

        // Actualizar el video con los valores finales
        const updated = await VideosModel.updateVideoDepartamentoCadena(
            id,
            depIdFinal,
            depDescFinal,
            espcadIdFinal,
            espcadEspDescFinal
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