(function () {
'use strict';
// this function is strict...
}());

(function(){
window.allEnemies = [];
window.player;
window.destination;
window.key;
window.level;
window.collectables;
window.threshold = 40;
window.selectY = [60, 150, 230, 310];
window.selectX = [-100, -200, -300, -400];
window.keyX = [0, 100, 200, 300, 400];
window.keyY = [160, 320];
window.widthX = 65;
window.heightY = 65;
window.item = {
    gem: [{
        "pic": "images/diamond.png",
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
//Super class entity with render functionality
window.Entity = function(x,y,entityImage) {
    this.x = x;
    this.y = y;
    this.sprite = entityImage;
}

Entity.prototype.render = function() 
{
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);  
}

// Enemies our player must avoid
window.Enemy = function() { 
    var uniqueY = selectY;
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
    Entity.call(this.x,this.y,this.sprite);

};

Enemy.prototype = Object.create(Entity.prototype); 

Enemy.prototype.update = function(dt) {
    //Movement of the enemies are decidee below
    if (level.currentLevel === 1) {
        this.x = this.x + (dt * 180 * Math.random());
    } else {
        for (var i = 2; i <= level.currentLevel; i++) {
            this.x = this.x + (dt * 50 * i * Math.random());
        }
    }
    if (this.x > 400) {
        this.x = selectX[Math.floor(Math.random() * selectX.length)];
    }

};

//Player Class definition
window.Player = function(playerPic) {
    this.x = 300;
    this.y = 400;
    this.lifeCount = 3;
    this.deathCount = 0;
    this.totalScore = 0;
    //Based on user inputs the picture of the player changes
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
    //Call to super class
    Entity.call(this.x,this.y,this.sprite);

};

//render function of the entity is required for the player
Player.prototype = Object.create(Entity.prototype); 

//update function to make sure the player doesn't cross the grid provided
Player.prototype.update = function(pos) {
    var squareX = 100;
    var squareY = 80;
    var limitX =0;
    var limitY =400;
    if ((pos === 'left') && ((this.x - squareX) >= limitX)) {
        this.x = (this.x - squareX);
    } else if ((pos === 'right') && ((this.x + squareX) <= limitY)) {
        this.x = (this.x + squareX);
    } else if ((pos === 'up') && ((this.y - squareY) >= limitX)) {
        this.y = (this.y - squareY);
    } else if ((pos === 'down') && ((this.y + squareY) <= limitY)) {
        this.y = (this.y + squareY);
    } else if (pos === 'stop-up') {
        this.y = (this.y + squareY);
    }

};

// Collision with the enemies, key and detsination are checked below
Player.prototype.checkCollision = function() {
    var differenceX;
    var differenceY;
    var playerX = this.x;
    var playerY = this.y;
    var thisPlayer = this;
    // Check with all the enemies, to see if any collision is happening
    allEnemies.forEach(function(enemy) {
        if((playerX < enemy.x + widthX) &&
            (playerX + widthX > enemy.x) &&
            (playerY < enemy.y + heightY) &&
            (playerY + heightY > enemy.y))
        {
                        thisPlayer.lifeCount -= 1;
            thisPlayer.deathCount += 1;
            thisPlayer.lifeUpdate();
        }
    });
    //Check the collision with the key, if so increase the score
      if((this.x < key.x + widthX) &&
            (this.x + widthX > key.x) &&
            (this.y < key.y + heightY) &&
            (this.y + heightY > key.y)) {

        key.sprite = 'images/key-small.png';
        key.x = this.x + 60;
        key.y = this.y + 80;
        key.playerAcquired = true;
        this.scoreCalculation("key");
    }
     //Check the collision with the gems and treasure, if so increase the score
    if ((this.x < collectables.x + widthX) &&
            (this.x + widthX > collectables.x) &&
            (this.y < collectables.y + heightY) &&
            (this.y + heightY > collectables.y)  && (!item.destroyed)) 
    {
            item.destroyed = true;
            if (collectables.gemAcquired === false) 
            {
            this.scoreCalculation("collectables");
            collectables.gemAcquired = true;
            }
    }

};

//Handle the movement of the player
Player.prototype.handleInput = function(allowedkeys) {
    switch (allowedkeys) {
    case 'left':
        this.update('left');
        break;
    case 'right':
        this.update('right');
        break;
    case 'up':
        this.update('up');
        break;
    case 'down':
        this.update('down');
    }
    key.update();
};

// check if th eplayer reached the destination and didn't step into water
Player.prototype.checkDestination = function() {

    var destDifferenceX = destination.x - this.x;
    var destDifferenceY = destination.y - this.y;
     if ((this.x < destination.x + widthX) &&
            (this.x + widthX > destination.x) &&
            (this.y < destination.y + heightY) &&
            (this.y + heightY > destination.y))
     {
        if (key.playerAcquired)
         {
        this.destinationReached();
         }
         else
         {
            this.update('stop-up');    
         }
     }
    else if ((this.y < destination.y + heightY) &&
            (this.y + heightY > destination.y) )
             {
        this.lifeCount -= 1;
        this.deathCount += 1;
        this.lifeUpdate();
    } 
};

// Reset the position after every level
Player.prototype.resetPosition = function() {
    this.x = 300;
    this.y = 400;
    this.render();
};

//Every player has 2 life
Player.prototype.lifeRender = function() {
    var lifeX = 0;
    for (var i = 0; i < this.lifeCount; i++) {
        ctx.drawImage(Resources.get('images/heart.png'), lifeX, 600);
        lifeX += 50;
    }

};

//update the life if the enemy bites the player or if the player stepped into water
Player.prototype.lifeUpdate = function() {
    var deathX = 100;
    for (var i = 0; i < this.deathCount; i++) {
        ctx.clearRect(deathX, 600, 48, 48);
        ctx.drawImage(Resources.get('images/heart-broken.png'), deathX, 600);
        deathX -= 50;
    }
    this.resetPosition();
    key.update();
    if (this.deathCount === 3) {
        this.errorModal();
    }
};

//Bring up the score details
Player.prototype.scoreRender = function() {

    ctx.fillStyle = "blue";
    ctx.font = "36px Arial";
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.strokeText("SCORE :", 150, 800);
    ctx.fillText("SCORE :", 150, 800);
    this.scoreCalculation("initial");
};

//Updated score details
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

//if the player lost the game, show up the modal 
Player.prototype.errorModal = function() {

    var thisPlayer = this;
    $('#message').modal('show');
    $(document).on('hide.bs.modal', '#message', function() {
        thisPlayer.gameReset();
    });

}

// Reset the game
Player.prototype.gameReset = function() {
    item.destroyed = false;
    level.currentLevel = 1;
    level.totalLevel = 5;
    this.lifeCount = 3;
    this.deathCount = 0;
    this.totalScore = 0;
    this.x = 300;
    this.y = 400;
    key.x = keyX[Math.floor(Math.random() * keyX.length)];
    key.y = keyY[Math.floor(Math.random() * keyY.length)];
    key.sprite = 'images/key-icon.png';
    key.playerAcquired = false;
    this.treasureAcquired = false;
    collectables.gemAcquired = false;

}

// Player reaches the detaination. Decide if he completes all the levels
Player.prototype.destinationReached = function() {
    var thisPlayer = this;
    var currentLevel = level.currentLevel + 1;
    if (currentLevel <= level.totalLevel) {
        level.currentLevel = currentLevel;
        this.x = 300;
        this.y = 400;
        key.x = keyX[Math.floor(Math.random() * keyX.length)];
        key.y = keyY[Math.floor(Math.random() * keyY.length)];
        key.sprite = 'images/key-icon.png';
        key.playerAcquired = false;
        this.scoreCalculation("destination");
        item.destroyed = false;
        collectables.gemAcquired = false;
    } else {
        destination.reachDestination = true;
        $('#wonGame').modal('show');
        $(document).on('hide.bs.modal', '#wonGame', function() {
            destination.reachDestination = false;
            thisPlayer.gameReset();
        });
    }

}

// based on the inputs like destination, key or treasure, score would be calculated
Player.prototype.scoreCalculation = function(reach) {
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
    for (var i = 0; i < score.calc.length; i++) {
        if (reach === score.calc[i].level) {
            this.totalScore += score.calc[i].points;
            break;
        }
    }
    this.scoreUpdate();

}

// 5 levels are there
window.Level = function() {
    this.currentLevel = 1;
    this.totalLevel = 5;

};

// show up the levels and update the details
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

// Collectables are gems and treasures
window.Collectables = function() {
    var itemX = [0, 100, 200, 300, 400];
    var itemY = [80, 240];
    this.x = itemX[Math.floor(Math.random() * itemX.length)];
    this.y = itemY[Math.floor(Math.random() * itemY.length)];
    this.gemAcquired = false;
};

// after the destroytime, remove the item 
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

// Key details to enter the destination
window.Key = function() {
   
    this.x = keyX[Math.floor(Math.random() * keyX.length)];
    this.y = keyY[Math.floor(Math.random() * keyY.length)];
    this.sprite = 'images/key-icon.png';
    this.playerAcquired = false;
    Entity.call(this.x,this.y,this.sprite);

};

Key.prototype = Object.create(Entity.prototype); 


Key.prototype.update = function() {
    if (this.playerAcquired === true) {
        this.x = player.x + 60;
        this.y = player.y + 80;
    }
};

Key.prototype.resetPosition = function() {
    if (this.playerAcquired === true) {
        this.x = keyX[Math.floor(Math.random() * keyX.length)];
        this.y = keyY[Math.floor(Math.random() * keyY.length)];
        this.sprite = 'images/key-icon.png';
        this.playerAcquired = false;
        
    }

};

// Destination location and render functions

window.Destination = function() {
    var homeX = [0, 100, 200, 300, 400];
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


})();
