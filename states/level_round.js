function LevelRoundState() {};

LevelRoundState.prototype = {
  init: function () {
    this.speed = 100;
    this.currentDirection = null;
    this.safeTile = 1;
    this.score = 0;
    this.scoreText = null;
  },
  preload: function () {
    this.load.image('logo', 'assets/logo.jpg');
    this.load.image('dot', 'assets/dot.png');
    this.load.image('big-dot', 'assets/big-dot.png');
    this.load.spritesheet('pacman', 'assets/pacman.png', 16, 16);
    this.load.image('tiles', 'maps/box-tiles.png');
    this.load.tilemap('level_1_map', 'maps/level_1_map.json', null, Phaser.Tilemap.TILED_JSON);
  },
  create: function () {
    this.map = this.add.tilemap('level_1_map');
    this.map.addTilesetImage('tiles', 'tiles');
    this.layer = this.map.createLayer('Layer1');

    this.dots = this.add.physicsGroup();
    this.map.createFromTiles(3, this.safeTile, 'dot', this.layer, this.dots);

    this.bigDots = this.add.physicsGroup();
    this.map.createFromTiles(4, this.safeTile, 'big-dot', this.layer, this.bigDots);

    this.dots.setAll('x', 6, false, false, 1);
    this.dots.setAll('y', 6, false, false, 1);

    this.bigDots.setAll('x', 2, false, false, 1);
    this.bigDots.setAll('y', 2, false, false, 1);

    this.map.setCollisionByExclusion([this.safeTile]);

    this.pacman = this.add.sprite(14 * 16 + 8, 17 * 16 + 8, 'pacman', 0);
    this.pacman.anchor.set(0.5);
    this.pacman.animations.add('move', [0, 1, 2, 1], 8, true);
    this.pacman.play('move');
    this.physics.arcade.enable(this.pacman);

    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.printScore();
  },
  update: function () {
    this.physics.arcade.collide(this.pacman, this.layer);
    this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);
    this.physics.arcade.overlap(this.pacman, this.bigDots, this.eatBigDot, null, this);

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
  },
  eatDot: function(_pacman, dot) {
    dot.kill();
    this.score += 10;
    this.printScore();
  },
  eatBigDot: function(_pacman, dot) {
    dot.kill();
    this.score += 100;
    this.printScore();
  },
  printScore: function() {
    if (!this.scoreText) {
      this.scoreText = this.add.text(
        32, this.game.world.height - 28, '', { fontSize: '16px', fill: '#FFF' }
      );
    }

    this.scoreText.setText('Score: ' + this.score);
  }
}
