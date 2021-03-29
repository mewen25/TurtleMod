//browser-sync start --server --files "."
let timers = [];
let tiles = [];
let turtles = [];
let grid;
let cellSize = 44;
let types = ["stone", "dirt"];
let toolbarMargin = 20;
let press;
let release;
let count = 0;
let clear = false;

let shiftHeld = false;
let tileSelected = null;
let tempSel = null;
let pressTile = null;

let ghostShape = null;

function setup() {
  grid = createVector(20, 20);
  createCanvas(grid.x * cellSize + cellSize * 3, grid.y * cellSize);
  createGrid();
  //buildFarm(createVector(3, 5), createVector(6, 5));
  //buildFarm(createVector(12, 13), createVector(5, 4));
  //buildFarm(createVector(1, 1), createVector(10, 3));
  //buildFarm(createVector(2, 12), createVector(8, 6));
  //buildFarm(createVector(13, 2), createVector(5, 9));
  //turtlesAssemble();

  toolbar = new Toolbar(
    createVector(grid.x * cellSize + toolbarMargin / 2, 0 + toolbarMargin / 2),
    createVector(
      cellSize * 3 - toolbarMargin,
      grid.y * cellSize - toolbarMargin
    ),
    clickHandle
  );
}

function mousePressed(mouse) {
  if (!inGrid(mouseX, mouseY)) return;
  const tile = getMouseTile();
  if (tile) {
    clickHandle();
  }
  press = createVector(
    Math.floor(Math.min(mouse.x, grid.x * cellSize) / cellSize),
    Math.floor(Math.min(mouse.y, grid.y * cellSize) / cellSize)
  );
  if (toolbar.selected.action === "farmCreate") pressTile = getMouseTile();
}

function mouseDragged() {
  if (mouseIsPressed) {
    if (shiftHeld) clickHandle();

    if (toolbar.selected.action === "farmCreate") {
      const tile = getMouseTile();

      if (tile && pressTile) {
        let size = [];

        size = [
          [pressTile.pos.x + cellSize / 2, pressTile.pos.y + cellSize / 2],
          [tile.pos.x + cellSize / 2, pressTile.pos.y + cellSize / 2],
          [tile.pos.x + cellSize / 2, tile.pos.y + cellSize / 2],
          [pressTile.pos.x + cellSize / 2, tile.pos.y + cellSize / 2],
        ];

        ghostShape = [
          "polygon",
          "#ea4d4d",
          false,
          true,
          pressTile.pos.x,
          pressTile.pos.y,
          size[0],
          size[1],
          size,
        ];
      }
    }
  }
}

function clickHandle() {
  if (toolbar.selected) eval(`${toolbar.selected.action}()`);
}

function keyPressed() {
  if (keyCode === SHIFT) shiftHeld = true;
}
function keyReleased() {
  if (keyCode === SHIFT) shiftHeld = false;
}

function inGrid(x, y) {
  return x < grid.x * cellSize && y < grid.y * cellSize;
}

function mouseReleased(mouse) {
  if (tempSel) tempSel = null;
  if (tileSelected) tileSelected = null;
  if (pressTile) pressTile = null;
  if (ghostShape) ghostShape = null;
  if (!inGrid(mouseX, mouseY)) return;

  release = createVector(
    Math.floor(Math.min(mouse.x, grid.x * cellSize) / cellSize),
    Math.floor(Math.min(mouse.y, grid.y * cellSize) / cellSize)
  );
  if (
    press &&
    press.x < grid.x &&
    press.y < grid.y &&
    release.x < grid.x &&
    release.y < grid.y
  ) {
    clickHandle();
  }
}

function draw() {
  strokeWeight(2);
  fill(255, 255, 100);
  rect(grid.x * cellSize, 0, cellSize * 3, grid.y * cellSize);

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].render();
  }

  for (let j = 0; j < turtles.length; j++) {
    noFill();
    strokeWeight(4);
    stroke(220, 0, 0);
    rect(
      turtles[j].farm[0].pos.x,
      turtles[j].farm[0].pos.y,
      turtles[j].farm[turtles[j].farm.length - 1].pos.x +
        cellSize -
        turtles[j].farm[0].pos.x,
      turtles[j].farm[turtles[j].farm.length - 1].pos.y +
        cellSize -
        turtles[j].farm[0].pos.y
    );
    turtles[j].render();
  }

  toolbar.render();

  if (ghostShape) {
    // if (ghostShape[0]) fill(ghostShape[0]);
    // noFill();
    if (ghostShape[2]) stroke(ghostShape[2]);
    else noStroke();
    fill(255);

    stroke(0);
    strokeWeight(4);

    if (ghostShape[0] === "polygon") {
      fill(80, 80, 80, 150);
      stroke(200, 60, 60);
      beginShape();
      ghostShape[8].forEach((s) => {
        vertex(...s);
      });
      endShape(CLOSE);
    } else rect(...ghostShape.slice(3));
  }
}

function createGrid() {
  for (let i = 0; i < grid.y; i++) {
    for (let j = 0; j < grid.x; j++) {
      tiles[i * grid.x + j] = new Tile(
        i * grid.x + j,
        j * cellSize,
        i * cellSize,
        types[Math.floor(Math.random() * types.length)]
      );
    }
  }
}

function getMouseTile() {
  return getTile(
    Math.min(mouseX, grid.x * cellSize),
    Math.min(mouseY, grid.y * cellSize)
  );
}

function getTile(_x, _y) {
  const x = Math.floor(_x / cellSize);
  const y = Math.floor(_y / cellSize);
  return tiles[y * grid.x + x];
}

function buildFarm(start, size) {
  let farm = [];
  let ind = start.y * grid.x + start.x;
  for (let i = 0; i < size.y; i++) {
    for (let j = 0; j < size.x; j++) {
      farm[i * size.x + j] = tiles[ind];
      ind += 1;
    }
    ind += grid.x - size.x;
  }
  turtles.push(new Turtle(farm[0].index, 2, farm));
  console.log("fag", farm[0].index);
  startTurtle(turtles.length - 1);
}

function startTurtle(i) {
  timers[i] = setInterval(() => {
    turtleMove(i);
  }, 1000 / turtles[i].speed);
}

function turtleMove(i) {
  if (clear) return;
  if (tiles[turtles[i].index].block === "dirt") {
    if (tiles[turtles[i].index].tilled === false) turtles[i].hoe();
    if (
      tiles[turtles[i].index].wet === false &&
      tiles[turtles[i].index].tilled === true
    )
      turtles[i].water();
    if (
      tiles[turtles[i].index].planted === false &&
      tiles[turtles[i].index].wet === true
    )
      turtles[i].plant();
  }

  let edge = checkInfront(i);
  if (edge === true) {
    turtles[i].turn(turtles[i].flip);
    let finish = checkInfront(i);
    if (finish === true) {
      clearInterval(timers[i]);
      return console.log("turtle Finished");
    }
    turtles[i].forward();
    turtles[i].turn(turtles[i].flip);
    turtles[i].flip *= -1;
  } else {
    turtles[i].forward();
  }
}
// }

function checkInfront(i) {
  turtles[i].render();
  for (let j = 0; j < turtles[i].farm.length; j++) {
    if (turtles[i].farm[j].index === turtles[i].dest) {
      return false;
    }
  }
  return true;
}

class Tile {
  constructor(index, x, y, block) {
    this.index = index;
    this.pos = createVector(x, y);
    this.block = block;
    this.wet = false;
    this.tilled = false;
    this.planted = false;
    this.walk = false;
  }

  render() {
    let r, g, b;
    strokeWeight(2);
    stroke(0);
    if (this.block === "dirt") {
      r = 150;
      g = 75;
      b = 0;
      if (this.tilled === true) {
        r -= 25;
        g -= 25;
        b -= 25;
      }
      if (this.wet === true) {
        r -= 25;
        g -= 25;
        b -= 25;
      }
      fill(r, g, b);
    } else if (this.block === "stone") fill(100);
    else fill(256);
    if (pressTile === this) fill(60, 200, 70);
    else if (pressTile && getMouseTile() === this) fill(90, 80, 200);
    rect(this.pos.x, this.pos.y, cellSize, cellSize);
    if (this.block === "dirt" && this.planted === true) {
      fill(0, 255, 0);
      ellipse(this.pos.x + cellSize / 2, this.pos.y + cellSize / 2, 10, 10);
      fill(r, g, b);
    }
  }
}

class Turtle {
  constructor(index, dir, farm) {
    this.farm = farm;
    this.index = index;
    this.size = cellSize / 2;
    this.speed = 5;

    this.pos = createVector(
      tiles[index].pos.x + this.size / 2,
      tiles[index].pos.y + this.size / 2
    );
    this.dir = dir;
    this.dest = index += grid.x;
    this.flip = -1;
    this._dir = this.dir;
    this._index = this.index;
  }

  render() {
    strokeWeight(1);
    fill(250);
    stroke(0);
    rect(this.pos.x, this.pos.y, this.size, this.size);
    fill(100);
    angleMode(DEGREES);
    translate(this.pos.x + this.size / 2, this.pos.y + this.size / 2);
    rotate(this.dir * 90);
    triangle(
      -this.size / 4,
      this.size / 4,
      this.size / 4,
      this.size / 4,
      0,
      -this.size / 4
    );
    rotate(this.dir * 90 * -1);
    translate(
      (this.pos.x + this.size / 2) * -1,
      (this.pos.y + this.size / 2) * -1
    );
  }

  forward() {
    if (this.dir == 0) {
      this.index -= grid.x;
      this.dest = this.index - grid.x;
    }
    if (this.dir == 1) {
      this.index += 1;
      this.dest = this.index + 1;
    }
    if (this.dir == 2) {
      this.index += grid.x;
      this.dest = this.index + grid.x;
    }
    if (this.dir == 3) {
      this.index -= 1;
      this.dest = this.index - 1;
    }
    this.pos = createVector(
      tiles[this.index].pos.x + this.size / 2,
      tiles[this.index].pos.y + this.size / 2
    );
  }

  turn(i) {
    this.dir += i;
    if (this.dir == 0) this.dest = this.index - grid.x;
    if (this.dir == 1) this.dest = this.index + 1;
    if (this.dir == 2) this.dest = this.index + grid.x;
    if (this.dir == 3) this.dest = this.index - 1;
  }

  hoe() {
    tiles[this.index].tilled = true;
  }

  water() {
    tiles[this.index].wet = true;
  }

  plant() {
    tiles[this.index].planted = true;
  }
}

// TOOLBAR FUNCTIONS

const farmSelect = () => {};

const turtleSelect = () => {};

const farmCreate = () => {
  if (mouseIsPressed) return;
  if (release.x <= press.x && release.y <= press.y) {
    buildFarm(
      createVector(release.x, release.y),
      createVector(press.x - release.x + 1, press.y - release.y + 1)
    );
  } else if (release.x >= press.x && release.y <= press.y) {
    buildFarm(
      createVector(press.x, release.y),
      createVector(release.x - press.x + 1, press.y - release.y + 1)
    );
  } else if (release.x <= press.x && release.y >= press.y) {
    buildFarm(
      createVector(release.x, press.y),
      createVector(press.x - release.x + 1, release.y - press.y + 1)
    );
  } else {
    buildFarm(
      createVector(press.x, press.y),
      createVector(release.x - press.x + 1, release.y - press.y + 1)
    );
  }
};

const farmPaint = () => {
  const tile = getMouseTile();
  if (!tile || tile === tileSelected) return;
  if (!tempSel) tempSel = tile.block === "dirt" ? "stone" : "dirt";
  tile.block = tempSel;
  tileSelected = tile;
};

const farmPaintEmpty = () => {};

const farmPaintWalkway = () => {
  const tile = getMouseTile();
  if (!tile || tile === tileSelected) return;
  if (!tempSel) tempSel = tile.walk === true ? false : true;
  tile.walk = tempSel;
  tileSelected = tile;
};

const farmRemove = () => {};

const screenClear = () => {
  timers.forEach((t) => {
    clearInterval(t);
  });
  // tiles = [];
  turtles = [];
  grid;
  cellSize = 44;
  press;
  release;
  count = 0;
  var interval_id = window.setInterval("", 20);

  for (var i = 1; i < interval_id; i++) window.clearInterval(i);
  console.log(window);
  // clear = true;
  tiles.forEach((t) => {
    t.wet = false;
    t.tilled = false;
    t.planted = false;
  });
  toolbar.selected = toolbar.oldSelected;
};
