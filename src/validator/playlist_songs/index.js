const validatePayload = require('../../utils/validator');
const { PlaylistSongPayloadSchema } = require('./schema');

const validatePlaylistSongPayload = validatePayload(PlaylistSongPayloadSchema);

module.exports = { validatePlaylistSongPayload };
