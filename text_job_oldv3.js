
/* 
 * データ取得
 */
async function getTodo() {
    return fetch('http://localhost:3000/todo')
        .then(res => res.json())
}
/*
 * データ追加
    @param makeTaskName：入力したタスク名
 */
async function createTodo(makeTaskName) {
    // リクエストBodyとなるデータ
    const bodyData = {
        title: makeTaskName,
        description: makeTaskName,
        price: 2000,
        authorId: 1
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

/* 画面表示時のデータ取得 */
async function init() {
    const initData = await getTodo();
    const nodeList = document.querySelector(".u_table");
    const nextTaskNumber = nodeList.rows.length;

    //<table>の構成取得
    let taskTable = nodeList;

    for (const data of initData) {
        //タスク行の<tr>作成
        let newTr = document.createElement("tr");
        newTr.classList.add(`txt-default-${nextTaskNumber}`);

        //タスク名の<td>作成
        let taskNameTd = document.createElement("td");
        taskNameTd.classList.add(`taskName-${nextTaskNumber}`);
        taskNameTd.textContent = data.title;
        newTr.appendChild(taskNameTd);

        // アクションの<td>作成
        let actionTd = document.createElement("td");

        const newbuttonDone = createActionButtonsTd(`btn-done-${nextTaskNumber}`, "完了");
        const newbuttonCurrent = createActionButtonsTd(`btn-current-${nextTaskNumber}`, "優先")
        const newbuttonRemove = createActionButtonsTd(`btn-remove-${nextTaskNumber}`, "削除")
        actionTd.appendChild(newbuttonDone);
        actionTd.appendChild(newbuttonCurrent);
        actionTd.appendChild(newbuttonRemove);
        newTr.appendChild(actionTd);
        taskTable.appendChild(newTr);
    }
}

// 画面表示時のデータ取得
init();

//[作成]ボタン実行
const buttonMakeTask = document.querySelector(".btn-newtodo");
const taskCountLimit = 7
buttonMakeTask.addEventListener("click", async function () {

    // タスク名空欄の登録不可
    const makeTaskName = document.querySelector("#newtodo").value;
    if (!makeTaskName) {
        alert("タスク名は何か入れろや！")
        return
    }

    // 何個目のタスクか確認
    const nodeList = document.querySelector(".u_table");
    const nextTaskNumber = nodeList.rows.length;
    // タスク数の上限を超えての登録不可
    if (taskCountLimit < nextTaskNumber) {
        alert(`タスク抱えすぎだから、これ以上は追加できないよ(上限${taskCountLimit}個)`)
        return
    }

    // 追加処理
    const result = await createTodo(makeTaskName)
    // 結果で判定処理
    if (result.status === 200) {
        document.querySelector("#newtodo").value = ''
        alert("データ追加に成功しました")
        // データ最新化（リロード）
        location.reload();
    } else {
        alert("何らかの不具合でデータ追加に失敗しました")
    }
})

/*
タスク状態更新
*/
function todoEnvChangeClass(e) {
    // 正規表現リテラルを使用
    const doneRegex = /btn-done/
    const currentRegex = /btn-current/
    const removeRegex = /btn-remove/

    const clickButtonClass = e.classList.value;
    let tr = e.closest("tr");
    // タスク名取得
    const firstTd = tr.querySelector("td:first-child");
    const taskNameClass = firstTd.className.split(" ")[0];

    // 完了
    if (doneRegex.test(clickButtonClass)) {
        firstTd.className = `${taskNameClass} txt-done`;
        e.disabled = true;
    }
    // 優先
    else if (currentRegex.test(clickButtonClass)) {
        firstTd.className = `${taskNameClass} txt-current`;
        e.disabled = true;
    }
    // 削除
    else if (removeRegex.test(clickButtonClass)) {
        e.closest("tr").remove();
    }
}

/*
    アクションボタン作成

    @param buttonSelectorName：buttonに付与するclass
    @param displayText：ボタンに表示するテキスト
*/
function createActionButtonsTd(buttonSelectorName, displayText) {
    let actionButton = document.createElement("button");
    actionButton.classList.add(buttonSelectorName);
    actionButton.textContent = displayText;
    actionButton.addEventListener("click", function () { todoEnvChangeClass(actionButton) });
    return actionButton;
}