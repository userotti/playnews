
BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {


	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		this.music = this.add.audio('titleMusic');


		this.title_screen = this.add.sprite(this.game.width/2, 0, 'titlepage');
        this.title_screen.anchor.x = 0.5;

        var style = { font: "bold 24px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        this.show_width = this.add.text(this.game.width/2, this.title_screen.height+ 50, 'screen width: ' + this.game.width, style);
        this.show_width.anchor.x = 0.5;

        this.show_height = this.add.text(this.game.width/2, this.title_screen.height+ 100, 'screen height: ' + this.game.height, style);
        this.show_height.anchor.x = 0.5;


		this.playButton = this.add.button(this.game.width/2, this.game.height/2, 'playButton', this.startGame, this);
        this.playButton.anchor.x = 0.5;
        this.playButton.anchor.y = 0.5;


	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		this.state.start('Game');
        //this.music.play();

	}

};
