const express = require('express');
const app = express();
const mysql = require('mysql');
const db = mysql.createConnection({   host: "localhost",   user: "root",   password: "", database : "fc"});
app.use(express.json())

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected to the database MySQL!"); 
});


//USER----------------------------------------------------------------------------------------------------
app.post('/user', (req, res) => {
    const sql = "INSERT INTO user (idUser, name, firstName, username, email, phone, password, dateOfBirth, folders) VALUES (NULL,?,?,?,?,?,?,?,?);"
    const sqlParams = [req.body.name, req.body.firstName, req.body.username, req.body.email, req.body.phone, req.body.password, req.body.dateOfBirth, req.body.folders]

    db.query('SELECT COUNT(*) as nb FROM `user` WHERE username=?;', req.body.username, function(err, result){
            if (err) throw err;
            if (result[0].nb != 0) {
                res.json("username taken")
            }
            else {
                db.query('SELECT COUNT(*) as nb FROM `user` WHERE email=?;', req.body.email, function(err, result){
                    if (err) throw err;
                    if (result[0].nb != 0) {
                        res.json("email taken")
                    }
                    else {
                        db.query(sql, sqlParams, function (err, result) {
                            if (err) throw err;
                            res.json("user added")
                        });
                    }
                });
            }
        });
    res.status(200);
})

app.get('/user/:id', (req, res)=>{
    const sql = "SELECT * FROM user WHERE user.idUser = ?"
    db.query(sql, req.params.id, function(err, result){
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/user/connection/:name/:password', (req, res) => {
    const sql = "SELECT password, COUNT(*) AS number FROM user WHERE username = ? OR email = ?;";
    const sqlParams = [req.params.name, req.params.name];
    db.query(sql, sqlParams, (err, result)=>{
        if (err) throw err;
        if (result[0].number == 1){
            if (req.params.password == result[0].password) {
                res.status(200).json("correct password");
            }
            else {
                res.status(200).json("wrong password");
            }
        }
        else {
            res.status(200).json("no user");
        }
    })
})

app.get('/user/:id/name', (req, res)=>{
    const sql = "SELECT name FROM user WHERE user.idUser = ?"
    db.query(sql, [req.params.item, req.params.id], function(err, result, fields){
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/user/:id/firstName', (req, res)=>{
    const sql = "SELECT firstName FROM user WHERE user.idUser = ?"
    db.query(sql, req.params.id, function(err, result){
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/user/:id/username', (req, res)=>{
    const sql = "SELECT username FROM user WHERE user.idUser = ?"
    db.query(sql, req.params.id, function(err, result){
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/user/:id/folders', (req, res)=>{
    const sql = "SELECT folders FROM user WHERE user.idUser = ?"
    db.query(sql, req.params.id, function(err, result){
        if (err) throw err;
        res.status(200).json(result);
    })
})


//CARDS-------------------------------------------------------------------------------
app.post('/card', (req, res) => {
    const sql = "INSERT INTO card (idCard, recto, verso, idPack) VALUES (NULL, ?, ?, ?);";
    const sqlParams = [req.body.recto, req.body.verso, req.body.idPack]

    db.query(sql, sqlParams, function(err, result){
        if (err) throw err;
        res.status(200).send("Card added");
    })
})

app.get('/card/:idCard', (req, res) =>{
    const sql = "SELECT * FROM card WHERE card.idCard = ?;";
    db.query(sql, req.params.idCard, function(err, result){
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/cards/:idPack', (req, res) => {
    const sql = "SELECT * FROM card WHERE card.idPack = ?;";
    db.query(sql, req.params.idPack, function(err, result){
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.delete('/card/:idCard', (req, res) => {
    const sql = "DELETE FROM card WHERE card.idCard = ? ;";
    db.query(sql, req.params.idCard, (err, result)=> {
        if(err) throw err;
        res.status(200).send('Card deleted');
    })
})


//PACK------------------------------------------------------------------------------------
app.post('/pack', (req, res) =>{
    const sql = "INSERT INTO pack (idPack, idUser, public, title, description, number) VALUES (NULL, ?, ?, ?, ?, ?);";
    const sqlParams = [req.body.idUser, req.body.public, req.body.title, req.body.description, req.body.number];

    db.query(sql, sqlParams, (err, result) =>{
        if (err) {
            if (err.code == 'ER_DUP_ENTRY') res.status(200).send('Title taken for this user');
            else throw err;
        }
        res.status(200).send('Pack added');
    })
})

app.get('/pack', (req, res) => {
    db.query("SELECT * FROM pack;", (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/pack/:id', (req, res) => {
    const sql = "SELECT * FROM pack WHERE idPack = ?;";
    db.query(sql, req.params.id, (err, result) => {
        if (err) throw err;
        res.status(200).json(result[0]);
    })
})  


//RELATION USER PACK
app.get('/relationuserpack/:idUser/:path', (req, res) => {
    const idUser = mysql.escape(req.params.idUser);
    const path = mysql.escape(req.params.path);
    const sql = `SELECT pack.* FROM pack JOIN relationuserpack as r  ON pack.idPack = r.idPack JOIN user ON r.idUser = user.idUser WHERE r.path = ${path} AND r.idUser = ${idUser};`;
    db.query(sql, (err, result)=>{
        if(err) throw err;
        res.status(200).json(result);
    })
})

app.post('/relationuserpack', (req, res) => {
    const sql = "INSERT INTO relationuserpack (idPack, idUser, path) VALUES (?, ?, ?);";
    const sqlParams = [req.body.idPack, req.body.idUser, req.body.path];

    db.query(sql, sqlParams, (err, result) =>{
        if (err) throw err;
        res.status(200).send('Relation added');
    })
})


app.listen(8080, () => {console.log('Listening on port 8080')})
