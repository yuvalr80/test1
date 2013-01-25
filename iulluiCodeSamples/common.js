/** 
 * common cross-page client functionality
 * @author yuval 
 */
var APP_URL = "http://www.iullui.com/";
var APP_NAME = "iullui";

var WIKI_COMMONS = "http://upload.wikimedia.org/wikipedia/commons/";
var WIKI_EN = "http://upload.wikimedia.org/wikipedia/en/";
var ITEM_IMAGE_PLACEHOLDER = "/images/placeholder_icon.png";
var ITEM_IMAGE_PLACEHOLDER_EXTENSION = ".png";
var NS_FACEBOOK = "fb-";
var NS_YOUTUBE = "yt-";
var NS_DEFAULT_LENGTH = 3;

var DEFAULT_REQUIRED_WIDTH = 180; // bigger than exact thumb size to prevent reloading mechanism for every landscape image
var DEFAULT_THUMB_SIZE = 100;
var MATCH_THUMB_SIZE = 35;
var MAX_USER_IMAGES = 3;
var MAX_USER_NAMES = 3;
var SEARCH_IMAGE_REFRESH_TIMEOUT = 1000;

var ANIMATION_INTERVAL = 500;

var userSignedIn = false;

//if redirecting to another page (after returning from sign in, for example)
if ($.cookie !== undefined && $.cookie("redirectUri") != null) {
	var uri = $.cookie("redirectUri");
	$.cookie("redirectUri", null);
	window.location = uri;
}

// getting user signin status
$.getJSON("user/signedin/", function(data) { 
	userSignedIn = data; 
});	

// an item domain object
function Item(data, searchContext, thumbSize) {		
	var self = this;
	self.data = data; // for cloning purposes	
	self.id = data.id;
	self.title = data.title;
	self.img = ko.observable(data.img);
	self.url = data.url;
	self.desc = data.description;
	self.ownerId = data.ownerId;
	self.media = ko.observable(data.media);
	 
	self.isFacebook = function() { return self.id.substring(0, NS_FACEBOOK.length) === NS_FACEBOOK;	};
	self.canPlay = ko.observable(self.id !== undefined && (!self.isFacebook() || self.media() != null));
	self.isMediaVideo = function() { return self.media().substring(0, NS_YOUTUBE.length) == NS_YOUTUBE; };
	self.mediaPureId = ko.computed(function() {
		if (self.media() == null) return null;
		return self.media().substring(NS_DEFAULT_LENGTH, self.media().length);
	});
	
	self.thumbSize = ko.observable(thumbSize !== undefined && thumbSize != null ? thumbSize : DEFAULT_THUMB_SIZE);
	self.requiredWidth = ko.observable(DEFAULT_REQUIRED_WIDTH);
	self.displayImage = ko.observable(false);
	
	self.thumb = ko.computed(function() {
		if (self.img() == null || self.img().length == 0) { 
			return ITEM_IMAGE_PLACEHOLDER.replace(
					ITEM_IMAGE_PLACEHOLDER_EXTENSION, 
					"_" + self.thumbSize() + ITEM_IMAGE_PLACEHOLDER_EXTENSION);
		}
		if (self.isFacebook()) {
			return self.img(); 
		}
		var thumb = self.img();
		thumb += "/" + self.requiredWidth() + "px-" + thumb.substring(thumb.lastIndexOf("/") + 1, thumb.length); 
		if (thumb.substring(0, WIKI_COMMONS.length) === WIKI_COMMONS) {
			thumb = thumb.replace(WIKI_COMMONS, WIKI_COMMONS + "thumb/");
		}
		else if (thumb.substring(0, WIKI_EN.length) === WIKI_EN) { 
			thumb = thumb.replace(WIKI_EN, WIKI_EN + "thumb/");
		};
		if (thumb.indexOf(".svg", thumb.length - ".svg".length) !== -1) thumb += ".png";
		
		return thumb;
	});
	
	// for voted items, setting extras
	self.votes = ko.observable(data.votesCount);
	self.voted = ko.observable(data.userVoted);
	self.comment = ko.observable(data.comment);
	self.friends = ko.observableArray(data.friends);
	self.sampleVoters = ko.observableArray(data.sampleVoters);
	
	self.userPhotos = ko.observableArray(prepareUserPhotos());
	self.usersString = ko.computed(function() { return prepareUserString(false); }); 
	self.usersStringTotal = ko.computed(function() { return prepareUserString(true); });
	self.commentString = ko.computed(function() { return (self.comment() != null ? self.comment() : self.desc); });			
	self.voteString = ko.computed(function() { return (self.voted() ? "Unrecommend" : "Recommend"); });

	// preparing recommending users photos by priority: friends, sample users, current user
	function prepareUserPhotos() {
		if (self.votes() == null) return null;
		var friends = (self.friends() != null ? self.friends() : []);
		var sampleVoters = (self.sampleVoters() != null ? self.sampleVoters() : []);
		var userPhotos = [];
		var maxFriendUsers = Math.min(MAX_USER_IMAGES, friends.length);			
		for (var i = 0; i < maxFriendUsers; i++) {
			userPhotos.push({url: "http://graph.facebook.com/" + friends[i].id + "/picture"});
		}
		if (userPhotos.length < MAX_USER_IMAGES) {
			var maxSampleUsers = Math.min(MAX_USER_IMAGES - userPhotos.length, sampleVoters.length);
			for (var i = 0; i < maxSampleUsers; i++) {
				userPhotos.push({url: "http://graph.facebook.com/" + sampleVoters[i].id + "/picture"});
			}
		}
		if (userPhotos.length < MAX_USER_IMAGES && self.voted()) {
			if ($("#userImage") != null) userPhotos.push({url: $("#userImage").attr("src")});
		}
		return userPhotos;
	}
	
	function prepareUserString(total) {
		var str = "";
		var friends = (self.friends() != null ? self.friends() : []);
		
		if (userSignedIn) {
			var users = 0;
			var voters = new Array();
			if (self.voted()) {
				voters.push("You");
				users++;
			}
			var maxFriends = Math.min(MAX_USER_NAMES - users, friends.length);
			for (var i=0; i < maxFriends; i++) {
				voters.push(friends[i].name);
				users++;
			}
			if (self.votes() > users) {
				var others = self.votes() - users;
				voters.push(others + (others == 1 ? " other" : " others"));
			}
			for (var i=0; i < voters.length; i++) {
				str += voters[i];
				if (i < voters.length - 2) {
					str += ",";
				}
				else if (i === voters.length - 2) {
					str += " and";
				}
				str += " ";
			}
		}
		else {
			if (self.votes() > 0) str = self.votes() + (self.votes() == 1 ? " person " : " people "); 
		}
		
		if (str.length > 0) str += (total ? "recommended:" : "recommended this match. ");
		else str = (total ? "You might be also interested in:" : "No one has recommended this match yet. ");
		
		return str;
	}

	
	/***** images *****/
	
	// is item removed - useful for search scenarios when many items are displayed at once, 
	// while most of them removed shortly afterwards
	self.itemRemoved = ko.observable(false);  
	self.imageCorrected = ko.observable(false);
	
	// reloading the image with a landscape thumb in case height is smaller than default thumb size
	self.imageLoaded = function(data, event) {
		// if the image loaded before its fade animation ends, image width/height will be 0, so need to delay the handling
		var delay = $(event.target).is(":visible") ? 0 : ANIMATION_INTERVAL + 100; 
		setTimeout(function() {
			var img = $(event.target);
			var width = img.width();
			var height = img.height();

			// the image container width (container is guaranteed to be the thumb sized square)
			var parentWidth = img.parent().width(); 
			
			// if necessary, correcting the required width and re-triggering thumb image loading
			if (height < parentWidth) {
				self.requiredWidth(Math.round(width * (parentWidth / height)));
				return false;
			}

			// resize the image by height or width (the lower between the two) and crop it in the div
			var scale = parentWidth / (height <= width ? height : width);
			img.width(width * scale);
			img.height(height * scale);
			
			// if image is portrait - we're done (margin 0 0). 
			// for landscape images, we need to centralize the crop area
			if (width > height) {
				img.css("margin-left", img.width() / -2 + parentWidth / 2);
			};

			self.displayImage(true);
		}, delay);
		
	};
	
	// correcting broken image links
	self.refreshImage = function() {
		if (self.imageCorrected()) { // if after correction an error still occurs, setting a placeholder
			self.img(null);
			return false;
		}
		if (!self.itemRemoved()) { // refreshing the item on server side
			self.imageCorrected(true);
			$.getJSON("api/refresh/" + self.id, function(refreshedItem) {
				if (refreshedItem != null) {
					self.requiredWidth(self.thumbSize());
					self.img(refreshedItem.img);
				}
			});
		};
	};
	
	if (self.img() == null && self.id !== undefined) {
		if (searchContext) {  // waiting in case of search
			setTimeout(function() { self.refreshImage(); }, SEARCH_IMAGE_REFRESH_TIMEOUT);
		}
		else {
			self.refreshImage();			
		}
	}
}

// an items match domain object
function Match(data) { 
	var self = this;
	self.parent = new Item(data.parent, false, MATCH_THUMB_SIZE);
	self.child = new Item(data.child, false, MATCH_THUMB_SIZE);
	self.userId = data.userId;
	self.userName = data.name;
	self.userImg = "http://graph.facebook.com/" + self.userId + "/picture";
	self.comment = data.comment;
	self.timestamp = data.timestamp;
}

// layout fix init for IE
function initLayoutFix() {
	var win = jQuery(window);
	var bottomOffset = 15;
	jQuery('div.aside-frame div.scroll-box').each(function() {
		var scrollBox = jQuery(this);
		function fixHeight() {
			scrollBox.css({height: ''});
			var newH = (window.innerHeight || win.height()) - scrollBox.offset().top;
			newH = Math.min(newH - bottomOffset, scrollBox.height());
			scrollBox.css({height: newH});
		}
		fixHeight();
		win.bind('load resize orientationchange', fixHeight);
	});
}

	