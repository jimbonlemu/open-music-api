const mapAlbumResultToModel = ({
    id, name, year, created_at, updated_at,
}) => ({
    id, name, year, createdAt: created_at, updatedAt: updated_at,
});

const mapSongsResulToModel = ({
    id, title, year, performer, genre, duration, album_id, created_at, updated_at,
}) => ({
    id, title, year, performer, genre, duration, albumId: album_id, createdAt: created_at, updatedAt: updated_at,
});

const mapPlaylistResultToModel = ({
    id, name, owner, created_at, updated_at
}) => ({
    id, name, owner, createdAt: created_at, updatedAt: updated_at,
});

const mapPlaylistSongs = (rows) => {
    if (rows.length === 0) {
        return null;
    }

    const playlist = {
        id: rows[0].playlist_id,
        name: rows[0].playlist_name,
        username: rows[0].username,
        songs: rows.map(row => ({
            id: row.song_id,
            title: row.song_title,
            performer: row.song_performer,
        })),
    };

    return playlist;
};



module.exports = { mapAlbumResultToModel, mapSongsResulToModel, mapPlaylistResultToModel, mapPlaylistSongs };


