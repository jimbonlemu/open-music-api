const autoBind = require("auto-bind");
const BaseHandler = require("../bases/handler");

class UsersHandler extends BaseHandler {
    constructor(service, validator) {
        super(service, validator);
        autoBind(this);
    }

    async postUser(request, h) {
        this._validator.validateUserPayload(request.payload);

        const { username, password, fullname } = request.payload;

        const userId = await this._service.addUser({ username, password, fullname });

        return h.response({
            status: 'success',
            message: 'User berhasil ditambahkan',
            data: {
                userId,
            },
        }).code(201);
    }
}

module.exports = UsersHandler;