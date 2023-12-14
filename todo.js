/* 画面表示時のデータ取得 */
async function init() {
    const initData = await getTodo();
    //<table>の構成取得
    let taskTable = document.querySelector(".u-table");

    for (const data of initData) {
        //タスク行の<tr>作成
        let newTr = document.createElement("tr");
        newTr.classList.add(`txt-default-${data.id}`);

        //タスク名の<td>作成
        let taskNameTd = document.createElement("td");
        taskNameTd.textContent = data.title;
        taskNameTd.classList.add(`task-name-${data.id}`);
        // ステータスによってデザイン変更
        if (data.status === 'priority') {
            taskNameTd.classList.add(`priority`);
        } else if (data.status === 'done') {
            taskNameTd.classList.add(`done`);
        }
        newTr.appendChild(taskNameTd);

        // アクションの<td>作成
        let actionTd = document.createElement("td");
        const newbuttonDone = createActionButtonsTd(`btn-done-${data.id}`, "完了", data.status);
        const newbuttonCurrent = createActionButtonsTd(`btn-priority-${data.id}`, "優先", data.status)
        const newbuttonRemove = createActionButtonsTd(`btn-remove-${data.id}`, "削除", data.status)
        actionTd.appendChild(newbuttonDone);
        actionTd.appendChild(newbuttonCurrent);
        actionTd.appendChild(newbuttonRemove);
        newTr.appendChild(actionTd);

        taskTable.appendChild(newTr);
    }
}

init();

/* 
 * タスク一覧取得
 */
async function getTodo() {
    return fetch('http://localhost:3000/todos')
        .then(res => res.json())
}
/*
 * タスク追加
    @param makeTaskName：入力したタスク名
 */
async function createTodo(makeTaskName) {
    // リクエストBodyとなるデータ
    const bodyData = {
        title: makeTaskName,
    };

    const options = {
        method: "POST",
        body: JSON.stringify(bodyData),
        headers: {
            "Content-Type": "application/json"
        }
    };

    try {
        // fetchでPOSTリクエスト
        const response = await fetch("http://localhost:3000/todo", options);
        const data = await response.json();
        return data
    } catch (error) {
        alert("何らかの不具合でデータ追加に失敗しました")
        console.error(error);
        throw error;
    }
}

/*
 * タスク更新
    @param taskId：対象のタスク
    @param status: 更新後のstatus
 */
async function updateStatus(taskId, status) {
    const bodyData = {
        status: status
    };

    const options = {
        method: "PUT",
        body: JSON.stringify(bodyData),
        headers: {
            "Content-Type": "application/json"
        }
    };

    try {
        // fetchでPUTリクエスト
        const response = await fetch(`http://localhost:3000/todo/${taskId}`, options);
        if (response.status === 200) {
            // データ最新化（リロード）
            location.reload();
        } else {
            alert("何らかの不具合でデータ更新に失敗しました")
        }
    } catch (error) {
        alert("何らかの不具合でデータ更新に失敗しました")
        console.error(error);
        throw error;
    }
}

/*
* タスク追加
*/
const buttonMakeTask = document.querySelector(".btn-newtodo");
buttonMakeTask.addEventListener("click", async function () {
    // タスク名空欄の登録不可
    const makeTaskName = document.querySelector("#newtodo").value;
    if (!makeTaskName) {
        alert("タスク名は何か入れろや！")
        return
    }

    // タスク数確認
    const nodeList = document.querySelector(".u-table");
    const nextTaskNumber = nodeList.rows.length;
    // タスク数上限を超えての登録不可
    const taskCountLimit = 7
    if (taskCountLimit < nextTaskNumber) {
        alert(`タスク抱えすぎだから、これ以上は追加できないよ(上限${taskCountLimit}個)`)
        return
    }

    const response = await createTodo(makeTaskName)
    if (response.status === 200) {
        document.querySelector("#newtodo").value = ''
        alert("データ追加に成功しました")
        location.reload();
    } else {
        alert("何らかの不具合でデータ追加に失敗しました")
    }
})

/*
タスク状態更新
*/
async function todoEnvChangeClass(e) {
    const clickButtonClass = e.classList.value;
    let tr = e.closest("tr");
    // タスクID取得
    const firstTd = tr.querySelector("td:first-child");
    const taskNameClass = firstTd.className.split(" ")[0];
    const taskId = taskNameClass.split("-")[taskNameClass.split("-").length - 1]
    // 完了
    if (isDone(clickButtonClass)) {
        await updateStatus(taskId, 'done')
    }
    // 優先
    else if (isPriority(clickButtonClass)) {
        await updateStatus(taskId, 'priority')
    }
    // 削除（論理削除）
    else if (isRemove(clickButtonClass)) {
        await updateStatus(taskId, 'delete')
        // await deleteTask(taskId)
    }
}

/*
    アクションボタン作成

    @param buttonSelectorName：buttonに付与するclass
    @param displayText：ボタンに表示するテキスト
    @param status：対象タスクのステータス
*/
function createActionButtonsTd(buttonSelectorName, displayText, status) {
    // ボタン作成
    let actionButton = document.createElement("button");
    actionButton.classList.add(buttonSelectorName);
    actionButton.textContent = displayText;
    // ボタン活性制御
    if (isDone(buttonSelectorName) && status === 'done') {
        actionButton.disabled = true
    } else if (isPriority(buttonSelectorName) && status === 'priority') {
        actionButton.disabled = true
    }
    actionButton.addEventListener("click", function () { todoEnvChangeClass(actionButton) });
    return actionButton;
}

/*
 * タスクのステータス判定一覧
 */
function isDone(className) {
    const doneRegex = /btn-done/
    return doneRegex.test(className)
}

function isPriority(className) {
    const currentRegex = /btn-priority/
    return currentRegex.test(className)
}

function isRemove(className) {
    const removeRegex = /btn-remove/
    return removeRegex.test(className)
}