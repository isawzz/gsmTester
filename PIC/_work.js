


async function symbols01(name) {
	//let timit = new TimeIt('hallo');
	await ensureSvgDict();
	//timit.show('nach load svgDict:');
	ensureSymBySet();
	//timit.show('nach load sets:');
	mStyleX(table, { display: 'flex', 'flex-flow': 'row wrap' });
	let n = 10;
	let infolist = isdef(name) ? symListBySet[name] : loop(n).map(x => picRandom('emo'))
	let styles = {
		w: 100, h: 100, bg: 'blue',
		fg: 'gold', margin: 4, align: 'center'
	};

	infolist = arrTake(infolist, 10);

	//segoe ui emoji
	//for (const ff of EMOFONTLIST) {  //['emoOpen', 'openmoBlack', 'segoe ui emoji', 'segoe ui symbol']) {
	for (const ff of ['arial','emoNoto', 'emoOpen', 'openmoBlack', 'segoe ui emoji', 'segoe ui symbol']) {
		//if (ff == 'emoOpen') continue;
		mText('font: ' + ff, table);
		for (const info of infolist) {
			let [c, p, t] = getHarmoniousStylesXX(100, 100, 4, ff, 'transparent','transparent',true)

			// p['text-shadow']='0 0 0 purple';
			// p.fg='#ffffff80';

			//let d = maPicLabel(info, table, c, p, t, true, ff);
			// let d=maPic(info,table,{'text-shadow':'0 0 0 green',fg:'#00000080',w:100,h:100},true,ff)
			let d=maPic(info,table,{'text-shadow':'0 0 0 green',fg:'#00000080',w:100,h:100},true,ff)

			//let d1=maPic(info,table,{fg:'green',w:100,h:100},true)
			//let dPic = d.children[0];
			//colorPic(dPic,'blue');

		//let d = maPicLabel(info, table, c, p, t, true, ff);
	
			// let [c, p, t] = getHarmoniousStylesXX(100, 100, 4, ff, 'blue', 'red', true)
			//<p title="🐘🐧🐼♥★ℹ💀👌 with text variation selector 15">&#x1F418;&#xFE0E; &#x1F427;&#xFE0E; &#x1F43C;&#xFE0E; &#x2665;&#xFE0E; &#x2605;&#xFE0E; &#x2139;&#xFE0E; &#x1F480;&#xFE0E; &#x1F44C;&#xFE0E;</p>
			//p.fg='transparent';
			// p.color = '#00000080'
			//info.text+='&#xFE0E;' 
			//mClass(d.children[0],'unicolorRed')
		}
		//return;
		//timit.show('nach font:',ff);
		mLinebreak(table);
		//throw new Error();
	}

	for (const ff of ['arial','emoNoto', 'emoOpen', 'openmoBlack', 'segoe ui emoji', 'segoe ui symbol']) { //['segoe ui emoji', 'segoe ui symbol']) {
		if (ff == 'emoOpen') continue;
		mText('font: ' + ff, table);
		for (const info of infolist) {
			let [c, p, t] = getHarmoniousStylesXX(100, 100, 4, ff, 'transparent','transparent',true)
			// let [c, p, t] = getHarmoniousStylesXX(100, 100, 4, ff, 'blue', 'red', true)
			let d = maPicLabel(info, table, c, p, t, true, ff);
			//mClass(d.children[0],'unicolorGreen')
		}
		//return;
		//timit.show('nach font:',ff);
		mLinebreak(table);
		//throw new Error();
	}

}

function colorPic(dPic,color){
	dPic.style.textShadow='0 0 0 '+color; //purple';
	// p.fg='#ffffff80';
}

var infoDictionary;
function test44() {
	let picLabelStyles = getHarmoniousStylesXX(100, 100, 10, 'arial', 'random', 'random', true);
	let picStyles = getHarmoniousStylesXX(100, 100, 10, 'arial', 'random', 'random', false);
	ensureSymByType();
	let keys = takeFromTo(symKeysByType['icon'],9,109);//chooseRandom() ['keycap: 0', 'keycap: 1', 'keycap: #', 'keycap: *'];
	console.log(keys)
	gridLabeled(keys, picLabelStyles);
}

function test43(){
	g2Pics = [];

	let keys = ['ant','T-Rex'];//'horse'];// 
	//let keys = choose(emoGroupKeys, g2N); // ['T-Rex']; //choose(emoGroupKeys, g2N);

	//console.log('keys',keys)
	//let styles = { w: 200, h: 200, margin: 20, bg: 'random', cursor: 'pointer', rounding: 16, padding: 10 };
	let stylesForLabelButton = { rounding: 10, margin: 24 };
	const picStyles = ['twitterText', 'twitterImage', 'openMojiText', 'openMojiImage', 'segoe', 'openMojiBlackText', 'segoeBlack'];
	let { isText, isOmoji } = getParamsForMaPicStyle('twitterText');

	for (let i = 0; i < keys.length; i++) {
		let info = getRandomSetItem('E', keys[i]);
		
		let label = arrLast(info.words); //'hallo das ist ja bloed';//arrLast(info.words)
		//let maxw=100;
		let d1 = maPicLabelButtonFitText(info, label,{w:200,h:200}, maPicLabelShowHideHandler, table, stylesForLabelButton, 'frameOnHover', isText, isOmoji); 
		
		// let d1 = maPicLabelButton(info, arrLast(info.words), onClickPicture, table, styles, 'frameOnHover', isText, isOmoji); d1.id = id;
		//let d1 = maPicButton(info, onClickPicture, table, styles, 'frameOnHover', isText, isOmoji); d1.id = id;
		//console.log('table',table,'\ndPic',d1)
		g2Pics.push({ key: info.key, info: info, div: d1, id: d1.id, index: i });
	}


}

function test42() {
	//nicht in ein grid sondern einfach so auflinen!
	handler = (ev) => {
		let id = evToClosestId(ev);
		console.log('=>hasLabel?', isLabelVisible(id))
		let info = infoDictionary[id.substring(1)];
		if (isLabelVisible(id)) maHideLabel(id, info); else maShowLabel(id, info);

		mBy('dummy').focus();
		// maHideLabel(id,info);
	}
	mClass(table, 'flexWrap');
	let keys = ['ant', 'horse', 'poodle', 'frog', 'elephant'];
	let infolist = keys.map(x => picInfo(x));
	infoDictionary = {};
	for (const info of infolist) {
		infoDictionary[getBestWord(info, 'E')] = info;
	}
	let styles = { w: 200, h: 200, margin: 20, bg: 'random', cursor: 'pointer', rounding: 16, padding: 10 };
	let picLabelStyles = getHarmoniousStylesPlus(styles, {}, {}, 200, 200, 0, 'arial', 'random', 'transparent', true);
	// let picLabelStyles = getHarmoniousStylesPlus({ rounding: 10, margin: 24 }, {}, {}, 200, 200, 0, 'arial', 'random', 'transparent', true);
	for (const info of infolist) {
		let label = getBestWord(info, 'E');
		let x = maPicLabelX(info, label.toUpperCase(), table, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], true, false)
		x.id = 'd' + label;
		x.onclick = handler;
		x.style.cursor = 'pointer';
		x.lastChild.style.cursor = 'pointer';
		x.style.userSelect = 'none'
		//x.style.display='inline-box'
	}
}
function test41() {
	//nicht in ein grid sondern einfach so auflinen!
	mClass(table, 'flexWrap')
	let keys = ['ant', 'horse', 'poodle'];
	let infolist = keys.map(x => picInfo(x));
	let picLabelStyles = getHarmoniousStylesPlus({ rounding: 10, margin: 24 }, {}, {}, 200, 200, 0, 'arial', 'random', 'transparent', true);
	for (const info of infolist) {
		let label = getBestWord(info, 'E');
		let x = maPicLabelX(info, label.toUpperCase(), table, picLabelStyles[0], picLabelStyles[1], picLabelStyles[2], true, false)
		x.id = 'd' + label;
		//x.style.display='inline-box'
	}
}
function test40() {

	let picLabelStyles = getHarmoniousStylesPlus({ rounding: 10, margin: 24 }, {}, {}, 200, 200, 0, 'arial', 'random', 'transparent', true);
	let picStyles = getHarmoniousStylesPlus({ rounding: 10, margin: 24 }, {}, {}, 200, 200, 10, 'arial', 'random', 'transparent', false);
	let keys = ['ant', 'horse', 'poodle'];
	let infolist = keys.map(x => picInfo(x));
	randomHybridGrid(infolist, picLabelStyles, picStyles, false, true);
}











//#region svg stuff

function getSvgKeyFor(key, isOmoji) {
	ensureSvgDict();
	return 0;
}
function saveSvgFor(twodi, k, isOmoji, text) {
	let dir = isOmoji ? 'openmoji' : 'twemoji';

}

async function makeExtraSvgFiles() {
	mStyleX(table, { display: 'flex', 'flex-flow': 'row wrap' });
	let ftext = '';
	let di = symbolDict;
	let twodi = {}; //let twdi={};
	let MAX = 0; let cnt = 0;
	for (const k in symbolDict) {
		if (MAX && cnt > MAX) break; cnt += 1;
		let info = symbolDict[k];
		if (info.type != 'emo') continue;
		//console.log(info)
		for (const dir of ['openmoji', 'twemoji']) {

			let hex = info.hexcode;
			if (dir == 'openmoji' && hex.indexOf('-') == 2) hex = '00' + hex;
			let path = '/assets/svg/' + dir + '/' + hex + '.svg';

			let text = await loadAsText(path);
			text = stringBefore(text, '<!-- Code');
			text += '</svg>';
			// let d = mDiv(table, { w: 100, h: 100 });
			// d.innerHTML = text;
			lookupSet(twodi, [k, dir.substring(0, 2) + 'Svg'], text);
			console.log('svg', k, text.substring(0, 20))
		}
	}
	downloadAsYaml(twodi, 'svgDict');
	console.log('DONE!')
}

async function makeHugeSvgFile() {
	mStyleX(table, { display: 'flex', 'flex-flow': 'row wrap' });
	let ftext = '';
	let di = symbolDict;
	let MAX = 0; let cnt = 0;
	for (const k in symbolDict) {
		if (MAX && cnt > MAX) break; cnt += 1;
		let info = symbolDict[k];
		if (info.type != 'emo') continue;
		//console.log(info)
		for (const dir of ['openmoji', 'twemoji']) {

			let hex = info.hexcode;
			if (dir == 'openmoji' && hex.indexOf('-') == 2) hex = '00' + hex;
			let path = '/assets/svg/' + dir + '/' + hex + '.svg';

			let text = await loadAsText(path);
			text = stringBefore(text, '<!-- Code');
			text += '</svg>';
			// let d = mDiv(table, { w: 100, h: 100 });
			// d.innerHTML = text;
			symbolDict[k][dir.substring(0, 2) + 'Svg'] = text;
			console.log('svg', k, text.substring(0, 20))
		}
	}
	downloadAsYaml(symbolDict, 'symbolDict');
	console.log('DONE!')
}
async function makeHugeSvgFile2(isOmoji = true) {
	mStyleX(table, { display: 'flex', 'flex-flow': 'row wrap' });
	let ftext = '';
	let di = symbolDict;
	let MAX = 10; let cnt = 0;
	for (const k in symbolDict) {
		if (cnt > MAX) break; cnt += 1;
		let info = symbolDict[k];
		if (info.type != 'emo') continue;
		//console.log(info)
		let dir = isOmoji ? 'openmoji' : 'twemoji';
		let hex = info.hexcode;
		if (isOmoji && hex.indexOf('-') == 2) hex = '00' + hex;
		let path = '/assets/svg/' + dir + '/' + hex + '.svg';

		let text = await loadAsText(path);
		text = stringBefore(text, '<!-- Code');
		text += '</svg>';
		let d = mDiv(table, { w: 100, h: 100 });
		d.innerHTML = text;

		let prefix = isOmoji ? 'o' : 'tw';
		info[prefix + 'Svg'] = text;
		//console.log(text);
		ftext += text + '\n';
	}

	downloadTextFile(ftext, 'omojis', 'svg');
	downloadAsYaml(symbolDict, 'symbolDict');
}



async function makeHugeSvgFile1(isOmoji = true) {
	mStyleX(table, { display: 'flex', 'flex-flow': 'row wrap' });
	let ftext = '';
	let di = symbolDict;
	for (const info of symListByType['emo']) {
		console.log(info)
		let dir = isOmoji ? 'openmoji' : 'twemoji';
		let hex = info.hexcode;
		if (isOmoji && hex.indexOf('-') == 2) hex = '00' + hex;
		let path = '/assets/svg/' + dir + '/' + hex + '.svg';

		let text = await loadAsText(path);
		text = stringBefore(text, '<!-- Code');
		text += '</svg>';
		let d = mDiv(table, { w: 100, h: 100 });
		d.innerHTML = text;
		//console.log(text);
		ftext += text + '\n';
	}

	console.log('HAAAAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOO')
	downloadTextFile(ftext, 'omojis', 'svg')
}


//#endregion









