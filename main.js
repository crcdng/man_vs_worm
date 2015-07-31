"use strict";

var game = new Phaser.Game(1024, 644, Phaser.AUTO, "", { preload: preload, create: create, update: update, render: render });

var blocks, borderrow = 8, columns = 16, dayLayer, floors, foods, groundLayer, holelist = [], holes, houselist = [], lengthDayNight = 10, man, map, moon, nightLayer, settings = {music: true, sound: true, debug: false}, sun, rows = 14, winner = null, worm, sound = {};

function addFloor() {
  var col, floor, row, targetrow;

  if (man.gamestate.hasItem) {
    man.gamestate.hasItem = false;
    col = man.gamestate.col;
    playSound(sound.buildblock);
    if ( houselist[col] ) { // house exists at player column
      row = houselist[col].row; // man.gamestate.row;
      targetrow = row-1;
      houselist[col].height++;
      _.each(houselist[col].tiles, function(tile) {
        tile.y = positionY(targetrow);
        targetrow--;
      });
      floor = floors.create(positionX(col), positionY(row), "floor");
      floor.scale.setTo(0.25, 0.25);
      floor.anchor.setTo(0, 1);
      houselist[col].tiles.unshift(floor); // insert floor at the beginning to grow the house
      checkWin(man, col);
    } else { // build a new house
      row = man.gamestate.row;
      floor = floors.create(positionX(col), positionY(row), "roof");
      floor.scale.setTo(0.25, 0.25);
      floor.anchor.setTo(0, 1);
      houselist[col] = { height: 1, row: row, tiles: [floor] }; // row: foot of the house
    }
  } else {
    // play sound unsuccessful
  }
}

function checkWin(potentialWinner, col) {
  if (winner !== null) return; // we have a winner already
  if (potentialWinner === man) {
    if (houselist[col]["height"] >= borderrow - 1) {
      winner = man;
      console.log("Man wins!");
    }
  } else if (potentialWinner === worm) {
    if (houselist[col]["row"] >= rows) {
      winner = worm;
      console.log("Worm wins!");
    }
  }
}

function collectBlock(player, block) {
  if (!player.gamestate.hasItem) {
    player.gamestate.hasItem = true;
    playSound(sound.pickupblock);
    block.kill();
  }
}

function collectFood(player, food) {
  if (!player.gamestate.hasItem) {
    player.gamestate.hasItem = true;
    playSound(sound.pickupfood);
    food.kill();
  }
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

  game.physics.startSystem(Phaser.Physics.ARCADE);

  map = game.add.tilemap("map");
  map.addTilesetImage("tiles_vierteln_0","ground");
  groundLayer = map.createLayer("ground");
  groundLayer.resizeWorld();
  nightLayer = map.createLayer("night");
  dayLayer = map.createLayer("day");
  map.setCollision(4, true, "ground");

  col = 3;
  row = 2;
  sun = game.add.sprite(positionX(col), positionY(row), "sun");
  game.physics.arcade.enable(sun);
  sun.scale.setTo(0.25, 0.25);
  sun.anchor.setTo(0, 1);
  sun.gamestate = { col: col, row: row, startCol: col, steps: 10 };

  col = 3;
  row = 2;
  moon = game.add.sprite(positionX(col), positionY(row), "moon");
  game.physics.arcade.enable(moon);
  moon.scale.setTo(0.25, 0.25);
  moon.anchor.setTo(0, 1);
  moon.gamestate = { col: col, row: row, startCol: col, steps: 10 };

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

  holes = game.add.group();
  holes.enableBody = true;
  floors = game.add.group();
  floors.enableBody = true;

  game.input.keyboard.onUpCallback = keyInput;
  game.sound.setDecodedCallback(_.values(sound), start, this); // start the game when sounds are decoded
}

function createBlocks(nthDday) {
  var block, i, numBlocks = function(n) { return (n >= 7 ? 9: [3, 5, 7, 7, 7, 9][n-1]); };

  if (blocks) blocks.destroy(); // new group for each day / night
  blocks = game.add.group();
  blocks.enableBody = true;
  for (i = 0; i < numBlocks(nthDday); i++) {
    block = blocks.create(positionX(Math.floor(columns * Math.random())), positionY(borderrow - 1), "block");
    block.scale.setTo(0.25, 0.25);
    block.anchor.setTo(0, 1);
    block.body.gravity.y = 6;
    block.body.bounce.y = 0.2;
  }
}

function createFoods(nthDday) { // "Foods" consistency over spelling
  var food, i, numFoods = function(n) { return (n >= 7 ? 9: [3, 5, 7, 7, 7, 9][n-1]); };

  if (foods) foods.destroy(); // new group for each day / night
  foods = game.add.group();
  foods.enableBody = true;
  for (i = 0; i < numFoods(nthDday); i++) {
    food = foods.create(positionX(Math.floor(columns * Math.random())), positionY(borderrow + 1 + Math.floor(Math.random() * (rows - borderrow))), "food");
    food.scale.setTo(0.25, 0.25);
    food.anchor.setTo(0, 1);
  }
}

function dayNight(n, isday) {
  var activeSound = (isday ? sound.day : sound.night), inactiveSound = (isday ? sound.night : sound.day), visible = (isday ? sun : moon), visibleLayer = (isday ? dayLayer : nightLayer), invisible = (isday ? moon : sun), invisibleLayer = (isday ? nightLayer : dayLayer);

  visible.visible = true;
  invisible.visible = false;
  visibleLayer.visible = true;
  invisibleLayer.visible = false;
  visible.gamestate.col = visible.gamestate.startCol;
  visible.x = positionX(visible.gamestate.col);
  game.time.events.repeat(lengthDayNight/visible.gamestate.steps * 1000, visible.gamestate.steps - 1, function() {
    visible.gamestate.col++;
    visible.x = positionX(visible.gamestate.col);
  }, this);
  createBlocks(n);
  createFoods(n);
  if (inactiveSound.isPlaying) inactiveSound.stop();
  playMusic(activeSound);
  game.time.events.add(lengthDayNight * 1000, dayNight, this, (isday ? n : ++n), !isday);
}

function digHole() {
  var col, hole, row;

  if (worm.gamestate.hasItem) {
    worm.gamestate.hasItem = false;
    col = worm.gamestate.col;
    row = worm.gamestate.row;
    playSound(sound.dighole);
    hole = holes.create(positionX(col), positionY(row), "hole");
    hole.scale.setTo(0.25, 0.25);
    hole.anchor.setTo(0, 1);
    if ( holelist[col] ) { // holes already exist in this column
      holelist[col]["amount"]++;
      holelist[col]["tiles"].push(hole);
    } else { // first hole in this column
      holelist[col] = { amount: 1, tiles: [hole] };
    }
    updateHouse(col);
  } else {
    // play sound unsuccessful
  }
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

function playMusic(music) {
  if (settings.music) music.loopFull();
}

function playSound(sound) {
  if (settings.sound) sound.play();
}

function positionX(column) {
  return column * (game.world.width / columns);
}

function positionY(row) {
  return row * (game.world.height / rows);
}

function preload() {

  game.load.tilemap("map", "/assets/tilemap.json", null, Phaser.Tilemap.TILED_JSON);
  game.load.image("block", "/assets/sprites/house_block copy.png");
  game.load.image("floor", "/assets/sprites/house.png");
  game.load.image("food", "/assets/sprites/ground_flower.png");
  game.load.image("ground", "/assets/spritesheets/tiles_vierteln_0.png");
  game.load.image("hole", "/assets/sprites/ground_hole.png");
  game.load.image("man", "/assets/sprites/hero01.png");
  game.load.image("moon", "/assets/sprites/sky_dark_moon.png");
  game.load.image("roof", "/assets/sprites/house_roof.png");
  game.load.image("sun", "/assets/sprites/sky_sun.png");
  game.load.image("worm", "/assets/sprites/worm01.png");

  game.load.audio("buildblock", ["/assets/snd/ManVsWorm-Manbuildup.ogg", "/assets/snd/ManVsWorm-Manbuildup.mp3"]);
  game.load.audio("day", ["/assets/snd/ManVsWorm-Day_30sec_128bpm.ogg", "/assets/snd/ManVsWorm-Day_30sec_128bpm.mp3"]);
  game.load.audio("dighole", ["/assets/snd/ManVsWorm-Wormdiggahole.ogg", "/assets/snd/ManVsWorm-Wormdiggahole.mp3"]);
  game.load.audio("manwins", ["/assets/snd/ManVsWorm-Manwin.ogg", "/assets/snd/ManVsWorm-Manwin.mp3"]);
  game.load.audio("movedown", ["/assets/snd/ManVsWorm-Housefallsdown.ogg", "/assets/snd/ManVsWorm-Housefallsdown.mp3"]);
  game.load.audio("night", ["assets/snd/ManVsWorm-Night_30sec_128bpm.ogg", "assets/snd/ManVsWorm-Night_30sec_128bpm.mp3"]);
  game.load.audio("pickupblock", ["/assets/snd/ManVsWorm-Manpickup.ogg", "/assets/snd/ManVsWorm-Manpickup.mp3"]);
  game.load.audio("pickupfood", ["/assets/snd/ManVsWorm-WormswallowsFood.ogg", "/assets/snd/ManVsWorm-WormswallowsFood.mp3"]);
  game.load.audio("wormwins", ["/assets/snd/ManVsWorm-Wormwin.ogg", "/assets/snd/ManVsWorm-Wormwin.mp3"]);
}

function render() {
  if (settings.debug) { // show body and sprite boundaries
    game.debug.body(man, "#ff00ff", false);
    game.debug.body(worm, "#ff00ff", false);
    blocks.forEachAlive(function(block) { game.debug.body(block, "#ff00ff", false); });
    floors.forEachAlive(function(floor) { game.debug.body(floor, "#ff00ff", false) });
    foods.forEachAlive(function(food) { game.debug.body(food, "#ff00ff", false) });
    holes.forEachAlive(function(hole) { game.debug.body(hole, "#ff00ff", false) });
    game.debug.spriteBounds(man, "#00ff0088", false);
    game.debug.spriteBounds(worm, "#00ff0088", false);
    blocks.forEachAlive(function(block) { game.debug.spriteBounds(block, "#00ff0088", false); });
    floors.forEachAlive(function(floor) { game.debug.spriteBounds(floor, "#00ff0088", false) });
    foods.forEachAlive(function(food) { game.debug.spriteBounds(food, "#00ff0088", false) });
    holes.forEachAlive(function(hole) { game.debug.spriteBounds(hole, "#00ff0088", false) });

    game.debug.inputInfo(32, 32);
  }
}

function start() {
  dayNight(1, true);
}

function update() {
  game.physics.arcade.collide(man, groundLayer);
  game.physics.arcade.collide(worm, groundLayer);
  game.physics.arcade.collide(blocks, groundLayer);
  game.physics.arcade.overlap(man, blocks, collectBlock, null, this);
  game.physics.arcade.overlap(worm, foods, collectFood, null, this);
}

function updateHouse(col) {
  var targetrow;

  if (houselist[col]) {
    playSound(sound.movedown);
    houselist[col]["row"]++;
    targetrow = houselist[col]["row"];
    _.each(houselist[col]["tiles"], function(tile) {
      tile.y = positionY(targetrow);
      targetrow--;
    });
    checkWin(worm, col);
  }
}
