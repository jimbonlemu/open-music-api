const { nanoid } = require("nanoid");
const pool = require("../../utils/pool");
const { getCurrentTimestamp } = require("../../utils/dateUtils");
const { InvariantError, AuthorizationError, NotFoundError } = require('../../exceptions/index');
const { mapPlaylistResultToModel, mapPlaylistSongs } = require('../../utils/index');

class PlaylistService {
    constructor() {
        this._pool = pool;
    }

    async verifyPlaylistAccess(id, ownerId) {
        try {
            await this.verifyPlaylistOwner(id, ownerId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new AuthorizationError('Anda tidak berhak mengakses Playlist ini');
        }
    }


    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];

        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses Playlist ini');
        }
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const createdAt = getCurrentTimestamp();

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, owner, createdAt, createdAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async addSongIntoPlaylist({ playlistId, songId, userId }) {

        const id = `playlist-songs-${nanoid(16)}`;
        const createdAt = getCurrentTimestamp();

        const query = {
            text: 'INSERT INTO playlist_songs (id, playlist_id, song_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, playlistId, songId, createdAt, createdAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
        }

        await this.addPlaylistActivity({ playlistId, songId, userId, action: 'add' });

        return result.rows[0].id;
    }

    async getSongsInPlaylist(playlistId) {
        const query = {
            text: `
                SELECT 
                    p.id AS playlist_id,
                    p.name AS playlist_name,
                    u.username AS username,
                    s.id AS song_id,
                    s.title AS song_title,
                    s.performer AS song_performer
                FROM 
                    playlists p
                JOIN 
                    users u ON p.owner = u.id
                LEFT JOIN 
                    playlist_songs ps ON p.id = ps.playlist_id
                LEFT JOIN 
                    songs s ON ps.song_id = s.id
                WHERE 
                    p.id = $1;
            `,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (result.rowCount === 0) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        return mapPlaylistSongs(result.rows);
    }

    async getPlaylists(owner) {
        const query = {
            text: `
                SELECT p.id, p.name, u.username 
                FROM playlists p
                JOIN users u ON p.owner = u.id
                WHERE p.owner = $1
            `,
            values: [owner],
        };
        const result = await this._pool.query(query);
        return result.rows.map(mapPlaylistResultToModel);
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async deleteSongInPlaylist(playlistId, songId, userId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu Playlist gagal dihapus. Id tidak ditemukan');
        }

        await this.addPlaylistActivity({ playlistId, songId, userId, action: 'delete' });
    }

    async addPlaylistActivity({ playlistId, songId, userId, action }) {
        const id = `activity-${nanoid(16)}`;
        const time = getCurrentTimestamp();

        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
            values: [id, playlistId, songId, userId, action, time],
        };

        await this._pool.query(query);
    }

    async getPlaylistActivities(playlistId) {
        const query = {
            text: `
                SELECT 
                    u.username,
                    s.title,
                    psa.action,
                    psa.time
                FROM 
                    playlist_song_activities psa
                JOIN 
                    users u ON psa.user_id = u.id
                JOIN 
                    songs s ON psa.song_id = s.id
                WHERE 
                    psa.playlist_id = $1
                ORDER BY 
                    psa.time ASC;
            `,
            values: [playlistId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Aktivitas tidak ditemukan');
        }

        return {
            playlistId,
            activities: result.rows,
        };
    }

}

module.exports = PlaylistService;