const pool = require('../config/database');

/**
 * Modelo de Foros
 * Contiene todas las queries relacionadas con foros, departamentos y cadenas
 */

const ForosModel = {
    /**
     * Obtener foros paginados con filtros aplicados en BD
     */
    async getForosPaginated(limit, offset, filters) {
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        // Filtro por búsqueda de texto en título
        if (filters.searchText) {
            whereConditions.push(`LOWER(info_titulo) LIKE $${paramIndex}`);
            queryParams.push(`%${filters.searchText.toLowerCase()}%`);
            paramIndex++;
        }

        // Filtro por ID
        if (filters.filterID) {
            whereConditions.push(`CAST(info_foro_id AS TEXT) LIKE $${paramIndex}`);
            queryParams.push(`%${filters.filterID}%`);
            paramIndex++;
        }

        // Filtro por fecha desde
        if (filters.filterFechaDesde) {
            whereConditions.push(`info_fec_publicacion >= $${paramIndex}`);
            queryParams.push(filters.filterFechaDesde);
            paramIndex++;
        }

        // Filtro por fecha hasta
        if (filters.filterFechaHasta) {
            whereConditions.push(`info_fec_publicacion <= $${paramIndex}`);
            queryParams.push(filters.filterFechaHasta);
            paramIndex++;
        }

        // Filtro por departamento
        if (filters.filterDepartamento) {
            whereConditions.push(`info_dep_desc = $${paramIndex}`);
            queryParams.push(filters.filterDepartamento);
            paramIndex++;
        }

        // Filtro por cadena
        if (filters.filterCadena) {
            whereConditions.push(`espcad_esp_desc = $${paramIndex}`);
            queryParams.push(filters.filterCadena);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Query para contar total de registros con filtros
        const countQuery = `
            SELECT COUNT(*) as total
            FROM intb_integracion_foros
            ${whereClause}
        `;

        // Query para obtener registros paginados
        const dataQuery = `
            SELECT *
            FROM intb_integracion_foros
            ${whereClause}
            ORDER BY info_foro_id DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        // Ejecutar ambas queries
        const countResult = await pool.query(countQuery, queryParams);
        const dataResult = await pool.query(dataQuery, [...queryParams, limit, offset]);

        return {
            foros: dataResult.rows,
            totalCount: parseInt(countResult.rows[0].total)
        };
    },

    /**
     * Obtener opciones únicas para los filtros
     */
    async getFilterOptions() {
        const deptoQuery = `
            SELECT DISTINCT info_dep_desc
            FROM intb_integracion_foros
            WHERE info_dep_desc IS NOT NULL
            ORDER BY info_dep_desc ASC
        `;

        const cadenaQuery = `
            SELECT DISTINCT espcad_esp_desc
            FROM intb_integracion_foros
            WHERE espcad_esp_desc IS NOT NULL
            ORDER BY espcad_esp_desc ASC
        `;

        const [deptoResult, cadenaResult] = await Promise.all([
            pool.query(deptoQuery),
            pool.query(cadenaQuery)
        ]);

        return {
            departamentos: deptoResult.rows.map(r => r.info_dep_desc),
            cadenas: cadenaResult.rows.map(r => r.espcad_esp_desc)
        };
    },

    /**
     * Obtener todos los foros ordenados por ID descendente
     */
    async getAllForos() {
        const query = `
            SELECT *
            FROM intb_integracion_foros
            ORDER BY info_foro_id DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener un foro por ID
     */
    async getForoById(foroId) {
        const query = `
            SELECT *
            FROM intb_integracion_foros
            WHERE info_foro_id = $1
        `;
        const result = await pool.query(query, [foroId]);
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
     * Obtener todas las cadenas/especies ordenadas alfabéticamente
     */
    async getAllCadenas() {
        const query = `
            SELECT DISTINCT espcad_id, espcad_cad_desc, espcad_esp_desc
            FROM intb_especie_cadena
            WHERE espcad_cad_desc IS NOT NULL
            ORDER BY espcad_cad_desc ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener una cadena por ID (espcad_id)
     */
    async getCadenaById(espcadId) {
        const query = `
            SELECT espcad_cad_desc, espcad_esp_desc
            FROM intb_especie_cadena
            WHERE espcad_id = $1
            LIMIT 1
        `;
        const result = await pool.query(query, [espcadId]);
        return result.rows[0];
    },

    /**
     * Actualizar departamento y/o cadena de un foro
     */
    async updateForoUbicacionCadena(foroId, depId, depDesc, espcadId, espcadEspDesc) {
        const query = `
            UPDATE intb_integracion_foros
            SET 
                info_dep_id = $1,
                info_dep_desc = $2,
                espcad_id = $3,
                espcad_esp_desc = $4,
                info_update_at = NOW()
            WHERE info_foro_id = $5
        `;
        const result = await pool.query(query, [depId, depDesc, espcadId, espcadEspDesc, foroId]);
        return result.rowCount > 0;
    }
};

module.exports = ForosModel;