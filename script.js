// 今日の日付表示
function displayDate() {
  const today = new Date();
  const formatted =
    today.getFullYear() + "年" +
    (today.getMonth() + 1) + "月" +
    today.getDate() + "日";

  document.getElementById("todayDate").textContent = formatted;
}

// 今日の曜日取得
function getTodayInfo() {
  const today = new Date();
  const days = ["日","月","火","水","木","金","土"];

  return {
    date: today.toISOString().split("T")[0],
    day: days[today.getDay()]
  };
}

// 保存
function saveData(data) {
  localStorage.setItem("attendanceData", JSON.stringify(data));
}

// 取得
function loadData() {
  const data = localStorage.getItem("attendanceData");
  return data ? JSON.parse(data) : [];
}

// 描画
function renderList() {
  const list = document.getElementById("attendanceList");
  list.innerHTML = "";

  const data = loadData();

  data.forEach(item => {
    const li = document.createElement("li");

    if (item.status === "欠席") {
      li.textContent =
        item.date + "（" + item.day + "） " +
        item.name + "：欠席（" + item.reason + "）";
    } else {
      li.textContent =
        item.date + "（" + item.day + "） " +
        item.name + "：出席";
    }

    list.appendChild(li);
  });

  analyzeData(data);
}

// 出席
function markAttendance(status) {
  const name = document.getElementById("nameInput").value.trim();
  if (name === "") {
    alert("名前を入力してください");
    return;
  }

  const todayInfo = getTodayInfo();
  const data = loadData();

  data.push({
    name: name,
    status: "出席",
    reason: "",
    date: todayInfo.date,
    day: todayInfo.day
  });

  saveData(data);
  renderList();
  document.getElementById("nameInput").value = "";
}

// 欠席フォーム表示
function showReasonForm() {
  const name = document.getElementById("nameInput").value.trim();
  if (name === "") {
    alert("名前を入力してください");
    return;
  }

  document.getElementById("reasonForm").style.display = "block";
}

// 欠席送信
function submitAbsent() {
  const name = document.getElementById("nameInput").value.trim();
  const reason = document.getElementById("reasonSelect").value;

  if (reason === "") {
    alert("理由を選択してください");
    return;
  }

  const todayInfo = getTodayInfo();
  const data = loadData();

  data.push({
    name: name,
    status: "欠席",
    reason: reason,
    date: todayInfo.date,
    day: todayInfo.day
  });

  saveData(data);
  renderList();

  document.getElementById("reasonForm").style.display = "none";
  document.getElementById("reasonSelect").value = "";
  document.getElementById("nameInput").value = "";
}

// 🔥 分析機能
function analyzeData(data) {

  const dayStats = {};
  const reasonStats = {};

  data.forEach(item => {

    if (!dayStats[item.day]) {
      dayStats[item.day] = { total: 0, attend: 0 };
    }

    dayStats[item.day].total++;

    if (item.status === "出席") {
      dayStats[item.day].attend++;
    }

    if (item.status === "欠席") {
      if (!reasonStats[item.reason]) {
        reasonStats[item.reason] = 0;
      }
      reasonStats[item.reason]++;
    }
  });

  drawCharts(dayStats, reasonStats);
}

  

// 初期化
displayDate();
renderList();
let dayChart;
let reasonChart;

function drawCharts(dayStats, reasonStats) {

  const days = Object.keys(dayStats);
  const dayRates = days.map(day =>
    ((dayStats[day].attend / dayStats[day].total) * 100).toFixed(1)
  );

  if (dayChart) dayChart.destroy();

  dayChart = new Chart(document.getElementById("dayChart"), {
    type: "bar",
    data: {
      labels: days,
      datasets: [{
        label: "出席率 (%)",
        data: dayRates,
      }]
    }
  });

  const reasons = Object.keys(reasonStats);
  const reasonCounts = Object.values(reasonStats);

  if (reasonChart) reasonChart.destroy();

  reasonChart = new Chart(document.getElementById("reasonChart"), {
    type: "pie",
    data: {
      labels: reasons,
      datasets: [{
        data: reasonCounts,
      }]
    }
  });
}
function downloadCSV() {
  const data = loadData();

  if (data.length === 0) {
    alert("データがありません");
    return;
  }

  let csv = "名前,日付,曜日,出欠,理由\n";

  data.forEach(item => {
    csv +=
      item.name + "," +
      item.date + "," +
      item.day + "," +
      item.status + "," +
      (item.reason || "") +
      "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance_data.csv";
  a.click();

  URL.revokeObjectURL(url);
}