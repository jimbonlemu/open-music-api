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

const mapSongInputToDb = ({
    title, year, performer, genre, duration, albumId, createdAt, updatedAt,
}) => ({
    title, year, performer, genre, duration,
    album_id: albumId,
    created_at: createdAt,
    updated_at: updatedAt,
});

module.exports = { mapAlbumResultToModel, mapSongsResulToModel, mapSongInputToDb };


