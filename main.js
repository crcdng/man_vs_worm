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

ManVsWorm.game = new Phaser.Game(1024, 644, Phaser.AUTO, "");
ManVsWorm.game.state.add("Boot", ManVsWorm.Boot);
ManVsWorm.game.state.add("Preload", ManVsWorm.Preload);
ManVsWorm.game.state.add("MainMenu", ManVsWorm.MainMenu);
ManVsWorm.game.state.add("Game", ManVsWorm.Game);
ManVsWorm.game.state.add("GameOver", ManVsWorm.GameOver);
ManVsWorm.game.state.start("Boot");
