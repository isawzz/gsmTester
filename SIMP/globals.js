const IS_TESTING = false; // false | true
USE_LOCAL_STORAGE = true; // false | true
const immediateStart = true;  // false | true
var skipLevelAnimation = false; // false | true
var currentGame = 'gTouchPic';
var currentUser = 'Gunter';
var currentLanguage = 'E';
var level = 0;
var WORD_GROUPS = ['nosymbols'];
var MAX_WORD_LENGTH = [3, 4, 5, 7, 10, 111]; //extra per game
var SHOW_LABEL_UP_TO_LEVEL = 1;
var PICS_PER_LEVEL = IS_TESTING ? 1 : 5;
var MAXLEVEL = 6;
var SAMPLES_PER_LEVEL = new Array(20).fill(PICS_PER_LEVEL);// [1, 1, 2, 2, 80, 100];
var DELAY = 1000;

const STATES = {
	STARTING: -1, GAME_INITIALIZED: -2, ROUND_INITIALIZED: -3, NONE: 0,
	BOUNDARY: 1, GROUPCHANGE: 2, LEVELCHANGE: 3, GAMEOVER: 4, CORRECT: 5, INCORRECT: 6, NEXTTRIAL: 7
};
var GameState;

//to be set by each game in init:
var NumPics;
var MaxNumTrials;

//vars for round to round:
var Pictures = [];
var Goal, Selected;

var numCorrectAnswers = 0, numTotalAnswers = 0, percentageCorrect = 100;
let badges = [];

var iGROUP = -1;
var lastPosition = 0;
var trialNumber;
var keySet;
var boundary;

//ui state flags
const uiHaltedMask = 1 << 0; //eg. when entering settings
const beforeActivationMask = 1 << 1;
const hasClickedMask = 1 << 2;
var uiPausedStack = [];
var uiPaused = 0;

const levelColors = [LIGHTGREEN, LIGHTBLUE, YELLOW, 'orange', RED,
	GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue',
	'deeppink', TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE,
	// '#911eb4', '#42d4f4', '#f032e6',	'#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#aaffc3', 
	'#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'deeppink',
	'palegreen', '#e6194B'];
//['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000'];
let levelKeys = ['island', 'justice star', 'materials science', 'mayan pyramid', 'medieval gate',
	'great pyramid', 'meeple', 'smart', 'stone tower', 'trophy cup', 'viking helmet',
	'flower star', 'island', 'justice star', 'materials science', 'mayan pyramid',];

//sidebar
var dLeiste;

//table
var dLineTopOuter, dLineTop, dLineTopLeft, dLineTopRight, dLineTopMiddle;
var dLineTitleOuter, dLineTitle, dLineTitleLeft, dLineTitleRight, dLineTitleMiddle;
var dLineTableOuter, dLineTable, dLineTableLeft, dLineTableRight, dLineTableMiddle;
var dLineBottomOuter, dLineBottom, dLineBottomLeft, dLineBottomRight, dLineBottomMiddle;
var dHint, dFeedback, dInstruction, dScore, dLevel;
var inputBox;
var defaultFocusElement;
var dTable, dTitle;

//settings
var dSettings = mBy('dSettings');

//speaker
var synth, inputForm, inputTxt, voiceSelect, pitch, pitchValue, rate, rateValue, voices, utterance;

//recog: see recog.js

//feedback
var score, hintWord, bestWord, answerCorrect, currentInfo;

//testing
var timit;




