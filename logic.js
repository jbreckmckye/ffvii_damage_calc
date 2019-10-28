// This source is made available under the terms of the GPL version 2
// You can redistribute this program and its sources providing that you do not remove attribution.


//Debugging controls
var debug = {
	state : true,
	print : function(string) {
		if (this.state == true) {
			console.log(string);
		}
	},
	enumerate : function(object, level) {
	    level = level || "";
	    for (var property in object) {
	        var propertyType = (typeof object[property]);	        
	        console.log(level + property + " : " + propertyType + " = " + object[property]);
	        if (propertyType === "object") {
	            recur(level, object[property]);
	        }
	        function recur(level, object) {
	            level += "-- ";
	            debug.enumerate(object, level);
	        }
	    };
	}
}

debug.print("Debug is on");

//Constants
var constant = {
	overflowValue : 2147483648,
	rndVariationMinOverflowThreshold : 524288,
	rndOverflowTotalThreshold : 559095
}

var calculator = (function() {
// JavaScript singleton pattern. Returns object 'calculator' with public interfaces	
		
	// CALCULATOR PRIVATE MEMBERS
	
	// Constructor for 'damageObject' that carries a log of damage changes, flags for overflow etc.
	function DamageObject() {
		
		// DAMAGEOBJECT PRIVATE MEMBERS
		
		var damageLog = [];
		
		var overflowFlag = false;		
		
		var healFlag = false;
		
		// DAMAGEOBJECT PUBLIC INTERFACES
		
		this.setDamage = function(newDamage,cause) {
			damageLog.push([newDamage,cause]);
		}
		
		this.multiplyDamage = function(multiplier,cause) { 			
			damageLog.push([(this.getCurrentDamage() * multiplier),cause]);
		}
		
		this.getCurrentDamage = function() {
		    if (damageLog.length > 0) {
		      return damageLog[damageLog.length - 1][0];
			}
			else {
			  return [0, "No damage logged"];
			}
		}
		
		this.getDamageTrace = function() {
			return damageLog;
		}
		
		this.setOverflowFlag = function() {
			overflowFlag = true;
		}
		
		this.getOverflowFlag = function() {
			return overflowFlag;
		}
		
		this.getRandomCappedDamage = function() {
			var dmg = this.getCurrentDamage();
			
			var max_i = dmg * (3841 + 254);
			var max_ii = max_i / 4096; 
			
			if (max_i > constant.overflowValue) {			
				this.setOverflowFlag();
			}
			
			var min_i = dmg * (3841 + 1);
			var min_ii = min_i / 4096;
			
			// TODO - REFACTOR THIS CAPPING / SCOPING INTO SOMETHING NICER
			
			if (max_ii > 9999) {
			    max_ii = 9999;
			}
			
			if (min_ii > 9999) {
			    min_ii = 9999;
			}
			
			if (max_ii < 1) {
			    max_ii = 1;
			}
			
			if (min_ii < 1) {
			    min_ii = 1;
			}
			
			return {
				maximum : max_ii,
				minimum : min_ii
			}
		}
	} // END DAMAGEOBJECT CONSTRUCTOR
	
	
	function xCritical(damageObject) {	    
		damageObject.multiplyDamage(2,"Critical hit modifier (x2)");
	} 	
 	  
    function xBerserk(damageObject) {
        damageObject.multiplyDamage(1.5,"Berserk multiplier (x1.5)");
    } 	
 	
	function xBackRow(damageObject){
	    damageObject.multiplyDamage(0.5,"Close range attack over distance (1/2)");
	}
	
	function xDefend(damageObject) {
	    damageObject.multiplyDamage(0.5,"Defending (1/2)")
	}
	
    function xBackAttack(damageObject, defenderVulnerability) {
        damageObject.multiplyDamage(defenderVulnerability, "Back attacked (x" + defenderVulnerability + ")");
    }
    
    function xFrog(damageObject) {
        damageObject.multiplyDamage(0.25,"Frog reduction (1/4)");
    }   

    function xSadness(damageObject) {
        damageObject.multiplyDamage(0.7,"Sadness reduction (7/10)");
    }
    
    function xQuadraPenalty(damageObject){
        damageObject.multiplyDamage(0.5, "Damage halved per quadra-cast (1/2)");
    }
    
    function xSplitDamage(damageObject){
        damageObject.multiplyDamage((2/3),"Split damage for multi-tar (2/3)");
    }
    
    function xBarrier(damageObject) {
        damageObject.multiplyDamage(0.5,"Barrier/MBarrier applied (1/2)");
    }
	
	function xMini(damageObject) {
		damageObject.setDamage(0,"Minified (= 0)");
	}
	
	function xFinalize(damageObject) {
	    
	    var finalDmg = damageObject.getCurrentDamage();
	    var finalDmgMsg = "Final damage. ";
	    
	    
	    if (finalDmg < 1) {
	        finalDmgMsg += "Will round to 1. "
	    }
	    
	    if (finalDmg > 9999) {
	        finalDmgMsg += "Will cap at 9999. ";
	    }
	    
	    if (finalDmg > constant.rndVariationMinOverflowThreshold && finalDmg < constant.rndOverflowTotalThreshold) {
	        finalDmgMsg += "May OVERFLOW in randomization. "
	    }
	    
	    if (finalDmg >= constant.rndOverflowTotalThreshold) {
	        finalDmgMsg += "Will OVERFLOW in randomization. "
	    }    

		damageObject.setDamage(finalDmg, finalDmgMsg);
		
	}	
	   
    function xMultihit(damageObject, hits) {
        damageObject.multiplyDamage(hits, "Multiple hits (x" + hits + ")")
    }    
	
	function base_physical(damageObject, scenario) {
	    
		var as = scenario.attackerStats; var ds = scenario.defenderStats; var skillPower = scenario.skillPower;

        var totalAttack = min(as.attack + as.weapon, 255);
        
        var initDamage = (totalAttack + (((as.level + totalAttack) / 32) * ((as.level * totalAttack) / 32)));
		combinedPower = skillPower * (512 - ds.defence) * initDamage;
			
		baseDamage = combinedPower / (16 * 512);
		
		var overflowString = "";
		if (combinedPower > constant.overflowValue) {
			damageObject.setOverflowFlag();
			overflowString = " - OVERFLOW";
		}
		
		damageObject.setDamage(baseDamage,"Physical base damage" + overflowString);				
		return damageObject;
	}
	
	function base_magical(damageObject, scenario) {
		var as = scenario.attackerStats; var ds = scenario.defenderStats; var skillPower = scenario.skillPower;
		
		attackerPower = 6 * (as.magic + as.level);
		console.log(attackerPower);
		baseDamage = (skillPower * (512 - ds.mdef) * attackerPower) / (16 * 512);
				
		damageObject.setDamage(baseDamage,"Magical base damage");
		return damageObject;
	}
	
	function base_curative (damageObject, scenario) {
		var as = scenario.attackerStats; var ds = scenario.defenderStats; var skillPower = scenario.skillPower;
		
		attackerPower = 6 * (as.magic * as.level);
		baseDamage = attackerPower + (22 * skillPower); 
		
		damageObject.setDamage(baseDamage,"Curative base damage");
		return damageObject;		
	}
	
	function applyModifiers(damageObject, modifiers) {
	    var dmg = damageObject;
	    
	    
	    if (modifiers.critical) {
            xCritical(dmg);                             
        }
        
        if (modifiers.berserk) {
            xBerserk(dmg);
        }
        
        if (modifiers.backRow) {
            xBackRow(dmg);
        }
        
        if (modifiers.defending) {
            xDefend(dmg);
        }
        
        if (modifiers.backAttacked) {
            xBackAttack(dmg, modifiers.backAttackMultiplier);
        }
        
        if (modifiers.frog) {
            xFrog(dmg);
        }
               
        if (modifiers.sadness) {
            xSadness(dmg);
        }
        
        if (modifiers.split) {
            xSplitDamage(dmg);
        }
        
        if (modifiers.quadra == 'once' || modifiers.quadra == 'quad') {            
            console.log('Equals ' + modifiers.quadra);
            window.x = modifiers.quadra;
            xQuadraPenalty(dmg);
        }
        
        if (modifiers.quadra === 'quad') {
            xMultihit(dmg, 4);
        }
        
        if (modifiers.barriers) {
            xBarrier(dmg);
        }     
        
        if (modifiers.mini) {
            xMini(dmg);
        }
        
        if (modifiers.multiHit > 0) {
            xMultihit(dmg, modifiers.multiHit);
        }
        
        xFinalize(dmg);
        
        return dmg;
        
	}
	
	function getModifiersForPhysical(conditions) {
	    modifiers = conditions;	    
	    
	    // Remove magical-only modifiers
	    modifiers.quadra = false;
	    
	    return modifiers;	    
	}
	
	function getModifiersForMagical(conditions) {
	    modifiers = conditions;
	    
	    // Remove physical-only modifiers
	    modifiers.mini = false;
	    modifiers.frog = false;
	    modifiers.backAttacked = false;
	    modifiers.defending = false;
	    modifiers.backRow = false;
	    modifiers.berserk = false;
	    modifiers.critical = false;
	    
	    return modifiers;
	}
	
	function getModifiersForCurative(conditions) {
	    modifiers = conditions;
	    
	    // Remove magical/physical-only modifiers
	    modifiers.mini = false;
        modifiers.frog = false;
        modifiers.backAttacked = false;
        modifiers.defending = false;
        modifiers.backRow = false;
        modifiers.berserk = false;
        modifiers.critical = false;
        modifiers.sadness = false;
        
        return modifiers;	    
	    
	}
	
	function applyBoosterEffects(scenario) {
	    scenario.attackerStats = applyStatsModifiers(scenario.attackerStats);
	    scenario.defenderStats = applyStatsModifiers(scenario.defenderStats);
	    return scenario;    
	}
	
	
	function applyStatsModifiers(stats) {
	    
        var attackModifier = 0;
        var defenceModifier = 0;
        var magicModifier = 0;
        var mdefModifier = 0;
        
        if (typeof(stats.heroDrinks) !== undefined && stats.heroDrinks > 0) {
            var heroDrinkMod = stats.heroDrinks * 0.3;
            
            attackModifier += heroDrinkMod;
            defenceModifier += heroDrinkMod;
            magicModifier += heroDrinkMod;
            mdefModifier += heroDrinkMod;      
	    }
	    
	    if (typeof(stats.dragonforce) !== undefined && stats.dragonforce > 0) {
	        var dragonforceMod = stats.dragonforce * 0.5;
	        
	        defenceModifier += dragonforceMod;
	        mdefModifier += dragonforceMod;	        
	    }
	    
	    if (attackModifier > 1) {attackModifier = 1;}
	    if (defenceModifier > 1) {defenceModifier = 1;}
	    if (magicModifier > 1) {magicModifier = 1;}
	    if (mdefModifier > 1) {mdefModifier = 1;}
	    
	    if (stats.attack) {
	        stats.attack += (stats.attack * attackModifier);
	    }
	    if (stats.defence) {
	        stats.defence += (stats.defence * defenceModifier);
	    }
	    if (stats.magic) {
	        stats.magic += (stats.magic * magicModifier);
	    }
	    if (stats.mdef) {
	        stats.mdef += (stats.mdef * mdefModifier);
	    }
	    
	    return stats;
	    
	    
	}

	
	// MEMBERS TO BE EXPOSED AS PUBLIC
	
	function physicalFormula(scenario) {
	    
	    var dmg = new DamageObject();
	    scenario = applyBoosterEffects(scenario);
        dmg = base_physical(dmg, scenario);
        var modifiersToApply = getModifiersForPhysical(scenario.conditions);
                
        dmg = applyModifiers(dmg, modifiersToApply);
        
        return dmg;
	
	}
	
	function magicalFormula(scenario) {
	    
	    var dmg = new DamageObject();
	    scenario = applyBoosterEffects(scenario);
	    dmg = base_magical(dmg, scenario);
	    var modifiersToApply = getModifiersForMagical(scenario.conditions);
	    
	    dmg = applyModifiers(dmg, modifiersToApply);
	    
	    return dmg;
	
	}
	
	function curativeFormula(scenario) {
	    
	    var dmg = new DamageObject();
	    scenario = applyBoosterEffects(scenario);
	    dmg = base_curative(dmg, scenario);
	    var modifiersToApply = getModifiersForCurative(scenario.conditions);
	    
	    dmg = applyModifiers(dmg, modifiersToApply);
	    
	    return dmg;
	    
	}
		
	return {
		physicalFormula : physicalFormula,
		magicalFormula : magicalFormula,
		curativeFormula : curativeFormula
	};
	
})(); //end of iife that returns calculator object



