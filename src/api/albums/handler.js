const autoBind = require("auto-bind");
const BaseHandler = require("../bases/handler");

class AlbumsHandler extends BaseHandler {
    constructor(service, validator) {
        super(service, validator);
        autoBind(this);
    }

    async postAlbum({ payload }, h) {
        this._validator.validateAlbumPayload(payload);
        const albumId = await this._service.addAlbum(payload);

        return h
            .response({
                status: 'success',
                message: 'Album berhasil ditambahkan',
                data: { albumId },
            })
            .code(201);
    }

    async getAlbumById({ params }, h) {
        const { id } = params;
        const album = await this._service.getAlbumById(id);

        return {
            status: 'success',
            data: { album },
        };
    }

    async putAlbumById({ params, payload }, h) {
        const { id } = params;
        this._validator.validateAlbumPayload(payload);
        await this._service.editAlbumById(id, payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }
    
    async deleteAlbumById({ params }, h) {
        const { id } = params;
        await this._service.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }
}

module.exports = AlbumsHandler;