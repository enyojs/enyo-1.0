enyo.kind({
	name: "FilePickerTestApp",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "This is an app which uses the FilePicker to select a file."},
		{kind: "Button", caption: "Show Image FilePicker", onclick: "showImageFilePicker"},
		{name:'filePicker', kind: "FilePicker", fileType:["image"], allowMultiSelect:false, onPickFile: "handleResult"},

		//To select Audio and Documents
		{kind: "Button", caption: "Show Audio/Doc FilePicker", onclick: "showAudioDocFilePicker"},
		{name:'audioDocPicker', kind: "FilePicker", fileType:["audio", "document"], allowMultiSelect:true, onPickFile: "handleResult"},

		//To Select Ringtones
		//curretRingtonePath is an optional except for Sounds and Alerts.
		{kind: "Button", caption: "Show Ringtone FilePicker", onclick: "showRingtoneFilePicker"},
		{name:'ringtonePicker', kind: "FilePicker", fileType:["ringtone"], currentRingtonePath:"/media/internal/ringtones/Pre.mp3", onPickFile: "handleResult"},

		{kind: "Button", caption: "Show Video FilePicker", onclick: "showVideoFilePicker"},
		{name:'videoPicker', kind: "FilePicker", fileType:["video"], onPickFile: "handleResult"},

		{flex:1, name: "selectedFiles"}
	],

	showImageFilePicker: function(inSender, inEvent) {
		this.$.filePicker.pickFile();
	},
	showAudioDocFilePicker: function(inSender, inEvent) {
		this.$.audioDocPicker.pickFile();
	},
	showRingtoneFilePicker: function(inSender, inEvent) {
		this.$.ringtonePicker.pickFile();
	},
	showVideoFilePicker: function(inSender, inEvent) {
		this.$.videoPicker.pickFile();
	},
	handleResult: function(inSender, msg) {
		this.$.selectedFiles.setContent("Selected Files : "+enyo.json.stringify(msg));
	}
});