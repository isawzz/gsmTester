
function initSettingsP0(){
	// initialize common settings from settings window
	let iLanguage = mBy('input'+currentLanguage);
	iLanguage.checked = true;

	let iPicsPerLevel = mBy('inputPicsPerLevel');
	iPicsPerLevel.value = PICS_PER_LEVEL;

}

function openSettings() {
	show(dSettings);
	pauseUI();
}
function closeSettings() {
	setPicsPerLevel();
	hide(dSettings);
	resumeUI();
}
function toggleSettings() {
	if (isVisible2('dSettings')) closeSettings(); else openSettings();
}

function setGame(event) {
	if (isString(event)) currentGame = event;
	else {
		event.cancelBubble = true;
		let id = evToClosestId(event);
		currentGame = 'g' + id.substring(1);
		closeSettings();
	}
	startGame(currentGame);
}
function setLanguage(x) {
	currentLanguage = x;
	keySet = getKeySet(WORD_GROUPS[iGROUP], currentLanguage, MAX_WORD_LENGTH[level]);
}
function setPicsPerLevel() {
	let inp = mBy('inputPicsPerLevel');
	inp.select();
	let x = getSelection();
	let n = Number(x.toString());
	inp.value = n;
	getSelection().removeAllRanges();
	PICS_PER_LEVEL = n;
	SAMPLES_PER_LEVEL = new Array(20).fill(PICS_PER_LEVEL);
	boundary = SAMPLES_PER_LEVEL[level] * (1 + iGROUP);
}


