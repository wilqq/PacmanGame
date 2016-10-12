function LevelRoundState() {};

LevelRoundState.prototype = {
  preload: function () {
    this.load.image('logo', 'assets/logo.jpg');
    this.load.image('tiles', 'maps/box-tiles.png');
    this.load.tilemap('level_1_map', 'maps/level_1_map.json', null, Phaser.Tilemap.TILED_JSON);
  },
  create: function () {
    this.map = this.add.tilemap('level_1_map');
    this.map.addTilesetImage('tiles', 'tiles');
    this.layer = this.map.createLayer('Layer1');
  },
  update: function () {
    // body...
  }
}
