const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
require('dotenv').config();


// MySQLパッケージの読み込み
const mysql = require("mysql2");

// データベース接続設定
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DATABASE
});

// データベース接続
db.connect(function (err) {
    if (err) throw err;
    console.log('Connected to database!');
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/todos', async (req, res) => {
    try {
        const results = await db.promise().query('SELECT * FROM todo');
        res.json(results[0]); //results[1]: Table Definition

    } catch (err) {
        console.log(err);
        res.json({ "status": 500, "message": "Error getting data" })
    }
});

/* データ追加 */
app.post('/todo', async (req, res) => {
    try {
        // リクエストボディからパラメータ取得
        const title = req.body.title;

        // INSERTクエリを実行
        const query = `
            INSERT INTO todo (title) 
            VALUES (?)
          `;
        await db.promise().execute(query, [title]);

        res.json({ "status": 200, "message": "Success inserting data" })

    } catch (err) {
        console.log(err);
        res.json({ "status": 500, "message": "Error inserting data" })
    }

});

/* データ更新 */
app.put('/todo/:taskId', async (req, res) => {
    try {
        // PathとBodyから情報取得
        const taskId = req.params.taskId;
        const status = req.body.status;

        // UPDATEクエリを実行
        const query = `
            UPDATE todo SET status = ? WHERE id = ?
          `;
        await db.promise().execute(query, [status, taskId]);

        res.json({ "status": 200, "message": "Success inserting data" })

    } catch (err) {
        console.log(err);
        res.json({ "status": 500, "message": "Error inserting data" })
    }

});

/* データ削除 */
app.delete('/todo/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
        // DELETEクエリを実行
        const query = `DELETE FROM todo WHERE id = ?`;
        await db.promise().query(query, [taskId]);

        res.json({ "status": 200, "message": "Success inserting data" })

    } catch (err) {
        console.log(err);
        res.json({ "status": 500, "message": "Error inserting data" })
    }

});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});