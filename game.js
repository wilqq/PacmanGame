function Game() {}

Game.prototype = {
  start: function () {
    var game = new Phaser.Game(448, 528, Phaser.AUTO);

    game.state.add('level-round', LevelRoundState);

    game.state.start('level-round');
  }
}

var pacmanGame = new Game();
pacmanGame.start();
