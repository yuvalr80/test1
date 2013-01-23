package com.example.rps;

import java.util.ArrayList;
import java.util.List;

/**
 * A class for weapon representation (rock, paper, scissors ...) 
 * @author Yuval
 */
public class Weapon {
	
	String id;
	String name;
	String img;
	List<Weapon> beats = new ArrayList<Weapon>(); // list of weapons that this weapon can beat
	
	public Weapon (String id) { 
		this.id = id;
	}
	
	public String getId() {
		return this.id;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) { 
		this.name = name;
	}
	
	public String getImg() { 
		return img;
	}
	
	public void setImg(String img) {
		this.img = img;
	}
	
	public void addBeats(Weapon weapon) { 
		this.beats.add(weapon);
	}

	public boolean beats(Weapon weapon) {
		return this.beats.contains(weapon);
	}
	
	@Override 
	public String toString() { 
		return this.getName();
	}
	
	@Override
	public boolean equals(Object o) { 
		return (o != null) && (o instanceof Weapon) 
			&& this.getId().equals(((Weapon) o).getId());
	}
	
	@Override 
	public int hashCode() { 
		return this.getId().hashCode();
	}
	
}
