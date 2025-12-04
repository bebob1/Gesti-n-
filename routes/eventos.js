const express = require('express');
const router = express.Router();
const EventosModel = require('../models/eventos.model');
const basicAuth = require('../middleware/auth');

// Aplicar autenticación a todas las rutas de eventos
router.use(basicAuth);

/**
 * GET /eventos
 * Renderiza la página principal de gestión de eventos
 */
router.get('/', async (req, res) => {
    try {
        const eventos = await EventosModel.getAllEventos();
        res.render('eventos', { eventos });
    } catch (err) {
        console.error('ERROR al cargar eventos:', err);
        res.status(500).send('Error al cargar eventos');
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
 * GET /eventos/api/ciudades/:depId
 * Devuelve las ciudades de un departamento específico
 */
router.get('/api/ciudades/:depId', async (req, res) => {
    const { depId } = req.params;
    
    try {
        const ciudades = await EventosModel.getCiudadesByDepartamento(depId);
        res.json(ciudades);
    } catch (err) {
        console.error('ERROR al cargar ciudades:', err);
        res.status(500).json({ error: true, message: 'Error al cargar ciudades' });
    }
});

/**
 * POST /eventos/api/:id
 * Actualiza la ubicación de un evento
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { event_depto_id, event_munic_id } = req.body;

    try {
        // Obtener descripción del departamento
        const departamento = await EventosModel.getDepartamentoById(event_depto_id);
        
        // Obtener descripción del municipio
        const ciudad = await EventosModel.getCiudadById(event_munic_id);

        if (!departamento || !ciudad) {
            return res.status(400).json({ 
                success: false, 
                message: 'Departamento o municipio no encontrado' 
            });
        }

        // Actualizar el evento
        const updated = await EventosModel.updateEventoUbicacion(
            id,
            event_depto_id,
            departamento.dep_desc,
            event_munic_id,
            ciudad.ciu_desc
        );

        if (updated) {
            res.json({ success: true, message: 'Evento actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

    } catch (err) {
        console.error('ERROR al actualizar evento:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar evento' });
    }
});

module.exports = router;