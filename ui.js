// This source is made available under the terms of the GPL version 2
// You can redistribute this program and its sources providing that you do not remove attribution.


// GENERIC DOM EXTENSIONS

function addListener(element, eventName, handler) {
  if (element.addEventListener) {
    element.addEventListener(eventName, handler, false);
  }
  else if (element.attachEvent) {
    element.attachEvent('on' + eventName, handler);
  }
  else {
    element['on' + eventName] = handler;
  }
}


// UI HELPERS

function hide(elementSet) {  
    
    for (index in elementSet) {
        if (elementSet[index].setAttribute) {           
            
            elementSet[index].setAttribute('style', 'display: none');
        }
    }
    return elementSet;  
}

function unhide(elementSet) {    
    
    for (index in elementSet) {
        if (elementSet[index].removeAttribute) {
            elementSet[index].removeAttribute('style');
        }
    }
    return elementSet;  
}





// FORM CONTROL

/*Constrain numeric inputs*/
var inputs = document.getElementById('main').getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
    inputs[i].onblur = function() { 
        if (isNaN((Number(this.value))) || this.value < 0) {
            this.value = this.defaultValue;
        }

        else if (this.value > 511) {
            this.value = 511;
        }
    }
}


/*Set up calculate button*/
var calculateButtons = document.getElementsByName('calculate');
for (var i = 0; i < calculateButtons.length; i++) {
    addListener(calculateButtons[i], 'click', runCalculator);
}


// REVEAL CONTENT


function showResults(damageObject) {

    function round(number) {
        return Math.floor(number);
    }    

    function addBreakdown(damage, note) {
        var target = document.getElementById('breakdown');
        
        var dt = document.createElement('dt');
        dt.textContent = damage;
        
        var dd = document.createElement('dd');
        dd.textContent = note;
        
        target.appendChild(dt);
        target.appendChild(dd);    
    }
    
    function clearResults() {
        var targets = [];
        targets.push(document.getElementById('breakdown'));
        
        for (var i = 0; i < targets.length; i++) {
            targets[i].innerHTML = "";
        }
    }
    
    function postDamage(max, min) {
        var maxSpan = document.getElementById('result-max');
        var minSpan = document.getElementById('result-min');
        
        maxSpan.innerHTML = max;
        minSpan.innerHTML = min;
    }
    
    function postOverflowstate(overflowFlag) {
        var target = document.getElementById('result-overflow');
        var text = "not possible";
        
        if (overflowFlag === true) {
            text = "possible";
        }
        
        target.innerHTML = text; 
    }
    
    // Prettify data
    
    var maxDamageDisplay = damageObject.getRandomCappedDamage().maximum;
    maxDamageDisplay = round(maxDamageDisplay);
    
    var minDamageDisplay = damageObject.getRandomCappedDamage().minimum;
    minDamageDisplay = round(minDamageDisplay);
    
        
    // Clear existing data
    clearResults();
    
    // Post new data
    postDamage(maxDamageDisplay, minDamageDisplay);
    postOverflowstate(damageObject.getOverflowFlag());
    
    log = damageObject.getDamageTrace();               
    for (var i = 0; i < log.length; i++) {        
        var logValue = round(log[i][0]);
        var logNote = log[i][1];        
        addBreakdown(logValue, logNote);            
    }        
    
    //Show-hide panels
    var initialState = document.getElementById('beforeSearch');
    initialState.style.display = "none";
    var postState = document.getElementById('afterSearch');
    postState.style.display = 'block';
        
};

function parseForm() {
    
    function getval(fieldID) {
        
        var value = undefined;        
        var target = document.getElementById(fieldID);
        
        if (target.tagName === "SELECT") {            
            value = target.options[target.selectedIndex].value;            
        }        
        else if (target.tagName === "INPUT" && target.type === "text") {
            value = Math.floor(target.value);
        }        
        else if (target.tagName === "INPUT" && target.type === "radio") {
            var radioSetName = target.name;
            var radioSet = document.getElementsByName(radioSetName);
            for (var i = 0; i < radioSet.length; i++) {
                var thisRadio = radioSet[i];
                if (thisRadio.checked) {
                    value = thisRadio.value;
                }              
            }          
        }
        else if (target.tagName === "INPUT" && target.type === "checkbox") {
            value = target.checked;
        }
             
        else {
            debug.print("Could not parse field - " + fieldID);
        }

        
        return value;                
    }
    
    var parsedData = {
        type : getval('type'),
        skillPower : getval('power'),
        attackerStats : {
            level : getval('level'),
            attack : getval('strength'),
            magic : getval('magic'),
            weapon : getval('weapon'),
            heroDrinks : getval('atkr-hero-drinks')
        },
        defenderStats : {
            defence : getval('defence'),
            mdef : getval('mdefence'),
            heroDrinks : getval('def-hero-drinks'),
            dragonforce : getval('def-dragon-forces')
        },
        conditions : {
            quadra : getval('quadra-magic'),
            split : getval('split'),
            berserk : getval('berserk'),
            mini : getval('mini'),
            critical : getval('critical'),
            frog : getval('frog'),
            barriers : getval('barrier'),
            sadness : getval('sadness'),
            defending : getval('defending'),
            backRow : getval('back-row'),
            backAttacked : getval('back-attacked'),
            backAttackMultiplier : getval('back-attack-mod')
        }
    };
    
    window.x = parsedData;
    
    return parsedData;
    
}


// CONTROLLER

function runCalculator() {
    var data = parseForm();
    
    var result;
    if (data.type == "Physical") {
        result = calculator.physicalFormula(data);
    }
    else if (data.type == "Magical") {
        result = calculator.magicalFormula(data);
    }
    else if (data.type == 'Curative') {
        result = calculator.curativeFormula(data)
    }
    else {
        debug.print("Couldn't determine damage function");
    }
    
    showResults(result);
}







