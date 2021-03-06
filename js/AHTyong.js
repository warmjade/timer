function widget(){
    // include this call in your func, it will return you a struct include case-resolved time and AHT
    var feed = aht();
}

function lockCase(){
    localStorage["case"] = 1;
}

function aht(){
    var caseLockedButton = "case"; // key name for locking case, specified by anli
    var resolveCaseButton = "resolvebutton"; // key name for resolve, specified by steven.
    var caseId = 100000000;
    var associateId = 1999;
    var timer;
    var tick;
    var active;

    window.onload = startTimer();

    window.onblur = function() {
        active = false;
    };

    window.onfocus = function() {
        active = true;
    };

    window.onunload = window.onbeforeunload = function(){
		if(timer){
			key = "lastTimer" + caseId; // store time when unload page
			localStorage[key] = timer;
		}
    };

    function startTimer(){
		loadTimer();
        active = true;
        tick = setInterval(incrementTimer, 1000);
        return true;
        
        function loadTimer(){
            if(localStorage.getItem("lastTimer" + caseId) === null){
                timer = 0;
            }else{
                timer = localStorage.getItem("lastTimer" + caseId);
                if(isNaN(timer)){
                    timer = 0;
                }
            }
        }
    }

    function incrementTimer(){
        if (active && localStorage.getItem(caseLockedButton)) { // increment if window is on focus and case is locked;
            timer++;
        }
        document.getElementById("timer").innerHTML = secondToTime(timer);
    }

    function computeAHT(){
        if (!supportsLocalStorage()) { 
            return false;
        }else{
            if(!localStorage.getItem(caseLockedButton)) {
                return false; // if case is not locked then don't compute
            }
            var caseHandleTime = timer;
            localStorage["lastCHT" + associateId] = caseHandleTime; // save this case handle time;
            if (updateAHT(associateId, caseHandleTime)) { 
                clearInterval(tick);
                localStorage.removeItem("lastTimer" + caseId);
				localStorage.removeItem(caseLockedButton);
                timer = 0;
                return true;
            }else{
                return false;
            }
        }
    }

    function displayInfo(){
        if (supportsLocalStorage()) { 
            var lastCHTValue = localStorage["lastCHT" + associateId];
            var AHTValues = JSON.parse(localStorage["AHT" + associateId]);
            var AHTInfo = {lastCaseHandleTime:secondToTime(lastCHTValue), AHT:secondToTime(AHTValues.AHT)};
            return AHTInfo;
        }
    }

    function secondToTime(ss) {
        function padding(n) {
            return (n<10? '0':'') + n;
        }
        
        var s = Math.round(ss);
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        return padding(hrs) + ':' + padding(mins) + ':' + padding(secs);
    }

    function updateAHT(associateId, caseHandleTime){
        if (!supportsLocalStorage()) { 
            return false; 
        }   
        var key = "AHT" + associateId; // average handle time
        if(localStorage.getItem(key) === null){
            var values = {n:1, AHT:caseHandleTime};
            localStorage[key] = JSON.stringify(values);
        }else{
            var oldValues = JSON.parse(localStorage.getItem(key));
            var n = oldValues.n;
            var oldAHT = oldValues.AHT;
            var newAHT = (n * oldAHT + caseHandleTime)/(n + 1);
            var newValues = {n:(n+1), AHT:newAHT};
            localStorage[key] = JSON.stringify(newValues);
        }
        return true;
    }

    function supportsLocalStorage() {
        return ('localStorage' in window) && window.localStorage !== null;
    } 

    document.getElementById(resolveCaseButton).onclick=resolve;

    function resolve(){
        computeAHT();
        var display = displayInfo();
        document.getElementById("thisCase").innerHTML =  "this time: " + display.lastCaseHandleTime;
        document.getElementById("average").innerHTML = "AHT:  " + display.AHT;
        return display;
    }

    return resolve;
}

