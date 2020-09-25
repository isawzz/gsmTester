//#region globals
var vidCache, allGames, playerConfig, c52, testCards; //session data
var defaultSpec, userSpec, userCode, serverData, prevServerData, tupleGroups, boats; //new game data

var symbolDict, symbolKeys, symbolList; //gibt es immer

//the following are only produced lazily! (see ensure)
// byType hat keys: emo, icon, eduplo, iduplo!!!
var symByType, symBySet;//hier sind info dicts
var symKeysByType, symKeysBySet;//hier sind key lists (dict by key)
var symListByType, symListBySet;//hier sind info lists (dict by key)

//#endregion

//#region emoSets_

var selectedEmoSetNames = ['animal', 'body', 'drink', 'emotion', 'food', 'fruit', 'game', 'gesture', 'hand', 'kitchen', 'object', 'person', 'place', 'plant', 'sports', 'time', 'transport', 'vegetable'];
var emoSets = {
	hand: { name: 'hand', f: o => o.group == 'people-body' && o.subgroups.includes('hand') },
	//o=>o.group == 'people-body' && o.subgroups.includes('role'),
	body: { name: 'body', f: o => o.group == 'people-body' && o.subgroups == 'body-parts' },
	person: { name: 'person', f: o => o.group == 'people-body' && o.subgroups == 'person' },
	gesture: { name: 'gesture', f: o => o.group == 'people-body' && o.subgroups == 'person-gesture' },
	role: { name: 'role', f: o => o.group == 'people-body' && o.subgroups == 'person-role' },
	fantasy: { name: 'fantasy', f: o => o.group == 'people-body' && o.subgroups == 'person-fantasy' },
	activity: { name: 'activity', f: o => o.group == 'people-body' && (o.subgroups == 'person-activity' || o.subgroups == 'person-resting') },
	sport: { name: 'sport', f: o => o.group == 'people-body' && o.subgroups == 'person-sport' },
	family: { name: 'family', f: o => o.group == 'people-body' && o.subgroups == 'family' },

	animal: { name: 'animal', f: o => startsWith(o.group, 'animal') && startsWith(o.subgroups, 'animal') },
	drink: { name: 'drink', f: o => o.group == 'food-drink' && o.subgroups == 'drink' },
	emotion: { name: 'emotion', f: o => o.group == 'smileys-emotion' },
	food: { name: 'food', f: o => o.group == 'food-drink' && startsWith(o.subgroups, 'food') },
	fruit: { name: 'fruit', f: o => o.group == 'food-drink' && o.subgroups == 'food-fruit' },
	game: { name: 'game', f: o => (o.group == 'activities' && o.subgroups == 'game') },
	kitchen: { name: 'kitchen', f: o => o.group == 'food-drink' && o.subgroups == 'dishware' },
	place: { name: 'place', f: o => startsWith(o.subgroups, 'place') },
	plant: { name: 'plant', f: o => startsWith(o.group, 'animal') && startsWith(o.subgroups, 'plant') },
	sports: { name: 'sports', f: o => (o.group == 'activities' && o.subgroups == 'sport') },
	time: { name: 'time', f: o => (o.group == 'travel-places' && o.subgroups == 'time') },
	transport: { name: 'transport', f: o => startsWith(o.subgroups, 'transport') && o.subgroups != 'transport-sign' },
	vegetable: { name: 'vegetable', f: o => o.group == 'food-drink' && o.subgroups == 'food-vegetable' },

	//objects:
	object: {
		name: 'object', f: o =>
			(o.group == 'food-drink' && o.subgroups == 'dishware')
			|| (o.group == 'travel-places' && o.subgroups == 'time')
			|| (o.group == 'activities' && o.subgroups == 'event')
			|| (o.group == 'activities' && o.subgroups == 'award-medal')
			|| (o.group == 'activities' && o.subgroups == 'arts-crafts')
			|| (o.group == 'activities' && o.subgroups == 'sport')
			|| (o.group == 'activities' && o.subgroups == 'game')
			|| (o.group == 'objects')
			|| (o.group == 'activities' && o.subgroups == 'event')
			|| (o.group == 'travel-places' && o.subgroups == 'sky-weather')
	},

	shapes: { name: 'shapes', f: o => o.group == 'symbols' && o.subgroups == 'geometric' },
	sternzeichen: { name: 'sternzeichen', f: o => o.group == 'symbols' && o.subgroups == 'zodiac' },
	symbols: { name: 'symbols', f: o => o.group == 'symbols' },

	//toolbar buttons:
	toolbar: {
		name: 'toolbar', f: o => (o.group == 'symbols' && o.subgroups == 'warning')
			|| (o.group == 'symbols' && o.subgroups == 'arrow')
			|| (o.group == 'symbols' && o.subgroups == 'av-symbol')
			|| (o.group == 'symbols' && o.subgroups == 'other-symbol')
			|| (o.group == 'symbols' && o.subgroups == 'keycap')
	},

	math: { name: 'math', f: o => o.group == 'symbols' && o.subgroups == 'math' },
	punctuation: { name: 'punctuation', f: o => o.group == 'symbols' && o.subgroups == 'punctuation' },
	misc: { name: 'misc', f: o => o.group == 'symbols' && o.subgroups == 'other-symbol' },

};

function isEmosetMember(name, info) { return emoSets[name].f(info); }

//#endregion

//#region ensure
function ensureSymBySet() { if (nundef(symBySet)) { makeEmoSetIndex(); } }
function ensureSymByType() {
	if (nundef(symByType)) {
		//console.log('doing it ONCE only!')
		symByType = { emo: {}, eduplo: {}, icon: {}, iduplo: {} };
		symKeysByType = { emo: [], eduplo: [], icon: [], iduplo: [] };
		symListByType = { emo: [], eduplo: [], icon: [], iduplo: [] };
		for (const k in symbolDict) {
			let info = symbolDict[k];
			if (info.type == 'emo' && info.isDuplicate) { symByType.eduplo[k] = info; symListByType.eduplo.push(info); symKeysByType.eduplo.push(k); }
			else if (info.type == 'icon' && info.isDuplicate) { symByType.iduplo[k] = info; symListByType.iduplo.push(info); symKeysByType.iduplo.push(k); }
			else if (info.type == 'emo') { symByType.emo[k] = info; symListByType.emo.push(info); symKeysByType.emo.push(k); }
			else if (info.type == 'icon') { symByType.icon[k] = info; symListByType.icon.push(info); symKeysByType.icon.push(k); }
		}
	}

}
//#endregion

//#region new symbolDict code
const MAX_ANNOTATION_LENGTH = 25;
const keysForAll = ['key', 'fz', 'w', 'h', 'type', 'hex', 'hexcode', 'text', 'family', 'isDuplicate', 'isColored'];
const keysForEmo = ['emoji', 'group', 'subgroups', 'E', 'D', 'E_valid_sound', 'D_valid_sound', 'path'];

async function symbolDictFromCsv(saveAtEnd = true) {
	USE_LOCAL_STORAGE = false;
	symbolDict = {}; symbolList = [];
	await loadRawAssets();

	symbolKeys.sort();
	let tempDict = {};
	let i = 0;
	for (const k of symbolKeys) {
		i += 1;
		let info = symbolDict[k];
		console.assert(k == info.key, 'key != symbolDict key!!!', k, info.key);
		// if (k == 'red heart') {
		// 	console.log(info)
		// }
		info.index = i;
		if (info.type != 'emo') {
			tempDict[k] = jsCopy(info);
			if (info.type == 'icon') {
				tempDict[k].tags = k.split('-');
			}
			continue;
		}
		let tags = [];
		tempDict[k] = {}; //{ hex: info.hex, hexcode: info.hexcode };
		for (const k1 in info) {
			let val = info[k1];

			if (keysForAll.includes(k1)) {
				tempDict[k][k1] = val;
				if (k1 == 'key') {
					if (val.length > MAX_ANNOTATION_LENGTH) { val = stringBefore(val, ':').trim(); }
					tempDict.annotation = val;
				}
				continue;
			}
			if (isNumber(val) || !isString(val)) { continue; }
			val = val.replace('"', '').trim();
			if (keysForEmo.includes(k1)) { tempDict[k][k1] = val; continue; }

			//ab hier just filter for tags!
			if (isEmpty(val)) { continue; }
			if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(val[0])) { continue; }
			if (firstNumber(val)) { continue; }
			if (val.length == 1) { continue; }
			//if (k1=='openmoji_author' || k1 == 'openmoji_date') console.log('emoji:',val,val.length); //,val[0],info.emoji);
			//if (val[0] =='�') {console.log('==>das ist ein emoji!!!',val);}
			if (info[k1][0] == info.emoji[0]) { continue; }
			//console.log('durchgekommen:', val, '(' + k1 + ')');
			addIf(tags, val);
		}
		tempDict[k].tags = tags;
	}
	console.log('DONE!');
	symbolDict = tempDict;
	symbolList = dict2list(symbolDict);

	if (saveAtEnd) saveSymbolDict();
}
function addAnnotationsToSymbolDict(saveAtEnd = true) {
	let list = symbolKeys;
	//console.log('---------------symbolKeys', list)
	for (const k of list) {
		//console.log(k);
		let info = symbolDict[k];

		let anno = info.key;

		//console.log(k,info,anno)

		if (info.type == 'emo'
			&& (isEmosetMember('role', info) || isEmosetMember('activity', info) || isEmosetMember('sport', info))
			&& (startsWith(anno, 'man') || startsWith(anno, 'woman'))) {
			anno = stringAfter(anno, ' ');
		} else if (anno.includes('button')) {
			anno = anno.replace('button', '');
		} else if (endsWith(anno, 'face')) {
			anno = stringBefore(anno, 'face')
		} else if (anno.includes('with')) {
			anno = stringAfter(anno, 'with');
		}
		if (startsWith(anno, 'in ')) {
			anno = stringAfter(anno, ' ');
		}
		if (anno.includes(':')) {
			anno = stringAfter(anno, ':');
		}
		anno = anno.replaceAll('-', ' ').trim();
		info.annotation = anno;

		//console.log(anno);
		//console.log('anno', anno, 'k', k, 'subgroups', info.subgroups);
	}
	if (saveAtEnd) saveSymbolDict();
}

function addMeasurementsToSymbolDict(callback = null) {
	let list = symbolKeys;
	//console.log('---------------symbolKeys', list)
	for (const k of list) { addElemsForMeasure(k); }
	//setTimeout(recordInfo,2000);
	setTimeout(() => {
		recordInfo();
		if (callback) {
			console.log('2. ...calling callback!!!!!!!!!!!!!!!!! USE_LOCL_STORAGE', USE_LOCAL_STORAGE, '\nsymbolDict');
			callback();
		}
	}, 2000);
}

//symbolDict helpers
function saveSymbolDict() {
	//console.log(symbolDict_)
	let y = jsonToYaml(symbolDict);

	downloadTextFile(y, 'symbolDict', 'yaml');
}
function berechnungen(info) {
	if (isString(info)) return;
	let elem = UIS[info.key];
	//console.log(typeof info, info, info.key, elem)
	//console.log(elem.getBoundingClientRect(elem));
	let b = elem.getBoundingClientRect(elem);
	info.fz = 100;
	info.w = Math.round(b.width);
	info.h = Math.round(b.height);
}
function recordInfo() {
	console.log('start recording...');
	let toBeRemoved = [];
	for (const k in symbolDict) {
		let info = symbolDict[k];
		//console.log(typeof info);
		if (isString(info)) toBeRemoved.push(k);
		else berechnungen(symbolDict[k]);
	}
	for (const k of toBeRemoved) delete symbolDict[k];

	saveSymbolDict();

}
function addElemsForMeasure(key) {
	let info = picInfo(key);
	//console.log(info)
	//sammelDict_[info.key] = info;
	var element = mDiv(table);
	let style = { display: 'inline', bg: 'yellow', fz: 100, padding: 0, margin: 0 };
	mStyleX(element, style);
	UIS[key] = element;
	// let decCode = hexStringToDecimal('f494'); //warehouse
	// let text = '&#' + decCode + ';';
	// let family = 'pictoFa';
	element.style.fontFamily = info.family;
	element.innerHTML = info.text;
}
//#endregion

//#region reconstructX
async function reconstructX() {
	//console.log('start rec 0');
	await symbolDictFromCsv(false);
	setTimeout(reconstructX1, 0);

}
function reconstructX1() {
	symByType = symBySet = null;
	//console.log('start rec 1');
	addAnnotationsToSymbolDict(false);
	setTimeout(reconstructX2, 0);
}
function reconstructX2() {
	//console.log('start rec 2');
	let list = symbolKeys;
	for (const k of list) { addElemsForMeasure(k); }
	setTimeout(reconstructX3, 2000);
}
function reconstructX3() {
	//console.log('start rec 3');
	let toBeRemoved = [];
	for (const k in symbolDict) {
		let info = symbolDict[k];
		if (isString(info)) toBeRemoved.push(k);
		else berechnungen(symbolDict[k]);
	}
	for (const k of toBeRemoved) delete symbolDict[k];
	setTimeout(reconstructX4, 0);
}
function reconstructX4() {
	USE_LOCAL_STORAGE = true;
	saveSymbolDict();
	SIGI = true;
}
//#endregion

//#region symbolDict from raw assets: old code
var emojiChars, numEmojis, emojiKeys, emoGroup, emoDict, iconChars, numIcons, iconKeys;
var symIndex, symByHex, duplicateKeys, symByGroup; //last 2 liefern info!

function makeInfoDict() {
	symbolDict = {}; symByHex = {}; symByGroup = {}; symIndex = {}; symByType = {};
	for (const k in emojiKeys) {
		//console.log(k)
		let rec = emojiChars[emojiKeys[k]];
		let info = {
			key: k,
			type: 'emo',
			isDuplicate: false,
			isColored: true,
		};
		for (const k1 in rec) info[k1] = rec[k1];
		if (nundef(info.hexcode)) {
			console.log('missing hexcode', k, info)
		}
		// else if (k == 'red heart') {
		// 	console.log('should be ok', info);
		// }
		info.hex = hexWithSkinTone(info);
		info.family = 'emoNoto';
		info.text = setPicText(info);
		info.path = '/assets/svg/twemoji/' + info.hex + '.svg';
		symbolDict[k] = info;
		lookupSet(symByGroup, [rec.group, rec.subgroups, k], info);
		lookupAddIfToList(symIndex, [rec.group, rec.subgroups], k);
		symByHex[info.hexcode] = k;
		symByHex[info.hex] = k;
		lookupSet(symByType, ['emo', k], info);
	}
	duplicateKeys = [];
	for (const k of iconKeys) {
		let hex = iconChars[k];
		let info = { key: k, type: 'icon', isDuplicate: false, isColored: false, hex: hex, hexcode: hex };
		info.family = (hex[0] == 'f' || hex[0] == 'F') ? 'pictoFa' : 'pictoGame';
		info.text = setPicText(info);
		lookupSet(symByType, ['icon', k], info);
		if (isdef(symbolDict[k])) {
			//dieser key (eg., bee) ist bereits vorgekommen, so es gibt auch so ein emoji
			symbolDict[k].isDuplicate = true; //that is the emo!!!
			lookupSet(symByType, ['eduplo', k], symbolDict[k]);
			lookupSet(symByType, ['iduplo', k], info);
			symByHex['i_' + info.hex] = k;
			symbolDict['i_' + k] = info;
			info.key = 'i_' + k;
			info.isDuplicate = true;
			duplicateKeys.push(k);
		} else {
			symByHex[info.hex] = k;
			symbolDict[k] = info;
		}
	}
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);
	//console.log('#symbolKeys', symbolKeys.length);
	//makeEmoSetIndex();
	// console.log('symbolDict', symbolDict);
	// console.log('by set', symBySet);
	// console.log('by group', symByGroup);
	// console.log('index', symIndex);
	// console.log('by hex', symByHex);
}

//helpers done
function hexWithSkinTone(info) {
	const skinTones = { white: 'B', asian: 'C', hispanic: 'D', indian: 'E', black: 'F' };

	let hex = info.hexcode; //default case!
	let nolist = ['family', 'person-fantasy', 'person-activity'];


	if (info.group == 'people-body' && !nolist.includes(info.subgroups)
		&& (info.subgroups != 'body-parts' || !info.annotation.includes('mechan') && info.order < 404)) {
		//if (info.subgroups == 'body-parts') console.log('order',info.order,info.annotation)

		// hex = getSkinToneKey(info.hexcode);

		let k = stringBefore(info.hexcode, '-');
		let rest = stringAfter(info.hexcode, '-');
		if (startsWith(rest, 'FE0F')) rest = stringAfter(rest, '-');
		hex = k + '-1F3F' + skinTones.asian + (isEmpty(rest) ? '' : ('-' + rest));
	}
	return hex;
}
function makeEmoSetIndex() {
	if (isdef(symBySet)) return;

	symBySet = {}; symKeysBySet = {}; symListBySet = {};
	for (const k in emoSets) {
		let set = emoSets[k];
		let name = set.name;
		let f = set.f;
		symBySet[name] = [];
		for (const k1 in symbolDict) {
			let info = symbolDict[k1];
			if (info.type == 'icon') continue;
			let o = info;
			if (nundef(o.group) || nundef(o.subgroups)) continue;
			let passt = f(o);
			if (!passt) continue;
			if (passt) {
				//if (k=='role') console.log(k,k1);
				lookupSet(symBySet, [name, k1], info);
				lookupAddToList(symKeysBySet, [name], k1);
				lookupAddToList(symListBySet, [name], info);
			}
		}
	}
}
function setPicText(info) {
	let decCode;
	let hex = info.hexcode;

	//console.log('info.hexcode',info,info.hexcode);
	// hex = "1F1E8-1F1ED";
	let parts = hex.split('-');
	let res = '';
	for (const p of parts) {
		decCode = hexStringToDecimal(p);
		s1 = '&#' + decCode + ';'; //'\u{1F436}';
		res += s1;
	}
	s1 = res;
	return s1;
}
//#endregion

//#region API: loadAssets, loadSpec_ (also merges), loadCode (also activates), loadInitialServerData
async function loadAssets() {

	vidCache = new LazyCache(!USE_LOCAL_STORAGE);
	testCardsC = await vidCache.load('testCards', async () => await route_rsg_asset('testCards', 'yaml'));
	testCards = vidCache.asDict('testCards');
	c52C = await vidCache.load('c52', route_c52);
	c52 = vidCache.asDict('c52');

	//einfach nur symbolDict laden als symbolDict
	symbolDictC = await vidCache.load('symbolDict', route_symbolDict);
	symbolDict = vidCache.asDict('symbolDict');
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);

}
async function loadRawAssets() {
	vidCache = new LazyCache(!USE_LOCAL_STORAGE);
	testCardsC = await vidCache.load('testCards', async () => await route_rsg_asset('testCards', 'yaml'));
	testCards = vidCache.asDict('testCards');
	iconCharsC = await vidCache.load('iconChars', route_iconChars);
	iconChars = vidCache.asDict('iconChars');
	iconKeys = Object.keys(iconChars);
	numIcons = iconKeys.length;
	emojiCharsC = await vidCache.load('emojiChars', route_emoChars);
	emojiChars = vidCache.asDict('emojiChars');
	emojiKeys = {};
	for (const k in emojiChars) {
		if (nundef(k) || nundef(emojiChars[k].annotation)) {
			//console.log('emojiChars[k]',k,emojiChars[k],'\ncontinue...');
			continue;
		}
		emojiKeys[emojiChars[k].annotation] = k;
	}
	numEmojis = Object.keys(emojiKeys).length;
	makeInfoDict();
	c52C = await vidCache.load('c52', route_c52);
	c52 = vidCache.asDict('c52');
}
// async function loadAndProcessRawAssetsX(callback){
// 	//after calling this function, need to transfer symbolDict.yaml from Downloads to assets!!!!!
// 	//let savedUseLocalStorage = USE_LOCAL_STORAGE;
// 	await reconstructX1(()=>{
// 		USE_LOCAL_STORAGE = savedUseLocalStorage;
// 		console.log('3. USE_LOCAL_STORAGE reverted to',USE_LOCAL_STORAGE)
// 		if (callback) callback();
// 	});


// }
async function loadAndProcessRawAssets(callback) {
	//after calling this function, need to transfer symbolDict.yaml from Downloads to assets!!!!!
	let savedUseLocalStorage = USE_LOCAL_STORAGE;
	await reconstruct(() => {
		USE_LOCAL_STORAGE = savedUseLocalStorage;
		console.log('3. USE_LOCAL_STORAGE reverted to', USE_LOCAL_STORAGE)
		if (callback) callback();
	});


}
async function loadGameInfo(useAllGamesStub = true) {
	if (useAllGamesStub) {
		allGames = {
			ttt: {
				name: 'TicTacToe',
				long_name: 'Tic-Tac-Toe',
				short_name: 'ttt',
				num_players: [2],
				player_names: ['Player1', 'Player2'],
			},
			s1: {
				name: 's1',
				long_name: 's1',
				short_name: 's1',
				num_players: [2, 3, 4, 5],
				player_names: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
			},
			starter: {
				name: 'Starter',
				long_name: 'Starter',
				short_name: 'starter',
				num_players: [2],
				player_names: ['Player1', 'Player2'],
			},
			catan: {
				name: 'Catan',
				long_name: 'The Settlers of Catan',
				short_name: 'catan',
				num_players: [3, 4],
				player_names: ['White', 'Red', 'Blue', 'Orange'],
			},
			aristocracy: {
				name: 'Aristocracy',
				long_name: 'Aristocracy',
				short_name: 'aristocracy',
				num_players: [2, 3, 4, 5],
				player_names: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
			}

		};

	} else {
		allGamesC = await vidCache.load('allGames', route_allGames);
		allGames = vidCache.asDict('allGames');
	}

	////console.log('allGames', GAME, allGames[GAME]);
	playerConfig = stubPlayerConfig(allGames); //stub to get player info
	// //console.log('playerConfig', playerConfig[GAME]);
	// //console.log('testCards', testCards['green2']);
	// //console.log('c52', c52['card_2C']);
	// //console.log('icons', iconChars.crow);
	// //console.log('allGames', allGames.catan);
	// //console.log(vidCache);
}
async function loadSpec(path) {
	if (TESTING) {

		let url = DSPEC_PATH + '.yaml';
		defaultSpecC = await vidCache.load('defaultSpec', async () => await route_path_yaml_dict(url), true, false);// last 2 params: reload, useLocal

		url = (isdef(path) ? path : SPEC_PATH) + '.yaml';
		if (USE_NON_TESTING_DATA) url = '/games/' + GAME + '/_rsg/' + GAME + VERSION + '.yaml';
		userSpecC = await vidCache.load('userSpec', async () => await route_test_userSpec(url), true, false);// last 2 params: reload, useLocal

	} else {

		url = DSPEC_PATH + '.yaml';
		//url = TEST_PATH + 'defaultSpec' + DSPEC_VERSION + '.yaml'; //always the same default spec!
		defaultSpecC = await vidCache.load('defaultSpec', async () => await route_path_yaml_dict(url), !CACHE_DEFAULTSPEC, CACHE_DEFAULTSPEC);// last 2 params: reload, useLocal

		userSpecC = await vidCache.load('userSpec', async () => await route_userSpec(GAME, GAME + VERSION), !CACHE_USERSPEC, CACHE_USERSPEC);// last 2 params: reload, useLocal

	}

	defaultSpec = vidCache.asDict('defaultSpec');
	userSpec = vidCache.asDict('userSpec');

	//merge default and userSpec
	SPEC = deepmerge(defaultSpec, userSpec);//, { arrayMerge: overwriteMerge });
	DEFS = SPEC.defaults;
	delete SPEC.defaults;

	//need to correct areas because it should NOT be merged!!!
	if (userSpec.layout_alias) { SPEC.areas = userSpec.layout_alias; }
	if (userSpec.areas) { SPEC.areas = userSpec.areas; }
	delete SPEC.layout_alias;
	delete SPEC.asText;

}
async function loadCode() {
	// let url = TEST_PATH + GAME + '/code' + CODE_VERSION + '.js';
	if (TESTING && !CODE_VERSION) return;

	let url = TESTING && !USE_NON_TESTING_DATA ? TEST_PATH + GAME + '/code' + CODE_VERSION + '.js'
		: '/games/' + GAME + '/_rsg/' + GAME + VERSION + '.js';

	let loader = new ScriptLoader();
	await loader.load(SERVER + url);

	if (TESTING) userCodeC = await vidCache.load('userCode', async () => await route_path_asText_dict(url), true, false);// last 2 params: reload, useLocal
	else userCodeC = await vidCache.load('userCode', async () => await route_userCode(GAME, GAME + VERSION), !CACHE_CODE, CACHE_CODE); // last 2 params: reload, useLocal

	userCode = vidCache.asDict('userCode');

	// document.getElementById('code').innerHTML = '<pre>"' + userCode.asText + '"</pre>'; //PERFECT!!!!!!!!!!
	let d = mBy('CODE');
	if (d && SHOW_CODE) { d.innerHTML = '<pre>' + userCode.asText + '</pre>'; }
	//else //console.log('CODE',userCode.asText);

	//testingHallo('hallo das geht wirklich!!!!!');
}
async function loadTestServerData(url) {
	let initial = 'testServerData';
	serverDataC = initialDataC[GAME] = await vidCache.load(initial, async () => await route_path_yaml_dict(url), true, false); // last 2 params: reload, useLocal
	serverData = vidCache.asDict(initial);
	return serverData;
}
async function loadInitialServerData(unameStarts) {
	let initialPath = GAME + (USE_MAX_PLAYER_NUM ? '_max' : '');

	_syncUsernameOfSender(unameStarts);

	if (TESTING) {
		let url = SERVERDATA_PATH + '.yaml'; //console.log('loading',url)
		serverDataC = initialDataC[GAME] = await vidCache.load('_initial_' + initialPath, async () => await route_path_yaml_dict(url), true, false); // last 2 params: reload, useLocal
	} else {
		serverDataC = initialDataC[GAME] = await vidCache.load('_initial_' + initialPath, async () => await route_initGame(GAME, playerConfig[GAME], USERNAME), !CACHE_INITDATA, CACHE_INITDATA); // last 2 params: reload, useLocal 
	}

	serverData = vidCache.asDict('_initial_' + initialPath);
	return serverData;
}
async function sendStatus(username) {
	_syncUsernameOfSender(username);
	if (!TESTING) serverData = await route_status(USERNAME);
}
async function sendRestart(username) {
	_syncUsernameOfSender(username);
	if (TESTING) serverData = await loadInitialServerData(USERNAME);
	else serverData = await route_begin_status(USERNAME);
}
async function sendAction(boat, username) {
	if (TESTING) {
		modifyServerDataRandom(username);
	} else {
		_syncUsernameOfSender(username);
		if (nundef(boat)) boat = chooseRandom(boats);
		let route = '/action/' + USERNAME + '/' + serverData.key + '/' + boat.desc + '/';
		let t = boat.tuple;
		//console.log('tuple is:', t);
		route += t.map(x => _pickStringForAction(x)).join('+');// /action/felix/91b7584a2265b1f5/loc-settlement/96
		//console.log('sending action...', route);
		let result = await route_server_js(route);
		//console.log('server returned', result);
		prevServerData = serverData;
		serverData = result;
	}
}
async function loadYamlDict(url) { return await route_path_yaml_dict(url); }
async function loadJsonDict(url) { return await route_path_json_dict(url); }
// serverData helpers
//ACHTUNG!!! die player obj_types sind variable!!!
function preProcessData(data) {
	//console.log('preprocess:',data.players, 'plidSentStatus',plidSentStatus);
	if (nundef(data)) data = serverData;
	for (const plid in data.players) {
		let pl = data.players[plid];
		if (isdef(pl.obj_type)) continue; //**** ACHTUNG!!!!!!!!! */
		pl.obj_type = plid == plidSentStatus ? 'GamePlayer' : 'opponent';
	}
	if (data.options) {
		tupleGroups = getTupleGroups();
		let iGroup = 0;
		let iTuple = 0;
		boats = [];
		for (const tg of tupleGroups) {
			for (const t of tg.tuples) {
				let boatInfo = { obj_type: 'boat', oids: [], desc: tg.desc, tuple: t, iGroup: iGroup, iTuple: iTuple, text: t.map(x => x.val), weg: false };
				boats[iTuple] = boatInfo;
				iTuple += 1;
			}
			iGroup += 1;
		}
	} else {
		tupleGroups = null;
		boats = [];
	}
}
function modifyServerDataRandom(username) {
	//this should ONLY modify serverData
	_syncUsernameOfSender(username);
	prevServerData = jsCopy(serverData);

	let ranks = ['2', '3', '4', 'Q', 'J', 'T', 'A', '9'];

	let dModify = serverData.table ? serverData.table : serverData;
	//console.log('dModify', dModify)
	let keys = Object.keys(dModify);
	//console.log('keys', keys);
	let nChange = randomNumber(1, keys.length);
	shuffle(keys);
	console.log('>>>change', nChange, 'items!')

	for (let i = 0; i < nChange; i++) {
		let id = keys[i];
		let val = dModify[id];
		if (isLiteral(val)) dModify[id] = { id: id, value: val };
		// console.log('change rank of id', id);
		dModify[id].rank = chooseRandom(ranks);
		// console.log(dModify[id])
	}

}
function showServerData(data, domid = 'SERVERDATA') {
	let d = mBy(domid);
	if (d && SHOW_SERVERDATA) { d.innerHTML = '<pre>' + jsonToYaml(data) + '</pre>'; }
	//else consOutput('serverData',data);
}
function showPackages(data, domid = 'CODE') {
	let d = mBy(domid);
	if (d) { d.innerHTML = '<pre>' + jsonToYaml(data) + '</pre>'; }
	//else consOutput('serverData',data);
}

//#region _internal
// serverData / server helpers
function _syncUsernameOfSender(username) {
	if (nundef(username)) username = USERNAME; else USERNAME = username;
	plidSentStatus = getPlidForUsername(username);
	//console.log('------------------', username, USERNAME, plidSentStatus);

}


// playerConfig (stub)
function setGamePlayer(username) {
	USERNAME = username;
	GAMEPLID = firstCondDict(playerConfig[GAME].players, p => p.username == username);

}
function stubPlayerConfig(gameInfo) {
	//automatically set a player configuration when starting in game view
	gcs = {};
	for (const gName in gameInfo) {
		let info = gameInfo[gName]
		////console.log(gName, info);
		let nPlayers = info.num_players[0]; // min player number, info.num_players.length - 1]; // max player number
		if (USE_MAX_PLAYER_NUM) nPlayers = info.num_players[info.num_players.length - 1]; // max player number
		let pls = {};
		for (let i = 0; i < nPlayers; i++) {
			let id = info.player_names[i];
			pls[id] = { id: id, playerType: 'me', agentType: null, username: USERNAME + (i > 0 ? i : ''), index: i };
			////console.log('player:', pl)
			// pls.push(pl);
		}
		gcs[gName] = { numPlayers: nPlayers, players: pls };

	}
	return gcs;
	////console.log('-------------------',gcs);
}
function updatePlayerConfig() {
	let keysPlayerColors = Object.keys(PLAYER_COLORS);
	//let players = playerConfig[GAME].players;

	//match colors to better colors!
	let iColor = 0;
	for (const id in serverData.players) {
		let pl = serverData.players[id];
		let colorName = isdef(pl.color) ? pl.color : keysPlayerColors[iColor];
		colorName = colorName.toLowerCase();
		let altName = capitalize(colorName);
		let color = isdef(PLAYER_COLORS[colorName]) ? PLAYER_COLORS[colorName] : colorName;


		playerConfig[GAME].players[id].color = color;
		//playerConfig[id].color = color;
		// playerConfig[id].altName = altName;
		// playerConfig[id].index = i;
		iColor += 1;
	}
}

// routes
async function route_allGames() {
	let gameNames = await route_server_js('/game/available');
	//console.log('gamenames returned:', gameNames)
	let res = {};
	for (const name of gameNames) {
		//console.log(name);
		if (USE_ALL_GAMES_ROUTE) {
			res[name] = await route_server_js('/game/info/' + name);
		} else {
			let url = '/games/' + name + '/info.yaml';
			res[name] = await route_path_yaml_dict(url);// last 2 params: reload, useLocal
			//console.log('game info', name, res[name]);
		}
	}
	return res;
}
async function route_c52() {
	return await route_rsg_asset('c52_blackBorder', 'yaml');
}
async function route_iconChars() {
	let gaIcons = await route_rsg_raw_asset('gameIconCodes');
	let faIcons = await route_rsg_raw_asset('faIconCodes');
	let dIcons = {};
	for (const k in faIcons) {
		dIcons[k] = faIcons[k];
	}
	for (const k in gaIcons) {
		dIcons[k] = gaIcons[k];
	}
	return dIcons;

}
async function route_emoChars() {
	// let x = await (await fetch('/assets/openmoji.csv')).text();
	let x = await (await fetch('/assets/raw/mojiReduced.csv')).text();
	emojiChars = processCsvData(x);
	return emojiChars;
}
async function route_symbolDict(filename = 'symbolDict') {
	let url = '/assets/' + filename + '.yaml';
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;

}
async function route_userSpec(game, fname) {
	try {
		let url = '/spec/' + game + (isdef(fname) ? '/' + fname : '');
		//let url = '/spec/' + GAME + (isdef(fname) ? '/' + fname : '');
		let text = await route_server_text(url);
		let spec = jsyaml.load(text);
		spec.asText = text;
		return spec;
	} catch (error) {
		return { asText: '' }; //empty spec!
	}
}
async function route_test_userSpec(url) {
	try {
		let text = await route_path_text(url);
		let spec = jsyaml.load(text);
		spec.asText = text;
		return spec;
	} catch (error) {
		return { asText: '' }; //empty spec!
	}
}
async function route_userCode(game, fname) {
	try {
		//let codePath = '/games/' + game + '/_rsg/' + fname + '.js';
		let url = '/RSG/' + game + (isdef(fname) ? '/' + fname : '');
		let text = await route_server_text(url);

		return { asText: text };
	} catch (error) { return {}; }

}
async function route_initGame(game, gc, username, seed = SEED) {
	await fetch_wrapper(SERVER + '/restart');
	await fetch_wrapper(SERVER + '/game/select/' + game);
	let nPlayers = gc.numPlayers;
	////console.log(gc)
	// for (let i = 0; i < nPlayers; i++) {
	for (plid in gc.players) {
		let plInfo = gc.players[plid];
		let isAI = plInfo.agentType !== null;
		if (isAI) {
			await postData(SERVER + '/add/client/agent/' + plInfo.username, { agent_type: plInfo.agentType, timeout: null });
		}
		await fetch_wrapper(SERVER + '/add/player/' + plInfo.username + '/' + plInfo);
	}
	return await route_begin_status(username, seed);
}
async function route_begin_status(username, seed = SEED) {
	await fetch_wrapper(SERVER + '/begin/' + seed);
	let data = await route_status(username);
	////console.log(data)
	return data;
}
async function route_status(username) { return await route_server_js('/status/' + username); }
async function route_rsg_asset(filename, ext = 'yml') {
	let url = '/assets/' + filename + '.' + ext;
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;
}
async function route_rsg_raw_asset(filename, ext = 'yml') {
	let url = '/assets/raw/' + filename + '.' + ext;
	let response = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	return response;
}
async function route_server_js(url) {
	let data = await fetch_wrapper(SERVER + url);
	return await data.json();
}
async function route_server_text(url) {
	////console.log(url, SERVER + url)
	let data = await fetch_wrapper(SERVER + url);
	let text = await data.text();
	return text;
}
async function route_path_yaml_dict(url) {
	let data = await fetch_wrapper(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
async function route_path_json_dict(url) {
	let data = await fetch_wrapper(url);
	let json = await data.json();
	//let dict = jsyaml.load(text);
	return json;
}
async function route_path_text(url) {
	let data = await fetch_wrapper(url);
	return await data.text();
}
async function route_path_asText_dict(url) {
	let data = await fetch_wrapper(url);
	let res = {};
	res.asText = await data.text();
	////console.log(res.asText)
	//res.asDict = JSON.parse(res.asText);//
	return res; // await data.text();
}
async function postData(url = '', data = {}) {
	//usage: postData('https://example.com/answer', { answer: 42 })

	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		headers: {
			'Content-Type': 'application/json'
			// 'Content-Type': 'application/x-www-form-urlencoded',
		},
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *client
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return await response.json(); // parses JSON response into native JavaScript objects
}
async function route_server(url) { await fetch_wrapper(SERVER + url); }

var route_counter = 0;
async function fetch_wrapper_NO(url) {
	route_counter += 1;
	if (SHOW_SERVER_ROUTE) consOutput(route_counter + ': route:' + url);
	let res = await fetch(url).then((response) => {
		if (response.status === 200) {
			if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', response);
			//return response;
			// return response.json();
		} else {
			throw new Error('Something went wrong');
			//return "ERROR";
		}
	}).catch((error) => {
		console.log(error)
	});
	return res;
	// .then((responseJson) => {
	// 	// Do something with the response
	// })
	// .catch((error) => {
	// 	console.log(error)
	// });
}
async function fetch_wrapper(url) {
	route_counter += 1;
	if (SHOW_SERVER_ROUTE) consOutput(route_counter + ': route:' + url);
	let res = await fetch(url);
	if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', res);
	return res;
	// try {
	// 	let res = await fetch(url);
	// 	if (SHOW_SERVER_RETURN) consOutput(route_counter + ': return:', res);
	// 	return res;

	// } catch (err) {
	// 	console.log('FETCH ERROR:', err)
	// 	return {};
	// }
}

// caches & consts: playerColors, THEMES, iTHEME
var allGamesC = null;
var playerConfigC = null;
var iconCharsC = null;
var symbolDictC = null;
var emoCharsC = null;
var c52C = null;
var testCardsC = null
var defaultSpecC = null;
var userSpecC = null;
var userCodeC = null;
var initialDataC = {}; //mostly for testing
var serverDataC = null;

const playerColors = {
	red: '#D01013',
	blue: '#003399',
	green: '#58A813',
	orange: '#FF6600',
	yellow: '#FAD302',
	violet: '#55038C',
	pink: '#ED527A',
	beige: '#D99559',
	sky: '#049DD9',
	brown: '#A65F46',
	white: '#FFFFFF',
};
const THEMES = ['#c9af98', '#2F4F4F', '#6B7A8F', '#00303F', 'rgb(3, 74, 166)', '#458766', '#7A9D96'];
var iTHEME = 0;

// tupleGroups
function getTupleGroups() {
	let act = serverData.options;

	//console.log('options', act)
	// json_str = JSON.stringify(act);
	// saveFile("yourfilename.json", "data:application/json", new Blob([json_str], { type: "" }));

	let tupleGroups = [];
	for (const desc in act) {
		let tg = { desc: desc, tuples: [] };
		//let tuples = expand99(act[desc].actions);
		let tuples = expand1_99(act[desc].actions);
		////console.log('*** ', desc, '........tuples:', tuples);

		if (tuples.length == 1 && !isList(tuples[0])) tuples = [tuples];
		////console.log(tuples)
		tg.tuples = tuples;
		tupleGroups.push({ desc: desc, tuples: tuples });
	}
	////console.log('tupleGroups', tupleGroups);
	return tupleGroups;
}
function expand1_99(x) {
	////console.log('expand1_99 input', tsRec(x))
	////console.log('expand1_99');
	if (isList(x)) {
		//console.log('expand1_99: x should be dict BUT is a list', x);
	}
	if (isDict(x)) { // TODO:  || isList(x)) {
		// if (isList(x)) {
		// 	//console.log('process: list',x)
		// }
		if ('_set' in x) {
			////console.log('handleSet wird aufgerufen')
			return handleSet(x._set);
		} else if ('_tuple' in x) {
			////console.log('handleTuple wird aufgerufen')
			return handleTuple(x._tuple);
		} else if ('type' in x) {
			return handleAction(x);
		} else { error('IMPOSSIBLE OBJECT', x); return null; }
	} else { error('IMPOSSIBLE TYPE', x); return null; }
}
function handleSet(x) {
	let irgend = x.map(expand1_99);
	let res = stripSet(irgend);
	return res;
}
function handleTuple(x) {
	let irgend = x.map(expand1_99);
	return multiCartesi(...irgend);
}
function handleAction(x) {
	return [[x]];
}
function isActionElement(x) {
	return typeof x == 'object' && 'type' in x;
}
function isListOfListOfActions(x) {
	return isList(x) && x.length > 0 && isList(x[0]) && x[0].length > 0 && isActionElement(x[0][0]);
}
function cartesi(l1, l2) {
	//l1,l2 are lists of list
	let res = [];
	for (var el1 of l1) {
		for (var el2 of l2) {
			res.push(el1.concat(el2));
		}
	}
	return res;
}
function multiCartesi() {
	//each arg is a list of list
	let arr = Array.from(arguments);
	if (arr.length > 2) {
		return cartesi(arr[0], stripSet(multiCartesi(...arr.slice(1))));
	} else if (arr.length == 2) return cartesi(arr[0], arr[1]);
	else if (arr.length == 1) return arr[0];
	else return [];
}
function stripSet(x) {
	if (isListOfListOfActions(x)) return x;
	else if (isActionElement(x)) return [[x]];
	else if (isList(x) && isActionElement(x[0])) return [x];
	else return [].concat(...x.map(stripSet));
	//return isList(x)&&x.length>0?stripSet(x[0]):x;
}

//preProcessServerData


// helpers
function getUsernameForPlid(id) { return playerConfig[GAME].players[id].username; }
function getPlidForUsername(username) {
	let pl = firstCondDict(playerConfig[GAME].players, x => x.username == username);
	// //console.log(getFunctionCallerName(),pl)
	return pl;
}
function _getTestPathForPlayerNum() { return GAME + (USE_MAX_PLAYER_NUM ? '_max' : ''); }
function _pickStringForAction(x) {
	//x is a tuple element, eg., {type:'fixed', val:'pass'} or {ID: "0", val: "hex[0]", type: "obj"}
	//console.log('pickStringForAction',x)
	if (x.type == 'fixed') return x.val;
	if (x.type == 'obj') return x.ID;
	if (x.type == 'player') return x.val;
}


//#endregion



