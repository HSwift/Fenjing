const taskFlashMessage = document.getElementById("task-flash-message");
const taskMessage = document.getElementById("task-message");

let taskRunning = false;
let lastSuccessfulCrackTaskId = undefined;

function watchTask(taskId, callback) {
  let handleDataFn = (data) => {
    taskFlashMessage.value =
      data["flash_messages"][data["flash_messages"].length - 1];
    taskMessage.value = data["messages"].join("\n");
    taskMessage.scrollTop = taskMessage.scrollHeight - taskMessage.clientHeight;
    if (data.done) {
      console.log(`Done! clear id: ${timerId}`);
      clearInterval(timerId);
      taskRunning = false;
      if (callback) {
        callback(data);
      }
    }
  };
  let intervalFn = () => {
    fetch("/watchTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ taskid: taskId }).toString(),
    })
      .then((response) => response.json())
      .then(handleDataFn);
  };
  let timerId = setInterval(intervalFn, 100);
}

function onSubmitInteractiveTask(event) {
  event.preventDefault();
  if (taskRunning) {
    alert("已经有正在运行的任务了！");
    return;
  }
  let formData = new FormData(event.target);
  if (!lastSuccessfulCrackTaskId) {
    alert("还没有进行分析，请先使用左侧的表单开始分析");
    return;
  }
  formData.set("last_task_id", lastSuccessfulCrackTaskId);
  fetch("/createTask", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(formData).toString(),
  })
    .then((response) => response.json())
    .then((data) => {
      taskRunning = true;
      if (!data.taskid) {
        console.log("未知错误：没有ID");
        console.log(data);
        return;
      }
      watchTask(data.taskid);
    })
    .catch((error) => {
      console.error(error);
    });
}
