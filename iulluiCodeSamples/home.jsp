<%@ page language="java" session="false" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#">
<head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# <c:out value="${appName}"/>: http://ogp.me/ns/fb/#<c:out value="${appName}"/>">
	<meta charset="utf-8">
	<c:set var="appDesc" value="iullui is a social app for content matching"/>	
	<c:set var="engageText" value="Tell iullui what you like, see what other people recommend you and make your own recommendations."/>
	<c:set var="matchTitle" value="Like ${parent}? Check out ${child}"/>
	<c:set var="parentTitle" value="What will you recommend for people who like ${parent}?"/>
	<c:set var="appTitle" value="People recommend"/>
	<c:set var="logoUrl" value="${appBaseUrl}/images/iullui_logo_icon.png" />
	<title>iullui : <c:out value="${not empty child ? matchTitle : not empty parent ? parentTitle : appTitle }"/></title>
 	<c:if test='${empty parent and empty child}'>
		<meta name="description"    content="<c:out value="${appDesc}"/>. <c:out value="${engageText}"/>"/> 	
 	</c:if>
 	<c:if test='${not empty parent and empty child}'>
		<meta name="description"    content="<c:out value="${appDesc}"/>. <c:out value="${parentTitle}"/>"/> 	
 	</c:if>
	<c:if test='${not empty parent and not empty child}'> 
	 	<meta name="description"    content="<c:out value="${appDesc}"/> - <c:out value="${matchTitle}"/>"/>
 	</c:if>
 	<meta name="keywords" 			content="iullui, <c:out value="${parent}"/>, <c:out value="${child}"/>, content, matching, recommend, recommended, recommendation, recommendations, interest, if you like, you might also like, you might be interested in"/>
	<meta property="fb:app_id"      content="<c:out value="${appId}"/>" /> 
	<meta property="og:type"        content="<c:out value="${appName}"/>:match" /> 
	<meta property="og:url"         content="<c:out value="${not empty url ? url : appBaseUrl}"/>" /> 
	<meta property="og:title"       content="<c:out value="${not empty child ? matchTitle : not empty parent ? parentTitle : appDesc }"/>" />
	<meta property="og:image"       content="<c:out value="${not empty image ? image : logoUrl }"/>" />
	<meta property="og:description" content="<c:out value="${not empty child ? childDesc : not empty parent ? parentDesc : engageText }"/>" />
	<meta property="og:site_name"	content="iullui"/>

	<link media="all" rel="icon" type="image/png" href="images/favicon.png" />
	<link media="all" rel="stylesheet" type="text/css" href="css/messi.min.css" />
	<link media="all" rel="stylesheet" type="text/css" href="css/all.css" />
	
	<script type="text/javascript" src="js/jquery-1.8.2.min.js"></script>
	<script type="text/javascript" src="js/jquery.scrollTo-1.4.2-min.js" ></script>
	<script type="text/javascript" src="js/knockout-2.1.0.js"></script>
	<script type="text/javascript" src="js/jquery.cookie.js"></script>
	<script type="text/javascript" src="js/jquery.history.js"></script>
	<script type="text/javascript" src="js/messi.min.js" ></script>
	<!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
		<link rel="stylesheet" type="text/css" href="css/ie.css" media="screen"/>
	<![endif]-->
</head>
<body>
	<div id="fb-root"></div>
	<script type="text/javascript" src="scripts/ga.js"></script>
	<script type="text/javascript" src="scripts/common.js"></script> 
	<script type="text/javascript" src="scripts/app.js"></script> 

	<div class="wrapper">
		<c:import url="header.jsp"/>
		<div class="main">
			<div class="content">
				<section id="parentBox" class="parent-block">
					<div class="heading">
						<div class="holder">
							<h2><span id="whatDoYouLike">What do you like?</span></h2>
						</div>
					</div>
					<div class="photo">
						<div class="thumb" data-bind="with: selectedItem, visible: selectedItem()">
							<img data-bind="attr: {id: 'selectedParent_' + id, src: thumb, }, 
								event: {load: imageLoaded, error: refreshImage}"/>
						</div>  
						<div class="thumb" data-bind="visible: !selectedItem()">
							<img src="images/parent_placeholder_83.png" width="83" height="83" />
						</div>
						<div class="rounded-frame"></div>
					</div> 
					<form class="search-form" action="#" onSubmit="return false;">
						<fieldset>
							<img class="img-search" src="images/img-search.png" />
							<div class="field">
								<input class="text" type="text" type="submit"  
									data-bind="css: { eg: search() == null && !isSelected() }, 
									value: (search() != null || isSelected() ? search : eg), valueUpdate: 'afterkeydown',
									hasfocus: inputHasFocus"/> 
								<div id="parentDrop" class="drop" data-bind="
										visible: isSearching, event: {mousedown: cancelBubble}">
									<div class="scrol-box">
										<ul class="choose-list" data-bind="foreach: items">
											<li data-bind="event: {mousedown: $root.selectParent}, attr: {title: title}">
												<div class="visual">
													<div class="thumb">
														<img data-bind="attr: {id: 'selectParent_' + id, src: thumb}, 
															event: {load: imageLoaded, error: refreshImage}"/>
													</div>
													<div class="rounded-frame"></div>
												</div>
												<div class="title-holder">
													<strong class="title"><span data-bind="text: title"></span></strong>
												</div>
											</li>
										</ul>
									</div>
									<div class="find-info">
										<c:if test="${empty user}">
											<a id="signinToAccountParent" href="#" title="Click here to sign in to your account">Add your own item...</a>
										</c:if>
										<c:if test="${not empty user}">
											<a href="/account" title="Click here to manage your account">Add your own item...</a>
										</c:if>
									</div>
								</div>
							</div>
							<div class="loader">
								<img src="images/ico-load.gif" data-bind="visible: processing">
							</div>
						</fieldset>
					</form>
				</section>
				<div class="blocks-holder">
					<div id="matchesBox" class="recommend-side" data-bind="visible: displayVotes">
						<section class="matches-block">
							<div class="heading">
								<div class="holder">
									<h2>If you like <span data-bind="text: parent"></span>...</h2>
								</div>
							</div>
							<div class="block-info">
								<div class="info-section">
									<ul class="visual-list" data-bind="foreach: (summary() ? summary().userPhotos : '')">
										<li><img data-bind="attr: {src: url}"/></li>
									</ul>
									<div class="description">
										<p data-bind="if: processing">Loading recommendations...</p>
										<p data-bind="text: (summary() ? summary().usersStringTotal : '')"/>
									</div>
								</div>
								<div class="scrol-box">
									<ul class="recommendation-list" >
										<li data-bind="ifnot: processing" title="Add a match">
											<div class="visual">
												<img src="images/add_icon_50.png" data-bind="click: $root.addRecommendation"/>
											</div>
											<div class="title-holder">
												<strong class="title meta"><span>Add...</span></strong>
											</div>
										</li>
										<!-- ko foreach: matches -->
										<li data-bind="attr: {id: 'match_' + id, title: title}, click: $root.selectChild">
											<div class="visual">
												<div class="thumb">
													<img data-bind="attr: {id: 'recommendation_' + id, src: thumb}, 
														event: {load: imageLoaded, error: refreshImage}">
												</div>
												<div class="rounded-frame"></div>
											</div>
											<div class="title-holder">
												<strong class="title"><span data-bind="text: title"></span><br/>&nbsp;</strong>
											</div>
											<span class="like-holder">
												<a href="#" class="recommend-icon"></a>
												<a href="#" class="count" data-bind="text: votes"></a>
												<a href="#" class="plus-one" data-bind="visible: !voted, click: $root.vote">[+1]</a>
											</span>
										</li>
										<!-- /ko -->
									</ul>
									<div class="recommendations-loader" data-bind="visible: processing">
										<div class="loader"><img src="images/ico-load.gif" alt=""></div>									
									</div>
								</div>
							</div>
						</section>
					</div>
					<div id="childBox" class="child-block">
						<div class="heading">
							<div class="holder">
								<h2 id="recommendMatch">Recommend a match...</h2>
							</div>
						</div>
						<form class="search-form" action="#" onSubmit="return false;">
							<fieldset>
								<img class="img-search" src="images/img-search.png"/>
								<div class="field">
									<input class="text" type="text" 
										data-bind="value: search, valueUpdate: 'afterkeydown', hasfocus: inputHasFocus" />
									<div id="childDrop" class="drop" data-bind="visible: isSearching, event: {mousedown: cancelBubble}" >
										<div class="scrol-box">
											<ul class="choose-list" data-bind="foreach: items">
												<li data-bind="event: {mousedown: $root.selectItem}, attr: {title: title}">
													<div class="visual">
														<div class="thumb">
															<img data-bind="attr: {id: 'selectChild_' + id, src: thumb}, 
																event: {load: imageLoaded, error: refreshImage}"/>
														</div>
														<div class="rounded-frame"></div>
													</div>
													<div class="title-holder">
														<strong class="title"><span data-bind="text: title"></span></strong>
													</div>
												</li>
											</ul>
										</div>
										<div class="find-info">
											<c:if test="${empty user}">
												<a id="signinToAccountChild" href="#" title="Click here to sign in to your account">Add your own item...</a>
											</c:if>
											<c:if test="${not empty user}">
												<a href="/account" title="Click here to manage your account">Add your own item...</a>
											</c:if>
										</div>
									</div>
								</div>
								<div class="loader"><img src="images/ico-load.gif" data-bind="visible: processing"/></div>
							</fieldset>
						</form>
						<div class="child-wrap" data-bind="with: selectedItem">
							<div class="visual">
								<div class="thumb">
									<img data-bind="attr: {id: 'selectedChild_' + id, src: thumb}, 
										event: {load: imageLoaded, error: refreshImage}"/>
								</div> 
								<div class="rounded-frame"></div>
							</div>
							<div class="description">
								<div class="scrol-box">
									<p data-bind="text: desc"></p>
								</div>
							</div>
							<div class="match-box">
								<c:if test="${not empty user}"> 
									<a id="btnRecommend" href="#" class="button" data-bind="click: $root.voteChild">
										Recommend match
									</a>
								</c:if>
								<c:if test="${empty user}">
									<form id="signinFormChild" class="signin-form-child" action="/signin/facebook" method="POST">
										<input type="hidden" name="scope" value="publish_actions"/>								
										<input type="submit" class="button signin-button" 
											data-bind="value: $root.recommendButtonText, 
												event: {mouseover: $root.recommendButtonMouseover, 
												mouseout: $root.recommendButtonMouseout}" 
											title="Please sign in to continue" data-bind="click: $root.prevoteChild" />
									</form>
								</c:if>
								<div class="match-title">
									<p>for people who like <span data-bind="text: $root.parentTitle()"></span></p>
								</div>
							</div>
							<div class="child-nav-wrap">
								<ul class="child-nav">
									<li data-bind="visible: canPlay"><a href="#" class="play-button" data-bind="click: $root.play">&nbsp;&#9658;&nbsp;</a>&nbsp;<a href="#" data-bind="click: $root.play">Watch</a></li>
									<li><a href="#" data-bind="click: $root.selectParent">Explore item</a></li>
									<li><a href="#" data-bind="click: $root.goToWebsite">Go to website</a></li>
									<li><a href="#" data-bind="visible: voted, click: $root.unvoteChild">Unrecommend</a></li>
								</ul>
							</div>
						</div>
						<div class="child-social-wrap">
							<ul class="child-social" data-bind="visible: selectedItem">
								<li id="gpBlock" class="gp-block">
									<!-- google plus button here -->
								</li>
								<li id="twBlock" class="tw-block">
									<!-- twitter tweet button here -->
								</li>
								<li id="fbLikeBlock" class="fb-like-block">
									<!-- facebook like button here -->
								</li>
							</ul>
						</div>
						<div class="info-wrap" data-bind="with: selectedItem">
							<div class="info-section">
								<ul class="visual-list" data-bind="foreach: userPhotos">
									<li><img data-bind="attr: {src: url}" /></li>
								</ul>
								<div class="description">
									<p data-bind="text: usersString"></p>
								</div>
							</div>
							<div class="bottom-spacer"></div>
						</div>
					</div>
				</div>
				<div id="socialBox" class="comments-section" data-bind="visible: parentTitle && childTitle">
					<div class="comments-title">
						<p>
							<span class="comments-subtitle">What people say</span>
							&nbsp;&nbsp;&nbsp;Why is&nbsp;<span data-bind="text: childTitle"></span>&nbsp;reommended for people who like&nbsp;<span data-bind="text: parentTitle"></span>?
						</p>
					</div>
					<div id="fbCommentsBlock" class="facebook-comments-block">
						<!-- facebook comments here  --> 
					</div>
				</div>
			</div>
			<div id="tickerBox" class="aside-holder">
				<div class="aside-frame">
					<aside class="aside">
						<div class="heading">
							<div class="holder">
								<h2>Latest recommendations</h2>
							</div>
						</div>
						<div class="side-info">
							<div class="scroll-box">
								<div id="tickerList" class="ticker-list" 
									data-bind="template: { foreach: matches, beforeRemove: hideMatch, afterAdd: showMatch }">
									<div class="ticker-item" data-bind="click: $root.goToMatch">
										<div class="person"><img data-bind="attr: {src: userImg}" width="36" height="34"></div>
										<div class="parent-info" data-bind="attr: {title: parent.title}">
											<div class="visual">
												<div class="thumb">
													<img data-bind="attr: {id: 'tickerParent_' + userId + '_' + parent.id + '_' + child.id, 
													src: parent.thumb}, event: {load: parent.imageLoaded, error: parent.refreshImage}"/>
												</div>
												<div class="rounded-frame"></div>
											</div>
											<div class="title-holder">
												<span class="title"><span data-bind="text: parent.title"></span></span>
											</div>
										</div>
										<img src="images/arrow01.gif" width="25" height="29" alt="image description" class="arrow">
										<div class="child-info" data-bind="attr: {title: child.title}">
											<div class="visual">
												<div class="thumb">
													<img data-bind="attr: {id: 'tickerChild_' + userId + '_' + parent.id + '_' + child.id, 
														src: child.thumb}, event: {load: child.imageLoaded, error: child.refreshImage}"/>
												</div>
												<div class="rounded-frame"></div>
											</div>
											<div class="title-holder">
												<span class="title"><span data-bind="text: child.title"></span></span>
											</div>
										</div>
									</div>
								</div>
								<div class="ticker-loader" data-bind="visible: processing">
									<div class="loader"><img src="images/ico-load.gif" alt=""></div>									
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>		
		</div>
		<c:import url="footer.jsp"/>
		<c:import url="metadata.jsp"/>
	</div>
</body>
</html>