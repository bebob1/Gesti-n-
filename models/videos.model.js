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
     * Obtener todas las cadenas ordenadas alfabéticamente
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
     * Actualizar fuente origen y cadena (especie) de un video
     * Nota: Se muestra "cadena" al usuario pero se guarda en columnas de "especie"
     * - espcad_id -> columna espcad_id
     * - espcad_cad_desc (cadena) -> columna esca_esp_desc
     */
    async updateVideoFuenteCadena(videoId, fuenteOrigen, espcadId, escaEspDesc) {
        const query = `
            UPDATE intb_integracion_videos
            SET 
                invid_fuente_origen = $1,
                espcad_id = $2,
                esca_esp_desc = $3
            WHERE invid_id = $4
        `;
        const result = await pool.query(query, [fuenteOrigen, espcadId, escaEspDesc, videoId]);
        return result.rowCount > 0;
    },

    /**
     * Crear un nuevo video
     */
    async createVideo(videoData) {
        const query = `
            INSERT INTO intb_integracion_videos 
            (invid_video_id, invid_titulo, invid_published_at, invid_url, 
             invid_fuente_origen, espcad_id, esca_esp_desc)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            videoData.videoId,
            videoData.titulo,
            videoData.publishedAt,
            videoData.url,
            videoData.fuenteOrigen,
            videoData.espcadId,
            videoData.escaEspDesc
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