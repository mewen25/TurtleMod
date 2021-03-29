function turtle() {
  this.pos = Grid.cells[0][20].index = 20;

  this.render = () => {
    fill(100);
    rect(
      this.pos.x + cellSize.x / 4,
      this.pos.y + cellSize.y / 4,
      cellSize.x / 2,
      cellSize.y / 2
    );
  };
}
