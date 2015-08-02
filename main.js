/*Michael Straeubig, i3games.de*/

/*This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

"use strict";

var game = new Phaser.Game(1024, 644, Phaser.AUTO, "", { preload: preload, init: init, create: create, update: update, render: render });

var blocks, borderrow = 8, columns = 16, dayLayer, floors, foods, groundLayer, holelist = [], holes, houselist = [], lengthDayNight = 10, man, map, moon, nightLayer, settings = {music: false, sound: true, debug: false}, rows = 14, sound = {}, sun, theDroppedBlock, winner = null, worm;

function addFloor() {
  var col, floor, row, targetrow;

  if (man.gamestate.hasItem) {
    man.gamestate.hasItem = false;
    col = man.gamestate.col;
    playSound(sound.buildblock);
    if (houselist[col]) { // house exists at player column
      row = houselist[col].row; // man.gamestate.row;
      targetrow = row - 1;
      houselist[col].height += 1;
      _.each(houselist[col].tiles, function(tile) {
        game.add.tween(tile).to({ y: positionY(targetrow) }, 1000, "Bounce.easeOut", true);
        targetrow -= 1;
      });
      floor = floors.create(positionX(col), positionY(row), "floor");
      floor.scale.setTo(0.25, 0.25);
      floor.anchor.setTo(0, 1);
      houselist[col].tiles.unshift(floor); // insert floor at the beginning to grow the house
      checkWin(man, col);
    } else { // build a new house
      row = man.gamestate.row;
      floor = floors.create(positionX(col), positionY(row+1), "roof");
      game.add.tween(floor).to({ y: positionY(row) }, 1000, "Bounce.easeOut", true);
      floor.scale.setTo(0.25, 0.25);
      floor.anchor.setTo(0, 1);
      houselist[col] = { height: 1, row: row, tiles: [floor] }; // row: foot of the house
    }
  } else {
    // play sound unsuccessful
  }
}

function blockHitsWorm() {
  theDroppedBlock.kill();
  // TODO play sound
  game.add.tween(worm).to({ y: "-30" }, 100, "Sine.easeOut", true, 0, 0, true);
  if (winner !== null) return; // we have a winner already
  winner = man;
  console.log("Man wins!");
}

function checkWin(potentialWinner, col) {
  if (winner !== null) return; // we have a winner already
  if (potentialWinner === man) {
    if (houselist[col].row - houselist[col].height <= 0) {
      winner = man;
      console.log("Man wins!");
    }
  } else if (potentialWinner === worm) {
    if (houselist[col].row >= rows) {
      winner = worm;
      console.log("Worm wins!");
    }
  }
}

function collapseHouse(col) {
  var targetrow;

  playSound(sound.movedown);
  houselist[col]["row"]++;
  targetrow = houselist[col]["row"];
  _.each(houselist[col]["tiles"], function(tile) {
    game.add.tween(tile).to({ y: positionY(targetrow) }, 1000, "Bounce.easeOut", true);
    targetrow--;
  });
  checkWin(worm, col);
}

function collectBlock(player, block) {
  if (!player.gamestate.hasItem) {
    player.gamestate.hasItem = true;
    playSound(sound.pickupblock);
    game.add.tween(player.scale).to({ x: "+0.15", y: "+0.15",}, 100, "Sine.easeInOut", true, 0, 0, true);
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
  map.addTilesetImage("tiles_vierteln_0", "ground");
  groundLayer = map.createLayer("ground");
  groundLayer.resizeWorld();
  nightLayer = map.createLayer("night");
  dayLayer = map.createLayer("day");
  map.setCollision(4, true, "ground");

  var gamestate = {
    col: 3,
    row: 2,
    startCol: 3,
    steps: 10
  };

  sun = game.add.sprite(positionX(3), positionY(2), "sun");
  game.physics.arcade.enable(sun);
  sun.scale.setTo(0.25, 0.25);
  sun.anchor.setTo(0, 1);
  sun.gamestate = _.extend({}, gamestate);

  moon = game.add.sprite(positionX(3), positionY(2), "moon");
  game.physics.arcade.enable(moon);
  moon.scale.setTo(0.25, 0.25);
  moon.anchor.setTo(0, 1);
  moon.gamestate = _.extend({}, gamestate);

  holes = game.add.group();
  holes.enableBody = true;
  floors = game.add.group();
  floors.enableBody = true;
  foods = game.add.group();
  blocks = game.add.group();

  col = 4;
  row = 7;
  man = game.add.sprite(positionX(col), positionY(row), "man");
  game.physics.arcade.enable(man);
  man.alpha = 0;
  man.scale.setTo(0.1, 0.1);
  man.anchor.setTo(0, 1);
  man.body.bounce.y = 0.2;
  man.body.gravity.y = 300;
  man.body.collideWorldBounds = true;
  game.add.tween(man).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
  game.add.tween(man.scale).to({ x: 0.25, y: 0.25 }, 1000, "Bounce.easeInOut", true);
  man.gamestate = { col: col, row: row, hasItem: false };

  col = 11;
  row = 11;
  worm = game.add.sprite(positionX(col), positionY(row), "worm");
  game.physics.arcade.enable(worm);
  worm.scale.setTo(0.1, 0.1);
  worm.anchor.setTo(0, 1);
  worm.body.collideWorldBounds = true;
  worm.alpha = 0;
  game.add.tween(worm).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
  game.add.tween(worm.scale).to({ x: 0.25, y: 0.25 }, 1000, "Bounce.easeInOut", true);
  worm.gamestate = { col: col, row: row, hasItem: false };

  game.input.keyboard.onUpCallback = keyInput;
  game.sound.setDecodedCallback(_.values(sound), start, this); // start the game when sounds are decoded
}

function createBlocks(nthDday) {
  var block, i, numBlocks = function(n) { return (n >= 7 ? 9: [3, 5, 7, 7, 7, 9][n-1]); };

  if (blocks) blocks.removeAll(true); // new group for each day / night
  blocks.enableBody = true;
  for (i = 0; i < numBlocks(nthDday); i++) {
    block = blocks.create(positionX(Math.floor(columns * Math.random())), positionY(borderrow - 2), "block");
    block.scale.setTo(0.25, 0.25);
    block.anchor.setTo(0, 1);
    block.body.gravity.y = 600;
    block.body.bounce.y = 0.4;
    block.alpha = 0;
    game.add.tween(block).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
  }
}

function createFoods(nthDday) { // "Foods" consistency over spelling
  var food, i, numFoods = function(n) { return (n >= 7 ? 9 : [3, 5, 7, 7, 7, 9][n-1]); };

  if (foods) foods.removeAll(true); // new group for each day / night
  foods.enableBody = true;
  for (i = 0; i < numFoods(nthDday); i = i + 1) {
    food = foods.create(positionX(Math.floor(columns * Math.random())), positionY(borderrow + 1 + Math.floor(Math.random() * (rows - borderrow))), "food");
    food.scale.setTo(0.25, 0.25);
    food.anchor.setTo(0, 1);
    food.alpha = 0;
    game.add.tween(food).to({ alpha: 1 }, 1500, "Sine.easeInOut", true);

  }
}

function dayNight(n, isDay) {
  var activeMusic, inactiveMusic, invisibleElement, invisibleLayer, n, stepTime, tween, visibleElement, visibleLayer;

  if (isDay) {
    visibleElement = sun;
    invisibleElement = moon;
    visibleLayer = dayLayer;
    invisibleLayer = nightLayer;
    activeMusic = sound.day;
    inactiveMusic = sound.night;
    worm.gamestate.cankill = false;
    man.gamestate.candrop = true;
  } else { // night
    visibleElement = moon;
    invisibleElement = sun;
    visibleLayer = nightLayer;
    invisibleLayer = dayLayer;
    activeMusic = sound.night;
    inactiveMusic = sound.day;
    worm.gamestate.cankill = true;
    man.gamestate.candrop = false;
  }

  visibleElement.visible = true;
  invisibleElement.visible = false;
  visibleLayer.visible = true;
  visibleLayer.alpha = 0;
  game.add.tween(visibleLayer).to({ alpha: 1 }, 2500, "Sine.easeInOut", true);
  invisibleLayer.visible = false;
  visibleElement.gamestate.col = visibleElement.gamestate.startCol;

  visibleElement.alpha = 0;
  visibleElement.x = positionX(visibleElement.gamestate.col);
  stepTime = (lengthDayNight/visibleElement.gamestate.steps) * 1000;
  tween = game.add.tween(visibleElement);
  tween.to({ alpha: 1 }, 1000, "Sine.easeInOut");
  for (n = 0; n < visibleElement.gamestate.steps; n = n + 1) tween.to({ x: positionX(++visibleElement.gamestate.col) }, stepTime, "Circ.easeInOut");
  tween.to({ alpha: 0 }, 1000, "Sine.easeInOut");
  tween.start();

  createBlocks(n);
  createFoods(n);
  if (inactiveMusic.isPlaying) inactiveMusic.stop();
  playMusic(activeMusic);
  game.time.events.add(lengthDayNight * 1000 + 2000, dayNight, this, (isDay ? n : ++n), !isDay);
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
    hole.alpha = 0;
    game.add.tween(hole).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
    if ( holelist[col] ) { // holes already exist in this column
      holelist[col]["amount"]++;
      holelist[col]["tiles"].push(hole);
    } else { // first hole in this column
      holelist[col] = { amount: 1, tiles: [hole] };
    }
    if (houselist[col]) collapseHouse(col);
  } else {
    // play sound unsuccessful
  }
}

function dropBlock() {
  var col, row;

  if (man.gamestate.hasItem && man.gamestate.candrop) {
    man.gamestate.hasItem = false;
    col = man.gamestate.col;
    row = man.gamestate.row;
    // playSound();
    theDroppedBlock = game.add.sprite(positionX(col), positionY(row), "block");
    game.physics.arcade.enable(theDroppedBlock);
    theDroppedBlock.scale.setTo(0.25, 0.25);
    theDroppedBlock.anchor.setTo(0, 1);
    theDroppedBlock.body.collideWorldBounds = true;
    theDroppedBlock.body.bounce.y = 0.2;
    theDroppedBlock.body.gravity.y = 300;
  }
}

function init() {
  game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
  game.scale.pageAlignVertically = true;
  game.scale.pageAlignHorizontally = true;
}

function keyInput(event) {
  var key = event.keyCode;

  // man
  if (key === Phaser.Keyboard.A) { // move left
    man.gamestate.col = man.gamestate.col - 1;
    if (man.gamestate.col < 0) man.gamestate.col = columns - 1;
    man.x = positionX(man.gamestate.col);
  } else if (key === Phaser.Keyboard.D) { // move right
    man.gamestate.col = (man.gamestate.col + 1) % columns;
    man.x = positionX(man.gamestate.col);
  } else if (key === Phaser.Keyboard.W) { // jump
    man.body.velocity.y = -150;
  } else if (key === Phaser.Keyboard.E) { // build
    addFloor();
  } else if (key === Phaser.Keyboard.S) { // drop stone
    dropBlock();
  // worm
  } else if (key === Phaser.Keyboard.J) { // move left
    worm.gamestate.col = Math.max(worm.gamestate.col - 1, 0);
    worm.x = positionX(worm.gamestate.col);
  } else if (key === Phaser.Keyboard.L) { // move right
    worm.gamestate.col = Math.min(worm.gamestate.col + 1, columns - 1);
    worm.x = positionX(worm.gamestate.col);
  } else if (key === Phaser.Keyboard.I) { // move up
    worm.gamestate.row = Math.max((worm.gamestate.row - 1), borderrow);
    worm.y = positionY(worm.gamestate.row);
  } else if (key === Phaser.Keyboard.K) { // move down
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
  game.load.tilemap("map", "assets/tilemap.json", null, Phaser.Tilemap.TILED_JSON);
  game.load.image("block", "assets/sprites/house_block copy.png");
  game.load.image("floor", "assets/sprites/house.png");
  game.load.image("food", "assets/sprites/ground_flower.png");
  game.load.image("ground", "assets/spritesheets/tiles_vierteln_0.png");
  game.load.image("hole", "assets/sprites/ground_hole.png");
  game.load.image("man", "assets/sprites/hero01.png");
  game.load.image("moon", "assets/sprites/sky_dark_moon.png");
  game.load.image("roof", "assets/sprites/house_roof.png");
  game.load.image("sun", "assets/sprites/sky_sun.png");
  game.load.image("worm", "assets/sprites/worm01.png");
  game.load.audio("buildblock", ["assets/snd/ManVsWorm-Manbuildup.ogg", "assets/snd/ManVsWorm-Manbuildup.mp3"]);
  game.load.audio("day", ["assets/snd/ManVsWorm-Day_30sec_128bpm.ogg", "assets/snd/ManVsWorm-Day_30sec_128bpm.mp3"]);
  game.load.audio("dighole", ["assets/snd/ManVsWorm-Wormdiggahole.ogg", "assets/snd/ManVsWorm-Wormdiggahole.mp3"]);
  game.load.audio("manwins", ["assets/snd/ManVsWorm-Manwin.ogg", "assets/snd/ManVsWorm-Manwin.mp3"]);
  game.load.audio("movedown", ["assets/snd/ManVsWorm-Housefallsdown.ogg", "assets/snd/ManVsWorm-Housefallsdown.mp3"]);
  game.load.audio("night", ["assets/snd/ManVsWorm-Night_30sec_128bpm.ogg", "assets/snd/ManVsWorm-Night_30sec_128bpm.mp3"]);
  game.load.audio("pickupblock", ["assets/snd/ManVsWorm-Manpickup.ogg", "assets/snd/ManVsWorm-Manpickup.mp3"]);
  game.load.audio("pickupfood", ["assets/snd/ManVsWorm-WormswallowsFood.ogg", "assets/snd/ManVsWorm-WormswallowsFood.mp3"]);
  game.load.audio("wormwins", ["assets/snd/ManVsWorm-Wormwin.ogg", "assets/snd/ManVsWorm-Wormwin.mp3"]);
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
  game.physics.arcade.overlap(man, worm, wormBitesMan, null, this);
  game.physics.arcade.overlap(theDroppedBlock, worm, blockHitsWorm, null, this);
}

function wormBitesMan() {
  if (worm.gamestate.cankill) {
    if (winner !== null) return; // we have a winner already
    // TODO play sound
    game.add.tween(man).to({ y: "-30" }, 100, "Elastic.easeInOut", true, 0, 0, true);
    winner = worm;
    console.log("Worm wins!");
  }
}
