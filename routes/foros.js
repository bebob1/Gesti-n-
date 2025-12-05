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
 * POST /foros/api/create
 * Crea un nuevo foro
 */
router.post('/api/create', async (req, res) => {
    const { 
        info_foro_id, 
        info_titulo, 
        info_desc,
        info_autor,
        info_fec_publicacion, 
        info_url, 
        info_dep_id, 
        esca_id 
    } = req.body;

    try {
        // Validar campos obligatorios
        if (!info_foro_id || !info_titulo || !info_desc || !info_autor || !info_fec_publicacion) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos obligatorios: foro_id, titulo, descripción, autor y fecha son requeridos' 
            });
        }

        // Obtener descripciones si se proporcionan IDs
        let depDesc = null;
        let escaEspDesc = null;

        // Si departamento es un ID, obtener descripción
        if (info_dep_id && !isNaN(info_dep_id)) {
            const departamento = await ForosModel.getDepartamentoById(info_dep_id);
            if (departamento) {
                depDesc = departamento.dep_desc;
            }
        }

        // Si cadena es un ID, obtener descripción
        if (esca_id && !isNaN(esca_id)) {
            const cadena = await ForosModel.getCadenaById(esca_id);
            if (cadena) {
                escaEspDesc = cadena.espcad_esp_desc;
            }
        }

        // Crear el foro
        const foroData = {
            foroId: info_foro_id,
            titulo: info_titulo,
            descripcion: info_desc,
            autor: info_autor,
            fechaPublicacion: info_fec_publicacion,
            url: info_url || null,
            depId: info_dep_id || null,
            depDesc: depDesc,
            escaId: esca_id || null,
            escaEspDesc: escaEspDesc
        };

        const newForo = await ForosModel.createForo(foroData);

        if (newForo) {
            res.json({ 
                success: true, 
                message: 'Foro creado correctamente',
                foro: newForo 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Error al crear el foro' 
            });
        }

    } catch (err) {
        console.error('ERROR al crear foro:', err);
        
        // Verificar si es error de duplicado
        if (err.code === '23505') {
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un foro con ese Foro ID' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear foro: ' + err.message 
        });
    }
});

/**
 * POST /foros/api/:id
 * Actualiza el departamento y/o cadena de un foro
 */
router.post('/api/:id', async (req, res) => {
    const { id } = req.params;
    const { info_dep_id, esca_id } = req.body;

    try {
        // Validar que se reciba al menos uno de los dos datos
        if (!info_dep_id && !esca_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debe proporcionar departamento o cadena' 
            });
        }

        // Obtener descripciones si se proporcionan IDs
        let depDesc = null;
        let escaEspDesc = null;

        // Si departamento es un ID, obtener descripción
        if (info_dep_id && !isNaN(info_dep_id)) {
            const departamento = await ForosModel.getDepartamentoById(info_dep_id);
            if (departamento) {
                depDesc = departamento.dep_desc;
            }
        } else if (info_dep_id) {
            depDesc = info_dep_id;
        }

        // Si cadena es un ID, obtener descripción
        if (esca_id && !isNaN(esca_id)) {
            const cadena = await ForosModel.getCadenaById(esca_id);
            if (cadena) {
                escaEspDesc = cadena.espcad_esp_desc;
            }
        } else if (esca_id) {
            escaEspDesc = esca_id;
        }

        // Actualizar el foro
        const updated = await ForosModel.updateForoUbicacionCadena(
            id,
            info_dep_id,
            depDesc,
            esca_id,
            escaEspDesc
        );

        if (updated) {
            res.json({ success: true, message: 'Foro actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Foro no encontrado' });
        }

    } catch (err) {
        console.error('ERROR al actualizar foro:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar foro' });
    }
});

module.exports = router;