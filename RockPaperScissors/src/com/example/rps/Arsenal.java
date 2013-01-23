package com.example.rps;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * An arsenal class for possible weapons.
 * Used for caching weapons, so that factory call will not be made with every new session/request  
 * @author Yuval
 */
public class Arsenal {

	private static Arsenal arsenal; // singleton instance
	
	Map<String, Weapon> weapons; 
	WeaponFactory weaponFactory;
	
	/**
	 * @return singleton arsenal
	 */
	public static Arsenal getArsenal() { 
		if (arsenal == null) arsenal = new Arsenal();
		return arsenal;
	}
	
	/**
	 * singleton private constructor
	 */
	private Arsenal() {
		this.weaponFactory = new WeaponFactory();
		
		try {
			this.weapons = new HashMap<String, Weapon>();
			this.weapons.putAll(this.weaponFactory.produceWeapons());
		}
		catch (Exception ex) { 
			ex.printStackTrace();
		}
		
	}

	/**
	 * Perform a weapon lookup by id
	 * @param id
	 * @return weapon
	 */
	public Weapon getWeapon(String id) { 
		return this.weapons.get(id);
	}
	
	/**
	 * @return arsenal's weapons list
	 */
	public List<Weapon> getWeapons() { 
		return new ArrayList<Weapon>(this.weapons.values());
	}
	
}
