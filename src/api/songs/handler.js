const autoBind = require("auto-bind");
const BaseHandler = require("../bases/handler");

class SongsHandler extends BaseHandler {
    constructor(service, validator) {
        super(service, validator);
        autoBind(this);
    }

    async postSong({ payload }, h) {
        this._validator.validateSongPayload(payload);
        const songId = await this._service.addSong(payload);

        return h
            .response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan',
                data: { songId },
            })
            .code(201);
    }

    async getSongs({ query }) {
        const { title, performer } = query;
        const songs = await this._service.getSongs({ title, performer });

        return {
            status: 'success',
            data: {
                songs,
            }
        };
    }


    async getSongById({ params }, h) {
        const { id } = params;
        const song = await this._service.getSongById(id);

        return {
            status: 'success',
            data: { song },
        };
    }

    async putSongById({ params, payload }, h) {
        const { id } = params;
        this._validator.validateSongPayload(payload);
        await this._service.editSongById(id, payload);

        return {
            status: 'success',
            message: 'Lagu berhasil diperbarui',
        };
    }

    async deleteSongById({ params }, h) {
        const { id } = params;
        await this._service.deleteSongById(id);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus',
        };
    }
}

module.exports = SongsHandler;