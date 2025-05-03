function argDetection(s) {
	//returns an object with all search params set
	//convenience um mir die {key: ...} schreibweise zu ersparen
	if (typeof s == 'function') return { func: s };
	if (s == 'emo' || s == 'icon') return { type: s };
	if (s == 'eduplo' || s == 'iduplo') return { type: (s[0] == 'e' ? 'emo' : 'icon'), isDuplicate: true };
	if (isdef(emoSets[s])) return { set: s };
	//extended options!
	if (groupNames & isdef(groupNames[s])) return { group: s };
	if (subgroupNames & isdef(subgroupNames[s])) return { subgroup: s };
	return { keywords: s };
}

function toInfolist(descriptor) {
	if (arguments.length > 1) {
		let params = {};
		for (const arg of arguments) {
			let newParams = argDetection(arg);
			for (const k in newParams) params[k] = newParams[k];
		}
		return picSearch(params);
	}
	if (isString(descriptor)) {
		//frage: was soll das sein???
		//nimm es als keywords or type
		params = argDetection(descriptor); return picSearch(params);
	} else if (isDict(descriptor)) {
		//search params
		return picSearch(descriptor);
	} else if (isList(descriptor)) {
		//is schon eine infolist
		return descriptor;
	} else if (isNumber(descriptor)) {
		return picRandom({ n: descriptor, })
		//kann es eine number sein? 
	}
}

//#region fitText code 
function centerFit(d, child) {
	let bChild = getBounds(child);
	let b = getBounds(d);
	let padding = firstNumber(d.style.padding);
	let wdes = b.width;
	let hdes = b.height;
	let wdesChild = wdes - 2 * padding;
	let hdesChild = hdes - 2 * padding;
	let wChild = bChild.width;
	let hChild = bChild.height;
	let padx = Math.floor(padding + (wdesChild - bChild.width) / 2);
	let pady = Math.floor(padding + (hdesChild - bChild.height) / 2);
	//console.log('\npadding', padding, '\nwdes', wdes, '\nhdes', hdes, '\nwdesChild', wdesChild, '\nhdesChild', hdesChild, '\nwChild', wChild, '\nhChild', hChild, '\npadx', padx, '\npady', pady);
	d.style.padding = pady + 'px ' + padx + 'px';
}
function fitText(text, rect, dParent, styles, classes) {
	let l = rect.cx - (rect.w / 2);
	let t = rect.cy - (rect.h / 2);
	if (dParent.style.position != 'absolute') dParent.style.position = 'relative';
	let d = mDivPosAbs(l, t, dParent);
	styles.display = 'inline-block';
	styles.w = rect.w;
	let fz = 20; if (isdef(styles.fz)) fz = styles.fz;
	let over = textCorrectionFactor(text, styles, rect.w, rect.h, fz); let MAX = 20; let cnt = 0;
	let oldFz = 0; let oldOldFz = 0;
	while (over > 0 && fz >= 8) {
		cnt += 1; if (cnt > MAX) { console.log('MAX reached!!!'); break; }
		//console.log('over',over);
		if (over == 0) break; //perfect font!
		oldOldFz = oldFz;
		oldFz = fz;
		fz = Math.round(fontTransition(fz, over));
		if (oldFz == fz || oldOldFz == fz) break;
		let newOver = textCorrectionFactor(text, styles, rect.w, rect.h, fz);
		over = newOver;
	}
	//console.log(fz)
	d.innerHTML = text;
	mStyleX(d, styles);
	return d;
}
function textCorrectionFactor(text, styles, w, h, fz) {
	styles.fz = fz;
	let size = getSizeWithStyles(text, styles);
	if (Math.abs(size.h - h) > fz) { return size.h / h; } else return 0;
}
function fitWord(text, rect, dParent, styles, classes) {
	let d = mDiv(dParent)
	styles.display = 'inline-block';
	let fz = rect.h;
	let over = wordCorrectionFactor(text, styles, rect.w, rect.h, fz); let MAX = 20; let cnt = 0;
	let oldFz = 0; let oldOldFz = 0;
	while (over > 0 && fz >= 8) {
		cnt += 1; if (cnt > MAX) { console.log('MAX reached!!!'); break; }
		//console.log('over',over);
		if (over == 0) break; //perfect font!
		oldOldFz = oldFz;
		oldFz = fz;
		fz = Math.round(fontTransition(fz, over));
		//console.log('oldFz', oldFz, 'fz', fz)
		if (oldFz == fz || oldOldFz == fz) break;
		let newOver = wordCorrectionFactor(text, styles, rect.w, rect.h, fz);
		over = newOver;
	}
	//console.log(fz)
	d.innerHTML = text;
	mStyleX(d, styles);
	return d;
}
function wordCorrectionFactor(text, styles, w, h, fz) {
	styles.fz = fz;
	let size = getSizeWithStyles(text, styles);
	let hFactor = 1; let wFactor = 1;
	if (size.h > h - 1) { hFactor = size.h / h; }
	if (size.w > w - 1) { wFactor = size.w / w; }
	if (size.w < w && size.h < h) return 0;
	else return Math.max(hFactor, wFactor);


}
//#endregion

//#region dep start over!
function showFont(family) {
	let gap = 5;
	mStyleX(table, { bg: 'random', padding: gap })
	styles = { margin: gap, padding: gap, bg: 'random', fg: 'contrast', fz: 30, family: family }
	let d = fitTextH('hallo', table, styles);
	let b = getBounds(d);
	console.log('w,h', Math.round(b.width), Math.round(b.height));


}
function fitTextH(text, dParent, styles) {
	// styles = {bg:'green',fz:30,family:'lucida sans'}
	// let [l,t,w,h]=[0,0,100,100];
	// let d=mDivPosAbs(l,t,dParent);
	let d = mDiv(dParent);
	d.innerHTML = text;
	styles.display = 'inline-block';
	mLinebreak(table);
	mStyleX(d, styles);
	return d;
}
function fitText01(text, rect, dParent, styles, classes) {
	let [l, t, d] = prelims(rect, dParent, styles);
	//console.log(l,t,d);
	let [w, h] = [100, 100];
	styles = { fz: h * 6 / 7, family: 'emoNoto', bg: 'green' };
	d.innerHTML = text;
	mStyleX(d, styles);
	let b = getBounds(d);
	console.log('bounds', b.width, b.height, 'rect', rect.w, rect.h)



	return;

	let fz = 200;
	let oldFont = 100; let MAX = 5; let cnt = 0;
	while (oldFont != fz) {
		cnt += 1; if (cnt > MAX) { console.log('MAX reached!!!'); break; }

		let res = fontCorrection(text, styles, rect.w, rect.h, fz);
		let wdiff = res.wScroll - res.w;
		console.log(res, wdiff)
		let wOverflow = wdiff > 0;
		if (wOverflow) {
			oldFont = fz;
			fz = fz * res.w / res.wScroll;
			console.log('changing fz to', fz)
		}


	}
	d.innerHTML = text;
	mStyleX(d, styles);

}
function getSizeWithStylesX(text, styles) {
	var d = document.createElement("div");
	document.body.appendChild(d);
	//console.log(styles);
	let cStyles = jsCopy(styles);
	cStyles.position = 'fixed';
	cStyles.opacity = 0;
	cStyles.top = '-9999px';
	mStyleX(d, cStyles);
	d.innerHTML = text;
	let height = d.clientHeight;
	let width = d.clientWidth;

	let scrollWidth = d.scrollWidth;
	let scrollHeight = d.scrollHeight;

	console.log('w', width, 'scrollW', scrollWidth);

	d.parentNode.removeChild(d)
	return { w: width, h: height, wScroll: scrollWidth, hScroll: scrollHeight };
}
function prelims(rect, dParent, styles) {
	//console.log(rect)
	let l = rect.cx - (rect.w / 2);
	let t = rect.cy - (rect.h / 2);

	let d = mDivPosAbs(l, t, dParent);

	styles.display = 'inline-block';
	styles.bg = 'orange';
	//styles.padding = '0px 20px';
	styles.family = 'arial';
	styles.align = 'center';
	//styles.w = rect.w;
	return [l, t, d];
}
function fontCorrection(text, styles, w, h, fz) {
	styles.fz = fz;
	styles.w = w;
	let size = getSizeWithStylesX(text, styles);
	return size;
	console.log(size);
	let dw = w - size.w;
	let dh = h - size.h;

	//if dw>0 was bedeutet das?
	//habe mehr platz, dh schrift=fz zu klein

	//if dh>0 was bedeutet das?
	//habe mehr platz, dh schrift=fz zu klein

	if (dw < 0 || dh < 0) {
		//bedeutet dass fz zu GROSS ist!!!!
		//reduziere fz!
		return fz - 1;
	}

	return Math.max(size.h / h, size.w / w);


	if (size.h > h - 10 || size.w > w - 10) { return Math.max(size.h / h, size.w / w); }
	else if (size.h < h - 10 && size.w < w - 10) { return Math.min(size.h / h, size.w / w); }
	if (Math.abs(size.h - h) > fz || size.w > w) {
		//console.log('h',h,'\nsz',size.h,'\nfactor',h/size.h);
		return size.h / h;
		// } else if (isdef(styles.h) && Math.abs(size.w - w) > fz) {
		// 	return size.w / w;
	} else return 0;
}
function fitTextXX(text, rect, dParent, styles, classes) {
	let [l, t, d] = prelims(rect, dParent, styles);

	let fz = 200;
	let oldFont = 100; let MAX = 5; let cnt = 0;
	while (oldFont != fz) {
		cnt += 1; if (cnt > MAX) { console.log('MAX reached!!!'); break; }

		let res = fontCorrection(text, styles, rect.w, rect.h, fz);
		let wdiff = res.wScroll - res.w;
		console.log(res, wdiff)
		let wOverflow = wdiff > 0;
		if (wOverflow) {
			oldFont = fz;
			fz = fz * res.w / res.wScroll;
			console.log('changing fz to', fz)
		}


	}
	d.innerHTML = text;
	mStyleX(d, styles);

	let b = getBounds(d);
	console.log('bounds', b.width, b.height, 'rect', rect.w, rect.h)

	// textCorrectionFactorX(text, styles, rect.w, rect.h, fz); 
	// let oldFz = 0; let oldOldFz = 0;


	// return;

	// while (over > 0 && fz >= 8) {
	// 	cnt += 1; if (cnt > MAX) { console.log('MAX reached!!!'); break; }
	// 	console.log('over', over, 'fz', fz);
	// 	if (over == 0) break; //perfect font!
	// 	oldOldFz = oldFz;
	// 	oldFz = fz;
	// 	fz = Math.round(fontTransition(fz, over));
	// 	if (oldFz == fz || oldOldFz == fz) break;

	// 	//fz=Math.floor(fz*over);
	// 	//console.log('using over',over);
	// 	let newOver = textCorrectionFactorX(text, styles, rect.w, rect.h, fz);
	// 	let change = over - newOver;
	// 	//console.log('change', change, 'fz change from', oldFz, 'to', fz);
	// 	over = newOver;
	// 	//fz=fz*over;
	// }

	// //console.log(fz)
	// //styles.fz=25;
	// d.innerHTML = text;
	// mStyleX(d, styles);

	// let b = getBounds(d);
	// //console.log('bounds', b.width, b.height, 'rect', rect.w, rect.h)

}
//#endregion

//#region old

function fitTextX(text, rect, dParent, styles, classes) {
	let [l, t, d] = prelims(rect, dParent, styles);

	let fz = 20;
	let over = textCorrectionFactorX(text, styles, rect.w, rect.h, fz); let MAX = 20; let cnt = 0;
	let oldFz = 0; let oldOldFz = 0;
	while (over > 0 && fz >= 8) {
		cnt += 1; if (cnt > MAX) { console.log('MAX reached!!!'); break; }
		console.log('over', over, 'fz', fz);
		if (over == 0) break; //perfect font!
		oldOldFz = oldFz;
		oldFz = fz;
		fz = Math.round(fontTransition(fz, over));
		if (oldFz == fz || oldOldFz == fz) break;

		//fz=Math.floor(fz*over);
		//console.log('using over',over);
		let newOver = textCorrectionFactorX(text, styles, rect.w, rect.h, fz);
		let change = over - newOver;
		//console.log('change', change, 'fz change from', oldFz, 'to', fz);
		over = newOver;
		//fz=fz*over;
	}

	//console.log(fz)
	//styles.fz=25;
	d.innerHTML = text;
	mStyleX(d, styles);

	let b = getBounds(d);
	//console.log('bounds', b.width, b.height, 'rect', rect.w, rect.h)

}
function textCorrectionFactorX(text, styles, w, h, fz) {
	styles.fz = fz;
	//styles.w = w;
	//styles.h = h;
	let size = getSizeWithStyles(text, styles);
	console.log(size);
	let dw = w - size.w;
	let dh = h - size.h;

	//if dw>0 was bedeutet das?
	//habe mehr platz, dh schrift=fz zu klein

	//if dh>0 was bedeutet das?
	//habe mehr platz, dh schrift=fz zu klein

	if (dw < 0 || dh < 0) {
		//bedeutet dass fz zu GROSS ist!!!!
		//reduziere fz!
		return fz - 1;
	}

	return Math.max(size.h / h, size.w / w);


	if (size.h > h - 10 || size.w > w - 10) { return Math.max(size.h / h, size.w / w); }
	else if (size.h < h - 10 && size.w < w - 10) { return Math.min(size.h / h, size.w / w); }
	if (Math.abs(size.h - h) > fz || size.w > w) {
		//console.log('h',h,'\nsz',size.h,'\nfactor',h/size.h);
		return size.h / h;
		// } else if (isdef(styles.h) && Math.abs(size.w - w) > fz) {
		// 	return size.w / w;
	} else return 0;
}
//#endregion







