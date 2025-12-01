// ------------------------------
// Fabric.js キャンバス初期化
// ------------------------------
window.canvas = new fabric.Canvas('c', {
  backgroundColor: '#fff'
});

// ------------------------------
// Undo / Redo 用履歴管理
// ------------------------------
window.canvasHistory = [];
window.redoHistory = [];

// 初期状態を履歴に保存
function initHistory() {
  window.canvasHistory.push(window.canvas.toJSON());
}
initHistory();

// 履歴保存（object:modified 時のみ実行）
function saveHistory() {
  const json = window.canvas.toJSON();
  window.canvasHistory.push(json);

  if (window.canvasHistory.length > 50) {
    window.canvasHistory.shift();
  }

  // 新しい操作があったら Redo は消す
  window.redoHistory = [];
}

// Undo
window.undo = function () {
  if (window.canvasHistory.length < 2) return;

  const current = window.canvasHistory.pop();
  window.redoHistory.push(current);

  const prev = window.canvasHistory[window.canvasHistory.length - 1];

  window.canvas.loadFromJSON(prev, () => {
    window.canvas.renderAll();
    updateLayerList();
  });
};

// Redo
window.redo = function () {
  if (!window.redoHistory.length) return;

  const next = window.redoHistory.pop();
  window.canvasHistory.push(next);

  window.canvas.loadFromJSON(next, () => {
    window.canvas.renderAll();
    updateLayerList();
  });
};

// ---------------------------------------
// Fabric の object:modified で履歴保存！
// ---------------------------------------
window.canvas.on("object:modified", function () {
  saveHistory();
});

// ------------------------------
// オブジェクト追加
// ------------------------------
function addText() {
  const text = new fabric.Textbox("Sample Text", {
    left: 100,
    top: 100,
    fontSize: 40,
    fill: "#333",
    originX: 'center',
    originY: 'center'
  });

  window.canvas.add(text);
  saveHistory();
}

function addImage() {
  document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", function (e) {
  const reader = new FileReader();

  reader.onload = function (f) {
    fabric.Image.fromURL(f.target.result, function (img) {

      img.scaleToWidth(300);
      img.set({ originX: 'center', originY: 'center' });

      window.canvas.add(img);
      saveHistory();
    });
  };

  reader.readAsDataURL(e.target.files[0]);
});

function addRect() {
  window.canvas.add(new fabric.Rect({
    left: 100, top: 100,
    width: 120, height: 80,
    fill: 'skyblue',
    originX: 'center', originY: 'center'
  }));
  saveHistory();
}

function addTriangle() {
  window.canvas.add(new fabric.Triangle({
    left: 200, top: 150,
    width: 120, height: 100,
    fill: 'yellow',
    originX: 'center', originY: 'center'
  }));
  saveHistory();
}

function addCircle() {
  window.canvas.add(new fabric.Circle({
    left: 100, top: 100,
    radius: 50, fill: 'coral',
    originX: 'center', originY: 'center'
  }));
  saveHistory();
}

// ------------------------------
// 色・透明度・回転
// ------------------------------
function changeShapeColor() {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;

  obj.set("fill", document.getElementById("shapeColor").value);
  window.canvas.renderAll();
  saveHistory();
}

function changeTextColor() {
  const obj = window.canvas.getActiveObject();
  if (!obj || obj.type !== "textbox") return;

  obj.set("fill", document.getElementById("textColor").value);
  window.canvas.renderAll();
  saveHistory();
}

function changeOpacity() {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;

  obj.set("opacity", document.getElementById("opacitySlider").value);
  window.canvas.renderAll();
}

function changeRotation() {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;

  obj.set("angle", Number(document.getElementById("rotateSlider").value));
  window.canvas.renderAll();
}

// ------------------------------
// 削除
// ------------------------------
function deleteObj() {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;

  window.canvas.remove(obj);
  updateLayerList();
  saveHistory();
}

// ------------------------------
// レイヤー管理
// ------------------------------
function updateLayerList() {
  const container = document.getElementById("layers");
  container.innerHTML = "";

  const objects = window.canvas.getObjects().slice().reverse();

  objects.forEach((obj) => {
    const div = document.createElement("div");
    div.className = "layer-item";

    let label = "オブジェクト";
    if (obj.type === "rect") label = "四角形";
    if (obj.type === "circle") label = "丸";
    if (obj.type === "textbox") label = "テキスト";
    if (obj.type === "triangle") label = "三角形";

    div.textContent = label;

    div.onclick = () => {
      window.canvas.setActiveObject(obj);
      window.canvas.renderAll();
      updateLayerList();
    };

    container.appendChild(div);
  });
}
