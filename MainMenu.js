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

ManVsWorm.MainMenu = {
  music: null,

  create: function () {
    var height = this.game.height, width = this.game.width;

    this.music = this.add.audio("title");
    this.music.play();
    this.man = this.add.sprite(width / 4, height / 3, "man");
    this.physics.arcade.enable(this.man);
    this.man.alpha = 0;
    this.man.scale.setTo(0.1, 0.1);
    this.man.anchor.setTo(0.5, 0.5);
    this.add.tween(this.man).to({ alpha: 1 }, 3000, "Sine.easeInOut", true);
    this.add.tween(this.man.scale).to({ x: 0.5, y: 0.5 }, 3000, "Sine.easeInOut", true);
    this.worm = this.add.sprite(3 * width / 4, height / 3, "worm");
    this.physics.arcade.enable(this.worm);
    this.worm.scale.setTo(0.1, 0.1);
    this.worm.anchor.setTo(0.5, 0.5);
    this.worm.alpha = 0;
    this.add.tween(this.worm).to({ alpha: 1 }, 3000, "Sine.easeInOut", true);
    this.add.tween(this.worm.scale).to({ x: 0.5, y: 0.5 }, 3000, "Sine.easeInOut", true);
    this.input.keyboard.onUpCallback = _.bind(this.keyInput, this);
  },

  keyInput: function (event) {
    var key = event.keyCode;
    this.startGame();
  },

  preload: function () {
  },

  startGame: function () {
    this.music.stop();
    this.state.start("Game");
  }

};
