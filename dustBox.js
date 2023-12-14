/* 画面表示時のデータ取得 */
async function init() {
    const initData = await getDeleteTodo();
    //<table>の構成取得
    let taskTable = document.querySelector(".u-table");

    for (const data of initData) {
        // 行作成
        let newTr = document.createElement("tr");
        newTr.classList.add(`txt-default-${data.id}`);

        // タスク名ラベル
        let taskNameTd = document.createElement("td");
        taskNameTd.textContent = data.title;
        taskNameTd.classList.add(`task-name-${data.id}`);
        newTr.appendChild(taskNameTd);

        // 復元ボタン
        let recoverTd = document.createElement("td");
        const buttonRecover = createActionButtonsTd(`btn-recover-${data.id}`, "復元");
        recoverTd.appendChild(buttonRecover);
        newTr.appendChild(recoverTd);
        // 完全削除ボタン
        let deleteTd = document.createElement("td");
        const buttonDelete = createActionButtonsTd(`btn-delete-${data.id}`, "完全削除")
        deleteTd.appendChild(buttonDelete);
        newTr.appendChild(deleteTd);

        taskTable.appendChild(newTr);
    }
}

init();

/* 
 * タスク一覧取得
 */
async function getDeleteTodo() {
    return fetch('http://localhost:3000/remove-todos')
        .then(res => res.json())
}

/*
 * タスク復元
    @param taskId：対象のタスク
 */
async function recover(taskId) {
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
        const response = await fetch(`http://localhost:3000/todo/recover/${taskId}`, options);
        if (response.status === 200) {
            // データ最新化（リロード）
            location.reload();
        } else {
            alert("何らかの不具合でデータ更新に失敗しました")
        }
    } catch (error) {
        alert("何らかの不具合でデータ追加に失敗しました")
        console.error(error);
        throw error;
    }
}

/*
 * タスク削除
    @param taskId：対象のタスク
 */
async function deleteTodo(taskId) {
    const options = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    };

    try {
        // fetchでPOSTリクエスト
        const response = await fetch(`http://localhost:3000/todo/delete/${taskId}`, options);
        if (response.status === 200) {
            // データ最新化（リロード）
            location.reload();
        } else {
            alert("何らかの不具合でデータ追加に失敗しました")
        }
    } catch (error) {
        alert("何らかの不具合でデータ追加に失敗しました")
        console.error(error);
        throw error;
    }
}

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
    // 復元
    if (isRecover(clickButtonClass)) {
        await recover(taskId)
    }
    // 削除（物理削除）
    else if (isDelete(clickButtonClass)) {
        await deleteTodo(taskId)
    }
}

/*
    アクションボタン作成

    @param buttonSelectorName：buttonに付与するclass
    @param displayText：ボタンに表示するテキスト
    @param status：対象タスクのステータス
*/
function createActionButtonsTd(buttonSelectorName, displayText) {
    // ボタン作成
    let actionButton = document.createElement("button");
    actionButton.classList.add(buttonSelectorName);
    actionButton.textContent = displayText;
    actionButton.addEventListener("click", function () { todoEnvChangeClass(actionButton) });
    return actionButton;
}

/*
 * タスクのステータス判定一覧
 */
function isRecover(className) {
    const recoverRegex = /btn-recover/
    return recoverRegex.test(className)
}

function isDelete(className) {
    const deleteRegex = /btn-delete/
    return deleteRegex.test(className)
}