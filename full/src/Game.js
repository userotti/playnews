
BasicGame.Game = function (game) {

    //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world_coords;		//	the game world_coords
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world_coords" or you'll over-write the world_coords reference.

};

BasicGame.Game.prototype = {

    create: function () {

        //
        this.kicksound = this.add.audio('kick');
        this.miss_sound = this.add.audio('miss');
        this.hit_sound = this.add.audio('hit');

        //groups
        this.background_group = this.game.add.group();
        this.group = this.game.add.group();

        //Game constants
        this.viewer = {};

        this.viewer.x = 0;
        this.viewer.y = 200;
        this.viewer.z = 0;

        this.score = 0;
        this.attempts = 0;

        //leke dist 380
        this.viewer.focus_dist = 380;
        this.viewer.fov_angle = Math.PI/2;

        this.gravity = 0.40;

        this.swipeCoordX = 0;
        this.swipeCoordY = 0;
        this.swipeCoordX2 = 0;
        this.swipeCoordY2 = 0;

        //this is for the input
        this.draging_counter = 0;
        this.draging = false;
        this.swipe_vector = new Phaser.Point(0,0);
        this.kicked = false;
        this.kick_done = false;

        this.setupCrowdSprite();
        this.setupGrassSprite();


        this.posts = this.game.add.sprite( this.game.width/2, this.game.height/2 + 40, 'posts');
        this.posts.anchor.x = 0.5;
        this.posts.anchor.y = 1;

        this.posts.scale_factor = 2.85;

        this.posts.hit_area_width = this.posts.scale_factor * 254;
        this.posts.inner_hit_area_width = this.posts.scale_factor * 209;

        this.posts.world_height = this.posts.scale_factor * 411;

        //image dependent
        this.posts.cross_bar_height = 0.38;



        this.group.add(this.posts);

        this.required_posts_scale = this.posts.scale_factor * (420 / this.posts.height);

        this.posts.vectors = {};
        this.posts.vectors.pos = {};
        //
        // this.posts.scale.x = 0.5;
        // this.posts.scale.y = 0.5;

        this.resetPosts();

        this.ball = this.game.add.sprite(0, 0, 'ball');
        this.ball.anchor.x = 0.5;
        this.ball.anchor.y = 0.5;
        this.group.add(this.ball);


        //desired ball scales
        this.required_ball_scale = 0.35 * (302 / this.ball.height);
        console.log('this.required_ball_scale', this.required_ball_scale);

        //should probably change this is as the
        this.ball.rotation_rate = 0;//Math.random() - Math.random();


        //3d world vector attributes
        this.ball.vectors = {};

        this.ball.vectors.pos = {};
        this.ball.vectors.vel = {};
        this.ball.vectors.acc = {};

        this.resetBall();

        //the kick elements
        this.kick_power = {};
        this.kick_power.x = 0;
        this.kick_power.y = 0;
        this.kick_power.z = 0;

        this.kick_age = 0;


        var style = { font: "bold 24px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.score_ui = this.add.text(this.game.width/2, 10, this.score + ' out of ' + this.attempts, style);
        this.score_ui.anchor.x = 0.5;

        this.wind_factor = 0;

        this.createWindUI();
        this.resetWind();

        this.game.input.onDown.add(function(pointer) {

            if (!this.kicked){
                this.swipeCoordX = pointer.clientX;
                this.swipeCoordY = pointer.clientY;

                this.draging = true;
                this.draging_counter = 0;
            }

        }, this);

        this.game.input.onUp.add(function(pointer) {

            if (!this.kicked){
                this.swipeCoordX2 = pointer.clientX;
                this.swipeCoordY2 = pointer.clientY;

                this.swipe_vector.x = this.swipeCoordX2-this.swipeCoordX;
                this.swipe_vector.y = this.swipeCoordY2-this.swipeCoordY;

                this.kick(this.swipe_vector.x, this.swipe_vector.y, this.draging_counter);

                this.draging = false;
                this.draging_counter = 0;
                this.kicked = true;

            }


        }, this);

    },

    update: function () {

        this.accelerateBall();
        this.moveBall();
        this.checkBounce();
        this.placeBall();

        if (this.kicked){
            this.kick_age++;
        }

        if ((this.kick_age > 400) || (this.ball.bounces > 2) || ((this.kick_age > 250) && this.kick_done)){
            this.kick_age = 0;
            this.kicked = false;
            this.resetBall();
            this.resetPosts();
            this.resetWind();

        }

        if (this.draging){
            this.draging_counter++;
        };

        if (this.ball.vectors.pos.z > this.posts.vectors.pos.z){
            this.group.bringToTop(this.ball);
        }else{
            this.group.bringToTop(this.posts);
        }

        if (this.ball.vectors.pos.z > this.viewer.z){
            this.ball.visible = false;
            this.kick_done = true;
        }
        //passed the posts
        if (!this.kick_done){
            if (this.ball.vectors.pos.z < this.posts.vectors.pos.z){
                console.log('over?');
                if ((this.ball.vectors.pos.x < this.posts.vectors.pos.x + this.posts.hit_area_width/2) && (this.ball.vectors.pos.x > this.posts.vectors.pos.x - this.posts.hit_area_width/2)){

                    if ((this.ball.vectors.pos.x < this.posts.vectors.pos.x + this.posts.inner_hit_area_width/2) && (this.ball.vectors.pos.x > this.posts.vectors.pos.x - this.posts.inner_hit_area_width/2)){

                        console.log('this.posts.world_height * this.posts.cross_bar_height', this.posts.world_height * this.posts.cross_bar_height);
                        console.log('this.ball.vectors.pos.y', this.ball.vectors.pos.y);

                        if (this.ball.vectors.pos.y > (this.posts.world_height * this.posts.cross_bar_height)) {


                            if (!this.ball.bounces){
                                console.log('yes!');
                                this.score++;
                                this.setScore();
                                this.kick_age = this.kick_age + 100;
                                this.hit_sound.play();

                            } else {
                                console.log('no. it bounced');
                                this.miss_sound.play();
                            }

                        } else {

                            if (this.ball.vectors.pos.y > (this.posts.world_height * this.posts.cross_bar_height) - 70){
                                var speed = this.getBallSpeed();
                                this.ball.vectors.vel.y += (Math.random() - Math.random()) * speed * 0.9;
                                this.ball.vectors.vel.x += (Math.random() - Math.random()) * speed * 0.3;
                                this.ball.vectors.vel.z *= -0.4;
                                this.ball.bounces++;
                                this.ball.vectors.pos.z = this.posts.vectors.pos.z + 0.1;
                                this.setBallRoationRate(0.01);
                                this.miss_sound.play();

                                console.log('no. hit the cross barr!');
                            } else {
                                console.log('no. between the posts, but not high enough');
                                this.miss_sound.play();
                            }


                        }
                    } else {

                        if (this.ball.vectors.pos.y < this.posts.world_height){
                            console.log('no. hit the upright!');
                            var speed = this.getBallSpeed();
                            this.ball.vectors.vel.y += (Math.random() - Math.random()) * speed * 0.3;
                            this.ball.vectors.vel.x += (Math.random() - Math.random()) * speed * 0.3;
                            this.ball.vectors.vel.z *= -0.5;
                            this.ball.bounces++;
                            this.ball.vectors.pos.z = this.posts.vectors.pos.z + 0.1;
                            this.setBallRoationRate(0.01);
                            this.miss_sound.play();
                        } else {
                            if (!this.ball.bounces){
                                console.log('yes!');
                                this.score++;
                                this.setScore();
                                this.kick_age = this.kick_age + 100;
                                this.hit_sound.play();

                            } else {
                                console.log('no. it bounced');
                                this.miss_sound.play();
                            }
                        }
                    }
                } else {
                    console.log('no. not between the posts');
                    this.miss_sound.play();
                }

                this.kick_done = true;

            }
        }


    },

    checkBounce: function(){
        // bounce time

        //hit the floor
        if (this.ball.vectors.pos.y < 0){
            var speed = this.getBallSpeed();
            this.ball.vectors.vel.y *= -0.8;
            this.ball.vectors.vel.x += (Math.random() - Math.random()) * speed * 0.3;
            this.ball.vectors.vel.z += (Math.random() - Math.random()) * speed * 0.3;
            this.ball.bounces++;
            this.ball.vectors.pos.y = 0.01;
            this.setBallRoationRate(0.01);
        }

        //hit the back wall
        if (this.ball.vectors.pos.z < -4000){
            var speed = this.getBallSpeed();
            this.ball.vectors.vel.y += (Math.random() - Math.random()) * speed * 0.3;
            this.ball.vectors.vel.x += (Math.random() - Math.random()) * speed * 0.3;
            this.ball.vectors.vel.z *= -0.1;
            this.ball.bounces++;
            this.ball.vectors.pos.z = -3999;
            this.setBallRoationRate(0.01);

        }


    },


    accelerateBall: function(){

        if ((Math.abs(this.ball.vectors.pos.y) > 5)){
            this.ball.vectors.vel.y -= this.gravity;
        }

        if (this.getBallSpeed() > 0){
            this.ball.vectors.vel.x += 0.1 * this.wind_factor;
        }

    },

    moveBall: function(){
        this.ball.vectors.pos.x += this.ball.vectors.vel.x;
        this.ball.vectors.pos.y += this.ball.vectors.vel.y;
        this.ball.vectors.pos.z += this.ball.vectors.vel.z;
    },

    placeBall: function(){
        var point_deets = this.getPointOnScreen(this.ball.vectors.pos.x, this.ball.vectors.pos.y, this.ball.vectors.pos.z)
        this.ball.x = this.game.width/2 + point_deets._x; //this.ball.vectors.pos.x;
        this.ball.y = this.game.height/2 + point_deets._y;
        this.ball.scale.x = point_deets.scale_y * (this.required_ball_scale);
        this.ball.scale.y = point_deets.scale_x * (this.required_ball_scale);
        this.ball.rotation += this.ball.rotation_rate;

    },

    kick: function(x,y,zAttribute){

        this.ball.vectors.vel.x = -x/8;
        this.ball.vectors.vel.y = ((-y/10) + 14);
        this.ball.vectors.vel.z = -240 * (1 / zAttribute);
        this.setBallRoationRate(0.01);
        this.kicksound.play();
        this.kicked = true;
        this.kick_done = false;
        this.attempts++;
        this.setScore();

        console.log('this.ball.vectors.vel.y:', this.ball.vectors.vel.y);

    },

    //This function does the math to place a point from 3d world to 2d canvas
    //_y is the difference from the center of the view.
    getPointOnScreen: function(worldX, worldY, worldZ) {

        var stuff = {};
        stuff.point_focus_angle_y = Math.atan2(this.viewer.y - worldY, this.viewer.z - worldZ);
        stuff.point_focus_angle_x = Math.atan2(this.viewer.x - worldX, this.viewer.z - worldZ);

        stuff._y = (Math.tan(stuff.point_focus_angle_y) * (this.viewer.focus_dist));
        stuff._x = (Math.tan(stuff.point_focus_angle_x) * (this.viewer.focus_dist));

        stuff.dist_to_point = Math.cos(stuff.point_focus_angle_y) * (this.viewer.z - worldZ); //lang een
        stuff.dist_to_focus_point = Math.cos(stuff.point_focus_angle_y) * (this.viewer.focus_dist); //kort een
        stuff.scale_y = (stuff.dist_to_focus_point/stuff.dist_to_point);

        stuff.dist_to_point = Math.cos(stuff.point_focus_angle_x) * (this.viewer.z - worldZ); //lang een
        stuff.dist_to_focus_point = Math.cos(stuff.point_focus_angle_x) * (this.viewer.focus_dist); //kort een
        stuff.scale_x = (stuff.dist_to_focus_point/stuff.dist_to_point);

        return stuff;
    },

    getBallSpeed: function() {
        return Math.sqrt(Math.pow(this.ball.vectors.vel.x,2) + Math.pow(this.ball.vectors.vel.y,2), Math.pow(this.ball.vectors.vel.z,2));
    },

    resetBall: function() {
        //initial placement 560 680
        this.ball.vectors.pos.x = (Math.random() - Math.random()) * 100;//this.game.width/2;
        this.ball.vectors.pos.y = 5;
        this.ball.visible = true;
        //-3600 onder die pale
        //starting point -450
        this.ball.vectors.pos.z = -450;

        //ball velocity
        this.ball.vectors.vel.x = 0;
        this.ball.vectors.vel.y = 0;
        this.ball.vectors.vel.z = 0;//-5;

        //ball acceleation
        this.ball.vectors.acc.x = 0;
        this.ball.vectors.acc.y = 0;
        this.ball.vectors.acc.z = 0;

        this.ball.rotation_rate = 0;
        this.ball.rotation = 0;
        this.ball.bounces = 0;

    },

    resetPosts: function(){


        //initial placement
        this.posts.vectors.pos.x = (Math.random() - Math.random()) * 500;
        this.posts.vectors.pos.y = 0;
        this.posts.vectors.pos.z = -(Math.random() * 1000) -1500;

        //place posts
        var point_deets = this.getPointOnScreen(this.posts.vectors.pos.x, this.posts.vectors.pos.y, this.posts.vectors.pos.z)

        this.posts.x = this.game.width/2 + point_deets._x; //this.ball.vectors.pos.x;
        this.posts.y = this.game.height/2 + point_deets._y;

        //ball size
        this.posts.scale.x = point_deets.scale_y * (this.required_posts_scale);
        this.posts.scale.y = point_deets.scale_x * (this.required_posts_scale);


    },

    createWindUI: function(){

        this.positive_winds = []
        for (var i = 0; i < 3; i++){
            var wind = this.game.add.sprite((i * 30) + 30, this.game.height - 30, 'windflag');
            wind.anchor.x = 0.5;
            wind.anchor.y = 0.5;
            wind.scale.x = -0.07;
            wind.scale.y = 0.07;
            wind.visible = false;
            this.positive_winds.push(wind);

        }

        this.negative_winds = []
        for (var i = 0; i < 3; i++){
            var wind = this.game.add.sprite((i * 30) + 30, this.game.height - 30, 'windflag');
            wind.anchor.x = 0.5;
            wind.anchor.y = 0.5;
            wind.scale.x = 0.07;
            wind.scale.y = 0.07;
            wind.visible = false;
            this.negative_winds.push(wind);
        }

    },

    resetWind: function(){
        this.wind_factor = Math.floor(Math.random() * (3 - (-3) + 1)) + -3;
        this.positive_winds.forEach(function(wind){
            wind.visible = false;
        })

        this.negative_winds.forEach(function(wind){
            wind.visible = false;
        })

        if (this.wind_factor > 0){
            for (var i = 0; i < this.positive_winds.length; i++){
                if (i < Math.abs(this.wind_factor)){
                    this.positive_winds[i].visible = true;
                }
            }
        } else {
            for (var i = 0; i < this.negative_winds.length; i++){
                if (i < Math.abs(this.wind_factor)){
                    this.negative_winds[i].visible = true;
                }
            }
        }

        console.log('this.negative_winds', this.negative_winds);
        console.log('this.positive_winds', this.positive_winds);

        console.log('this.wind_factor', this.wind_factor);


    },

    setBallRoationRate: function(rate){
        this.ball.rotation_rate = (Math.random() - Math.random()) * (this.getBallSpeed() * rate);
    },

    setupCrowdSprite: function(){
        this.crowd = this.game.add.sprite(0, 0, 'crowd');
        this.crowd.x = this.game.width/2;
        this.crowd.y = this.game.height/2;
        this.crowd.anchor.x = 0.5;
        this.crowd.anchor.y = 1;

        this.background_group.add(this.crowd);
    },

    setScore: function(){
        this.score_ui.text = this.score + ' out of ' + this.attempts;
    },

    setupGrassSprite: function(){
        this.grass = this.game.add.sprite(0, 0, 'grass');
        this.grass.x = this.game.width/2;
        this.grass.y = this.game.height/2;
        this.grass.anchor.x = 0.5;
        this.grass.anchor.y = 0;

        this.background_group.add(this.grass);
    },

    quitGame: function (pointer) {

        //	Here you should destroy anything you no longer need.
        //	Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //	Then let's go back to the main menu.
        this.state.start('MainMenu');

    }


};
