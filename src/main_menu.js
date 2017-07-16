export default {
  music: null,

  create: function () {
    const height = this.game.height;
    const width = this.game.width;

    this.music = this.add.audio('title');
    this.music.play();
    this.man = this.add.sprite(width / 4, height / 3, 'man');
    this.physics.arcade.enable(this.man);
    this.man.alpha = 0;
    this.man.scale.setTo(0.1, 0.1);
    this.man.anchor.setTo(0.5, 0.5);
    this.add.tween(this.man).to({ alpha: 1 }, 3000, 'Sine.easeInOut', true);
    this.add.tween(this.man.scale).to({ x: 0.5, y: 0.5 }, 3000, 'Sine.easeInOut', true);
    this.worm = this.add.sprite(3 * width / 4, height / 3, 'worm');
    this.physics.arcade.enable(this.worm);
    this.worm.scale.setTo(0.1, 0.1);
    this.worm.anchor.setTo(0.5, 0.5);
    this.worm.alpha = 0;
    this.add.tween(this.worm).to({ alpha: 1 }, 3000, 'Sine.easeInOut', true);
    this.add.tween(this.worm.scale).to({ x: 0.5, y: 0.5 }, 3000, 'Sine.easeInOut', true);
    this.input.keyboard.onUpCallback = () => this.startGame();
  },

  preload: function () {
  },

  startGame: function () {
    this.music.stop();
    this.state.start('Game');
  }

};
