let socket;
let answer = {
  e: "",
  b: "",
};
let test = "...";
var cellSize;
var stateColours;
var grid;
var farms = [];
var turtle;

function Turtle(x, y) {
  this.cell = getCell(x, y);
  this.pos = createVector(x * cellSize.x, y * cellSize.y);
  this.startIndex = y * grid.w + x;
  this.face = 0;
  this.seeds = [];
  this.startTime = 0;
  this.moving = false;
  this.travelTime = 50;
  this.destination = 0;
  this.flip = 1;
  this.finished = false;
  this.atStart = true;

  this.time = {
    started: 0,
    end: 0,
    current: 0,
  };

  this.task = {
    destination: 0,
    squares: 0,
    rows: 0,
    columns: 0,
    toPlant: 0,
  };

  this.move = () => {
    var size = this.direction % 2 === 0 ? cellSize.y : cellSize.x;
    const time = performance.now() - this.startTime;
    let speed = (size / this.travelTime) * time;
    if (this.direction === 0 || this.direction === 3) speed *= -1;
    if (this.atStart) this.atStart = false;
    // if (this.direction % 2 != 0) this.pos.x = this.cell.pos.x + speed;
    // else this.pos.y = this.cell.pos.y + speed;
    if (time >= this.travelTime) {
      this.pos = this.destination.pos;
      this.task = "action";
    }
  };

  this.action = async () => {
    const todo = this.scanCell();

    todo.forEach((t) => {
      this.cell.state[t] = !this.cell.state[t];
    });
    console.log(this.cell.state, todo[0]);
    this.task = "premove";
  };

  this.scanCell = () => {
    let todo = [];
    const { water, hoed, planted, canHarvest } = this.cell.state;
    if (canHarvest) {
      todo.push("canHarvest");
      return todo;
    }
    if (!hoed) todo.push("hoed");
    if (!planted) todo.push("planted");
    if (!water) {
      todo.push("water");
    }
    return todo;
  };

  this.update = () => {
    if (this.finished || this.task === null) return;

    if (this.task === "move") this.move();
    else if (this.task === "action") this.action();
    else if (this.task === "premove") {
      this.startTime = performance.now();
      let newIndex = this.cell.index + grid.w * this.flip;
      if (this.flip > 0) this.direction = 2;
      else this.direction = 0;
      if (!isCell(newIndex, farms[0].cells)) {
        if (isCell(this.cell.index + 1, farms[0].cells)) {
          newIndex = this.cell.index + 1;
          this.direction = 1;
          this.flip *= -1;
        } else {
          this.finished = true;
          console.log("TURTLE FINISHED", this);
          this.returnToStart();
        }
      }
      this.destination = getCellByIndex(newIndex);
      this.cell = this.destination;
      this.task = "move";
    }
  };

  this.render = () => {
    fill(80);
    rect(
      this.pos.x + cellSize.x / 4,
      this.pos.y + cellSize.y / 4,
      cellSize.x / 2,
      cellSize.y / 2
    );
  };

  this.start = (_x, _y) => {
    this.task = "action";
  };

  this.returnToStart = () => {
    const timer = setInterval(() => {
      let newIndex = -20;
      if (!isCell(this.cell.index + newIndex, farms[0].cells)) {
        newIndex = -1;
        if (!isCell(this.cell.index + newIndex, farms[0].cells)) {
          this.atStart = true;
        }
      }
      this.destination = getCellByIndex(this.cell.index + newIndex);
      this.pos = this.destination.pos;
      this.cell = this.destination;
      console.log(this.cell.index, this.startIndex);
      if (this.cell.index === this.startIndex) {
        console.log("AT START");
        this.atStart = true;
        clearInterval(timer);
      }
    }, this.travelTime);
  };
}

class Cell {
  pos;
  index;
  cord;
  state;
  constructor(_x, _y, _state) {
    this.pos = createVector(_x, _y);
    this.index = (_y / cellSize.y) * grid.w + _x / cellSize.x;
    this.cord = createVector(_x / cellSize.x, _y / cellSize.y);
    this.state = new Dirt();
  }

  render = () => {
    this.getColour();
    stroke(0);
    strokeWeight(2);
    rect(this.pos.x, this.pos.y, cellSize.x, cellSize.y);

    if (this.state.canHarvest || this.state.planted) {
      if (this.state.canHarvest) fill(40, 170, 30);
      else fill(80);
      ellipseMode(CENTER);
      ellipse(
        this.pos.x + cellSize.x / 2,
        this.pos.y + cellSize.y / 2,
        cellSize.x / 4
      );
      ellipseMode(LEFT);
    }
  };

  getColour = () => {
    let colour = color(255);

    if (this.state.canHarvest) colour = color(181, 111, 40);
    else if (this.state.water) colour = color(155, 86, 24);
    else if (!this.state.water && this.state.hoed) colour = color(181, 111, 40);
    else colour = color(242, 175, 38);
    fill(colour);
  };
}

class Dirt {
  water;
  hoed;
  planted;
  canHarvest;
  constructor() {
    this.water = false;
    this.hoed = false;
    this.planted = false;
    this.canHarvest = false;
  }
}

function Grid(_w, _h) {
  this.cells = [];
  this.w = _w;
  this.h = _h;
  cellSize = createVector(width / _w, height / _h);

  this.createCells = () => {
    for (var x = 0; x < _w; x++) {
      this.cells[x] = [];
      for (var y = 0; y < _h; y++) {
        this.cells[x][y] = new Cell(
          x * cellSize.x,
          y * cellSize.y,
          color(255, 255, 255)
        );
      }
    }
  };

  this.render = () => {
    for (var i = 0; i < _w; i++) {
      for (var j = 0; j < _h; j++) {
        this.cells[i][j].render();
      }
    }
  };
}

function FarmPreset(_x, _y, _w, _h) {
  this.pos = createVector(_x * cellSize.x, _y * cellSize.y);
  this.size = createVector(_w * cellSize.x, _h * cellSize.y);

  this.cells = cellsSelect(
    getCell(_x, _y).cord,
    getCell(_x + _w - 1, _y + _h - 1).cord
  );

  this.cells.forEach((c) => {
    c.state.canHarvest = true;
  });
  //If _w + _x >= 20 then _w = grid.w - _x;

  this.render = () => {
    if (this.cells.length < 1) return;
    noFill();
    strokeWeight(5);
    stroke(170, 40, 30);

    rect(
      this.cells[0].pos.x,
      this.cells[0].pos.y,
      this.cells[this.cells.length - 1].pos.x +
        cellSize.x -
        this.cells[0].pos.x,
      this.cells[this.cells.length - 1].pos.y + cellSize.y - this.cells[0].pos.y
    );
  };
}

function setup() {
  createCanvas(800, 800);
  frameRate(100);
  stateColours = [
    color(255, 255, 255),
    color(50, 50, 50),
    color(10, 50, 10),
    color(100, 100, 100),
  ];
  grid = new Grid(20, 20);
  grid.createCells();
  farms.push(new FarmPreset(3, 3, 15, 15));
  turtle = new Turtle(farms[0].cells[0].cord.x, farms[0].cells[0].cord.y);

  turtle.start(5, 5);
}

function draw() {
  background(80);
  grid.render();

  farms.forEach((f) => {
    f?.render();
  });

  turtle.update();
  turtle.render();
}

function getCell(x, y) {
  return grid.cells[x][y];
}

function getCellByIndex(idx) {
  return grid.cells[idx % grid.w][Math.floor(idx / grid.h)];
}

function cellsSelect(start, end) {
  let selected = [];
  for (var y = start.y; y <= end.y; y++) {
    for (var x = start.x; x <= end.x; x++) {
      selected.push(grid.cells[x][y]);
    }
  }
  return selected;
}

function isCell(idx, range) {
  return range.find((c) => c.index === idx) ? true : false;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
