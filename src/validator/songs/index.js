const validatePayload = require('../../utils/validator');
const { SongPayloadSchema } = require('./schema');

const validateSongPayload = validatePayload(SongPayloadSchema);

module.exports = { validateSongPayload };
