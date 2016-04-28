
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update/*, render: render*/ });

function preload() {

  game.load.image('ball', 'z.png');
  game.load.image('bg', 'capetown-bg.jpg');

  game.load.image('cash1', '100RAND.jpg');

  game.load.audio('boden', ['dance_song.mp3']);
  game.load.audio('hit', ['cashregister.mp3']);


}

var sprite;

var s;
var music;
var hit;

function makeCashy() {

  var point = new Phaser.Point(game.world.centerX + (Math.random() - Math.random())*500, game.world.height + 100);
  var cash = game.add.sprite(point.x, point.y, 'cash1');

  cash.scale.x = 0.3;
  cash.scale.y = 0.3;
  cash.anchor.x = 0.5;
  cash.anchor.y = 0.5;

  game.physics.enable(cash, Phaser.Physics.ARCADE);
  cash.body.velocity.y = -(Math.random() * 2 + 1.5)*150;
  cashies.add(cash);

}

function create() {
  //game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

  //game.input.touch.preventDefault = false;

  music = game.add.audio('boden');
  hit = game.add.audio('hit');

  game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
  game.input.onDown.add(gofull, this);

  music.loopFull();

  //game.input.onDown.add(gofull, this);

  background_image = game.add.sprite(-game.world.centerX, 0, 'bg');
  game.physics.enable(background_image, Phaser.Physics.ARCADE);

  background_image.scale.x = 1.0;
  background_image.scale.y = 1.0;


  cashies = game.add.group();

  for (var i = 0; i < 100; i++){
    game.time.events.add(Phaser.Timer.SECOND * (i + (Math.random()-Math.random())), makeCashy, this);
  }

  top_level = game.add.group();
  zuma = game.add.sprite(game.world.centerX, 75, 'ball');
  game.physics.enable(zuma, Phaser.Physics.ARCADE);
  zuma.scale.x = 0.7;
  zuma.scale.y = 0.7;
  zuma.anchor.x = 0.5;
  zuma.anchor.y = 0.5;

  zuma.rotation = 3.14;

  top_level.add(zuma);




  fund = game.add.text(10, game.world.height-40, '');
  fund.style.fill = '#ffffff';
  fund.style.backgroundColor = '#000000';
  fund.amount = 0;

}

function gofull() {

  // if (game.scale.isFullScreen)
  // {
  //     game.scale.stopFullScreen();
  // }
  // else
  // {
  game.scale.startFullScreen(false);
  //}

}

function collisionHandler (obj1, obj2) {

  fund.amount += 100;
  obj2.destroy();
  hit.play();

  // zuma.scale.x = 0.3 + (1 * fund.amount/10000);
  // zuma.scale.y = 0.3 + (1 * fund.amount/10000);



}

function processHandler (zuma, cashy) {

  return true;

}

function update() {

  if (game.input.mousePointer.isDown)
  {
    game.physics.arcade.moveToPointer(zuma, 400);
    if (Phaser.Rectangle.contains(zuma.body, game.input.x, game.input.y))
    {
      zuma.body.velocity.setTo(0, 0);
    }
  }
  else
  {
    zuma.body.velocity.setTo(0, 0);
  }


  if (game.physics.arcade.collide(zuma, cashies, collisionHandler, null, this))
  {
    console.log('boom');
  }

  zuma.body.velocity.x = 0;

  if (game.input.activePointer.x - 100 > zuma.body.x){
    zuma.body.velocity.x = 250;
  }
  background_image.body.y -= 0.05;


  if (game.input.activePointer.x < zuma.body.x){
    zuma.body.velocity.x = -250;
  }




  cashies.forEach(function(cashy){
    cashy.rotation += 0.02;
  })


  fund.text = '  NKANDLA FUND    R' + fund.amount + '  ';



}


//function render() {
//    game.debug.soundInfo(music, 20, 32);
//}
