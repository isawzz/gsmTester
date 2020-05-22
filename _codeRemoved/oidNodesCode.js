class RSG_removed{
	genNODE(genKey = 'G') {
		let gen = jsCopy(this.lastSpec);

		for (const k in gen) {
			//usage: safeRecurse(o, func, params, tailrec) 
			safeRecurse(gen[k], normalizeToList, '_NODE', true);
		}

		this.gens[genKey].push(gen);
		this.lastSpec = gen;
		this.ROOT = gen.ROOT;
		//console.log(gen)
	}

	check_prop(prop, specKey, node, R) {
		let dictIds = {};
		recFindExecute(node, prop, x => { dictIds[x[prop]] = x; });

		//console.log(dictIds);
		return dictIds;
	}

}

//#region helpers to compare oidNodes to R.getR
function oidNodesSame(oid,R){
	let rsg=R.getR(oid);
	let keys = getOidNodeKeys(oid,R);
	return sameList(rsg,keys);
}
function getOidNodeKeys(oid,R){
	let d = R.oidNodes[oid];
	if (nundef(d)) return [];
	let res=[];
	for(const k in d)res.push(d[k].key);
	return res;
}

//#region dynamic: create oidNodes for R._sd.rsg
function createPrototypesForOid(oid, o, R) {
	//console.log('createPrototypesForOid',oid,o.obj_type)
	if (isdef(R.oidNodes[oid])) {
		//console.log('prototypes for', oid, 'already created!');
		return;
	}
	let klist = R.getR(oid);
	//console.log('klist',klist)
	let nlist = {};
	for (const k of klist) {
		let n1 = createProtoForOidAndKey(oid, o, k, R);
		nlist[k] = n1;
	}
	R.oidNodes[oid] = nlist;
}
function createProtoForOidAndKey(oid, o, k, R) {
	let n = R.getSpec(k);
	let n1 = { key: k, oid: oid, uid: getUID() };
	return n1;
}

//#region older _start: run tests
function run05(sp, defaults, sdata) {
	R = new RSG(sp, defaults, sdata);
	ensureRtree(R); //make sure static tree has been built! 
	//addNewlyCreatedServerObjects(sdata,R);
	generateUis('table', R);
	updateOutput(R);
}
function run04(sp, defaults, sdata) {
	T = new RSG(sp, defaults, sdata); // =>R.gens[0]...original spec
	genG('table', R1);
	setTimeout(() => binding01(T), 500);
}
function genG(area, R) {
	console.log('before gen10 habe', R.gens.G.length, R.getSpec());
	R.gen10(); // sources pools
	R.gen11(); // make ROOT single(!) panel
	R.gen12(); // creates places & refs, adds specKey
	R.gen13(); // merges _ref, _id nodes
	R.gen14(); // merges spec types 
	R.gen21(area);// expands dyn root, creates 1 node for each ui and uis

	presentRoot_dep(R.getSpec().ROOT, 'tree');
	//presentGenerations([0,4,5,6],'results',R);
	//presentGeneration(R.gens.G[0], 'results')
}
function run03(sp, defaults, sdata) {

	//console.log(sdata)
	R = new RSG(sp, defaults, sdata); // =>R.gens[0]...original spec

	console.log('before gen10 habe', R.gens.G.length, R.getSpec());

	phase = 1013;

	R.gen10(); //addSourcesAndPools // =>R.gens.G[1]...spec w/ pool,source, o._rsg
	//console.log(R.lastSpec.ROOT);

	R.gen11(); // make ROOT single(!) panel =>R.gens.G[2]... ROOT well-defined

	R.gen12(); // creates places & refs, adds specKey ==>R.gens.G[3]...specKey

	R.gen13(); // merges _ref, _id nodes (_id & _ref) disappear? =>R.gens.G[4]...merged!
	//console.log(jsCopy(R.lastSpec));
	//console.log('______ ROOT sub nach id/ref merging:');
	//console.log(R);
	//R.gens.G[4].ROOT.sub.map(x=>console.log(x));

	phase = 14;
	R.gen14(); // merges spec types =>spec type names disappear! =>R.gens.G[5]...merged!
	//NO, REVERTED!!! also: DParams added to each node (except grid type!), params merged w/ defs!s
	//showsub(R.gens.G[5].ROOT);
	//showChildren(R.gens.G[5].ROOT);

	//gen15 GEHT SO NICHT!!!!!!!!!!!!!!!!!!!!!
	// phase = 15;
	// //ne, das ist alles mist!!!!!!!!!!!! kann nicht einfach mergen!!!!
	// R.gen15();
	// console.log(R.oidNodes)

	//phase = 20;
	//R.gen20(); //expand static roow

	phase = 21;

	R.gen21('table');// expands dyn root, creates 1 node for each ui and uis

	// console.log('______ final ROOT sub:')
	// showsub(R.ROOT);
	// showChildren(R.ROOT);
	// console.log(R);
	//console.log('detectBoardParams1 has been called', countDetectBoardParamsCalls,'times!!!!!')

	//R.gen30(); //NOT IMPLEMENTED!!!

	presentRoot_dep(R.getSpec().ROOT, 'tree');
	//presentGenerations([0,4,5,6],'results',R);

	//presentGeneration(R.gens.G[0], 'results')


}
function showsub(n) {
	console.log('sub:')
	if (nundef(n.sub)) {
		console.log('NO sub!!!', n)
	} else if (isList(n.sub)) {
		n.sub.map(x => console.log(x));
	} else {
		console.log(n.sub);
	}
}
function showChildren(n) {
	console.log('children:')
	if (nundef(n.children)) {
		console.log('NO Children!!!', n)
	} else if (isList(n.children)) {
		n.children.map(x => console.log(x));
	} else {
		console.log(n.children);
	}
}
function updateOutput_dep(R) {

	for (const area of ['spec', 'uiTree', 'rTree', 'oidNodes', 'dicts']) {
		clearElement(area);
	}

	if (SHOW_SPEC) { presentNodes(R.lastSpec, 'spec'); }

	if (SHOW_UITREE) {
		presentDictTree(R.uiNodes, R.tree.uid, 'uiTree', 'children', R,
			['children'],
			// ['uid', 'adirty', 'type', 'data', 'content', 'params', 'uiType', 'oid', 'key', 'boardType'],
			['uid', 'adirty', 'type', 'data', 'content', 'uiType', 'oid', 'key', 'boardType'],
			null,
			{ 'max-width': '35%', font: '14px arial' });
		//not: ui, act, uid, info, defParams, cssParams, typParams, stdParams, bi
	}

	if (SHOW_RTREE) {
		presentDictTree(R.rNodes, R.tree.uid, 'rTree', 'children', R,
			['children'], null, null, { 'max-width': '35%', font: '14px arial' });
	}

	if (SHOW_OIDNODES) { presentOidNodes(R, 'oidNodes'); }

	if (SHOW_DICTIONARIES) {
		//mDictionary(R.rNodes, { dParent: mBy('dicts'), title: 'rNodes ' + Object.keys(R.rNodes).length });
		mDictionary(R.rNodesOidKey, { dParent: mBy('dicts'), title: 'rNodesOidKey ' + Object.keys(R.rNodesOidKey).length });
		mDictionary(R.Locations, { dParent: mBy('dicts'), title: 'locations ' + Object.keys(R.Locations).length });
	}

	// if (SHOW_RTREE) {
	// 	presentTree(R.tree,'children', 'tree', R, ['children']);
	// 	//for(const path in R.rNodes) presentAddNode(R.rNodes[path],'tree',['children'])
	// }

	let numRTree = Object.keys(R.rNodes).length;
	let numUiNodes = nundef(R.uiNodes) ? 0 : Object.keys(R.uiNodes).length;
	let handCounted = R.ROOT.data;
	// console.log('#soll=' + handCounted, '#rtree=' + numRTree, '#uiNodes=' + numUiNodes);
	console.assert(numRTree == numUiNodes, '!!!FEHLCOUNT!!! #rtree=' + numRTree + ', #uiNodes=' + numUiNodes);



}
//#endregion

//#region merging
function mergeChildrenWithRefs(n, R) {
	for (const k in n) {
		//muss eigentlich hier nur die containerProp checken!
		let ch = n[k];
		if (nundef(ch._id)) continue;

		let loc = ch._id;
		//console.log('node w/ id', loc, ch);
		//console.log('parent of node w/ id', loc, jsCopy(n));

		//frage is container node n[containerProp] ein object (b) oder eine list (c)?
		//oder ist _id at top level (n._id) =>caught in caller


		let refs = R.refs[loc];
		if (nundef(refs)) continue;

		//have refs and ids to 1 _id location loc (A)
		//console.log('refs for', loc, refs);

		//parent node is 


		let spKey = Object.keys(refs)[0];
		let nSpec = R.lastSpec[spKey];
		//console.log('nSpec', nSpec);
		let oNew = deepmerge(n[k], nSpec);
		//console.log('neues child', oNew);
		n[k] = oNew;


	}
}
function mergeAllRefsToIdIntoNode(n, R) {
	//n has prop _id
	let loc = n._id;
	let refDictBySpecNodeName = R.refs[loc];
	let nNew = jsCopy(n); //returns new copy of n TODO=>copy check when optimizing(=nie?)
	for (const spNodeName in refDictBySpecNodeName) {
		let reflist = refDictBySpecNodeName[spNodeName];
		for (const ref of reflist) {
			nNew = deepmergeOverride(nNew, ref);
		}
	}
	return nNew;
	//console.log(refDictBySpecNodeName);
}

//#region remove node: R.rNodesOidKey HAS BEEN DEPRECATED!!!
function aushaengen(oid, R) {

	//new code
	console.log('should remove',oid,R.rNodes)

	while(true){
		let uid=firstCondDict(R.rNodes,x=>x.oid==oid);
		if (!uid) return;
		console.log('found node to remove:',uid);
		let n=R.rNodes[uid];

		//make sure that in each round have less rNodes
		let len = Object.keys(R.rNodes).length;

		console.log('removing',n.uid,n)
		recRemove(n,R);
		let len2 = Object.keys(R.rNodes).length;

		if (len2<len){
			console.log('success! removed',len-len2,'nodes!');
		}else{
			console.log('DID NOT REMOVE ANYTHING!!!!',len,len2);
			return;
		}
	}

	//remove all nodes representing oid from R.tree
	//passiert wenn eine server object removed wird

	//an welchen locations gibt es dieses oid object als child?
	let nodes = R.getR(oid);
	//let nodes = R.oidNodes[oid]; //ELIM use R.getR(oid) instead!!!
	//if (!oidNodesSame(oid,R)) { console.log('NOT EQUAL!!!!!!!!!!', getOidNodeKeys(oid,R), R.getR(oid)); }

	if (isEmpty(nodes)) return;
	for (const key of nodes) { //in nodes) {
		//hier kann: removeOidKey aufrufen, das das folgende macht
		removeOidKey(oid, key, R);
	}
}
function removeOidKey(oid, key, R) {
	let nodeInstances = lookup(R.rNodesOidKey, [oid, key]);
	if (!nodeInstances) {
		console.log('nothing to remove!', oid, key);
		return;
	}
	for (const uid of nodeInstances) {
		let n1 = R.rNodes[uid]; //jetzt habe tree nodes von parent in dem oid haengt!
		recRemove(n1, R);
	}
}
function recRemove(n, R) {
	if (isdef(n.children)) {
		//console.log('children',n.children);
		let ids = jsCopy(n.children);
		for (const ch of ids) recRemove(R.rNodes[ch], R);
	}

	if (isdef(n.oid) && isdef(n.key)) {
		let oid = n.oid;
		let key = n.key;
		if (!oidNodesSame(oid, R)) { console.log('NOT EQUAL!!!!!!!!!!', getOidNodeKeys(oid, R), R.getR(oid)); }
		delete R.rNodesOidKey[oid][key];
		if (isEmpty(R.rNodesOidKey[oid])) delete (R.rNodesOidKey[oid]);
		//delete R.oidNodes[oid][key]; // ELIM
		R.removeR(oid, key);
		//if (isEmpty(R.oidNodes[oid])) delete (R.oidNodes[oid]); // ELIM
	}

	delete R.rNodes[n.uid];
	R.unregisterNode(n); //hier wird ui removed, object remains in _sd!
	delete R.uiNodes[n.uid];
	let parent = R.rNodes[n.uidParent];
	removeInPlace(parent.children, n.uid);
	if (isEmpty(parent.children)) delete parent.children;

}


//#region old tests: add or remove oid/key
function getRandomUidNodeWithAct(R) {
	//das geht garnicht!!!!!!!!!!!!!!!!!!!!!!!
	//der node existiert ja nicht mehr!
	//geht fuer remove aber nicht fuer add!!!!!
	let cands = Object.values(R.uiNodes).filter(x => isdef(x.act) && isdef(x.oid));
	//console.log(cands);
	if (isEmpty(cands)) return null;
	let n = chooseRandom(cands);
	//console.log(n);
	return n;
}
function testRemoveOidKey(R) {

	// let { oid, key } = getRandomOidAndKey(R);
	let n = getRandomUidNodeWithAct(R);
	if (!n) {
		console.log('there is no oid to remove!!!');
		return;
	}
	let [oid, key] = [n.oid, n.key];

	let nodeInstances = lookup(R.rNodesOidKey, [oid, key]);
	console.log('_________ testRemoveOidKey', 'remove all', oid, key, nodeInstances);
	//console.log('remove', oid, key);
	removeOidKey(oid, key, R);

	updateOutput(R);

}

function getRandomNodeThatCanBeAdded(R) {
	console.log('SINNLOS!!!')
	let nonEmpty = allCondDict(R._sd, x => !isEmpty(x.rsg));
	console.log('getRandomNodeThatCanBeAdded: nonEmpty',nonEmpty);
}
function testAddOidKey(R) {

	//let n=chooseRandom(R.instantiable);
	console.log(R.instantiable)
	let n = lastCond(R.instantiable, x => !lookup(R.rNodesOidKey, [x.oid, x.key]));
	if (!n) {
		console.log('all nodes are instantiated!!!');
		return;
	}
	//console.log(n);

	let [oid, key] = [n.oid, n.key];
	let o = R.getO(oid);
	if (!o) {
		console.log('no object with oid', oid, 'found!!!');
		return;
	}
	//console.log(' T_____________________ testAddOidLoc: add', oid, '/', key);
	if (o.loc) addOidByLocProperty(oid, key, R); else addOidByParentKeyLocation(oid, key, R);

	//hier brauch ich noch generateUi fuer neue nodes!!!
	//addOidByLocProperty(oid, key, R);

	updateOutput(R);

}
//#endregion













