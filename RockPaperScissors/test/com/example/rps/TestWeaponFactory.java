package com.example.rps;

import static org.junit.Assert.*;

import org.junit.Test;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Iterator;
import java.util.Map;

/**
 * Testing weapon factory
 * @author Yuval
 */
public class TestWeaponFactory {

	/**
	 * Seeing that no exception is thrown
	 * @throws FileNotFoundException
	 * @throws IOException
	 */
	@Test
	public final void testProduceWeapons() throws FileNotFoundException, IOException {
		WeaponFactory factory = new WeaponFactory();
		Map<String, Weapon> weapons = factory.produceWeapons();
		assertFalse(weapons.isEmpty());
		
		Iterator<String> itr = weapons.keySet().iterator();
		assertTrue(itr.hasNext());
		
		// inspecting produces weapons
		while (itr.hasNext()) {
			Weapon weapon = weapons.get(itr.next());
			assertNotNull(weapon);
			assertNotNull(weapon.getId());
			assertNotNull(weapon.getName());
			assertNotNull(weapon.getImg());
			assertFalse(weapon.beats.isEmpty());
		}
		
	}

}
