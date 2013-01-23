package com.example.rps;

import static org.junit.Assert.*;

import org.junit.Test;

/**
 * Testing arsenal logic
 * @author Yuval
 */
public class TestArsenal {

	/**
	 * Validating that the singleton construction works properly
	 */
	@Test
	public final void testSingleton()  {
		assertNotNull(Arsenal.getArsenal());
		assertTrue(Arsenal.getArsenal() == Arsenal.getArsenal());
	}

	/**
	 * Testing get weapons - asserting the list is not empty 
	 */
	@Test
	public final void testGetWeapons() { 
		assertFalse(Arsenal.getArsenal().getWeapons().isEmpty());
	}
	
	/**
	 * Testing get weapon functionality - asserting some weapon is not null
	 */
	@Test
	public final void testGetWeapon() {
		Arsenal arsenal = Arsenal.getArsenal();
		assertNotNull(arsenal.getWeapon(arsenal.getWeapons().get(0).getId()));
	}

}
