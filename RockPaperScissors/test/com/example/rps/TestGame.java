package com.example.rps;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;

/**
 * Testing main game logic
 * @author Yuval
 */
public class TestGame {

	Game game;
	
	@Before
	public final void prepareGame() { 
		game = new Game();
	}
	
	@Test 
	public final void testCheck() { 
		Arsenal arsenal = game.getArsenal();
		Weapon rock = arsenal.getWeapon("rock");
		Weapon paper = arsenal.getWeapon("paper");
		Weapon scissors = arsenal.getWeapon("scissors");
		
		assertEquals(game.check(rock, scissors), Result.WIN);
		assertEquals(game.check(rock, paper), Result.LOSE);
		assertEquals(game.check(rock, rock), Result.TIE);
	}
	
	@Test 
	public final void testPlay() { 
		assertNotNull(game.play());
	}

}
