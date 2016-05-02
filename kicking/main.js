window.onload = function() {

    var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS);


    var play = function(game){
        play.drag_count = 0;
        play.start_counting = false;
        play.swipe_vector = new Phaser.Point(0,0);
        play.kicked = false;
    }


    play.reset = function(){
        play.ball.x = -Math.random()*200 + Math.random()*200 + (game.width/2);
        play.ball.y = game.height - (game.height/7);

        play.ball.anchor.x = 0.5;
        play.ball.anchor.y = 0.5;

        play.ball.scale.x = (game.width/5) / game.width;
        play.ball.scale.y = (game.width/5) / game.width;

        play.kicked = false;

        play.posts.anchor.x = 0.5;
        play.posts.anchor.y = 1;

        play.posts.x = -Math.random()*100 + Math.random()*100 + (game.width/2);
        play.posts.y = (game.height/2) + 50;




    }

    play.prototype = {
        preload:function(){
            game.load.image('grass', 'grass.jpg');
            game.load.image('crowd', 'crowd2.jpg');
            game.load.image('ball', 'rugby_ball.png');
            game.load.image('posts', 'posts.png');



        },
        create:function(){

            var grass = game.add.sprite(0, 0, 'grass');
            grass.x = game.width/2;
            grass.y = (game.height/2) + grass.height/2;

            grass.anchor.x = 0.5;
            grass.anchor.y = 0.5;

            var crowd = game.add.sprite(0, 0, 'crowd');
            crowd.x = game.width/2;
            crowd.y = (game.height/2);

            crowd.anchor.x = 0.5;
            crowd.anchor.y = 1;
            crowd.scale.x = 0.4;
            crowd.scale.y = 0.4;

            play.posts = game.add.sprite(0, 0, 'posts');
            play.ball = game.add.sprite(0, 0, 'ball');
            play.posts.scale.x = 0.5;
            play.posts.scale.y = 0.5;


            play.reset();


            var swipeCoordX,
                swipeCoordY,
                swipeCoordX2,
                swipeCoordY2,
                swipeMinDistance = 50;

            game.input.onDown.add(function(pointer) {

                if (!play.kicked){
                    swipeCoordX = pointer.clientX;
                    swipeCoordY = pointer.clientY;

                    play.start_counting = true;
                    play.drag_count = 0;
                }


            }, this);

            game.input.onUp.add(function(pointer) {

                if (!play.kicked){
                    swipeCoordX2 = pointer.clientX;
                    swipeCoordY2 = pointer.clientY;

                    play.start_counting = false;

                    play.swipe_vector.x = swipeCoordX2-swipeCoordX;
                    play.swipe_vector.y = swipeCoordY2-swipeCoordY;

                    console.log('play.swipe_vector', play.swipe_vector);
                    play.drag_count = 0;

                    play.kicked = true;



                }


            }, this);

        },

        update:function() {

            if (play.start_counting) {
                play.drag_count++
            }

            if (play.kicked) {
                play.ball.x += play.swipe_vector.x / 25;
                play.ball.y += play.swipe_vector.y / 25;

                play.swipe_vector.y += 5;

                play.ball.rotation += 0.3;

                play.ball.scale.x -= 0.002;
                play.ball.scale.y -= 0.002;

                if (play.ball.y > game.height){
                    play.reset();
                }


            }

        },

    }


    game.state.add("play",play);
    game.state.start("play");
}
