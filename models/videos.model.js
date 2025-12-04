const pool = require('../config/database');

/**
 * Modelo de Videos
 * Contiene todas las queries relacionadas con videos, departamentos, categorías y fuentes
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
     * Obtener todas las categorías únicas (sistema productivo o cadena)
     */
    async getAllCategorias() {
        const query = `
            SELECT DISTINCT invid_categoria as categoria
            FROM intb_integracion_videos
            WHERE invid_categoria IS NOT NULL
            ORDER BY invid_categoria ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener todas las fuentes de origen únicas
     */
    async getAllFuentes() {
        const query = `
            SELECT DISTINCT invid_fuente_origen as fuente
            FROM intb_integracion_videos
            WHERE invid_fuente_origen IS NOT NULL
            ORDER BY invid_fuente_origen ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtener todos los departamentos
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
     * Actualizar categorización de un video
     */
    async updateVideoCategorizacion(videoId, fuenteOrigen, categoria, deptoDesc) {
        const query = `
            UPDATE intb_integracion_videos
            SET 
                invid_fuente_origen = $1,
                invid_categoria = $2,
                invid_depto_desc = $3
            WHERE invid_id = $4
        `;
        const result = await pool.query(query, [fuenteOrigen, categoria, deptoDesc, videoId]);
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