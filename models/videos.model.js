const pool = require('../config/database');

/**
 * Modelo de Videos
 * Contiene todas las queries relacionadas con videos, departamentos y cadenas
 */

const VideosModel = {
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
     * Obtener todas las cadenas/especies ordenadas alfabéticamente
     */
    async getAllCadenas() {
        const query = `
            SELECT DISTINCT espcad_cad_id, espcad_cad_desc
            FROM intb_especie_cadena
            WHERE espcad_cad_desc IS NOT NULL
            ORDER BY espcad_cad_desc ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener una cadena por ID
     */
    async getCadenaById(cadId) {
        const query = `
            SELECT espcad_cad_desc
            FROM intb_especie_cadena
            WHERE espcad_cad_id = $1
            LIMIT 1
        `;
        const result = await pool.query(query, [cadId]);
        return result.rows[0];
    },

    /**
     * Actualizar fuente origen y categoría de un video
     */
    async updateVideoCategoria(videoId, fuenteOrigen, categoria) {
        const query = `
            UPDATE intb_integracion_videos
            SET 
                invid_fuente_origen = $1,
                invid_categoria = $2
            WHERE invid_id = $3
        `;
        const result = await pool.query(query, [fuenteOrigen, categoria, videoId]);
        return result.rowCount > 0;
    },

    /**
     * Crear un nuevo video (ejemplo para futuras expansiones)
     */
    async createVideo(videoData) {
        const query = `
            INSERT INTO intb_integracion_videos 
            (invid_video_id, invid_titulo, invid_published_at, invid_url, invid_fuente_origen, invid_categoria)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            videoData.videoId,
            videoData.titulo,
            videoData.publishedAt,
            videoData.url,
            videoData.fuenteOrigen,
            videoData.categoria
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    /**
     * Eliminar un video por ID (ejemplo para futuras expansiones)
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