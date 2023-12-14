import dotenv from 'dotenv';
dotenv.config();
import mysql from "mysql2";

// データベース接続設定
export default function dbSetup() {
    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DATABASE
    });

    // データベース接続
    db.connect(function (err) {
        if (err) throw err;
        // console.log('Connected to database!');
    });

    return db
}
