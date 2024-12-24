const { Pool } = require('pg');
require('dotenv').config();

// Configuration du pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});


const dbConnect = async () => {
    try {
        await pool.connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    pool,
    dbConnect,
};
