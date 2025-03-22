const {
    PostAuthenticationPayloadSchema,
    PutAuthenticationPayloadSchema,
    DeleteAuthenticationPayloadSchema,
} = require('./schema');
const validatePayload = require('../../utils/validator');

const AuthenticationsValidator = {
    validatePostAuthenticationPayload: validatePayload(PostAuthenticationPayloadSchema),
    validatePutAuthenticationPayload: validatePayload(PutAuthenticationPayloadSchema),
    validateDeleteAuthenticationPayload: validatePayload(DeleteAuthenticationPayloadSchema),
};

module.exports = AuthenticationsValidator;
