// ------------------------------
// グローバル canvas 定義
// ------------------------------
window.canvas = new fabric.Canvas('c', { backgroundColor: '#fff' });

// Undo/Redo 用履歴管理
window.history = [];
window.redoHistory = [];

// ------------------------------
// 履歴保存
// ------------------------------
function saveHistory() {
  const json = window.canvas.toJSON();
  window.history.push(json);
  if (window.history.length > 50) window.history.shift(); // 最大履歴50件
  window.redoHistory = []; // 新操作でRedoはクリア
}

// Undo
window.undo = function() {
  if (window.history.length < 2) return;
  const last = window.history.pop();
  window.redoHistory.push(last);
  const prev = window.history[window.history.length - 1];
  window.canvas.loadFromJSON(prev, () => {
    window.canvas.renderAll();
    updateLayerList();
  });
}

// Redo
window.redo = function() {
  if (!window.redoHistory.length) return;
  const next = window.redoHistory.pop();
  window.history.push(next);
  window.canvas.loadFromJSON(next, () => {
    window.canvas.renderAll();
    updateLayerList();
  });
}

// ------------------------------
// オブジェクト追加
// ------------------------------
window.addText = function() {
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

window.addRect = function() {
  const rect = new fabric.Rect({
    left: 50,
    top: 50,
    width: 120,
    height: 80,
    fill: 'skyblue',
    originX: 'center',
    originY: 'center'
  });
  window.canvas.add(rect);
  saveHistory();
};

window.addTriangle = function() {
  const tri = new fabric.Triangle({
    left: 200,
    top: 150,
    width: 120,
    height: 100,
    fill: 'yellow',
    originX: 'center',
    originY: 'center'
  });
  window.canvas.add(tri);
  saveHistory();
  updateLayerList();
};

window.addCircle = function() {
  const circ = new fabric.Circle({
    left: 100,
    top: 100,
    radius: 50,
    fill: 'coral',
    originX: 'center',
    originY: 'center'
  });
  window.canvas.add(circ);
  saveHistory();
};

window.addImage = function() {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").addEventListener("change", function(e) {
  const reader = new FileReader();
  reader.onload = function(f) {
    fabric.Image.fromURL(f.target.result, function(img) {
      img.scaleToWidth(300);
      img.set({ originX: 'center', originY: 'center' });
      window.canvas.add(img);
      saveHistory();
    });
  }
  reader.readAsDataURL(e.target.files[0]);
});

// ------------------------------
// オブジェクト操作
// ------------------------------
window.deleteObj = function() {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;
  window.canvas.remove(obj);
  saveHistory();
  updateLayerList();
};

window.changeTextColor = function() {
  const obj = window.canvas.getActiveObject();
  if (!obj || obj.type !== "textbox") return;
  obj.set("fill", document.getElementById("textColor").value);
  window.canvas.renderAll();
  saveHistory();
};

window.changeShapeColor = function() {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;
  const shapeTypes = ["rect", "circle", "triangle", "polygon", "ellipse"];
  if (shapeTypes.includes(obj.type)) {
    obj.set("fill", document.getElementById("shapeColor").value);
    window.canvas.renderAll();
    saveHistory();
  }
};

window.changeOpacity = function() {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;
  obj.set("opacity", document.getElementById("opacitySlider").value);
  window.canvas.renderAll();
  saveHistory();
};

window.changeRotation = function() {
  const obj = window.canvas.getActiveObject();
  if (!obj) return;
  const angle = Number(document.getElementById("rotateSlider").value);
  obj.set("angle", angle);
  window.canvas.renderAll();
  saveHistory();
};

// ------------------------------
// レイヤー操作
// ------------------------------
window.bringToFront = function() {
  const obj = window.canvas.getActiveObject();
  if (obj) obj.bringToFront();
  window.canvas.requestRenderAll();
  saveHistory();
};

window.bringForward = function() {
  const obj = window.canvas.getActiveObject();
  if (obj) window.canvas.bringForward(obj);
  window.canvas.requestRenderAll();
  saveHistory();
};

window.sendBackward = function() {
  const obj = window.canvas.getActiveObject();
  if (obj) window.canvas.sendBackwards(obj);
  window.canvas.requestRenderAll();
  saveHistory();
};

window.sendToBack = function() {
  const obj = window.canvas.getActiveObject();
  if (obj) obj.sendToBack();
  window.canvas.requestRenderAll();
  saveHistory();
};

// ------------------------------
// アスペクト比変更
// ------------------------------
window.applyAspectPreset = function() {
  const val = document.getElementById("aspectPreset").value;
  if (!val) return;
  const [w, h] = val.split(":").map(Number);
  const width = 600;
  const height = Math.round(600 * (h / w));
  resizeCanvas(width, height);
};

window.applyCustomAspect = function() {
  const w = Number(document.getElementById("customWidth").value);
  const h = Number(document.getElementById("customHeight").value);
  if (w > 0 && h > 0) resizeCanvas(w, h);
};

function resizeCanvas(width, height) {
  const canvasEl = document.getElementById("c");
  canvasEl.width = width;
  canvasEl.height = height;
  window.canvas.setWidth(width);
  window.canvas.setHeight(height);
  window.canvas.renderAll();
}

// ------------------------------
// レイヤーリスト更新
// ------------------------------
function updateLayerList() {
  const container = document.getElementById("layers");
  container.innerHTML = "";
  const objects = window.canvas.getObjects().slice().reverse();
  objects.forEach((obj) => {
    const div = document.createElement("div");
    div.className = "layer-item";
    if (obj === window.canvas.getActiveObject()) div.classList.add("active");

    let label = "オブジェクト";
    if (obj.type === "rect") label = "四角形";
    if (obj.type === "circle") label = "丸";
    if (obj.type === "textbox") label = "テキスト";
    if (obj.type === "triangle") label = "三角形";
    div.textContent = label;

    div.onclick = () => {
      window.canvas.setActiveObject(obj);
      window.canvas.requestRenderAll();
      updateLayerList();
    };

    container.appendChild(div);
  });
}

// ------------------------------
// 選択時に UI に反映
// ------------------------------
window.canvas.on("selection:created", updateLayerList);
window.canvas.on("selection:updated", updateLayerList);
window.canvas.on("selection:cleared", updateLayerList);

window.canvas.on("selection:created", function() {
  const obj = window.canvas.getActiveObject();
  if (obj && obj.type === "textbox") document.getElementById("textColor").value = obj.fill;
});
window.canvas.on("selection:updated", function() {
  const obj = window.canvas.getActiveObject();
  if (obj && obj.type === "textbox") document.getElementById("textColor").value = obj.fill;
});
window.canvas.on("selection:created", function() {
  const obj = window.canvas.getActiveObject();
  if (obj) document.getElementById("opacitySlider").value = obj.opacity ?? 1;
});
window.canvas.on("selection:updated", function() {
  const obj = window.canvas.getActiveObject();
  if (obj) document.getElementById("opacitySlider").value = obj.opacity ?? 1;
});

// ------------------------------
// PNG 保存
// ------------------------------
window.exportImage = function() {
  const dataURL = window.canvas.toDataURL({ format: 'png', quality: 1.0 });
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'design.png';
  link.click();
};

// ------------------------------
// 初回履歴保存
// ------------------------------
saveHistory();
