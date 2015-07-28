"use strict";

var game = new Phaser.Game(1024, 644, Phaser.AUTO, "", { preload: preload, create: create, update: update, render: render });

var blocks, floors, foods, groundlayer, holes, man, worm, sound = {};

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

function createBlocks(n) {
  var block, i;

  blocks = game.add.group();
  blocks.enableBody = true;
  for (i = 0; i < n; i++) {
    block = blocks.create(game.world.width * Math.random(), game.world.height/2 - 50, "block");
    block.scale.setTo(0.25, 0.25);
    block.body.gravity.y = 6;
    block.body.bounce.y = 0. + Math.random() * 0.2;
  }
}

function createFoods(n) { // "Foods" consistency over spelling
  var food, i;

  foods = game.add.group();
  foods.enableBody = true;
  for (i = 0; i < n; i++) {
    food = foods.create(game.world.width * Math.random(), game.world.height/2 * (1 + Math.random()), "food");
    food.scale.setTo(0.25, 0.25);
  }
}

function create() {

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

  man = game.add.sprite(32, game.world.height - 600, "man");
  game.physics.arcade.enable(man);
  man.scale.setTo(0.25, 0.25);
  man.body.bounce.y = 0.2;
  man.body.gravity.y = 300;
  man.body.collideWorldBounds = true;
  man.gamestate = { hasItem: false };

  worm = game.add.sprite(320, game.world.height - 200, "worm");
  worm.scale.setTo(0.25, 0.25);
  game.physics.arcade.enable(worm);
  worm.body.collideWorldBounds = true;
  worm.gamestate = { hasItem: false };

  createBlocks(5);
  createFoods(5);

  holes = game.add.group();
  holes.enableBody = true;

  floors = game.add.group();
  floors.enableBody = true;
}

function start() {
  sound.day.loopFull();
}

function collectBlock (player, block) {
  if (!player.gamestate.hasItem) {
    player.gamestate.hasItem = true;
    sound.pickupblock.play();
    block.kill();
  }
}

function collectFood (player, food) {
  if (!player.gamestate.hasItem) {
    player.gamestate.hasItem = true;
    sound.pickupfood.play();
    food.kill();
  }
}

function addFloor () {
  var floor;
  if (man.gamestate.hasItem) {
    man.gamestate.hasItem = false;
    floor = floors.create(man.body.position.x, man.body.position.y, "roof");
    floor.scale.setTo(0.25, 0.25);
  } else {
    // play sound unsuccessful
  }
}

function diggHole () {
  var hole;
  if (worm.gamestate.hasItem) {
    worm.gamestate.hasItem = false;
    sound.dighole.play();
    hole = holes.create(worm.body.position.x, worm.body.position.y, "hole");
    hole.scale.setTo(0.25, 0.25);
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

  man.body.velocity.x = 0;
  worm.body.velocity.x = 0;
  worm.body.velocity.y = 0;

  if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
    man.body.velocity.x = -150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
    man.body.velocity.x = 150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.E)) {
    addFloor();
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
    worm.body.velocity.x = -150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
    worm.body.velocity.x = 150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.I)) {
    worm.body.velocity.y = -150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
    worm.body.velocity.y = 150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.U)) {
    diggHole();
  }

}

function render() {

  game.debug.body(man);
  game.debug.body(worm);

}

