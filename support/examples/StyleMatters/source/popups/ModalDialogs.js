enyo.kind({ 
	name: "popups.ModalDialogs", 
	kind: "HeaderView",
	components: [ 
		/* A Simple Error Message */
		{kind: "Button", caption: "Error Message in A Modal Dialog", onclick: "errorClick"},
		
		{kind: "ModalDialog", name: "errorExample", caption: "Error", components:[
			{content: $L("Acknowledge this error"), className: "enyo-text-error warning-icon"},
			{kind: "Button", caption: $L("OK"), onclick: "closePopup", style: "margin-top:10px"},
		]},
		
		/* A RowGroup */
		{kind: "Button", caption: $L("A Row Group in A Modal Dialog"), onclick: "example1Click"},
		{kind: "ModalDialog", name: "rowGroupExample", caption: "Select A File", components:[
			{kind: "RowGroup", components: [
			    {layoutKind: "HFlexLayout", components: [
					{kind: "Image", src: "images/folder.png"},
			        {content: "Photos", flex: 1}
			    ]},
			    {layoutKind: "HFlexLayout", components: [
					{kind: "Image", src: "images/folder.png"},
			        {content: "Music", flex: 1}
			    ]},
				{layoutKind: "HFlexLayout", components: [
					{kind: "Image", src: "images/folder.png"},
			        {content: "Documents", flex: 1}
			    ]}
			]},
			{kind: "Button", caption: "Cancel", onclick: "closePopup"},
		]},
		
		/* Scrollable */
		{kind: "Button", caption: "Scrollable Items in A Modal Dialog", onclick: "example3Click"},
		{kind: "ModalDialog", name: "scrollerExample", caption: "A Bunch of Items", components:[
			{kind: "Group", components: [
				{kind:"Scroller", height: "230px", components:[
				    {kind: "RowItem", className: "enyo-first", layoutKind: "HFlexLayout", components: [
				        {content: "Living Room", flex: 1},
				        {kind: "ToggleButton"}
				    ]},
				    {kind: "RowItem", layoutKind: "HFlexLayout", components: [
				        {content: "Dining Room", flex: 1},
				        {kind: "ToggleButton"}
				    ]},
					{kind: "RowItem", layoutKind: "HFlexLayout", components: [
				        {content: "Bedroom", flex: 1},
				        {kind: "ToggleButton"}
				    ]},
					{kind: "RowItem", layoutKind: "HFlexLayout", components: [
				        {content: "Kitchen", flex: 1},
				        {kind: "ToggleButton"}
				    ]},
					{kind: "RowItem", layoutKind: "HFlexLayout", components: [
				        {content: "Bathroom", flex: 1},
				        {kind: "ToggleButton"}
				    ]},
					{kind: "RowItem", className: "enyo-last", layoutKind: "HFlexLayout", components: [
				        {content: "Garage", flex: 1},
				        {kind: "ToggleButton"}
				    ]},
				]}
			]},
			{kind: "Button", className: "enyo-button-affirmative", caption: $L("Proceed"), onclick: "closePopup"},
		]},
		
		/* Login */
		{kind: "Button", caption: "Name and Password in A Modal Dialog", onclick: "example2Click"},
		
		{kind: "ModalDialog", name: "inputExample", caption: "Login", components:[
			{kind: "RowGroup", components: [
				{kind: "Input", hint: "enter username...", onchange: "inputChange"},
			]},
			{kind: "RowGroup", components: [
				{kind: "PasswordInput", hint: "enter password...", onchange: "inputChange"},
			]},
			{layoutKind: "HFlexLayout", components: [  
	    		{kind: "Button", caption: "Cancel", flex: 1, onclick: "closePopup2"},
		    	{kind: "Button", caption: "Login", flex: 1, onclick: "closePopup2", className: "enyo-button-dark"},
			]}
		]},
		
		
		/* Multiple components */
		{kind: "Button", caption: "Multiple UI Widgets in A Modal Dialog", onclick: "example4Click"},
		{kind: "ModalDialog", name: "multiContentsExample", caption: "Report a Problem", components:[
			{kind: "HFlexBox", components: [                                                                                               
	            {components: [
		           {name: "reportHeaderImage", kind: "Image", src: 'images/appcatalog-appicon-rovio.png', style: "margin-right: 10px"}
			    ]},
				{components: [
			    	{name: "reportHeaderTitle", content: "Angry Birds", className: 'enyo-text-subheader enyo-text-ellipsis'},
	            	{name: "reportHeaderCreater", content: "Rovio", className: 'enyo-text-ellipsis enyo-subtext'}
				]}
	        ]},

			{kind: "Button", components: [
		    	{kind: "ListSelector", name: "problemTypeListSelector", 
				items: [
	        		{caption: "Type of Problem", value:'0'},
	           	   	{caption: "Offensive Content", value:'2'},
	           	   	{caption: "Bug", value:'1'},
	           	   	{caption: "Download", value:'3'}
		     	]}
			]},

			{kind: enyo.Control, content: "Describe how to reproduce the problem.",
		          className: 'enyo-paragraph',
		    },	     

		    {kind: "RichText", className: "enyo-paragraph", hint: "Describe your problem here."},

			{layoutKind: "HFlexLayout", components: [  
	    		{kind: "Button", caption: "Cancel", flex: 1, onclick: "closePopup3"},
		    	{kind: "Button", caption: "Send", flex: 1, onclick: "closePopup3", className: "enyo-button-dark"},
			]}
			
		]},
		
	],

	create: function() {
		this.inherited(arguments);
	}, 
	closePopup: function(inSender, inEvent) {
		inSender.parent.parent.parent.close();
	},
	closePopup2: function(inSender, inEvent) {
		this.$.inputExample.close();
	},
	closePopup3: function(inSender, inEvent) {
		this.$.multiContentsExample.close();
	},
	errorClick: function(inSender, inEvent) {
		this.$.errorExample.openAtCenter();
	},
	example1Click: function(inSender, inEvent) {
		this.$.rowGroupExample.openAtCenter();
	},
	example2Click: function(inSender, inEvent) {
		this.$.inputExample.openAtCenter();
		//this.$.input.forceFocus();
	},
	example3Click: function(inSender, inEvent) {
		this.$.scrollerExample.openAtCenter();
	},
	example4Click: function(inSender, inEvent) {
		this.$.multiContentsExample.openAtCenter();
	},
});