function LevelRoundState() {};

LevelRoundState.prototype = {
  init: function () {
    this.speed = 100;
    this.safeTile = 1;
    this.score = 0;
    this.scoreText = null;
    this.pacman = generateSpriteContainer();
    this.pacman.rotateImage = true;
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.ghosts = [];
    this.ghostsSprites = null;
    this.lives = null;
    this.livesCount = 3;

    for(var i = 0; i < 4; i++) {
      this.ghosts.push(generateSpriteContainer());
    }
  },
  preload: function () {
    this.load.image('logo', 'assets/logo.jpg');
    this.load.image('dot', 'assets/dot.png');
    this.load.image('big-dot', 'assets/big-dot.png');
    this.load.spritesheet('pacman', 'assets/pacman.png', 16, 16);
    this.load.spritesheet('ghosts', 'assets/ghosts.png', 16, 16);
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

    this.createGhosts();

    this.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.printScore();
    this.printLives();

    this.move(this.pacman, Phaser.RIGHT);
  },
  update: function () {
    this.physics.arcade.collide(this.pacman.sprite, this.layer);
    this.physics.arcade.collide(this.ghostsSprites, this.layer, this.changeGhostDirection, null, this);
    this.physics.arcade.overlap(this.pacman.sprite, this.dots, this.eatDot, null, this);
    this.physics.arcade.overlap(this.pacman.sprite, this.bigDots, this.eatBigDot, null, this);
    this.physics.arcade.overlap(this.pacman.sprite, this.ghostsSprites, this.pacmanGhostOverlap, null, this);

    this.computeSpriteDirections(this.pacman);

    this.checkKeys();

    if (this.pacman.turning !== Phaser.NONE) {
      this.turn(this.pacman);
    }

    _.each(this.ghosts, function (ghost) {
      this.selectGhostDirection(ghost);
      this.detectBoundCollision(ghost);
    }, this)

    this.detectBoundCollision(this.pacman);
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

    if (!spriteContainer.rotateImage) {
      return;
    }

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
    var self = this;
    dot.kill();

    this.ghostsSprites.callAll('animations.play', 'animations', 'moveHighlighted');

    setTimeout(function () {
      self.ghostsSprites.forEach(function (ghost) {
        if (ghost.animations.currentAnim.name == 'moveHighlighted') {
          ghost.play('moveHighlightedEnd');
        }
      })
    }, 5000)

    setTimeout(function () {
      self.ghostsSprites.callAll('animations.play', 'animations', 'move');
    }, 8000)
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
  },
  createGhosts: function () {
    if (!this.ghostsSprites) {
      this.ghostsSprites = this.game.add.group();
    }

    _.each(this.ghosts, function (ghost, i) {
      ghost.sprite = this.ghostsSprites.create((12 + i) * 16 + 8, 11 * 16 + 8, 'ghosts', 0);
      ghost.sprite.anchor.set(0.5);
      ghost.sprite.animations.add('move', [i * 12 + 2, i * 12 + 3], 8, true);
      ghost.sprite.animations.add('moveHighlighted', [8, 9], 8, true);
      ghost.sprite.animations.add('moveHighlightedEnd', [8, 11, 10, 9], 8, true);
      ghost.sprite.play('move');
      this.physics.arcade.enable(ghost.sprite);

      this.move(ghost, i % 2 + 1);
    }, this)
  },
  changeGhostDirection: function (ghost) {
    var direction = _.sample([Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP]);
    this.move({sprite: ghost}, direction);
  },
  selectGhostDirection: function (spriteContainer) {
    this.computeSpriteDirections(spriteContainer);
    var marker = spriteContainer.marker;
    var prevMarker = spriteContainer.prevMarker;

    if (!this.checkAvalibleDirections(spriteContainer) || (marker.x == prevMarker.x && marker.y == prevMarker.y)) {
      return;
    }

    var direction = _.sample(spriteContainer.avalibleDirections);
    this.checkDirection(spriteContainer, direction);

    if (spriteContainer.turning !== Phaser.NONE && this.turn(spriteContainer)) {
      spriteContainer.prevMarker = _.clone(spriteContainer.marker);
    }
  },
  checkAvalibleDirections: function (spriteContainer) {
    spriteContainer.avalibleDirections = [];

    for (var i = 1; i <= 4; i++) {
      if (spriteContainer.directions[i] && spriteContainer.directions[i].index == this.safeTile) {
        spriteContainer.avalibleDirections.push(i);
      }
    }

    return spriteContainer.avalibleDirections.length > 2;
  },
  pacmanGhostOverlap: function (_pacman, ghost) {
    if (ghost.animations.currentAnim.name == 'move') {
      this.killPacman();
    } else {
      this.killGhost(ghost);
    }
  },
  killPacman: function () {
    this.livesCount--;
    this.lives.removeChildAt(this.lives.countLiving() - 1);

    if (this.livesCount === 0) {
      this.restartGame();
    }

    this.pacman.sprite.x = 14 * 16 + 8;
    this.pacman.sprite.y = 17 * 16 + 8;

    _.each(this.ghosts, function (ghost, i) {
      ghost.sprite.x = (12 + i) * 16 + 8;
      ghost.sprite.y = 11 * 16 + 8;
    })
  },
  killGhost: function (ghost) {
    this.score += 200;
    this.printScore();
    ghost.x = 14 * 16 + 8;
    ghost.y = 11 * 16 + 8;
    ghost.play('move');
  },
  printLives: function () {
    if (!this.lives) {
      this.lives = this.game.add.group();
      this.game.add.text(300, this.game.height - 28, 'Lives: ', { fontSize: '16px', fill: '#FFF' });
    }

    for (var i = 0; i < this.livesCount; i++) {
      this.lives.create(this.game.width - 90 + i * 30, this.game.height - 26, 'pacman');
    }
  },
  restartGame: function () {
    this.game.state.start('level-round');
  },
  detectBoundCollision: function (spriteContainer) {
    var sprite = spriteContainer.sprite;

    if (sprite.x < 0 || sprite.x > this.game.width) {
      sprite.x = Math.abs(sprite.x - this.game.width);
    } else if (sprite.y < 0 || sprite.y > (this.game.height - 32)) {
      sprite.y = Math.abs(sprite.y - (this.game.height - 32));
    }
  }
}

var generateSpriteContainer = function () {
  return {
    sprite: null,
    currentDirection: Phaser.NONE,
    directions: new Array(5),
    marker: new Phaser.Point(),
    prevMarker: new Phaser.Point(1, 1),
    turningPoint: new Phaser.Point(),
    turning: Phaser.NONE,
    rotateImage: false,
    avalibleDirections: []
  }
}
