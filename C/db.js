var BlockServerSend = false;
async function dbInit(appName, {usersPath = './_users.yaml', settingsPath = './_settings.yaml', gamesPath = './_games.yaml', tablesPath = './_tables.yaml', addonsPath = './_addons.yaml'}={}) {
	let users = await loadYamlDict(usersPath);
	let settings = await loadYamlDict(settingsPath);
	let addons = await loadYamlDict(addonsPath);
	let games = await loadYamlDict(gamesPath);
	let tables = isdef(tablesPath)? await loadYamlDict(tablesPath):null;

	DB = {
		id: appName,
		users: users,
		settings: settings,
		games: games,
		tables: tables,
		addons: addons,
	};

	//console.log('...saving from BROADCASTING')
	dbSave(appName);

	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	await loadBasicAssets('../assets/');
}
async function dbLoad(appName, callback) {
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		let sData = await data.json();

		DB = firstCond(sData, x => x.id == appName);
		//console.log('DB', DB);

		if (CLEAR_LOCAL_STORAGE) localStorage.clear();
		await loadBasicAssets('../assets/');

		if (isdef(callback)) callback();
	});
}
async function dbSave(appName) {
	if (BlockServerSend) {
		//console.log('...wait for unblocked...');
		setTimeout(()=>dbSave(appName), 1000);
	} else {
		//console.log('saving DB:',DB);
		let url = SERVERURL + appName;
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
async function loadBasicAssets(assetsPath) {
	c52 = await localOrRoute('c52', assetsPath + 'c52_blackBorder.yaml');
	//testCards = await localOrRoute('testCards', assetsPath + 'testCards.yaml');
	cinno = await localOrRoute('cinno', assetsPath + 'fe/inno.yaml');
	//other game data should be loaded here!

	symbolDict = await localOrRoute('symbolDict', assetsPath + 'symbolDict.yaml');
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);
	ensureSymBySet(); makeHigherOrderGroups();

	svgDict = await localOrRoute('svgDict', assetsPath + 'svgDict.yaml'); //TODO: depending on ext, treat other assts as well!
	svgKeys = Object.keys(svgDict);
	svgList = dict2list(svgDict);
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








