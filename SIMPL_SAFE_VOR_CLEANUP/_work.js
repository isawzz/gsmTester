function updateLevel() {
	//console.log('numTotalAnswers',numTotalAnswers,'boundary',boundary)
	if (numTotalAnswers >= boundary) {
		//console.log('boundary reached!');
		if (percentageCorrect >= 90) {
			currentLevel+=1;LevelChange=true;
			// if (iGROUP < currentCategories.length - 1) {
			// 	iGROUP += 1;
			// 	setKeys();
			// 	// GameState = STATES.GROUPCHANGE;
			// } else if (currentLevel < MAXLEVEL) {
			// 	currentLevel += 1;
			// 	iGROUP = 0;
			// 	// GameState = STATES.LEVELCHANGE;
			// 	LevelChange=true;
			// }
		} else if (percentageCorrect < 70 && currentLevel > 0) {
			currentLevel -= 1;
			// GameState = STATES.LEVELCHANGE;
			LevelChange=true;
		} else if (percentageCorrect < 70){
			LevelChange = true;
		}
	}
	// if (GameState == STATES.GROUPCHANGE) {
	// 	setKeys();
	// } else 
	if (LevelChange){ //GameState == STATES.LEVELCHANGE) {
		boundary = SAMPLES_PER_LEVEL[currentLevel] * (1 + iGROUP);
		resetScore();
		//console.log('currentLevel',currentLevel)
		//GFUNC[currentGame].prepLevel();
		//console.log(currentGame,currentLevel);
		if (currentLevel <= MAXLEVEL) GFUNC[currentGame].prepLevel();
	}
	//console.log('level is now',currentLevel)
}























