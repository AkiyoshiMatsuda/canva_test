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
window.addText = function () {
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
};

window.addImage = function () {
  document.getElementById("fileInput").click();
};

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

window.addRect = function () {
  window.canvas.add(new fabric.Rect({
    left: 100, top: 100,
    width: 120, height: 80,
    fill: 'skyblue',
    originX: 'center', originY: 'center'
  }));
  saveHistory();
};

window.addTriangle = function () {
  window.canvas.add(new fabric.Triangle({
    left: 200, top: 150,
    width: 120, height: 100,
    fill: 'yellow',
    originX: 'center', originY: 'center'
  }));
  saveHistory();
};

window.addCircle = function () {
  window.canvas.add(new fabric.Circle({
    left: 100, top: 100,
    radius: 50, fill: 'coral',
    originX: 'center', originY: 'center'
  }));
  saveHistory();
};

// ------------------------------
// 色・透明度・回転
// ------------------------------
window.changeShapeColor = function () {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;

  const shapeTypes = ["rect", "circle", "triangle", "polygon", "ellipse"];
  if (shapeTypes.includes(obj.type)) {
    obj.set("fill", document.getElementById("shapeColor").value);
    window.canvas.requestRenderAll();
  }
};

window.changeTextColor = function () {
  const obj = window.canvas.getActiveObject();
  if (!obj || obj.type !== "textbox") return;
  obj.set("fill", document.getElementById("textColor").value);
  window.canvas.requestRenderAll();
};

window.changeOpacity = function () {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;
  obj.set("opacity", document.getElementById("opacitySlider").value);
  window.canvas.requestRenderAll();
};

window.changeRotation = function () {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;
  const angle = Number(document.getElementById("rotateSlider").value);
  obj.set("angle", angle);
  window.canvas.requestRenderAll();
};

// ------------------------------
// 削除
// ------------------------------
window.deleteObj = function () {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;
  window.canvas.remove(obj);
  saveHistory();
  updateLayerList();
};

// ------------------------------
// レイヤー操作
// ------------------------------
function getActive() { return window.canvas.getActiveObject(); }

window.bringToFront = function () {
  const obj = getActive();
  if (obj) obj.bringToFront();
  window.canvas.renderAll();
  saveHistory();
};

window.bringForward = function () {
  const obj = getActive();
  if (obj) window.canvas.bringForward(obj);
  window.canvas.renderAll();
  saveHistory();
};

window.sendBackward = function () {
  const obj = getActive();
  if (obj) window.canvas.sendBackwards(obj);
  window.canvas.renderAll();
  saveHistory();
};

window.sendToBack = function () {
  const obj = getActive();
  if (obj) obj.sendToBack();
  window.canvas.renderAll();
  saveHistory();
};

// ------------------------------
// レイヤー一覧（必要ならここにあなたの既存コードを）
// ------------------------------
window.updateLayerList = function () {
  const container = document.getElementById("layers");
  container.innerHTML = "";

  window.canvas.getObjects().forEach((obj, index) => {
    const div = document.createElement("div");
    div.textContent = `${index}: ${obj.type}`;
    container.appendChild(div);
  });
};

// ------------------------------
// PNG 保存
// ------------------------------
window.exportImage = function () {
  const link = document.createElement('a');
  link.href = window.canvas.toDataURL({ format: "png" });
  link.download = "canvas.png";
  link.click();
};
