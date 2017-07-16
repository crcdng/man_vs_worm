export default {
  winner: null,
  loser: null,
  isManWinner: null,

  create: function () {
    const height = this.game.height;
    const width = this.game.width;

    this.man = this.add.sprite(width / 4, height / 3, 'man');
    this.worm = this.add.sprite(3 * width / 4, height / 3, 'worm');

    this.winner = (this.isManWinner ? this.man : this.worm);
    this.loser = (this.isManWinner ? this.worm : this.man);

    this.physics.arcade.enable(this.winner);
    this.winner.alpha = 0;
    this.winner.scale.setTo(0.1, 0.1);
    this.winner.anchor.setTo(0.5, 0.5);
    this.add.tween(this.winner).to({ alpha: 1 }, 3000, 'Sine.easeInOut', true);
    this.add.tween(this.winner.scale).to({ x: 0.5, y: 0.5 }, 3000, 'Sine.easeInOut', true);

    this.physics.arcade.enable(this.loser);
    this.loser.scale.setTo(0.5, 0.5);
    this.loser.anchor.setTo(0.5, 0.5);
    this.loser.alpha = 1;
    this.add.tween(this.loser).to({ alpha: 0 }, 3000, 'Sine.easeInOut', true);
    this.add.tween(this.loser.scale).to({ x: 0.01, y: 0.01 }, 3000, 'Sine.easeInOut', true);

    this.input.keyboard.onUpCallback = () => this.state.start('Game');
  },

  init: function (isManWinner) {
    this.isManWinner = isManWinner;
  },

  preload: function () {
  }

};
