import NodeCache from 'node-cache';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client'

const router = Router();
// データベース接続設定
const prisma = new PrismaClient()
const nodeCache = new NodeCache();

/* データ一覧 */
router.get('/todos', async (req, res) => {
    // キャッシュキー
    const key = 'todos';
    // キャッシュ取得
    const todos = nodeCache.get(key);
    if (todos) {
        console.log("Use Cache")
        res.json(todos);
    } else {
        console.log("Use DB")
        try {
            const todos = await prisma.todo.findMany(
                {
                    where: {
                        deleteFlg: "0"
                    },
                }
            );
            // const ttl = 24 * 60 * 60;
            const ttl = 1;
            nodeCache.set(key, todos, ttl);
            res.json(todos);
        } catch (err) {
            console.log(err);
            res.json(createResponse(500, "Error getting data"))
        }
    }
});

/* データ追加 */
router.post('/todo', async (req, res) => {
    try {
        // Bodyからパラメータ取得
        const title = req.body.title;
        // INSERTクエリ
        await prisma.todo.create({
            data: {
                title: title,
            },
        })

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
        const taskId = Number(req.params.taskId);
        const status = req.body.status;
        let upperCaseStatus = status.toUpperCase();

        // UPDATE
        if (upperCaseStatus == 'REMOVE') {
            await prisma.todo.update({
                where: {
                    id: taskId
                },
                data: {
                    deleteFlg: "1"
                },
            })
        } else {
            await prisma.todo.update({
                where: {
                    id: taskId
                },
                data: {
                    status: upperCaseStatus
                },
            })
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