const pool = require('../config/database');

/**
 * Modelo de Eventos
 * Contiene todas las queries relacionadas con eventos, departamentos y ciudades
 */

const EventosModel = {
    /**
     * Obtener todos los eventos ordenados por ID descendente
     */
    async getAllEventos() {
        const query = `
            SELECT *
            FROM intb_integracion_eventos
            ORDER BY event_id DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener un evento por ID
     */
    async getEventoById(eventId) {
        const query = `
            SELECT *
            FROM intb_integracion_eventos
            WHERE event_id = $1
        `;
        const result = await pool.query(query, [eventId]);
        return result.rows[0];
    },

    /**
     * Obtener todos los departamentos ordenados alfabéticamente
     */
    async getAllDepartamentos() {
        const query = `
            SELECT dep_id, dep_desc
            FROM intb_depto
            ORDER BY dep_desc ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener un departamento por ID
     */
    async getDepartamentoById(depId) {
        const query = `
            SELECT dep_desc
            FROM intb_depto
            WHERE dep_id = $1
        `;
        const result = await pool.query(query, [depId]);
        return result.rows[0];
    },

    /**
     * Obtener ciudades por departamento
     */
    async getCiudadesByDepartamento(depId) {
        const query = `
            SELECT ciu_id, ciu_desc
            FROM intb_ciudad
            WHERE dep_id = $1
            ORDER BY ciu_desc ASC
        `;
        const result = await pool.query(query, [depId]);
        return result.rows;
    },

    /**
     * Obtener una ciudad por ID
     */
    async getCiudadById(ciuId) {
        const query = `
            SELECT ciu_desc
            FROM intb_ciudad
            WHERE ciu_id = $1
        `;
        const result = await pool.query(query, [ciuId]);
        return result.rows[0];
    },

    /**
     * Actualizar ubicación de un evento
     */
    async updateEventoUbicacion(eventId, deptoId, deptoDesc, munId, munDesc) {
        const query = `
            UPDATE intb_integracion_eventos
            SET 
                event_depto_id = $1,
                event_depto_desc = $2,
                event_munic_id = $3,
                event_munic_desc = $4,
                event_fec_actualizacion = NOW()
            WHERE event_id = $5
        `;
        const result = await pool.query(query, [deptoId, deptoDesc, munId, munDesc, eventId]);
        return result.rowCount > 0;
    },

    /**
     * Crear un nuevo evento (ejemplo para futuras expansiones)
     */
    async createEvento(eventoData) {
        const query = `
            INSERT INTO intb_integracion_eventos 
            (event_nombre, event_depto_id, event_depto_desc, event_munic_id, event_munic_desc, event_fec_inicio, event_tipo_evento_desc)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            eventoData.nombre,
            eventoData.deptoId,
            eventoData.deptoDesc,
            eventoData.munId,
            eventoData.munDesc,
            eventoData.fechaInicio,
            eventoData.tipoEvento
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    /**
     * Eliminar un evento por ID (ejemplo para futuras expansiones)
     */
    async deleteEvento(eventId) {
        const query = `
            DELETE FROM intb_integracion_eventos
            WHERE event_id = $1
        `;
        const result = await pool.query(query, [eventId]);
        return result.rowCount > 0;
    }
};

module.exports = EventosModel;