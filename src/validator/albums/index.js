const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema } = require('./schema');

const validateAlbumPayload = (payload) => {
    const { error } = AlbumPayloadSchema.validate(payload);
    if (error) {
        throw new InvariantError(error.message);
    }
};

module.exports = { validateAlbumPayload };
