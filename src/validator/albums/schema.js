const Joi = require('joi');
const { currentYear } = require('../../utils/dateUtils')

const AlbumPayloadSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(currentYear()).required(),
});

module.exports = { AlbumPayloadSchema };