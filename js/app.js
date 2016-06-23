
// Enemies our player must avoid
var selectY= [60,150,230,310];
var selectX= [-100,-200,-300,-400];
var homeX = [0,100,200,300,400];
var keyX = [0,100,200,300,400];
var keyY= [80,160,240,320];
var uniqueY = selectY;
var threshold= 40;

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
    uniqueY.splice(indexY,1);
    if(uniqueY.length === 0){
        uniqueY = selectY;
    }
    this.y=  valueY;

};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers. 
            for (var i=1; i <= level.currentLevel;i++)
            {            
             this.x = this.x + (dt * 100 * i * Math.random());
            }
              if( this.x > 500){
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
var Player = function() {
    this.x = 300;
    this.y = 400;
    
    this.sprite = 'images/char-girl.png';
    //this.sprite = 'images/enemy-bug.png';
};

var Countable = function() {
    this.lifeCount = 3;
    this.deathCount = 0;
    this.totalScore = 0;
};

var Level = function() {
    this.currentLevel = 1;
    this.totalLevel = 5;
}

Player.prototype.update = function(pos) {
    if((pos === 'left') && ((this.x -100) >= 0)){
         this.x = (this.x -100) ;
    }
    else if((pos === 'right') && ((this.x +100) <= 400)){
         this.x = (this.x + 100); 
    }
    else if((pos === 'up') && ((this.y -80) >= 0)){
         this.y = (this.y -80);
    }
    else if((pos === 'down') && ((this.y +80) <= 400)){
         this.y = (this.y +80);
    }    
    

};

Player.prototype.render = function() {
    
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.checkCollision = function()
{
    var differenceX;
    var differenceY;
   allEnemies.forEach(function(enemy)
    {
        if(player.x > enemy.x)
        {
            differenceX = player.x - enemy.x;
        }
        else
        {
            differenceX = enemy.x - player.x;   
        }
        if(player.y > enemy.y)
        {
        differenceY = player.y - enemy.y;
        }
        else
         {
           differenceY = enemy.y - player.y;
         }   
        if((differenceX <= threshold) && (differenceY <= threshold))
        {
            
            countable.lifeCount -= 1;
            countable.deathCount += 1;
            countable.lifeUpdate();
        }
    });
    if((player.x === key.x) && (player.y === key.y))
    {
            
            key.sprite = 'images/key-small.png';
            key.x = player.x + 60;
            key.y = player.y + 80;
            key.playerAcquired = true;
            key.render();
            countable.totalScore += 5;
            key.update();
    }

};

Player.prototype.handleInput = function(allowedkeys) {
    if(allowedkeys === 'left')
    {
        player.update('left');
    }
    else if(allowedkeys === 'right'){
      player.update('right');  
    }
    else if(allowedkeys === 'up'){
      player.update('up');  
    }
    else if(allowedkeys === 'down'){
      player.update('down');  
    }
    key.update();
};

Player.prototype.checkDestination = function() {

    
    var destDifferenceX = destination.x - player.x;  
    var destDifferenceY = destination.y - player.y;  
    if((destDifferenceX === 0) && (destDifferenceY === 0) 
        && (key.playerAcquired === true) )
    {   
            
            player.x = 300;
            player.y = 400;
            player.render();
            key.x = keyX[Math.floor(Math.random() * keyX.length)];
            key.y = keyY[Math.floor(Math.random() * keyY.length)];
            key.sprite = 'images/key-icon.png';
            key.playerAcquired = false;
            destination.reachDestination = true;
            countable.scoreUpdate();
            level.currentLevel += 1;
            level.resetLevel();
            
    }
    else if((destDifferenceX != 0) && (destDifferenceY === 0))
    {
            countable.lifeCount -= 1;
            countable.deathCount += 1;
            countable.lifeUpdate();
    }
};

Player.prototype.resetPosition = function() {
            player.x = 300;
            player.y = 400;
            player.render();
        };

Countable.prototype.lifeRender = function()
{
    var lifeX = 0;
    for(var i=0; i<countable.lifeCount;i++)
    {
    ctx.drawImage(Resources.get('images/heart.png'), lifeX, 600);
    lifeX += 50;
    }

};

Countable.prototype.lifeUpdate = function()
{
    var deathX = 100;
    for(var i=0; i<countable.deathCount;i++)
    {
    ctx.clearRect(deathX,600,48,48); 
    ctx.drawImage(Resources.get('images/heart-broken.png'), deathX, 600);
    deathX -= 50;
    }
    player.resetPosition();
    key.update();
    if(countable.deathCount === 3)
    {
        errorModal();
    }
};

Level.prototype.levelRender = function() {

      ctx.fillStyle="yellow";
      ctx.font="36px Arial";
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'black';     
      ctx.strokeText("LEVEL ",250, 635);
      ctx.fillText("LEVEL ",250, 635);
}

Level.prototype.levelUpdate = function() 
{
      
      ctx.clearRect(300,605,280,280); 
      ctx.fillStyle="green";
      ctx.font="36px Arial";
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'black';     
      ctx.strokeText(this.currentLevel,330, 635);
      ctx.fillText(this.currentLevel,330, 635);

}
Level.prototype.resetLevel = function() 
{
      
      destination.reachDestination = false;
  }

Countable.prototype.scoreRender = function() {

      ctx.fillStyle="blue";
      ctx.font="36px Arial";
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'black';     
      ctx.strokeText("SCORE :",150, 800);
      ctx.fillText("SCORE :",150, 800);

}

Countable.prototype.scoreUpdate = function()
{
     
      if(countable.treasureAcquired)
      {
        this.totalScore += 15; 
      }
      
      if(destination.reachDestination === true)
      {
        this.totalScore += (level.currentLevel * 5);
      } 

      ctx.clearRect(150,705,280,280); 
      ctx.fillStyle="green";
      ctx.font="36px Arial";
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'black';     
      ctx.strokeText(this.totalScore,280, 800);
      ctx.fillText(this.totalScore,280, 800);

}

var Destination = function() {
    
    this.x = homeX[Math.floor(Math.random() * homeX.length)];
    this.y = 0;
    this.sprite = 'images/home.png';
    this.reachDestination = false;
};

Destination.prototype.render = function() {
   
    
    ctx.drawImage(Resources.get('images/homestone.png'), this.x, this.y );
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Valuables = function() {

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
    if(key.playerAcquired === true) {
    key.x = player.x + 60;
    key.y = player.y + 80;
}
};

 Key.prototype.resetPosition = function() {
            if(key.playerAcquired === true) {
            key.x = keyX[Math.floor(Math.random() * keyX.length)];
            key.y = keyY[Math.floor(Math.random() * keyY.length)];
            key.sprite = 'images/key-icon.png';
            key.playerAcquired = false;
            key.render();
            }

        };
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies =[];
for(var i =0;i< ((Math.random() * 10)+1);i++){
allEnemies.push(new Enemy());
}
console.log(allEnemies.length);
var player = new Player();
var destination = new Destination();
var key = new Key();
var countable = new Countable();
var level = new Level();
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

function errorModal() {

    ctx.clearRect(0,0,4000,4000);
    $('#message').modal('show');
    $(document).on('hide.bs.modal','#message', function () {
       gameReset();
    });
   
}

function gameReset() {
    level.currentLevel = 1;
    level.totalLevel = 5;
    countable.lifeCount = 3;
    countable.deathCount = 0;
    countable.totalScore = 0;
    player.x = 300;
    player.y = 400;
    key.x = keyX[Math.floor(Math.random() * keyX.length)];
    key.y = keyY[Math.floor(Math.random() * keyY.length)];
    key.sprite = 'images/key-icon.png';
    key.playerAcquired = false;
    destination.reachDestination = false;
    countable.treasureAcquired = false;
}

