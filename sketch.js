var tile_height, tile_width;

var item = {
  x: 0,
  y: 0,
  animations: [],
  sprite: null,
  lives: 0,
  init: function() {},
  update: function() {},
  draw: function() {}
  },
    man = Object.create(item, {}),
    worm = Object.create(item, {});

function preload() {
  man.animations.push(loadAnimation("assets/hero.png"));
}

function setup() {
  var ratio = Math.sqrt(3)/2;
  createCanvas(960, 640 * ratio);
  tile_width = 64;
  tile_height = tile_width *ratio;
  drawGrid();

  man = Object.create(item, {});
  man.sprite =  createSprite(width/2, height/2, tile_width, tile_height);
  man.sprite.scale = 0.25;
  man.sprite.addAnimation("standing", man.animations[0]);
}

function draw() {
  // draw stuff here
  drawSprites();
  ellipse(width/2, height/2, 5, 5);
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
