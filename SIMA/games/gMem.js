
var TOMM;
function clearMM(){ clearTimeout(TOMM);}
function startGameMM() {}
function startLevelMM() { clearTimeout(TOMM); }
function startRoundMM() { }

function calcTimingMM() {
	let ldep = Math.max(6, G.level > 2 ? G.numPics * 2 : G.numPics);
	return ldep;
}

function promptMM() {
	showPictures(interactMM, { repeat: G.numRepeat, sameBackground: true, border: '3px solid #ffffff80' });
	setGoal();

	if (G.level > 2) { showInstruction('', 'remember all', dTitle, true); }
	else { showInstruction(Goal.label, 'remember', dTitle, true); }

	let secs = calcTimingMM();

	setTimeout(() => turnCardsAfterSecs(secs), 300); //needed fuer ui update! sonst verschluckt er last label
}

function turnCardsAfterSecs(secs) {
	for (const p of Pictures) { slowlyTurnFaceDown(p, secs - 1); }
	TOMM = setTimeout(() => {
		console.log('ui is paused:', isUiInterrupted(), 'game', G.key)

		if (isUiInterrupted() || G.key != 'gMem') {
			console.log('GAME CHANGE!!!!!')
		} else {
			// if (G.level >= 5) { for (const p of Pictures) { turnFaceDown(p); } }
			showInstruction(Goal.label, 'click', dTitle, true);
			activateUi();
		}
	}, secs * 1000);

}
function trialPromptMM() {
	Speech.say(Settings.language == 'D' ? 'nochmal!' : 'try again!');
	//shortHintPic();
	return 10;
}
function slowlyTurnFaceDown(pic, secs = 5) {
	let ui = pic.div;
	for (const p1 of ui.children) {
		p1.style.transition = `opacity ${secs}s ease-in-out`;
		//p1.style.transition = `opacity ${secs}s ease-in-out, background-color ${secs}s ease-in-out`;
		p1.style.opacity = 0;
		//p1.style.backgroundColor = 'dimgray';
		//mClass(p1, 'transopaOff'); //aniSlowlyDisappear');
	}
	if (G.level >= 5) {
		ui.style.transition = `background-color ${secs}s ease-in-out`;
		ui.style.backgroundColor = 'dimgray';
	}
	//ui.style.backgroundColor = 'dimgray';
	pic.isFaceUp = false;

}
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
		if (!pic.isLabelVisible) break;
	}
	div.style.transition = null;
	div.style.backgroundColor = pic.bg;
	pic.isFaceUp = true;
}
function toggleFace(pic) { if (pic.isFaceUp) turnFaceDown(pic); else turnFaceUp(pic); }
function interactMM(ev) {
	ev.cancelBubble = true;
	if (!uiActivated || uiPaused || ev.ctrlKey || ev.altKey) return;

	let id = evToClosestId(ev);
	let i = firstNumber(id);
	let pic = Pictures[i];
	toggleFace(pic);

	if (G.trialNumber == G.trials - 1) {
		turnFaceUp(Goal);
		setTimeout(() => evaluate(ev), 100);
	} else evaluate(ev);

}
function activateMM() {
	//console.log('...activating ui')
	uiActivated = true;
}
function evalMM(ev) {
	let id = evToClosestId(ev);
	ev.cancelBubble = true;

	let i = firstNumber(id);
	let item = Pictures[i];
	Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

	Selected.reqAnswer = Goal.label;
	Selected.answer = item.label;

	if (item.label == Goal.label) { return true; } else {
		return false;
	}
}


