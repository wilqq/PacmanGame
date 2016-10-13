function LevelRoundState() {};

LevelRoundState.prototype = {
  init: function () {
    this.speed = 100;
    this.currentDirection = null;
  },
  preload: function () {
    this.load.image('logo', 'assets/logo.jpg');
    this.load.spritesheet('pacman', 'assets/pacman.png', 16, 16);
    this.load.image('tiles', 'maps/box-tiles.png');
    this.load.tilemap('level_1_map', 'maps/level_1_map.json', null, Phaser.Tilemap.TILED_JSON);
  },
  create: function () {
    this.map = this.add.tilemap('level_1_map');
    this.map.addTilesetImage('tiles', 'tiles');
    this.layer = this.map.createLayer('Layer1');

    this.pacman = this.add.sprite(14 * 16 + 8, 17 * 16 + 8, 'pacman', 0);
    this.pacman.anchor.set(0.5);
    this.pacman.animations.add('move', [0, 1, 2, 1], 8, true);
    this.pacman.play('move');
    this.physics.arcade.enable(this.pacman);

    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors = this.input.keyboard.createCursorKeys();
  },
  update: function () {
    this.checkKeys();
  },
  checkKeys: function () {
    if (this.cursors.left.isDown && this.currentDirection !== Phaser.LEFT) {
      this.move(this.pacman, Phaser.LEFT);
    } else if (this.cursors.right.isDown && this.currentDirection !== Phaser.RIGHT) {
      this.move(this.pacman, Phaser.RIGHT);
    } else if (this.cursors.up.isDown && this.currentDirection !== Phaser.UP) {
      this.move(this.pacman, Phaser.UP);
    } else if (this.cursors.down.isDown && this.currentDirection !== Phaser.DOWN) {
      this.move(this.pacman, Phaser.DOWN);
    }
  },
  move: function (sprite, direction) {
    var speed = this.speed;

    if (direction === Phaser.LEFT || direction === Phaser.UP) {
      speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
      sprite.body.velocity.x = speed;
      sprite.body.velocity.y = 0;
    } else {
      sprite.body.velocity.y = speed;
      sprite.body.velocity.x = 0;
    }
    this.currentDirection = direction;

    sprite.angle = 0;

    if (direction === Phaser.UP) {
      sprite.angle = 270;
    } else if (direction === Phaser.DOWN) {
      sprite.angle = 90;
    } else if (direction === Phaser.LEFT) {
      sprite.angle = 180;
    }
  }
}
