const express = require('express');
const router = express.Router();
const EventosModel = require('../models/eventos.model');
const basicAuth = require('../middleware/auth');

// Aplicar autenticación a todas las rutas de eventos
router.use(basicAuth);

/**
 * GET /eventos
 * Renderiza la página principal de gestión de eventos (sin datos, se cargan por API)
 */
router.get('/', async (req, res) => {
    try {
        res.render('eventos', { eventos: [] });
    } catch (err) {
        console.error('ERROR al cargar eventos:', err);
        res.status(500).send('Error al cargar eventos');
    }
});

/**
 * GET /eventos/api/eventos
 * Obtiene eventos paginados con filtros aplicados en BD
 */
router.get('/api/eventos', async (req, res) => {
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
            filterEstado: req.query.filterEstado || '' // Nuevo filtro por estado
        };

        // Obtener eventos paginados y total
        const result = await EventosModel.getEventosPaginated(limit, offset, filters);

        res.json({
            success: true,
            eventos: result.eventos,
            totalCount: result.totalCount,
            currentPage: page,
            totalPages: Math.ceil(result.totalCount / limit),
            limit: limit
        });
    } catch (err) {
        console.error('ERROR al cargar eventos paginados:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al cargar eventos' 
        });
    }
});

/**
 * GET /eventos/api/departamentos
 * Devuelve todos los departamentos en formato JSON
 */
router.get('/api/departamentos', async (req, res) => {
    try {
        const departamentos = await EventosModel.getAllDepartamentos();
        res.json(departamentos);
    } catch (err) {
        console.error('ERROR al cargar departamentos:', err);
        res.status(500).json({ error: true, message: 'Error al cargar departamentos' });
    }
});

/**
 * GET /eventos/api/cadenas
 * Devuelve todas las cadenas en formato JSON
 */
router.get('/api/cadenas', async (req, res) => {
    try {
        const cadenas = await EventosModel.getAllCadenas();
        res.json(cadenas);
    } catch (err) {
        console.error('ERROR al cargar cadenas:', err);
        res.status(500).json({ error: true, message: 'Error al cargar cadenas' });
    }
});

/**
 * POST /eventos/api/:id
 * Actualiza el departamento y/o especie (mostrando cadena) de un evento
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { event_depto_id, espcad_id } = req.body;

    try {
        // Obtener el evento actual para mantener valores existentes
        const eventoActual = await EventosModel.getEventoById(id);
        
        if (!eventoActual) {
            return res.status(404).json({ 
                success: false, 
                message: 'Evento no encontrado' 
            });
        }

        // Usar valores actuales si no se envían nuevos
        let deptoIdFinal = event_depto_id || eventoActual.event_depto_id;
        let deptoDescFinal = eventoActual.event_depto_desc;
        let espcadIdFinal = espcad_id || eventoActual.espcad_id;
        let escaEspDescFinal = eventoActual.esca_esp_desc;

        // Si se envió un nuevo departamento, obtener su descripción
        if (event_depto_id && !isNaN(event_depto_id)) {
            const departamento = await EventosModel.getDepartamentoById(event_depto_id);
            if (departamento) {
                deptoDescFinal = departamento.dep_desc;
            }
        }

        // Si se envió un nuevo espcad_id, obtener la descripción de la CADENA
        if (espcad_id && !isNaN(espcad_id)) {
            const cadena = await EventosModel.getCadenaById(espcad_id);
            if (cadena) {
                escaEspDescFinal = cadena.espcad_cad_desc;
            }
        }

        // Actualizar el evento con los valores finales
        const updated = await EventosModel.updateEventoDeptoEspecie(
            id,
            deptoIdFinal,
            deptoDescFinal,
            espcadIdFinal,
            escaEspDescFinal
        );

        if (updated) {
            res.json({ success: true, message: 'Evento actualizado correctamente' });
        } else {
            res.status(500).json({ success: false, message: 'Error al actualizar evento' });
        }

    } catch (err) {
        console.error('ERROR al actualizar evento:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar evento' });
    }
});

module.exports = router;