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