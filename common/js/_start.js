window.onload = () => _start();
var timit, G, PROTO, POOLS, sData;

async function _start() {
	timit = new TimeIt('*timer', TIMIT_SHOW);
	await loadAssets();
	await loadGameInfo();
	await loadSpec();
	//await loadCode();
	await loadInitialServerData();

	//prep ui
	d3.select('#bNextMove').text('NEXT MOVE').on('click', interaction);
	//mMinSize(mBy('table'),300,200);
	gameStep();
}
async function gameStep() {
	await prelims(); 
	
	// G, PROTO, POOLS, SPEC, DEFS, sData(=POOLS[augData]) in place for parsing spec!
	
	console.log('SPEC',SPEC);
	console.log('DEFS',DEFS);

	run01(SPEC,DEFS,sData);









}



//#region interaction restartGame prelims (von gameStep)
async function interaction() {
	await sendAction();
	gameStep();
}
async function restartGame() {
	await sendRestart();
	d3.select('button').text('NEXT MOVE').on('click', interaction);
	gameStep();
}
async function prelims(){
	if (serverData.waiting_for) { await sendStatus(getUsernameForPlid(serverData.waiting_for[0])); }
	if (serverData.end) { d3.select('button').text('RESTART').on('click', restartGame); }
	timit.showTime('* vor package: *')

	//worldMap('OPPS'); 

	preProcessData();
	//have d14, u14 ==> serverData (processed), tupleGroups, boats, SPEC, CODE

	// TODO: here I could insert computing diffed serverData

	//serverData are the data sent by server (mit options,players,table)
	//sData are to be augmented server objects ({oid:o} for all players,table entries (copies))

	isTraceOn = SHOW_TRACE;
	G={};
	PROTO={};
	POOLS={augData:makeDefaultPool(jsCopy(serverData))}; //to be augmented w/o contaminating serverData
	sData = POOLS.augData; 

	let d = mBy('SERVERDATA');
	if (d && SHOW_SERVERDATA) { d.innerHTML = '<pre>' + jsonToYaml(sData) + '</pre>'; }
	else {hide('contSERVERDATA');}

}

