function enterInterruptState() {
	//haengt von implementation ab was das bedeutet!
	// CancelChain = true; //when using TaskChain
	//chainCancel();
	//restartQ();
	clearTimeout(TOMain);
	if (isdef(G.instance)) G.instance.clear();
	auxOpen = true;
	STOPAUS = true;
}

//#region control open and close of aux
function openAux() {
	enterInterruptState();

	show(dAux);
	show('dGo');


}
function closeAux() {
	hide(dAux);
	hide('dGo');
	hide('dCalibrate');
	show('dGear');
	show('dTemple');
	if (SettingsChanged) {
		updateComplexSettings();
		saveSIMA();
	}
	SettingsChanged = false;
	auxOpen = false;
}


//#region aux buttons: computer, gear, temple
function onClickComputer() { }
function onClickCalibrate() {
	//console.log('hallo')
	closeAux();
	changeUserTo('test');
}
function onClickGear() {
	//console.log('opening settings: ui will be interrupted!!!')
	openAux();
	hide('dGear');
	createSettingsUi(dAux);
}
function onClickTemple() {
	//console.log('opening menu: ui will be interrupted!!!')
	openAux();
	hide('dTemple');
	show('dCalibrate');
	createMenuUi(dAux);
}

function onClickGo(ev) {

	if (isVisible2('dTemple')) {
		closeAux();
		startGame();

	} else {
		let gKey = nundef(ev) ? SelectedMenuKey : isString(ev) ? ev : divKeyFromEv(ev);

		//console.log('==>gKey', gKey, SelectedMenuKey);

		if (gKey != SelectedMenuKey) {
			if (isdef(SelectedMenuKey)) toggleSelectionOfPicture(MenuItems[SelectedMenuKey]);
			SelectedMenuKey = gKey;
			toggleSelectionOfPicture(MenuItems[gKey]);
		} else {
			closeAux();
			setGame(gKey);
			startGame();

		}
	}


}

function onClickBadge(ev) {
	revertToBadgeLevel(ev);
	saveUser();
	console.log('reverted to', G.level);
	TOMain = setTimeout(startGame, 100);
}

//# region divControls
function onClickStartButton() { startGame(); }
function onClickNextButton() { startRound(); }
function onClickRunStopButton(b) { if (StepByStepMode) { onClickRunButton(b); } else { onClickStopButton(b); } }
function onClickRunButton(b) { b.innerHTML = 'Stop'; mStyleX(bRunStop, { bg: 'red' }); StepByStepMode = false; startRound(); }
function onClickStopButton(b) { b.innerHTML = 'Run'; mStyleX(bRunStop, { bg: 'green' }); StepByStepMode = true; }

//#region freezers
function onClickFreezer() { hide('freezer'); startUnit(); }
function onClickFreezer2(ev) {
	//if (Settings.flags.pressControlToUnfreeze && !ev.ctrlKey) { console.log('*** press control!!!!'); return; }
	clearTable(); mRemoveClass(mBy('freezer2'), 'aniSlowlyAppear'); hide('freezer2'); 
	if (USERNAME == 'test') changeUserTo();
	else startUnit();
}


//#region helpers
function divKeyFromEv(ev) {
	//console.log('ev',ev)
	let id = evToClosestId(ev);
	let div = mBy(id);
	return div.key;
}















