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

ManVsWorm.Preload = {
  create: function() {
    console.log("Preload.create()");
    this.state.start('Game');
  },
  preload: function() {
    console.log("Preload.preload()");
    this.load.tilemap("map", "assets/tilemap.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.image("block", "assets/sprites/house_block copy.png");
    this.load.image("floor", "assets/sprites/house.png");
    this.load.image("food", "assets/sprites/ground_flower.png");
    this.load.image("ground", "assets/spritesheets/tiles_vierteln_0.png");
    this.load.image("hole", "assets/sprites/ground_hole.png");
    this.load.image("man", "assets/sprites/hero01.png");
    this.load.image("moon", "assets/sprites/sky_dark_moon.png");
    this.load.image("roof", "assets/sprites/house_roof.png");
    this.load.image("sun", "assets/sprites/sky_sun.png");
    this.load.image("worm", "assets/sprites/worm01.png");
    this.load.audio("buildblock", ["assets/snd/ManVsWorm-Manbuildup.ogg", "assets/snd/ManVsWorm-Manbuildup.mp3"]);
    this.load.audio("day", ["assets/snd/ManVsWorm-Day_30sec_128bpm.ogg", "assets/snd/ManVsWorm-Day_30sec_128bpm.mp3"]);
    this.load.audio("dighole", ["assets/snd/ManVsWorm-Wormdiggahole.ogg", "assets/snd/ManVsWorm-Wormdiggahole.mp3"]);
    this.load.audio("manwins", ["assets/snd/ManVsWorm-Manwin.ogg", "assets/snd/ManVsWorm-Manwin.mp3"]);
    this.load.audio("movedown", ["assets/snd/ManVsWorm-Housefallsdown.ogg", "assets/snd/ManVsWorm-Housefallsdown.mp3"]);
    this.load.audio("night", ["assets/snd/ManVsWorm-Night_30sec_128bpm.ogg", "assets/snd/ManVsWorm-Night_30sec_128bpm.mp3"]);
    this.load.audio("pickupblock", ["assets/snd/ManVsWorm-Manpickup.ogg", "assets/snd/ManVsWorm-Manpickup.mp3"]);
    this.load.audio("pickupfood", ["assets/snd/ManVsWorm-WormswallowsFood.ogg", "assets/snd/ManVsWorm-WormswallowsFood.mp3"]);
    this.load.audio("wormwins", ["assets/snd/ManVsWorm-Wormwin.ogg", "assets/snd/ManVsWorm-Wormwin.mp3"]);  }
};
