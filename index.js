const express = require('express');
const app = express();
const mysql = require('mysql');
const db = mysql.createConnection({ host: "localhost", user: "root", password: "", database: "fc" });
app.use(express.json())

db.connect(function (err) {
    if (err) throw err;
    console.log("Connected to the database MySQL!");
});


//USER----------------------------------------------------------------------------------------------------
app.post('/user', (req, res) => {
    const sql = "INSERT INTO user (idUser, name, firstName, username, email, phone, password, dateOfBirth, folders) VALUES (NULL,?,?,?,?,?,?,?,?);"
    const sqlParams = [req.body.name, req.body.firstName, req.body.username, req.body.email, req.body.phone, req.body.password, req.body.dateOfBirth, req.body.folders]

    db.query(sql, sqlParams, function (err, result) {
        if (err) {
            console.log(err)
            if (err.code = 'ER_DUP_ENTRY') {
                if (err.sqlMessage.includes('email')) {
                    res.status(200).json(["email taken"])
                }
                else if (err.sqlMessage.includes("username")) {
                    res.status(200).json(["username taken"])
                }
            }
            else {
                throw err;
            }
        }
        else {
            db.query(" SELECT idUser FROM user WHERE username=?;", req.body.username, (err, result) => {
                if (err) throw err;
                else {
                    res.status(200).json(["user added", result[0].idUser])
                }
            })

        }
    });
})

app.get('/user/:id', (req, res) => {
    const sql = "SELECT * FROM user WHERE user.idUser = ?"
    db.query(sql, req.params.id, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/user/connection/:name/:password', (req, res) => {
    const sql = "SELECT idUser, password, COUNT(*) AS number FROM user WHERE username = ? OR email = ?;";
    const sqlParams = [req.params.name, req.params.name];
    db.query(sql, sqlParams, (err, result) => {
        if (err) throw err;
        if (result[0].number == 1) {
            if (req.params.password == result[0].password) {
                res.status(200).json(["correct password", result[0].idUser]);
            }
            else {
                res.status(200).json(["wrong password"]);
            }
        }
        else {
            res.status(200).json(["no user"]);
        }
    })
})

app.get('/user/:id/name', (req, res) => {
    const sql = "SELECT name FROM user WHERE user.idUser = ?"
    db.query(sql, [req.params.item, req.params.id], function (err, result, fields) {
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/user/:id/firstName', (req, res) => {
    const sql = "SELECT firstName FROM user WHERE user.idUser = ?"
    db.query(sql, req.params.id, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/user/:id/username', (req, res) => {
    const sql = "SELECT username FROM user WHERE user.idUser = ?"
    db.query(sql, req.params.id, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/user/:id/folders', (req, res) => {
    const sql = "SELECT folders FROM user WHERE user.idUser = ?"
    db.query(sql, req.params.id, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
    })
})


//CARDS-------------------------------------------------------------------------------
app.post('/card', (req, res) => {
    const sql = "INSERT INTO card (idCard, recto, verso, idPack) VALUES ?;";
    db.query(sql, [req.body], function (err, result) {
        if (err) throw err;
        res.status(200).send("Cards added");
    })
})

app.get('/card/:idCard', (req, res) => {
    const sql = "SELECT * FROM card WHERE card.idCard = ?;";
    db.query(sql, req.params.idCard, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.get('/cards/:idPack', (req, res) => {
    const sql = "SELECT * FROM card WHERE card.idPack = ?;";
    db.query(sql, req.params.idPack, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.delete('/card/:idCard', (req, res) => {
    const sql = "DELETE FROM card WHERE card.idCard = ? ;";
    db.query(sql, req.params.idCard, (err, result) => {
        if (err) throw err;
        res.status(200).send('Card deleted');
    })
})


//PACK------------------------------------------------------------------------------------
app.post('/pack', (req, res) => {
    const sql = "INSERT INTO pack (idUser, public, title, description, number) VALUES (?, ?, ?, ?, ?);";
    const sqlParams = [req.body.idUser, req.body.public, req.body.title, req.body.description, req.body.number];
    let values = [];

    db.query(sql, sqlParams, (err, result) => {
        if (err) throw err;
    })
    db.query("SELECT idPack FROM pack WHERE idUser = ? AND title = ?", [req.body.idUser, req.body.title], (err, result) => {
        if (err) throw err;
        else {
            const v = [...req.body.values];
            for (let i = 0; i < v.length; i++) {
                if (v[i][0] != "" || v[i][1] != "") {
                    const v2 = [...v[i]]
                    v2.push(result[0].idPack)
                    values.push(v2)
                }
            }
            db.query("INSERT INTO card (recto, verso, idPack) VALUES ?;", [values], function (err, result) {
                if (err) throw err;
                console.log('ok')
                res.status(200).json("Cards added");
            })
        }
    })
})

app.get('/pack/verifyTitle/:idUser/:title', (req, res) => {
    db.query(" SELECT COUNT(*) as nb FROM pack WHERE idUser = ? AND title = ?", [req.params.idUser, req.params.title], (err, result) =>{
        if (err) throw err;
        else res.status(200).json((result[0].nb))
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
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
    })
})

app.post('/relationuserpack', (req, res) => {
    const sql = "INSERT INTO relationuserpack (idPack, idUser, path) VALUES (?, ?, ?);";
    const sqlParams = [req.body.idPack, req.body.idUser, req.body.path];

    db.query(sql, sqlParams, (err, result) => {
        if (err) throw err;
        res.status(200).send('Relation added');
    })
})


app.listen(8080, () => { console.log('Listening on port 8080') })
