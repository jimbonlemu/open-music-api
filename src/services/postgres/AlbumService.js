const { nanoid } = require('nanoid');
const pool = require('../../utils/pool');
const { getCurrentTimestamp } = require('../../utils/dateUtils');
const { InvariantError, NotFoundError } = require('../../exceptions/index');
const { mapAlbumResultToModel, mapSongsResulToModel } = require('../../utils');

class AlbumsService {
    constructor() {
        this._pool = pool;
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = getCurrentTimestamp();

        const query = {
            text: 'INSERT INTO albums VALUES ($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, createdAt, createdAt],
        }

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const albumQuery = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };

        const albumResult = await this._pool.query(albumQuery);

        if (!albumResult.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }
        const songsQuery = {
            text: 'SELECT id,title,performer FROM songs WHERE album_id = $1',
            values: [id],
        };

        const songsResult = await this._pool.query(songsQuery);

        const album = mapAlbumResultToModel(albumResult.rows[0]);
        const songs = songsResult.rows.map(mapSongsResulToModel);

        return {
            ...album,
            songs,
        };
    }

    async editAlbumById(id, { name, year }) {
        const updatedAt = getCurrentTimestamp();
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui Album. Id album tidak ditemukan')
        }

    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }

}

module.exports = AlbumsService;