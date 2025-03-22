const { nanoid } = require("nanoid");
const pool = require("../../utils/pool");
const bcrypt = require('bcrypt');
const { InvariantError } = require('../../exceptions/index');

class UserService {
    constructor() {
        this._pool = pool;
    }
    
    async addUser({ username, password, fullname }) {
        await this.verifyUsername(username);
        const id = `user-${nanoid(16)}`;

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = {
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('User gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async verifyUsername(username) {
        const query = {
            text: 'SELECT * FROM users WHERE username = $1',
            values: [username],
        }
        const result = await this._pool.query(query);

        if (result.rowCount) {
            throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
        }
    }

}

module.exports = UserService;