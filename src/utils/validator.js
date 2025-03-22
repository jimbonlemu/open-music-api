const InvariantError = require('../exceptions/InvariantError');

const validatePayload = (schema) => (payload) => {
    const { error } = schema.validate(payload);
    if (error) throw new InvariantError(error.message);
};

module.exports = validatePayload;
