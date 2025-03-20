const InvariantError = require('../../exceptions/InvariantError');
const { SongPayloadSchema } = require('./schema');

const validateSongPayload = (payload) => {
    const { error } = SongPayloadSchema.validate(payload);
    if (error) {
        throw new InvariantError(error.message);
    }
};

module.exports = { validateSongPayload };
