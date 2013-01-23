package com.example.rps;

/**
 * Game logic manager
 * @author Yuval
 */
public class Game {

	Arsenal arsenal; // the weapons arsenal (singleton)
	
	public Game() { 
		arsenal = Arsenal.getArsenal();
	}
	
	/**
	 * Main logic
	 * @param weapon1
	 * @param weapon2
	 * @return whether weapon1 beats weapon2, weapon2 beats weapon1 or it's a tie
	 */
	public Result check(Weapon weapon1, Weapon weapon2) {
		if (weapon1.beats(weapon2)) return Result.WIN;
		else if (weapon2.beats(weapon1)) return Result.LOSE;
		else return Result.TIE;
	}
	
	/**
	 * @return a random weapon
	 */
	public Weapon play() {
		double rnd = Math.random();
		int i = (int) (rnd * arsenal.getWeapons().size());
		return arsenal.getWeapons().get(i);
	}

	public Arsenal getArsenal() {
		return this.arsenal;
	}
	
}
