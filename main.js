"use strict";

var game = new Phaser.Game(1024, 644, Phaser.AUTO, "", { preload: preload, create: create, update: update, render: render });

var groundlayer, man, worm, sound = {};

function preload() {

  game.load.tilemap("map", "/assets/tilemap.json", null, Phaser.Tilemap.TILED_JSON);
  game.load.image("ground", "/assets/spritesheets/tiles_vierteln_0.png");
  game.load.image("man", "/assets/sprites/hero01.png");
  game.load.image("worm", "/assets/sprites/worm01.png");
  game.load.audio("day", ["/assets/snd/ManVsWorm-Day_30sec_128bpm.ogg", "/assets/snd/ManVsWorm-Day_30sec_128bpm.mp3"]);
  game.load.audio("night", ["assets/snd/ManVsWorm-Night_30sec_128bpm.ogg", "assets/snd/ManVsWorm-Night_30sec_128bpm.mp3"]);
  game.load.audio("manwins", ["/assets/snd/ManVsWorm-Manwin.ogg", "/assets/snd/ManVsWorm-Manwin.mp3"]);
  game.load.audio("wormwins", ["/assets/snd/ManVsWorm-Wormwin.ogg", "/assets/snd/ManVsWorm-Wormwin.mp3"]);
  game.load.audio("pickupfood", ["/assets/snd/ManVsWorm-WormswallowsFood.ogg", "/assets/snd/ManVsWorm-WormswallowsFood.mp3"]);
  game.load.audio("dighole", ["/assets/snd/ManVsWorm-Wormdiggahole.ogg", "/assets/snd/ManVsWorm-Wormdiggahole.mp3"]);
  game.load.audio("pickupblock", ["/assets/snd/ManVsWorm-Manpickup.ogg", "/assets/snd/ManVsWorm-Manpickup.mp3"]);
  game.load.audio("buildblock", ["/assets/snd/ManVsWorm-Manbuildup.ogg", "/assets/snd/ManVsWorm-Manbuildup.mp3"]);
  game.load.audio("movedown", ["/assets/snd/ManVsWorm-Housefallsdown.ogg", "/assets/snd/ManVsWorm-Housefallsdown.mp3"]);

}

function create() {

  sound.day = game.add.audio("day");
  sound.night = game.add.audio("night");
  sound.manwins = game.add.audio("manwins");
  sound.wormwins = game.add.audio("wormwins");
  sound.pickupfood = game.add.audio("pickupfood");
  sound.dighole = game.add.audio("dighole");
  sound.pickupblock = game.add.audio("pickupblock");
  sound.buildblock = game.add.audio("buildblock");
  sound.movedown = game.add.audio("movedown");

  game.sound.setDecodedCallback(_.values(sound), start, this);

  game.physics.startSystem(Phaser.Physics.ARCADE);

  var map = game.add.tilemap("map");
  map.addTilesetImage("tiles_vierteln_0","ground");
  groundlayer = map.createLayer("ground");
  groundlayer.resizeWorld();

  map.setCollision(4, true, "ground");

  man = game.add.sprite(32, game.world.height - 600, "man");
  game.physics.arcade.enable(man);
  man.scale.setTo(0.25, 0.25);
  man.body.bounce.y = 0.2;
  man.body.gravity.y = 300;
  man.body.collideWorldBounds = true;

  worm = game.add.sprite(320, game.world.height - 200, "worm");
  worm.scale.setTo(0.25, 0.25);
  game.physics.arcade.enable(worm);
  worm.body.collideWorldBounds = true;
}

function start() {
  sound.day.loopFull();
}


function update() {

  game.physics.arcade.collide(man, groundlayer);
  game.physics.arcade.collide(worm, groundlayer);

  man.body.velocity.x = 0;
  worm.body.velocity.x = 0;
  worm.body.velocity.y = 0;

  if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
    man.body.velocity.x = -150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
    man.body.velocity.x = 150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.J)) {
    worm.body.velocity.x = -150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.L)) {
    worm.body.velocity.x = 150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.I)) {
    worm.body.velocity.y = -150;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.K)) {
    worm.body.velocity.y = 150;
  }

}

function render() {

  game.debug.body(man);
  game.debug.body(worm);

}

