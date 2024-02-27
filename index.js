Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

let is_drawing = false;

const makeSample = () => {
  const vals = [
    [30, 0, 250, false],
    [0, 50, 200, true],
    [0, -50, 80, true],
  ];

  for (let i = 1; i < vals.length + 1; ++i) {
    document.getElementById(`x-${i}`).value = vals[i - 1][0];
    document.getElementById(`y-${i}`).value = vals[i - 1][1];
    document.getElementById(`i-${i}`).value = vals[i - 1][2];
    document.getElementById(`dir-${i}`).checked = vals[i - 1][3];
  }

  draw();
}

const setup = () => {
  const pane = document.getElementById("lst");
  for (let i = 1; i < 5; ++i) {

    let item = document.createElement("div");
    item.className = "item";

    let itemTop = document.createElement("div");
    itemTop.className = "item-top";

    let itemTopName = document.createElement("div");
    itemTopName.className = "item-top-name";
    itemTopName.textContent = `Ток №${i}`;

    let itemTopLabel = document.createElement("div");
    itemTopLabel.className = "item-top-label";
    itemTopLabel.textContent = "От нас: ";

    let itemTopDir = document.createElement("input");
    itemTopDir.type = "checkbox";
    itemTopDir.id = `dir-${i}`;
    itemTopDir.className = "i-dir";

    let itemTopRight = document.createElement("div");
    itemTopRight.className = "item-top-right";
    itemTopRight.appendChild(itemTopLabel);
    itemTopRight.appendChild(itemTopDir);

    itemTop.appendChild(itemTopName);
    itemTop.appendChild(itemTopRight);

    let itemBottom = document.createElement("div");
    itemBottom.className = "item-bottom";

    for (let j of ["x", "y", "i"]) {
      let itemLabel = document.createElement("div");
      itemLabel.className = "item-label";
      itemLabel.textContent = j.toUpperCase() + " (м)";
      if (j === "i") {
        itemLabel.textContent = "I (A)";
      }

      let itemInput = document.createElement("input");
      itemInput.id = `${j}-${i}`;
      itemInput.size = "4";
      itemInput.type = "number";
      itemInput.step = "any";
      itemInput.className = "item-input";

      let itemField = document.createElement("div");
      itemField.className = "item-field";

      itemField.appendChild(itemLabel);
      itemField.appendChild(itemInput);

      itemBottom.appendChild(itemField);
    }

    item.appendChild(itemTop);
    item.appendChild(itemBottom);

    pane.appendChild(item);
  }

  const plot = document.getElementById("plot");
  const cvs = document.getElementById("cvs");

  cvs.width = plot.clientWidth * 0.9;
  cvs.height = plot.clientHeight * 0.9;

  const ctx = cvs.getContext("2d");
  ctx.translate(cvs.width / 2, cvs.height / 2);

  makeSample();
}

const drawIs = (is, ctx) => {
  const rd = 5;
  for (let c of is) {
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.arc(c.x, c.y, rd, 0, 2 * Math.PI, false);
    ctx.fillStyle = c.d ? "red" : "green";
    ctx.fill();
  }
  ctx.lineWidth = 1;
}

const mixColors = (color1, color2, weight) => {
  let w1 = weight;
  let w2 = 1 - w1;
  return [
    Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2),
  ];
}

const getArrowColor = (val) => {
  const c = mixColors([255, 0, 0], [0, 0, 255], val.clamp(0, 1));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const drawArrow = (x1, y1, x2, y2, value, ctx) => {
  let head = 4;
  let dx = x2 - x1;
  let dy = y2 - y1;
  let angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.strokeStyle = getArrowColor(value);
  ctx.stroke();
}

const drawPoint = (is, px, py, ctx, arrow_length) => {
  let res = [0, 0];
  for (let c of is) {
    const r = [c.x - px, c.y - py];
    let b = !c.d ? [-r[1], r[0]] : [r[1], -r[0]];
    const len = b[0] * b[0] + b[1] * b[1];
    if (isNaN(len)) continue;
    res[0] += b[0] * c.i / len;
    res[1] += b[1] * c.i / len;
  }

  const length = Math.sqrt(res[0] * res[0] + res[1] * res[1]);
  const dx = (res[0] / length) * arrow_length;
  const dy = (res[1] / length) * arrow_length;

  drawArrow(px, py, px + dx, py + dy, length, ctx);
}

const drawLines = (w, h, ctx) => {
  ctx.setLineDash([5, 3]);
  ctx.lineWidth = 1;
  const oldStroke = ctx.strokeStyle;
  ctx.strokeStyle = "black";

  let x = -(w - w % 100);
  ctx.beginPath();
  while (x < w) {
    ctx.moveTo(x, -h);
    ctx.lineTo(x, h);
    ctx.stroke();
    x += 100;
  }

  let y = -(h - h % 100);
  while (y < h) {
    ctx.moveTo(-w, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    y += 100;
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = oldStroke;
}

const drawGrid = (is) => {
  const cvs = document.getElementById("cvs");
  const ctx = cvs.getContext("2d");

  const width = cvs.width;
  const height = cvs.height;
  const step = 16;
  const arrow_len = 8;

  ctx.clearRect(-width, -height, 2 * width, 2 * height);
  drawLines(width, height, ctx);

  let x = -width / 2;
  while (x < width / 2) {
    let y = -height / 2;
    while (y < height / 2) {
      drawPoint(is, x, y, ctx, arrow_len);
      y += step;
    }
    x += step;
  }
  drawIs(is, ctx);
}

const draw = () => {
  if (is_drawing) {
    return;
  }
  is_drawing = true;
  const is = [];

  for (let i = 1; i < 5; ++i) {
    const x = parseFloat(document.getElementById(`x-${i}`).value);
    const y = parseFloat(document.getElementById(`y-${i}`).value);
    const ii = parseFloat(document.getElementById(`i-${i}`).value);
    const d = document.getElementById(`dir-${i}`).checked;

    if (isNaN(x) || isNaN(y) || isNaN(ii)) {
      continue;
    }

    is.push({ x, y: -y, i: ii, d });
  }
  if (is.length === 0) {
    is_drawing = false;
    alert("Введите как минимум один ток");
    return;
  }

  drawGrid(is);
  is_drawing = false;
}

