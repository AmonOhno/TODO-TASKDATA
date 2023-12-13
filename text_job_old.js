
//[作成]ボタンのクリックイベントを取得
const buttonMakeTask = document.querySelector(".btn-newtodo");
buttonMakeTask.addEventListener("click", function () {

    //<ul>の構成取得
    var taskul = document.querySelector(".u_task");

    //新規<li>の構造作成処理
    var makeTaskName = document.querySelector("#newtodo").value;
    var newli = document.createElement("tr");
    newli.classList.add("txt-default");
    newli.textContent = makeTaskName;

    var newbuttonDone = document.createElement("button");
    newbuttonDone.classList.add("btn-done");
    newbuttonDone.textContent = "完了";
    newbuttonDone.addEventListener("click", function () { todoEnvChangeClass(newbuttonDone) });
    var newbuttonCurrent = document.createElement("button");
    newbuttonCurrent.classList.add("btn-current");
    newbuttonCurrent.textContent = "優先";
    newbuttonCurrent.addEventListener("click", function () { todoEnvChangeClass(newbuttonCurrent) });
    var newbuttonRemove = document.createElement("button");
    newbuttonRemove.classList.add("btn-remove");
    newbuttonRemove.textContent = "削除";
    newbuttonRemove.addEventListener("click", function () { todoRemove(newbuttonRemove) });


    newli.appendChild(newbuttonDone);
    newli.appendChild(newbuttonCurrent);
    newli.appendChild(newbuttonRemove);

    console.log(newli);

    //既存<ui>に追加処理
    taskul.appendChild(newli);
    document.querySelector("#newtodo").value = ''

})



//各[done]ボタンのクリックイベントを取得
const buttonDone = document.querySelectorAll(".btn-done");
[...buttonDone].forEach((w_button) => {
    w_button.addEventListener("click", function () { todoEnvChangeClass(w_button) });
})

//各[done]ボタンのクリックイベントを取得
const buttonCurrnt = document.querySelectorAll(".btn-current");
[...buttonCurrnt].forEach((w_button) => {
    w_button.addEventListener("click", function () { todoEnvChangeClass(w_button) });
})


//<li>タグのクラス属性をtodo-doneに更新する e:ボタン
function todoEnvChangeClass(e) {
    var li = e.closest("li");
    if (e.classList.contains("btn-done")) {
        li.classList.remove("txt-default");
        li.classList.remove("txt-current");
        li.classList.add("txt-done");
    }
    else if (e.classList.contains("btn-current")) {
        li.classList.remove("txt-default");
        li.classList.remove("txt-done");
        li.classList.add("txt-current");
    }
}

//<li>タグを削除 e:li
function todoRemove(e) {
    e.closest("li").remove();
}
