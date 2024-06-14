// alert("Hello From Script");
class GameScene extends Phaser.Scene {
    init() {
        this.tileWidth = 64;
        this.tileHeight = 64;
        this.score = 0;
        this.birdSpeed = -350;
        this.birdDelay = 6000;
        this.plantDelay = 3000;
        this.groundSpeed = -180;
    }
    // load assets
    preload() {
        this.load.image("plant", "assets/cactus.png");
        this.load.image("dino", "assets/alienGreen_stand.png");
        this.load.image("bird", "assets/bat.png");
        this.load.audioSprite("sfx", "assets/fx_mixdown.json", ["assets/fx_mixdown.mp3", "assets/fx_mixdown.ogg"])
        this.load.image("bird0", "assets/bat.png");
        this.load.image("bird1", "assets/bat_fly.png");
        this.load.image("walk0", "assets/alienGreen_walk1.png");
        this.load.image("walk1", "assets/alienGreen_walk2.png");
        this.load.image("alienjump", "assets/alienGreen_jump.png");
    }
    // create game entities
    create() {
        // dino
        this.dino = this.physics.add.sprite(200, 343, "dino").setOrigin(0, 0).setScale(0.17, 0.25);
        this.dino.setSize(this.dino.width * 0.6, this.dino.height * 0.8, false).setOffset(100, 50);
        this.dino.setGravityY(850);
        // ground
        this.ground = this.physics.add.group();
        this.animation();
        // scoring
        this.scoreText = this.add.text(600, 25, "SCORE:0", {
            fontSize: "28px",
            fontFamily: "Arial Black",
            stroke: "black",
            strokeThickness: 5
        });
        this.topScore = localStorage.getItem("topScore") == null ? 0 : localStorage.getItem("topScore");
        this.topScoreText = this.add.text(30, 25, "MAX: " + this.topScore, {
            fontSize: "28px",
            fontFamily: "Arial Black",
            stroke: "black",
            strokeThickness: 5
        })
        this.handleScore();
        // creates ground
        this.addBase(0);
        this.spawnBird();
        this.spawnPlant();
        this.dino.anims.play("idle");
        this.physics.add.collider(this.dino, this.ground);
        this.physics.add.collider(this.dino, this.birds, this.gameOver, null, this);
        this.physics.add.collider(this.dino, this.plants, this.gameOver, null, this);
        this.physics.add.collider(this.plants, this.ground);
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    gameOver() {
        this.scene.pause();
        this.sound.playAudioSprite("sfx", "shot");
        localStorage.setItem("topScore", Math.max(localStorage.getItem("topScore"), this.score));
        this.scene.start("restart");
    }
    spawnBird() {
        this.birds = this.physics.add.group();
        this.time.addEvent({
            delay: this.birdDelay,
            loop: true,
            callbackScope: this,
            callback: () => {
                let val = Math.random();
                if (val > 0.5) {
                    this.generateBird(280);
                } else {
                    this.generateBird(360);
                }
            }
        })
    }
    generateBird(y) {
        let bird = this.birds.create(Math.max(Math.random() * 900, 780), y, "bird");
        bird.setScale(0.4).setOrigin(0, 0);
        bird.setVelocityX(Math.max(--this.birdSpeed, -400));
        bird.setSize(bird.width * 0.4, bird.height * 0.4);
        bird.anims.play("fly");
        this.time.addEvent({
            delay: 4000,
            repeat: 0,
            callbackScope: this,
            callback: () => {
                bird.destroy();
            }
        })


    }
    spawnPlant() {
        this.plants = this.physics.add.group();
        this.time.addEvent({
            delay: this.plantDelay,
            loop: true,
            callbackScope: this,
            callback: () => {
                let scale = Math.random();
                if (scale <= 0.4) {
                    // creates 2 plants
                    scale = 0.6;
                    this.generatePlant(scale);
                } else if (scale > 0.9) {
                    scale = 0.9;
                    this.generatePlant(scale);
                } else {
                    this.generatePlant(scale);
                }
            }
        })
    }
    generatePlant(scale) {
        // x,y 
        let sWidth = this.sys.game.config.width;
        let sHeight = this.sys.game.config.height;
        let plantY = sHeight - this.tileHeight - 110;

        let p1 = this.plants.create(sWidth, plantY, "plant").setOrigin(0, 0).setScale(scale);
        p1.setVelocityX(Math.max(this.groundSpeed, -230))
        p1.setGravityY(750);
        p1.setSize(p1.width * 0.5, p1.height, true).setOffset(10, 0);
        this.time.addEvent({
            delay: 3500,
            repeat: 0,
            callbackScope: this,
            callback: () => {
                p1.destroy();
            }
        })
        if (scale == 0.6) {
            let p2 = this.plants.create(sWidth + 10, plantY, "plant").setOrigin(0, 0).setScale(scale);
            p2.setVelocityX(Math.max(this.groundSpeed, -230))
            p2.setGravityY(750);
            p2.setSize(p2.width * 0.5, p2.height, true).setOffset(10, 0);
            this.time.addEvent({
                delay: 3500,
                repeat: 0,
                callbackScope: this,
                callback: () => {
                    p2.destroy();
                }
            })
        }

    }
    handleScore() {
        this.time.addEvent({
            delay: 250,
            loop: true,
            callback: () => {
                this.score++;
                this.scoreText.setText("SCORE: " + this.score);
                if (this.score % 100 == 0) {
                    this.sound.playAudioSprite("sfx", "ping");
                }
            },
            callbackScope: this
        })
    }
    animation() {
        this.anims.create({
            key: "fly",
            frames: [
                { key: "bird0" },
                { key: "bird1" },
            ],
            frameRate: 3, 
            repeat: -1
        })

        // dino
        this.anims.create({
            key: "idle",
            frames: [
                { key: "dino" },
            ],
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: "run",
            frames: [
                { key: "walk0" },
                { key: "walk1" },
            ],
            frameRate: 3, 
            repeat: -1
        });
        this.anims.create({
            key: "jump",
            frames: [
                { key: "alienjump" },
            ],
            frameRate: 1, 
        });
    }
    update() {

        this.handleInput();
        // create endless ground
        this.updateGround()

    }
    handleInput() {
        // controls
        if (this.cursors.space.isDown && this.dino.body.touching.down) {
            this.dino.setVelocityY(-500);
            this.dino.anims.play("jump");
            this.sound.playAudioSprite("sfx", "numkey");
        } else if (this.dino.body.touching.down) {
            this.dino.anims.play("run", true);
        }
    }
    updateGround() {
        let lastBlock = this.ground.getLast(true);
        let lastBlockX = lastBlock.x;
        let lastPoint = lastBlockX + this.tileWidth;
        if (lastPoint < this.sys.game.config.width) {
            this.addBase(lastPoint);
            this.ground.children.each((child) => {
                if (child.x < -this.tileWidth * 2) {
                    child.destroy();
                }
            })
        }
    }
    addBase(x) {
        let tileNeeded = Math.ceil((this.sys.game.config.width - x) / this.tileWidth);
        let y = this.sys.game.config.height - this.tileHeight;
        for (let i = 0; i < tileNeeded; i++) {
            this.addTile(x - 10 + (i * this.tileWidth), y);
        }
        // velocity
        this.ground.children.iterate((child) => {
            child.setVelocityX(Math.max(--this.groundSpeed, -230));
            child.setImmovable(true);
        })

    }
    addTile(x, y) {
        this.ground.create(x, y, "tile").setOrigin(0, 0);
    }
}
class TitleScene extends Phaser.Scene {
    preload() {
        this.tileWidth = 64;
        this.tileHeight = 64;
        this.load.image("tile", "assets/tile.png");
        // this.load.image("bird0", "assets/bat.png");
        // this.load.image("bird1", "assets/bat_fly.png");
    }
    create() {
        const Title = this.add.text(400, 200, "START NEW GAME", {
            fontSize: 45,
            fontFamily: "Arial Black",
            stroke: "black",
            strokeThickness: 5
        })
        Title.setOrigin(0.5, 0.5);
        const spaceText = this.add.text(400, 250, "PRESS SPACE TO START", {
            fontSize: 22,
            fontFamily: "Arial Black",
            stroke: "black",
            strokeThickness: 5
        })
        spaceText.setOrigin(0.5, 0.5)
        this.ground = this.physics.add.group();
        this.addBase(0);

        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("game");
        })
    }

    addBase(x) {
        let tileNeeded = Math.ceil((this.sys.game.config.width - x) / this.tileWidth);
        let y = this.sys.game.config.height - this.tileHeight;
        for (let i = 0; i < tileNeeded; i++) {
            this.addTile(x - 10 + (i * this.tileWidth), y);
        }
        // velocity
    }
    addTile(x, y) {
        this.ground.create(x, y, "tile").setOrigin(0, 0);
    }


}
class RestartScene extends Phaser.Scene {
    preload() {
        this.tileWidth = 64;
        this.tileHeight = 64;
    }
    create() {
        const Title = this.add.text(400, 200, "RESTART GAME", {
            fontSize: 45,
            fontFamily: "Arial Black",
            stroke: "black",
            strokeThickness: 5
        })
        Title.setOrigin(0.5, 0.5);
        const spaceText = this.add.text(400, 250, "PRESS SPACE TO RESTART", {
            fontSize: 22,
            fontFamily: "Arial Black",
            stroke: "black",
            strokeThickness: 5
        })
        spaceText.setOrigin(0.5, 0.5)
        this.ground = this.physics.add.group();
        this.addBase(0);

        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("game");
        })
    }

    addBase(x) {
        let tileNeeded = Math.ceil((this.sys.game.config.width - x) / this.tileWidth);
        let y = this.sys.game.config.height - this.tileHeight;
        for (let i = 0; i < tileNeeded; i++) {
            this.addTile(x - 10 + (i * this.tileWidth), y);
        }
        // velocity
    }
    addTile(x, y) {
        this.ground.create(x, y, "tile").setOrigin(0, 0);
    }
}
let config = {
    width: 800,
    height: 500,
    backgroundColor: '0xffe6cc',
    type: Phaser.AUTO,
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    }
}
const game = new Phaser.Game(config);

game.scene.add("game", GameScene);
game.scene.add("title", TitleScene);
game.scene.add("restart", RestartScene);
// game.scene.start("game");
game.scene.start("title");
