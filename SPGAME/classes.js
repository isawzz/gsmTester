
function getInstance(G) {
	// const GameClass = {
	// 	gTouchPic: GTouchPic, gTouchColors: GTouchColors, gPremem: GPremem, gMem: GMem, gMissingLetter: GMissingLetter,
	// 	gMissingNumber: GMissingNumber, gWritePic: GWritePic, gSayPic: GSayPic, gSteps: GSteps, gElim: GElim,
	// 	gAnagram: GAnagram, gAbacus: GAbacus, gPasscode: GPasscode
	// };
	return new (Daat.GameClasses[G.id])(G.id);
}
function myShowPics(handler,ifs={},options={},keys,labels){
	
	if (nundef(keys)) keys = choose(G.keys, G.numPics);
	//keys=['eye'];//['toolbox','tiger']; //keys[0] = 'butterfly'; //keys[0]='man in manual wheelchair';	//keys=['sun with face'];
	// keys=['house','socks','hammer'];
	Pictures = showPics(handler,ifs,options,keys,labels);
	
}

class Game {
	constructor(name) { this.name = name; }
	clear() { clearTimeout(this.TO); clearFleetingMessage(); }
	startGame() { }
	startLevel() { }
	startRound() { }
	prompt() {
		myShowPics(evaluate);
		//showPicturesSpeechTherapyGames(evaluate);
		setGoal();
		showInstruction(Goal.label, 'click', dTitle, true);
		activateUi();
	}
	trialPrompt() {
		sayTryAgain();
		if (!calibrating() && Settings.showHint) shortHintPic();
		return 10;
	}
	activate() { }
	interact() { }
	eval(ev) {
		ev.cancelBubble = true;
		// let id = evToClosestId(ev);		let i = firstNumber(id);		let item = Pictures[i];
		let item = findItemFromEvent(Pictures,ev);

		Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };

		//console.log('Selected', Selected.pic.key, 'id', id)

		Selected.reqAnswer = Goal.label;
		Selected.answer = item.label;

		if (item.label == Goal.label) { return true; } else { return false; }
	}
}

class GInno extends Game {
	constructor(name) { super(name); }
	startLevel() {
		//console.log(G)
	}
	prompt() {
		maShowCards([], [], dTable);//_showPictures();
	}
	trialPrompt() {
		sayTryAgain();
		return 10;
	}
	eval(w, word) {
		Selected = { answer: w, reqAnswer: word, feedbackUI: Goal.div }; //this.inputs.map(x => x.div) };
		//console.log(Selected);
		return w == word;
	}
}
class GTouchPic extends Game {
	constructor(name) { super(name); }
}
class GTouchColors extends Game {
	constructor(name) { super(name); }
	startLevel() {
		G.keys = G.keys.filter(x => containsColorWord(x));
	}
	prompt() {
		let colorKeys = choose(G.colors, G.numColors);
		myShowPics(evaluate, { contrast: G.contrast }, { colorKeys: colorKeys });
		//showPicturesSpeechTherapyGames(evaluate, { contrast: G.contrast }, { colorKeys: colorKeys });
		//Pictures.map(x => x.color = ColorDict[x.textShadowColor]);

		setGoal(randomNumber(0, Pictures.length - 1));

		let [written, spoken] = getOrdinalColorLabelInstruction('click'); //getColorLabelInstruction('click');
		showInstructionX(written, dTitle, spoken);

		activateUi();
	}
	eval(ev) {
		ev.cancelBubble = true;
		// let id = evToClosestId(ev);		let i = firstNumber(id);		let item = Pictures[i];
		let item = findItemFromEvent(Pictures,ev);
		Selected = { pic: item, feedbackUI: item.div };
		Selected.reqAnswer = Goal.label;
		Selected.answer = item.label;

		if (item == Goal) { return true; } else { return false; }
	}
}
class GMem extends Game {
	constructor(name) { super(name); }
	clear() { clearTimeout(this.TO); showMouse(); }
	prompt() {
		myShowPics(this.interact.bind(this),
			{ border: '3px solid #ffffff80' },
			{ repeat: G.numRepeat, sameBackground: true });
		setGoal();

		if (G.level > 2) { showInstruction('', Settings.language == 'E' ? 'remember all' : 'merke dir alle', dTitle, true); }
		else { showInstruction(Goal.label, Settings.language == 'E' ? 'remember' : 'merke dir', dTitle, true); }

		let secs = calcMemorizingTime(G.numPics, G.level > 2);

		hideMouse();
		TOMain = setTimeout(() => turnCardsAfter(secs), 300, G.level >= 5); //needed fuer ui update! sonst verschluckt er last label

	}
	interact(ev) {
		//console.log('interact!', ev);
		ev.cancelBubble = true;
		if (!canAct()) return;
		let pic = findItemFromEvent(Pictures,ev);
		toggleFace(pic);

		if (G.trialNumber == G.trials - 1) {
			turnFaceUp(Goal);
			TOMain = setTimeout(() => evaluate(ev), 100);
		} else evaluate(ev);
	}
}
class GWritePic extends Game {
	constructor(name) { super(name); }
	startGame() {
		onkeydown = ev => {
			if (!canAct()) return;
			if (isdef(this.inputBox)) { this.inputBox.focus(); }
		}
	}
	prompt() {
		myShowPics(() => mBy(this.defaultFocusElement).focus());
		setGoal();

		showInstruction(Goal.label, Settings.language == 'E' ? 'type' : "schreib'", dTitle, true);

		mLinebreak(dTable);
		this.inputBox = addNthInputElement(dTable, G.trialNumber);
		this.defaultFocusElement = this.inputBox.id;

		activateUi();
		//return 10;
	}
	trialPrompt() {
		sayTryAgain();
		mLinebreak(dTable);
		this.inputBox = addNthInputElement(dTable, G.trialNumber);
		this.defaultFocusElement = this.inputBox.id;

		return 10;
	}
	activate() {
		this.inputBox.onkeyup = ev => {
			if (!canAct()) return;
			if (ev.key === "Enter") {
				ev.cancelBubble = true;
				evaluate(ev);
			}
		};
		this.inputBox.focus();
	}
	eval(ev) {
		let answer = normalize(this.inputBox.value, Settings.language);
		let reqAnswer = normalize(Goal.label, Settings.language);

		Selected = { reqAnswer: reqAnswer, answer: answer, feedbackUI: Goal.div };
		if (answer == reqAnswer) return true; else { return false; }
	}

}
class GMissingLetter extends Game {
	constructor(name) { super(name); }
	startLevel() {
		// G.numMissing = getGameOrLevelInfo('numMissing', 1);
		// let pos = getGameOrLevelInfo('posMissing', 'random');
		G.maxPosMissing = G.posMissing == 'start' ? G.numMissing - 1 : 100;
	}
	prompt() {
		myShowPics(() => fleetingMessage('just enter the missing letter!'));
		setGoal();

		showInstruction(Goal.label, Settings.language == 'E' ? 'complete' : "ergänze", dTitle, true);

		mLinebreak(dTable);

		// create sequence of letter ui
		let style = { margin: 6, fg: 'white', display: 'inline', bg: 'transparent', align: 'center', border: 'transparent', outline: 'none', family: 'Consolas', fz: 80 };
		let d = createLetterInputs(Goal.label.toUpperCase(), dTable, style); // acces children: d.children

		// randomly choose 1-G.numMissing alphanumeric letters from Goal.label
		let indices = getIndicesCondi(Goal.label, (x, i) => isAlphaNum(x) && i <= G.maxPosMissing);
		this.nMissing = Math.min(indices.length, G.numMissing);
		//console.log('nMissing is', this.nMissing, G.numPosMissing, G.maxPosMissing, indices, indices.length)
		let ilist = choose(indices, this.nMissing); sortNumbers(ilist);

		this.inputs = [];
		for (const idx of ilist) {
			let inp = d.children[idx];
			inp.innerHTML = '_';
			mClass(inp, 'blink');
			this.inputs.push({ letter: Goal.label[idx].toUpperCase(), div: inp, index: idx });
		}

		mLinebreak(dTable);

		let msg = this.composeFleetingMessage();
		//console.log('msg,msg', msg)
		showFleetingMessage(msg, 3000);
		activateUi();

	}
	trialPrompt() {
		let selinp = Selected.inp;
		sayTryAgain();
		setTimeout(() => {
			let d = selinp.div;
			d.innerHTML = '_';
			mClass(d, 'blink');
		}, 1500);

		showFleetingMessage(this.composeFleetingMessage(), 3000);
		return 10;
	}
	activate() {
		onkeypress = ev => {
			clearFleetingMessage();
			if (!canAct()) return;
			let charEntered = ev.key.toString();
			if (!isAlphaNum(charEntered)) return;

			Selected = { lastLetterEntered: charEntered.toUpperCase() };
			//console.log(inputs[0].div.parentNode)

			if (this.nMissing == 1) {
				let d = Selected.feedbackUI = this.inputs[0].div;
				Selected.positiveFeedbackUI = Goal.div;
				Selected.lastIndexEntered = this.inputs[0].index;
				Selected.inp = this.inputs[0];
				d.innerHTML = Selected.lastLetterEntered;
				mRemoveClass(d, 'blink');
				let result = buildWordFromLetters(mParent(d));

				evaluate(result);
			} else {
				let ch = charEntered.toUpperCase();
				for (const inp of this.inputs) {
					if (inp.letter == ch) {
						Selected.lastIndexEntered = inp.index;
						Selected.inp = inp;
						let d = Selected.feedbackUI = inp.div;
						d.innerHTML = ch;
						mRemoveClass(d, 'blink');
						removeInPlace(this.inputs, inp);
						this.nMissing -= 1;
						break;
					}
				}
				if (nundef(Selected.lastIndexEntered)) {
					//the user entered a non existing letter!!!
					showFleetingMessage('you entered ' + Selected.lastLetterEntered);
					sayRandomVoice('try a different letter!', 'anderer Buchstabe!')
				}
				showFleetingMessage(this.composeFleetingMessage(), 3000);
				//if get to this place that input did not match!
				//ignore for now!
			}
		}

	}
	eval(word) {
		//console.log('word',word,Goal)
		let answer = normalize(word, Settings.language);
		let reqAnswer = normalize(Goal.label, Settings.language);

		Selected.reqAnswer = reqAnswer;
		Selected.answer = answer;

		//console.log(answer, reqAnswer)
		if (answer == reqAnswer) return true;
		else if (Settings.language == 'D' && fromUmlaut(answer) == fromUmlaut(reqAnswer)) {
			//console.log('hhhhhhhhhhhhhhhhhhh')
			return true;
		} else {
			return false;
		}
	}
	composeFleetingMessage() {
		//console.log('this', this)
		let lst = this.inputs;
		//console.log(this.inputs)
		let msg = lst.map(x => x.letter).join(',');
		let edecl = lst.length > 1 ? 's ' : ' ';
		let ddecl = lst.length > 1 ? 'die' : 'den';
		let s = (Settings.language == 'E' ? 'Type the letter' + edecl : 'Tippe ' + ddecl + ' Buchstaben ');
		return s + msg;
	}

}
class GSayPic extends Game {
	constructor(name) { super(name); }
	clear() { Speech.stopRecording(); }
	prompt() {

		myShowPics();
		setGoal();

		showInstruction(Goal.label, Settings.language == 'E' ? 'say:' : "sage: ", dTitle);
		animate(dInstruction, 'pulse800' + bestContrastingColor(G.color, ['yellow', 'red']), 900);

		mLinebreak(dTable);
		MicrophoneUi = mMicrophone(dTable, G.color);
		//console.log('MicrophoneUi',MicrophoneUi)
		MicrophoneHide();

		TOMain = setTimeout(activateUi, 200);

	}
	trialPrompt(nTrial) {
		sayRandomVoice(nTrial < 2 ? 'speak UP!!!' : 'Louder!!!', 'LAUTER!!!');
		animate(dInstruction, 'pulse800' + bestContrastingColor(G.color, ['yellow', 'red']), 500);
		return 10;
	}
	activate() {
		//console.log('hallo')
		if (Speech.isSpeakerRunning()) {
			TOMain = setTimeout(this.activate.bind(this), 200);
		} else {
			TOMain = setTimeout(() => Speech.startRecording(Settings.language, evaluate), 100);
		}

	}
	eval(isfinal, speechResult, confidence, sessionId) {

		//console.log(Goal);
		//console.log('===>',sessionId,SessionId);
		if (sessionId != SessionId) {
			alert('NOT THIS BROWSER!!!!!!'); return undefined;
		}
		let answer = Goal.answer = normalize(speechResult, Settings.language);
		let reqAnswer = Goal.reqAnswer = normalize(Goal.label, Settings.language);

		Selected = { reqAnswer: reqAnswer, answer: answer, feedbackUI: Goal.div };

		if (isEmpty(answer)) return false;
		else return isSimilar(answer, reqAnswer) || isList(Goal.info.valid) && firstCond(Goal.info.valid, x => x.toUpperCase() == answer.toUpperCase());

	}
}
class GPremem extends Game {
	constructor() { super(); this.piclist = []; }
	prompt() {
		this.piclist = [];
		//console.log(G)
		myShowPics(this.interact.bind(this),
			{border: '3px solid #ffffff80'}, // border: '3px solid #ffffff80'
			{ repeat: G.numRepeat, sameBackground: G.sameBackground}), //, showLabels: false });
		showInstruction('', Settings.language == 'E'?'click any picture':'click irgendein Bild', dTitle, true);
		activateUi();
	}
	trialPrompt() {
		for (const p of this.piclist) { toggleSelectionOfPicture(p); }
		this.piclist = [];
		showInstruction('', 'try again: click any picture', dTitle, true);
		return 10;
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) return;

		let pic = findItemFromEvent(Pictures,ev);
		// let id = evToClosestId(ev);
		// let i = firstNumber(id);
		// let pic = Pictures[i];
		//let div = pic.div;
		if (!isEmpty(this.piclist) && this.piclist.length < G.numRepeat - 1 && this.piclist[0].label != pic.label) return;
		toggleSelectionOfPicture(pic, this.piclist);
		//console.log('clicked', pic.key, this.piclist);//,piclist, GPremem.PicList);
		if (isEmpty(this.piclist)) {
			showInstruction('', Settings.language == 'E'?'click any picture':'click irgendein Bild', dTitle, true);
		} else if (this.piclist.length < G.numRepeat - 1) {
			//set incomplete: more steps are needed!
			//frame the picture
			showInstruction(pic.label, Settings.language == 'E'?'click another':'click ein andres Bild mit', dTitle, true);
		} else if (this.piclist.length == G.numRepeat - 1) {
			// look for last picture with x that is not in the set
			let picGoal = firstCond(Pictures, x => x.label == pic.label && !x.isSelected);
			setGoal(picGoal.index);
			showInstruction(picGoal.label, Settings.language == 'E'?'click the ' + (G.numRepeat == 2 ? 'other' : 'last')
			:'click das ' + (G.numRepeat == 2 ? 'andere' : 'letzte') + ' Bild mit', dTitle, true);
		} else {
			//set is complete: eval
			evaluate(this.piclist);
		}
	}
	eval(piclist) {
		Selected = { piclist: piclist, feedbackUI: piclist.map(x => x.div), sz: getBounds(piclist[0].div).height };
		let req = Selected.reqAnswer = piclist[0].label;
		Selected.answer = piclist[piclist.length - 1].label;
		if (Selected.answer == req) { return true; } else { return false; }
	}
}
class GSteps extends Game {
	constructor(name) { super(name); }
	startGame() { G.correctionFunc = showCorrectWords; }
	startLevel() {
		G.keys = G.keys.filter(x => containsColorWord(x));
	}

	prompt() {
		this.piclist = [];
		let colorKeys = G.numColors > 1 ? choose(G.colors, G.numColors) : null;
		let showRepeat = G.numRepeat > 1;

		myShowPics(this.interact.bind(this), { contrast: G.contrast, },
			{ showRepeat: showRepeat, colorKeys: colorKeys, repeat: G.numRepeat });

		setMultiGoal(G.numSteps);
		// console.log(Goal)

		let cmd = 'click';
		let spoken = [], written = [], corr = [];
		for (let i = 0; i < G.numSteps; i++) {
			let goal = Goal.pics[i];
			let sOrdinal = getOrdinal(goal.iRepeat);
			[written[i], spoken[i], corr[i]] = getOrdinalColorLabelInstruction(cmd, sOrdinal, goal.color, goal.label);
			goal.correctionPhrase = corr[i];
			cmd = 'then';
		}
		// console.log('written', written, '\nspoken', spoken);
		showInstructionX(written.join('; '), dTitle, spoken.join('. '), { fz: 20 });

		activateUi();
	}
	trialPrompt() {
		sayTryAgain();
		showFleetingMessage(this.message, 0);
		return 1000;
	}
	activate() {
		for (const p of this.piclist) { toggleSelectionOfPicture(p); }
		this.piclist = [];

	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let pic = findItemFromEvent(Pictures,ev);

		toggleSelectionOfPicture(pic, this.piclist);
		if (this.piclist.length == Goal.pics.length) {
			clearFleetingMessage();
			Selected = { piclist: this.piclist }; evaluate();
		}
	}
	interact_dep(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let pic = findItemFromEvent(Pictures,ev);

		toggleSelectionOfPicture(pic, this.piclist);

		if (isEmpty(this.piclist)) return;

		let iGoal = this.piclist.length - 1;

		if (pic != Goal.pics[iGoal]) { Selected = { pics: this.piclist, wrong: pic, correct: Goal[iGoal] }; evaluate(false); }
		else if (this.piclist.length == Goal.pics.length) { Selected = { piclist: this.piclist }; evaluate(true); }
	}
	eval() {
		//console.log('eval', isCorrect);
		//console.log('piclist', this.piclist)
		Selected = { piclist: this.piclist, feedbackUI: this.piclist.map(x => x.div), sz: getBounds(this.piclist[0].div).height };
		let isCorrect = true;
		this.message = Settings.language == 'D' ? 'beachte die REIHENFOLGE!' : 'mind the ORDER!';
		for (let i = 0; i < this.piclist.length; i++) {
			let p = this.piclist[i];
			if (!Goal.pics.includes(p)) this.message = Settings.language == 'D' ? 'noch einmal!' : 'try again!';
			if (this.piclist[i] != Goal.pics[i]) isCorrect = false;
		}
		return isCorrect;
	}
	eval_dep(isCorrect) {
		//console.log('eval', isCorrect);
		//console.log('piclist', this.piclist)
		Selected = { piclist: this.piclist, feedbackUI: this.piclist.map(x => x.div), sz: getBounds(this.piclist[0].div).height };
		return isCorrect;
	}
}
class GMissingNumber extends Game {
	constructor(name) { super(name); }
	startGame() {
		G.successFunc = successThumbsUp;
		G.failFunc = failThumbsDown;
		G.correctionFunc = this.showCorrectSequence.bind(this);
	}
	showCorrectSequence() { return numberSequenceCorrectionAnimation(getNumSeqHint); }
	startLevel() {
		if (!isList(G.steps)) G.steps = [G.steps];
		G.numPics = 2;
		Settings.labels = false; // do not show labels for the thumbs up/down: TODO: should really do this in game/showThumbsUpDown
	}
	prompt() {
		mLinebreak(dTable, 12);

		showHiddenThumbsUpDown({ sz: 140 });
		mLinebreak(dTable);

		G.step = chooseRandom(G.steps);
		G.op = chooseRandom(G.ops);
		G.oop = OPS[G.op];
		G.seq = createNumberSequence(G.seqLen, G.minNum, G.maxNum, G.step, G.op);
		[G.words, G.letters] = showNumberSequence(G.seq, dTable);
		setNumberSequenceGoal();
		//console.log(G)

		mLinebreak(dTable);

		let instr1 = (Settings.language == 'E' ? 'complete the sequence' : "ergänze die reihe");
		showInstruction('', instr1, dTitle, true);

		if (Settings.showHint) hintEngineStart(getNumSeqHintString, [0, 1, 2, 3, 4], 5000 + G.level * 1000);

		activateUi();
	}
	trialPrompt() {
		let hintlist = G.trialNumber >= 4 ? [G.trialNumber] : range(G.trialNumber, 4);
		if (Settings.showHint) hintEngineStart(getNumSeqHintString, hintlist, 3000 + G.level * 1000);
		setTimeout(() => getWrongChars().map(x => unfillChar(x)), 500);
		return 10;
	}
	activate() { onkeypress = this.interact; }
	interact(ev) {
		//console.log('key!');
		clearFleetingMessage();
		if (!canAct()) return;

		let sel = Selected = onKeyWordInput(ev);
		if (nundef(sel)) return;
		//console.log('===>', sel);

		//target,isMatch,isLastOfGroup,isVeryLast,ch
		let lastInputCharFilled = sel.target;
		console.assert(sel.isMatch == (lastInputCharFilled.letter == sel.ch), lastInputCharFilled, sel.ch);

		//all cases aufschreiben und ueberlegen was passieren soll!
		//TODO: multiple groups does NOT work!!!
		if (sel.isMatch && sel.isVeryLast) {
			deactivateFocusGroup();
			evaluate(true);
		} else if (sel.isMatch && sel.isLastOfGroup) {
			//it has been filled
			//remove this group from Goal.blankWords
			sel.target.isBlank = false;
			sel.target.group.hasBlanks = false;
			removeInPlace(Goal.blankWords, sel.target.group);
			removeInPlace(Goal.blankChars, sel.target);
			deactivateFocusGroup();
			console.log('haaaaaaaaaaaalo', Goal.isFocus)
			//console.log('=>', Goal)
		} else if (sel.isMatch) {
			//a partial match
			removeInPlace(Goal.blankChars, sel.target);
			sel.target.isBlank = false;
		} else if (sel.isVeryLast) {
			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			//console.log('LAST ONE WRONG!!!')
			evaluate(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else if (sel.isLastOfGroup) {
			//unfill last group

			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			evaluate(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else {
			if (!Settings.silentMode) { writeSound(); playSound('incorrect1'); }
			deactivateFocusGroup();
			//unfillCharInput(Selected.target);
			showFleetingMessage('does NOT fit: ' + Selected.ch, 0, { fz: 24 });
			setTimeout(() => unfillCharInput(Selected.target), 500);
		}
		//
	}

	eval(isCorrect) { return isCorrect; }

}
class GElim extends Game {
	constructor(name) { super(name); }
	startGame() {
		G.correctionFunc = () => { writeSound(); playSound('incorrect1'); return Settings.spokenFeedback ? 1800 : 300; };
		G.successFunc = () => { Goal.pics.map(x => x.div.style.opacity = .3); successPictureGoal(); }
	}
	startLevel() {
		G.keys = G.keys.filter(x => containsColorWord(x));
	}
	prompt() {
		this.piclist = [];
		let colorKeys = G.numColors > 1 ? choose(G.colors, G.numColors) : null;
		let showRepeat = G.numRepeat > 1;
		myShowPics(this.interact.bind(this), { contrast: G.contrast, },
			{ showRepeat: showRepeat, colorKeys: colorKeys, repeat: G.numRepeat });

		let [sSpoken, sWritten, piclist] = logicMulti(Pictures);
		this.piclist = piclist;
		Goal = { pics: this.piclist, sammler: [] };

		showInstructionX(sWritten, dTitle, sSpoken, { fz: 22, voice: 'zira' });
		activateUi();
	}
	trialPrompt() {
		sayTryAgain();
		let msg = Settings.language == 'D' ? 'noch einmal!' : 'try again!'
		showFleetingMessage(msg, 0, { margin: -8, fz: 22 }, true);
		return 1000;
	}
	activate() {
		for (const p of this.piclist) { if (p.isSelected) toggleSelectionOfPicture(p); }
		this.piclist = [];
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) return;

		let pic = findItemFromEvent(Pictures,ev);
		// let id = evToClosestId(ev);
		// let pic = firstCond(Pictures, x => x.div.id == id);
		writeSound(); playSound('hit');

		if (Goal.pics.includes(pic)) {
			removePicture(pic);
			//console.log('YES!!!!'); 
			Goal.sammler.push(pic);
		}


		if (Goal.pics.length == Goal.sammler.length) evaluate(true);
		else if (!Goal.pics.includes(pic)) { this.lastPic = pic; evaluate(false); }
		// if (pic.label == Goal.label) evaluate(false);
		// else { removePicture(pic);maLayout(Pictures,dTable) }

	}
	eval(isCorrect) {
		//	console.log('eval', isCorrect);
		// console.log('piclist', this.piclist)
		Selected = { piclist: this.piclist, feedbackUI: isCorrect ? Goal.pics.map(x => x.div) : this.lastPic.div };
		return isCorrect;
	}
}
class GAnagram extends Game {
	constructor(name) { super(name); }
	startLevel() {
		G.keys = setKeys({
			lang: Settings.language, keysets: KeySets, key: 'all',
			filterFunc: (k, w) => w.length <= G.maxWordLength
		});
	}
	prompt() {
		myShowPics(() => fleetingMessage('just enter the missing letters!'));
		setGoal();
		showInstruction(Goal.label, Settings.language == 'E' ? 'drag letters to form' : "forme", dTitle, true);
		mLinebreak(dTable);

		this.inputs = createDropInputs();
		let x = mLinebreak(dTable, 50);//x.style.background='red'
		this.letters = createDragLetters();

		activateUi();

	}
	trialPrompt() {
		sayTryAgain();
		setTimeout(() => {
			this.inputs.map(x => x.div.innerHTML = '_')
			// mClass(d, 'blink');
		}, 1500);

		return 10;
	}
	eval(w, word) {
		Selected = { answer: w, reqAnswer: word, feedbackUI: Goal.div }; //this.inputs.map(x => x.div) };
		//console.log(Selected);
		return w == word;
	}

}
class GAbacus extends Game {
	constructor(name) { super(name); }
	startGame() {
		G.successFunc = successThumbsUp;
		G.failFunc = failThumbsDown;
		G.correctionFunc = this.showCorrectSequence.bind(this);
	}
	showCorrectSequence() { let t = correctBlanks(); showSayHint(3); return t + 1000; }
	startLevel() {
		if (!isList(G.steps)) G.steps = [G.steps];
		G.numPics = 2;
	}
	prompt() {
		mLinebreak(dTable, 2);

		showHiddenThumbsUpDown({ sz: 110 });
		mLinebreak(dTable);

		G.seq = makeExpSequence();

		//console.log('G.seq', G.seq);

		let panel = mDiv(dTable, { bg: '#00000080', padding: 20, rounding: 10 });
		//replace op in seq by wr
		//arrReplace(G.seq,G.op,OPS[G.op].wr);
		[G.words, G.letters] = showEquation(G.seq, panel);
		setNumberSequenceGoal();
		//console.log(G)

		mLinebreak(dTable, 30);

		let instr1 = (Settings.language == 'E' ? 'calculate' : "rechne");
		//let s=G.seq;
		let spOp = G.oop.sp; if (Settings.language == 'D') spOp = DD[spOp];
		let instr2 = G.operand + ' ' + spOp + ' ' + G.step + ' ?';
		//console.log(G);
		//instr1 = arrTake(G.seq,3).join(' ');
		showInstruction('', instr1, dTitle, true, instr2);

		if (G.level <= 1 && Settings.showHint) hintEngineStart(getOperationHintString, [0, 1], 5000 + G.level * 1000);

		activateUi();
	}
	trialPrompt() {
		if (G.level <= 1 && Settings.showHint) hintEngineStart(getOperationHintString, [0, 1], 5000 + G.level * 1000);
		setTimeout(() => getWrongChars().map(x => unfillChar(x)), 500);
		return 10;
	}
	activate() { onkeypress = this.interact; }
	interact(ev) {
		//console.log('key!');
		clearFleetingMessage();
		if (!canAct()) return;

		let sel = Selected = onKeyWordInput(ev);
		if (nundef(sel)) return;
		//console.log('===>', sel);

		//target,isMatch,isLastOfGroup,isVeryLast,ch
		let lastInputCharFilled = sel.target;
		console.assert(sel.isMatch == (lastInputCharFilled.letter == sel.ch), lastInputCharFilled, sel.ch);

		//all cases aufschreiben und ueberlegen was passieren soll!
		//TODO: multiple groups does NOT work!!!
		if (sel.isMatch && sel.isVeryLast) {
			deactivateFocusGroup();
			evaluate(true);
		} else if (sel.isMatch && sel.isLastOfGroup) {
			//it has been filled
			//remove this group from Goal.blankWords
			sel.target.isBlank = false;
			sel.target.group.hasBlanks = false;
			removeInPlace(Goal.blankWords, sel.target.group);
			removeInPlace(Goal.blankChars, sel.target);
			deactivateFocusGroup();
			console.log('haaaaaaaaaaaalo', Goal.isFocus)
			//console.log('=>', Goal)
		} else if (sel.isMatch) {
			//a partial match
			removeInPlace(Goal.blankChars, sel.target);
			sel.target.isBlank = false;
		} else if (sel.isVeryLast) {
			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			//console.log('LAST ONE WRONG!!!')
			evaluate(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else if (sel.isLastOfGroup) {
			//unfill last group

			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			evaluate(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else {
			if (!Settings.silentMode) { writeSound(); playSound('incorrect1'); }
			deactivateFocusGroup();
			//unfillCharInput(Selected.target);
			showFleetingMessage('does NOT fit: ' + Selected.ch, 0, { fz: 24 });
			setTimeout(() => unfillCharInput(Selected.target), 500);
		}
		//
	}

	eval(isCorrect) { return isCorrect; }

}
class GPasscode extends Game {
	constructor(name) { super(name); this.needNewPasscode = true; }
	clear() { clearTimeout(this.TO); clearTimeCD(); }
	startGame(){
		Settings.incrementLevelOnPositiveStreak = Settings.samplesPerGame;
		Settings.decrementLevelOnNegativeStreak = Settings.samplesPerGame;

	}
	startLevel() { this.needNewPasscode = true; }
	prompt() {
		G.trials = 1;
		if (this.needNewPasscode) {
			G.timeout = 1000;
			this.needNewPasscode = false;
			let keys = getRandomKeysFromGKeys(G.passcodeLength);
			myShowPics(null,
				{ border: '3px solid #ffffff80' },
				{ repeat: G.numRepeat, sameBackground: true }, keys);

			//console.log(Pictures)
			Goal = Pictures[0];
			//console.log('===>Goal',Goal);

			this.wort = (Settings.language == 'E' ? 'the passcode' : 'das Codewort');
			showInstruction(Goal.label, this.wort + (Settings.language == 'E' ? ' is' : ' ist'), dTitle, true);

			TOMain = setTimeout(anim1, 300, Goal, 500, showGotItButton);
		}else{
			G.timeout *= 2;
			doOtherStuff();
		}

	}
	eval(x) {
		CountdownTimer.cancel();
		// return super.eval(x);
		let isCorrect = super.eval(x);
		if (!isCorrect) this.needNewPasscode=true;
		return isCorrect;
		// //return the opposite, but no feedback!
		// if (isCorrect) return undefined; else return false;

	}
}


