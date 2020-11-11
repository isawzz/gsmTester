var pictureSize;
function startGame(game) {


	//das ist noch das alte game!!!
	isINTERRUPT = true;
	if (currentGame == 'gSayPic' && isRunning) {
		console.log('=>recog running: need to interrupt!', isRunning);
		recognition.stop();
		hide(mBy('dRecord'));
	}

	//console.log('currentGame',currentGame)
	// addGameToSessionHistoryAndRenewGameHistory(currentGame);

	if (nundef(game)) game = currentGame;
	if (game == 'sequence') game = gameSequence[0];
	currentGame = game;

	//set scoringMode
	if (currentGame == 'gSayPicAuto') {		scoringMode = 'autograde';	} else scoringMode = 'inc';

	CurrentGameData = { name: currentGame, levels: [] }; CurrentSessionData.games.push(CurrentGameData);
	//console.log('session:',CurrentSessionData)

	//console.log('currentGame',currentGame)

	onkeydown = null;
	onkeypress = null;
	onkeyup = null;

	currentLevel = startAtLevel[currentGame];

	resetState();

	GFUNC[currentGame].startGame();

	startLevel();
}
function startLevel() {
	CurrentLevelData = { level: currentLevel, items: [] }; CurrentGameData.levels.push(CurrentLevelData);
	GFUNC[currentGame].startLevel();
	showScore();
	LevelChange = false;
	startRound();
}
function startRound() {
	console.assert(!LevelChange, 'levelChange!!!!!!!!!!!!! need reset!')
	writeComments('new round:');
	clearFleetingMessage();
	trialNumber = 0;
	showScore();
	GFUNC[currentGame].startRound();
	promptStart();

}
function promptStart() {
	beforeActivationUI();
	isINTERRUPT = false;

	dTable = dLineTableMiddle;
	dTitle = dLineTitleMiddle;
	if (nundef(dTable)) return;
	clearTable();

	let delay = GFUNC[currentGame].prompt();
	setTimeout(activateUi, delay);
}
function promptNextTrial() {
	beforeActivationUI();

	let delay = GFUNC[currentGame].trialPrompt();
	setTimeout(activateUi, delay);
}

function selectWord(info, bestWordIsShortest, except = []) {
	let candidates = info.words.filter(x => x.length >= MinWordLength && x.length <= MaxWordLength);


	let w = bestWordIsShortest ? getShortestWord(candidates, false) : last(candidates);
	//console.log('vorher:***candidates:',candidates,last(candidates),w)
	if (except.includes(w)) {
		let wNew = lastCond(info.words, x => !except.includes(w));
		if (wNew) w = wNew;
	}
	//console.log('selectWord',bestWordIsShortest,'\n...candidates',candidates, except	)
	//console.log(last(candidates),w)

	return w;
}
function showPictures(bestWordIsShortest = false, onClickPictureHandler, colors, keys) {
	Pictures = [];
	let labels = [];
	if (nundef(keys)) keys = choose(currentKeys, NumPics);


	//keys=['ox']; //["one o'clock"]; //['oil drum'];//,'door']

	let { isText, isOmoji } = getParamsForMaPicStyle('twitterText');
	let bgPic = isdef(colors) ? 'white' : 'random';

	let lines = isdef(colors) ? colors.length : 1;

	//hier weiss ich bereits wieviele lines es sind!
	let ww = window.innerWidth;
	let wh = window.innerHeight;
	let hpercent = 0.60; let wpercent = .6;
	let w, h;
	if (lines > 1) {
		let hpic = wh * hpercent / lines;
		let wpic = ww * wpercent / NumPics;
		w = h = Math.min(hpic, wpic);
	} else {
		let dims = calcRowsColsX(NumPics);
		let hpic = wh * hpercent / dims.rows;
		let wpic = ww * wpercent / dims.cols;
		w = h = Math.min(hpic, wpic);
	}

	pictureSize = Math.min(w, 200);
	let stylesForLabelButton = { rounding: 10, margin: pictureSize / 8 };

	for (let line = 0; line < lines; line++) {
		let shade = isdef(colors) ? colors[line] : undefined;
		for (let i = 0; i < keys.length; i++) {
			let info = getRandomSetItem(currentLanguage, keys[i]);
			let id = 'pic' + (line * keys.length + i);
			let label = selectWord(info, bestWordIsShortest, labels);
			console.assert(isdef(label) && !isEmpty(label), 'no label for key ' + keys[i])
			labels.push(label);
			let d1 = maPicLabelButtonFitText(info, label,
				{ w: pictureSize, h: pictureSize, bgPic: bgPic, shade: shade, intensity: '#00000025' }, onClickPictureHandler, dTable, stylesForLabelButton, 'frameOnHover', isText, isOmoji);
			d1.id = id;
			console.log(info.key,label,info)
			Pictures.push({ shade: shade, key: info.key, info: info, div: d1, id: id, index: i, label: label, isLabelVisible: true });
		}
		mLinebreak(dTable);
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

	say(isdef(spoken) ? spoken : (cmd + " " + text), .7, 1, .7, true, 'random'); //,()=>{console.log('JUST SAID IT')});

}
function updateLevel() {
	//console.log('numTotalAnswers',numTotalAnswers,'boundary',boundary)
	if (numTotalAnswers >= boundary) { [LevelChange, currentLevel] = scoreDependentLevelChange(currentLevel); }
	if (LevelChange) {
		boundary = SAMPLES_PER_LEVEL[currentLevel];
		resetScore();
		if (currentLevel <= MAXLEVEL) GFUNC[currentGame].prepLevel();
	}
}

function activateUi() {
	Selected = null;
	GFUNC[currentGame].activate();
	activationUI();
}
function evaluate() {
	if (uiPaused) return;
	hasClickedUI();
	AnswerCorrectness = GFUNC[currentGame].eval(...arguments);

	switch (AnswerCorrectness) {
		case STATES.CORRECT:
			setScore(true);
			DELAY = skipAnimations ? 300 : 1500;
			updateLevel();
			successPictureGoal();
			if (LevelChange > 0) setTimeout(showLevelComplete, DELAY);
			else { setTimeout(startRound, DELAY); }
			break;
		case STATES.INCORRECT:
			trialNumber += 1;
			if (trialNumber < MaxNumTrials) {
				promptNextTrial();
			} else {
				setScore(false);
				DELAY = skipAnimations ? 300 : 3000;
				showCorrectWord();
				failPictureGoal(false);
				updateLevel();
				if (LevelChange < 0) setTimeout(removeBadgeAndRevertLevel, DELAY);
				else if (LevelChange > 0) { setTimeout(showLevelComplete, DELAY); }
				else { setTimeout(startRound, DELAY); }
			}
			break;
	}

}
function failPictureGoal(withComment = true) {

	if (withComment && !skipAnimations) {
		const comments = (currentLanguage == 'E' ? ['too bad'] : ["aber geh'"]);
		say(chooseRandom(comments), 1, 1, .8, true, 'zira', () => { console.log('FERTIG FAIL!!!!'); });
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		//console.log('selected', Selected, 'x', mBy('dX'))
		let sz = getBounds(Selected.feedbackUI).height;
		mpOver(mBy('dX'), Selected.feedbackUI, sz * (1/2), 'red', 'openMojiTextBlack');
		// mpOver(mBy('dX'), Selected.feedbackUI, pictureSize * (1/2), 'red', 'openMojiTextBlack');
	}

}
function successPictureGoal(withComment = true) {
	if (withComment && !skipAnimations) {
		const comments = (currentLanguage == 'E' ? ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'] : ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!']);
		say(chooseRandom(comments));//'Excellent!!!');
	}
	mpOver(mBy('dCheckMark'), mBy(Goal.id), pictureSize * (4 / 5), 'limegreen', 'segoeBlack');

}

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
	say(text, .7, 1, .7, false, 'random', () => { console.log('HA!') });
	mClass(dInstruction, 'onPulse');
	setTimeout(() => mRemoveClass(dInstruction, 'onPulse'), 500);

}
function clearTable() {
	clearElement(dLineTableMiddle); clearElement(dLineTitleMiddle); hide(mBy('dCheckMark')); hide(mBy('dX'));
}
function resetState() {
	uiPaused = 0;
	lastPosition = 0;
	DELAY = 1000;

	badges = [];
	
	SAMPLES_PER_LEVEL = new Array(20).fill(PICS_PER_LEVEL);// [1, 1, 2, 2, 80, 100];

	resetScore();

	boundary = SAMPLES_PER_LEVEL[currentLevel];
	setBackgroundColor();
	showBadges(dLeiste, currentLevel, levelColors);
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
	say(correctionPhrase, .4, 1.2, 1, true, 'david');
}

function showLevel() { dLevel.innerHTML = 'level: ' + currentLevel; }
function writeComments(pre) {
	// console.log('...' + currentGame.substring(1), pre + ' currentLevel:' + currentLevel, 'pics:' + NumPics,
	// 	'labels:' + NumLabels,
	// 	'\nkeys:' + currentKeys.length, 'minlen:' + MinWordLength, 'maxlen:' + MaxWordLength, 'trials#:' + MaxNumTrials);

}
//#endregion

//#region score
function scoreDependentLevelChange(level) {
	let isChange = 0;
	if (scoringMode == 'inc') {
		if (levelPoints >= levelDonePoints && percentageCorrect >= 50) { isChange = 1; level += 1; }
	} else if (scoringMode == 'percent') {
		if (percentageCorrect >= 90) { isChange = 1; level += 1; }
		else if (percentageCorrect < 70 && level > 0) { isChange = -1; level -= 1; }
		else if (percentageCorrect < 70) { isChange = -1; }
	} else if (scoringMode == 'autograde') {

		console.log('_______ autograding')
		saveAnswerStatistic();

		isChange = 1;
		level += 1;
	}
	return [isChange, level];
}

function resetScore() {
	numCorrectAnswers = 0, numTotalAnswers = 0, percentageCorrect = 100;
	levelPoints = 0, levelIncrement = minIncrement;

}
function setScore(isCorrect) {
	CurrentGoalData = { key: Goal.key, isCorrect: AnswerCorrectness, reqAnswer: Goal.reqAnswer, answer: Goal.answer, selected: Selected };
	CurrentLevelData.items.push(CurrentGoalData);

	if (isCorrect) {
		numCorrectAnswers += 1;
		levelPoints += levelIncrement;
		if (levelIncrement < maxIncrement) levelIncrement += 1;
	} else {
		levelIncrement = minIncrement;
		levelPoints += minIncrement;
	}
	numTotalAnswers += 1;
	percentageCorrect = Math.round(100 * numCorrectAnswers / numTotalAnswers);

	//showScore();
}
function showScore() {
	//dScore.innerHTML = 'score: ' + numCorrectAnswers + '/' + numTotalAnswers + ' (' + percentageCorrect + '%)';

	if (LevelChange)
		dScore.innerHTML = 'score: ' + levelPoints + ' (' + percentageCorrect + '%)';
	else
		setTimeout(() => { dScore.innerHTML = 'score: ' + levelPoints + ' (' + percentageCorrect + '%)'; }, 300);
}

//#endregion

//#region show Level Complete and Revert Level
function removeBadgeAndRevertLevel() {
	removeBadges(dLeiste, currentLevel);
	setBackgroundColor();
	showLevel();
	//showScore();
	startLevel();
}

function showLevelComplete() {
	if (!skipAnimations) {
		playAudio();
		mClass(mBy('dLevelComplete'), 'aniFadeInOut');
		show('dLevelComplete');
		setTimeout(levelStep10, 1500);
	} else {
		addBadge(dLeiste, currentLevel);
		setBackgroundColor();
		showLevel();
		//showScore();
		
		proceedAfterLevelChange();
	}

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
	addBadge(dLeiste, currentLevel);
	hide('dLevelComplete');
	clearTable();

	setTimeout(playRubberBandSound, 500);

	setBackgroundColor();
	showLevel();
	//showScore();
	

	setTimeout(levelStep13, 2000);
}
function levelStep13() {
	mRemoveClass(document.body, 'aniFadeOutIn');
	proceedAfterLevelChange();
}

function proceedAfterLevelChange() {
	//console.log('proceedAfterLevelChange', currentLevel, MAXLEVEL)
	if (currentLevel > MAXLEVEL) {
		let iGame = gameSequence.indexOf(currentGame) + 1;
		if (iGame == gameSequence.length) {
			playAudioEnd();
			mClass(document.body, 'aniSlowlyDisappear');
			show(dLevelComplete);
			dLevelComplete.innerHTML = 'CONGRATULATIONS! You are done!';

		} else {
			let nextGame = gameSequence[iGame];
			startGame(nextGame);
		}
	} else startLevel();

}
//#endregion






