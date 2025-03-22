const autoBind = require("auto-bind");
const BaseHandler = require("../bases/handler");

class PlaylistsHandler extends BaseHandler {
    constructor(service, songsService, validator, playlistSongValidator) {
        super(service, validator);
        this._playlistSongValidator = playlistSongValidator;
        this._songsService = songsService;

        autoBind(this);
    }

    async postPlaylist(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;
        const playlistId = await this._service.addPlaylist({
            name, owner: credentialId
        });

        return h
            .response({
                status: 'success',
                message: 'Playlist berhasil ditambahkan',
                data: { playlistId },
            })
            .code(201);
    }

    async getPlaylists(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(credentialId);
        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async postSongIntoPlaylist(request, h) {
            this._playlistSongValidator.validatePlaylistSongPayload(request.payload);
            const { id: playlistId } = request.params;
            const { id: credentialId } = request.auth.credentials;
            const { songId } = request.payload;

            await this._service.verifyPlaylistAccess(playlistId, credentialId);
            await this._songsService.getSongById(songId);

            const songInplaylists = await this._service.addSongIntoPlaylist({ playlistId, songId, userId: credentialId });

            return h.response({
                status: 'success',
                message: 'Berhasil menambahkan lagu ke dalam playlist',
                data: { songInplaylists },
            }).code(201);
    }

    async getPlaylistById(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(id, credentialId);
        const playlist = await this._service.getSongsInPlaylist(id);

        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deletePlaylistById(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(id, credentialId);
        await this._service.deletePlaylistById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };

    }

    async deleteSongInPlaylist(request, h) {
        this._playlistSongValidator.validatePlaylistSongPayload(request.payload);
        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistOwner(playlistId, credentialId);
        await this._service.deleteSongInPlaylist(playlistId, songId, credentialId);

        return {
            status: 'success',
            message: 'Lagu dalam Playlist berhasil dihapus',
        };
    }

    async getPlaylistActivities(request, h) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyPlaylistAccess(id, credentialId);

        const activities = await this._service.getPlaylistActivities(id);

        return {
            status: 'success',
            data: activities,
        };
    }

}

module.exports = PlaylistsHandler;