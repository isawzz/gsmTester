var calGames,isCal,calStartLevels,calGame;


function exitCalibrationMode() {
	let b = mBy('dCalibrate');
	b.style.backgroundColor = 'transparent';

	[sBefore,sAfter] = calibrateUser();


	console.log('Score',Score)
	resetScore();

	stopGame();
	gameOver('Your Test Result:',true);
	addSessionToUserGames();
	isCal = false;
	setGame(calGame);
}
function enterCalibrationMode(all1) {
	addScoreToUserSession();
	addSessionToUserGames();

	isCal = true;
	let b = mBy('dCalibrate');
	b.style.backgroundColor = 'red';
	if (all1 == 1) { calGames = [G.id]; }
	else { calGames = jsCopy(U.avGames); }

	calGame = calGames[0];

	calStartLevels = getStartLevels(Username); 
	setGame(calGame);
	setBadgeLevel(G.level);
	startUnit();

}

function getCalBoundary(){return 4;} // calGames.length == 1? 4: 2;}
function isLastCalGame(){return !calGames.includes(G.id) || G.id == calGames[0]; }

function calibrating(){return isCal==true;}// Username == 'test';}

function calibrateUser(){
	let sBefore=calStartLevels; //getStartLevels(uname);
	let sAfter = getStartLevels(Username);
	//console.log(sBefore,sAfter);

	for (const gname of calGames) {
		let origStartLevel = lookupSet(calStartLevels,[gname],0);
		let testStartLevel = lookupSet(sAfter,[gname],origStartLevel);
	}
	return [sBefore,sAfter];
}

function showCalibrationResults(d){
	//console.log('HAAAAAAAAAAAAAAAAAAAAAAAAALO')
	let [before, after] = calibrateUser();

	d.style.textAlign = 'left';
	for (const g of calGames) {
		if (nundef(before[g])) before[g] = 0;
		let b = before[g]; let a = after[g];
		let exp = b < a ? (' been upgraded to ' + a) : b > a ? (' been downgraded to ' + a) : ' remained at ' + a;
		mText(`game "${DB.games[g].friendly}" startlevel has ${exp}`, d, { fz: 22 });
	}

}




