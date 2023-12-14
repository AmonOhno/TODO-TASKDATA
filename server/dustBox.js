import dbSetup from './database.js';
import { Router } from 'express';


const router = Router();

// データベース接続設定
const db = dbSetup();

/* データ一覧（削除済） */
router.get('/remove-todos', async (req, res) => {
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

/* データ削除（物理削除） */
router.delete('/todo/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
        // DELETEクエリを実行
        const query = `DELETE FROM todo WHERE id = ?`;
        await db.promise().query(query, [taskId]);

        res.json(createResponse(200, "Success deleting data"))

    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error deleting data"))
    }

});

export default router;