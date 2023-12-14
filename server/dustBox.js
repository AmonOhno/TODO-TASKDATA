import dbSetup from './database.js';
import { Router } from 'express';

const router = Router();

// データベース接続設定
const db = dbSetup();

/* データ一覧（削除済） */
router.get('/delete-todos', async (req, res) => {
    try {
        const query = `
        SELECT * FROM todo WHERE delete_flg = ?
      `;
        const response = await db.promise().query(query, ['1']);
        const todos = response[0] //response[1]: Table Definition
        res.json(todos);
    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error getting data"))
    }
});

/* データ復元 */
router.put('/todo/recover/:taskId', async (req, res) => {
    try {
        // PathとBodyの情報
        const taskId = req.params.taskId;

        // UPDATEクエリ
        const query = `
            UPDATE todo SET delete_flg = 0 WHERE id = ?`;
        await db.promise().execute(query, [taskId]);
        res.json(createResponse(200, "Error getting data"))

    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error updating data"))
    }

});

/* データ削除（物理削除） */
router.delete('/todo/delete/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
        // DELETEクエリ
        const query = `DELETE FROM todo WHERE id = ?`;
        await db.promise().query(query, [taskId]);

        res.json(createResponse(200, "Success deleting data"))

    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error deleting data"))
    }

});

function createResponse(status, message) {
    return { "status": status, "mesasge": message }
}

export default router;