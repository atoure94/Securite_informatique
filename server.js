require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ApiUsers = require('./server/users');
const ApiEncryption = require('./server/encryption');
const { pool, dbConnect } = require('./server/db/dbConnect');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connexion à la base de données
dbConnect();

// Routes pour les utilisateurs
app.get('/users', ApiUsers.getUsers);
app.get('/users/:id', ApiUsers.getUserById);
app.post('/users/add', ApiUsers.createUser);
app.put('/users/:id', ApiUsers.updateUser);
app.delete('/users/:id', ApiUsers.deleteUser);
app.post('/users/login', ApiUsers.logUser);



//Routes pour la sécurité des messages

app.post('/encrypt', ApiEncryption.encrypt);
app.post('/decrypt', ApiEncryption.decrypt);

// Lancement de l'application
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
