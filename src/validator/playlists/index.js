const validatePayload = require('../../utils/validator');
const { PlaylistPayloadSchema } = require('./schema');

const validatePlaylistPayload = validatePayload(PlaylistPayloadSchema);

module.exports = { validatePlaylistPayload };
