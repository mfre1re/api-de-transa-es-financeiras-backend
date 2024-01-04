const { Pool } = require('pg')

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'dindin',
    user: 'postgres',
    password: 'postgres'
})

module.exports = pool
