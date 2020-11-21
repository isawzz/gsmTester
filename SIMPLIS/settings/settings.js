

//experimental settings API
async function initSettingsX() {
	loadSettingsX();

	if (isdef(Settings.hallo)) {
		await resetSettingsToDefaults();
	}
	//console.log(Settings)
	//await initSettings();

}
//async function initSettings() {loadSettingsX();}
var textValue, TA;
function createSettingsUi() {
	//#region clear settings window and add a textArea ta
	let dParent = mBy('dSettings');
	clearElement(dParent);
	let ta = TA = mCreate('textarea');
	ta.id = 'dSettings_ta';
	mAppend(dParent, ta);
	ta.rows = 25;
	ta.cols = 100;
	ta.value = 'hallo';
	//create button
	let b = mCreate('button');
	mAppend(dParent, b);
	b.innerHTML = 'save';
	b.onclick = () => { saveSettingsX(); loadSettingsFromLocalStorage(); }
	//endregion
}
function loadSettingsX() {
	createSettingsUi();
	loadSettingsFromLocalStorage();
}
function loadSettingsFromLocalStorage() {
	let ta = mBy('dSettings_ta');
	let settings = localStorage.getItem('settings'); //getLocalStorage('settings');
	settings = JSON.parse(settings);

	if (nundef(settings)) settings = { hallo: 1, geh: 2 };

	if (settings.hallo) {
		console.log('!!!!!!!!!!!!! HACK !!!!!!!!!!!!!!!')
		Settings = settings;
	} else {
		setGlobalSettings(settings);
	}

	let o1 = Settings;// = { hallo: 1, geh: 2 };
	o2 = jsonToYaml(o1, { encoding: 'utf-8' });
	let o3 = jsyaml.dump(o1);
	let o4 = jsyaml.load(o3);
	let o5 = jsyaml.load(o2);
	//console.log('o1', typeof (o1), o1, '\no2', typeof (o2), o2, '\no3', typeof (o3), o3, '\no4', typeof (o4), o4, '\no5', typeof (o5), o5);

	textValue = ta.value = o2;
	//setTimeout(testWeiter, 10);
}
function testWeiter() {
	let ta = mBy('dSettings_ta');
	let t1 = textValue = ta.value;
	t1 = replaceAll(t1, '5', '6');

	let t2 = jsyaml.load(t1);
	localStorage.setItem('settings', JSON.stringify(t2));
	let t3 = JSON.parse(localStorage.getItem('settings'));

	console.log('t1', typeof (t1), t1, '\nt2', typeof (t2), t2, '\nt3', typeof (t3), t3);//,'\no4',typeof(o4),o4,'\no5',typeof(o5),o5);
	console.log('WAAAAAAAAAAAAAAAAAAAAAAAS');

}
function saveSettingsX() {

	let ta = mBy('dSettings_ta');
	let t1 = ta.value.toString();
	let t2 = jsyaml.load(t1);
	let t3 = JSON.stringify(t2);
	localStorage.setItem('settings', t3);
	//console.log('______________SAVED SETTINGS\n', 't1', typeof (t1), t1, '\nt2', typeof (t2), t2, '\nt3', typeof (t3), t3)

}

async function loadSettingsFromServer() {
	let settings = await loadYamlDict('/SIMPLIS/settings/settings.yaml'); //_config.yaml');
	return settings;

}
async function resetSettingsToDefaults() {
	console.log('-------------RESET SETTINGS')
	let settings = await loadSettingsFromServer();
	setGlobalSettings(settings);
	localStorage.clear(); //TODO: maybe only clear settings not entire localStorage???

	//console.log(Settings);

	saveObject(Settings, 'settings');
	//saveSettingsX();

	loadSettingsFromLocalStorage();

}

function openSettings() { hide('dGear'); clearProgramTimer(); show(dSettings); pauseUI(); loadSettingsX(); }
function closeSettings() { show('dGear'); saveSettingsX(); loadSettingsFromLocalStorage(); hide(dSettings); restartProgramTimer(); resumeUI(); }
function toggleSettings() { if (isVisible2('dSettings')) closeSettings(); else openSettings(); }

//#region settings helpers
function createSettingsUi() {
	let dParent = mBy('dSettings');

	clearElement(dParent);
	let d = mDiv(dParent); mClass(d, 'hMinus60'); //mStyleX(d,{'box-sizing':'border-box',padding:4})
	let ta = TA = mCreate('textarea');
	ta.id = 'dSettings_ta';
	//mStyleX(ta, { height: '98%', width: '98%' })
	mAppend(d, ta);
	mClass(ta, 'whMinus60');
	// ta.style.height = '90%';
	// ta.rows = 25;
	// ta.cols = 100;
	ta.value = 'hallo';

	let bdiv = mDiv(dParent); mStyleX(bdiv, { height: 54 });
	let b;

	//create buttons
	// b = mCreate('button');
	// mAppend(bdiv, b);
	// b.innerHTML = 'save';
	// mClass(b, 'buttonClass', 'buttonPlus');
	// b.onclick = () => { saveSettingsUi(); loadSettingsFromLocalStorage(); }

	b = mCreate('button');
	mAppend(bdiv, b);
	b.innerHTML = 'reset to defaults';
	mClass(b, 'buttonClass', 'buttonPlus');
	b.onclick = () => { resetSettingsToDefaults(); }

	b = mCreate('button');
	mAppend(bdiv, b);
	b.innerHTML = 'continue playing';
	mClass(b, 'buttonClass', 'buttonPlus');
	b.onclick = () => { closeSettings(); startGame(); }

	b = mCreate('button');
	mAppend(bdiv, b);
	b.innerHTML = 'restart program';
	mClass(b, 'buttonClass', 'buttonPlus');
	b.onclick = () => { closeSettings(); startUnit(); }
}
function setGlobalSettings(settings) {
	//console.log(settings)
	Settings = settings;
	currentLanguage = Settings.common.currentLanguage;
	//must set the keys!!!! =>done in indiv game startLevel

	currentCategories = Settings.common.currentCategories;

	currentUser = Settings.common.currentUser;

}