function onClickResetAbsLayoutTest() {
	iTESTSERIES = Math.max(iTESTSERIES-1,0);
	iTEST = 0;
	resetUIDs();
}
function onClickNextTestOfSeries() {
	nextTestOfSeries();
}
function onClickAllTests() {
	onClickResetAbsLayoutTest();
	runAllTests();
}
function onClickAllTestSeries() {
	onClickResetAbsLayoutTest();
	runAllTestSeries();
}
function onClickAllAbsLayoutTests() {
	onClickResetAbsLayoutTest();
	runAllAbsLayoutTests();
}
function onClickHorLayout() {
	let uid = '_4';
	let n = R.uiNodes[uid];
	horLayout(n, R);

	reArrange(R)
}
function onClickMove() {
	let keys = Object.keys(R.uiNodes);
	let uid = chooseRandom(keys);

	uid = '_2';

	n = R.uiNodes[uid];
	moveNodeBy(n, 10, 10, R);

	recMeasureOverride(R.tree.uid, R);
	recPositions(R.tree.uid, R);

	updateOutput(R)
}
function onClickMeasure() {
	recMeasureOverride(R.tree.uid, R);
	updateOutput(R);
}

function onClickAddLocObject() {
	//addNewlyCreatedServerObjects(sdata, R);
	//console.log('halllllllllllooooooooooooooooo')
	let o = {
		oid: 'loc2ta',
		obj_type: 'robberta',
		name: 'hallo2',
		loc: 'loc3ta'
	};
	let o2 = {
		oid: 'loc1ta',
		obj_type: 'robberta',
		name: 'hallo1',
		loc: 'loc2ta'
	};
	if (isdef(R.getO('loc2ta'))) o = o2;
	R.addObject(o.oid, o); R.addRForObject(o.oid);
	let success = einhaengen(o.oid, o, R);

	//recAdjustDirtyContainers(R.tree.uid, R, true);
	//setTimeout(() => {
	recMeasureOverride(R.tree.uid, R)
	//output and testing
	updateOutput(R);
	//}, 200);


}
function onClickResizeBoard() {
	let nuiBoard = R.uiNodes['_2'];
	nuiBoard.adirty = true;

	lookupSetOverride(nuiBoard, ['resizeInfo', 'fields'], 180);
	//console.log('resizeInfo',nuiBoard.resizeInfo)

	//recAdjustDirtyContainers(R.tree.uid, R, true);
	recMeasureOverride(R.tree.uid, R);

}
function onClickSmallerBoard() {
	let nuiBoard = R.uiNodes['_2'];
	//console.log('nuiBoard vor resizing to smaller:',nuiBoard)
	nuiBoard.adirty = true;
	lookupSetOverride(nuiBoard, ['resizeInfo', 'fields'], 32);
	//console.log('resizeInfo',nuiBoard.resizeInfo)

	//recAdjustDirtyContainers(R.tree.uid, R, true);
	recMeasureOverride(R.tree.uid, R);

}

async function onClickRunAll() {
	STOP = false;
	let sel = mBy('selSeries');
	let listSeries = [];
	for (const ch of sel.children) {
		//console.log(ch.value);
		if (ch.value != 'none') listSeries.push(DIR_TESTS + ch.value);
	}
	let imax = await testEngine.loadSeries(listSeries[0]);
	show('btnStop');
	console.log('_______ *NEW SERIES: ', listSeries[0]);
	await runNextSeries(listSeries, listSeries[0], 0, imax);
}
async function runNextSeries(listSeries, series, from, to) {
	let timeOUT = 500;

	if (isEmpty(listSeries)) {
		console.log('*** ALL TESTS COMPLETED! ***');
		return;
	} else if (STOP) {
		STOP = false;
		console.log('*** TEST RUN INTERRUPTED!!! ***');
		return;
	} else if (from >= to) {
		let series = testEngine.series;
		removeInPlace(listSeries, series);
		if (isEmpty(listSeries)) {
			console.log('*** ALL TESTS COMPLETED! ***');
			return;
		}
		series = listSeries[0];
		console.log('_______ *NEW SERIES: ', series);
		let imax = await testEngine.loadSeries(series);
		setTimeout(async () => { await runNextSeries(listSeries, series, 0, imax); }, timeOUT * 2);
		// await runNextSeries(listSeries,series,0,imax);
	} else {
		let series = listSeries[0];
		let index = from;
		await testEngine.loadTestCase(series, index);
		await present00(testEngine.spec, testEngine.defs, testEngine.sdata);

		setTimeout(async () => { await runNextSeries(listSeries, series, from + 1, to); }, timeOUT);
	}
}
function onClickStop() { STOP = true; hide('btnStop'); }
async function onTestSeriesChanged() {

	//achtung!!! er muss die richtigen sdata laden!!!!!!!!!
	let series = mBy('selSeries').value;
	if (series == 'none') return;

	// await testEngine.init(DEFS, sData, series);
	// await present00(testEngine.spec, testEngine.defs, testEngine.sdata);

	await testEngine.loadSeries(series);
	onClickClearTable();
	onClickRepeatTest();

	// let imax = await testEngine.loadTestCase(series,0);

}


function onClickToggleInteractivity(btn, desc) {
	let d = desc == 'main' ? mBy('divMainTest'): desc == 'test' ? mBy('divTesting'): desc == 'other' ? mBy('divOther') : mBy('divInteractivity');
	if (isVisible(d)) { 
		hide(d); 
		btn.innerHTML =  '+'+desc[0]; } else { 
			show(d); d.style.display='inline'; btn.innerHTML = '-'+desc[0]; }
}
async function onClickTest(btn) { await testEngine.clicked(btn.innerHTML); }

async function onClickRun() {
	let indexFrom = firstNumber(mBy('iTestCaseFrom').value);
	localStorage.setItem('iTestCaseFrom', indexFrom);
	let indexTo = firstNumber(mBy('iTestCaseTo').value);
	localStorage.setItem('iTestCaseTo', indexTo);
	verifySequence(indexFrom, indexTo, false);
}
async function onClickVerifySoFar() { verifySequence(0, testEngine.index, true); }
async function verifySequence(indexFrom, indexTo, saveOnCompleted = false) {
	show('btnStop');
	console.log('______________ verify from', indexFrom, 'to', indexTo, 'save', saveOnCompleted);
	testEngine.autosave = true;
	clearElement(mBy('table'));
	let series = testEngine.series;
	let maxIndex = indexTo;
	let index = indexFrom;
	//console.log('______________ vernext',series,index);
	await testEngine.loadTestCase(series, index);
	//console.log(testEngine.sdata)
	await present00(testEngine.spec, testEngine.defs, testEngine.sdata);
	//console.log('...completed', index);
	setTimeout(async () => { await verNext(series, index + 1, maxIndex, saveOnCompleted); }, 1000);

}
async function verNext(series, index, maxIndex, saveOnCompleted = false) {
	//console.log('______________ vernext',series,index);

	await testEngine.loadTestCase(series, index);

	await present00(testEngine.spec, testEngine.defs, testEngine.sdata);

	let timeOUT = 500;
	if (index < maxIndex && !STOP) setTimeout(async () => { await verNext(series, index + 1, maxIndex, saveOnCompleted); }, timeOUT);
	else if (saveOnCompleted) { STOP = false; saveSolutions(series, testEngine.Dict[series].solutions); }

}
async function onClickGo() {
	let elem = mBy('iTestCase');
	//console.log(elem)
	let n = elem.value;
	n = firstNumber(n)
	//console.log(n,typeof n)
	await testEngine.loadTestCase(testEngine.series, n);
	await present00(testEngine.spec, testEngine.defs, testEngine.sdata);
}

async function onClickNextTest() {
	await testEngine.loadNextTestCase();
	await present00(testEngine.spec, testEngine.defs, testEngine.sdata);
}
async function onClickPrevTest() {
	await testEngine.loadPrevTestCase();
	await present00(testEngine.spec, testEngine.defs, testEngine.sdata);
}
async function onClickRepeatTest() {
	await testEngine.repeatTestCase();
	await present00(testEngine.spec, testEngine.defs, testEngine.sdata);
}

function onClickVerify() { testEngine.verify(T); }

function recVerify(series, index, maxIndex) {
	if (index > maxIndex) return;
	else setTimeout(() => doNext(series, index, maxIndex), 1000);
}
async function doNext(series, index, mexIndex) {
	recVerify(series, index + 1, maxIndex);
}
// 	console.log('______________ verify so far');
// 	testEngine.autosave = true;
// 	clearElement(mBy('table'));
// 	let series = testEngine.series;
// 	let maxIndex = testEngine.index;
// 	let index = 0;
// 	await testEngine.loadTestCase(series, index);
// 	await present00(testEngine.spec, testEngine.defs, testEngine.sdata);
// 	console.log('...completed', index);
// 	setTimeout(async () => { await verNext(series, index + 1, maxIndex); }, 1000);
// }
function onClickInvalidate() { testEngine.invalidate(); }
function onClickSave() { testEngine.saveSolution(T); }
async function onClickClearTable() { clearElement('table'); clearUpdateOutput(); T = {}; }

function onClickRemove() { testRemoveObject(T); }
function onClickAdd() { testAddObject(T); }

function onClickRemoveBoard() { removeBoard(T); }
function onClickAddBoard() { addBoard(T); }
function onClickRemoveRobber() { removeRobber(T); }
function onClickAddRobber() { addRobber(T); }

function onClickActivate() {
	testActivate(T);
}
function onClickDeactivate() {
	testDeactivate(T);
}

function onClickUpdateOutput(elem) {

	switch (elem.id) {
		case 'contSpec': if (LEAVE_SPEC_OPEN) SHOW_SPEC = true; else SHOW_SPEC = !SHOW_SPEC; break;
		case 'contMixinSpec': SHOW_MIXINSPEC = !SHOW_MIXINSPEC; break;
		case 'contLastSpec': SHOW_LASTSPEC = !SHOW_LASTSPEC; break;
		case 'contUiTree': SHOW_UITREE = !SHOW_UITREE; break;
		case 'contRTree': SHOW_RTREE = !SHOW_RTREE; break;
		case 'contOidNodes': SHOW_OIDNODES = !SHOW_OIDNODES; break;
		case 'contDicts': SHOW_DICTIONARIES = !SHOW_DICTIONARIES; break;
		case 'contRefsIds': SHOW_IDS_REFS = !SHOW_IDS_REFS; break;
	}
	updateOutput(R);
}

function onClickNextExample() { }
function onClickStep() { }