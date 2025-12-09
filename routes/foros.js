const express = require('express');
const router = express.Router();
const ForosModel = require('../models/foros.model');
const basicAuth = require('../middleware/auth');

// Aplicar autenticación a todas las rutas de foros
router.use(basicAuth);

/**
 * GET /foros
 * Renderiza la página principal de gestión de foros (sin datos, se cargan por API)
 */
router.get('/', async (req, res) => {
    try {
        res.render('foros', { foros: [] });
    } catch (err) {
        console.error('ERROR al cargar foros:', err);
        res.status(500).send('Error al cargar foros');
    }
});

/**
 * GET /foros/api/foros
 * Obtiene foros paginados con filtros aplicados en BD
 */
router.get('/api/foros', async (req, res) => {
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

        // Obtener foros paginados y total
        const result = await ForosModel.getForosPaginated(limit, offset, filters);

        res.json({
            success: true,
            foros: result.foros,
            totalCount: result.totalCount,
            currentPage: page,
            totalPages: Math.ceil(result.totalCount / limit),
            limit: limit
        });
    } catch (err) {
        console.error('ERROR al cargar foros paginados:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al cargar foros' 
        });
    }
});

/**
 * GET /foros/api/departamentos
 * Devuelve todos los departamentos en formato JSON
 */
router.get('/api/departamentos', async (req, res) => {
    try {
        const departamentos = await ForosModel.getAllDepartamentos();
        res.json(departamentos);
    } catch (err) {
        console.error('ERROR al cargar departamentos:', err);
        res.status(500).json({ error: true, message: 'Error al cargar departamentos' });
    }
});

/**
 * GET /foros/api/cadenas
 * Devuelve todas las cadenas en formato JSON
 */
router.get('/api/cadenas', async (req, res) => {
    try {
        const cadenas = await ForosModel.getAllCadenas();
        res.json(cadenas);
    } catch (err) {
        console.error('ERROR al cargar cadenas:', err);
        res.status(500).json({ error: true, message: 'Error al cargar cadenas' });
    }
});

/**
 * GET /foros/api/filter-options
 * Obtiene las opciones únicas de departamentos y cadenas para los filtros
 */
router.get('/api/filter-options', async (req, res) => {
    try {
        const options = await ForosModel.getFilterOptions();
        res.json(options);
    } catch (err) {
        console.error('ERROR al cargar opciones de filtros:', err);
        res.status(500).json({ error: true, message: 'Error al cargar opciones' });
    }
});

/**
 * POST /foros/api/:id
 * Actualiza el departamento y/o cadena de un foro
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { info_dep_id, espcad_id } = req.body;

    try {
        // Obtener el foro actual para mantener valores existentes
        const foroActual = await ForosModel.getForoById(id);
        
        if (!foroActual) {
            return res.status(404).json({ 
                success: false, 
                message: 'Foro no encontrado' 
            });
        }

        // Usar valores actuales si no se envían nuevos
        let depIdFinal = info_dep_id || foroActual.info_dep_id;
        let depDescFinal = foroActual.info_dep_desc;
        let espcadIdFinal = espcad_id || foroActual.espcad_id;
        let espcadEspDescFinal = foroActual.espcad_esp_desc;

        // Si se envió un nuevo departamento, obtener su descripción
        if (info_dep_id && !isNaN(info_dep_id)) {
            const departamento = await ForosModel.getDepartamentoById(info_dep_id);
            if (departamento) {
                depDescFinal = departamento.dep_desc;
            }
        }

        // Si se envió un nuevo espcad_id, obtener la descripción de la especie
        if (espcad_id && !isNaN(espcad_id)) {
            const cadena = await ForosModel.getCadenaById(espcad_id);
            if (cadena) {
                espcadEspDescFinal = cadena.espcad_esp_desc;
            }
        }

        // Actualizar el foro con los valores finales
        const updated = await ForosModel.updateForoUbicacionCadena(
            id,
            depIdFinal,
            depDescFinal,
            espcadIdFinal,
            espcadEspDescFinal
        );

        if (updated) {
            res.json({ success: true, message: 'Foro actualizado correctamente' });
        } else {
            res.status(500).json({ success: false, message: 'Error al actualizar foro' });
        }

    } catch (err) {
        console.error('ERROR al actualizar foro:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar foro' });
    }
});

module.exports = router;