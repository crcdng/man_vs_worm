import { Phaser } from '../node_modules/phaser-ce/build/custom/phaser-split.js';

export default {
  preloadBar: null,
  ready: false,

  create: function () {
    this.preloadBar.cropEnabled = false;
    this.state.start('MainMenu');
  },

  preload: function () {
    this.preloadBar = this.add.sprite(this.game.width / 2, this.game.height / 2, 'preloadimg');
    this.preloadBar.anchor.setTo(0.5, 0);
    this.load.setPreloadSprite(this.preloadBar);
    this.load.tilemap('map', 'assets/spritesheets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('block', 'assets/sprites/house_block copy.png');
    this.load.image('floor', 'assets/sprites/house.png');
    this.load.image('food', 'assets/sprites/ground_flower.png');
    this.load.image('ground', 'assets/spritesheets/tiles_quarter_0.png');
    this.load.image('hole', 'assets/sprites/ground_hole.png');
    this.load.image('man', 'assets/sprites/hero01.png');
    this.load.image('moon', 'assets/sprites/sky_dark_moon.png');
    this.load.image('roof', 'assets/sprites/house_roof.png');
    this.load.image('sun', 'assets/sprites/sky_sun.png');
    this.load.image('worm', 'assets/sprites/worm01.png');
    this.load.audio('buildblock', ['assets/snd/ManVsWorm-Manbuildup.ogg', 'assets/snd/ManVsWorm-Manbuildup.mp3']);
    this.load.audio('day', ['assets/snd/ManVsWorm-Day_30sec_128bpm.ogg', 'assets/snd/ManVsWorm-Day_30sec_128bpm.mp3']);
    this.load.audio('dighole', ['assets/snd/ManVsWorm-Wormdiggahole.ogg', 'assets/snd/ManVsWorm-Wormdiggahole.mp3']);
    this.load.audio('manwins', ['assets/snd/ManVsWorm-Manwin.ogg', 'assets/snd/ManVsWorm-Manwin.mp3']);
    this.load.audio('movedown', ['assets/snd/ManVsWorm-Housefallsdown.ogg', 'assets/snd/ManVsWorm-Housefallsdown.mp3']);
    this.load.audio('night', ['assets/snd/ManVsWorm-Night_30sec_128bpm.ogg', 'assets/snd/ManVsWorm-Night_30sec_128bpm.mp3']);
    this.load.audio('pickupblock', ['assets/snd/ManVsWorm-Manpickup.ogg', 'assets/snd/ManVsWorm-Manpickup.mp3']);
    this.load.audio('pickupfood', ['assets/snd/ManVsWorm-WormswallowsFood.ogg', 'assets/snd/ManVsWorm-WormswallowsFood.mp3']);
    this.load.audio('title', ['assets/snd/ManVsWorm-Day_30sec_128bpm.ogg', 'assets/snd/ManVsWorm-Day_30sec_128bpm.mp3']);
    this.load.audio('wormwins', ['assets/snd/ManVsWorm-Wormwin.ogg', 'assets/snd/ManVsWorm-Wormwin.mp3']);
  },

  update: function () {
    if (this.cache.isSoundDecoded('title') && this.ready === false) {
      this.ready = true;
      this.state.start('MainMenu');
    }
  }

};
