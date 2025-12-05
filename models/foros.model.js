const pool = require('../config/database');

/**
 * Modelo de Foros
 * Contiene todas las queries relacionadas con foros, departamentos y cadenas
 */

const ForosModel = {
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
     * Obtener una cadena por ID
     */
    async getCadenaById(cadId) {
        const query = `
            SELECT espcad_cad_desc, espcad_esp_desc
            FROM intb_especie_cadena
            WHERE espcad_id = $1
            LIMIT 1
        `;
        const result = await pool.query(query, [cadId]);
        return result.rows[0];
    },

    /**
     * Actualizar departamento y/o cadena de un foro
     */
    async updateForoUbicacionCadena(foroId, depId, depDesc, escaId, escaEspDesc) {
        const query = `
            UPDATE intb_integracion_foros
            SET 
                info_dep_id = $1,
                info_dep_desc = $2,
                esca_id = $3,
                esca_esp_desc = $4,
                info_update_at = NOW()
            WHERE info_foro_id = $5
        `;
        const result = await pool.query(query, [depId, depDesc, escaId, escaEspDesc, foroId]);
        return result.rowCount > 0;
    },

    /**
     * Crear un nuevo foro
     */
    async createForo(foroData) {
        const query = `
            INSERT INTO intb_integracion_foros 
            (info_foro_id, info_titulo, info_desc, info_autor, info_fec_publicacion, 
             info_num_respuestas, info_fuente, info_url, info_dep_id, info_dep_desc, 
             esca_id, esca_esp_desc)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            foroData.foroId,
            foroData.titulo,
            foroData.descripcion,
            foroData.autor,
            foroData.fechaPublicacion,
            foroData.numRespuestas || 0,
            foroData.fuente || 'Linkata',
            foroData.url,
            foroData.depId,
            foroData.depDesc,
            foroData.escaId,
            foroData.escaEspDesc
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    /**
     * Eliminar un foro por ID
     */
    async deleteForo(foroId) {
        const query = `
            DELETE FROM intb_integracion_foros
            WHERE info_foro_id = $1
        `;
        const result = await pool.query(query, [foroId]);
        return result.rowCount > 0;
    }
};

module.exports = ForosModel;