const pool = require('../config/database');

/**
 * Modelo de Eventos
 * Contiene todas las queries relacionadas con eventos, departamentos y cadenas
 */

const EventosModel = {
    /**
     * Obtener eventos paginados con filtros aplicados en BD
     */
    async getEventosPaginated(limit, offset, filters) {
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        // Filtro por búsqueda de texto en nombre
        if (filters.searchText) {
            whereConditions.push(`LOWER(event_nombre) LIKE $${paramIndex}`);
            queryParams.push(`%${filters.searchText.toLowerCase()}%`);
            paramIndex++;
        }

        // Filtro por ID
        if (filters.filterID) {
            whereConditions.push(`CAST(event_id AS TEXT) LIKE $${paramIndex}`);
            queryParams.push(`%${filters.filterID}%`);
            paramIndex++;
        }

        // Filtro por fecha desde
        if (filters.filterFechaDesde) {
            whereConditions.push(`event_fec_inicio >= $${paramIndex}`);
            queryParams.push(filters.filterFechaDesde);
            paramIndex++;
        }

        // Filtro por fecha hasta
        if (filters.filterFechaHasta) {
            whereConditions.push(`event_fec_inicio <= $${paramIndex}`);
            queryParams.push(filters.filterFechaHasta);
            paramIndex++;
        }

        // Filtro por estado (nuevo)
        if (filters.filterEstado !== '') {
            whereConditions.push(`event_estado = $${paramIndex}`);
            queryParams.push(parseInt(filters.filterEstado));
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Query para contar total de registros con filtros
        const countQuery = `
            SELECT COUNT(*) as total
            FROM intb_integracion_eventos
            ${whereClause}
        `;

        // Query para obtener registros paginados
        const dataQuery = `
            SELECT *
            FROM intb_integracion_eventos
            ${whereClause}
            ORDER BY event_id DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        // Ejecutar ambas queries
        const countResult = await pool.query(countQuery, queryParams);
        const dataResult = await pool.query(dataQuery, [...queryParams, limit, offset]);

        return {
            eventos: dataResult.rows,
            totalCount: parseInt(countResult.rows[0].total)
        };
    },

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
     * Obtener todas las cadenas (pero se guardarán en columna de especie)
     * Retorna espcad_id y espcad_cad_desc
     */
    async getAllCadenas() {
        const query = `
            SELECT DISTINCT espcad_id, espcad_cad_desc
            FROM intb_especie_cadena
            WHERE espcad_cad_desc IS NOT NULL
            ORDER BY espcad_cad_desc ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener una cadena por espcad_id
     * Retorna la descripción de la cadena que se guardará en esca_esp_desc
     */
    async getCadenaById(espcadId) {
        const query = `
            SELECT espcad_cad_desc
            FROM intb_especie_cadena
            WHERE espcad_id = $1
            LIMIT 1
        `;
        const result = await pool.query(query, [espcadId]);
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
     * Actualizar departamento y/o especie de un evento
     */
    async updateEventoDeptoEspecie(eventId, deptoId, deptoDesc, espcadId, escaEspDesc) {
        const query = `
            UPDATE intb_integracion_eventos
            SET 
                event_depto_id = $1,
                event_depto_desc = $2,
                espcad_id = $3,
                esca_esp_desc = $4,
                event_fec_actualizacion = NOW()
            WHERE event_id = $5
        `;
        const result = await pool.query(query, [deptoId, deptoDesc, espcadId, escaEspDesc, eventId]);
        return result.rowCount > 0;
    },

    /**
     * Crear un nuevo evento
     */
    async createEvento(eventoData) {
        const query = `
            INSERT INTO intb_integracion_eventos 
            (event_nombre, event_depto_id, event_depto_desc, event_munic_id, event_munic_desc, 
             event_fec_inicio, espcad_id, esca_esp_desc)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            eventoData.nombre,
            eventoData.deptoId,
            eventoData.deptoDesc,
            eventoData.munId,
            eventoData.munDesc,
            eventoData.fechaInicio,
            eventoData.espcadId,
            eventoData.escaEspDesc
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    /**
     * Eliminar un evento por ID
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