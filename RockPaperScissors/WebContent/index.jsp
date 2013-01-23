<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8" %>
<%@ page import="com.example.rps.*;" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Rock Paper Scissors</title>
	<link rel="stylesheet" type="text/css" href="style/style.css" media="screen" />
</head>
<body>
	<!-- 
		Code inside the page = why i don't like JSP (at least without JSTL), but it's Java alright 
	-->
	<% 
		Game game = new Game();
		String weaponId = request.getParameter("weapon");
		Weapon chosenWeapon = null;
		if (weaponId != null) {
			chosenWeapon = game.getArsenal().getWeapon(weaponId);
		}
		// if computer plays for player - chooses weapon randomly
		String player = request.getParameter("player");
		if (player != null) chosenWeapon = game.play();
	%> 
	<div class="main" >
		<% if (chosenWeapon == null) { %>
			<h1>Let's play Rock-Paper-Scissors!</h1>
			<p><img src="images/rps.jpg"/></p>
		<% 
			}
			else {
				Weapon opponentWeapon = game.play();
				Result res = game.check(chosenWeapon, opponentWeapon);
		%>
			<div class="results">
				<p>
					<span>You chose:</span><br/>
					<img src="images/<%=chosenWeapon.getImg() %>"><br/>
					<span><%= chosenWeapon.getName() %></span>
				</p>
				<p>
					<span>Opponent chose:</span><br/>
					<img src="images/<%=opponentWeapon.getImg() %>"><br/>
					<span><%= opponentWeapon.getName() %></span>
				</p>
				<br/><br/>
				<p class="result">
					<b><%= (res.equals(Result.WIN) ? "You win!" : res.equals(Result.LOSE) ? "Sorry, you lose.." : "It's a Tie.") %></b>
				</p>
			</div>
		<%
			}
		%>
		<hr/>
		<div class="game-form">
			<form action="index.jsp" method="POST">
				<h2>Choose your weapon:</h2>
				<ul class="weapon-choose">
					<%
						for (Weapon weapon : game.getArsenal().getWeapons()) {
							// selecting the last chosen weapon or the first on the arsenal's list
							boolean checked = (chosenWeapon != null ? weapon.equals(chosenWeapon) : 
								weapon.equals(game.getArsenal().getWeapons().get(0))); 
							%>
								<li>
									<img src="images/<%=weapon.getImg() %>"/><br/>
									<input type="radio" name="weapon" value="<%=weapon.getId()%>" 
									<%= (checked ? "checked" : "") %>>	<%=weapon.getName()%>
								</li>
							<%
						}
					%>
				</ul>
				<div class="options">
					<br/><br/>
					<input type="checkbox" name="player" value="computer" 
						<%= (request.getParameter("player") != null ? "checked" : "") %>>Let Mr. Computer play for me
					<br/><br/>
					<input type="submit" value="Play">&nbsp;&nbsp;&nbsp;<a href="index.jsp">New Game</a>
				</div>
			</form>
		</div>
	</div>
</body>
</html>