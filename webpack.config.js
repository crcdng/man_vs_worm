// const webpack = require('webpack');
const path = require('path');
const srcDir = path.resolve(__dirname, 'src');
const buildDir = path.resolve(__dirname, 'dist');
const phaserDir = path.join(__dirname, '/node_modules/phaser-ce/');

const config = {
  entry: `${srcDir}/main.js`,
  output: {
    filename: 'app.js',
    path: buildDir
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: srcDir,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      // https://github.com/photonstorm/phaser/issues/2762
      {
        test: /pixi\.js/,
        use: [{
          loader: 'expose-loader',
          options: 'PIXI'
        }]
      },
      {
        test: /phaser-split\.js$/,
        use: [{
          loader: 'expose-loader',
          options: 'Phaser'
        }]
      },
      {
        test: /p2\.js/,
        use: [{
          loader: 'expose-loader',
          options: 'p2'
        }]
      }
    ]
  },
  resolve: {
    alias: {
      'phaser': path.join(phaserDir, 'build/custom/phaser-split.js'),
      'pixi.js': path.join(phaserDir, 'build/custom/pixi.js'),
      'p2': path.join(phaserDir, 'build/custom/p2.js')
    }
  }
};

module.exports = config;
