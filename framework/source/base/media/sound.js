/**
A component that allows you to play sound effects or other audio resources.  This component is an abstraction of HTML 5 Audio object.

Initialize a sound component as follows:

	{kind: "Sound", src: "http://mydomain.com/media/myfile.mp3"}
	
To play a sound, do this:

	this.$.sound.play();

You can get a reference to the actual HTML 5 Audo object via <code>this.$.sound.audio</code>.
*/
enyo.kind({
	name: "enyo.Sound",
	kind: enyo.Component,
	published: {
		/** URL of the sound file to play, can be relative to the application HTML file */
		src: "",
		/** if true, load the sound file when control is created, trading more network/memory use for latency */
		preload: true,
		/** (webOS only) sound channel through which to play audio. Default is "defaultapp" which is used for
			application feedback. use "media" for playback of music */
		audioClass: null
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.srcChanged();
		this.preloadChanged();
		this.audioClassChanged();
	},
	srcChanged: function() {
		var path = enyo.path.rewrite(this.src);
		if (window.PhoneGap) {
			this.media = new Media(path);
		} else {
			this.audio = new Audio();
			this.audio.src = path;
		}
	},
	preloadChanged: function() {
		//this.setAttribute("autobuffer", this.preload ? "autobuffer" : null);
		if (this.audio) {
			this.audio.setAttribute("preload", this.preload ? "auto" : "none");
		}
	},
	audioClassChanged: function() {
		if (this.audio) {
			if (this.audioClass) {
				this.audio.setAttribute("x-palm-media-audio-class", this.audioClass);
			}
			else {
				this.audio.removeAttribute("x-palm-media-audio-class");
			}
		}
	}, 
	//* @public
	//* Play the sound.  If the sound is already playing, this will restart playback at the beginning.
	play: function() {
		if (window.PhoneGap) {
			this.media.play();
		} else {
			if (!this.audio.paused) {
				this.audio.currentTime = 0;
			} else {
				this.audio.play();
			}
		}
	}
});
