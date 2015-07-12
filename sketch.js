"use strict";

var animations = {}, blocks = [], cols, flower, grounds, rows, sky = [], sounds = {}, tile_height, tile_width;

var block = {
  w: 0,
  h: 0,
  col: 0,
  row: 0,
  sprite: null,
  init: function() {
    this.w = tile_width;
    this.h = tile_height;
    this.col = floor(random(cols));
    this.row = floor(rows/2 - 2);
    this.sprite = createSprite(placeX(this.col), placeY(this.row), this.w, this.h);
    this.sprite.scale = 0.25;
    this.sprite.addAnimation("block", animations.block);
  }
};

var man = {
  col: 0,
  row: 0,
  w: 0,
  h: 0,
  lives: 0,
  sprite: null,
  init: function() {
    this.w = tile_width;
    this.h = tile_height;
    this.col = floor(cols/2);
    this.row = floor(rows/2-1);
    this.sprite = createSprite(placeX(this.col), placeY(this.row), this.w, this.h);
    this.sprite.scale = 0.25;
    this.sprite.addAnimation("man", animations.man);
  },
  update: function() {
    if(keyWentDown("w")) {} else if (keyWentDown("s")) {}
    if (keyWentDown("a")) {
      this.col = this.col - 1;
      if (this.col < 0) this.col = cols-1;
    } else if (keyWentDown("d")) {
      this.col = (this.col + 1) % cols;
    }
    this.sprite.position.x = placeX(this.col);
    this.sprite.position.y = placeY(this.row);
    },
  };

var worm = {
  col: 0,
  row: 0,
  w: 0,
  h: 0,
  lives: 0,
  sprite: null,
  init: function() {
    this.w = tile_width;
    this.h = tile_height;
    this.col = floor(cols/2 + 3);
    this.row = floor(rows/2 + 2);
    this.sprite = createSprite(placeX(this.col), placeY(this.row), this.w, this.h);
    this.sprite.scale = 0.25;
    this.sprite.addAnimation("defaultworm", animations.worm);
  },
  update: function() {
    if(keyWentDown("i")) {
      this.row = max(this.row - 1, floor(rows/2));
    } else if (keyWentDown("k")) {
      this.row = min(this.row + 1, rows - 1);
        }
    if (keyWentDown("j")) {
      this.col = max(this.col - 1, 0);
    } else if (keyWentDown("l")) {
      this.col = min((this.col + 1), cols-1);
    }
    this.sprite.position.x = placeX(this.col);
    this.sprite.position.y = placeY(this.row);
    },
  };

function preload() {
  sounds.day = loadSound("snd/ManVsWorm-Day_30sec_128bpm.mp3");
  sounds.night = loadSound("snd/ManVsWorm-Night_30sec_128bpm.mp3");
  sounds.manwins = loadSound("snd/ManVsWorm-Manwin.mp3");
  sounds.wormwins = loadSound("snd/ManVsWorm-Wormwin.mp3");
  sounds.pickupfood = loadSound("snd/ManVsWorm-WormswallowsFood.mp3");
  sounds.dighole = loadSound("snd/ManVsWorm-Wormdiggahole.mp3");
  sounds.pickupblock = loadSound("snd/ManVsWorm-Manpickup.mp3");
  sounds.buildblock = loadSound("snd/ManVsWorm-Manbuildup.mp3");
  sounds.movedown = loadSound("snd/ManVsWorm-Housefallsdown.mp3");

  animations.man = loadAnimation("img/hero.png");
  animations.worm = loadAnimation("img/worm.png");
  animations.block = loadAnimation("img/house_block.png");
  animations.ground = loadAnimation("img/ground.png");
  animations.groundTop = loadAnimation("img/ground_top.png");
  animations.plant = loadAnimation("img/ground_flower.png");
}

function setup() {
  var c, ground, i, r, ratio = sqrt(3)/2, startRow;

  createCanvas(960, 640 * ratio);
  tile_width = 64;
  tile_height = tile_width *ratio;
  cols = floor(width / tile_width);
  rows = floor(height / tile_height);
  console.log("cols, rows: " + cols +", "+ rows); // DEBUG

  for (i = 0; i < cols; i = i + 1) {
    blocks[i] = 0;
  }

  grounds = new Group();

  startRow = floor(rows/2-1);
  for(c = 0; c < cols; c = c + 1) {
    for(r = floor(rows/2-1); r < rows; r = r + 1) {
      ground = createSprite(placeX(c), placeY(r));
      if (r === startRow) {
        ground.addAnimation("ground", animations.groundTop);
      } else {
        ground.addAnimation("ground", animations.ground); }
      ground.scale = 0.5;
      grounds.add(ground);
    }
  }

  var fx = floor(random(startRow, rows)) // DEBUG
  var fy = floor(random(0, cols)) // DEBUG
  console.log("flower: " + fx +", "+ fy);
  console.log("startRow: " + startRow);

  flower = createSprite(
    placeX(fx),
    placeY(fy)
  );
  flower.scale = 0.5;
  flower.addAnimation("flower", animations.plant);

  man.init();
  worm.init();

  nextDay(1, 5);
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

function placeX(column) {
  return (column/cols) * width + tile_width/2;
}

function placeY(row) {
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

function addBlock() {
  var b = Object.create(block);
  b.init();
}

function nextDay(day, timespanSecs) {
  setTimeout(function () {
    if (sounds.day.isPlaying()) sounds.day.stop();
    nextNight(day, timespanSecs);
  }, timespanSecs * 1000);
  // sounds.day.play();
  addBlock();
}

function nextNight(day, timespanSecs) {
  setTimeout(function () {
    if (sounds.night.isPlaying()) sounds.night.stop();
    nextDay(day + 1, timespanSecs);
  }, timespanSecs * 1000);
  // sounds.night.play();
}

