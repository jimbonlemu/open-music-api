const validatePayload = require('../../utils/validator');
const { UserPayloadSchema } = require('./schema');

const validateUserPayload = validatePayload(UserPayloadSchema);

module.exports = { validateUserPayload };
