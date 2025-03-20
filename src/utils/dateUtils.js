
const currentYear = () => new Date().getFullYear();
const getCurrentTimestamp = () => new Date().toISOString();

module.exports = { getCurrentTimestamp, currentYear };
