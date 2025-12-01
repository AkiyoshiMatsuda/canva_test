const canvas = new fabric.Canvas('c', {
      backgroundColor: '#fff'
    });

    // テキストを追加
    function addText() {
    const text = new fabric.Textbox("Sample Text", {
        left: 100,
        top: 100,
        fontSize: 40,
        fill: "#333",
        originX: 'center', // 中心を回転軸に
        originY: 'center'
    });
    canvas.add(text);
    };

    // 画像を追加
    function addImage() {
    document.getElementById("fileInput").click();
    }

    document.getElementById("fileInput").addEventListener("change", function(e) {
    const reader = new FileReader();
    reader.onload = function(f) {
        fabric.Image.fromURL(f.target.result, function(img) {
        img.scaleToWidth(300);
        img.set({
            originX: 'center', // 中心を回転軸に
            originY: 'center'
        });
        canvas.add(img);
        });
    }
    reader.readAsDataURL(e.target.files[0]);
    });


    // 四角形追加
    function addRect() {
      canvas.add(new fabric.Rect({
        left: 50,
        top: 50,
        width: 120,
        height: 80,
        fill: 'skyblue',
        originX: 'center',
        originY: 'center'
      }));
    };

    // 三角形追加
    function addTriangle() {
    const tri = new fabric.Triangle({
        left: 200,
        top: 150,
        width: 120,
        height: 100,
        fill: 'yellow',
        originX: 'center',
        originY: 'center'
    });
    canvas.add(tri);
    updateLayerList();
    };

    // 円追加
    function addCircle() {
      canvas.add(new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: 'coral',
        originX: 'center',
        originY: 'center'
      }));
    };

    // 図形の色を変更
    function changeShapeColor() {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    const shapeTypes = ["rect", "circle", "triangle", "polygon", "ellipse"];
    if (shapeTypes.includes(obj.type)) {
        obj.set("fill", document.getElementById("shapeColor").value);
        canvas.requestRenderAll();
    }
    };

    // オブジェクトの削除
    function deleteObj() {
      const obj = canvas.getActiveObject();
      if (!obj) return;
      canvas.remove(obj);
      updateLayerList();
    };
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete") deleteObj();
    });
    
    // 文字色を変更
    function changeTextColor() {
      const obj = canvas.getActiveObject();
      if (!obj || obj.type !== "textbox") return;

      const color = document.getElementById("textColor").value;
      obj.set("fill", color);
      canvas.renderAll();
      updateLayerList();
    }

    // テキスト選択時に色を UI に反映
    canvas.on("selection:updated", applyColorToUI);
    canvas.on("selection:created", applyColorToUI);

    function applyColorToUI() {
      const obj = canvas.getActiveObject();
      if (obj && obj.type === "textbox") {
        document.getElementById("textColor").value = obj.fill;
      }
    }

    function updateLayerList() {
      const container = document.getElementById("layers");
      container.innerHTML = ""; // 初期化

      const objects = canvas.getObjects().slice().reverse(); 
      // ↑最前面を上に表示するため reverse()

      objects.forEach((obj, index) => {
        const div = document.createElement("div");
        div.className = "layer-item";

        if (obj === canvas.getActiveObject()) {
          div.classList.add("active");
        }

        // 種類別の名前
        let label = "オブジェクト";
        if (obj.type === "rect") label = "四角形";
        if (obj.type === "circle") label = "丸";
        if (obj.type === "textbox") label = "テキスト";
        if (obj.type === "triangle") label = "三角形"

        div.textContent = label;

        // クリックで選択
        div.onclick = () => {
          canvas.setActiveObject(obj);
          canvas.requestRenderAll();
          updateLayerList();
          applyColorToUI();
        };

        container.appendChild(div);
      });
    }

    function applyAspectPreset() {
      const val = document.getElementById("aspectPreset").value;
      if (!val) return;

      const [w, h] = val.split(":").map(Number);

      const width = 600;
      const height = Math.round(600 * (h / w));

      resizeCanvas(width, height);
    }

    // ------------------------------
    // アスペクト比（自由入力）
    // ------------------------------
    function applyCustomAspect() {
      const w = Number(document.getElementById("customWidth").value);
      const h = Number(document.getElementById("customHeight").value);
      if (w > 0 && h > 0) resizeCanvas(w, h);
    }

    function resizeCanvas(width, height) {
      const canvasEl = document.getElementById("c");
      canvasEl.width = width;
      canvasEl.height = height;

      canvas.setWidth(width);
      canvas.setHeight(height);
      canvas.renderAll();
    }

    function exportImage() {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0
      });
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'design.png';
      link.click();
    };

    // オブジェクトの角度を変更
    // function changeRotation() {
    // const obj = canvas.getActiveObject();
    // if (!obj) return;

    // const angle = Number(document.getElementById("rotateSlider").value);
    // obj.set("angle", angle);
    // canvas.requestRenderAll();
    // }

    // // 選択したオブジェクトの角度をスライダーに反映
    // canvas.on("selection:created", updateRotateSlider);
    // canvas.on("selection:updated", updateRotateSlider);

    // function updateRotateSlider() {
    // const obj = canvas.getActiveObject();
    // if (obj) {
    //     document.getElementById("rotateSlider").value = obj.angle ?? 0;
    // }
    // };

    // function changeRotation() {
    // const obj = canvas.getActiveObject();
    // if (!obj) return;

    // const angle = Number(document.getElementById("rotateSlider").value);

    // // オブジェクト中心を回転の原点に設定
    // obj.set({
    //     originX: 'center',
    //     originY: 'center',
    //     angle: angle
    // });

    // canvas.requestRenderAll();
    // }

    // // 選択したオブジェクトの角度をスライダーに反映
    // canvas.on("selection:created", updateRotateSlider);
    // canvas.on("selection:updated", updateRotateSlider);

    // function updateRotateSlider() {
    //     const obj = canvas.getActiveObject();
    //     if (obj) {
    //         document.getElementById("rotateSlider").value = obj.angle ?? 0;

    //         // 選択時も中心を回転原点に設定
    //         obj.set({
    //             originX: 'center',
    //             originY: 'center'
    //         });
    //     }
    // };

    function changeRotation() {
    const obj = canvas.getActiveObject();
    if (!obj) return;

    const angle = Number(document.getElementById("rotateSlider").value);
    obj.set("angle", angle); // originX/Yは触らない
    canvas.requestRenderAll();
    }

    // 選択したオブジェクトの角度をスライダーに反映
    canvas.on("selection:created", updateRotateSlider);
    canvas.on("selection:updated", updateRotateSlider);

    function updateRotateSlider() {
        const obj = canvas.getActiveObject();
        if (obj) {
            document.getElementById("rotateSlider").value = obj.angle ?? 0;
        }
    };


    // --- レイヤー操作 ---
    function getActive() {
      return canvas.getActiveObject();
    }

    function bringToFront() {
      const obj = getActive();
      if (obj) obj.bringToFront();
      canvas.requestRenderAll();
    }

    function bringForward() {
      const obj = getActive();
      if (obj) canvas.bringForward(obj);
      canvas.requestRenderAll();
    }

    function sendBackward() {
      const obj = getActive();
      if (obj) canvas.sendBackwards(obj);
      canvas.requestRenderAll();
    }

    function sendToBack() {
      const obj = getActive();
      if (obj) obj.sendToBack();
      canvas.requestRenderAll();
    }

    function changeOpacity() {
        const obj = canvas.getActiveObject();
        if (!obj) return;

        const opacity = document.getElementById("opacitySlider").value;
        obj.set("opacity", opacity);
        canvas.requestRenderAll();
    }

    // 選択したときにスライダーへ反映
    canvas.on("selection:created", updateOpacitySlider);
    canvas.on("selection:updated", updateOpacitySlider);

    function updateOpacitySlider() {
    const obj = canvas.getActiveObject();
    if (obj) {
        document.getElementById("opacitySlider").value = obj.opacity ?? 1;
    }
    }

    canvas.on("object:added", updateLayerList);
    canvas.on("object:removed", updateLayerList);

    // 選択変更時に更新
    canvas.on("selection:created", updateLayerList);
    canvas.on("selection:updated", updateLayerList);
    canvas.on("selection:cleared", updateLayerList);