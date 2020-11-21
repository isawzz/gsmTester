var pictureSize;
function determineGame_dep(data) {
	//determining currentGame: data undefined, game name or game index
	if (nundef(data)) {
		if (GameSelectionMode == 'program') {
			data = gameSequence[Settings.program.currentGameIndex];
			currentGame = data.game;
			currentLevel = Settings.program.currentLevel;
		} else if (GameSelectionMode == 'training') {
			currentGame = 'gSayPicAuto';
			currentLevel = 0;
			//MASTER_VOLUME = 1;
			show('divControls');
		} else {
			console.log('hard-coded: currentGame', currentGame, 'currentLevel', currentLevel);
		}
	} else if (isNumber(data)) {
		GameSelectionMode = 'indiv';
		currentLevel = Number(data) % MAXLEVEL;

	} else if (isString(data)) {
		//data is the name of a game
		GameSelectionMode = 'indiv';
		currentGame = data;
		currentLevel = startAtLevel[currentGame];
	}
}
function startGame(data) {

	//das ist noch das alte game!!!
	GlobalSTOP = true;

	if (isGameWithSpeechRecognition()) {
		ROUND_DELAY = 2000;
		Speech.ensureOff();
		MicrophoneHide();
	} else { ROUND_DELAY = 100; }

	// determineGame(data);
	//console.log('Settings',Settings)
	currentGame = Settings.program.gameSequence[Settings.program.currentGameIndex].game;
	currentLevel = Settings.program.currentLevel > MAXLEVEL ? startAtLevel[currentGame] : Settings.program.currentLevel;
	console.log('______ * game', currentGame, 'level', currentLevel, '*')

	if (currentGame == 'gSayPicAuto') { scoringMode = 'autograde'; } else scoringMode = DefaultScoringMode;

	CurrentGameData = { name: currentGame, levels: [] };
	CurrentSessionData.games.push(CurrentGameData);

	//console.log('===> game', currentGame, 'level', currentLevel);

	onkeydown = null;
	onkeypress = null;
	onkeyup = null;

	resetState();

	//console.log(currentGame)
	GFUNC[currentGame].startGame();

	startLevel();
}
function startLevel(level) {

	//if (isdef(level) && currentLevel != level) currentLevel = level; //ONLY HERE NEW LEVEL IS SET!!!
	Speech.setLanguage(currentLanguage);

	CurrentLevelData = { level: currentLevel, items: [] };
	CurrentGameData.levels.push(CurrentLevelData);

	boundary = SAMPLES_PER_LEVEL[currentLevel];
	resetScore();
	GFUNC[currentGame].startLevel(); //settings level dependent params eg., MaxNumTrials...

	startRound(); //startLevel
}
function startRound() {
	setTimeout(() => startRoundReally(), ROUND_DELAY);
}
function startRoundReally() {
	// console.log('from', getFunctionsNameThatCalledThisFunction())
	//console.log('starting ROUND (delay:' + DELAY + ')')
	//showScore();
	// console.assert(!LevelChange, 'levelChange!!!!!!!!!!!!! need reset!')
	clearFleetingMessage();
	showStats();
	LevelChange = false; //needs to be down here because showScore needs that info!



	if (ROUND_OUTPUT) {
		// writeComments('new round:');
		console.log('...' + currentGame.substring(1), 'round:' + ' level:' + currentLevel, 'pics:' + NumPics, 'labels:' + NumLabels,
			'\nkeys:' + currentKeys.length, 'minlen:' + MinWordLength, 'maxlen:' + MaxWordLength, 'trials#:' + MaxNumTrials);
	}
	trialNumber = 0;
	// showScore();
	GFUNC[currentGame].startRound();
	promptStart();

}
function promptStart() {
	//console.log('prompt',uiPaused)
	beforeActivationUI();
	//console.log('prompt',uiPaused)
	GlobalSTOP = false;

	dTable = dLineTableMiddle;
	dTitle = dLineTitleMiddle;
	if (nundef(dTable)) return;
	clearTable();

	let delay = GFUNC[currentGame].prompt();
	setTimeout(activateUi, delay);
}
function promptNextTrial() {
	//console.log('promptNextTrial',uiPaused)
	//console.log('called from:', getFunctionsNameThatCalledThisFunction())
	beforeActivationUI();
	//console.log('promptNextTrial',uiPaused)

	let delay = GFUNC[currentGame].trialPrompt();
	setTimeout(activateUi, delay);
}
function selectWord(info, bestWordIsShortest, except = []) {
	let candidates = info.words.filter(x => x.length >= MinWordLength && x.length <= MaxWordLength);

	let w = bestWordIsShortest ? getShortestWord(candidates, false) : arrLast(candidates);
	//console.log('vorher:***candidates:',candidates,arrLast(candidates),w)
	if (except.includes(w)) {
		let wNew = lastCond(info.words, x => !except.includes(w));
		if (wNew) w = wNew;
	}
	//console.log('selectWord',bestWordIsShortest,'\n...candidates',candidates, except	)
	//console.log(arrLast(candidates),w)

	return w;
}
function showPictures(bestWordIsShortest, onClickPictureHandler, { colors, overlayShade } = {}, keys, labels) {
	Pictures = [];

	if (nundef(keys)) keys = choose(currentKeys, NumPics);
	//keys=['notebook']; //['supervillain']

	let infos = keys.map(x => getRandomSetItem(currentLanguage, x));
	//console.log(infos)
	if (nundef(labels)) {
		labels = [];
		for (const info of infos) {
			labels.push(selectWord(info, bestWordIsShortest, labels));
		}
	}

	let { isText, isOmoji } = getParamsForMaPicStyle('twitterText');
	let bgPic = isdef(colors) ? 'white' : 'random';

	let lines = isdef(colors) ? colors.length : 1;

	//hier weiss ich bereits wieviele lines es sind!
	let ww = window.innerWidth;
	let wh = window.innerHeight;
	let hpercent = 0.60; let wpercent = .6;
	let sz, picsPerLine;
	if (lines > 1) {
		let hpic = wh * hpercent / lines;
		let wpic = ww * wpercent / NumPics;
		sz = Math.min(hpic, wpic);
		picsPerLine = keys.length;
	} else {
		let dims = calcRowsColsX(NumPics);
		let hpic = wh * hpercent / dims.rows;
		let wpic = ww * wpercent / dims.cols;
		sz = Math.min(hpic, wpic);
		picsPerLine = dims.cols;
	}

	//console.log('__________picsPerLine',picsPerLine,lines)
	pictureSize = Math.min(sz, 200);
	let stylesForLabelButton = { rounding: 10, margin: pictureSize / 8 };

	for (let line = 0; line < lines; line++) {
		let shade = isdef(colors) ? colors[line] : undefined;
		for (let i = 0; i < keys.length; i++) {
			let info = infos[i];
			let label = labels[i];
			let ipic = (line * keys.length + i);
			if (ipic % picsPerLine == 0 && ipic > 0) mLinebreak(dTable);
			let id = 'pic' + ipic; // (line * keys.length + i);
			// let d1 = maPicLabelButtonFitText(info, label,
			// 	{ w: pictureSize, h: pictureSize, bgPic: bgPic, shade: shade, overlayColor: '#00000025' }, onClickPictureHandler, dTable, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
			let d1 = maPicLabelButtonFitText(info, label,
				{
					w: pictureSize, h: pictureSize, bgPic: bgPic, shade: shade,
					overlayColor: overlayShade
				}, onClickPictureHandler, dTable, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
			d1.id = id;
			//console.log(info.key, label, info);
			Pictures.push({ shade: shade, key: info.key, info: info, div: d1, id: id, index: i, label: label, isLabelVisible: true });
		}
		// mLinebreak(dTable);
	}

	let totalPics = Pictures.length;
	if (NumLabels == totalPics) return;
	let remlabelPic = choose(Pictures, totalPics - NumLabels);
	for (const p of remlabelPic) { maHideLabel(p.id, p.info); p.isLabelVisible = false; }

}
function setGoal(index) {
	if (nundef(index)) {
		let rnd = NumPics < 2 ? 0 : randomNumber(0, NumPics - 2);
		if (NumPics >= 2 && rnd == lastPosition && coin(70)) rnd = NumPics - 1;
		index = rnd;
	}
	lastPosition = index;
	Goal = Pictures[index];
	//console.log(index, Goal)
	setCurrentInfo(Goal); //sets bestWord, ...

}
function showInstruction(text, cmd, title, isSpoken, spoken) {
	let d = mDiv(title);
	mStyleX(d, { margin: 15 })
	mClass(d, 'flexWrap');

	let msg = cmd + " " + `<b>${text.toUpperCase()}</b>`;
	let d1 = mText(msg, d, { fz: 36, display: 'inline-block' });
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: 38, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});
	dFeedback = dInstruction = d;

	dInstruction.addEventListener('click', () => aniInstruction(cmd + " " + text));
	if (!isSpoken) return;

	Speech.say(isdef(spoken) ? spoken : (cmd + " " + text), .7, 1, .7, true, 'random'); //,()=>{console.log('JUST SAID IT')});

}
function activateUi() {
	Selected = null;
	GFUNC[currentGame].activate();
	activationUI();
}
function evaluate() {
	//console.log('evaluate:',uiPaused)
	if (uiPaused) return;
	hasClickedUI();
	IsAnswerCorrect = GFUNC[currentGame].eval(...arguments);

	trialNumber += 1;
	if (!IsAnswerCorrect && trialNumber < MaxNumTrials) { promptNextTrial(); return; }

	//feedback
	if (IsAnswerCorrect) {
		DELAY = skipAnimations ? 300 : 1500;
		successPictureGoal();
	} else {
		DELAY = skipAnimations ? 300 : 3000;
		showCorrectWord();
		failPictureGoal(false);
	}

	[LevelChange, currentLevel] = scoring(IsAnswerCorrect); //get here only if this is correct or last trial!

	// if (currentGame == 'gSayPicAuto' && LevelChange) {
	// 	console.log('=======>currentLanguage',currentLanguage);
	// 	if (currentLanguage_ == 'E') trainNextLanguage();
	// 	else trainNextGroup();
	// } else 

	//console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',LevelChange, DELAY)
	if (LevelChange != 0) saveProgram();

	if (LevelChange && ProgTimeIsUp) {
		//saveProgram();
		console.log('ENDING AT', currentGame, currentLevel)
		setTimeout(aniGameOver('Great job! Time for a break!'), DELAY);
	} else if (LevelChange < 0) setTimeout(removeBadgeAndRevertLevel, DELAY);
	else if (LevelChange > 0) { setTimeout(showLevelComplete, DELAY); }
	else setTimeout(proceedIfNotStepByStep, DELAY);
}

function failPictureGoal(withComment = true) {

	if (withComment && !skipAnimations) {
		const comments = (currentLanguage == 'E' ? ['too bad'] : ["aber geh'"]);
		Speech.say(chooseRandom(comments), 1, 1, .8, true, 'zira', () => { console.log('FERTIG FAIL!!!!'); });
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		//console.log('selected', Selected, 'x', mBy('dX'))
		let sz = getBounds(Selected.feedbackUI).height;
		mpOver(mBy('dX'), Selected.feedbackUI, sz * (1 / 2), 'red', 'openMojiTextBlack');
		// mpOver(mBy('dX'), Selected.feedbackUI, pictureSize * (1/2), 'red', 'openMojiTextBlack');
	}

}
function successPictureGoal(withComment = true) {
	if (withComment && !skipAnimations) {
		const comments = (currentLanguage == 'E' ? ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'] : ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!']);
		Speech.say(chooseRandom(comments));//'Excellent!!!');
	}
	mpOver(mBy('dCheckMark'), mBy(Goal.id), pictureSize * (4 / 5), 'limegreen', 'segoeBlack');

}

//#region scoring
function scoring(isCorrect) {

	//console.log('isCorrect',isCorrect)

	CurrentGoalData = {
		key: Goal.key, goal: Goal,
		isCorrect: IsAnswerCorrect, reqAnswer: Goal.reqAnswer, answer: Goal.answer, selected: Selected
	};
	CurrentLevelData.items.push(CurrentGoalData);

	numTotalAnswers += 1;
	if (isCorrect) numCorrectAnswers += 1;

	//percent scoringMode:
	percentageCorrect = Math.round(100 * numCorrectAnswers / numTotalAnswers);

	//inc scoringMode:
	if (isCorrect) {
		levelPoints += levelIncrement; if (levelIncrement < maxIncrement) levelIncrement += 1;
	} else {
		levelIncrement = minIncrement; levelPoints += minIncrement;
	}
	//console.log('numTotalAnswers',numTotalAnswers,'boundary',boundary)

	//see if it is time for level change check
	let levelChange = 0;
	let nextLevel = currentLevel;
	if (numTotalAnswers >= boundary) {

		//console.log('scoringMode', scoringMode)

		if (scoringMode == 'inc') {
			if (levelPoints >= levelDonePoints && percentageCorrect >= 50) {
				levelChange = 1; nextLevel += 1;
			}

		} else if (scoringMode == 'percent') {
			if (percentageCorrect >= 80) { levelChange = 1; nextLevel += 1; }
			else if (percentageCorrect < 50) { levelChange = -1; if (nextLevel > 0) nextLevel -= 1; }

		} else if (scoringMode == 'autograde') {
			//console.log('... autograding');
			//saveAnswerStatistic();
			saveStats();
			levelChange = 1;
			nextLevel += 1;

		} else if (scoringMode == 'n') {
			//console.log('correct:', numCorrectAnswers, 'total:', numTotalAnswers)
			if (numCorrectAnswers > numTotalAnswers / 2) { levelChange = 1; nextLevel += 1; }
			else if (numCorrectAnswers < numTotalAnswers / 2) { levelChange = -1; nextLevel = (nextLevel > 0 ? nextLevel - 1 : nextLevel); }

		}
	}
	return [levelChange, nextLevel];


}
function showScore() {
	//dScore.innerHTML = 'score: ' + numCorrectAnswers + '/' + numTotalAnswers + ' (' + percentageCorrect + '%)';
	//let scoreString = 'score: ' + levelPoints + ' (' + percentageCorrect + '%)';
	// let scoreString = 'question: ' + (numTotalAnswers + 1) + ' (' + percentageCorrect + '%)';
	let scoreString = scoringMode == 'n' ? 'question: ' + (numTotalAnswers + 1) + '/' + SAMPLES_PER_LEVEL[currentLevel] :
		scoringMode == 'percent' ? 'score: ' + numCorrectAnswers + '/' + numTotalAnswers + ' (' + percentageCorrect + '%)'
			: scoringMode == 'inc' ? 'score: ' + levelPoints + ' (' + percentageCorrect + '%)'
				: 'question: ' + numTotalAnswers + '/' + boundary;

	if (LevelChange)
		dScore.innerHTML = scoreString;
	else
		setTimeout(() => { dScore.innerHTML = scoreString; }, 300);
}
function resetScore() {
	numCorrectAnswers = 0, numTotalAnswers = 0, percentageCorrect = 100;
	levelPoints = 0, levelIncrement = minIncrement;

}

function proceedIfNotStepByStep(nextLevel) {
	if (!StepByStepMode) { proceed(nextLevel); }
	//else if (isdef(nextLevel) && nextLevel != currentLevel) { currentLevel = nextLevel; }
}
function aniGameOver(msg) {
	soundGoodBye();
	show('freezer2');
	mClass(mBy('freezer2'), 'aniSlowlyAppear');

	//old code
	//mClass(document.body, 'aniSlowlyDisappear');
	//show(dLevelComplete);
	//dLevelComplete.innerHTML = msg;
}
function proceed(nextLevel) {
	//console.log('proceedAfterLevelChange', currentLevel, MAXLEVEL)
	if (nundef(nextLevel)) nextLevel = currentLevel;

	updateGameSequence(nextLevel);
	if (ProgTimeIsUp && LevelChange) {
		console.log('PROGRAM HAS TIMED OUT!!!!!!')
		setTimeout(aniGameOver('Great job! Time for a break!'), DELAY);
		return;
	}
	if (nextLevel > MAXLEVEL) {
		if (Settings.program.currentGameIndex >= Settings.program.gameSequence.length) {
			aniGameOver('Congratulations! You are done!');
		} else {
			startGame();
		}
	} else if (LevelChange) startLevel(nextLevel);
	else startRound();

	// updateGameSequence(nextLevel);
	// if (nextLevel > MAXLEVEL) {
	// 	if (Settings.program.currentGameIndex >= Settings.program.gameSequence.length) {
	// 		aniGameOver('Congratulations! You are done!');
	// 	} else {
	// 		startGame();
	// 	}
	// } else startRound();

}

//#region show Level Complete and Revert Level
function removeBadgeAndRevertLevel() {
	removeBadges(dLeiste, currentLevel);
	setBackgroundColor();
	proceedIfNotStepByStep();
}
function showLevelComplete() {
	if (!skipAnimations) {
		//if (!skipBadgeAnimation) soundLevelComplete();
		soundLevelComplete();
		mClass(mBy('dLevelComplete'), 'aniFadeInOut');
		show('dLevelComplete');
		setTimeout(levelStep10, 1500);
	} else {
		addBadge(dLeiste, currentLevel, revertToBadgeLevel);
		setBackgroundColor();
		proceedIfNotStepByStep();
	}

}
function revertToBadgeLevel(ev) {
	let id = evToClosestId(ev);
	let i = stringAfter(id, '_');
	i = Number(i);
	currentLevel = Settings.program.currentLevel = i;
	saveProgram();
	//setBackgroundColor();
	// removeBadgeAndRevertLevel() geht nicht!!!!!!!!!!!!!!!!!!!!
	removeBadges(dLeiste, currentLevel);
	setBackgroundColor();
	startLevel(i);
}
function levelStep10() {
	mClass(document.body, 'aniFadeOutIn');
	hide('dLevelComplete');
	setTimeout(levelStep11, 500);
}
function levelStep11() {
	clearTable();
	setTimeout(levelStep12, 500);

}
function levelStep12() {
	addBadge(dLeiste, currentLevel, revertToBadgeLevel);
	hide('dLevelComplete');
	clearTable();

	setTimeout(playRubberBandSound, 500);

	setBackgroundColor();
	showLevel();
	//showScore();

	setTimeout(levelStep13, 1000);
}
function levelStep13() {
	mRemoveClass(document.body, 'aniFadeOutIn');
	proceedIfNotStepByStep();
	//proceedAfterLevelChange();
}
//#endregion

//#region helpers
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
function aniInstruction(text) {
	Speech.say(text, .7, 1, .7, false, 'random', () => { console.log('HA!') });
	mClass(dInstruction, 'onPulse');
	setTimeout(() => mRemoveClass(dInstruction, 'onPulse'), 500);

}
function animate(elem, aniclass, timeoutms) {
	mClass(elem, aniclass);
	setTimeout(() => mRemoveClass(elem, aniclass), timeoutms);
}

function clearTable() {
	clearElement(dLineTableMiddle); clearElement(dLineTitleMiddle); hide(mBy('dCheckMark')); hide(mBy('dX'));
}
function isGameWithSpeechRecognition() { return ['gSayPic', 'gSayPicAuto'].includes(currentGame); }
function resetState() {
	uiPaused = 0;
	lastPosition = 0;
	DELAY = 1000;

	badges = [];

	SAMPLES_PER_LEVEL = new Array(20).fill(Settings.program.picsPerLevel);// [1, 1, 2, 2, 80, 100];

	resetScore();

	boundary = SAMPLES_PER_LEVEL[currentLevel];
	setBackgroundColor();
	showBadges(dLeiste, currentLevel, revertToBadgeLevel);
	showLevel();
	//showScore();

}
function setBackgroundColor() {
	let color = levelColors[currentLevel];
	document.body.style.backgroundColor = color;

}
function setCurrentInfo(item) {
	currentInfo = item.info;
	matchingWords = currentInfo.words;
	validSounds = currentInfo.valid;
	bestWord = Goal.label;
	hintWord = '_'.repeat(bestWord.length);

}
function shortHintPicRemove() {
	mRemoveClass(mBy(Goal.id), 'onPulse1');
}
function shortHintPic() {
	mClass(mBy(Goal.id), 'onPulse1');
	setTimeout(() => shortHintPicRemove(), 800);
}
function showCorrectWord(sayit = true) {
	let anim = skipAnimations ? 'onPulse1' : 'onPulse';
	let div = mBy(Goal.id);
	mClass(div, anim);


	if (!sayit || skipAnimations) return;

	let correctionPhrase = isdef(Goal.correctionPhrase) ? Goal.correctionPhrase : bestWord;
	Speech.say(correctionPhrase, .4, 1.2, 1, true, 'david');
}
function showLevel() { dLevel.innerHTML = 'level: ' + currentLevel; }
function showStats() { showLevel(); showScore(); }
function writeComments(pre) {
	console.log('NEEEEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIIIIIN', getFunctionsNameThatCalledThisFunction())
	if (ROUND_OUTPUT) {
		console.log('...' + currentGame.substring(1), pre + ' currentLevel:' + currentLevel, 'pics:' + NumPics,
			'labels:' + NumLabels,
			'\nkeys:' + currentKeys.length, 'minlen:' + MinWordLength, 'maxlen:' + MaxWordLength, 'trials#:' + MaxNumTrials);
	}

}
//#endregion


function getKeySetSimple(cats, lang,
	{ minlen, maxlen, wShort = false, wLast = false, wExact = false, sorter = null }) {
	let keys = setCategories(cats);
	if (isdef(minlen && isdef(maxlen))) {
		keys = keys.filter(k => {
			let exact = CorrectWordsExact[lang][k];
			if (wExact && nundef(exact)) return false;
			let ws = wExact ? [exact.req] : wLast ? [lastOfLanguage(k, lang)] : wordsOfLanguage(k, lang);
			if (wShort) ws = [getShortestWord(ws, false)];
			//console.log(k,ws)
			for (const w of ws) { if (w.length >= minlen && w.length <= maxlen) return true; }
			return false;
		});
	}
	//console.log('________________',keys);//ok

	if (isdef(sorter)) sortByFunc(keys, sorter); //keys.sort((a,b)=>fGetter(a)<fGetter(b));
	return keys;
}
function setKeysNew({ cats, lang, wShortest = false, wLast = false, wBest = false, wExact = false, sorter } = {}) {
	opt = arguments[0];
	if (nundef(opt)) opt = {};
	opt.minlen = MinWordLength;
	opt.maxlen = MaxWordLength;
	if (nundef(cats)) cats = currentCategories;
	if (nundef(lang)) lang = currentLanguage;
	currentKeys = getKeySetSimple(cats, lang, opt);
	//console.log('set keys:' + currentKeys.length);
}
function setKeys(cats, bestOnly, sortAccessor, correctOnly, reqOnly) {
	//console.log(currentLanguage)
	currentKeys = getKeySetX(isdef(cats) ? cats : currentCategories, currentLanguage, MinWordLength, MaxWordLength,
		bestOnly, sortAccessor, correctOnly, reqOnly);
	if (isdef(sortByFunc)) { sortBy(currentKeys, sortAccessor); }
}



