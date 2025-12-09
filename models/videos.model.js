const pool = require('../config/database');

/**
 * Modelo de Videos
 * Contiene todas las queries relacionadas con videos, departamentos y cadenas
 */

const VideosModel = {
    /**
     * Obtener videos paginados con filtros aplicados en BD
     */
    async getVideosPaginated(limit, offset, filters) {
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        // Filtro por búsqueda de texto en título
        if (filters.searchText) {
            whereConditions.push(`LOWER(invid_titulo) LIKE $${paramIndex}`);
            queryParams.push(`%${filters.searchText.toLowerCase()}%`);
            paramIndex++;
        }

        // Filtro por ID
        if (filters.filterID) {
            whereConditions.push(`CAST(invid_id AS TEXT) LIKE $${paramIndex}`);
            queryParams.push(`%${filters.filterID}%`);
            paramIndex++;
        }

        // Filtro por fecha desde
        if (filters.filterFechaDesde) {
            whereConditions.push(`invid_published_at >= $${paramIndex}`);
            queryParams.push(filters.filterFechaDesde);
            paramIndex++;
        }

        // Filtro por fecha hasta
        if (filters.filterFechaHasta) {
            whereConditions.push(`invid_published_at <= $${paramIndex}`);
            queryParams.push(filters.filterFechaHasta);
            paramIndex++;
        }

        // Filtro por departamento
        if (filters.filterDepartamento) {
            whereConditions.push(`dep_desc = $${paramIndex}`);
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
            FROM intb_integracion_videos
            ${whereClause}
        `;

        // Query para obtener registros paginados
        const dataQuery = `
            SELECT *
            FROM intb_integracion_videos
            ${whereClause}
            ORDER BY invid_id DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        // Ejecutar ambas queries
        const countResult = await pool.query(countQuery, queryParams);
        const dataResult = await pool.query(dataQuery, [...queryParams, limit, offset]);

        return {
            videos: dataResult.rows,
            totalCount: parseInt(countResult.rows[0].total)
        };
    },

    /**
     * Obtener opciones únicas para los filtros
     */
    async getFilterOptions() {
        const deptoQuery = `
            SELECT DISTINCT dep_desc
            FROM intb_integracion_videos
            WHERE dep_desc IS NOT NULL
            ORDER BY dep_desc ASC
        `;

        const cadenaQuery = `
            SELECT DISTINCT espcad_esp_desc
            FROM intb_integracion_videos
            WHERE espcad_esp_desc IS NOT NULL
            ORDER BY espcad_esp_desc ASC
        `;

        const [deptoResult, cadenaResult] = await Promise.all([
            pool.query(deptoQuery),
            pool.query(cadenaQuery)
        ]);

        return {
            departamentos: deptoResult.rows.map(r => r.dep_desc),
            cadenas: cadenaResult.rows.map(r => r.espcad_esp_desc)
        };
    },

    /**
     * Obtener todos los videos ordenados por ID descendente
     */
    async getAllVideos() {
        const query = `
            SELECT *
            FROM intb_integracion_videos
            ORDER BY invid_id DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener un video por ID
     */
    async getVideoById(videoId) {
        const query = `
            SELECT *
            FROM intb_integracion_videos
            WHERE invid_id = $1
        `;
        const result = await pool.query(query, [videoId]);
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
     * Obtener todas las cadenas ordenadas alfabéticamente
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
     * Actualizar departamento y cadena de un video
     */
    async updateVideoDepartamentoCadena(videoId, depId, depDesc, espcadId, espcadEspDesc) {
        const query = `
            UPDATE intb_integracion_videos
            SET 
                dep_id = $1,
                dep_desc = $2,
                espcad_id = $3,
                espcad_esp_desc = $4
            WHERE invid_id = $5
        `;
        const result = await pool.query(query, [depId, depDesc, espcadId, espcadEspDesc, videoId]);
        return result.rowCount > 0;
    },

    /**
     * Crear un nuevo video
     */
    async createVideo(videoData) {
        const query = `
            INSERT INTO intb_integracion_videos 
            (invid_video_id, invid_titulo, invid_published_at, invid_url, 
             dep_id, dep_desc, espcad_id, espcad_esp_desc)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            videoData.videoId,
            videoData.titulo,
            videoData.publishedAt,
            videoData.url,
            videoData.depId,
            videoData.depDesc,
            videoData.espcadId,
            videoData.espcadEspDesc
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    /**
     * Eliminar un video por ID
     */
    async deleteVideo(videoId) {
        const query = `
            DELETE FROM intb_integracion_videos
            WHERE invid_id = $1
        `;
        const result = await pool.query(query, [videoId]);
        return result.rowCount > 0;
    }
};

module.exports = VideosModel;