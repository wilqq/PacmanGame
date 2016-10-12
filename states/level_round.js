function LevelRoundState() {};

LevelRoundState.prototype = {
  preload: function () {
    this.load.image('logo', 'assets/logo.jpg');
  },
  create: function () {
    this.game.add.sprite(0, 80, 'logo');
  },
  update: function () {
    // body...
  }
}
