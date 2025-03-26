const autoBind = require("auto-bind");
const BaseHandler = require("../bases/handler");
const { InvariantError } = require("../../exceptions");

class AlbumsHandler extends BaseHandler {
    constructor(service, validator, storageService, uploadValidator) {
        super(service, validator);
        this._storageService = storageService;
        this._uploadValidator = uploadValidator;
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

    async postAlbumCover(request, h) {
        const { id } = request.params;
        const { cover } = request.payload;

        this._uploadValidator.validateImageHeaders(cover.hapi.headers);
        const filename = await this._storageService.writeFile(cover, cover.hapi);

        const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/file/images/${filename}`;
        await this._service.updateAlbumCover(id, coverUrl);

        return h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        }).code(201);
    }

    async postAlbumLike(request, h) {
        try {
            const { id: albumId } = request.params;
            const { id: userId } = request.auth.credentials;

            await this._service.getAlbumById(albumId);

            await this._service.addAlbumLike(albumId, userId);

            return h.response({
                status: 'success',
                message: 'Album berhasil disukai',
            }).code(201);

        } catch (error) {
            console.error(error);
            throw error;

        }
    }

    async deleteAlbumLike(request, h) {
        try {
            const { id: albumId } = request.params;
            const { id: userId } = request.auth.credentials;

            await this._service.getAlbumById(albumId);

            await this._service.deleteAlbumLike(albumId, userId);

            return h.response({
                status: 'success',
                message: 'Album berhasil batal disukai',
            }).code(200);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async getAlbumLikes(request, h) {
        try {
            const { id: albumId } = request.params;

            await this._service.getAlbumById(albumId);

            const { likes, source } = await this._service.getAlbumLikes(albumId);

            const response = h.response({
                status: 'success',
                data: {
                    likes,
                },
            }).code(200);
            
            response.header('X-Data-Source', source);

            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = AlbumsHandler;