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
  winner: null,
  loser: null,
  isManWinner: null,

  create: function() {
    var height = this.game.height, width = this.game.width;

    this.man = this.add.sprite(width/4, height/3, "man");
    this.worm = this.add.sprite(3*width/4, height/3, "worm");

    this.winner = (this.isManWinner ? this.man : this.worm);
    this.loser = (this.isManWinner ? this.worm : this.man);

    this.physics.arcade.enable(this.winner);
    this.winner.alpha = 0;
    this.winner.scale.setTo(0.1, 0.1);
    this.winner.anchor.setTo(0.5, 0.5);
    this.add.tween(this.winner).to({ alpha: 1 }, 3000, "Sine.easeInOut", true);
    this.add.tween(this.winner.scale).to({ x: 0.5, y: 0.5 }, 3000, "Sine.easeInOut", true);

    this.physics.arcade.enable(this.loser);
    this.loser.scale.setTo(0.5, 0.5);
    this.loser.anchor.setTo(0.5, 0.5);
    this.loser.alpha = 1;
    this.add.tween(this.loser).to({ alpha: 0 }, 3000, "Sine.easeInOut", true);
    this.add.tween(this.loser.scale).to({ x: 0.01, y: 0.01 }, 3000, "Sine.easeInOut", true);

    this.input.keyboard.onUpCallback = _.bind(this.keyInput, this);
  },

  init: function(isManWinner) {
    this.isManWinner = isManWinner;
  },

  keyInput: function(event) {
    var key = event.keyCode;
    this.state.start("Game");
  },

  preload: function() {
  }

};
