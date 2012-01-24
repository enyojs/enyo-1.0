enyo.kind({
	name: "widgets.ListSelectors",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", components: [
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "Status", className: "enyo-label"},
				{kind: "ListSelector", contentPack: "end", flex: 1, items: [
					{caption: "Away", value: 1, icon: "images/status-away.png"},
					{caption: "Available", value: 2, icon: "images/status-available.png"},
					{caption: "Offline", value: 3, icon: "images/status-offline.png"}
				]},
			]},
			
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "Search (Item hidden)", className: "enyo-label"},
				{kind: "ListSelector", value: 3, flex: 1, hideItem: true, items: [
					{caption: "Google", value: 1},
					{caption: "Yahoo", value: 2},
					{caption: "Bing", value: 3}
				]},
			]},
			
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "Method (Arrow hidden)", className: "enyo-label"},
				{kind: "ListSelector", value: "im", contentPack: "end", flex: 1, hideArrow: true, items: [
					{caption: "Phone", value: "phone"},
					{caption: "Instant Messenger", value: "im"},
					{caption: "Email", value: "email"},
					{caption: "Conversation", value: "text"}
				]},
			]},
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "Disabled", className: "enyo-label"},
				{kind: "ListSelector", contentPack: "end", disabled: true, value: 1, flex: 1, items: [
					{caption: "Disabled", value: 1},
					{caption: "Enabled", value: 2}
				]},
			]},
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "List selector inside a button", className: "enyo-label", flex: 1},
				{kind: "Button", style: "padding: 0 8px; margin: 0;", components: [
					{kind: "ListSelector", value: 1, items: [
						{caption: "Google", value: 1},
						{caption: "Yahoo", value: 2},
						{caption: "Bing", value: 3}
					]}
				]}
			]},
			{layoutKind: "HFlexLayout", align: "center", components: [
					{kind: "ListSelector", popupAlign: "left", label: "List selector pops at left", hideItem: true, flex: 1, items: [
						{caption: "Google", value: 1},
						{caption: "Yahoo", value: 2},
						{caption: "Bing", value: 3}
				]},
			]},
			{layoutKind: "HFlexLayout", align: "center", components: [
				{kind: "ListSelector", label: "Search provider", flex: 1, items: [
					{caption: "Google", value: 1},
					{caption: "Yahoo", value: 2},
					{caption: "Bing", value: 3}
				]}
			]},
		]}
	]
});