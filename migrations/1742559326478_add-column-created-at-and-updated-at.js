/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    const currentTimestamp = new Date().toISOString();

    pgm.addColumn('users', {
        created_at: {
            type: 'TEXT',
            notNull: true,
            default: currentTimestamp,
        },
        updated_at: {
            type: 'TEXT',
            notNull: true,
            default: currentTimestamp,
        },
    });
    pgm.addColumn('authentications', {
        created_at: {
            type: 'TEXT',
            notNull: true,
            default: currentTimestamp,
        },
        updated_at: {
            type: 'TEXT',
            notNull: true,
            default: currentTimestamp,
        },
    });
    pgm.addColumn('playlists', {
        created_at: {
            type: 'TEXT',
            notNull: true,
            default: currentTimestamp,
        },
        updated_at: {
            type: 'TEXT',
            notNull: true,
            default: currentTimestamp,
        },
    });
    pgm.addColumn('playlist_songs', {
        created_at: {
            type: 'TEXT',
            notNull: true,
            default: currentTimestamp,
        },
        updated_at: {
            type: 'TEXT',
            notNull: true,
            default: currentTimestamp,
        },
    });

    // Menghapus default setelah kolom berhasil ditambahkan
    pgm.alterColumn('users', 'created_at', { default: null });
    pgm.alterColumn('users', 'updated_at', { default: null });
    pgm.alterColumn('authentications', 'created_at', { default: null });
    pgm.alterColumn('authentications', 'updated_at', { default: null });
    pgm.alterColumn('playlists', 'created_at', { default: null });
    pgm.alterColumn('playlists', 'updated_at', { default: null });
    pgm.alterColumn('playlist_songs', 'created_at', { default: null });
    pgm.alterColumn('playlist_songs', 'updated_at', { default: null });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropColumn('users', ['created_at', 'updated_at']);
    pgm.dropColumn('authentications', ['created_at', 'updated_at']);
    pgm.dropColumn('playlists', ['created_at', 'updated_at']);
    pgm.dropColumn('playlist_songs', ['created_at', 'updated_at']);
};