
function presentDictTree(nDict, uidStart, area, treeProperty, R, lf, ls, lo, styles) {
	if (nundef(nDict)) {
		console.log('presentDictTree: cannot present nDict!!!');
		return;
	}
	//console.log('_________________',nDict); //, '\nlf', lf, '\nls', ls, '\nlo', lo)
	d = mBy(area);

	let depth = 10;
	let dLevel = [];
	for (let i = 0; i < depth; i++) {
		let d1 = dLevel[i] = mDiv(d);
		mColor(d1, colorTrans('black', i * .1));
		if (isdef(styles)) mStyleX(d1, styles);
	}

	if (isEmpty(nDict)) return;
	maxLevel = 1 + recPresent(nDict[uidStart], 0, dLevel, nDict, treeProperty,
		{ lstFlatten: lf, lstShow: ls, lstOmit: lo });
}

function presentNodes(sp, area, lf, ls, lo) {
	for (const k in sp) {
		presentAddNode(sp[k], k, area, lf, ls, lo);
	}
}

function presentOidNodes(R, area, lf, ls, lo) {
	for(const oid in R._sd){
		let rsg=R.getR(oid);
		if (!isEmpty(rsg)){
			let x = {rsg:rsg};
			presentAddNode(x,oid,area,['rsg'],ls,lo);
		}
	}
	// for (const oid in R.oidNodes) {
	// 	for (const k in R.oidNodes[oid]) {
	// 		presentAddNode(R.oidNodes[oid][k], oid, area, lf, ls, lo);
	// 	}
	// }
}
function presentAddNode(n, title, area, lstFlatten, lstShow, lstOmit) {
	if (nundef(lstOmit)) lstOmit=[];
	addIf(lstOmit,'act');
	addIf(lstOmit,'ui');
	let d = isString(area) ? mBy(area) : area;
	mNodeFilter(n, { dParent: d, title: title, lstFlatten: lstFlatten, lstShow: lstShow, lstOmit: lstOmit });
}
