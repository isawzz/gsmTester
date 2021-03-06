var SelectedMenuKey, MenuItems;

function createMenuUi(dParent) {
	clearElement(dParent);
	mAppend(dParent, createElementFromHTML(`<h1>Choose Game:</h1>`));
	MenuItems = {};

	//#region prelim: keys,labels,ifs,options
	let games = isdef(User)?User.getAvailableGames() : U.avGames;
	//console.log('navi',window.navigator.onLine);
	if (!navigator.onLine){removeInPlace(games,'gSayPic');}
	//console.log(games, games.map(g => DB.games[g]));
	let labels = games.map(g => DB.games[g].friendly);
	let keys = games.map(g => DB.games[g].logo);
	let infos = keys.map(x => symbolDict[x]);
	let bgs = games.map(g => getColorDictColor(DB.games[g].color));
	let ifs = { label: labels, bg: bgs, fg: 'white', padding: 4 };
	let options = { onclick: onClickMenuItem, showLabels: true };
	//#endregion

	//#region phase1: make items: hier jetzt mix and match
	let items = zItems(infos, ifs, options);
	items.map(x => x.label = x.label.toUpperCase());
	//items.map(x=>console.log(x));
	//#endregion phase1

	//#region phase2: prepare items for container
	prepareItemsForContainerRegularGrid(items,ifs,options,Math.floor(Math.sqrt(items.length)));

	for (let i = 0; i < games.length; i++) {
		let item = items[i];
		item.div.id = 'menu_' + item.label.substring(0, 3);
		//console.log('game', games[i]); 
		let key = item.div.key = games[i];
		MenuItems[key] = item;
	}
	//#endregion

	//#region phase3: prep container for items
	let d = mDiv(dParent);
	mClass(d, 'flexWrap');
	d.style.height = '100%';
	//#endregion

	//#region phase4: add items to container!
	let dGrid = mDiv(d);
	items.map(x => mAppend(dGrid, x.div));
	let gridStyles = { 'place-content': 'center', gap: 4, margin: 4, padding: 4 };
	let gridSize = layoutGrid(items, dGrid, gridStyles, { rows: options.rows, isInline: true });
	//console.log('size of grid', gridSize, 'table', getBounds(dTable))
	//#endregion

	if (nundef(G)) return; //else console.log('G',G);
	//select the current game
	SelectedMenuKey = G.id;
	toggleSelectionOfPicture(MenuItems[G.id]);
}



















