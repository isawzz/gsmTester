function blankCard(dParent) {
	let c = mDiv(dParent);
	let styles = { w: 70, h: 110, bg: 'beige', rounding: 12, border: 'grey' };
	mStyleX(c, styles)
	return c;
}
function picPosTL(key, dParent, w, h, padding) {
	let info = picInfo(key);
	mAppend(dParent, ui);
	mSize(ui, w, h);
	mPosAbs(ui, padding, padding)
}

//#region skipped
function picRandomSearch() {
	let infolist = picSearch(...arguments);
	if (infolist.length > 1) return chooseRandom(infolist);
	else if (infolist.length == 1) return infolist[0];
	else return null;
}
function picFilterDict(type, funcKeyHex) {
	let keylist = picFilter(type, funcKeyHex);
	return subdictOf(symbolDict, keylist);

}
function picFilter(type, funcKeyHex) {
	//returns  list of keys from symbolDict that match type,funcKeyHex
	// if funcKeyHex is a function, it takes a key and returns true or false!
	if (isString(funcKeyHex)) {
		//special case (icon,bee):
		if (isString(funcKeyHex) && type[0] == 'i' && funcKeyHex[0] != 'i' && duplicateKeys.includes(funcKeyHex)) {
			funcKeyHex = 'i_' + funcKeyHex;
		}
		console.assert(isdef(symByHex[funcKeyHex]) || isdef(symbolDict[funcKeyHex]), 'key or hex is NOT a correct key!!!');

		if (isdef(symbolDict[funcKeyHex])) return [funcKeyHex];
		else if (isdef(symByHex[funcKeyHex])) return [symByHex[funcKeyHex]];

	} else {
		//hier mach die liste und return it or apply functor
		//type can be: [all] | any | emo | eduplo | icon | iduplo
		let isDuplicate = false;
		if (nundef(type)) type = DEFAULTPICTYPE; //see __config.js
		if (type == 'any') {
			type = chooseRandom(['emo', 'icon']); //narrow down type if any
			isDuplicate = chooseRandom([true, false]);
		} else if (type == 'eduplo') {
			type = 'emo';
			isDuplicate = true;
		} else if (type == 'iduplo') {
			type = 'icon';
			isDuplicate = true;
		}

		console.assert(['all', 'emo', 'icon'].includes(type), 'incorrect type!!!!!!!!!!!!!!!')

		// type is now valid!!!
		let keylist = type == 'all' ? symbolKeys
			: isDuplicate ? symbolKeys.filter(x => symbolDict[x].type == type && symbolDict[x].isDuplicate)
				: symbolKeys.filter(x => symbolDict[x].type == type); //make list of keys

		// now type E {all,emo,eduplo,icon,iduplo}, keylist ready and funckeyhex either function or undefined
		console.assert(isList(keylist), 'keylist not ready!!!!!!!!!!!!!!!!!!!!')
		//console.log('type', type, '\nfuncKeyHex', funcKeyHex, '\nkeylist', keylist)

		//apply funckeyhex to it!
		keylist.sort();
		if (nundef(funcKeyHex)) { return keylist; }


		console.log('________________', 'there is a function!!!')
		//console.log(keylist);
		return keylist.filter(funcKeyHex);
	}


	return [];

}
function picKey(type, funcKeyHex) {
	let lst = picFilter(type, funcKeyHex);
	return chooseRandom(lst);
}

function picInfoRandom(type, funcKeyHex) {
	let key = picKey(type, funcKeyHex);
	return picInfo(key);
}
//#endregion

function picDrawText(infoKey, dParent, styles, classes) {
	let info = isString(infoKey) ? picInfo(infoKey) : infoKey;
	console.log('------------text', info.text);
	let res = mPicX(info, dParent, styles, classes);
	//von styles kann einige wegnehmen!
	if (isdef(styles)) {
		let addStyles = {};
		for (const k in styles) {
			if (['bg', 'fg', 'rounding', 'w', 'h', 'padding', 'border'].includes(k)) continue;
			addStyles[k] = styles[k];
		}
		//mStyleX(res, addStyles);
	}
	console.log('res', res);
	info.ui = res;
	return info;
}
function picDrawTextX(infoKey, dParent, styles, classes) {
	let info = isString(infoKey) ? picInfo(infoKey) : infoKey;
	console.log('------------text', info.text);
	let res = mPicX(info, dParent, styles, classes);
	//von styles kann einige wegnehmen!
	if (isdef(styles)) {
		let addStyles = {};
		for (const k in styles) {
			if (['bg', 'fg', 'rounding', 'w', 'h', 'padding', 'border'].includes(k)) continue;
			addStyles[k] = styles[k];
		}
		//mStyleX(res, addStyles);
	}
	console.log('res', res);
	info.ui = res;
	return info;
}
function picDrawImage(info, dParent, styles, classes) {
	let d = mDiv(dParent);
	mClass(d, 'picOuter')
	let ui = mImg(info.path, d); //, { w: 200, h: 200 });
	if (isdef(styles)) mStyleX(d, styles)
	console.log('d', d);
	info.ui = d;
	return info;
}
function picDraw(info, dParent, styles, classes) {

	if (info.type == 'icon' || info.type == 'emotext') { return picDrawText(info, dParent, styles, classes); }
	else { return picDrawImage(info, dParent, styles, classes); }

}
function picDrawKeyAsType(key, type, dParent, styles, classes) {
	let info = picInfo(key);
	info.type = type;
	picDraw(info, dParent, styles, classes);
}
function picDrawKey(key, dParent, styles, classes) {
	let info = picInfo(key);
	picDraw(info, dParent, styles, classes);
}
function picDrawRandom(type, funcKeyHex, dParent, styles, classes) {
	let info = picInfoRandom(type, funcKeyHex);
	picDraw(info, dParent, styles, classes);

}
function fitsWithFont(text, styles, w, h, fz) {
	styles.fz = fz;
	let size = getSizeWithStyles(text, styles);
	if (isdef(styles.w)) return size.h <= h;
	else if (isdef(styles.h)) return size.w <= w;

}
function textTooBigByFactor(text, styles, w, h, fz) {
	styles.fz = fz;
	let size = getSizeWithStyles(text, styles);
	if (isdef(styles.w) && size.h > h + 1) {
		console.log('h', h, '\nsz', size.h, '\nfactor', h / size.h);
		return h / size.h;
	} else if (isdef(styles.h) && size.w > w + 1) {
		return w / size.w;
	} else return 0;

}
function textCorrectionFactor_dep(text, styles, w, h, fz) {
	styles.fz = fz;
	let size = getSizeWithStyles(text, styles);
	if (isdef(styles.w) && Math.abs(size.h - h) > fz) {
		//console.log('h',h,'\nsz',size.h,'\nfactor',h/size.h);
		return size.h / h;
	} else if (isdef(styles.h) && Math.abs(size.w - w) > fz) {
		return size.w / w;
	} else return 0;

}
function textCorrectionFactor(text, styles, w, h, fz) {
	styles.fz = fz;
	//styles.w = w;
	//styles.h = h;
	let size = getSizeWithStyles(text, styles);
	if (Math.abs(size.h - h) > fz) {
		//console.log('h',h,'\nsz',size.h,'\nfactor',h/size.h);
		return size.h / h;
		// } else if (isdef(styles.h) && Math.abs(size.w - w) > fz) {
		// 	return size.w / w;
	} else return 0;

}

function fontTransition(fz, over) {
	//console.log(over)
	if (over > 1.5) over = 1.5;
	else if (over < .5) over = 0.5;
	else if (over > 1) return fz - 1; else if (over < 1) return fz + 1;
	//if (over>=1) over=.9;else if (over<.5) over = .5;
	return fz / over;
}

function card9(contentStyleDict, dParent) {

}
function fitTL(text, w, h, dParent, styles) {

}



function picSearch_dep(keywords, type = null, propsOrFunc = null, isAnd = false, justCompleteWords = false) {
	//#region doc
	/*
usage: ilist=picSearch(['x','y','z'],'all',)
keywords ... list of strings or just 1 string
type ... E [all,eduplo,iduplo,emo,icon]
props
returns list of info
	*/
	//#endregion
	let dict = picFilterDict(type);
	if (!isList(keywords)) keywords = [keywords];
	if (isString(propsOrFunc)) propsOrFunc = [propsOrFunc];

	let infolist = [];
	if (isList(propsOrFunc)) {
		if (isAnd) {
			if (justCompleteWords) {
				infolist = allWordsContainedInPropsAsWord(dict, keywords, propsOrFunc);
			} else {
				infolist = allWordsContainedInProps(dict, keywords, propsOrFunc);
			}
		} else {
			if (justCompleteWords) {
				infolist = anyWordContainedInPropsAsWord(dict, keywords, propsOrFunc);
			} else {
				infolist = anyWordContainedInProps(dict, keywords, propsOrFunc);
			}
		}
	} else if (!propsOrFunc) {
		if (isAnd) {
			if (justCompleteWords) {
				infolist = allWordsContainedInKeysAsWord(dict, keywords, propsOrFunc);
			} else {
				infolist = allWordsContainedInKeys(dict, keywords, propsOrFunc);
			}
		} else {
			if (justCompleteWords) {
				infolist = anyWordContainedInKeysAsWord(dict, keywords, propsOrFunc);
			} else {
				infolist = anyWordContainedInKeys(dict, keywords, propsOrFunc);
			}
		}
	} else {
		//propList is a function!
		infolist = propsOrFunc(dict, keywords);
	}
	return infolist;
}


