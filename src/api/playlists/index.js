const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, { service, songsService, producerService, validator, playlistSongValidator, exportValidator }) => {
        const playlistsHandler = new PlaylistsHandler(service, songsService, producerService, validator, playlistSongValidator, exportValidator);
        server.route(routes(playlistsHandler));
    }
}