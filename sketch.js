var cols, rows, tile_height, tile_width;

var man = {
  col: 0,
  row: 0,
  w: 0,
  h: 0,
  lives: 0,
  sprite: null,
  animations: [],
  init: function() {
    this.w = tile_width;
    this.h = tile_height;
    this.col = Math.floor(cols/2);
    this.row = Math.floor(rows/2-1);
    this.sprite = createSprite(positionX(this.col), positionY(this.row), this.w, this.h);
    this.sprite.scale = 0.25;
    this.sprite.addAnimation("defaultman", this.animations[0]);
  },
  update: function() {
    if(keyWentDown("w")) {} else if (keyWentDown("s")) {}
    if (keyWentDown("a")) {
      this.col = this.col - 1;
      if (this.col < 0) this.col = cols-1;
    } else if (keyWentDown("d")) {
      this.col = (this.col + 1) % cols;
    }
    console.log(this.col)
    this.sprite.position.x = positionX(this.col);
    this.sprite.position.y = positionY(this.row);
    },
  };

var worm = {
  col: 0,
  row: 0,
  w: 0,
  h: 0,
  lives: 0,
  sprite: null,
  animations: [],
  init: function() {
    this.w = tile_width;
    this.h = tile_height;
    this.col = Math.floor(cols/2 + 3);
    this.row = Math.floor(rows/2 + 2);
    this.sprite = createSprite(positionX(this.col), positionY(this.row), this.w, this.h);
    this.sprite.scale = 0.25;
    this.sprite.addAnimation("defaultworm", this.animations[0]);
  },
  update: function() {
    if(keyWentDown("i")) {
      this.row = Math.max(this.row - 1, Math.floor(rows/2));
    } else if (keyWentDown("k")) {
      this.row = Math.min(this.row + 1, rows - 1);
        }
    if (keyWentDown("j")) {
      this.col = Math.max(this.col - 1, 0);
    } else if (keyWentDown("l")) {
      this.col = Math.min((this.col + 1), cols-1);
    }
    console.log(this.col)
    this.sprite.position.x = positionX(this.col);
    this.sprite.position.y = positionY(this.row);
    },
  };

function preload() {
  man.animations.push(loadAnimation("assets/hero.png"));
  worm.animations.push(loadAnimation("assets/worm.png"));
}

function setup() {
  var ratio = Math.sqrt(3)/2;
  createCanvas(960, 640 * ratio);
  tile_width = 64;
  tile_height = tile_width *ratio;
  cols = Math.floor(width / tile_width);
  rows = Math.floor(height / tile_height);
  console.log(cols +","+ rows);
  man.init();
  worm.init()
}

function draw() {
  background(255,255,255);
  drawGrid(); // DEBUG

  man.update();
  worm.update();

  // draw here
  drawSprites();
  ellipse(width/2, height/2, 5, 5); // DEBUG
}

function positionX(column) {
  return (column/cols) * width + tile_width/2;
}

function positionY(row) {
  return (row/rows) * height;
}

function drawGrid() {
  var n;
  for (n = 0;  n < width; n = n + tile_width) {
    line(n, 0, n, height);
  }
  for (n = 0;  n < height; n = n + tile_height) {
    line(0, n, width, n);
  }
}
