/** 
 * main app script
 * @author yuval 
 */
$(function() {
	
	var MAX_LATEST_MATCHES = 20;
	var TICKER_POLE_INTERVAL = 7500;
	
	var TITLE_STRING = "iullui - People recommend";
	var GOOGLE_IM_FEELING_LUCKY = "http://www.google.com/search?q=${search}&btnI";
	
	var STATE_INIT = 0;
	var STATE_PARENT = 1;
	var STATE_PARENT_RECOMMENDATIONS = 2;
	var STATE_PARENT_RECOMMENDATIONS_CHILD = 3;
	

	var parentItemsViewModel = new ItemsViewModel();
	var childItemsViewModel = new ItemsViewModel();
	var matchesViewModel = new MatchesViewModel();
	var tickerViewModel = new TickerViewModel();
	var stateViewModel = new StateViewModel();

	
	// knockout.js ViewModel for parent / child items
	function ItemsViewModel() { 
		var self = this;
		self.items = ko.observableArray();
		self.selectedItem = ko.observable();
		self.search = ko.observable();

		self.processing = ko.observable(false);
		self.isSelected = ko.observable(false);
		self.isSearching = ko.observable(false);
		self.lastCall = null;
		
		self.eg = ko.observable(null);
		
		self.inputHasFocus = ko.computed({
	        read: function() {
	        	return self.isSelected(); 
	        },
	        write: function(value) {
				if (!$.browser.msie || (value)) { // not allowing focus lost in ie since it also responds to scrolling
					self.isSelected(value);
				}
	        },
	        owner: this
		});
		
		// used for cancellation of mousedowns on dropdown when it is open so focus won't be lost
		self.cancelBubble = function(data, e) {			
			if (window.event != null) {
				window.event.cancelBubble = true; // cancelling IE event
			}
			e.returnValue = false;
			e.preventDefault();
			return false;
		};
		
		self.isSelected.subscribe(function(selected) {
		    self.search((selected ? null : (self.selectedItem() != null ? self.selectedItem().title : null)));
		    if (!selected) { 
		    	self.clearSearchItems();
		    }
		});

		self.search.subscribe(function(searchterm) {
			self.isSearching(searchterm != null && searchterm !== "" 
					&& (self.selectedItem() == null || searchterm !== self.selectedItem().title));
			if (self.isSearching()) {
				self.processing(true);
				if (self.lastCall != null) self.lastCall.abort(); // aborting last call so only latest results will be handled 
				self.lastCall = $.getJSON("api/items?search=" + encodeURI(searchterm), searchItemsHandler);
			}
			else {
				self.clearSearchItems();
			}
		});
		
		self.clearSearchItems = function() { 
			$.each(self.items(), function(index, item) {
				item.itemRemoved(true);
			});
			self.items.removeAll();
		};
		
		// event handler for a list item selection 
		self.selectItem = function(item) {			
			self.selectedItem(item);
			if (self.selectedItem() != null) self.selectedItem().thumbSize(DEFAULT_THUMB_SIZE);
			self.clearSearchItems();
			self.processing(false);
			self.isSelected(false);
			self.search(item ? item.title : "");
		};

		self.loadItem = function(itemId, parentId) {
			self.processing(true);
			var url = "api/items/" + itemId;
			if (parentId !== undefined && parentId != null) url += "?parent=" + parentId;
			$.getJSON(url, function(data) { 
				self.selectItem(new Item(data)); 
			});
		};
		
		self.selectParent = function(item) { 
			childItemsViewModel.selectItem(null);
			parentItemsViewModel.selectItem(item);
		};
		
		// child-specific behavior
		self.recommendButtonText = ko.observable("Recommend match");
		self.recommendButtonMouseover = function() { self.recommendButtonText("Sign in..."); };
		self.recommendButtonMouseout = function() { self.recommendButtonText("Recommend match"); };
		
		self.parentTitle = function() {
			if (parentItemsViewModel === undefined || parentItemsViewModel.selectedItem() == null) return null;
			return parentItemsViewModel.selectedItem().title; 
		};		
		
		self.loadChild = function(child) {
			return self.loadItem(child.id, parentItemsViewModel.selectedItem().id);
		};
		
		self.voteChild = function(item) { 
			matchesViewModel.vote(item);
		};

		self.unvoteChild = function(item) { 
			matchesViewModel.unvote(item);
		};

		self.goToWebsite = function(item, e) {
			e.preventDefault();
			stateViewModel.goToWebsite(item);
		};
		
		self.play = function(item, e) {
			stateViewModel.play(item);
		};
		
		// parsing the response and adding items to the list
		function searchItemsHandler(data) {
			self.processing(false);
			self.clearSearchItems();
			$.each(data, function() {
				self.items.push(new Item(this, true));	
			});
		};
		
		self.postToFeed = function(data, e) {
			stateViewModel.postToFeed(data, e);
		};
		

	}
	
	// matches view model
	function MatchesViewModel() { 
		var self = this;
		self.matches = ko.observableArray();
		self.processing = ko.observable(false);
		self.summary = ko.observable(null);
		
		self.parent = ko.computed(function() {
			if (parentItemsViewModel.selectedItem() !== undefined 
					&& parentItemsViewModel.selectedItem() != null) {
				return parentItemsViewModel.selectedItem().title;
			}
			else return null;
		});
		
		self.displayVotes = ko.computed(function() { 
			return (parentItemsViewModel.selectedItem() != null);
		});
		
		self.canVote = ko.computed(function() {
			var parent = parentItemsViewModel.selectedItem();
			var child = childItemsViewModel.selectedItem();
			return (parent != null && child != null && parent.id !== child.id);
		});
		
		self.vote = function(child) {
			if (!userSignedIn) return;
			self.processing(true);
			$.ajax({
			    type: "PUT",
			    url: "api/matches/" + parentItemsViewModel.selectedItem().id + "/" + child.id,
			    success: function(data) {
			    	voteUnvoteHandler(child); 
			    },
			    error:function (xhr, ajaxOptions, thrownError) {
			    	self.processing(false);
                    alert("Error: " + xhr.status + "\n" + thrownError);
			    }
			});
		};
		
		self.unvote = function(child) {
			if (!userSignedIn) return;
			self.processing(true);
			$.ajax({
			    type: "DELETE",
			    url: "api/matches/" + parentItemsViewModel.selectedItem().id + "/" + child.id,
			    success: function(data) {
			    	voteUnvoteHandler(null);
			    },
			    error:function (xhr, ajaxOptions, thrownError){
			    	self.processing(false);
                    alert("Error: " + xhr.status + "\n" + thrownError);
                }
			});
		};
		
		parentItemsViewModel.selectedItem.subscribe(function(item) {
			if (item != null) { 
				self.processing(true);
				self.summary(null);
				self.matches.removeAll();
				$.getJSON("api/matches/" + item.id, loadMatchesHandler);
			};
		});	

		self.selectChild = function(item) { 
			if (item != null) { 
				var child = new Item(item.data); // cloning the item
				childItemsViewModel.selectItem(child);
			}
			else childItemsViewModel.selectItem(null);
		};

		self.addRecommendation = function() {
			stateViewModel.state(STATE_PARENT_RECOMMENDATIONS_CHILD);
		};
		
		// handles vote/unvote success - reloads votes
		function voteUnvoteHandler(item) {
			$.getJSON("api/matches/" + parentItemsViewModel.selectedItem().id, function(data) {
				loadMatchesHandler(data);				
				if (item) { // refresh the selected item
					$.each(self.matches(), function(i, child) { 
						if (child.id === item.id) item = child;
					});
				}
				self.selectChild(item);				
				if (childItemsViewModel.selectedItem() != null) {
					scrollToItem(childItemsViewModel.selectedItem());
				}	
				stateViewModel.handleChildVoted();
			});
		}
		
		function loadMatchesHandler(data) {
			self.processing(false);
			self.matches.removeAll();
			self.summary(new Item(data));			
			$.each(data.children, function(i, item) {
				self.matches.push(new Item(item));
			});
		};

		function scrollToItem(item) {
			if($("#match_" + item.id).length == 0) return; 
			$("#matchesList").scrollTo("#match_" + item.id, ANIMATION_INTERVAL);
		};
		
	};
	
	// ticker view model
	function TickerViewModel() {
		var self = this;
		
		self.matches = ko.observableArray();
		self.processing = ko.observable(true);
		
		$.getJSON("api/matches/latest?limit=" + MAX_LATEST_MATCHES, function(data) {
			self.matches.removeAll();
			$.each(data, function() {
				self.matches.push(new Match(this));	
			});
			self.processing(false);
		});

		function refreshTicker() {
			if (self.matches().length == 0) return;
			$.getJSON("api/matches/latest?limit=1", function(data) {
				var match = new Match(data[0]);
				var contained = false;
				$.each(self.matches(), function() { 
					if (this.parent.id == match.parent.id && this.child.id == match.child.id 
							&& this.userId == match.userId) contained = true; 
				});
				
				if (!contained) {
					self.matches.unshift(match);
					self.matches.pop();
				}
				else {  
					self.matches.unshift(self.matches.pop());
				};
			});	
		}

		self.showMatch = function(elem)  {			
			if (elem.nodeType === 1) {
				var offset = $(elem).offset();
				var height = $(elem).height();
				$(elem).offset({ top: offset.top - height - 15, left: offset.left});
				$(elem).hide().slideDown(ANIMATION_INTERVAL);
			}
		};
		
		self.hideMatch = function(elem) { 
			if (elem.nodeType === 1) $(elem).slideUp(function() { $(elem).remove(); }); 
		}; 
		
		self.goToMatch = function(match) {
			matchesViewModel.matches.removeAll();
			parentItemsViewModel.selectItem(match.parent);
			childItemsViewModel.loadChild(match.child);
		};
		
		window.setInterval(refreshTicker, TICKER_POLE_INTERVAL);
	};
	
	// state and history view model
	function StateViewModel() {
		var self = this;
		var History = window.History;
		var currentState = STATE_INIT;
		
		// state and animation management
		self.state = ko.computed({
	        read: function () {
	            return currentState;
	        },
	        write: function(newState) {
	        	// TODO: #146
	        	$("#parentDrop").hide();
	        	$("#childDrop").hide();
	        	
	        	switch(currentState) {
		        	case STATE_PARENT:
		        		if (newState === STATE_PARENT_RECOMMENDATIONS || newState === STATE_PARENT_RECOMMENDATIONS_CHILD) {
		        			$("#parentBox").animate({top: "-65"}, ANIMATION_INTERVAL,
		        				function() {
		        					if (newState === STATE_PARENT_RECOMMENDATIONS_CHILD) {
		        						$("#matchesBox").css("left", 0);
		        						$("#childBox").fadeIn();
		        					}
		        					$("#matchesBox").fadeIn();
		        				}
		        			);
		    			}
		        		break;
		        	case STATE_PARENT_RECOMMENDATIONS:
		        		if (newState === STATE_PARENT_RECOMMENDATIONS_CHILD) {
		        			var left = $("#matchesBox").css("left");
		        			$("#matchesBox").animate({left: "-=" + left}, ANIMATION_INTERVAL, 
		        				function() {
		        					$("#childBox").fadeIn();
		        				}
		        			);
		        		}
		        		break;
		        	case STATE_PARENT_RECOMMENDATIONS_CHILD:
		        		if (newState === STATE_PARENT_RECOMMENDATIONS) {
        					$("#childBox").fadeOut(function() {
        						$("#matchesBox").animate({left: "+=160"}, ANIMATION_INTERVAL);
        					});		        		
		        		}
		        		break;
	        	}	
	        	
	        	// walkthrough wizard messages
	        	if ($.cookie("content-maker-guide")) {
	        		$(".messi").remove();
	        		switch(newState) {
	        			case STATE_PARENT:
	        				if ($.cookie("content-maker-guide")) {
	        					$("#whatDoYouLike").text("What does your audience like?");
	        				}
        		    		new Messi(
       		    				'<img src="images/favorite.png" style="width:70px; height:70px; float:left; margin:0 10px 0 0;"/>' +        		    				
        						'<p>Next, please select an item that your target audience is likely to search. For example: a favorite artist, book or movie.</p>', 
        						{title: 'Item added!', titleClass: "info", center: false, width: 300});
	        				break;
	        			case STATE_PARENT_RECOMMENDATIONS:
	        	    		new Messi('<img src="images/you.png" style="width:70px; height:70px; float:left; margin:0 10px 0 0;"/>' + 
	        	    			'<p>In the list below you can see which matches are already recommended for the item you selected. ' + 
        	    				'Click the <img src="images/add_icon_100.png" style="width:16px; height:16px;"/> <span>Add...</span> button to add your item.</p>', 
        	    				{title: 'Sweet!', titleClass: "info", center: false, width: 300});
	        				break;
	        			case STATE_PARENT_RECOMMENDATIONS_CHILD:
		        			if ($.cookie("content-maker-guide")) {
		        				$("#recommendMatch").text("Match yourself");
		        				$("#btnRecommend").text("Match");
		        			}
	        				if (!childItemsViewModel.selectedItem()) {
	        					var title = "this";
	        					if (parentItemsViewModel.selectedItem() !== undefined && parentItemsViewModel.selectedItem() != null) {
	        						title = parentItemsViewModel.selectedItem().title;
	        					}
	        					var ownedItemImages = $.cookie("content-maker-item-images");
	        					var images = "";
	        					if (ownedItemImages != null) {
	        						ownedItemImages = ownedItemImages.split(",");
	        						for (var i=0; i<ownedItemImages.length; i++) {
	        							images += '<img src="' + ownedItemImages[i] + '" style="width:20px;height:20px;"/>';
	        						}
	        					}
		        	    		new Messi('<img src="images/you.png" style="width:70px; height:70px; float:left; margin:0 10px 0 0;"/>' +
		        	    			'<p>Now you can select your added item, to be matched and recommended for people who like <span>' + title + '</span>:<br/>' 
		        	    			+ images + "</p>", {title: 'Getting close!', titleClass: "info", center: false, width: 300});
	        				}
	        				else {
	        					var img = "images/you.png"; 
	        					if (childItemsViewModel.selectedItem() !== undefined && childItemsViewModel.selectedItem() != null) {
	        						img = childItemsViewModel.selectedItem().img();
	        					}
	        					new Messi('<img src="' + img + '" style="width:70px; height:70px; float:left; margin:0 10px 0 0;"/>' +
	        						'Great! Now all that\'s left to do is to <span>Match</span> your item with the favorite.', 
	        						{title: 'Almost done!', titleClass: "info", center: false, width: 300});
	        				}
        					break;
	        		}
	        	};
	        	currentState = newState;	
	        },
	        owner: this
	    });
	    
		// initialize parent and child by url params
		function urlParam(name) {
		    var results = new RegExp("[\\?&]" + name + "=([^&#]*)").exec(window.location.href);
		    return (results ? results[1] : null);
		};
		
		// if not specified a match, check for a match cookie and load uri
		if (urlParam("parent") == null && urlParam("child") == null && !$.cookie("content-maker-guide")) {
			var uri = $.cookie("match");
			if (uri != null && uri.length > 0) {
				History.replaceState(
					{"parent" : urlParam("parent"), "child" : urlParam("child")}, 
					TITLE_STRING, uri);
				$.removeCookie("match");
			}
		}
		
		// load by specified uri params
		if (urlParam("parent") != null) { 
			parentItemsViewModel.loadItem(urlParam("parent")); 
			if (urlParam("child") != null) {
				self.state(STATE_PARENT_RECOMMENDATIONS_CHILD);
				childItemsViewModel.loadItem(urlParam("child"), urlParam("parent")); 
			}
			else {
				self.state(STATE_PARENT_RECOMMENDATIONS);
			}
		}
		else {
			self.state(STATE_PARENT);
			// initializing e.g metadata
			$.getJSON("data/eg.json", function(data) {
				parentItemsViewModel.eg("e.g " + data[Math.floor(Math.random() * (data.length - 1))]);
			});
		}
		
		// return the current state uri
		self.uri = function(parent, child) { 
			return (parent != null ? "matches?parent=" + parent.id + 
					(child != null ? "&child=" + child.id : "") : "/");
		};
		
		self.baseUrl = function() { 
			return History.getBaseUrl();
		};
		
		// returning the url according to selection  
		self.matchUrl = function(parent, child) {
			return self.baseUrl() + self.uri(parent, child);
		};
		
		// returning the title match string
		self.matchTitle = function(parent, child, hashtag) { 
			var matchStr = "";
			if (hashtag === undefined) hashtag = "";
			
			var title = (child != null ? hashtag + APP_NAME + " recommendation: " : hashtag + TITLE_STRING + " for ");
			var parentTitle = "";
			var childTitle = "";

			if (hashtag === "") {
				if (parent != null) parentTitle = parent.title;
				if (child != null) childTitle = child.title;
			}
			else {
				if (parent != null) parentTitle = hashtag + parent.title.replace(" ", "");
				if (child != null) childTitle = hashtag + child.title.replace(" ", "");
			}
			
			if (parent != null && child != null) {
				matchStr +=  title + parentTitle + " -> " + childTitle;
			}
			else if (parent != null && child == null) {
				matchStr += title + hashtag + parentTitle + "..."; 
			}
			
			return matchStr;
		};

		// handles state change
		ko.computed(function() {
			var parent = parentItemsViewModel.selectedItem();
			var child = childItemsViewModel.selectedItem();
			if (parent === undefined) parent = null;
			if (child === undefined) child = null;
			
			var uri = self.uri(parent, child);
		    History.replaceState(
			   	{"parent" : (parent != null ? parent.id : null), 
			   	 "child" : (child != null ? child.id : null )}, 
			   	 self.matchTitle(parent, child), uri);
		    
			if (parent == null) { self.state(STATE_PARENT);	}
			else { self.state(child == null ? STATE_PARENT_RECOMMENDATIONS : STATE_PARENT_RECOMMENDATIONS_CHILD); }
			
		    // updates cookie and social components
			if (parent != null) {
			    $.cookie("match", uri, "{path: '/'}");
			    if (child != null) {

			    	// facebook like button and comments 
					$("#fbLikeBlock").html(
						'<div id="fbLike" class="fb-like" data-href="' + self.matchUrl(parent, child) + 
						'" data-send="false" data-layout="button_count" data-width="250" data-show-faces="false"></div>'
					);
					FB.XFBML.parse(document.getElementById('fbLikeBlock'));

			    	$("#fbCommentsBlock").html(
						'<div id="fbComments" class="fb-comments" data-href="' + self.matchUrl(parent, child) + 
						'" data-num-posts="10" data-width="650"></div>'
					);
					FB.XFBML.parse(document.getElementById('fbCommentsBlock'));
					
					// tweet button
					$.getJSON("/api/hash/" + parent.id + "/" + child.id, function(data) {
						var url = (data != null ? data.shortUrl : self.matchUrl(parent,child));
						$("#twBlock").html(
							'<a href="https://twitter.com/share" class="twitter-share-button" data-text="' 
							 + self.matchTitle(parent, child, "#") + '" data-url="' + url + '"></a>'
						);
											
						function parseTwitter(d, s, id) {
							var e = d.getElementById(id);
							if (e) e.parentNode.removeChild(e);
							var js, fjs = d.getElementsByTagName(s)[0];
							js = d.createElement(s); 
							js.id = id; 
							js.src = "//platform.twitter.com/widgets.js";
							fjs.parentNode.insertBefore(js, fjs); 
						}; 
						parseTwitter(document, "script", "twitter-wjs");
					});
					
					// google plus +1 
					$("#gpBlock").html(
						'<div class="g-plusone" data-size="medium"></div>'
					);
					
					(function() {
					    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
					    po.src = 'https://apis.google.com/js/plusone.js';
					    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
					})();
					
			    }
			}
			else {
				$("#fbLikeBlock").html("");
				$("#fbCommentsBlock").html("");
				$("#twBlock").html("");
				$("#gwBlock").html("");
			}
		});
		
		// signin callback url query
		self.callbackQuery = ko.computed(function() { 
			var parent = parentItemsViewModel.selectedItem();
			var child = childItemsViewModel.selectedItem();
			var query = "";
			if (parent !== undefined && parent != null) {
				query += "?matches=parent%3D" + parent.id;  
				if (child !== undefined && child != null) query += "%26child%3D" + child.id;	
			}
			return query;  
		});

		// redirecting to the item url for facebook or Google's "i'm feeling lucky" otherwise
		self.goToWebsite = function(item) {
			window.open(item.isFacebook() ? item.url : 
				GOOGLE_IM_FEELING_LUCKY.replace("${search}", item.title.replace(" ", "+")));
		};
		
		// opening a media popup
		self.play = function(item) {
			if (item.media() == null) {
				$.getJSON("/api/video/" + item.id, function(json) {
					var videoId = json.data.items[0].id;
					if (videoId != null) {
						item.media(NS_YOUTUBE + videoId);
						self.loadVideo(item);
					}
				});
			}
			else {
				if (item.isMediaVideo()) {
					self.loadVideo(item);
				}
			}
		};
		
		self.loadVideo = function(item) { 
			if (item.media() == null) {	alert("No video found"); return; }
			$(".messi").remove();
			if (item.media().substring(0, NS_YOUTUBE.length) === NS_YOUTUBE) { // youtube video
				var src = "http://www.youtube.com/embed/" + item.mediaPureId(); 
				new Messi('<iframe width="300" height="200" src="' + src + '" frameborder="0" allowfullscreen></iframe>', 
					{title: item.title, titleClass: "info", center: false, width: 320});
			}
		};
		
				
		self.postToFeed = function(data, e) {
			e.preventDefault();
			var parent = parentItemsViewModel.selectedItem();
			var child = childItemsViewModel.selectedItem();
			var obj = {
				method: "feed",
				link: self.matchUrl(parent, child),
				picture: self.baseUrl() + "/api/image/" + parent.id + "/" + child.id,
				name: "Like " + parent.title + "? Check out " + child.title,
				caption: getCaption(parent, child),
				description: childItemsViewModel.selectedItem().desc
			};
			
			function getCaption(parent, child) {
				votes = child.votes(); 
				return "If you like " + parent.title + ", "  
					+ (votes > 0 ?  votes + " people recommend that you check out " : "you will also like ") 
					+ child.title + ". ";
			}
			
			function callback(response) {
				document.getElementById("msg").innerHTML = "Post ID: " + response["post_id"];
			}
			
			FB.ui(obj, callback);
		};
		
		self.parentTitle = ko.computed(function() {
			var parent = parentItemsViewModel.selectedItem();
			if (parent === undefined || parent == null) return null;
			return parent.title;
		});
		
		self.childTitle = ko.computed(function() {
			var child = childItemsViewModel.selectedItem();
			if (child === undefined || child == null) return null;
			return child.title;
		});
		
		self.handleChildVoted = function() {
			if ($.cookie("content-maker-guide")) {
				$.cookie("content-maker-guide", null);
				$(".messi").remove();
				new Messi('<p><span>Contratulations!</span> You have just made your first match. ' +
					'You can now share your match and ask your friends to recommend using the social toolbar. Welcome to <span>iullui</span>!<br/></p>' +
					'<p style="text-align:center;"><span><img src="images/btn_like.png"/></span> <span><img src="images/btn_tweet.png"/></span> <span><img src="images/btn_plusone.png"/></span><br/></p>' +	        					
					'<a id="btnDoneGuide" class="button" href="#">Done</a>',
					{title: 'Congratulations!', titleClass: "info", center: false, width: 300});
				$("#btnDoneGuide").click(function() { $(".messi").remove(); });
				$("#whatDoYouLike").text("What do you like?");
				$("#recommendMatch").text("Recommend a match...");
				$("#btnRecommend").text("Recommend match");
				
			};
		};


	}


	// FB initialize
	window.fbAsyncInit = function() {
		var appId = $("#appId")[0].textContent;
	    FB.init({
		  appId      : appId, // App ID
		  channelUrl : '/channel.jsp', // Channel File
		  status     : true, // check login status
		  cookie     : true, // enable cookies to allow the server to access the session
		  xfbml      : true  // parse XFBML
	    });
	};

	// Load the FB SDK Asynchronously
	(function(d){
	     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
		 if (d.getElementById(id)) {return;}
		 js = d.createElement('script'); js.id = id; js.async = true;
		 js.src = "//connect.facebook.net/en_US/all.js";
		     ref.parentNode.insertBefore(js, ref);
	}(document));
	
	ko.applyBindings(parentItemsViewModel, $("#parentBox")[0]);
	ko.applyBindings(childItemsViewModel, $("#childBox")[0]);
	ko.applyBindings(matchesViewModel, $("#matchesBox")[0]);
	ko.applyBindings(tickerViewModel, $("#tickerBox")[0]);
	ko.applyBindings(stateViewModel, $("#socialBox")[0]);

	// resetting the app state 
	$("#btnHome,#btnSignOut").click(function(e) {
		$.cookie("content-maker-guide", null);
		$.cookie("match", null);
	});

	// logging in to account with page access permissions
	$("#signinToAccountParent, #signinToAccountChild").click(function(e) {
		e.preventDefault();
		$.cookie("redirectUri", "/account");
		$("#signinToAccountForm").submit();
	});
	
	// fixing app layout for IE 
	initLayoutFix();
	$(".drop").hide();
	
	return false;
	
});


	
