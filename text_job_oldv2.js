
//[作成]ボタン実行
const buttonMakeTask = document.querySelector(".btn-newtodo");
const taskCountLimit = 3

buttonMakeTask.addEventListener("click", function () {

    // タスク名空欄の登録不可
    var makeTaskName = document.querySelector("#newtodo").value;
    if (!makeTaskName) {
        alert("タスク名は何か入れろや！")
        return
    }

    // 何個目のタスクか確認
    const nodeList = document.querySelector(".u_table");
    const nextTaskNumber = nodeList.rows.length;

    // タスク数の上限を超えての登録不可
    if (taskCountLimit < nextTaskNumber) {
        alert("タスク抱えすぎだから、これ以上は追加できないよ")
        return
    }

    //<table>の構成取得
    var taskTable = nodeList;

    //タスク行の<tr>作成
    var newTr = document.createElement("tr");
    newTr.classList.add(`txt-default-${nextTaskNumber}`);

    //タスク名の<td>作成
    var taskNameTd = document.createElement("td");
    taskNameTd.classList.add(`taskName-${nextTaskNumber}`);
    taskNameTd.textContent = makeTaskName;
    newTr.appendChild(taskNameTd);

    // アクションの<td>作成
    var actionTd = document.createElement("td");

    var newbuttonDone = createActionButtonsTd(`btn-done-${nextTaskNumber}`, "完了");
    var newbuttonCurrent = createActionButtonsTd(`btn-current-${nextTaskNumber}`, "優先")
    var newbuttonRemove = createActionButtonsTd(`btn-remove-${nextTaskNumber}`, "削除")
    actionTd.appendChild(newbuttonDone);
    actionTd.appendChild(newbuttonCurrent);
    actionTd.appendChild(newbuttonRemove);
    newTr.appendChild(actionTd);

    //<tr>に追加
    taskTable.appendChild(newTr);
    document.querySelector("#newtodo").value = ''

})

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
    return actionButton
}

// 正規表現リテラルを使用
const doneRegex = /btn-done/
const currentRegex = /btn-current/
const removeRegex = /btn-remove/

/*
    タスク状態更新
*/
function todoEnvChangeClass(e) {
    let clickButtonClass = e.classList.value;
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
