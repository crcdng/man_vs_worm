"use strict";

var game = new Phaser.Game(1024, 644, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var cursors, layer, man, snake;

function preload() {

  game.load.tilemap('map', '/assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('ground', '/assets/spritesheets/tiles_vierteln_0.png');

  game.load.image('man', '/assets/sprites/hero01.png');
  game.load.image('snake', '/assets/sprites/worm01.png');


}

function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);

  var map = game.add.tilemap('map');
  map.addTilesetImage('tiles_vierteln_0','ground');
  layer = map.createLayer('ground');
  layer.resizeWorld();

  man = game.add.sprite(32, game.world.height - 600, 'man');
  game.physics.arcade.enable(man);
  man.scale.setTo(0.25, 0.25);
  man.body.bounce.y = 0.2;
  man.body.gravity.y = 300;
  man.body.collideWorldBounds = true;

  snake = game.add.sprite(320, game.world.height - 200, 'snake');
  snake.scale.setTo(0.25, 0.25);
  game.physics.arcade.enable(snake);
  snake.body.collideWorldBounds = true;

  cursors = game.input.keyboard.createCursorKeys();
}

function update() {

  man.body.velocity.x = 0;
  snake.body.velocity.x = 0;
  snake.body.velocity.y = 0;

  if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
    man.body.velocity.x = -150;
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
    man.body.velocity.x = 150;
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
    snake.body.velocity.x = -150;
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
    snake.body.velocity.x = 150;
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.I)) {
    snake.body.velocity.y = -150;
  }
  else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
    snake.body.velocity.y = 150;
  }

}

