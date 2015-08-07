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

var ManVsWorm  = ManVsWorm || {};

ManVsWorm.Game = {
  borderrow: 8,
  columns: 16,
  groups: {blocks: null, floors: null, foods: null, holes: null},
  holelist: [],
  houselist: [],
  isDay: null,
  layers: {dayLayer: null, groundLayer: null, nightLayer: null},
  lengthDayNight: 10,
  man: null,
  map: null,
  moon: null,
  rows: 14,
  settings: {music: true, sound: true, debug: false},
  sounds: {},
  sun: null,
  theDroppedBlock: null,
  winner: null,
  worm: null,

  addFloor: function() {
    var col, floor, house, row, targetrow;

    if (this.man.props.hasItem) {
      this.man.props.hasItem = false;
      col = this.man.props.col;
      house = this.houselist[col];
      this.playSound(this.sounds.buildblock);
      if (house) { // house exists at player column
        row = house.row; // this.man.props.row;
        targetrow = row - 1;
        house.height += 1;
        _.each(house.tiles, function(tile) {
          this.add.tween(tile).to({ y: this.positionY(targetrow) }, 1000, "Bounce.easeOut", true);
          targetrow -= 1;
        }, this);
        floor = this.groups.floors.create(this.positionX(col), this.positionY(row), "floor");
        floor.scale.setTo(0.25, 0.25);
        floor.anchor.setTo(0, 1);
        house.tiles.unshift(floor); // insert floor at the beginning to grow the house
        if (house.row - house.height <= 0) this.score(this.man);
      } else { // build a new house
        row = this.man.props.row;
        floor = this.groups.floors.create(this.positionX(col), this.positionY(row+1), "roof");
        this.add.tween(floor).to({ y: this.positionY(row) }, 1000, "Bounce.easeOut", true);
        floor.scale.setTo(0.25, 0.25);
        floor.anchor.setTo(0, 1);
        this.houselist[col] = { height: 1, row: row, tiles: [floor] }; // row: foot of the house
      }
    } else {
      // play sound unsuccessful
    }
  },

  blockHitsWorm: function() {
    this.theDroppedBlock.kill();
    // TODO play sound
    if (this.winner !== null) return; // we have a winner already
    this.add.tween(this.worm).to({ y: "-30" }, 100, "Sine.easeOut", true, 0, 0, true);
    this.score(this.man);
  },

  collapseHouse: function(col) {
    var house = this.houselist[col], targetrow;

    this.playSound(this.sounds.movedown);
    house.row += 1;
    targetrow = house.row;
    _.each(house.tiles, function(tile) {
      this.add.tween(tile).to({ y: this.positionY(targetrow) }, 1000, "Bounce.easeOut", true);
      targetrow -= 1;
    }, this);
    if(house.row >= this.rows) this.score(this.worm);
  },

  collectBlock: function(player, block) {
    if (!player.props.hasItem) {
      player.props.hasItem = true;
      this.playSound(this.sounds.pickupblock);
      this.add.tween(player.scale).to({ x: "+0.15", y: "+0.15",}, 100, "Sine.easeInOut", true, 0, 0, true);
      block.kill();
    }
  },

  collectFood: function(player, food) {
    if (!player.props.hasItem) {
      player.props.hasItem = true;
      this.playSound(this.sounds.pickupfood);
      food.kill();
    }
  },

  create: function() {
    var col, row;

    this.sounds.day = this.add.audio("day");
    this.sounds.night = this.add.audio("night");
    this.sounds.manwins = this.add.audio("manwins");
    this.sounds.wormwins = this.add.audio("wormwins");
    this.sounds.pickupfood = this.add.audio("pickupfood");
    this.sounds.dighole = this.add.audio("dighole");
    this.sounds.pickupblock = this.add.audio("pickupblock");
    this.sounds.buildblock = this.add.audio("buildblock");
    this.sounds.movedown = this.add.audio("movedown");

    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.map = this.add.tilemap("map");
    this.map.addTilesetImage("tiles_quarter_0", "ground");
    this.layers.groundLayer = this.map.createLayer("ground");
    this.layers.groundLayer.resizeWorld();
    this.layers.nightLayer = this.map.createLayer("night");
    this.layers.dayLayer = this.map.createLayer("day");
    this.map.setCollision(4, true, "ground");

    var props = {
      col: 3,
      row: 2,
      startCol: 3,
      steps: 10
    };

    this.sun = this.add.sprite(this.positionX(3), this.positionY(2), "sun");
    this.physics.arcade.enable(this.sun);
    this.sun.scale.setTo(0.25, 0.25);
    this.sun.anchor.setTo(0, 1);
    this.sun.props = _.extend({}, props);

    this.moon = this.add.sprite(this.positionX(3), this.positionY(2), "moon");
    this.physics.arcade.enable(this.moon);
    this.moon.scale.setTo(0.25, 0.25);
    this.moon.anchor.setTo(0, 1);
    this.moon.props = _.extend({}, props);

    this.groups.holes = this.add.group();
    this.groups.holes.enableBody = true;
    this.groups.floors = this.add.group();
    this.groups.floors.enableBody = true;
    this.groups.foods = this.add.group();
    this.groups.blocks = this.add.group();

    col = 4;
    row = 7;
    this.man = this.add.sprite(this.positionX(col), this.positionY(row), "man");
    this.physics.arcade.enable(this.man);
    this.man.alpha = 0;
    this.man.scale.setTo(0.1, 0.1);
    this.man.anchor.setTo(0, 1);
    this.man.body.bounce.y = 0.2;
    this.man.body.gravity.y = 300;
    this.man.body.collideWorldBounds = true;
    this.add.tween(this.man).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
    this.add.tween(this.man.scale).to({ x: 0.25, y: 0.25 }, 1000, "Bounce.easeInOut", true);
    this.man.props = { col: col, hasItem: false, name: "man", row: row };

    col = 11;
    row = 11;
    this.worm = this.add.sprite(this.positionX(col), this.positionY(row), "worm");
    this.physics.arcade.enable(this.worm);
    this.worm.scale.setTo(0.1, 0.1);
    this.worm.anchor.setTo(0, 1);
    this.worm.body.setSize(256, 256, 0, 0); // must hit the man but not the plant a row above
    this.worm.body.collideWorldBounds = true;
    this.worm.alpha = 0;
    this.add.tween(this.worm).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
    this.add.tween(this.worm.scale).to({ x: 0.25, y: 0.25 }, 1000, "Bounce.easeInOut", true);
    this.worm.props = { col: col, hasItem: false, name: "worm", row: row };

    this.input.keyboard.onUpCallback = _.bind(this.keyInput, this);
    this.sound.setDecodedCallback(_.values(this.sounds), this.start, this); // start the game when sounds are decoded
},

  createBlocks: function(nthDday) {
    var block, i, numBlocks = function(n) { return (n >= 7 ? 9: [3, 5, 7, 7, 7, 9][n-1]); };

    if (this.groups.blocks) this.groups.blocks.removeAll(true); // new group for each day / night
    this.groups.blocks.enableBody = true;
    for (i = 0; i < numBlocks(nthDday); i++) {
      block = this.groups.blocks.create(this.positionX(Math.floor(this.columns * Math.random())), this.positionY(this.borderrow - 2), "block");
      block.scale.setTo(0.25, 0.25);
      block.anchor.setTo(0, 1);
      block.body.gravity.y = 600;
      block.body.bounce.y = 0.4;
      block.alpha = 0;
      this.add.tween(block).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
    }
  },

  createFoods: function(nthDday) { // "Foods" consistency over spelling
    var food, i, numFoods = function(n) { return (n >= 7 ? 9 : [3, 5, 7, 7, 7, 9][n-1]); };

    if (this.groups.foods) this.groups.foods.removeAll(true); // new group for each day / night
    this.groups.foods.enableBody = true
    for (i = 0; i < numFoods(nthDday); i = i + 1) {
      food = this.groups.foods.create(this.positionX(Math.floor(this.columns * Math.random())), this.positionY(this.borderrow + 1 + Math.floor(Math.random() * (this.rows - this.borderrow))), "food");
      food.scale.setTo(0.25, 0.25);
      food.body.setSize(256, 90, 0, -25); // must hit the man but not the plant a row above
      food.anchor.setTo(0, 1);
      food.alpha = 0;
      this.add.tween(food).to({ alpha: 1 }, 1500, "Sine.easeInOut", true);

    }
  },

  dayNight: function(n) {
    var activeMusic, inactiveMusic, invisibleElement, invisibleLayer, n, stepTime, tween, visibleElement, visibleLayer;

    if (this.isDay) {
      visibleElement = this.sun;
      invisibleElement = this.moon;
      visibleLayer = this.layers.dayLayer;
      invisibleLayer = this.layers.nightLayer;
      activeMusic = this.sounds.day;
      inactiveMusic = this.sounds.night;
      this.worm.props.cankill = false;
      this.man.props.candrop = true;
    } else { // night
      visibleElement = this.moon;
      invisibleElement = this.sun;
      visibleLayer = this.layers.nightLayer;
      invisibleLayer = this.layers.dayLayer;
      activeMusic = this.sounds.night;
      inactiveMusic = this.sounds.day;
      this.worm.props.cankill = true;
      this.man.props.candrop = false;
    }

    visibleElement.visible = true;
    invisibleElement.visible = false;
    visibleLayer.visible = true;
    visibleLayer.alpha = 0;
    this.add.tween(visibleLayer).to({ alpha: 1 }, 2500, "Sine.easeInOut", true);
    invisibleLayer.visible = false;
    visibleElement.props.col = visibleElement.props.startCol;

    visibleElement.alpha = 0;
    visibleElement.x = this.positionX(visibleElement.props.col);
    stepTime = (this.lengthDayNight/visibleElement.props.steps) * 1000;
    tween = this.add.tween(visibleElement);
    tween.to({ alpha: 1 }, 1000, "Sine.easeInOut");
    for (n = 0; n < visibleElement.props.steps; n = n + 1) tween.to({ x: this.positionX(++visibleElement.props.col) }, stepTime, "Circ.easeInOut");
    tween.to({ alpha: 0 }, 1000, "Sine.easeInOut");
    tween.start();

    this.createBlocks(n);
    this.createFoods(n);
    if (inactiveMusic.isPlaying) inactiveMusic.stop();
    this.playMusic(activeMusic);
    this.time.events.add(this.lengthDayNight * 1000 + 2000, function() {this.isDay = !this.isDay; this.dayNight();}, this, (this.isDay ? n : ++n));
  },

  digHole: function() {
    var col, hole, row;

    if (this.worm.props.hasItem) {
      this.worm.props.hasItem = false;
      col = this.worm.props.col;
      row = this.worm.props.row;
      this.playSound(this.sounds.dighole);
      hole = this.groups.holes.create(this.positionX(col), this.positionY(row), "hole");
      hole.scale.setTo(0.25, 0.25);
      hole.anchor.setTo(0, 1);
      hole.alpha = 0;
      this.add.tween(hole).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
      if ( this.holelist[col] ) { // holes already exist in this column
        this.holelist[col]["amount"]++;
        this.holelist[col]["tiles"].push(hole);
      } else { // first hole in this column
        this.holelist[col] = { amount: 1, tiles: [hole] };
      }
      if (this.houselist[col]) this.collapseHouse(col);
    } else {
      // play sound unsuccessful
    }
  },

  dropBlock: function() {
    var col, row;

    if (this.man.props.hasItem && this.man.props.candrop) {
      this.man.props.hasItem = false;
      col = this.man.props.col;
      row = this.man.props.row;
      // this.playSound();
      this.theDroppedBlock = this.add.sprite(this.positionX(col), this.positionY(row), "block");
      this.physics.arcade.enable(this.theDroppedBlock);
      this.theDroppedBlock.scale.setTo(0.25, 0.25);
      this.theDroppedBlock.anchor.setTo(0, 1);
      this.theDroppedBlock.body.collideWorldBounds = true;
      this.theDroppedBlock.body.bounce.y = 0.2;
      this.theDroppedBlock.body.gravity.y = 300;
    }
  },

  keyInput: function(event) {
    var key = event.keyCode;

    // man
    if (key === Phaser.Keyboard.A) { // move left
      this.man.props.col = this.man.props.col - 1;
      if (this.man.props.col < 0) this.man.props.col = this.columns - 1;
      this.man.x = this.positionX(this.man.props.col);
    } else if (key === Phaser.Keyboard.D) { // move right
      this.man.props.col = (this.man.props.col + 1) % this.columns;
      this.man.x = this.positionX(this.man.props.col);
    } else if (key === Phaser.Keyboard.W) { // jump
      this.man.body.velocity.y = -150;
    } else if (key === Phaser.Keyboard.E) { // build
      this.addFloor();
    } else if (key === Phaser.Keyboard.S) { // drop stone
      this.dropBlock();
    // worm
    } else if (key === Phaser.Keyboard.J) { // move left
      this.worm.props.col = Math.max(this.worm.props.col - 1, 0);
      this.worm.x = this.positionX(this.worm.props.col);
    } else if (key === Phaser.Keyboard.L) { // move right
      this.worm.props.col = Math.min(this.worm.props.col + 1, this.columns - 1);
      this.worm.x = this.positionX(this.worm.props.col);
    } else if (key === Phaser.Keyboard.I) { // move up
      this.worm.props.row = Math.max((this.worm.props.row - 1), this.borderrow);
      this.worm.y = this.positionY(this.worm.props.row);
    } else if (key === Phaser.Keyboard.K) { // move down
      this.worm.props.row = Math.min(this.worm.props.row + 1, this.rows);
      this.worm.y = this.positionY(this.worm.props.row);
    } else if (key === Phaser.Keyboard.U) {
      this.digHole();
    // other
    } else if (key === Phaser.Keyboard.G) {
      var music = (this.isDay ? this.sounds.day : this.sounds.night);

      this.settings.music = !this.settings.music;

      if (this.settings.music) {
        this.playMusic(this.music);
      } else {
        this.music.stop();
      }
    } else if (key === Phaser.Keyboard.V) {
      this.settings.music = !this.settings.music;
    }
  },

  playMusic: function(music) {
    if (this.settings.music) music.loopFull();
  },

  playSound: function(sound) {
    if (this.settings.sound) sound.play();
  },

  positionX: function(column) {
    return column * (this.world.width / this.columns);
  },

  positionY: function(row) {
    return row * (this.world.height / this.rows);
  },

  render: function() {
    if (this.settings.debug) { // show body and sprite boundaries
      this.debug.body(this.man, "#ff00ff", false);
      this.debug.body(this.worm, "#ff00ff", false);
      this.groups.blocks.forEachAlive(function(block) { this.debug.body(block, "#ff00ff", false); });
      this.groups.floors.forEachAlive(function(floor) { this.debug.body(floor, "#ff00ff", false) });
      this.groups.foods.forEachAlive(function(food) { this.debug.body(food, "#ff00ff", false) });
      this.groups.holes.forEachAlive(function(hole) { this.debug.body(hole, "#ff00ff", false) });
      this.debug.spriteBounds(this.man, "#00ff0088", false);
      this.debug.spriteBounds(this.worm, "#00ff0088", false);
      this.groups.blocks.forEachAlive(function(block) { this.debug.spriteBounds(block, "#00ff0088", false); });
      this.groups.floors.forEachAlive(function(floor) { this.debug.spriteBounds(floor, "#00ff0088", false) });
      this.groups.foods.forEachAlive(function(food) { this.debug.spriteBounds(food, "#00ff0088", false) });
      this.groups.holes.forEachAlive(function(hole) { this.debug.spriteBounds(hole, "#00ff0088", false) });

      this.debug.inputInfo(32, 32);
    }
  },

  score: function(scorer) {
    this.winner = scorer;
    console.log(scorer.props.name + " scores!");
  },

  start: function() {
    this.isDay = true;
    this.dayNight(1);
  },

  update: function() {
    this.physics.arcade.collide(this.man, this.layers.groundLayer);
    this.physics.arcade.collide(this.worm, this.layers.groundLayer);
    this.physics.arcade.collide(this.groups.blocks, this.layers.groundLayer);
    this.physics.arcade.overlap(this.man, this.groups.blocks, this.collectBlock, null, this);
    this.physics.arcade.overlap(this.worm, this.groups.foods, this.collectFood, null, this);
    this.physics.arcade.overlap(this.man, this.worm, this.wormBitesMan, null, this);
    this.physics.arcade.overlap(this.theDroppedBlock, this.worm, this.blockHitsWorm, null, this);
  },

  wormBitesMan: function() {
    if (this.worm.props.cankill) {
      if (this.winner !== null) return; // we have a winner already
      // TODO play sound
      this.add.tween(this.man).to({ y: "-30" }, 100, "Elastic.easeInOut", true, 0, 0, true);
      this.score(this.worm);
    }
  },

}
