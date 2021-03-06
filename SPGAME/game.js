var TOList;
//#region animations
function animationCallback(secs, callback, removeBg = false) {
	for (const p of Pictures) { slowlyTurnFaceDown(p, secs - 1, removeBg); }
	TOMain = setTimeout(() => {
		callback();
	}, secs * 1000);

}

function animateColor(elem, from, to, classes, ms) {
	elem.style.backgroundColor = from;
	setTimeout(() => animate(elem, classes, ms), 10);
}
function animate(elem, aniclass, timeoutms) {
	mClass(elem, aniclass);
	setTimeout(() => mRemoveClass(elem, aniclass), timeoutms);
}
function aniInstruction(spoken) {
	if (isdef(spoken)) sayRandomVoice(spoken);
	mClass(dInstruction, 'onPulse');
	setTimeout(() => mRemoveClass(dInstruction, 'onPulse'), 500);

}
function aniFadeInOut(elem, secs) {
	mClass(elem, 'transopaOn');
	//dLineBottomMiddle.opacity=0;
	//mClass(dLineBottomMiddle,'aniFadeInOut');
	setTimeout(() => { mRemoveClass(elem, 'transopaOn'); mClass(elem, 'transopaOff'); }, secs * 1000);
}
function aniPulse(elem, ms) { animate(elem, 'onPulse', ms); }
//#endregion

//#region drag drop example mit letters und inputs: TODO: generalize!
var DragElem = null; //is the clone of element from which drag started
var DropZones = []; //all possible drop elements
var DropZoneItem = null;
var DropZoneItems = [];
var DragSource = null; //original element
var DragSourceItem = null;
var DragSourceItems = [];
function onMouseDownOnLetter(ev) {
	if (!canAct()) return;

	ev.preventDefault();
	let id = evToClosestId(ev);
	//console.log('mouse down on', id);
	let source = mBy(id);

	if (isLetterElement(source)) {
		//console.log('is capital letter', source.id)
		//d wird gecloned

		var clone = DragElem = source.cloneNode(true);
		clone.id = DragElem.id + '_' + clone;
		DragSource = source;

		//clone muss an body attached werden
		mAppend(document.body, clone);
		mClass(clone, 'letter')

		//der clone muss class 'dragelem' sein
		mClass(clone, 'dragelem');

		//der clone wird richtig plaziert
		mStyleX(clone, { left: ev.clientX - ev.offsetX, top: ev.clientY - ev.offsetY });

		clone.drag = { offsetX: ev.offsetX, offsetY: ev.offsetY };

		// von jetzt an un solange DragElem != null ist muss der clone sich mit der maus mitbewegen
		document.body.onmousemove = onMovingCloneAround;
		document.body.onmouseup = onReleaseLetter;// ev=>console.log('mouse up')
	}
}
function onMovingCloneAround(ev) {

	if (DragElem === null) return;

	let mx = ev.clientX;
	let my = ev.clientY;
	let dx = mx - DragElem.drag.offsetX;
	let dy = my - DragElem.drag.offsetY;
	mStyleX(DragElem, { left: dx, top: dy });
}
function onReleaseLetter(ev) {
	let els = allElementsFromPoint(ev.clientX, ev.clientY);
	//console.log('_________',els);
	let inputs = DropZones; //Array.from(mBy('dInputs').children);
	for (const inp of inputs) {
		if (els.includes(inp)) {
			//console.log('yes, we are over',inp.id);
			inp.innerHTML = DragElem.innerHTML;

			//achtung: if clone is a input clone, clear original element!!!!
			if (startsWith(DragElem.id, 'input')) DragSource.innerHTML = '_';
			// t.innerHTML = s.innerHTML;

			//check if word complete!
			let w = buildWordFromLetters(inp.parentNode);
			if (!w.includes('_')) evaluate(w, Goal.label.toUpperCase());

		}
	}
	//destroy clone
	DragElem.remove();
	DragElem = DragSource = null;
	document.body.onmousemove = document.body.onmouseup = null;
}
//#endregion

//#region createLetterInputs
function blankInputs(d, ilist, blink = true) {
	let inputs = [];
	for (const idx of ilist) {
		let inp = d.children[idx];
		inp.innerHTML = '_';
		if (blink) mClass(inp, 'blink');
		inputs.push({ letter: Goal.label[idx].toUpperCase(), div: inp, index: idx });
	}
	return inputs;
}
function buildWordFromLetters(dParent) {
	let letters = Array.from(dParent.children);
	let s = letters.map(x => x.innerHTML);
	s = s.join('');
	return s;
}
function setDropZones(items, handler) {
	DropZones = [];
	DropZoneItems = [];
	for (let i = 0; i < items.length; i++) {
		let d = items[i].div;
		d.onmouseup = () => handler(items[i]);
		mClass(d, 'dropzone');
		DropZones.push(d);
		DropZoneItems.push(items[i]);
	}
}
function createDropInputs() {
	let fz = 120; let word = Goal.label.toUpperCase(); let wlen = word.length;
	let dpEmpty = createLetterInputsX(word, dTable, { pabottom: 5, bg: 'grey', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 }); //,w:40,h:80,margin:10});
	let inputs = blankInputs(dpEmpty, range(0, wlen - 1), false);

	// this.inputs.map(x => mClass(x.div,'dropzone'));

	// this.inputs.map(x => x.div.onclick = () => x.div.innerHTML = '_');
	//console.log(this.inputs);
	DropZones = [];
	for (let i = 0; i < inputs.length; i++) {
		let l = inputs[i].div;
		l.onmousedown = onMouseDownOnLetter;
		l.onclick = l.innerHTML = '_';
		mClass(l, 'dropzone');
		l.id = 'input' + i;
		DropZones.push(l);
	}
	return inputs;
}
function createDragLetters() {
	fz = 60; let word = Goal.label.toUpperCase(); //let wlen = word.length;
	let dp = createLetterInputsX(word, dTable, { bg: 'silver', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 }); //,w:40,h:80,margin:10});
	scrambleInputs(dp);
	let letters = Array.from(dp.children);
	for (let i = 0; i < letters.length; i++) {
		let l = letters[i]
		l.onmousedown = onMouseDownOnLetter;
		mClass(l, 'draggable');
		l.id = 'letter' + i;
	}
	return letters;
}
function createDragClone(ev, items, onRelease) {
	DragSourceItems = items;
	DragSourceItem = findItemFromEvent(items, ev);
	let elem = DragSource = DragSourceItem.div;
	var clone = DragElem = elem.cloneNode(true);
	clone.id = DragElem.id + '_' + clone;
	DragSource = elem;

	//clone muss an body attached werden
	mAppend(document.body, clone);
	//mClass(clone, 'letter')

	//der clone muss class 'dragelem' sein
	mClass(clone, 'dragelem');

	//der clone wird richtig plaziert
	mStyleX(clone, { left: ev.clientX - ev.offsetX, top: ev.clientY - ev.offsetY });

	clone.drag = { offsetX: ev.offsetX, offsetY: ev.offsetY };

	// von jetzt an un solange DragElem != null ist muss der clone sich mit der maus mitbewegen
	document.body.onmousemove = onMovingCloneAround;
	document.body.onmouseup = onRelease;// ev=>console.log('mouse up')

}
function cancelDD(){
	DragElem.remove();
	DragElem = DragSource = DragSourceItem = DropZoneItem = null;
	//document.body.onmousemove = document.body.onmouseup = null;
}
function dropAndEval(ev) {
	cancelBubble=true;
	let els = allElementsFromPoint(ev.clientX, ev.clientY);
	if (nundef(DragElem)) return;
	let targetItem = DropZoneItem = firstCond(DropZoneItems, x => els.includes(x.div));//DropZones.includes(x));
	//let targetItem = findItemFromElem(Pictures,targetElem);

	if (nundef(targetItem)) {cancelDD(); return;}

	let droppedItem = DragSourceItem;
	replacePicAndLabel(targetItem, targetItem.key, droppedItem.label);
	//console.log('__________DragSource', DragSource); return7//;

	cancelDD();
	return;

	//trial#2 WORKS!
	// let [items,rows] = getPictureItems(null, undefined, { rows: 2, showLabels: true }, [key]);
	// presentItems(items, dTable, 3);
	// return;


	//trial#1 WORKS!
	// clearElement(dTable);
	// showPicturesSpeechTherapyGames(null,{},{},[key]);
	// return;
}
function createDragWords(items, handler) {
	let keys = items.map(x => x.key);
	shuffle(keys);

	titems = showLbls(null, undefined, { rows: 1, showLabels: true }, keys);
	//let [titems, rows] = getTextItems(null, undefined, { rows: 2, showLabels: true }, keys);
	titems.map(x => x.div.style.cursor = 'pointer');//mClass(x.div, 'draggable'));
	//presentItems(titems, dTable, 1);
	titems.map(x => x.div.onmousedown = (ev) => {
		// let source = findItemFromEvent(titems, ev);
		// let target = findItemFromKey(Pictures, source.key);
		createDragClone(ev, titems, dropAndEval);
	});
	return titems;
}
function createLetterInputs(s, dParent, style, idForContainerDiv, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true) {
	let d = mDiv(dParent);
	if (isdef(idForContainerDiv)) d.id = idForContainerDiv;
	inputs = [];
	let whiteStyle = jsCopy(style);
	if (!colorWhiteSpaceChars) {
		if (isdef(whiteStyle.fg)) delete whiteStyle.fg;
		if (isdef(whiteStyle.bg)) delete whiteStyle.bg;
		if (isdef(whiteStyle.border)) delete whiteStyle.border;
	}
	//console.log('style', style, '\nwhiteStyle', whiteStyle);
	let fg, fgOrig, bg, bgOrig;
	fgOrig = style.fg;
	bgOrig = style.bg;
	if (isVariableColor(fgOrig) && isdef(style.fg)) { fg = computeColorX(fgOrig); style.fg = fg; }
	if (isVariableColor(bgOrig) && isdef(style.bg)) { bg = computeColorX(bgOrig); style.bg = bg; }
	for (let i = 0; i < s.length; i++) {
		let d1 = mCreate('div');
		mAppend(d, d1);
		d1.innerHTML = s[i];
		let white = isWhiteSpace2(s[i]);
		if (white) {
			if (isVariableColor(fgOrig) && isdef(style.fg)) { fg = computeColorX(fgOrig); style.fg = fg; }
			if (isVariableColor(bgOrig) && isdef(style.bg)) { bg = computeColorX(bgOrig); style.bg = bg; }
		}
		//console.log('white(' + s[i] + ') =', white);
		mStyleX(d1, white ? whiteStyle : style);
	}
	return d;
}
function createLetterInputsX(s, dParent, style, idForContainerDiv) {
	let d = mDiv(dParent);
	if (isdef(idForContainerDiv)) d.id = idForContainerDiv;
	inputs = [];
	for (let i = 0; i < s.length; i++) {
		let d1 = mDiv(d);
		d1.innerHTML = s[i];
		mStyleX(d1, style);
	}
	return d;
}
function isLetterElement(elem) { return isCapitalLetterOrDigit(elem.innerHTML); }
function isVariableColor(c) { return c == 'random' || c == 'randPastel' || c == 'randDark' || c == 'randLight' || isList(c); }
function scrambleInputs(d) {
	let children = Array.from(d.children);
	// for(const ch of children){
	// 	mRemove(ch);
	// 	break;
	// }
	shuffle(children);
	//console.log(children)
	for (const ch of children) {
		mAppend(d, ch);
	}

}
//#endregion createLetterInputs

//#region createWordInputs_
function getColorWheel(n, bgContrast, isUp = true) {

}
function getStyledItems(words, bgFunc, fgFunc = 'contrast', fzFunc) {
	let items = [];
	if (isString(bgFunc)) { bgFunc = () => bgFunc; }
	if (isLiteral(fzFunc)) { fzFunc = () => fzFunc; }
	if (isString(fgFunc)) { fgFunc = () => fgFunc; }
	else if (nundef(fgFunc)) fgFunc = (i, w, bg) => colorIdealText(bg);
	for (let i = 0; i < words.length; i++) {
		let w = words[i];
		let bg = bgFunc(i, w);
		let fg = fgFunc(i, w, bg);
		let item = { w: w, bg: bg, fg: fg, i: i, fz: fzFunc(i, w) };
		items.push(item)
	}
	return items;
}
function getStyledItems1(words, bgFunc, fgFunc = 'contrast', fzFunc) {
	let items = [];
	if (isString(bgFunc)) { bgFunc = () => bgFunc; }
	if (isLiteral(fzFunc)) { fzFunc = () => fzFunc; }
	if (isString(fgFunc)) { fgFunc = () => fgFunc; }
	else if (nundef(fgFunc)) fgFunc = (i, w, bg) => colorIdealText(bg);
	for (let i = 0; i < words.length; i++) {
		let w = words[i];
		let bg = bgFunc(i, w);
		let fg = fgFunc(i, w, bg);
		let item = { w: w, bg: bg, fg: fg, i: i, fz: fzFunc(i, w) };
		items.push(item)
	}
	return items;
}
function createWordInputs(words, dParent, idForContainerDiv = 'seqContainer', sep = null, styleContainer = {}, styleWord = {}, styleLetter = {}, styleSep = {}, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true) {

	if (isEmpty(styleWord)) {
		let sz = 80;
		styleWord = {
			margin: 10, padding: 4, rounding: '50%', w: sz, h: sz, display: 'flex', fg: 'lime', bg: 'yellow', 'align-items': 'center',
			border: 'transparent', outline: 'none', fz: sz - 25, 'justify-content': 'center',
		};

	}

	let dContainer = mDiv(dParent);
	if (!isEmpty(styleContainer)) mStyleX(dContainer, styleContainer); else mClass(dContainer, 'flexWrap');
	dContainer.id = idForContainerDiv;

	let inputGroups = [];
	let charInputs = [];

	//charInputs sollen info: {iGroup,iPhrase,iWord,char,word,phrase,div,dGroup,dContainer,ofg,obg,ostyle,oclass}
	//groups sollen haben: [{div,ofg,obg,ostyle,oclass,[charInputs]},...]
	let iWord = 0;
	let idx = 0;
	let numWords = words.length;

	//pure color wheel
	let wheel = getHueWheel(G.color, 40, numWords <= 4 ? 60 : numWords <= 10 ? 30 : 15, 0);
	wheel = wheel.map(x => colorHSLBuild(x, 100, 50));
	wheel = shuffle(wheel);

	//shaded color wheel
	let wheel1 = colorPalShadeX(anyColorToStandardString(wheel[0]), numWords);
	wheel = jsCopy(wheel1);
	//reverse the wheel if subtract
	if (G.op == 'plus') wheel.reverse();


	//console.log('wheel',wheel1, wheel)
	for (const w of words) {
		let dGroup = mDiv(dContainer);
		// let dGroup = mCreate('div');
		// mAppend(dContainer, dGroup);
		mStyleX(dGroup, styleWord);

		let bg = wheel[iWord]; // dGroup.style.backgroundColor=randomColorX(G.color,40,60,0,50,50);//'yellow';//randomColorX(G.color,70,80);
		//console.log('bg', bg);
		dGroup.style.backgroundColor = bg;
		dGroup.style.color = colorIdealText(bg);// randomColorX(bg,20,30);

		dGroup.id = idForContainerDiv + '_' + iWord;
		//mClass(dGroup,'flex')
		let g = { dParent: dContainer, word: w, iWord: iWord, div: dGroup, oStyle: styleWord, ofg: dGroup.style.color, obg: dGroup.style.backgroundColor };
		inputGroups.push(g);

		//here have to add inputs into group for word w
		let inputs = [];
		let iLetter = 0;
		let wString = w.toString();
		for (const l of wString) {
			let dLetter = mDiv(dGroup);
			// let dLetter = mCreate('div');
			// mAppend(dGroup, dLetter);
			if (!isEmpty(styleLetter)) mStyleX(dLetter, styleLetter);
			dLetter.innerHTML = l;
			let inp = { group: g, div: dLetter, letter: l, iLetter: iLetter, index: idx, oStyle: styleLetter, ofg: dLetter.style.color, obg: dLetter.style.backgroundColor };
			charInputs.push(inp);
			inputs.push(inp);
			iLetter += 1; idx += 1;
		}
		g.charInputs = inputs;

		//here have to add separator! if this is not the last wor of group!
		if (iWord < words.length - 1 && isdef(sep)) {
			let dSep = mDiv(dContainer);
			dSep.innerHTML = sep;
			if (isdef(styleSep)) mStyleX(dSep, styleSep);
		}

		iWord += 1;
	}

	return { words: inputGroups, letters: charInputs };
}
function createNumberSequence(n, min, max, step, op = 'plus') {

	let fBuild = x => { return op == 'plus' ? (x + step) : op == 'minus' ? (x - step) : x; };
	if (op == 'minus') min += step * (n - 1);
	if (min >= (max - 10)) max = min + 10;
	let seq = getRandomNumberSequence(n, min, max, fBuild, lastPosition);
	lastPosition = seq[0];

	return seq;
}
function showNumberSequence(words, dParent, idForContainerDiv = 'seqContainer', sep = null, styleContainer = {}, styleWord = {}, styleLetter = {}, styleSep = {}, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true) {
	//words, dParent, idForContainerDiv, sep = null, styleContainer = {}, styleWord = {}, styleLetter = {}, styleSep = {}, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true
	// let wi = createWordInputs_(seq, dParent, 'dNums');

	if (isEmpty(styleWord)) {
		let sz = 80;
		styleWord = {
			margin: 10, padding: 4, rounding: '50%', w: sz, h: sz, display: 'flex', fg: 'lime', bg: 'yellow', 'align-items': 'center',
			border: 'transparent', outline: 'none', fz: sz - 25, 'justify-content': 'center',
		};

	}

	let dContainer = mDiv(dParent);
	if (!isEmpty(styleContainer)) mStyleX(dContainer, styleContainer); else mClass(dContainer, 'flexWrap');
	dContainer.id = idForContainerDiv;

	let inputGroups = [];
	let charInputs = [];

	//charInputs sollen info: {iGroup,iPhrase,iWord,char,word,phrase,div,dGroup,dContainer,ofg,obg,ostyle,oclass}
	//groups sollen haben: [{div,ofg,obg,ostyle,oclass,[charInputs]},...]
	let iWord = 0;
	let idx = 0;
	let numWords = words.length;

	//pure color wheel
	let wheel = getHueWheel(G.color, 40, numWords <= 4 ? 60 : numWords <= 10 ? 30 : 15, 0);
	wheel = wheel.map(x => colorHSLBuild(x, 100, 50));
	wheel = shuffle(wheel);

	//shaded color wheel
	let wheel1 = colorPalShadeX(anyColorToStandardString(wheel[0]), numWords);
	wheel = jsCopy(wheel1);
	//reverse the wheel if subtract
	if (G.op == 'plus') wheel.reverse();


	//console.log('wheel',wheel1, wheel)
	for (const w of words) {
		let dGroup = mDiv(dContainer);
		// let dGroup = mCreate('div');
		// mAppend(dContainer, dGroup);
		mStyleX(dGroup, styleWord);

		let bg = wheel[iWord]; // dGroup.style.backgroundColor=randomColorX(G.color,40,60,0,50,50);//'yellow';//randomColorX(G.color,70,80);
		//console.log('bg', bg);
		dGroup.style.backgroundColor = bg;
		dGroup.style.color = colorIdealText(bg);// randomColorX(bg,20,30);

		dGroup.id = idForContainerDiv + '_' + iWord;
		//mClass(dGroup,'flex')
		let g = { dParent: dContainer, word: w, iWord: iWord, div: dGroup, oStyle: styleWord, ofg: dGroup.style.color, obg: dGroup.style.backgroundColor };
		inputGroups.push(g);

		//here have to add inputs into group for word w
		let inputs = [];
		let iLetter = 0;
		let wString = w.toString();
		for (const l of wString) {
			let dLetter = mDiv(dGroup);
			// let dLetter = mCreate('div');
			// mAppend(dGroup, dLetter);
			if (!isEmpty(styleLetter)) mStyleX(dLetter, styleLetter);
			dLetter.innerHTML = l;
			let inp = { group: g, div: dLetter, letter: l, iLetter: iLetter, index: idx, oStyle: styleLetter, ofg: dLetter.style.color, obg: dLetter.style.backgroundColor };
			charInputs.push(inp);
			inputs.push(inp);
			iLetter += 1; idx += 1;
		}
		g.charInputs = inputs;

		//here have to add separator! if this is not the last wor of group!
		if (iWord < words.length - 1 && isdef(sep)) {
			let dSep = mDiv(dContainer);
			dSep.innerHTML = sep;
			if (isdef(styleSep)) mStyleX(dSep, styleSep);
		}

		iWord += 1;
	}

	return [inputGroups, charInputs];
	return { words: inputGroups, letters: charInputs };
	return [wi.words, wi.letters];
}
function setNumberSequenceGoal() {
	let blank = blankWordInputs(G.words, G.numMissing, G.posMissing);

	Goal = { seq: G.seq, words: G.words, chars: G.letters, blankWords: blank.words, blankChars: blank.letters, iFocus: blank.iFocus };
	Goal.qCharIndices = Goal.blankChars.map(x => x.index);

	Goal.qWordIndices = Goal.blankWords.map(x => x.iWord);

	// let yes = true;
	// for (let i = 0; i < Goal.chars.length; i++) if (Goal.chars[i].index != i) yes = false;
	// console.assert(yes == true);

}
function showEquation(words, dParent, idForContainerDiv, sep = null, styleContainer = {}, styleWord = {}, styleLetter = {}, styleSep = {}, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true) {

	if (isEmpty(styleWord)) {
		let sz = 80;
		let fg = helleFarbe(G.color);
		styleWord = {
			margin: 8, padding: 8, rounding: '50%', w: 'auto', h: sz, display: 'flex', fg: fg, bg: 'transparent',
			'align-items': 'center', border: 'transparent', outline: 'none', fz: sz, 'justify-content': 'center',
		};

	}

	let dContainer = mDiv(dParent);
	if (!isEmpty(styleContainer)) mStyleX(dContainer, styleContainer); else mClass(dContainer, 'flexWrap');
	dContainer.id = idForContainerDiv;

	let inputGroups = [];
	let charInputs = [];

	//charInputs sollen info: {iGroup,iPhrase,iWord,char,word,phrase,div,dGroup,dContainer,ofg,obg,ostyle,oclass}
	//groups sollen haben: [{div,ofg,obg,ostyle,oclass,[charInputs]},...]
	let iWord = 0;
	let idx = 0;
	let numWords = words.length;

	//console.log('wheel',wheel1, wheel)
	for (const w of words) {
		let dGroup = mDiv(dContainer);
		// let dGroup = mCreate('div');
		// mAppend(dContainer, dGroup);
		mStyleX(dGroup, styleWord);

		//dGroup.style.backgroundColor = bg;
		//dGroup.style.color = colorIdealText(bg);// randomColorX(bg,20,30);
		dGroup.id = idForContainerDiv + '_' + iWord;
		//mClass(dGroup,'flex')
		let g = { dParent: dContainer, word: w, iWord: iWord, div: dGroup, oStyle: styleWord, ofg: dGroup.style.color, obg: dGroup.style.backgroundColor };
		inputGroups.push(g);

		//here have to add inputs into group for word w
		let inputs = [];
		let iLetter = 0;
		let wString = w.toString();
		for (const l of wString) {
			let dLetter = mDiv(dGroup);
			if (!isEmpty(styleLetter)) mStyleX(dLetter, styleLetter);
			dLetter.innerHTML = l;
			let inp = { group: g, div: dLetter, letter: l, iLetter: iLetter, index: idx, oStyle: styleLetter, ofg: dLetter.style.color, obg: dLetter.style.backgroundColor };
			charInputs.push(inp);
			inputs.push(inp);
			iLetter += 1; idx += 1;
		}
		g.charInputs = inputs;

		//here have to add separator! if this is not the last wor of group!
		if (iWord < words.length - 1 && isdef(sep)) {
			let dSep = mDiv(dContainer);
			dSep.innerHTML = sep;
			if (isdef(styleSep)) mStyleX(dSep, styleSep);
		}

		iWord += 1;
	}

	return [inputGroups, charInputs];// { words: inputGroups, letters: charInputs };
}
function setEquationGoal() {
	let blank = blankWordInputs(G.words, G.numMissing, G.posMissing);

	Goal = { seq: G.seq, words: G.words, chars: G.letters, blankWords: blank.words, blankChars: blank.letters, iFocus: blank.iFocus };
	Goal.qCharIndices = Goal.blankChars.map(x => x.index);

	Goal.qWordIndices = Goal.blankWords.map(x => x.iWord);

	let yes = true;
	for (let i = 0; i < Goal.chars.length; i++) if (Goal.chars[i].index != i) yes = false;
	console.assert(yes == true);

}
function blankWordInputs(wi, n, pos = 'random') {
	// console.log(getFunctionCallerName(), 'n', n)
	//ignore pos for now and use random only
	let indivInputs = [];
	//console.log('pos', pos)
	let remels =
		pos == 'random' ? choose(wi, n)
			: pos == 'notStart' ? arrTake(wi.slice(1, wi.length - 1), n)
				: pos == 'start' ? arrTake(wi, n)
					: takeFromTo(wi, wi.length - n, wi.length);

	for (const el of remels) {
		for (const inp of el.charInputs) { unfillCharInput(inp); }
		indivInputs = indivInputs.concat(el.charInputs);
		el.hasBlanks = true;
		el.nMissing = el.charInputs.length;
		if (n > 1) el.div.onclick = onClickWordInput;

		//console.log('.....remel',el.hasBlanks)
		//console.log('.....word',wi[el.iWord].hasBlanks)
	}

	return { iFocus: null, words: remels, letters: indivInputs };
}
function onClickWordInput(ev) {
	// console.log('click group!')
	return;
	if (!canAct()) return;
	ev.cancelBubble = true;
	let id = evToClosestId(ev);
	let iWord = Number(stringAfter(id, '_'));
	let g = Goal.words[iWord];

	//console.log('clicked on group', g)
	if (nundef(g.hasBlanks) || !g.hasBlanks) return;
	deactivateFocusGroup();
	activateFocusGroup(g.iWord);
}
function activateFocusGroup(iFocus) {
	if (isdef(iFocus)) Goal.iFocus = iFocus;
	if (Goal.iFocus === null) {
		console.log('nothing to activate');
		return;
	}
	let g = Goal.words[Goal.iFocus];
	//console.log('activate', g)
	g.div.style.backgroundColor = 'black';

}
function deactivateFocusGroup() {
	//console.log('deactivate', Goal.iFocus)
	if (Goal.iFocus === null) {
		//console.log('nothing to deactivate');
		return;
	}
	let g = Goal.words[Goal.iFocus];
	//console.log('activate', g)
	g.div.style.backgroundColor = g.obg;
	Goal.iFocus = null;

}
function onKeyWordInput(ev) {
	let charEntered = ev.key.toString();
	if (!isAlphaNum(charEntered)) return;

	let ch = charEntered.toUpperCase();
	Selected = { lastLetterEntered: ch };
	let cands = Goal.blankChars;
	if (Goal.iFocus) {
		let word = Goal.words[Goal.iFocus];
		if (word.hasBlanks) cands = word.charInputs.filter(x => x.isBlank);
		else deactivateFocusGroup();
	}
	//console.log('cands', cands);
	console.assert(!isEmpty(cands));

	let isLastOfGroup = (Goal.iFocus != null) && cands.length == 1;
	let isVeryLast = Goal.blankChars.length == 1;
	//let isLast = isLastOfGroup || isVeryLast; // geht auf jeden fall zu eval!
	//console.log('iFocus', Goal.iFocus, 'isLastOfGroup', isLastOfGroup, '\nisVeryLast', isVeryLast, '\nGoal', Goal);

	let target = firstCond(cands, x => x.letter == ch);
	let isMatch = target != null;
	if (!isMatch) target = cands[0];
	fillCharInput(target, ch);
	return { target: target, isMatch: isMatch, isLastOfGroup: isLastOfGroup, isVeryLast: isVeryLast, ch: ch };
}
function unfillWord(winp) { winp.charInputs.map(x => unfillCharInput(x)); }
function unfillCharInput(inp) {
	let d = inp.div;
	d.innerHTML = '_';
	mClass(d, 'blink');
	inp.isBlank = true;
}
function unfillChar(inp) { unfillCharInput(inp); }
function fillCharInput(inp, ch) {
	let d = inp.div;
	d.innerHTML = ch;
	mRemoveClass(d, 'blink');
}
function correctWordInput(winp) { winp.charInputs.map(x => refillCharInput(x, x.letter)); }
function refillCharInput(inp, ch) { fillCharInput(inp, ch); }
function getInputStringOfWordi(iWord) { return getInputStringOfWord(Goal.words[iWord]); }
function getInputStringOfChari(index) { return getInputStringOfChar(Goal.chars[index]); }
function getInputStringOfWord(winp) { return winp.charInputs.map(x => x.div.innerHTML).join(''); }
function getInputStringOfChar(inp) { return inp.div.innerHTML; }
function getInputWords() { return Goal.words.map(x => getInputStringOfWord(x)); }

function getQWords() { return Goal.qWordIndices.map(x => Goal.words[x]); }
function getQChars() {
	return Goal.qCharIndices.map(x => Goal.chars[x]);
}

function getWrongChars() { return getQChars().filter(x => getInputStringOfChar(x) != x.letter); }
function getIndicesOfWrongChars() { return getWrongChars().map(x => x.index); }
function getWrongWords() { return getQWords().filter(x => getInputStringOfWord(x) != x.word); }
function getIndicesOfWrongWords() { return getWrongWords().map(x => x.iWord); }
function getCorrectlyAnsweredWords() { return getQWords().filter(x => getInputStringOfWord(x) == x.word); }
function getIndicesOfCorrectlyAnsweredWords() { return getCorrectlyAnsweredWords().map(x => x.iWord); }

function getCorrectWords() { return Goal.seq; }
function getCorrectWordString(sep = ' ') { return getCorrectWords().join(sep); }
function getInputWordString(sep = ' ') { return getInputWords().join(sep); }

//#endregion createWordInputs_

//#region math exp
function makeExpSequence() {
	G.operand = randomNumber(G.minNum, G.maxNum);
	G.op = chooseRandom(G.ops); //G.op ist jetzt ein key in OPS

	//let upper = G.op == 'minus' ? G.operand : G.maxFactor;
	//console.assert(upper >= G.minFactor || upper == 0);

	G.step = G.op == 'minus' ? randomNumber(0, G.operand) : randomNumber(G.minFactor, G.maxFactor); // > upper ? 0 : randomNumber(G.minFactor, upper); // chooseRandom(G.steps);
	G.oop = OPS[G.op];
	//console.log(G.op, G.oop);

	G.result = G.oop.f(G.operand, G.step);

	G.seq = [G.operand, G.oop.wr, G.step, '=', G.result];//,'=',13]; // _createNumberSequence(G.seqLen, G.minNum, G.maxNum, G.step, G.op);

	//G.exp =  [G.operand, G.oop.op, G.step];
	//let exp = G.seq.join(' ');
	//console.log(exp);
	//let result = eval(exp);
	// G.seq = G.seq.concat(['=', result]);

	// console.log('RESULT', G.result);
	return G.seq;
}
function readExp() { }
function writeExp() { }
function blankExpResult() { }
function evalExp() { }
function blankOperand2() { }
function blankOperator() { }
function generateExpAnswers() { }
function setExpGoal() { }
//#endregion

//#region logic selectors (game: Elim!)
function logicMulti(n) {
	let allPics = Pictures;
	let maxPics = 4;
	let [s1, w1, pics1, prop1] = logicFilter(allPics, []);
	let [s, w, pics, prop] = [s1, w1, pics1, prop1];
	let maxloop = 3; cntloop = 0; let propsUsed = [prop1];
	//console.log('______', cntloop, ': prop', prop, '\n', s, '\n', w, '\n', jsCopy(pics));
	while (pics.length > maxPics && cntloop < maxloop) {
		cntloop += 1;
		let opp = arrMinus(allPics, pics);
		if (opp.length <= maxPics) {
			let lst = ['eliminate', 'all', 'EXCEPT'];
			if (Settings.language == 'D') lst = lst.map(x => DD[x]);
			let prefix = lst.join(' ');
			s = prefix + ' ' + s;
			w = prefix + ' ' + w;
			return [s, w, opp];
		}
		//apply another filter!
		[s1, w1, pics1, prop1] = logicFilter(pics, propsUsed);
		if (isEmpty(pics1)) return [s, w, pics];
		else {
			//need to concat!
			pics = pics1;
			prop = prop1;
			if (prop1 == 'label') {
				s = s1 + ' ' + s;
				w = w1 + ' ' + w;
			} else if (arrLast(propsUsed) == 'label') {
				let conn = Settings.language == 'E' ? ' with ' : ' mit ';
				s1 = s1.substring(s1.indexOf(' '));
				w1 = w1.substring(w1.indexOf(' '));
				s = s + conn + s1; w = w + conn + w1;
			} else {
				let conn = Settings.language == 'E' ? ' and ' : ' und ';
				s1 = s1.substring(s1.indexOf(' '));
				w1 = w1.substring(w1.indexOf(' '));
				s = s + conn + s1; w = w + conn + w1;
			}
			propsUsed.push(prop1);
			//console.log('______', cntloop, ': prop', prop, '\n', s, '\n', w, '\n', jsCopy(pics));
		}
		// console.log('______1: prop', prop, '\n', s, '\n', w, '\n', jsCopy(pics));
	}
	//console.log('fehler!')

	let lst1 = ['eliminate', 'all'];
	if (Settings.language == 'D') lst1 = lst1.map(x => DD[x]);
	let prefix = lst1.join(' ');
	s = prefix + ' ' + s;
	w = prefix + ' ' + w;
	return [s, w, pics];
}
function logicFilter(allPics, exceptProps) {
	//should return sSpoken,sWritten,piclist and set Goal
	let props = { label: { vals: getDistinctVals(allPics, 'label'), friendly: '' } };
	if (G.numColors > 1) props.colorKey = { vals: getDistinctVals(allPics, 'colorKey'), friendly: 'color' };
	if (G.numRepeat > 1) props.iRepeat = { vals: getDistinctVals(allPics, 'iRepeat'), friendly: 'number' };

	//console.log('props:::::', Object.keys(props), '\nexcept', exceptProps);
	if (sameList(Object.keys(props), exceptProps)) return ['no props left', 'no', [], 'unknown'];
	//console.log('props', props)

	//level 0: eliminate all backpacks | eliminate all with color=blue | elim all w/ number=2
	let lstSpoken, lstWritten, piclist = [];
	let prop = chooseRandom(arrWithout(Object.keys(props), exceptProps));
	//console.log('prop is', prop, 'vals', props[prop].vals)
	let val = chooseRandom(props[prop].vals);
	//console.log('val chosen', val)
	//val = chooseRandom(myProps[prop])
	//prop = 'iRepeat'; val = 2;

	lstSpoken = [];
	if (prop == 'label') {
		lstSpoken.push(val);// + (Settings.language == 'E' ? 's' : ''));
		lstWritten = [labelPrepper(val)];
		piclist = allPics.filter(x => x.label == val);
	} else if (prop == 'colorKey') {
		lstSpoken = lstSpoken.concat(['with', props[prop].friendly, ColorDict[val][Settings.language]]);
		lstWritten = ['with', props[prop].friendly, colorPrepper(val)];
		piclist = allPics.filter(x => x[prop] == val);
	} else if (prop == 'iRepeat') {
		let op = (G.level > 2 && G.numRepeat > 2 && val > 1 && val < G.numRepeat) ? chooseRandom(['leq', 'geq', 'eq']) : 'eq';
		//op = '!=';
		let oop = OPS[op];
		lstSpoken = lstSpoken.concat(['with', props[prop].friendly, oop.sp, val]);
		lstWritten = ['with', props[prop].friendly, oop.wr, val];

		piclist = allPics.filter(x => oop.f(x[prop], val));

	}
	//console.log(lstSpoken)

	if (nundef(lstWritten)) lstWritten = lstSpoken;
	let s = lstSpoken.join(' ');
	let w = lstWritten.join(' ');
	// console.log('w',w)
	if (Settings.language == 'D') {
		// let x=s.split(' ');
		// console.log(x)
		s = s.split(' ').map(x => translateToGerman(x)).join(' ');
		w = w.split(' ').map(x => translateToGerman(x)).join(' ');
		// lstSpoken = lstSpoken.map(x => DD[x]);
		// lstWritten = lstWritten.map(x => DD[x]);
	}
	//console.log('s', s, '\nw', w)
	return [s, w, piclist, prop];

}

function colorPrepper(val) {

	return `<span style="color:${ColorDict[val].c}">${ColorDict[val][Settings.language].toUpperCase()}</span>`;
}
function labelPrepper(val) { return `<b>${val.toUpperCase()}</b>`; }
function logicCheck(pic) {
	//should return true if pic is part of set to be clicked and remove that pic
	//return false if that pic does NOT belong to piclist
}
function logicReset() {
	//resets piclist;
}
//#endregion

//#region number sequence hints
function hintEngineStart(hintFunc, hintlist, initialDelay) {
	G.hintFunc = hintFunc;
	recShowHints(hintlist, QuestionCounter, initialDelay, d => initialDelay + 2000); //showNumSeqHint(G.trialNumber);

}
function getOperationHintString(i) {
	//return sSpoken,sWritten
	//console.log('i', i, 'trial#', G.trialNumber);
	if (i == 0) {
		let spOp = G.oop.sp; if (Settings.language == 'D') spOp = DD[spOp];
		let sSpoken = [G.operand, spOp, G.step].join(' ');
		let sWritten = visOperation(G.op, G.operand, G.step, null, '?');
		return [sSpoken, sWritten];
	} else {
		let result = G.oop.f(G.operand, G.step);
		let lstSpoken = i == 1 ? result == 0 ? [result] : ['count', 'the red dots'] : [G.operand, G.oop.sp, G.step, 'equals', result];
		if (Settings.language == 'D') lstSpoken = lstSpoken.map(x => translateToGerman(x));
		let sSpoken = lstSpoken.join(' ');
		let sWritten = visOperation(G.op, G.operand, G.step, null);
		return [sSpoken, sWritten];
	}
}
function getNumSeqHintString(i) {
	console.log('i', i, 'trial#', G.trialNumber)
	let cmd = G.op;
	let m = G.step;
	let lstSpoken, lstWritten;
	if (i == 0) {
		lstSpoken = [G.oop.cmd, m];
	} else if (i == 1) {
		let decl = G.op == 'plus' ? 'to' : G.op == 'minus' ? 'from' : 'by';
		let phrase = decl + ' the previous number';
		lstSpoken = [G.oop.cmd, m, G.oop.link, ' the previous number'];
	} else if (i == 2) {
		//console.log('YYYYYYYYYYYYYYYY')
		let iBlank = getNextIndexOfMissingNumber();
		let iPrevious = iBlank - 1;
		let n = G.seq[iPrevious];
		//console.log('==>', iBlank, iPrevious, n, G)
		lstSpoken = ['the previous number', 'is', n];
	} else if (i >= 3) { //  || i > 4) {
		let iBlank = getNextIndexOfMissingNumber();
		let iPrevious = iBlank - 1;
		let n = G.seq[iPrevious];
		let oop = OPS[cmd];//let op = cmd;// == 'plus' ? 'plus' : cmd == 'minus' ? 'minus' : cmd == 'mult' ? 'times' : 'divided by';
		let erg = i >= 4 ? Goal.words[iBlank].word : '?';
		lstSpoken = ['', n, oop.sp, m, 'equals', erg];
		lstWritten = [n, oop.wr, m, '=', erg]; //erg == '?' ? '?' : erg]
	} else {
		//lst = [cmd, m];
		let iBlank = getNextIndexOfMissingNumber();
		lstSpoken = ['enter', Goal.words[iBlank].word];
	}
	if (Settings.language == 'D') lstSpoken = lstSpoken.map(x => translateToGerman(x));
	if (nundef(lstWritten)) lstWritten = lstSpoken;
	return [lstSpoken.join(' '), lstWritten.join(' ')];
}
function getNumSeqHint() {
	let l = G.op == 'plus' ? 'to' : 'from';
	let msg = `${G.op} ${G.step} ${l} the previous number`;
	msg = `${G.oop.cmd} ${G.step} ${G.oop.link} the previous number`;
	return msg;
}
function getNextIndexOfMissingNumber(iStart = 0) {
	//console.log('HAAAAAA', G.numMissing, iStart, Goal)
	for (let i = iStart; i < G.seq.length; i++) {
		//console.log(Goal.words[i])
		if (Goal.words[i].hasBlanks) return i;
	}
	return null;
}
function recShowHints(ilist, rc, delay = 3000, fProgression = d => d * 1.5) {
	if (isEmpty(ilist) || QuestionCounter != rc) return;
	let i = ilist.shift();
	// console.log('enlisting hint',i,ilist);
	TOTrial = setTimeout(() => recShowHintsNext(i, ilist, rc, fProgression(delay), fProgression), delay);
}
function showSayHint(i) {
	let [spoken, written] = G.hintFunc(i);
	if (spoken) sayRandomVoice(spoken); //setTimeout(() => sayRandomVoice(spoken), 300+ms);
	if (written) showFleetingMessage(written, 0, { fz: 40 });
}
function recShowHintsNext(i, ilist, rc, delay, fProgression) {
	//console.log('showing hint #', i, 'trial#', G.trialNumber);
	showSayHint(i);
	if (QuestionCounter == rc) recShowHints(ilist, rc, delay, fProgression);
	//if (i==0){setTimeout(()=>showNumSeqHint(10),6000);}
}
function correctBlanks() {
	let wrong = getWrongWords();
	if (nundef(TOList)) TOList = {};
	Selected.feedbackUI = wrong.map(x => x.div);
	failPictureGoal();
	let t1 = setTimeout(removeMarkers, 1000);
	let t2 = setTimeout(() => wrong.map(x => { correctWordInput(x); animate(x.div, 'komisch', 1300); }), 1000);
	TOList.correction = [t1, t2];
	return 2500;
}
function numberSequenceCorrectionAnimation(stringFunc) {
	//da brauch ich eine chain!!!!!!
	let wrong = getWrongWords();
	if (nundef(TOList)) TOList = {};
	let msg = stringFunc();
	showFleetingMessage(msg, 0, { fz: 32 }); //return;
	Selected.feedbackUI = wrong.map(x => x.div);
	failPictureGoal();

	let t1 = setTimeout(removeMarkers, 1000);
	let t2 = setTimeout(() => wrong.map(x => { correctWordInput(x); animate(x.div, 'komisch', 1300); }), 1000);
	t4 = setTimeout(() => { if (Settings.spokenFeedback) sayRandomVoice(msg); }, 500);
	TOList.numseq = [t1, t2, t4];//, t3, t4];//, t4];

	return 2800;
}
function translateToGerman(w) {
	if (isNumber(w)) return w;
	else if (isdef(DD[w])) return DD[w];
	else return w;
}

//#endregion number sequence (is a wordInput!)

//#region cards turn face up or down
function hideMouse() {
	var x = dTable.getElementsByTagName("DIV");
	for (const el of x) { el.prevCursor = el.style.cursor; }
	for (const p of Pictures) {
		mRemoveClass(p.div, 'frameOnHover'); p.div.style.cursor = 'none';
		for (const ch of p.div.children) ch.style.cursor = 'none';
	}
	for (const el of x) { mClass(el, 'noCursor'); }
}
function showMouse() {
	var x = dTable.getElementsByTagName("DIV");
	if (nundef(x[0].prevCursor)) { console.log('did NOT hide mouse!'); return; }
	for (const el of x) {
		// console.log('classList',el.classList,mHasClass(el,'noCursor'));//,el.classList.includes('noCursor'))
		// if (!mHasClass(el,'noCursor')) return;
		mRemoveClass(el, 'noCursor');
	} //.style.cursor = 'none';
	for (const el of x) { el.style.cursor = el.prevCursor; }
	for (const p of Pictures) {
		mRemoveClass(p.div, 'noCursor');
		mClass(p.div, 'frameOnHover'); p.div.style.cursor = 'pointer';
		for (const ch of p.div.children) ch.style.cursor = 'pointer';
	} //p.divmClass.style.cursor = 'none';}
}

function turnCardsAfter(secs, removeBg = false) {
	for (const p of Pictures) { slowlyTurnFaceDown(p, secs - 1, removeBg); }
	TOMain = setTimeout(() => {
		showInstruction(Goal.label, 'click', dTitle, true);
		showMouse();
		activateUi();
	}, secs * 1000);

}

function slowlyTurnFaceDown(pic, secs = 5, removeBg = false) {
	let ui = pic.div;
	for (const p1 of ui.children) {
		p1.style.transition = `opacity ${secs}s ease-in-out`;
		//p1.style.transition = `opacity ${secs}s ease-in-out, background-color ${secs}s ease-in-out`;
		p1.style.opacity = 0;
		//p1.style.backgroundColor = 'dimgray';
		//mClass(p1, 'transopaOff'); //aniSlowlyDisappear');
	}
	if (removeBg) {
		ui.style.transition = `background-color ${secs}s ease-in-out`;
		ui.style.backgroundColor = 'dimgray';
	}
	//ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
//#endregion cards: turn face up or down

//#region fail, hint, success
function successThumbsUp(withComment = true) {
	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'] : ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!']);
		sayRandomVoice(chooseRandom(comments));
	}
	//console.log(Pictures)
	let p1 = firstCond(Pictures, x => x.key == 'thumbs up');
	p1.div.style.opacity = 1;
	let p2 = firstCond(Pictures, x => x.key == 'thumbs down');
	p2.div.style.display = 'none';
}
function failThumbsDown(withComment = false) {
	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['too bad'] : ["aber geh'"]);
		sayRandomVoice(chooseRandom(comments));
	}
	let p1 = firstCond(Pictures, x => x.key == 'thumbs down');
	p1.div.style.opacity = 1;
	let p2 = firstCond(Pictures, x => x.key == 'thumbs up');
	p2.div.style.display = 'none';
}
function successPictureGoal(withComment = true) {

	//console.log(Selected)

	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'] : ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!']);
		sayRandomVoice(chooseRandom(comments));
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		let uilist;
		if (isdef(Selected.positiveFeedbackUI)) uilist = [Selected.positiveFeedbackUI];
		else uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
		let sz = getBounds(uilist[0]).height;
		//console.log('in der succesfunc!!!!!!!', uilist)
		for (const ui of uilist) mpOver(markerSuccess(), ui, sz * (4 / 5), 'limegreen', 'segoeBlack');
	}
}
function failPictureGoal(withComment = false) {
	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['too bad'] : ["aber geh'"]);
		sayRandomVoice(chooseRandom(comments));
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		let uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
		let sz = getBounds(uilist[0]).height;
		for (const ui of uilist) mpOver(markerFail(), ui, sz * (1 / 2), 'red', 'openMojiTextBlack');
	}
}
function failSomePictures(withComment = false) {
	if (withComment && Settings.spokenFeedback) {
		const comments = (Settings.language == 'E' ? ['too bad'] : ["aber geh'"]);
		sayRandomVoice(chooseRandom(comments));
	}
	for (const p of Pictures) {
		let ui=p.div;
		let sz=p.sz;
		if (p.isCorrect==false) mpOver(markerFail(), ui, sz * (1 / 2), 'red', 'openMojiTextBlack');
		else mpOver(markerSuccess(), ui, sz * (4 / 5), 'limegreen', 'segoeBlack');
	}
	// if (isdef(Selected) && isdef(Selected.feedbackUI)) {
	// 	let uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
	// 	let sz = getBounds(uilist[0]).height;
	// 	for (const ui of uilist) mpOver(markerFail(), ui, sz * (1 / 2), 'red', 'openMojiTextBlack');
	// }
}
function showCorrectWord(sayit = true) {
	let anim = Settings.spokenFeedback ? 'onPulse' : 'onPulse1';
	let div = mBy(Goal.id);
	mClass(div, anim);

	if (!sayit || !Settings.spokenFeedback) Settings.spokenFeedback ? 3000 : 300;

	let correctionPhrase = isdef(Goal.correctionPhrase) ? Goal.correctionPhrase : Goal.label;
	sayRandomVoice(correctionPhrase);
	return Settings.spokenFeedback ? 3000 : 300;
}
function showCorrectWordInTitle(sayit = true) {
	let anim = Settings.spokenFeedback ? 'onPulse' : 'onPulse1';
	clearElement(dInstruction);
	let d1 = mText(`<b>${Goal.label}</b>`, dInstruction, { fz: 36, display: 'inline-block' });
	//dInstruction.innerHTML = `<b>${Goal.label}</b>`;
	mClass(dInstruction, anim);
	showFleetingMessage(Goal.label);

	if (!sayit || !Settings.spokenFeedback) Settings.spokenFeedback ? 3000 : 300;

	let correctionPhrase = isdef(Goal.correctionPhrase) ? Goal.correctionPhrase : Goal.label;
	sayRandomVoice(correctionPhrase);
	return Settings.spokenFeedback ? 3000 : 300;
}
function showCorrectWords(sayit = true) {
	if (nundef(TOList)) TOList = {};
	TOList.correctWords = [];
	let anim = 'onPulse2';
	let to = 0;
	let speaking = sayit && Settings.spokenFeedback;
	let ms = speaking ? 2000 : 1000;
	for (const goal of Goal.pics) {
		TOList.correctWords.push(setTimeout(() => {
			let div = mBy(goal.id);
			mClass(div, anim);
			if (speaking) sayRandomVoice((Settings.language == 'E' ? 'the ' : ' ') + goal.correctionPhrase);
		}, to));
		to += ms;
	}

	if (!sayit || !Settings.spokenFeedback) return to;

	return to + ms;
}
function showCorrectPictureLabels(sayit = true) {
	return 1000;
	for (const p of Pictures) { replacePicAndLabel(p, p.key); }
	Goal = { pics: Pictures };

	let anim = Settings.spokenFeedback ? 'onPulse' : 'onPulse1';
	let div = Selected.feedbackUI;
	mClass(div, anim);

	if (!sayit || !Settings.spokenFeedback) Settings.spokenFeedback ? 3000 : 300;

	let correctionPhrase = isdef(Goal.correctionPhrase) ? Goal.correctionPhrase : Goal.label;
	sayRandomVoice(correctionPhrase);
	return Settings.spokenFeedback ? 3000 : 300;
}
function shortHintPicRemove() {
	mRemoveClass(mBy(Goal.id), 'onPulse1');
}
function shortHintPic() {
	mClass(mBy(Goal.id), 'onPulse1');
	TOMain = setTimeout(() => shortHintPicRemove(), 800);
}
//#endregion

//#region fleetingMessage
var TOFleetingMessage;
function clearFleetingMessage() {
	//console.log('HIER!');//, getFunctionsNameThatCalledThisFunction());
	clearTimeout(TOFleetingMessage);
	clearElement(dLineBottomMiddle);
}
function showFleetingMessage(msg, msDelay, styles = {}, fade = false) {

	let defStyles = { fz: 22, rounding: 10, padding: '2px 12px', matop: 50 };
	styles = deepmergeOverride(defStyles, styles);

	//console.log('bg is', G.color, '\n', styles, arguments)
	if (nundef(styles.fg)) styles.fg = colorIdealText(G.color);

	clearFleetingMessage();
	if (msDelay) {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, styles, fade), msDelay);
	} else {
		fleetingMessage(msg, styles, fade);
	}
}
function fleetingMessage(msg, styles, fade = false) {
	let d = mDiv(dLineBottomMiddle);
	if (isString(msg)) {
		d.innerHTML = msg;
		mStyleX(d, styles)
	} else {
		mAppend(d, msg);
	}
	if (fade) TOMain = aniFadeInOut(dLineBottomMiddle, 1);
}
//#endregion fleetingMessage

//#region game over
function writeSound() { return; console.log('calling playSound'); }
function gameOver(msg, silent = false) { TOMain = setTimeout(aniGameOver(msg, silent), DELAY); }
function aniGameOver(msg, silent = false) {
	if (!silent && !Settings.silentMode) { writeSound(); playSound('goodBye'); }
	enterInterruptState();
	show('freezer2');

	let dComment = mBy('dCommentFreezer2');
	let dMessage = mBy('dMessageFreezer2');
	let d = mBy('dContentFreezer2');
	clearElement(d);
	mStyleX(d, { fz: 20, matop: 40, bg: 'silver', fg: 'indigo', rounding: 20, padding: 25 })
	let style = { matop: 4 };

	if (calibrating()) {
		dMessage.innerHTML = msg;
		dComment.innerHTML = '*** END OF TEST ***';
		showCalibrationResults(d);

	} else {
		dComment.innerHTML = 'Great Job!';
		dMessage.innerHTML = isdef(msg) ? msg : 'Time for a Break...';
		d.style.textAlign = 'center';
		mText('Unit Score:', d, { fz: 22 });

		for (const gname in U.session) {
			let sc = U.session[gname];
			if (sc.nTotal == 0) continue;
			mText(`${DB.games[gname].friendly}: ${sc.nCorrect}/${sc.nTotal} correct answers (${sc.percentage}%) `, d, style);

		}
	}


	mClass(mBy('freezer2'), 'aniSlowlyAppear');
	//saveUnit();

}
//#endregion game over

//#region card face up or down
function turnFaceDown(pic) {
	let ui = pic.div;
	for (const p1 of ui.children) p1.style.opacity = 0; //hide(p1);
	ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
function turnFaceUp(pic) {
	let div = pic.div;
	for (const ch of div.children) {
		ch.style.transition = `opacity ${1}s ease-in-out`;
		ch.style.opacity = 1; //show(ch,true);
		//if (!pic.isLabelVisible) break;
	}
	div.style.transition = null;
	div.style.backgroundColor = pic.bg;
	pic.isFaceUp = true;
}
function toggleFace(pic) { if (pic.isFaceUp) turnFaceDown(pic); else turnFaceUp(pic); }

//#region selection of picture
function toggleSelectionOfPicture(pic, selectedPics) {

	//	console.log(pic)

	let ui = pic.div;
	//if (pic.isSelected){pic.isSelected=false;mRemoveClass(ui,)}
	//console.log('pic selected?',pic.isSelected);
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');

	//if piclist is given, add or remove pic according to selection state
	if (isdef(selectedPics)) {
		if (pic.isSelected) {
			console.assert(!selectedPics.includes(pic), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedPics.push(pic);
		} else {
			console.assert(selectedPics.includes(pic), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedPics, pic);
		}
	}
}

function addNthInputElement(dParent, n) {
	mLinebreak(dParent, 10);
	let d = mDiv(dParent);
	let dInp = mCreate('input');
	dInp.type = "text"; dInp.autocomplete = "off";
	dInp.style.margin = '10px;'
	dInp.id = 'inputBox' + n;
	dInp.style.fontSize = '20pt';
	mAppend(d, dInp);
	return dInp;
}
function calcMemorizingTime(numItems, randomGoal = true) {
	//let ldep = Math.max(6, G.level > 2 ? G.numPics * 2 : G.numPics);
	let ldep = Math.max(6, randomGoal ? numItems * 2 : numItems);
	return ldep;
}
function clearTable() {
	clearElement(dLineTableMiddle); clearElement(dLineTitleMiddle); removeMarkers();
}
function containsColorWord(s) {
	let colors = ['old', 'blond', 'red', 'blue', 'green', 'purple', 'black', 'brown', 'white', 'grey', 'gray', 'yellow', 'orange'];
	for (const c of colors) {
		if (s.toLowerCase().includes(c)) return false;
	}
	return true;
}
function findItemFromEvent(items, ev) {
	let id = evToClosestId(ev);
	let item = firstCond(items, x => x.div.id == id);
	return item;

}
function findItemFromElem(items, elem) {
	let item = firstCond(items, x => x.div == elem);
	return item;

}
function findItemFromKey(items, key) { return firstCond(items, x => x.key == key); }
function getActualText(item){
	//console.log(item)
	if (isdef(item.text)) return item.text.div.innerHTML;
	//if (isdef(item.pic)){return item.div.children[1].innerHTML;} else {return item.div.children[0].innerHTML;}
}
function getRandomKeysFromGKeys(n) { return getRandomKeys(n, G.keys); }
function getGameValues(user, game, level) {
	//console.log(user,game,level)
	let di = { numColors: 1, numRepeat: 1, numPics: 1, numSteps: 1, trials: Settings.trials, colors: ColorList }; // general defaults
	let oGame = lookup(DB.games, [game]);
	if (isDict(oGame)) {
		di = deepmergeOverride(di, oGame); //das ist die entry in settings.yaml
		let levelInfo = lookup(di, ['levels', level]); //das sind specific values for this level
		if (isdef(levelInfo)) { di = deepmergeOverride(di, levelInfo); }
	}
	if (nundef(di.numLabels)) di.numLabels = di.numPics * di.numRepeat * di.numColors;
	delete di.levels;
	delete di.color;
	copyKeys(di, G);
	//console.log('di', di, '\nlevelInfo', levelInfo, '\nG', G);
	//console.log(di,G)

}
function getGameOrLevelInfo(k, defval) {
	let val = lookup(DB.games, [G.id, 'levels', G.level, k]);
	if (!val) val = lookupSet(DB.games, [G.id, k], defval);
	return val;
}
function getDistinctVals(list, prop) {
	let res = [];
	for (const item of list) {
		let val = item[prop];
		addIf(res, val);
	}
	return res;
}
function getGlobalColors() { return Object.keys(ColorDict).map(x => x.E); }
function getOrdinal(i) { return G.numRepeat == 1 ? '' : Settings.language == 'E' ? ordinal_suffix_of(i) : '' + i + '. '; }
function getColorLabelInstruction(cmd, color, label) {
	if (nundef(color)) color = Goal.color;
	let colorWord = color[Settings.language];
	let colorSpan = `<span style='color:${color.c}'>${colorWord.toUpperCase()}</span>`;
	if (nundef(label)) label = Goal.label;
	let labelSpan = `<b>${label.toUpperCase()}</b>`;
	let eCommand, dCommand;
	switch (cmd) {
		case 'click': eCommand = cmd + ' the'; dCommand = cmd; break
		case 'then': eCommand = cmd + ' the'; dCommand = 'dann'; break
	}
	let eInstr = `${eCommand} ${colorWord} ${label}`;
	let dInstr = `${dCommand} ${label} in ${colorWord}`;
	let spoken = Settings.language == 'E' ? eInstr : dInstr;
	let written = spoken.replace(colorWord, colorSpan).replace(label, labelSpan);
	console.log('spoken', spoken, 'written', written);
	return [written, spoken];
}
function getOrdinalColorLabelInstruction(cmd, ordinal, color, label) {
	if (nundef(ordinal)) ordinal = getOrdinal(Goal.iRepeat);
	if (nundef(color)) color = Goal.color;

	let colorWord = '', colorSpan = '';
	if (isdef(color)) {
		colorWord = isdef(color) ? color[Settings.language] : '';
		if (Settings.language == 'D' && !isEmpty(ordinal) && !['lila', 'rosa'].includes(colorWord)) colorWord += 'e';
		colorSpan = `<span style='color:${color.c}'>${colorWord.toUpperCase()}</span>`;
	}

	if (nundef(label)) label = Goal.label;
	let labelSpan = `<b>${label.toUpperCase()}</b>`;
	let eCommand, dCommand;
	switch (cmd) {
		case 'click': eCommand = cmd + ' the'; dCommand = cmd; break
		case 'then': eCommand = cmd + ' the'; dCommand = 'dann'; break
	}
	let eInstr = `${eCommand} ${ordinal} ${colorWord} ${label}`;
	let dInstr = ordinal == '' ? `${dCommand} ${label} ${colorWord == '' ? '' : 'in ' + colorWord}`
		: `${dCommand} ${ordinal} ${colorWord} ${label}`;
	let ecorr = `${ordinal} ${colorWord} ${label}`
	let dcorr = ordinal == '' ? `${label} ${colorWord == '' ? '' : 'in ' + colorWord}`
		: `${ordinal} ${colorWord} ${label}`;
	let corr = Settings.language == 'E' ? ecorr : dcorr;
	let spoken = Settings.language == 'E' ? eInstr : dInstr;
	let written = spoken.replace(colorWord, colorSpan).replace(label, labelSpan);
	//console.log('spoken', spoken, 'written', written);
	return [written, spoken, corr];
}
function removePicture(pic, reorder = false) {
	removeInPlace(Pictures, pic);
	if (reorder) {
		pic.div.remove();
		maLayout(Pictures, dTable);
	} else {
		pic.div.style.opacity = 0;
	}
}
function resetRound() {
	clearTimeouts();
	clearFleetingMessage();
	clearTable();
	updateLabelSettings();
}
function resetScore() {
	//if (nundef(Score)) Score = {};
	Score = { gameChange: true, levelChange: true, nTotal: 0, nCorrect: 0, nCorrect1: 0, nPos: 0, nNeg: 0, labels: true };
	// Score = { gameChange: true, levelChange: true, nTotal: 0, nCorrect: 0, nCorrect1: 0, nPos: 0, nNeg: 0, labels: true };
}
function resetState() {
	clearTimeouts();
	onkeydown = null; onkeypress = null; onkeyup = null;
	lastPosition = 0;
	DELAY = 1000;
	// console.log(G)
	setBackgroundColor();

}
function sayRandomVoice(e, g, voice = 'random') {

	//console.log('sayRandomVoice_________\ne',e,'\ng',g,'\nvoice',voice)

	if (arguments.length == 1) voice = 'random';

	let [r, p, v] = [.8, .9, 1];
	//let voice = Settings.language == 'E' && (e.includes('<') || (e.includes('>')) ?'zira':'random';
	if (!Settings.silentMode) Speech.say(Settings.language == 'E' || nundef(g) ? e : g, r, p, v, voice);
}
function sayTryAgain() { sayRandomVoice('try again!', 'nochmal'); }
function setBadgeLevel(i) {
	//i is now correct level
	//let userStartLevel = getUserStartLevel(G.id);
	//if (userStartLevel > i) _updateStartLevelForUser(G.id, i);
	G.level = i;
	Score.levelChange = true;

	//setBadgeOpacity
	if (isEmpty(badges)) showBadgesX(dLeiste, G.level, onClickBadgeX, G.maxLevel);

	for (let iBadge = 0; iBadge < G.level; iBadge++) {
		badges[iBadge].div.style.opacity = .75;
		badges[iBadge].div.style.border = 'transparent';
		// badges[iBadge].div.children[1].innerHTML = '* ' + iBadge + ' *'; //style.color = 'white';
		badges[iBadge].div.children[1].innerHTML = '* ' + (iBadge+1) + ' *'; //style.color = 'white';
		badges[iBadge].div.children[0].style.color = 'white';
	}
	badges[G.level].div.style.border = '1px solid #00000080';
	badges[G.level].div.style.opacity = 1;
	// badges[G.level].div.children[1].innerHTML = 'Level ' + G.level; //style.color = 'white';
	badges[G.level].div.children[1].innerHTML = 'Level ' + (G.level+1); //style.color = 'white';
	badges[G.level].div.children[0].style.color = 'white';
	for (let iBadge = G.level + 1; iBadge < badges.length; iBadge++) {
		badges[iBadge].div.style.border = 'transparent';
		badges[iBadge].div.style.opacity = .25;
		// badges[iBadge].div.children[1].innerHTML = 'Level ' + iBadge; //style.color = 'white';
		badges[iBadge].div.children[1].innerHTML = 'Level ' + (iBadge+1); //style.color = 'white';
		badges[iBadge].div.children[0].style.color = 'black';
	}
}
function setBackgroundColor() { document.body.style.backgroundColor = G.color; }
function setGoal(index) {
	if (nundef(index)) {
		let rnd = G.numPics < 2 ? 0 : randomNumber(0, G.numPics - 2);
		if (G.numPics >= 2 && rnd == lastPosition && coin(70)) rnd = G.numPics - 1;
		index = rnd;
	}
	lastPosition = index;
	Goal = Pictures[index];
}
function setMultiGoal(n, indices) {
	Goal = { pics: [] };
	if (nundef(indices)) {
		Goal.pics = choose(Pictures, n);
	} else {
		for (const i of indices) Goal.pics.push(Pictures[i]);
	}
}
function showHiddenThumbsUpDown(styles) {
	styles.bg = ['transparent', 'transparent'];

	//console.log('styles', jsCopy(styles))
	Pictures = showPics(null, styles, { sz: styles.sz, showLabels: false }, ['thumbs up', 'thumbs down']); //, ['bravo!', 'nope']);
	//console.log('hallo', Pictures[0])
	for (const p of Pictures) { p.div.style.padding = p.div.style.margin = '6px 0px 0px 0px'; p.div.style.opacity = 0; }

}
function showInstruction(text, cmd, title, isSpoken, spoken, fz) {
	//console.assert(title.children.length == 0,'TITLE NON_EMPTY IN SHOWINSTRUCTION!!!!!!!!!!!!!!!!!')
	//console.log('G.id is', G.id)
	clearElement(title);
	let d = mDiv(title);
	mStyleX(d, { margin: 15 })
	mClass(d, 'flexWrap');

	let msg = cmd + " " + `<b>${text.toUpperCase()}</b>`;
	if (nundef(fz)) fz = 36;
	let d1 = mText(msg, d, { fz: fz, display: 'inline-block' });
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: fz + 2, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});
	dFeedback = dInstruction = d;

	spoken = isSpoken ? isdef(spoken) ? spoken : cmd + " " + text : null;
	dInstruction.addEventListener('click', () => aniInstruction(spoken));

	if (!isSpoken) return;

	sayRandomVoice(isdef(spoken) ? spoken : (cmd + " " + text));

}
function showInstructionX(written, dParent, spoken, { fz, voice } = {}) {
	//console.assert(title.children.length == 0,'TITLE NON_EMPTY IN SHOWINSTRUCTION!!!!!!!!!!!!!!!!!')
	//console.log('G.id is', G.id)
	clearElement(dParent);
	let d = mDiv(dParent);
	mStyleX(d, { margin: 15 })
	mClass(d, 'flexWrap');

	// let msg = cmd + " " + `<b>${text.toUpperCase()}</b>`;
	if (nundef(fz)) fz = 36;
	let d1 = mText(written, d, { fz: fz, display: 'inline-block' });
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: fz + 2, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});
	dFeedback = dInstruction = d;

	dInstruction.addEventListener('click', () => aniInstruction(spoken));
	if (isdef(spoken)) sayRandomVoice(spoken, spoken, voice);

}
function showLevel() {
	dLevel.innerHTML = 'level: ' + (G.level+1) + '/' + (G.maxLevel+1);
	// dLevel.innerHTML = 'level: ' + G.level + '/' + G.maxLevel;
}
function showGameTitle() { dGameTitle.innerHTML = G.friendly; }
function showScore() {

	//console.log('===>_showScore!!!', Score);
	if (Score.gameChange) showBadgesX(dLeiste, G.level, onClickBadgeX, G.maxLevel);

	let scoreString = 'question: ' + (Score.nTotal + 1) + '/' + Settings.samplesPerGame;

	if (Score.levelChange) {
		dScore.innerHTML = scoreString;
		setBadgeLevel(G.level);
	} else {
		setTimeout(() => {
			dScore.innerHTML = scoreString;
			setBadgeLevel(G.level);
		}, 300);
	}
}
function showStats() {
	if (nundef(Score)) initScore();
	showGameTitle();
	showLevel();
	if (calibrating()) { dScore.innerHTML = 'calibrating...'; } else showScore();

	Score.levelChange = false;
	Score.gameChange = false;
}





















