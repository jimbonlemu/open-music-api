const validatePayload = require('../../utils/validator');
const { AlbumPayloadSchema } = require('./schema');

const validateAlbumPayload = validatePayload(AlbumPayloadSchema);

module.exports = { validateAlbumPayload };
