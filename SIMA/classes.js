
class GTouchPic extends Game {
	constructor() {
		super();
	}
}
class GTouchColors extends Game {
	static SIMPLE_COLORS = ['red', 'green', 'yellow', 'blue'];
	constructor() {
		//console.log('creating instance of GTouchColors!!!!!!!!!!!!!')
		super();
	}
	startLevel() {
		this.numColors = getGameOrLevelInfo('numColors', 2);
		G.numLabels = this.numColors * G.numPics;
		this.colorlist = lookupSet(Settings, ['games', 'gTouchColors', 'colors'], GTouchColors.SIMPLE_COLORS);
		this.contrast = lookupSet(Settings, ['games', 'gTouchColors', 'contrast'], .35);
		G.keys = G.keys.filter(x => containsColorWord(x));
		//console.log('GTouchColors keys', G.keys);
	}
	prompt() {
		this.colors = choose(this.colorlist, this.numColors);
		showPictures(evaluate, { colors: this.colors, contrast: this.contrast });

		setGoal(randomNumber(0, G.numPics * this.colors.length - 1));
		Goal.correctionPhrase = Goal.textShadowColor + ' ' + Goal.label;

		let spoken = `click the ${Goal.textShadowColor} ${Goal.label}`;
		showInstruction(Goal.label, `click the <span style='color:${Goal.textShadowColor}'>${Goal.textShadowColor.toUpperCase()}</span>`,
			dTitle, true, spoken);
		activateUi();
	}
	eval(ev) {
		let id = evToClosestId(ev);
		ev.cancelBubble = true;

		let i = firstNumber(id);
		let item = Pictures[i];
		Selected = { pic: item, feedbackUI: item.div };
		Selected.reqAnswer = Goal.label;
		Selected.answer = item.label;

		if (item == Goal) { return true; } else { return false; }
	}
}
class GMem extends Game {
	constructor() {
		super();
	}
	clear() { clearTimeout(this.TO); showMouse(); }
	prompt() {
		showPictures(this.interact.bind(this), { repeat: G.numRepeat, sameBackground: true, border: '3px solid #ffffff80' });
		setGoal();

		if (G.level > 2) { showInstruction('', 'remember all', dTitle, true); }
		else { showInstruction(Goal.label, 'remember', dTitle, true); }

		let secs = calcMemorizingTime(G.numPics, G.level > 2);

		hideMouse();
		TOMain = setTimeout(() => turnCardsAfter(secs), 300, G.level >= 5); //needed fuer ui update! sonst verschluckt er last label

	}
	interact(ev) {
		//console.log('interact!', ev);
		ev.cancelBubble = true;
		if (!canAct()) return;

		let id = evToClosestId(ev);
		let i = firstNumber(id);
		let pic = Pictures[i];
		toggleFace(pic);

		if (G.trialNumber == Settings.trials - 1) {
			turnFaceUp(Goal);
			TOMain = setTimeout(() => evaluate(ev), 100);
		} else evaluate(ev);
	}
}
class GWritePic extends Game {
	constructor() {
		super();
	}
	startGame() {
		onkeydown = ev => {
			if (!canAct()) return;
			if (isdef(this.inputBox)) { this.inputBox.focus(); }
		}
	}
	prompt() {
		showPictures(() => mBy(this.defaultFocusElement).focus());
		setGoal();

		showInstruction(Goal.label, Settings.language == 'E' ? 'type' : "schreib'", dTitle, true);

		mLinebreak(dTable);
		this.inputBox = addNthInputElement(dTable, G.trialNumber);
		this.defaultFocusElement = this.inputBox.id;

		activateUi();
		//return 10;
	}
	trialPrompt() {
		Speech.say(Settings.language == 'E' ? 'try again!' : 'nochmal', 1, 1, .8, 'zira');
		mLinebreak(dTable);
		this.inputBox = addNthInputElement(dTable, G.trialNumber);
		this.defaultFocusElement = this.inputBox.id;

		return 10;
	}
	activate() {
		this.inputBox.onkeyup = ev => {
			if (ev.ctrlKey || uiPaused) return;
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
	constructor() {
		super();
	}
	startLevel() {
		G.numMissingLetters = getGameOrLevelInfo('numMissing', 1);
		let pos = getGameOrLevelInfo('posMissing', 'random');
		G.maxPosMissing = pos == 'start' ? G.numMissingLetters - 1 : 100;

	}
	prompt() {
		showPictures(() => fleetingMessage('just enter the missing letter!'));
		setGoal();

		showInstruction(Goal.label, Settings.language == 'E' ? 'complete' : "ergänze", dTitle, true);

		mLinebreak(dTable);

		// create sequence of letter ui
		let style = { margin: 6, fg: 'white', display: 'inline', bg: 'transparent', align: 'center', border: 'transparent', outline: 'none', family: 'Consolas', fz: 80 };
		let d = createLetterInputs(Goal.label.toUpperCase(), dTable, style); // acces children: d.children

		// randomly choose 1-G.numMissingLetters alphanumeric letters from Goal.label
		let indices = getIndicesCondi(Goal.label, (x, i) => isAlphaNum(x) && i <= G.maxPosMissing);
		this.nMissing = Math.min(indices.length, G.numMissingLetters);
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
	trialPromptML() {
		let selinp = Selected.inp;
		Speech.say(Settings.language == 'D' ? 'nochmal!' : 'try again!');
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
					showFleetingMessage('you entered ' + Selected.lastLetterEntered)
					Speech.say('this letter does NOT belong to the word!')
				}
				showFleetingMessage(this.composeFleetingMessage(), 3000);
				//if get to this place that input did not match!
				//ignore for now!
			}
		}

	}
	eval(word) {
		let answer = normalize(word, Settings.language);
		let reqAnswer = normalize(Goal.label, Settings.language);

		Selected.reqAnswer = reqAnswer;
		Selected.answer = answer;

		if (answer == reqAnswer) return true;
		else if (Settings.language == 'D' && isEnglishKeyboardGermanEquivalent(reqAnswer, answer)) {
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
	constructor() {
		super();
	}
	prompt() {

		showPictures(() => mBy(defaultFocusElement).focus());
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
		let phrase = nTrial < 2 ? (Settings.language == 'E' ? 'speak UP!!!' : 'LAUTER!!!')
			: (Settings.language == 'E' ? 'Louder!!!' : 'LAUTER!!!');
		Speech.say(phrase, 1, 1, 1, 'zira');
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
	eval(isfinal, speechResult, confidence) {

		let answer = Goal.answer = normalize(speechResult, Settings.language);
		let reqAnswer = Goal.reqAnswer = normalize(Goal.label, Settings.language);

		Selected = { reqAnswer: reqAnswer, answer: answer, feedbackUI: Goal.div };

		if (isEmpty(answer)) return false;
		else return isSimilar(answer, reqAnswer);

	}
}

function getInstance(G) { return new (GAME[G.key].cl)(); }





const GAME = {
	gTouchPic: { friendly: 'Pictures!', logo: 'computer mouse', color: 'deepskyblue', cl: GTouchPic, },
	gTouchColors: { friendly: 'Colors!', logo: 'artist palette', color: RED, cl: GTouchColors, }, //'orange', //LIGHTBLUE, //'#bfef45',
	gPremem: { friendly: 'Premem!', logo: 'hammer and wrench', color: LIGHTGREEN, cl: GPremem, }, //'deeppink',
	gMem: { friendly: 'Memory!', logo: 'memory', color: GREEN, cl: GMem, }, //'#3cb44b'
	gMissingLetter: { friendly: 'Letters!', logo: 'black nib', color: 'gold', cl: GMissingLetter, },
	gWritePic: { friendly: 'Type it!', logo: 'keyboard', color: 'orange', cl: GWritePic, }, //LIGHTGREEN, //'#bfef45',
	gSayPic: { friendly: 'Speak up!', logo: 'microphone', color: BLUE, cl: GSayPic, }, //'#4363d8',
	//gSteps: { friendly: 'Steps!', logo: 'stairs', color: PURPLE, cl: GTouchPic, }, //'#911eb4',
};


