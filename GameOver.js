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

var ManVsWorm = ManVsWorm || {};

ManVsWorm.GameOver = {
  man: null,
  map: null,
  winner: null,
  worm: null,

  create: function() {
    var winLayer = this.map.createLayer("win");
    console.log("GameOver.create()");

    this.man = this.add.sprite(250, 280, "man");
    this.physics.arcade.enable(this.man);
    this.man.alpha = 0;
    this.man.scale.setTo(0.1, 0.1);
    this.man.anchor.setTo(0, 1);
    this.add.tween(this.man).to({ alpha: 1 }, 3000, "Sine.easeInOut", true);
    this.add.tween(this.man.scale).to({ x: 0.5, y: 0.5 }, 3000, "Sine.easeInOut", true);

    this.worm = this.add.sprite(750, 280, "worm");
    this.physics.arcade.enable(this.worm);
    this.worm.scale.setTo(0.5, 0.5);
    this.worm.anchor.setTo(0, 1);
    this.worm.alpha = 1;
    this.add.tween(this.worm).to({ alpha: 0 }, 3000, "Sine.easeInOut", true);
    this.add.tween(this.worm.scale).to({ x: 0.01, y: 0.01 }, 3000, "Sine.easeInOut", true);

    this.input.keyboard.onUpCallback = _.bind(this.keyInput, this);
  },
  init: function(winner, map) {
    console.log("GameOver.init(): " + winner.props.name);

    this.map = map;
    this.winner = winner;
  },
  keyInput: function(event) {
    var key = event.keyCode;
    this.state.start("Game");
  },
  preload: function() {
    console.log("GameOver.preload()");
  }
};
