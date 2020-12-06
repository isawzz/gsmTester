var BlockServerSend = false;
var SERVER_DATA = null;

async function broadcastSIMA(usersPath = './settings/users.yaml', settingsPath = './settings/settings.yaml') {
	let users = await loadYamlDict(usersPath);
	let settings = await loadYamlDict(settingsPath);

	DB = {
		id: 'speechGames',
		users: users,
		settings: settings
	};

	saveSIMA();

	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	await loadAssetsSIMA('../assets/');

}

async function loadSIMA(callback) {
	console.log('...loading...');
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		let sData = await data.json();
		DB = sData[0];

		//hier kann ich assets laden!!!
		if (CLEAR_LOCAL_STORAGE) localStorage.clear();
		await loadAssetsSIMA('../assets/');

		if (isdef(callback)) callback();
	});
}
async function localOrRoute(key, url) {
	if (USE_LOCAL_STORAGE) {
		let x = localStorage.getItem(key);
		if (isdef(x)) return JSON.parse(x);
		else {
			let data = await route_path_yaml_dict(url);
			if (key != 'svgDict') localStorage.setItem(key, JSON.stringify(data));
			return data;
		}
	} else return await route_path_yaml_dict(url);
}
async function loadAssetsSIMA(assetsPath) {
	c52 = await localOrRoute('c52', assetsPath + 'c52_blackBorder.yaml');
	//return;
	symbolDict = await localOrRoute('symbolDict', assetsPath + 'symbolDict.yaml');
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);
	ensureSymBySet(); makeHigherOrderGroups();

	svgDict = await localOrRoute('svgDict', assetsPath + 'svgDict.yaml'); //TODO: depending on ext, treat other assts as well!
	svgKeys = Object.keys(svgDict);
	svgList = dict2list(svgDict);
}

async function saveSIMA() {
	console.log('posting DB', DB);
	localStorage.setItem('user', USERNAME);
	if (BlockServerSend) {
		//console.log('...wait for unblocked...');
		setTimeout(saveServerData, 1000);
	} else {
		let url = SERVERURL + 'speechGames';
		BlockServerSend = true;
		//console.log('blocked...');
		fetch(url, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(DB)
		}).then(() => { BlockServerSend = false; }); //console.log('unblocked...'); });
	}

}



//#region dep as of SIMA
const EXTEND_SYMBOLDICT = false; // see loadAssetsTest
async function loadAssetsTest(assetsPath) {
	let url = assetsPath + 'c52_blackBorder.yaml';
	c52 = await route_path_yaml_dict(url);

	url = assetsPath + 'symbolDict.yaml';
	symbolDict = await route_path_yaml_dict(url);
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);

	ensureSymBySet(); makeHigherOrderGroups();

	BestKeySets = await route_path_yaml_dict(assetsPath + 'speech/keySets.yaml');
	BestKeysD = await route_path_yaml_dict(assetsPath + 'speech/bestKeysD.yaml');
	BestKeysE = await route_path_yaml_dict(assetsPath + 'speech/bestKeysE.yaml');
	for (const e of BestKeysD) {
		let info = symbolDict[e.k];
		info.bestD = e.r;
		info.bestDConf = e.c;
	}
	for (const e of BestKeysE) {
		let info = symbolDict[e.k];
		info.bestE = e.r;
		info.bestEConf = e.c;
	}
	// console.log(BestKeySets.best100);
	for (const setname in BestKeySets) {
		for (const k of BestKeySets[setname]) {
			let info = symbolDict[k];
			if (nundef(info.bestE)) info.bestE = lastOfLanguage(k, 'E');
			if (nundef(info.bestD)) info.bestD = lastOfLanguage(k, 'D');
			//console.log(info)
			info[setname] = { E: info.bestE, D: info.bestD };
		}
	}

	if (EXTEND_SYMBOLDICT) downloadAsYaml(symbolDict, 'symbolDict');

	url = assetsPath + 'svgDict.yaml';
	svgDict = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	svgKeys = Object.keys(svgDict);
	svgList = dict2list(svgDict);

}
async function saveAll() { saveServerData(); }
async function loadAll(user, settingsDir, callback,) {
	//console.log('...loading...');
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		SERVER_DATA = await data.json();
		let sData = SERVER_DATA[0]; //firstCond(SERVER_DATA,x=>x.id=='speechGames');
		// console.log(sData,typeof(sData));
		// console.log('userData',sData.users);
		// console.log("Gunter",sData.users.Gunter)
		//console.log('SERVER_DATA', SERVER_DATA);
		UserHistory = sData.users[user]; //SERVER_DATA.users[USERNAME];
		if (nundef(UserHistory)) {
			sData.users[user] = UserHistory = await route_path_yaml_dict(settingsDir + 'user.yaml');
			console.log('user history');
			UserHistory.id = user;
			saveServerData();
		}

		DefaultSettings = await route_path_yaml_dict(settingsDir + 'settings.yaml');
		//DefaultSettings = sData.settings.default;

		Settings = sData.settings.current;

		//hier kann ich assets laden!!!
		if (CLEAR_LOCAL_STORAGE) localStorage.clear();
		await loadAssetsTest('../assets/');

		if (isdef(callback)) callback();
	});
}
async function saveServerData() {
	console.log('posting server data (UserHistory,Settings,DefaultSettings)...');
	let sData = SERVER_DATA[0]; //firstCond(SERVER_DATA,x=>x.id=='speechGames');
	sData.users[USERNAME] = UserHistory; //SERVER_DATA.users[USERNAME];
	sData[SETTINGS_KEY].defaults = DefaultSettings;
	sData[SETTINGS_KEY].current = Settings;
	localStorage.setItem('user', USERNAME);
	//return;
	if (BlockServerSend) {
		//console.log('...wait for unblocked...');
		setTimeout(saveServerData, 1000);
	} else {
		let url = SERVERURL + 'speechGames';
		BlockServerSend = true;
		//console.log('blocked...');
		fetch(url, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(SERVER_DATA[0])
		}).then(() => { BlockServerSend = false; }); //console.log('unblocked...'); });
	}

}
//#endregion


//#region dep as of HA (nach SIM, vor SIMA)
//-------------- unused as of HA
//deprecated
async function loadServerDataAndAssets() {
	//console.log('...loading...');
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		SERVER_DATA = await data.json();
		let sData = SERVER_DATA[0]; //firstCond(SERVER_DATA,x=>x.id=='speechGames');
		// console.log(sData,typeof(sData));
		// console.log('userData',sData.users);
		// console.log("Gunter",sData.users.Gunter)
		//console.log('SERVER_DATA', SERVER_DATA);
		UserHistory = sData.users[USERNAME]; //SERVER_DATA.users[USERNAME];
		DefaultSettings = sData[SETTINGS_KEY].defaults;
		Settings = sData[SETTINGS_KEY].current;
		// console.log(UserHistory);
		// console.log(DefaultSettings);
		// console.log(Settings);
		// console.log('==>USER HISTORY touch pic level', UserHistory.id, UserHistory.gTouchPic.startLevel);

		//hier kann ich assets laden!!!
		if (CLEAR_LOCAL_STORAGE) localStorage.clear();
		await loadAssetsTest('../assets/');

		_start();
		//SessionStart();
	});
}

async function transferServerDataToServer() {
	//load settings.yaml file 
	let url = './settings/' + SETTINGS_KEY + '.yaml';
	settingsData = await route_path_yaml_dict(url);
	DefaultSettings = settingsData;
	saveServerData();

}

async function transferServerDataToClient() {
	//dann download ich DefaultSettings as yaml
	downloadAsYaml(DefaultSettings, SETTINGS_KEY);
}

//#endregion




