const { InvariantError, AuthenticationError } = require('../../exceptions/index');
const { getCurrentTimestamp } = require('../../utils/dateUtils');
const pool = require('../../utils/pool');
const bcrypt = require('bcrypt');


class AuthenticationService {
    constructor() {
        this._pool = pool;
    }

    async addRefreshToken(token) {
        const createdAt = getCurrentTimestamp();
        const query = {
            text: 'INSERT INTO authentications VALUES($1, $2, $3)',
            values: [token, createdAt, createdAt],
        };
        await this._pool.query(query);
    }

    async verifyRefreshToken(token) {
        const query = {
            text: 'SELECT token FROM authentications WHERE token = $1',
            values: [token],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Refresh token tidak valid');
        }
    }

    async deleteRefreshToken(token) {
        const query = {
            text: 'DELETE FROM  authentications WHERE token = $1',
            values: [token],
        };

        await this._pool.query(query);
    }

    async verifyUserCredential(username, password) {
        const query = {
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        const { id, password: hashedPassword } = result.rows[0];

        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }
        return id;
    }
}

module.exports = AuthenticationService;