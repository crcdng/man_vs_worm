import { Phaser } from '../node_modules/phaser-ce/build/custom/phaser-split.js';

export default {
  create: function () {
    this.state.start('Preload');
  },
  init: function () {
    this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    this.scale.pageAlignVertically = true;
    this.scale.pageAlignHorizontally = true;
  },
  preload: function () {
    this.load.image('preloadimg', 'assets/dummy/preload.png');
  }
};
