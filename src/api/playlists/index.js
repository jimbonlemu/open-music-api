const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, { service, songsService, validator, playlistSongValidator }) => {
        const playlistsHandler = new PlaylistsHandler(service, songsService, validator, playlistSongValidator);
        server.route(routes(playlistsHandler));
    }
}