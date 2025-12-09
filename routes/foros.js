const express = require('express');
const router = express.Router();
const ForosModel = require('../models/foros.model');
const basicAuth = require('../middleware/auth');

// Aplicar autenticación a todas las rutas de foros
router.use(basicAuth);

/**
 * GET /foros
 * Renderiza la página principal de gestión de foros
 */
router.get('/', async (req, res) => {
    try {
        const foros = await ForosModel.getAllForos();
        res.render('foros', { foros });
    } catch (err) {
        console.error('ERROR al cargar foros:', err);
        res.status(500).send('Error al cargar foros');
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
 * POST /foros/api/:id
 * Actualiza el departamento y/o cadena de un foro
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { info_dep_id, espcad_id } = req.body;

    try {
        console.log('=== INICIO UPDATE FORO ===');
        console.log('Foro ID:', id);
        console.log('Body recibido:', req.body);
        console.log('info_dep_id:', info_dep_id);
        console.log('espcad_id:', espcad_id);

        // Obtener descripciones si se proporcionan IDs
        let depDesc = null;
        let espcadEspDesc = null;

        // Si departamento es un ID válido, obtener descripción
        if (info_dep_id && info_dep_id !== '' && info_dep_id !== 'null') {
            console.log('Buscando departamento con ID:', info_dep_id);
            const departamento = await ForosModel.getDepartamentoById(info_dep_id);
            console.log('Departamento encontrado:', departamento);
            if (departamento) {
                depDesc = departamento.dep_desc;
            }
        }

        // Si cadena es un ID válido (espcad_id), obtener descripción
        if (espcad_id && espcad_id !== '' && espcad_id !== 'null') {
            console.log('Buscando cadena con espcad_id:', espcad_id);
            const cadena = await ForosModel.getCadenaById(espcad_id);
            console.log('Cadena encontrada:', cadena);
            if (cadena) {
                espcadEspDesc = cadena.espcad_esp_desc;
            }
        }

        console.log('Valores finales para update:');
        console.log('- info_dep_id:', info_dep_id);
        console.log('- depDesc:', depDesc);
        console.log('- espcad_id:', espcad_id);
        console.log('- espcadEspDesc:', espcadEspDesc);

        // Actualizar el foro
        const updated = await ForosModel.updateForoUbicacionCadena(
            id,
            info_dep_id || null,
            depDesc,
            espcad_id || null,
            espcadEspDesc
        );

        console.log('Resultado del update:', updated);
        console.log('=== FIN UPDATE FORO ===');

        if (updated) {
            res.json({ success: true, message: 'Foro actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Foro no encontrado' });
        }

    } catch (err) {
        console.error('ERROR COMPLETO al actualizar foro:', err);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar foro: ' + err.message 
        });
    }
});

module.exports = router;