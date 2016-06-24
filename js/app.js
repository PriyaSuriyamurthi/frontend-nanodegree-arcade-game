// Enemies our player must avoid
var allEnemies = [];
var player;
var destination;
var key;
var level;
var collectables;
var selectY = [60, 150, 230, 310];
var selectX = [-100, -200, -300, -400];
var homeX = [0, 100, 200, 300, 400];
var keyX = [0, 100, 200, 300, 400];
var keyY = [160, 320];
var itemX = [0, 100, 200, 300, 400];
var itemY = [100, 270];
var uniqueY = selectY;
var threshold = 40;
var score = {
    calc: [{
        "level": "initial",
        "points": 0
    }, {
        "level": "key",
        "points": 5
    }, {
        "level": "destination",
        "points": 10
    }, {
        "level": "collectables",
        "points": 50
    }]
};
var item = {
    gem: [{
        "pic": "images/diamond-icon.png",
        "level": 1
    }, {
        "pic": "images/gem-icon.png",
        "level": 3
    }, {
        "pic": "images/treasure.png",
        "level": 5
    }],
    destroyed: false
};

var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    var valueY = 0;
    this.sprite = 'images/enemy-bug.png';
    this.x = selectX[Math.floor(Math.random() * selectX.length)];
    valueY = uniqueY[Math.floor(Math.random() * uniqueY.length)];
    var indexY = uniqueY.indexOf(valueY);
    uniqueY.splice(indexY, 1);
    if (uniqueY.length === 0) {
        uniqueY = selectY;
    }
    this.y = valueY;

};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers. 
    if (level.currentLevel === 1) {
        this.x = this.x + (dt * 180 * Math.random());
    } else {
        for (var i = 2; i <= level.currentLevel; i++) {
            this.x = this.x + (dt * 90 * i * Math.random());
        }
    }
    if (this.x > 400) {
        this.x = selectX[Math.floor(Math.random() * selectX.length)];
    }

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(playerPic) {
    this.x = 300;
    this.y = 400;
    this.lifeCount = 3;
    this.deathCount = 0;
    this.totalScore = 0;
    switch (playerPic) {
        case "male":
            this.sprite = 'images/char-boy.png';
            break;
        case "female":
            this.sprite = 'images/char-girl.png';
            break;
        case "horngirl":
            this.sprite = 'images/char-horn-girl.png';
            break;
        case "pinkgirl":
            this.sprite = 'images/char-pink-girl.png';
            break;
        case "princessgirl":
            this.sprite = 'images/char-princess-girl.png';
    }

};

Player.prototype.update = function(pos) {
    if ((pos === 'left') && ((this.x - 100) >= 0)) {
        this.x = (this.x - 100);
    } else if ((pos === 'right') && ((this.x + 100) <= 400)) {
        this.x = (this.x + 100);
    } else if ((pos === 'up') && ((this.y - 80) >= 0)) {
        this.y = (this.y - 80);
    } else if ((pos === 'down') && ((this.y + 80) <= 400)) {
        this.y = (this.y + 80);
    } else if (pos === 'stop-up') {
        this.y = (this.y + 80);
    }

};

Player.prototype.render = function() {

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.checkCollision = function() {
    var differenceX;
    var differenceY;
    allEnemies.forEach(function(enemy) {
        if (player.x > enemy.x) {
            differenceX = player.x - enemy.x;
        } else {
            differenceX = enemy.x - player.x;
        }
        if (player.y > enemy.y) {
            differenceY = player.y - enemy.y;
        } else {
            differenceY = enemy.y - player.y;
        }
        if ((differenceX <= threshold) && (differenceY <= threshold)) {

            player.lifeCount -= 1;
            player.deathCount += 1;
            player.lifeUpdate();
        }
    });
    if ((player.x === key.x) && (player.y === key.y)) {

        key.sprite = 'images/key-small.png';
        key.x = player.x + 60;
        key.y = player.y + 80;
        key.playerAcquired = true;
        key.render();
        scoreCalculation("key");
        key.update();
    }
    if (player.y > collectables.y) {
        differenceY = player.y - collectables.y;
    } else {
        differenceY = collectables.y - player.y;
    }
    if ((player.x === collectables.x) && (differenceY <= threshold) && (!item.destroyed)) {
        item.destroyed = true;
        if (collectables.gemAcquired === false) {
            scoreCalculation("collectables");
            collectables.gemAcquired = true;
        }
    }

};

Player.prototype.handleInput = function(allowedkeys) {
    if (allowedkeys === 'left') {
        player.update('left');
    } else if (allowedkeys === 'right') {
        player.update('right');
    } else if (allowedkeys === 'up') {
        player.update('up');
    } else if (allowedkeys === 'down') {
        player.update('down');
    }
    key.update();
};

Player.prototype.checkDestination = function() {


    var destDifferenceX = destination.x - player.x;
    var destDifferenceY = destination.y - player.y;
    if ((destDifferenceX === 0) && (destDifferenceY === 0) &&
        (key.playerAcquired)) {
        destinationReached();

    } else if ((destDifferenceX !== 0) && (destDifferenceY === 0)) {
        player.lifeCount -= 1;
        player.deathCount += 1;
        player.lifeUpdate();
    } else if ((key.playerAcquired === false) && (destDifferenceX === 0) && (destDifferenceY === 0)) {

        player.update('stop-up');
    }
};

Player.prototype.resetPosition = function() {
    player.x = 300;
    player.y = 400;
    player.render();
};

Player.prototype.lifeRender = function() {
    var lifeX = 0;
    for (var i = 0; i < player.lifeCount; i++) {
        ctx.drawImage(Resources.get('images/heart.png'), lifeX, 600);
        lifeX += 50;
    }

};

Player.prototype.lifeUpdate = function() {
    var deathX = 100;
    for (var i = 0; i < player.deathCount; i++) {
        ctx.clearRect(deathX, 600, 48, 48);
        ctx.drawImage(Resources.get('images/heart-broken.png'), deathX, 600);
        deathX -= 50;
    }
    player.resetPosition();
    key.update();
    if (player.deathCount === 3) {
        errorModal();
    }
};

Player.prototype.scoreRender = function() {

    ctx.fillStyle = "blue";
    ctx.font = "36px Arial";
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.strokeText("SCORE :", 150, 800);
    ctx.fillText("SCORE :", 150, 800);
    scoreCalculation("initial");
};


Player.prototype.scoreUpdate = function() {

    ctx.clearRect(240, 705, 280, 280);
    ctx.fillStyle = "green";
    ctx.font = "36px Arial";
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.strokeText(this.totalScore, 280, 800);
    ctx.fillText(this.totalScore, 280, 800);

};

var Level = function() {
    this.currentLevel = 1;
    this.totalLevel = 5;

};

Level.prototype.levelRender = function() {

    ctx.fillStyle = "yellow";
    ctx.font = "36px Arial";
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.strokeText("LEVEL ", 250, 635);
    ctx.fillText("LEVEL ", 250, 635);

};

Level.prototype.levelUpdate = function() {

    ctx.clearRect(300, 605, 280, 280);
    ctx.fillStyle = "green";
    ctx.font = "36px Arial";
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.strokeText(this.currentLevel, 330, 635);
    ctx.fillText(this.currentLevel, 330, 635);

};

var Collectables = function() {
    this.x = itemX[Math.floor(Math.random() * itemX.length)];
    this.y = itemY[Math.floor(Math.random() * itemY.length)];
    this.gemAcquired = false;
};

Collectables.prototype.render = function() {

    var currentLevel = level.currentLevel;
    for (var i = 0; i < item.gem.length; i++) {
        if (item.gem[i].level === currentLevel) {
            if (item.destroyed === false) {
                ctx.drawImage(Resources.get(item.gem[i].pic), this.x, this.y);
                destroyCollectables();
                break;
            }
        }
    }
};

function destroyCollectables(){
                    var destroyTime = 7000;
                setTimeout(function() {
                    item.destroyed = true;
                }, destroyTime);
}

var Key = function() {

    this.x = keyX[Math.floor(Math.random() * keyX.length)];
    this.y = keyY[Math.floor(Math.random() * keyY.length)];
    this.sprite = 'images/key-icon.png';
    this.playerAcquired = false;

};

Key.prototype.render = function() {

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Key.prototype.update = function() {
    if (key.playerAcquired === true) {
        key.x = player.x + 60;
        key.y = player.y + 80;
    }
};

Key.prototype.resetPosition = function() {
    if (key.playerAcquired === true) {
        key.x = keyX[Math.floor(Math.random() * keyX.length)];
        key.y = keyY[Math.floor(Math.random() * keyY.length)];
        key.sprite = 'images/key-icon.png';
        key.playerAcquired = false;
        key.render();
    }

};


var Destination = function() {

    this.x = homeX[Math.floor(Math.random() * homeX.length)];
    this.y = 0;
    this.sprite = 'images/home.png';
    this.reachDestination = false;
};

Destination.prototype.render = function() {


    ctx.drawImage(Resources.get('images/homestone.png'), this.x, this.y);
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};



// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    if (player) {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

function errorModal() {

    $('#message').modal('show');
    $(document).on('hide.bs.modal', '#message', function() {
        gameReset();
    });

}

function gameReset() {
    item.destroyed = false;
    level.currentLevel = 1;
    level.totalLevel = 5;
    player.lifeCount = 3;
    player.deathCount = 0;
    player.totalScore = 0;
    player.x = 300;
    player.y = 400;
    key.x = keyX[Math.floor(Math.random() * keyX.length)];
    key.y = keyY[Math.floor(Math.random() * keyY.length)];
    key.sprite = 'images/key-icon.png';
    key.playerAcquired = false;
    player.treasureAcquired = false;
    collectables.gemAcquired = false;

}

function destinationReached() {
    level.currentLevel += 1;
    if (level.currentLevel <= level.totalLevel) {
        player.x = 300;
        player.y = 400;
        player.render();
        key.x = keyX[Math.floor(Math.random() * keyX.length)];
        key.y = keyY[Math.floor(Math.random() * keyY.length)];
        key.sprite = 'images/key-icon.png';
        key.playerAcquired = false;
        scoreCalculation("destination");
        item.destroyed = false;
        collectables.gemAcquired = false;
    } else {
        destination.reachDestination = true;
        $('#wonGame').modal('show');
        $(document).on('hide.bs.modal', '#wonGame', function() {
            destination.reachDestination = false;
            gameReset();
        });
    }

}

function scoreCalculation(reach) {
    for (var i = 0; i < score.calc.length; i++) {
        if (reach === score.calc[i].level) {
            player.totalScore += score.calc[i].points;
            break;
        }
    }
    player.scoreUpdate();

}