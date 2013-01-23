package com.example.rps;

import static org.junit.Assert.*;

import org.junit.Test;

import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * Testing weapon logic
 * @author Yuval
 */
public class TestWeapon {

	@Test
	public final void testWeapon() throws FileNotFoundException, IOException {
		Weapon rock = new Weapon("rock");
		Weapon paper = new Weapon("paper");
		Weapon scissors = new Weapon("scissors");

		rock.addBeats(scissors);
		paper.addBeats(rock);
		scissors.addBeats(paper);
		
		assertTrue(rock.beats(scissors));
		assertFalse(rock.beats(paper));
		assertTrue(paper.beats(rock));
		assertFalse(paper.beats(scissors));
		assertTrue(scissors.beats(paper));
		assertFalse(scissors.beats(rock));
	}


}
