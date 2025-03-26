const validatePayload = require('../../utils/validator');
const { ExportNotesPayloadSchema } = require('./schema');

const validateExportNotesPayload = validatePayload(ExportNotesPayloadSchema);

module.exports = { validateExportNotesPayload };