/*
 *
 * Chat UI
 *
 * Build a simple side-by-side chat UI in the browser: two chat "windows" that talk to each other.
 *
 */

/*
 * Model:
 * 	ChatServer
 * 		Messages
 *
 * 	Chat
 * 		Buddy
 *  	Messages
 *  		Message
 *  	Input
 *
 *  View:
 *  	ChatClientView (x2)
 *  		Buddy
 *  		MessagesView
 *  			MessageView(s)
 *  		InputView
 */

// A message ~ content, author, timestamp?
var Message = Backbone.Model.extend();

// Collection of messages
var Messages = Backbone.Collection.extend();

// Client-side representation... messages, author, members
var Chat = Backbone.Model.extend({
	defaults: {
		name: "Chat"
	},
	initialize: function() {
		this.set({
			messages: new Messages()
		});
	}
});

// Something to talk to 
var ChatServer = Backbone.Model.extend({
	initialize: function() {
		// Give it messages to listen to
		this.set({
			messages: new Messages()
		});
	}
});


var MessageView = Backbone.View.extend({
	className: 'message',
	tagName: 'li',
	template: _.template('<%= author %>: <%= content %>'),
	render: function() {
		$(this.el).html(this.template(this.model.toJSON() ) );
		return this;
	}
});

var MessagesView = Backbone.View.extend({
	className: 'messages',
	tagName: 'ul',
	addMessage: function(message) {
		var messageView = new MessageView({ model: message });
		$(this.el)
			.append(messageView.render().el)
			.scrollTop(messageView.el.offsetTop);
	},
	render: function() {
		$(this.el).empty();
		this.collection.each(this.addMessage, this);
		return this;
	},
	initialize: function() {
		// Catch new messages
		this.collection.on("add", this.addMessage, this);
	}
});

var ChatView = Backbone.View.extend({
	className: 'chat',
	tagName: 'div',
	template: _.template($("#view-chat").html()),
	render: function() {
		// Set template
		$(this.el).html(this.template(this.model.toJSON() ) );

		// Render messages and put in container
		var messagesView = new MessagesView({ collection: this.model.get('messages') });	
		$(this.el).find(".messages-container").html(messagesView.render().el);

		return this;
	},
	events: {
		"submit": "addMessage"
	},
	addMessage: function(e) {
		// Kill the form
		e.preventDefault();

		// "Submit" the form
		this.model.get("server").get("messages").add($(this.el).find("form").serializeObject() );

		// Reset input
		$(this.el).find("input[name='content']")
			.val("")
			.focus();
	},
	initialize: function() {
		// Listen to the "server"
		this.model.get('server').get('messages').on('add', function(message) {

			// TODO: put this in MessageView; message first needs to know author/id
			var messageObj = message.toJSON();
			if(messageObj.author === this.model.get("author")) {
				messageObj.author = "Me"; // You??
			}

			this.model.get('messages').add(messageObj);

		}, this);

	}
});


// Bundle demo for simplicity's sake
var App = Backbone.Model.extend({
	initialize: function() {
		// Global for checking out if so inclined
		window.chatServer = new ChatServer();

		// Instantiate chats... normally just one
		window.chatters = [
			new Chat({ author: "John" /* Cusack */ , server: chatServer }), 
			new Chat({ author: "Joan" /* Cusack */ , server: chatServer})
		];

		// Render each chat
		_(chatters).each(function(chatter) {
			var chatView = new ChatView({ model: chatter });
			$("#app").append(chatView.render().el);
		});
	}
});


var app = new App();
