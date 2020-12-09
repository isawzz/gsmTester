window.onload = _loader;
window.onunload = saveUser;

async function _loader() {
	//timit = new TimeIt('start');
	if (BROADCAST_SETTINGS) {
		console.log('...broadcasting ...')
		await broadcastSIMA();
		_start();
	}else{loadSIMA(_start);}
	
}
async function _start() {

	//timit.show('DONE');
	console.assert(isdef(DB));
	
	initTable();
	initSidebar();
	initAux();

	Speech = new SpeechAPI('E');
	KeySets = getKeySets();
	//console.log(KeySets)

	loadUser(); //sets G,U,GS,Settings
	console.assert(isdef(G))

	if (SHOW_FREEZER) show('freezer'); else startUnit();

}

function startUnit() {

	restartTime();

	UnitScoreSummary = {};

	startGame();
	//onClickTemple();

}













