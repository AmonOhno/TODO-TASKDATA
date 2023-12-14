import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

const router = Router();

// データベース接続設定
const prisma = new PrismaClient()

/* データ一覧（削除済） */
router.get('/remove-todos', async (req, res) => {
    try {
        const todos = await prisma.todo.findMany(
            {
                where: {
                    deleteFlg: "1"
                },
            }
        );
        res.json(todos);
    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error getting data"))
    }
});

/* データ復元 */
router.put('/todo/recover/:taskId', async (req, res) => {
    try {
        const taskId = Number(req.params.taskId);
        // UPDATEクエリ
        await prisma.todo.update({
            where: {
                id: taskId
            },
            data: {
                deleteFlg: "0"
            },
        })
        res.json(createResponse(200, "Error getting data"))

    } catch (err) {
        console.log(err);
        res.json(createResponse(500, "Error updating data"))
    }

});

/* データ削除（物理削除） */
router.delete('/todo/delete/:taskId', async (req, res) => {
    try {
        const taskId = Number(req.params.taskId);
        // DELETEクエリ
        await prisma.todo.delete({
            where: {
                id: taskId
            },
        })

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