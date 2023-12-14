import dbSetup from './database.js';
import { Router } from 'express';

const router = Router();

// データベース接続設定
const db = dbSetup();
/* データ一覧 */
router.get('/todos', async (req, res) => {
    try {
        const query = `
        SELECT * FROM todo WHERE delete_flg = ?
      `;
        const results = await db.promise().query(query, ['0']);
        res.json(results[0]); //results[1]: Table Definition

    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error getting data"))
    }
});

/* データ一覧（削除済） */
router.get('/delete-todos', async (req, res) => {
    try {
        const query = `
        SELECT * FROM todo WHERE delete_flg = ?
      `;
        const results = await db.promise().query(query, ['1']);
        res.json(results[0]); //results[1]: Table Definition

    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error getting data"))
    }
});

/* データ追加 */
router.post('/todo', async (req, res) => {
    try {
        // Bodyからパラメータ取得
        const title = req.body.title;

        // INSERTクエリ
        const query = `
            INSERT INTO todo (title) 
            VALUES (?)
          `;
        await db.promise().execute(query, [title]);

        res.json(createResponse(200, "Success inserting data"))

    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error inserting data"))
    }

});

/* データ更新 */
router.put('/todo/:taskId', async (req, res) => {
    try {
        // PathとBodyの情報
        const taskId = req.params.taskId;
        const status = req.body.status;

        // UPDATEクエリ
        let query;
        if (status == 'delete') {
            query = `
            UPDATE todo SET delete_flg = 1 WHERE id = ?
            `;
            await db.promise().execute(query, [taskId]);
        } else {
            query = `
                UPDATE todo SET status = ? WHERE id = ?
              `;
            await db.promise().execute(query, [status, taskId]);
        }

        res.json(createResponse(200, "Error getting data"))

    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error updating data"))
    }

});

function createResponse(status, message) {
    return { "status": status, "mesasge": message }
}

export default router;