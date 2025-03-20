const { nanoid } = require('nanoid');
const pool = require('../../utils/pool');
const { getCurrentTimestamp } = require('../../utils/dateUtils');
const { InvariantError, NotFoundError } = require('../../exceptions/index');
const { mapSongsResulToModel } = require('../../utils');

class SongsService {
    constructor() {
        this._pool = pool;
    }

    async addSong({ title, year, performer, genre, duration, albumId }) {
        const id = `song-${nanoid(16)}`;
        const createdAt = getCurrentTimestamp();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
        }

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getSongs({ title, performer }) {
        let query = 'SELECT id,title,performer FROM songs';
        const values = [];
        const conditions = [];

        if (title) {
            conditions.push('LOWER(title) LIKE LOWER($1)');
            values.push(`%${title}%`);
        }

        if (performer) {
            conditions.push(`LOWER(performer) LIKE LOWER($${values.length + 1})`);
            values.push(`%${performer}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        const result = await this._pool.query(query, values);
        return result.rows.map(mapSongsResulToModel);
    }


    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        }

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return mapSongsResulToModel(result.rows[0]);
    }

    async editSongById(id, { title, year, performer, genre, duration, albumId }) {
        const updatedAt = getCurrentTimestamp();
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 ,updated_at = $7 WHERE id = $8 RETURNING id',
            values: [title, year, performer, genre, duration, albumId, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui Lagu. Id lagu tidak ditemukan')
        }

    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }

}

module.exports = SongsService;