let toolbar;

let toolbarActions = {
  Select: [
    {
      label: "Select Farm",
      action: "farmSelect",
      text: "SEL",
    },
    {
      label: "Select Turtle",
      action: "turtleSelect",
      text: "T_SEL",
    },
  ],
  Paint: [
    {
      label: "Create Farm",
      action: "farmCreate",
      text: "CREATE",
    },
    {
      label: "Paint Farm",
      action: "farmPaint",
      text: "PAINT",
    },
    {
      label: "Paint Empty",
      action: "farmPaintEmpty",
      text: "EMPTY",
    },
    {
      label: "Paint Walkway",
      action: "farmPaintWalkway",
      text: "WALK",
    },
  ],
  Delete: [
    {
      label: "Remove Farm",
      action: "farmRemove",
      text: "DEL",
    },
    {
      label: "Clear Screen",
      action: "screenClear",
      text: "CLEAR",
      instant: true,
    },
  ],
};

class Button {
  constructor(x, y, w, h, col1, col2, txt, func) {
    this.pos = createVector(x + 5, y);
    this.size = createVector(w, h / 2);
    this.col1 = col1;
    this.col2 = col2;
    this.txt = txt;
    this.btnFill = col1;
    this.held = false;
    this.func = func;
  }

  hover() {
    if (
      mouseIn(
        mouseX,
        mouseY,
        this.pos,
        createVector(this.pos.x + this.size.x, this.pos.y + this.size.y)
      )
    ) {
      this.btnFill = this.col2;
      if (mouseIsPressed && !this.held) {
        this.held = true;
        this.clicked();
      }
    } else {
      this.btnFill = this.col1;
    }
    if (!mouseIsPressed && this.held) this.held = false;
  }

  render() {
    if (toolbar.selected && toolbar.selected.text === this.info.text)
      this.btnFill = color(20, 160, 40);
    else this.hover();
    fill(this.btnFill);
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    textAlign(CENTER, CENTER);
    fill(
      toolbar.selected && toolbar.selected.text === this.info.text
        ? color(255)
        : color(10, 10, 20)
    );
    textSize(18);
    noStroke();
    text(this.txt, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
    textAlign(LEFT, TOP);
    stroke(80);
  }

  clicked() {
    this.btnFill = this.col1;
    this.func(this);
  }
}

class ToolbarButton extends Button {
  constructor(x, y, w, h, col1, col2, txt, func, info) {
    super(x, y, w, h, col1, col2, txt, func);
    this.info = info;
  }
}

function mouseIn(mouseX, mouseY, pos, pos2) {
  return (
    mouseX >= pos.x && mouseX <= pos2.x && mouseY >= pos.y && mouseY <= pos2.y
  );
}

class ToolbarGroup {
  constructor(_actions, groupName, idx, spacing, tb) {
    this.actions = _actions;
    this.name = groupName;
    this.prevSize = 0;
    this.pos = createVector(
      tb.pos.x + 10,
      tb.pos.y + this.prevSize + (idx === 0 ? 0 : spacing)
    );
    this.groupSize = createVector(
      tb.size.x - 20,
      (_actions.length * tb.actions.toolSize.y) / 2
    );
    this.col = color(random(255), random(255), 0);
    this.list = tb.actions.list[groupName];
    this.buttons = [];
  }

  rePosition(prevTool, tb) {
    this.pos = createVector(
      tb.pos.x + 10,
      prevTool.pos.y + prevTool.groupSize.y + tb.actions.spacing
    );
  }

  btnClicked(btn) {
    toolbar.oldSelected = toolbar.selected;
    toolbar.selected = btn.info;

    if (btn.info.instant) toolbar.clickHandle();
  }

  createButtons() {
    this.buttons = this.list.map((l, idx) => {
      const position = createVector(
        this.pos.x,
        this.pos.y + (idx * toolbar.actions.toolSize.y) / 2
      );
      return new ToolbarButton(
        position.x,
        position.y,
        toolbar.actions.toolSize.x,
        toolbar.actions.toolSize.y,
        color(255, 128, 0),
        color(230, 110, 20),
        l.text,
        this.btnClicked,
        l
      );
    });
    console.log(this.buttons);
  }

  renderGroup() {
    if (this.buttons.length == 0) {
      this.createButtons();
      return;
    }

    fill(this.col);
    stroke(60);
    rect(this.pos.x, this.pos.y, this.groupSize.x, this.groupSize.y);

    this.buttons.forEach((b) => b.render());
  }
}

class Toolbar {
  constructor(_pos, _size, clickHandle) {
    this.pos = _pos;
    this.size = _size;
    this.actions = {
      keys: Object.keys(toolbarActions),
      list: toolbarActions,
      spacing: 30,
      toolSize: createVector(80, 180),
    };
    this.oldSelected = null;
    this.selected = toolbarActions["Paint"].find(
      (t) => t.action === "farmCreate"
    );
    this.tools = this.actions.keys.map(
      (a, idx) =>
        new ToolbarGroup(
          this.actions.list[a],
          a,
          idx,
          this.actions.spacing,
          this
        )
    );
    this.tools.forEach((t, idx) => {
      if (idx > 0) t.rePosition(this.tools[idx - 1], this);
    });
    this.clickHandle = clickHandle;
  }

  render() {
    fill(235, 235, 80);
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    this.tools.forEach((t) => {
      t.renderGroup();
    });
  }

  drawActions() {
    this.actions.keys.forEach((key, keyIdx) => {
      fill(60);
      stroke(60);
      const actionPosX = this.pos.x + 10;
      const actionPosY = this.pos.y + 10 + keyIdx * this.actions.spacing;
      const actionSizeX = this.size.x - 20;
      const actionSizeY = 150;
      //   rect(actionPosX, actionPosY, actionSizeX, actionSizeY);
      this.actions.list[key].forEach((tool, toolIndex) => {
        fill(255);
        rectMode(CENTER);
        const rectCenterX = actionPosX + actionSizeX / 2;
        const rectCenterY =
          actionPosY + actionSizeY / 2 + (toolIndex * this.actions.spacing) / 2;
        rect(rectCenterX, rectCenterY, actionSizeX / 1.5, actionSizeX / 1.5);
        textSize(16);
        textAlign(CENTER, CENTER);
        fill(60);
        noStroke();
        text(
          tool.text,
          rectCenterX,
          rectCenterY,
          actionSizeX / 1.5,
          actionSizeX / 1.5
        );
        stroke(60);
        textAlign(LEFT, TOP);
        rectMode(CORNER);
      });
    });
  }
}
