require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const TokenManager = require('./tokenize/TokenManager');
const path = require('path');


// Apis
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');

// Services
const AlbumsService = require('./services/postgres/AlbumService');
const SongsService = require('./services/postgres/SongService');
const UsersService = require('./services/postgres/UserService');
const AuthenticationService = require('./services/postgres/AuthenticationService');
const PlaylistService = require('./services/postgres/PlaylistService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');
const CacheService = require('./services/redis/CacheService');


// Validators
const albumValidator = require('./validator/albums');
const songValidator = require('./validator/songs');
const userValidator = require('./validator/users');
const authenticationsValidator = require('./validator/authentications');
const playlistValidator = require('./validator/playlists');
const playlistSongsValidator = require('./validator/playlist_songs');
const exportsValidator = require('./validator/exports');
const validateImageHeaders = require('./validator/uploads');

// Exception
const ClientError = require('./exceptions/ClientError');

const init = async () => {
    const cacheService = new CacheService();
    const albumsService = new AlbumsService(cacheService);
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authsService = new AuthenticationService();
    const playlistService = new PlaylistService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/albums/file/images'));

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register(
        [{
            plugin: albums,
            options: {
                service: albumsService,
                validator: albumValidator,
                storageService: storageService,
                uploadValidator: validateImageHeaders,
            }
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: songValidator,
            }
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: userValidator,
            }
        },
        {
            plugin: authentications,
            options: {
                service: authsService,
                validator: authenticationsValidator,
                tokenManager: TokenManager,
            }
        },
        {
            plugin: playlists,
            options: {
                service: playlistService,
                songsService: songsService,
                producerService: ProducerService,
                validator: playlistValidator,
                playlistSongValidator: playlistSongsValidator,
                exportValidator: exportsValidator,
            }
        },
        ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }

            if (!response.isServer) {
                return h.continue;
            }

            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server kami',
            });
            newResponse.code(500);
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
}

init();