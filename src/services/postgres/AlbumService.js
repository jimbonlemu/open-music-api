const { nanoid } = require('nanoid');
const pool = require('../../utils/pool');
const { getCurrentTimestamp } = require('../../utils/dateUtils');
const { InvariantError, NotFoundError } = require('../../exceptions/index');
const { mapAlbumResultToModel, mapSongsResulToModel } = require('../../utils');

class AlbumsService {
    constructor(cacheService) {
        this._pool = pool;
        this._cacheService = cacheService;
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

    async updateAlbumCover(id, coverUrl) {
        const query = {
            text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui sampul album. Id tidak ditemukan');
        }
    }

    async addAlbumLike(albumId, userId) {
        const queryCheck = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
            values: [albumId, userId],
        };

        const resultCheck = await this._pool.query(queryCheck);

        if (resultCheck.rowCount) {
            throw new InvariantError('Anda sudah menyukai album ini');
        }

        const id = `like-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO user_album_likes (id, album_id, user_id) VALUES ($1, $2, $3)',
            values: [id, albumId, userId],
        };

        await this._pool.query(query);

        await this._cacheService.delete(`album-likes:${albumId}`);
    }

    async deleteAlbumLike(albumId, userId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
            values: [albumId, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Anda belum menyukai album ini');
        }

        await this._cacheService.delete(`album-likes:${albumId}`);
    }

    async getAlbumLikes(albumId) {
        try {

            const cachedLikes = await this._cacheService.get(`album-likes:${albumId}`);
            if (cachedLikes) {
                return {
                    likes: parseInt(cachedLikes, 10),
                    source: 'cache',
                };
            }

            const query = {
                text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };

            const result = await this._pool.query(query);
            const likes = parseInt(result.rows[0].likes, 10);

            await this._cacheService.set(`album-likes:${albumId}`, likes);

            return {
                likes,
                source: 'database',
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = AlbumsService;