"use strict";

var game = new Phaser.Game(1024, 644, Phaser.AUTO, "", { preload: preload, create: create, update: update, render: render });

var blocks, borderrow = 8, columns = 16, floors, foods, groundlayer, holes, houses = [], man, rows = 14, worm, sound = {};

function preload() {

  game.load.tilemap("map", "/assets/tilemap.json", null, Phaser.Tilemap.TILED_JSON);
  game.load.image("ground", "/assets/spritesheets/tiles_vierteln_0.png");
  game.load.image("man", "/assets/sprites/hero01.png");
  game.load.image("worm", "/assets/sprites/worm01.png");
  game.load.image("block", "/assets/sprites/house_block copy.png");
  game.load.image("food", "/assets/sprites/ground_flower.png");
  game.load.image("hole", "/assets/sprites/ground_hole.png");
  game.load.image("floor", "/assets/sprites/house.png");
  game.load.image("roof", "/assets/sprites/house_roof.png");

  game.load.audio("day", ["/assets/snd/ManVsWorm-Day_30sec_128bpm.ogg", "/assets/snd/ManVsWorm-Day_30sec_128bpm.mp3"]);
  game.load.audio("night", ["assets/snd/ManVsWorm-Night_30sec_128bpm.ogg", "assets/snd/ManVsWorm-Night_30sec_128bpm.mp3"]);
  game.load.audio("manwins", ["/assets/snd/ManVsWorm-Manwin.ogg", "/assets/snd/ManVsWorm-Manwin.mp3"]);
  game.load.audio("wormwins", ["/assets/snd/ManVsWorm-Wormwin.ogg", "/assets/snd/ManVsWorm-Wormwin.mp3"]);
  game.load.audio("pickupfood", ["/assets/snd/ManVsWorm-WormswallowsFood.ogg", "/assets/snd/ManVsWorm-WormswallowsFood.mp3"]);
  game.load.audio("dighole", ["/assets/snd/ManVsWorm-Wormdiggahole.ogg", "/assets/snd/ManVsWorm-Wormdiggahole.mp3"]);
  game.load.audio("pickupblock", ["/assets/snd/ManVsWorm-Manpickup.ogg", "/assets/snd/ManVsWorm-Manpickup.mp3"]);
  game.load.audio("buildblock", ["/assets/snd/ManVsWorm-Manbuildup.ogg", "/assets/snd/ManVsWorm-Manbuildup.mp3"]);
  game.load.audio("movedown", ["/assets/snd/ManVsWorm-Housefallsdown.ogg", "/assets/snd/ManVsWorm-Housefallsdown.mp3"]);

}

var block; // TODO temporary for debug.body
function createBlocks(n) {
  var i;

  blocks = game.add.group();
  blocks.enableBody = true;
  for (i = 0; i < n; i++) {
    block = blocks.create(positionX(Math.floor(columns * Math.random())), positionY(borderrow - 1), "block");
    block.scale.setTo(0.25, 0.25);
    block.anchor.setTo(0, 1);
    block.body.gravity.y = 6;
    block.body.bounce.y = 0. + Math.random() * 0.2;
  }
}

var food; // TODO temporary for debug.body
function createFoods(n) { // "Foods" consistency over spelling
  var i;

  foods = game.add.group();
  foods.enableBody = true;
  for (i = 0; i < n; i++) {
    food = foods.create(positionX(Math.floor(columns * Math.random())), positionY(borderrow + 1 +  Math.floor(Math.random() * (rows - borderrow))), "food");
    food.scale.setTo(0.25, 0.25);
    food.anchor.setTo(0, 1);

  }
}

function positionX(column) {
  return column * (game.world.width / columns);
}

function positionY(row) {
  return row * (game.world.height / rows);
}

function keyInput(event) {
  var key = event.keyCode;

  // man
  if (key === Phaser.Keyboard.A) {
    man.gamestate.col = man.gamestate.col - 1;
    if (man.gamestate.col < 0) man.gamestate.col = columns - 1;
    man.x = positionX(man.gamestate.col);
  } else if (key === Phaser.Keyboard.D) {
    man.gamestate.col = (man.gamestate.col + 1) % columns;
    man.x = positionX(man.gamestate.col);
  } else if (key === Phaser.Keyboard.E) {
    addFloor();
  // worm
  } else if (key === Phaser.Keyboard.J) {
    worm.gamestate.col = Math.max(worm.gamestate.col - 1, 0);
    worm.x = positionX(worm.gamestate.col);
  } else if (key === Phaser.Keyboard.L) {
    worm.gamestate.col = Math.min(worm.gamestate.col + 1, columns - 1);
    worm.x = positionX(worm.gamestate.col);
  } else if (key === Phaser.Keyboard.I) {
    worm.gamestate.row = Math.max((worm.gamestate.row - 1), borderrow);
    worm.y = positionY(worm.gamestate.row);
  } else if (key === Phaser.Keyboard.K) {
    worm.gamestate.row = Math.min(worm.gamestate.row + 1, rows);
    worm.y = positionY(worm.gamestate.row);
  } else if (key === Phaser.Keyboard.U) {
    digHole();
  }
  // other
}

function create() {
  var col, row;

  sound.day = game.add.audio("day");
  sound.night = game.add.audio("night");
  sound.manwins = game.add.audio("manwins");
  sound.wormwins = game.add.audio("wormwins");
  sound.pickupfood = game.add.audio("pickupfood");
  sound.dighole = game.add.audio("dighole");
  sound.pickupblock = game.add.audio("pickupblock");
  sound.buildblock = game.add.audio("buildblock");
  sound.movedown = game.add.audio("movedown");
  game.sound.setDecodedCallback(_.values(sound), start, this);

  game.physics.startSystem(Phaser.Physics.ARCADE);

  var map = game.add.tilemap("map");
  map.addTilesetImage("tiles_vierteln_0","ground");
  groundlayer = map.createLayer("ground");
  groundlayer.resizeWorld();
  map.setCollision(4, true, "ground");

  col = 4;
  row = 7;
  man = game.add.sprite(positionX(col), positionY(row), "man");
  game.physics.arcade.enable(man);
  man.scale.setTo(0.25, 0.25);
  man.anchor.setTo(0, 1);
  man.body.bounce.y = 0.2;
  man.body.gravity.y = 300;
  man.body.collideWorldBounds = true;
  man.gamestate = { col: col, row: row, hasItem: false };

  col = 11;
  row = 11;
  worm = game.add.sprite(positionX(col), positionY(row), "worm");
  game.physics.arcade.enable(worm);
  worm.scale.setTo(0.25, 0.25);
  worm.anchor.setTo(0, 1);
  worm.body.collideWorldBounds = true;
  worm.gamestate = { col: col, row: row, hasItem: false };

  createBlocks(5);
  createFoods(5);

  holes = game.add.group();
  holes.enableBody = true;

  floors = game.add.group();
  floors.enableBody = true;

  game.input.keyboard.onUpCallback = keyInput;
}

function start() {
  sound.day.loopFull();
}

function collectBlock(player, block) {
  if (!player.gamestate.hasItem) {
    player.gamestate.hasItem = true;
    sound.pickupblock.play();
    block.kill();
  }
}

function collectFood(player, food) {
  if (!player.gamestate.hasItem) {
    player.gamestate.hasItem = true;
    sound.pickupfood.play();
    food.kill();
  }
}

var floor; // TODO temporary for debug.body
function addFloor() {
  var col, floor, house, row, targetrow;

  if (man.gamestate.hasItem) {
    man.gamestate.hasItem = false;
    col = man.gamestate.col;
    row = man.gamestate.row;
    targetrow = row-1;
    house = houses[col];
    sound.buildblock.play();
    if ( houses[col] ) { // house exists at player column
      console.log("a");
      houses[col]["height"]++;
      _.each(houses[col]["tiles"], function(tile) {
        tile.y = positionY(targetrow);
        targetrow--;
      });
      floor = floors.create(positionX(col), positionY(row), "floor");
      floor.scale.setTo(0.25, 0.25);
      floor.anchor.setTo(0, 1);
      houses[col]["tiles"].unshift(floor);
    } else { // build a new one
      floor = floors.create(positionX(col), positionY(row), "roof");
      floor.scale.setTo(0.25, 0.25);
      floor.anchor.setTo(0, 1);
      houses[col] = { height: 1, row: row, tiles: [floor] };
    }
  } else {
    // play sound unsuccessful
  }
}

var hole; // TODO temporary for debug.body
function digHole() {
  if (worm.gamestate.hasItem) {
    worm.gamestate.hasItem = false;
    sound.dighole.play();
    hole = holes.create(positionX(worm.gamestate.col), positionY(worm.gamestate.row), "hole");
    hole.scale.setTo(0.25, 0.25);
    hole.anchor.setTo(0, 1);
  } else {
    // play sound unsuccessful
  }
}

function update() {
  game.physics.arcade.collide(man, groundlayer);
  game.physics.arcade.collide(worm, groundlayer);
  game.physics.arcade.collide(blocks, groundlayer);
  game.physics.arcade.overlap(man, blocks, collectBlock, null, this);
  game.physics.arcade.overlap(worm, foods, collectFood, null, this);
}

function render() {
  game.debug.body(man);
  if (block) game.debug.body(block);
  if (floor) game.debug.body(floor);
  game.debug.body(worm);
  if (food) game.debug.body(food);
  if (hole) game.debug.body(hole);
}

