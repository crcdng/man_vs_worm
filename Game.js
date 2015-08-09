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

/*jslint nomen: true */
/*global _, Phaser */

"use strict";

var ManVsWorm  = ManVsWorm || {};

ManVsWorm.Game = {
  borderrow: 8,
  columns: 16,
  groups: { blocks: null, houses: null, foods: null, holes: null },
  isDay: null,
  layers: { dayLayer: null, groundLayer: null, nightLayer: null },
  lengthDayNight: 10,
  man: null,
  map: null,
  moon: null,
  rows: 14,
  settings: { music: true, sound: true, debug: false },
  sounds: {},
  sun: null,
  theDroppedBlock: null,
  winner: null,
  worm: null,

  addFloor: function () {
    var col, house, makeFloor = _.bind(function (group, spritekey, col, row) {
      var floor = group.create(this.positionX(col), this.positionY(row + 1), spritekey);
      floor.scale.setTo(0.25, 0.25);
      floor.anchor.setTo(0, 1);
      this.add.tween(floor).to({ y: this.positionY(row) }, 1000, "Bounce.easeOut", true);
      return floor;
    }, this), row, targetrow;

    if (this.man.props.hasBlock) {
      this.man.props.hasBlock = false;
      col = this.man.props.col;
      house = this.getHouse(col);
      this.playSound(this.sounds.buildblock);
      if (house) { // a house exists at the player column
        row = house.props.row;
        house.props.height += 1;
        targetrow = row - (house.props.height - 1);
        house.forEachAlive(function (currentfloor) {
          this.add.tween(currentfloor).to({ y: this.positionY(targetrow) }, 1000, "Bounce.easeOut", true);
          targetrow += 1;
        }, this);
        makeFloor(house, "floor", col, row);
        if (house.props.row - house.props.height <= 0) { this.score(this.man); }
      } else { // build a new house
        row = this.man.props.row;
        house = this.add.group();
        this.groups.houses.add(house);
        house.props = { col: col, height: 1, row: row };
        makeFloor(house, "roof", col, row);
      }
    } else {
      // TODO play sound unsuccessful attempt
    }
  },

  blockHitsWorm: function () {
    this.theDroppedBlock.kill();
    // TODO play sound
    if (this.winner !== null) { return; } // we have a winner already
    this.add.tween(this.worm).to({ y: "-30" }, 100, "Sine.easeOut", true, 0, 0, true);
    this.score(this.man);
  },

  collapseHouse: function (col) {
    var house = this.getHouse(col), targetrow;

    this.playSound(this.sounds.movedown);
    house.props.row += 1;
    targetrow = house.props.row - (house.props.height - 1);
    house.forEachAlive(function (currentfloor) {
      this.add.tween(currentfloor).to({ y: this.positionY(targetrow) }, 1000, "Bounce.easeOut", true);
      targetrow += 1;
    }, this);

    if (house.props.row >= this.rows) { this.score(this.worm); }
  },

  collectBlock: function (player, block) {
    var anchorX, anchorY, tween;

    if (!player.props.hasBlock) {
      player.props.hasBlock = true;
      this.playSound(this.sounds.pickupblock);
      tween = this.add.tween(player.scale).to({ x: "+0.15" }, 200, "Sine.easeInOut", true, 0, 0, true);
      block.kill();
    }
  },

  collectFood: function (player, food) {
    if (!player.props.hasBlock) {
      player.props.hasBlock = true;
      this.playSound(this.sounds.pickupfood);
      food.kill();
    }
  },

  create: function () {
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

    this.groups.holes = this.add.group();
    this.groups.holes.enableBody = true;
    this.groups.houses = this.add.group();
    this.groups.houses.enableBody = true;
    this.groups.foods = this.add.group();
    this.groups.foods.enableBody = true;
    this.groups.blocks = this.add.group();
    this.groups.blocks.enableBody = true;

    col = 3;
    row = 2;
    this.sun = this.add.sprite(this.positionX(col), this.positionY(row), "sun");
    this.physics.arcade.enable(this.sun);
    this.sun.scale.setTo(0.25, 0.25);
    this.sun.anchor.setTo(0, 1);
    this.sun.props = { col: col, startCol: 3, row: row, steps: 10};
    this.moon = this.add.sprite(this.positionX(col), this.positionY(row), "moon");
    this.physics.arcade.enable(this.moon);
    this.moon.scale.setTo(0.25, 0.25);
    this.moon.anchor.setTo(0, 1);
    this.moon.props = { col: col, startCol: 3, row: row, steps: 10};

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
    this.man.props = { col: col, hasBlock: false, name: "man", row: row };

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
    this.worm.props = { col: col, hasBlock: false, name: "worm", row: row };

    this.input.keyboard.onUpCallback = _.bind(this.keyInput, this);
    this.sound.setDecodedCallback(_.values(this.sounds), this.start, this); // start the game when sounds are decoded
  },

  createBlocks: function (nthDday) {
    var blocks = this.groups.blocks, numBlocksToProduce = function (day) { return (day >= 7 ? 9 : [3, 5, 7, 7, 7, 9][day - 1]); };

    blocks.removeAll(true); // new group for each day / night

    _.times(numBlocksToProduce(nthDday),
      function () {
        var block, possibleCol;

        do { // avoid dropping blocks at the man
          possibleCol = _.random(this.columns - 1);
        } while (possibleCol === this.man.props.col);
        block = this.groups.blocks.create(this.positionX(possibleCol), this.positionY(this.borderrow - 2), "block");
        block.scale.setTo(0.25, 0.25);
        block.anchor.setTo(0, 1);
        block.body.gravity.y = 600;
        block.body.bounce.y = 0.4;
        block.alpha = 0;
        this.add.tween(block).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
        block.props = { col: possibleCol, row: this.borderrow - 2};
      }, this);
  },

  createFoods: function (nthDday) { // "Foods" consistency over spelling
    var food, foods = this.groups.foods, numFoodsToProduce = function (day) { return (day >= 7 ? 9 : [3, 5, 7, 7, 7, 9][day - 1]); };

    foods.removeAll(true); // new group mwembers for each day / night
    _.times(
      numFoodsToProduce(nthDday),
      function () {
        var food, possibleCol, possibleRow;

        do { // avoid placing food on the worm or on a sunken house
          possibleCol = _.random(this.columns - 1);
          possibleRow = _.random(this.borderrow + 1, this.rows - 1);
        } while ((possibleCol === this.worm.props.col && possibleRow === this.worm.props.row) ||
                (function () { var house = this.getHouse(possibleCol);
                              if (house) { return (house.props.row - house.props.height + 1 <= possibleRow && possibleRow <= house.props.row);
                              } else {
                                return false;
                              }
                            }).call(this));

        food = foods.create(this.positionX(possibleCol), this.positionY(possibleRow), "food");
        food.scale.setTo(0.25, 0.25);
        food.body.setSize(256, 90, 0, -25); // must hit the man but not the plant a row above
        food.anchor.setTo(0, 1);
        food.alpha = 0;
        this.add.tween(food).to({ alpha: 1 }, 1500, "Sine.easeInOut", true);
        food.props = { col: possibleCol, row: possibleRow };

    }, this);
  },

  dayNight: function (nthday) {
    var activeMusic, inactiveMusic, invisibleElement, invisibleLayer, stepTime, tween, visibleElement, visibleLayer;

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
    stepTime = (this.lengthDayNight / visibleElement.props.steps) * 1000;
    tween = this.add.tween(visibleElement);
    tween.to({ alpha: 1 }, 1000, "Sine.easeInOut");
    _.times(visibleElement.props.steps,
            function () { tween.to({ x: this.positionX(++visibleElement.props.col) }, stepTime, "Circ.easeInOut"); },
           this);
    tween.to({ alpha: 0 }, 1000, "Sine.easeInOut");
    tween.start();

    this.createBlocks(nthday);
    this.createFoods(nthday);

    if (inactiveMusic.isPlaying) { inactiveMusic.stop(); }
    this.playMusic(activeMusic);

    this.time.events.add(this.lengthDayNight * 1000 + 2000,
                         function (n) { this.isDay = !this.isDay; this.dayNight(n); },
                         this,
                         (this.isDay ? nthday : ++nthday));
  },

  digHole: function () {
    var col, hole, row;

    if (this.worm.props.hasBlock) {
      this.worm.props.hasBlock = false;
      col = this.worm.props.col;
      row = this.worm.props.row;
      this.playSound(this.sounds.dighole);
      hole = this.groups.holes.create(this.positionX(col), this.positionY(row), "hole");
      hole.scale.setTo(0.25, 0.25);
      hole.anchor.setTo(0, 1);
      hole.alpha = 0;
      this.add.tween(hole).to({ alpha: 1 }, 1000, "Sine.easeInOut", true);
      hole.props = { col: col, row: row };

      if (this.getHouse(col)) { this.collapseHouse(col); }
    } else {
      // TODO play sound unsuccessful
    }
  },

  dropBlock: function () {
    var col, row;

    if (this.man.props.hasBlock && this.man.props.candrop) {
      this.man.props.hasBlock = false;
      col = this.man.props.col;
      row = this.man.props.row;
      // this.playSound();
      this.theDroppedBlock = this.add.sprite(this.positionX(col), this.positionY(row), "block");
      this.physics.arcade.enable(this.theDroppedBlock);
      this.theDroppedBlock.scale.setTo(0.25, 0.25);
      this.theDroppedBlock.anchor.setTo(0, 1);
      this.theDroppedBlock.body.collideWorldBounds = true;
      this.theDroppedBlock.body.setSize(256, 90, 0, -25); // must hit the worm correctly
      this.theDroppedBlock.body.bounce.y = 0.2;
      this.theDroppedBlock.body.gravity.y = 300;
    }
  },

  getHouse: function (column) {
    return _.find(this.groups.houses.children, function (house) { return (house.props.col === column); }, this);
  },

  keyInput: function (event) {
    var key = event.keyCode, music;

    // man
    if (key === Phaser.Keyboard.A) { // move left
      this.man.props.col = this.man.props.col - 1;
      if (this.man.props.col < 0) { this.man.props.col = this.columns - 1; }
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
      music = (this.isDay ? this.sounds.day : this.sounds.night);
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

  playMusic: function (music) {
    if (this.settings.music) { music.loopFull(); }
  },

  playSound: function (sound) {
    if (this.settings.sound) { sound.play(); }
  },

  positionX: function (column) {
    return column * (this.world.width / this.columns);
  },

  positionY: function (row) {
    return row * (this.world.height / this.rows);
  },

  render: function () {
    // console.log("Game.render()");

    if (this.settings.debug) { // show body and sprite boundaries

      if (this.theDroppedBlock) { this.game.debug.body(this.theDroppedBlock, "#ff00ff", false); }
      this.game.debug.body(this.man, "#ff00ff", false);
      this.game.debug.body(this.worm, "#ff00ff", false);
      this.groups.blocks.forEachAlive(function (block) { this.game.debug.body(block, "#ff00ff", false); }, this);
      this.groups.houses.forEachAlive(function (floor) { this.game.debug.body(floor, "#ff00ff", false); }, this);
      this.groups.foods.forEachAlive(function (food) { this.game.debug.body(food, "#ff00ff", false); }, this);
      this.groups.holes.forEachAlive(function (hole) { this.game.debug.body(hole, "#ff00ff", false); }, this);

      if (this.theDroppedBlock) { this.game.debug.spriteBounds(this.theDroppedBlock, "#00ff0088", false); }
      this.game.debug.spriteBounds(this.man, "#00ff0088", false);
      this.game.debug.spriteBounds(this.worm, "#00ff0088", false);
      this.groups.blocks.forEachAlive(function (block) { this.game.debug.spriteBounds(block, "#00ff0088", false); }, this);
      this.groups.houses.forEachAlive(function (floor) { this.game.debug.spriteBounds(floor, "#00ff0088", false); }, this);
      this.groups.foods.forEachAlive(function (food) { this.game.debug.spriteBounds(food, "#00ff0088", false); }, this);
      this.groups.holes.forEachAlive(function (hole) { this.game.debug.spriteBounds(hole, "#00ff0088", false); }, this);

      this.game.debug.inputInfo(32, 32);
    }
  },

  score: function (scorer) {

    this.winner = scorer;
    if (this.settings.music) {
      if (this.sounds.day.isPlaying) { this.sounds.day.stop(); }
      if (this.sounds.night.isPlaying) { this.sounds.night.stop(); }
    }
    this.state.start('GameOver', true, false, (this.winner === this.man));
  },

  start: function () {
    this.winner = null;
    this.isDay = true;
    this.dayNight(1);
  },

  update: function () {
    // console.log("Game.update()");

    this.physics.arcade.collide(this.man, this.layers.groundLayer);
    this.physics.arcade.collide(this.worm, this.layers.groundLayer);
    this.physics.arcade.collide(this.groups.blocks, this.layers.groundLayer);
    this.physics.arcade.overlap(this.man, this.groups.blocks, this.collectBlock, null, this);
    this.physics.arcade.overlap(this.worm, this.groups.foods, this.collectFood, null, this);
    this.physics.arcade.overlap(this.man, this.worm, this.wormBitesMan, null, this);
    this.physics.arcade.overlap(this.theDroppedBlock, this.worm, this.blockHitsWorm, null, this);
  },

  wormBitesMan: function () {
    if (this.worm.props.cankill) {
      if (this.winner !== null) { return; } // we have a winner already
      // TODO play sound
      this.add.tween(this.man).to({ y: "-30" }, 100, "Elastic.easeInOut", true, 0, 0, true);
      this.score(this.worm);
    }
  }

};
