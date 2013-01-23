package com.example.rps;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * A factory class for weapons production
 * @author Yuval
 */
public class WeaponFactory {

	public static final String PROPERTIES_PATH = "weapons.properties";
	public static final String COMMA = ",";
	
	
	/**
	 * Produces weapons from a properties file and stores them in a key-value hashmap
	 * @throws FileNotFoundException
	 * @throws IOException
	 * @return map of weapon id to weapons for weapon lookup
	 */
	public Map<String, Weapon> produceWeapons() throws IOException {
		Map<String, Weapon> weapons = new HashMap<String, Weapon>(); 
		
		Properties prop = new Properties();
	    InputStream is = this.getClass().getResourceAsStream(PROPERTIES_PATH);
	    prop.load(is);
	    is.close();
	    
	    List<String> ids = Arrays.asList(prop.getProperty("weapon.ids").split(COMMA));
	    
	    // first adding the possible weapons
	    for (String id : ids) {
	    	Weapon weapon = new Weapon(id);
	    	weapon.setName(prop.getProperty("weapon." + id + ".name"));
	    	weapon.setImg(prop.getProperty("weapon." + id + ".img"));
	    	weapons.put(id, weapon);
	    }
	    
	    // for each added weapon, setting which weapons can it beat
	    for (Weapon weapon : weapons.values()) { 
	    	List<String> beats = Arrays.asList(
	    		prop.getProperty("weapon." + weapon.getId() + ".beats").split(COMMA));
	    	for (String beatId : beats) { 
	    		weapon.addBeats(weapons.get(beatId)); 
	    	}
	    }
	    
	    return weapons;
	}
	

	
}
