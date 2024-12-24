const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Pool = require('pg').Pool;
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;

const createTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            user_name VARCHAR(100) NOT NULL,
            user_firstname VARCHAR(100) NOT NULL,
            user_username VARCHAR(100) UNIQUE NOT NULL,
            user_password VARCHAR(255) NOT NULL
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log('Table "users" is ready.');
    } catch (error) {
        console.error('Error creating table:', error);
    }
};


(async () => {
    await createTable();
})();

const getUsers = (req, res) => {
    pool.query('SELECT user_id, user_name, user_firstname, user_username, user_password FROM users ORDER BY user_id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
};

const getUserById = (req, res) => {
    const user_id = parseInt(req.params.id);

    pool.query('SELECT user_id, user_name, user_firstname, user_username FROM users WHERE user_id = $1', [user_id], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
};

const createUser = async (req, res) => {
    const { name, firstname, username, password } = req.body;

    if (!name || !firstname || !username || !password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const usernameExists = await pool.query('SELECT user_username FROM users WHERE user_username = $1', [username]);

        if (usernameExists.rows.length > 0) {
            return res.status(400).send('Username already exists.');
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (user_name, user_firstname, user_username, user_password) VALUES ($1, $2, $3, $4) RETURNING user_id',
            [name, firstname, username, hashedPassword]
        );

        res.status(201).send(`User added with ID: ${result.rows[0].user_id}`);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal server error.');
    }
};

const updateUser = async (req, res) => {
    const user_id = parseInt(req.params.id);
    const { name, firstname, username, password } = req.body;

    let updateQuery = 'UPDATE users SET ';
    const values = [];
    let index = 1;

    if (name) {
        updateQuery += `user_name = $${index}, `;
        values.push(name);
        index++;
    }
    if (firstname) {
        updateQuery += `user_firstname = $${index}, `;
        values.push(firstname);
        index++;
    }
    if (username) {
        updateQuery += `user_username = $${index}, `;
        values.push(username);
        index++;
    }
    if (password) {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        updateQuery += `user_password = $${index}, `;
        values.push(hashedPassword);
        index++;
    }

    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ' WHERE user_id = $' + index;
    values.push(user_id);

    try {
        await pool.query(updateQuery, values);
        res.status(200).send(`User modified with ID: ${user_id}`);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const deleteUser = (req, res) => {
    const user_id = parseInt(req.params.id);

    pool.query('DELETE FROM users WHERE user_id = $1', [user_id], (error) => {
        if (error) {
            throw error;
        }
        res.status(200).send(`User deleted with ID: ${user_id}`);
    });
};

const logUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT user_id, user_password FROM users WHERE user_username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username' });
        }

        const user = result.rows[0];
        const userId = user.user_id;
        const hashedPassword = user.user_password;

        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (passwordMatch) {
            const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ success: true, message: 'Login successful', token });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred' });
        console.error('Login error:', error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    logUser,
};
