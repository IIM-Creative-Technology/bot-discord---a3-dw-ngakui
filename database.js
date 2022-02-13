const mysql = require('mysql');
require('dotenv').config();

// Ajout des paramètres de connexion à la base de donnée.
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

// Connexion à la base de donnée.
connection.connect((err) => {
    if(err) {
        console.log("Erreur de connexion à la BD: ", err);
    } else {
        console.log('Connection reussie');
    }
});

module.exports = connection;