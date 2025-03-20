class BaseHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
    }
}

module.exports = BaseHandler;