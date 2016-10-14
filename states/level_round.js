function LevelRoundState() {};

LevelRoundState.prototype = {
  init: function () {
    this.speed = 100;
    this.safeTile = 1;
    this.score = 0;
    this.scoreText = null;
    this.pacman = generateSpriteContainer();
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
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

    this.pacman.sprite = this.add.sprite(14 * 16 + 8, 17 * 16 + 8, 'pacman', 0);
    this.pacman.sprite.anchor.set(0.5);
    this.pacman.sprite.animations.add('move', [0, 1, 2, 1], 8, true);
    this.pacman.sprite.play('move');
    this.physics.arcade.enable(this.pacman.sprite);

    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.printScore();

    this.move(this.pacman, Phaser.RIGHT);
  },
  update: function () {
    this.physics.arcade.collide(this.pacman.sprite, this.layer);
    this.physics.arcade.overlap(this.pacman.sprite, this.dots, this.eatDot, null, this);
    this.physics.arcade.overlap(this.pacman.sprite, this.bigDots, this.eatBigDot, null, this);

    this.computeSpriteDirections(this.pacman);

    this.checkKeys();

    if (this.pacman.turning !== Phaser.NONE) {
      this.turn(this.pacman);
    }
  },
  checkKeys: function () {
    if (this.cursors.left.isDown && this.pacman.currentDirection !== Phaser.LEFT) {
      this.checkDirection(this.pacman, Phaser.LEFT);
    } else if (this.cursors.right.isDown && this.pacman.currentDirection !== Phaser.RIGHT) {
      this.checkDirection(this.pacman, Phaser.RIGHT);
    } else if (this.cursors.up.isDown && this.pacman.currentDirection !== Phaser.UP) {
      this.checkDirection(this.pacman, Phaser.UP);
    } else if (this.cursors.down.isDown && this.pacman.currentDirection !== Phaser.DOWN) {
      this.checkDirection(this.pacman, Phaser.DOWN);
    }
  },
  move: function (spriteContainer, direction) {
    var sprite = spriteContainer.sprite
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
    spriteContainer.currentDirection = direction;

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
  },
  computeSpriteDirections: function (spriteContainer) {
    var x = this.math.snapToFloor(Math.floor(spriteContainer.sprite.x), 16) / 16;
    var y = this.math.snapToFloor(Math.floor(spriteContainer.sprite.y), 16) / 16;
    var i = this.layer.index;

    spriteContainer.marker.x = x;
    spriteContainer.marker.y = y;

    spriteContainer.directions[Phaser.LEFT] = this.map.getTileLeft(i, x, y);
    spriteContainer.directions[Phaser.RIGHT] = this.map.getTileRight(i, x, y);
    spriteContainer.directions[Phaser.UP] = this.map.getTileAbove(i, x, y);
    spriteContainer.directions[Phaser.DOWN] = this.map.getTileBelow(i, x, y);
  },
  checkDirection: function (spriteContainer, turnTo) {
    if (spriteContainer.turning === turnTo) {
      return;
    }

    if (spriteContainer.directions[turnTo] === null || spriteContainer.directions[turnTo].index !== this.safeTile) {
      return;
    }

    if (spriteContainer.currentDirection === this.opposites[turnTo]) {
      this.move(spriteContainer, turnTo)
    } else {
      spriteContainer.turning = turnTo;

      spriteContainer.turningPoint.x = spriteContainer.marker.x * 16 + 8;
      spriteContainer.turningPoint.y = spriteContainer.marker.y * 16 + 8;
    }
  },
  turn: function (spriteContainer) {
    var sprite = spriteContainer.sprite;
    var currentX = Math.floor(sprite.x);
    var currentY = Math.floor(sprite.y);
    var turnX = spriteContainer.turningPoint.x;
    var turnY = spriteContainer.turningPoint.y;

    if (!this.math.fuzzyEqual(currentX, turnX, 3) || !this.math.fuzzyEqual(currentY, turnY, 3)) {
      return false;
    }

    sprite.x = turnX;
    sprite.y = turnY;
    sprite.body.reset(turnX, turnY);
    this.move(spriteContainer, spriteContainer.turning);
    spriteContainer.turning = Phaser.NONE;

    return true;
  }
}

var generateSpriteContainer = function () {
  return {
    sprite: null,
    currentDirection: Phaser.NONE,
    directions: new Array(5),
    marker: new Phaser.Point(),
    turningPoint: new Phaser.Point(),
    turning: Phaser.NONE
  }
}
