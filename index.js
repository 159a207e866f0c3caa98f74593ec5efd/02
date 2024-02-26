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

    let itemTopDir = document.createElement("input");
    itemTopDir.type = "checkbox";
    itemTopDir.id = `dir-${i}`;
    itemTopDir.className = "i-dir";

    itemTop.appendChild(itemTopName);
    itemTop.appendChild(itemTopDir);

    let itemBottom = document.createElement("div");
    itemBottom.className = "item-bottom";

    for (let j of ["x", "y", "i"]) {
      let itemLabel = document.createElement("div");
      itemLabel.className = "item-label";
      itemLabel.textContent = j.toUpperCase();

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

  cvs.width = plot.clientWidth * 0.8;
  cvs.height = plot.clientHeight * 0.8; 
}

const draw = () => {
  const is = [];

  for (let i = 1; i < 5; ++i) {
    const x = parseFloat(document.getElementById(`x-${i}`).value);
    const y = parseFloat(document.getElementById(`y-${i}`).value);
    const ii = parseFloat(document.getElementById(`i-${i}`).value);

    is.push({ x, y, i: ii });
  }

  console.log(is);
}

