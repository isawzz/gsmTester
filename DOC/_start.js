window.onload = DOCStart;
var timit;

async function DOCStart() {

	//testSpeech(); return;
	//testDec();return;
	//testFetchCsvAsTextAndSearch(); return;
	//testFetchIndexHtmlAsTextAndSearch(); return;
	//testDirList();return;
	//let x=isAlphaNum('_rParse');console.log(x);return;
	// let vault = await documentVault(['/RSG/js/_rParse.js']);
	// console.log(vault); return;
	//testRegexSplit(); return;
	//testMultiline(); return;
	//testIndenting();return;
	await loadAssets();

	createDocs();
}













