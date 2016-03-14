var res = {
  img_bg : "Resources/bg.png",
  img_coin : "Resources/pluskun.png",
  img_enemy : "Resources/rectman.png",
  img_snake : "Resources/snake.png",
  se_hitwall : "Resources/hitWall.mp3",
  se_getPoint : "Resources/getPoint.mp3",
  se_dead : "Resources/dead.mp3",
  se_changeDir : "Resources/changeDirection.mp3"
}

window.onload = function(){
    cc.game.onStart = function(){
        cc.view.adjustViewPort(true);
        cc.view.setDesignResolutionSize(640, 1136, cc.ResolutionPolicy.SHOW_ALL);
        cc.view.resizeWithBrowserSize(true);
        //load resources
        var preload_res = [
          res.img_bg,
          res.img_coin,
          res.img_enemy,
          res.img_snake,
          res.se_hitwall,
          res.se_getPoint,
          res.se_dead,
          res.se_changeDir
        ]
        cc.LoaderScene.preload(preload_res, function () {
            var MyScene = cc.Scene.extend({
                _snake:null,
                _enemies: [],
                _coins: [],
                _dx: 10,
                _score: 0,
                _scoreLabel: null,
                onEnter:function () {
                    this._super();
                    var size = cc.director.getWinSize();
                    var bg = cc.Sprite.create(res.img_bg);
                    bg.setPosition(size.width/2, size.height/2);
                    this.addChild(bg);
                    var sprite = cc.Sprite.create(res.img_snake);
                    sprite.setPosition(size.width / 2, size.height / 2);
                    sprite.setFlippedX(true);
                    this.addChild(sprite, 0);
                    this._snake = sprite;

                    var label = cc.LabelTTF.create("Score: 0", "Arial", 40);
                    label.setPosition(80, size.height - 30);
                    label.setColor(cc.color("#0000ff"));
                    this.addChild(label, 1);
                    this._scoreLabel = label;
                    var self = this;
                    cc.eventManager.addListener(cc.EventListener.create({
                        event: cc.EventListener.TOUCH_ONE_BY_ONE,
                        swallowTouches: true,
                        onTouchBegan: function (touch, event) {
                          self.changeSnakeDirection();
                          return true;
                        }
                      })
                    ,this);
                    this.scheduleUpdate();
                    this.schedule(this.spawnEnemy, 0.5);
                    this.schedule(this.spawnCoin, 1.5);

                },
                update:function(dt){
                  this.moveSnake();
                  var snakeRect = this.getRect(this._snake);
                  for(var i = 0; i < this._enemies.length; i++){
                    var enemyRect = this.getRect(this._enemies[i]);
                    if (cc.rectIntersectsRect(snakeRect, enemyRect)) {
                        this.gameOver();
                    }
                  }
                  var i = this._coins.length;
                  while(i--){
                    var coinRect = this.getRect(this._coins[i]);
                    if (cc.rectIntersectsRect(snakeRect, coinRect)) {
                      this._coins[i].removeFromParent();
                      this._coins.splice(i,1);
                      this._score++;
                      cc.audioEngine.playEffect(res.se_getPoint);
                      this.updateScore();
                    }
                  }
                },
                moveSnake: function(){
                    var snakeX = this._snake.getPositionX();
                    var newX = snakeX + this._dx;
                    this._snake.setPositionX(newX);
                    var size = cc.director.getWinSize();
                    if (newX > size.width || newX < 0) {
                        cc.audioEngine.playEffect(res.se_hitwall);
                        this.changeSnakeDirection();
                    }
                },
                changeSnakeDirection: function(){
                  this._dx = -this._dx;
                  if (this._dx > 0) {
                    this._snake.setFlippedX(true);
                  }else{
                    this._snake.setFlippedX(false);
                  }
                  cc.audioEngine.playEffect(res.se_changeDir);
                },
                spawnEnemy: function(){
                  var size = cc.director.getWinSize();
                  var enemy = cc.Sprite.create(res.img_enemy);
                  var x = Math.floor( Math.random() * size.width ) ;
                  var fromTop = false;
                  if(x % 2 == 0){
                    fromTop = true;
                  }
                  var y = 0;
                  if(fromTop){
                    y = size.height;
                  }
                  enemy.setPosition(x , y);
                  this.addChild(enemy, 0);
                  this._enemies.push(enemy)
                  var randDuration = Math.random() * 2;
                  var duration = 2 + randDuration;
                  var dirY = size.height;
                  if (fromTop) {
                    dirY = - size.height;
                  }
                  var move = new cc.MoveBy(duration, cc.p(0, dirY));
                  var remove = new cc.RemoveSelf(true);
                  enemy.runAction(new cc.Sequence([move, remove]))
                },
                spawnCoin: function(){
                  var size = cc.director.getWinSize();
                  var coin = cc.Sprite.create(res.img_coin);
                  var x = Math.floor( Math.random() * size.width ) ;
                  var fromTop = false;
                  if(x % 2 == 0){
                    fromTop = true;
                  }
                  var y = 0;
                  if(fromTop){
                    y = size.height;
                  }
                  coin.setPosition(x , y);
                  this.addChild(coin, 0);
                  this._coins.push(coin)
                  var randDuration = Math.random() * 4;
                  var duration = 5 + randDuration;
                  var dirY = size.height;
                  if (fromTop) {
                    dirY = - size.height;
                  }
                  var move = new cc.MoveBy(duration, cc.p(0, dirY));
                  var remove = new cc.RemoveSelf(true);
                  coin.runAction(new cc.Sequence([move, remove]))
                },
                getRect: function(obj){
                  var w = obj.width, h = obj.height;
                  var r = cc.rect(obj.getPositionX() - w/2, obj.getPositionY() - h/2, w, h);
                  return r;
                },
                updateScore: function(){
                  this._scoreLabel.setString("Score: " + this._score);
                },
                gameOver: function(){
                  cc.audioEngine.playEffect(res.se_dead);
                  var size = cc.director.getWinSize();
                  var label = cc.LabelTTF.create("GameOver\nScore is : " + this._score, "Arial", 40);
                  label.setPosition(size.width/2, size.height/2);
                  label.setColor(cc.color("#ff0000"));
                  this.addChild(label, 1);
                  var button = new cc.MenuItemFont("Restart",this.restartGame,this);
                  button.setPosition(size.width/2, size.height/2 - 200);
                  button.setColor(cc.color("#000000"));
                  var menu = new cc.Menu(button);
                  menu.x = 0;
                  menu.y = 0;
                  this.addChild(menu);
                  this.unscheduleAllCallbacks();
                  this.stopAllEnemies();
                  this.stopAllCoins();
                },
                restartGame: function(){
                  this._coins.length = 0;
                  this._enemies.length = 0;
                  this._score = 0;
                  var scene = new MyScene();
                  cc.director.runScene(scene);
                },
                stopAllEnemies: function(){
                  for(var i = 0; i < this._enemies.length; i++){
                    this._enemies[i].stopAllActions();
                  }
                },
                stopAllCoins: function(){
                  for(var i = 0; i < this._coins.length; i++){
                    this._coins[i].stopAllActions();
                  }
                }

            });
            cc.director.runScene(new MyScene());
        }, this);
    };
    cc.game.run("gameCanvas");
};
