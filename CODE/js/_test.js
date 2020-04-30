
function testRemoveOidLoc(R){
	//brauche random oid und random loc wo die oid existiert!

	let nonEmpty=allCondDict(R.oidNodes,x=> !isEmpty(x));
	// {
	// 	console.log('x',x,'isEmpty',isEmpty(R.oidNodes[x]));
	// 	console.log(R.oidNodes[x]);
	// 	return (!isEmpty(R.oidNodes[x]));
	// });
	//console.log('oidNodes',nonEmpty)
	//let oids = Object.keys(nonEmpty);
	//console.log('oids',nonEmpty);
	let random_oid = chooseRandom(nonEmpty);
	//console.log(R.oidNodes[random_oid]); //this is a dict by loc
	let locs = Object.keys(R.oidNodes[random_oid]);
	//console.log('locs',locs)
	let random_loc = chooseRandom(locs);

	console.log(' T_____________________ testRemoveOidLoc: remove',random_oid,random_loc);
	removeOidFromLoc(random_oid,random_loc,R);

	updateOutput(R);

}







function deepmergeTest() {
	//=> all 3 objects are different copies!!!
	let o1 = { a: 1, c: 1 };
	let o2 = { a: 2, b: 2 };

	let o3 = deepmerge(o1, o2);
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);

	o1.a = 11;
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);

	o2.a = 22;
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);

	o3.a = 33;
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);
}
function logVals(title, o) {
	let s = title + ':  ';
	for (const k in o) { s += k + ':' + o[k] + ' '; }
	console.log(s);
}
















