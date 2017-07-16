import '../node_modules/phaser-ce/build/custom/pixi.js';
import '../node_modules/phaser-ce/build/custom/p2.js';
import { Phaser } from '../node_modules/phaser-ce/build/custom/phaser-split.js';

import boot from './boot.js';
import preload from './preload.js';
import mainMenu from './main_menu.js';
import game from './game.js';
import gameOver from './game_over.js';

const app = new Phaser.Game(1024, 644, Phaser.AUTO, '');
app.state.add('Boot', boot);
app.state.add('Preload', preload);
app.state.add('MainMenu', mainMenu);
app.state.add('Game', game);
app.state.add('GameOver', gameOver);
app.state.start('Boot');
