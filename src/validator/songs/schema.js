const Joi = require('joi');
const { currentYear } = require('../../utils/dateUtils')

const SongPayloadSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(currentYear()).required(),
    performer: Joi.string().required(),
    genre: Joi.string().required(),
    duration: Joi.number().integer().optional(),
    albumId: Joi.string().optional(),
});

module.exports = { SongPayloadSchema };