var c = document.getElementById("story-canvas");
    
var ctx = c.getContext("2d");
var cookieExpireDate = 100*365;

//var speechbubble = document.getElementById("speech-text");

var urlAr = [];
var textAr = [];

var openClose = ['opening-distracted','opening','closing','closing-tilt']

var sceneMaxFrameDict = {
	"opening":37,
	"opening-distracted":60,
	"smiling":18,
	"question-mark":22,
	"happy-notes":59,
	"happy-flower":40,
	"shock-and-embarrased":60,
	"closing":29,
	"love":36,
	"idle":34,
	"nod":34,
	"thinking":32,
	"happy-flash":27,
	"closing-tilt":34,
	"idea":19,
	"notice":23,

}

var totalStrLengthLimit = 150;
var maxWidth = 150;
var remainder = maxWidth;
var maxLinePixelLength = 360;
var letterWidth = ctx.measureText('W').width;  // gets the length of a single letter
var maxWidthChar = Math.floor(maxWidth/letterWidth);

var mainTxt = "";
var storyBackground = 0;
var sceneNum = 1;
var maxNumOfScene = 1;
var maxLimitNumScene = 15;

var currentSpeaker = 'none';

var storyMainSelect1 = 0;
var storyMainSelectId1 = -1;
var storyMainSelectName1 = "";
var storyMainSelectIdolized1 = 0;

var storyMainSelect2 = 0;
var storyMainSelectId2 = -1;
var storyMainSelectName2 = "";
var storyMainSelectIdolized2 = 0;

var storyMainSelect3 = 0;
var storyMainSelectId3 = -1;
var storyMainSelectName3 = "";
var storyMainSelectIdolized3 = 0;


// [[1,[img1,img2]],[2,[img1,img2,img3]],[3,[]], etc ]
var subImageAr = [];
var tempSubAr = [];


var intervalDivisor = 0.33333;
var intervalForGIF = 0;

var gifWidth = 600;
var gifHeight = 360;


$(window).on('load',function(){
        $('#whatIsThisGIFGenModal').modal('show');
        document.getElementById('sceneNum_box').innerHTML = "Frame 1";
        
    });

function updateReaction(){
	var path = './frameChoice/template/interface/'+ $("#reactionSelect :selected").val() +'/0.png';
	document.getElementById('homeScreenStory').src = path;
	document.getElementById('reactionFrameNumDiv').innerHTML = getCurrSceneFrame($("#reactionSelect :selected").val());
	document.getElementById('reactionGIFImg').src = './frameChoice/template/gif/'+ $("#reactionSelect :selected").val() +'/0.gif';


	// Disable if opening / closing, else we just show
	if(openClose.includes($("#reactionSelect :selected").val())){
		$('#story-textfield').prop('disabled',true);
		document.getElementById('edit_text_box').innerHTML = "";
		document.getElementById("story-textfield").value  = "";
	} else {
		$('#story-textfield').prop('disabled',false);
	}


}

function updateAllFrameCounter(){
	var skipFrameCount = parseInt($("#frameSkipSelector :selected").val())+1;
	var totalFrames = allFrameCounter(skipFrameCount);
	document.getElementById('frameRecordDiv').innerHTML = totalFrames;
}

function allFrameCounter(divisor=1){
	// Count number of frames in current animation

	var frameCount = 0;
	for(var sceneNum=1; sceneNum <= maxNumOfScene; sceneNum++)
	{

	    //maxLength = sceneMaxFrame[sceneNum];
	    var sceneReaction = searchCertainCookie("reaction",sceneNum);
	    var sceneSpeech = searchCertainCookie("speech",sceneNum);
	    if(!sceneReaction){
	    	break;
	    }

	    var maxLength = sceneMaxFrameDict[sceneReaction];
	    //alert(i+" "+sceneReaction);
		frameCount += maxLength;
	}
	return Math.ceil(frameCount/divisor);
}

function getCurrSceneFrame(sceneReaction){
	var sceneSpeech = searchCertainCookie("speech",sceneNum);
	return sceneMaxFrameDict[sceneReaction];
}


function determineCutOffLength(strInput){
	for(var i =0; i < strInput.length; i++){
		var resLen = ctx.measureText(strInput.substring(0,i)).width;
		if(resLen >= maxLinePixelLength){
			return i-1;
		}
	
	}

	return strInput.length;
}

function selectSmoothness(){
	if(document.getElementById('smoothnessLevelShift').value == 'max'){
		$('#gifIntervalSelect').val('0.05').change();
		$('#frameSkipSelector').val('0').change();	
	} else {
		$('#gifIntervalSelect').val('0.25').change();
		$('#frameSkipSelector').val('3').change();	
	}
	updateAllFrameCounter();
	
	
}


function checkRollingTextRequirements()
{
	if(document.getElementById('radio-rollingText-switch-yes').checked){
		// chose rolling text
		if(subImageAr.length == 0)
		{
			// User is continuing a project

			alert("We noticed you are continuing a project, but haven't saved any frames. \n\n In order to enable rolling text, please resave every single frame and try again");
			document.getElementById('radio-rollingText-switch-no').checked = true;
			return;
		} else {
			// Requirements were properly met
			$("#smoothnessTextSelect").selectpicker('show');
			document.getElementById('smoothnessLabelHide').style.display = "block";

		}
	} else {
		// chose no rolling text
		$("#smoothnessTextSelect").selectpicker('hide');
		document.getElementById('smoothnessLabelHide').style.display = "none";
	}

	return;
}

function changeStoryGIFResolution(){
	//var selectedValue = document.getElementById('storyResolutionSelect').value;
	var selectedValue = 2;

	if(selectedValue == 1){
		gifWidth = 480; 
		gifHeight = 320;
	} else if(selectedValue == 2){
		gifWidth = 600; 
		gifHeight = 400;
	} else if(selectedValue == 3){
		gifWidth = 870; 
		gifHeight = 520;
	} else if(selectedValue == 4){
		gifWidth = 960; 
		gifHeight = 640;
	} else {
		alert('Error while trying to determine resolution');
	}
}


function multiSortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}

function addToSubImageArray(tempSubAr)
{
	// search if tempArray already exists
	for(var i = 1; i - 1< subImageAr.length; i++)
	{
		if(tempSubAr[0] == subImageAr[i-1][0])
		{
			// This means the subarray existed before and need to replace it
			subImageAr[i-1] = tempSubAr;
			return;
		}
	}

	// This means subarray does not exist and we can just push

	subImageAr.push(tempSubAr);
}

function deleteRow(arr, row) {
   arr = arr.slice(0); // make copy
   arr.splice(row - 1, 1);
   return arr;
}


function removeToSubImageArray(chosenIndex)
{
	// search if tempArray already exists
	for(var i = 1; i - 1< subImageAr.length; i++)
	{
		if(chosenIndex == subImageAr[i-1][0])
		{
			// This means the subarray existed and we need to delete it
			subImageAr = deleteRow(subImageAr, i);

			return;
		}
	}

}


	

function pushSubImageToURLAR(chosenSceneNumber)
{
	//alert(chosenSceneNumber);
	for(var i=0; i < subImageAr.length; i++)
	{
		//alert(i);
		if(chosenSceneNumber == parseInt(subImageAr[i][0]))
		{
			// if we found the array, we will then push its subimages
			for(var j=1; j < subImageAr[i].length;j++)
			{
				urlAr.push(subImageAr[i][j]);
				
			}
			//alert('Pushing: '.concat(chosenSceneNumber));
			//alert('returning equal '.concat('chosenScene ',chosenSceneNumber, '  subAR: ', subImageAr[i][0]));
			return 0;

		} 
	}
	return -1;
	//alert('return');
}

function changeSmoothnessLevel()
{

	var num = parseInt(document.getElementById('smoothnessTextSelect').value);

	if(num == 2)
	{
		intervalDivisor = 0.5;
	} else if(num == 3){
		intervalDivisor = 0.333333;
	} else if(num == 4){
		intervalDivisor = 0.25;
	} else if(num == 5){
		intervalDivisor = 0.2;
	} else {
		alert('There was an error when changing smoothness level. This should not happen.');
	}
}



function cacluateLengthOfAllFrames(chosenInterval)
{
	// Calculate total amount of time for speech
	var overallTimeForSpeech = chosenInterval*intervalDivisor;

	// Caclulate interval rate of entire GIF 
	var overallInterval = overallTimeForSpeech*intervalDivisor;
; 


	// calculate number of frames needed
	return (chosenInterval/overallInterval);
}

function cacluateNumOfFramesForMain(chosenInterval)
{
	// Calculate total amount of time for speech
	var overallTimeForSpeech = chosenInterval*intervalDivisor
;

	// Caclulate interval rate of entire GIF 
	var overallInterval = overallTimeForSpeech*intervalDivisor
; 

	// Calculate total time for main idle frames
	var timeForMain = chosenInterval - overallTimeForSpeech;

	// calculate number of frames needed
	return (timeForMain/overallInterval);
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}


function chosenFPStoRealFPS(chosenInterval)
{
	// Calculate total amount of time for speech
	var overallTimeForSpeech = chosenInterval*intervalDivisor
;

	// Caclulate interval rate of entire GIF 
	var overallInterval = overallTimeForSpeech*intervalDivisor
; 

	return overallInterval;
}

function saveSubTextImages()
{
	// Function to create sub text images
	var entireText = document.getElementById('edit_text_box').innerHTML;

	tempSubAr = [];

	// If we encounter no text, then we skip making subimages
	if(entireText == '' || entireText.length < 4)
	{
		return;	
	} 

	var numSubImages = 3 				// number of sub text images
	var numToDivide = numSubImages + 1; // amount of frames for text

	var subStrLength = entireText.length/numToDivide;

	var lengthCounter = subStrLength;

	
	// Push the scene number to the temp array
	tempSubAr.push(parseInt(sceneNum));

	for(var i=1; i - 1 < numSubImages; i++)
	{
		
		document.getElementById('edit_text_box').innerHTML = entireText.substring(0,lengthCounter);
		//alert(i.toString().concat(entireText.substring(0,lengthCounter)));
		lengthCounter = lengthCounter + subStrLength; // Increase length of substring

		printStoryCanvas(); // only changing text, so we don't have to wait for images to load
		uploadSubImageURL(i); // save subImage

	}

	// push temp array to main subImage array
	addToSubImageArray(tempSubAr);

	// revert back to original text
	document.getElementById('edit_text_box').innerHTML = entireText;
	tempSubAr = [];
}



function getCertainCookieIndex(certainCookie)
{
	// To search for "|"th index of a certain cookie value

	if(certainCookie == "alreadySaved"){
		return 0;



	}else if(certainCookie == "speech"){
		return 1;
	}else if(certainCookie == "reaction"){
		return 2;
	}

	alert('Certain cookie index not found, this should not happen: '.concat(certainCookie));
	return -1;
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function searchCertainCookie(certainCookie,currSceneNum=sceneNum)
{
	// Searches for a certain value of a cookie (automatically determines what frame you are at)
	var cookieStr = getCookie("sceneMaker_frame-".concat(currSceneNum));


	if(certainCookie == "alreadySaved" && (cookieStr == "" || cookieStr == null))
	{
		// If this is a frame we are transfering and not yet saved
		return "0";
	}

	if(cookieStr == "" ||cookieStr == " " || cookieStr == null)
	{
		// Cookie was not saved yet
		return null;
	}
	if(cookieStr){
		//alert('CookieStr: ', cookieStr);
		var cookieIndex = getCertainCookieIndex(certainCookie);

		var dashCounter = 0;
		for(var i = 0; i < cookieStr.length; i++)
		{
			// Iterate until we encounter a dash
			if(dashCounter == cookieIndex){
				// Extract the string if we arrived at nth dash

				var tempStr = "";
			
				while(true)
				{
					// Iterate through the entire string that we are going to extract
					if(cookieStr.charAt(i) == '|' || i >= cookieStr.length){
						// Return if we arrived at end of extracted string or is extracting dialouge text
						return tempStr;
					} 

					// Append character to string to extract
					tempStr = tempStr.concat(cookieStr.charAt(i));
					i = i+1;
				}
				return tempStr;

			} else if(cookieStr.charAt(i) == "|"){
				dashCounter = dashCounter + 1;
			}
			
		}

		alert('Cookie not found, this should not happen (searchCertainCookie): '.concat(certainCookie));
	}
	return null;
}

function storeMaxNumOfSceneCookie()
{
	setCookie("sceneMaker_maxNumOfScene", maxNumOfScene, cookieExpireDate);
}



function storeSceneCookie(messageOff)
{
	getStartTime();
		
	var cookieStr = "";
	storeMaxNumOfSceneCookie();

	// Global cookie for all frames
	cookieStr = cookieStr.concat("1","|"); //alreadySaved
	//cookieStr = cookieStr.concat(storyBackground,"|"); // wallpaper
	cookieStr = cookieStr.concat(document.getElementById('edit_text_box').innerHTML.slice(0,totalStrLengthLimit), "|"); //speechText
	cookieStr = cookieStr.concat($("#reactionSelect :selected").val(), "|"); //speechText
	//cookieStr = cookieStr.concat($("#gifIntervalSelect :selected").val(), "|"); //gifIntervalSelect
	//cookieStr = cookieStr.concat($("#frameSkipSelector :selected").val(), "|"); //frameSkipSelector

	//alert(cookieStr);
	setCookie("sceneMaker_frame-".concat(sceneNum), cookieStr, cookieExpireDate);

	// save main image
	printStoryCanvas();
	//uploadImageURL();

	// save sub text images
	saveSubTextImages();



    if(messageOff != 'messageOff'){
    	alert('Scene was saved successfully!');

    }
    
}


function transferSceneCookie()
{

	var cookieStr = "";

	// Global cookie for all frames
	cookieStr = cookieStr.concat("0","|"); //alreadySaved
	cookieStr = cookieStr.concat(storyBackground,"|"); // wallpaper
	




	cookieStr = cookieStr.concat(document.getElementById('edit_text_box').innerHTML, "|"); //speechText


	setCookie("sceneMaker_frame-".concat(sceneNum), cookieStr, cookieExpireDate);

   
}
function loadSceneCookie()
{
	var speech = searchCertainCookie("speech");
	var reaction = searchCertainCookie("reaction");

	if(reaction){
		document.getElementById('edit_text_box').innerHTML = speech;

		var path = './frameChoice/template/interface/'+ reaction +'/0.png';
		document.getElementById('homeScreenStory').src = path;

		$('#reactionSelect').val(reaction).change();

	} else {
		document.getElementById('edit_text_box').innerHTML = "";
	}

	document.getElementById("story-textfield").value = document.getElementById('edit_text_box').innerHTML;

}



function changeScene()
{
	document.getElementById('sceneLoading_box').innerHTML = "Loading Frame . . .";

	var sceneNumToLoad = document.getElementById('story-line-select-option').value;
	var sceneNumToLeave = sceneNum;

	// Check if the scene we are going to load already has a saved file
	sceneNum = sceneNumToLoad;
	var alreadySaved =  searchCertainCookie("alreadySaved");

	if(alreadySaved == "0")
	{
		// if we find out nothing has been saved in that scene, we want to transfer prev scene to this scene
		sceneNum = sceneNumToLeave;
		loadSceneCookie();
		sceneNum = sceneNumToLoad;
		transferSceneCookie();

		// Change some stuff so that it looks like the scene has changed
		document.getElementById('edit_text_box').innerHTML = "";
		document.getElementById("story-textfield").value = "";


		
	} else if(alreadySaved == "1"){
		// load scene that was saved already

		loadSceneCookie();
	} else {
		alert('Something went wrong when changing scene. This should not happen');
	}
	document.getElementById('sceneNum_box').innerHTML = "Frame ".concat(sceneNum);
	document.getElementById('sceneLoading_box').innerHTML = "";

}

document
    .getElementById("startNewStoryGIFBut")
    .addEventListener("click", function( e ){ //e => event
        if( ! confirm("Starting a new GIF will delete all data that you have saved. Do you want to continue to make a new GIF?") ){
            e.preventDefault(); // ! => don't want to do this
        } else {
            //want to do this! => maybe do something about it?
            deleteAllStoryCookiesAndLocalStorage();
        }
  });


function deleteAllStoryCookiesAndLocalStorage()
{
	
	var cookieNames = document.cookie.split(/=[^;]*(?:;\s*|$)/);

	var tmpCountDown = maxNumOfScene;
	for(var i=0; i + 1< maxNumOfScene; i++){
		$("#story-line-select-option option[value='".concat(tmpCountDown ,"']")).remove();
		tmpCountDown = tmpCountDown - 1;
	}

	document.getElementById('sceneNum_box').innerHTML = "Frame 1";

	// reset global variables
	subImageAr = [];
	tempSubAr = [];

	sceneNum = 1;
	maxNumOfScene = 1;



	mainTxt = "";
	sceneNum = 1;
	maxLimitNumScene = 15;

	currentSpeaker = 'none';







	// Delete all cookies that start with "sceneMaker_"
	for (var i = 0; i < cookieNames.length; i++) {
	    if (/^sceneMaker_/.test(cookieNames[i])) {
	        document.cookie = cookieNames[i] + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
	    }
	}


	// Clear local storage that starts with 'storyMaker_imageURL-'
	Object.keys(localStorage)
      .forEach(function(key){
           if (/^storyMaker_imageURL-/.test(key)) {
               localStorage.removeItem(key);
           }
       });
      
     deleteCookie("sceneMaker_maxNumOfScene");
    $('#story-line-select-option').find('option:not(:first)').remove()
	$('#story-line-select-option').val(1).change();
	$('#story-line-select-option').selectpicker('refresh');


	
    
	loadSceneCookie();
	updateAllFrameCounter();
	//speakerResize();
	//loadTotalFrameList();
}

function addNewScene(alertShow=true)
{
	if (parseInt(maxNumOfScene) + 1 > maxLimitNumScene){
		alert('Sorry, only 15 frames per GIF is allowed :(');
		return;
	}


	maxNumOfScene = parseInt(maxNumOfScene);
	var x = document.getElementById('story-line-select-option');
	var option = document.createElement("option");

	var	declareInt = x.length + 1
	if(maxNumOfScene == x.length){
			declareInt = maxNumOfScene + 1; 
			maxNumOfScene += 1;
	} 
	

	option.text = "Frame ".concat(declareInt);
	option.value = maxNumOfScene;

	x.add(option);
	

	setCookie("sceneMaker_maxNumOfScene", maxNumOfScene, cookieExpireDate);

	$('#story-line-select-option').selectpicker('refresh');

	if(alertShow){
		alert('New frame added');
	}
	

}

function deleteCookie(name) {
    // This function will attempt to remove a cookie from all paths.
    var pathBits = location.pathname.split('/');
    var pathCurrent = ' path=';

    // do a simple pathless delete first.
    document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;';

    for (var i = 0; i < pathBits.length; i++) {
        pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[i];
        document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;' + pathCurrent + ';';
    }
}


function removeLastScene()
{
	if(maxNumOfScene == 1){
		alert("You can't delete the first scene");
		return;
	}

	$("#story-line-select-option option[value='".concat(maxNumOfScene ,"']")).remove();


	deleteCookie("sceneMaker_frame-".concat(maxNumOfScene));

	removeToSubImageArray(parseInt(maxNumOfScene));


	maxNumOfScene = parseInt(maxNumOfScene) - 1;
	setCookie("sceneMaker_maxNumOfScene", maxNumOfScene, cookieExpireDate);
	$('#story-line-select-option').selectpicker('refresh');
	


	setCookie("maxNumOfScene",cookieExpireDate);
	alert('Frame '.concat(parseInt(maxNumOfScene) + 1, ' has been removed'));

	if(maxNumOfScene + 1 == sceneNum)
	{
		sceneNum = 1;
		loadSceneCookie();
		//speakerResize();
	}

	

}

function loadTotalFrameList()
{
	var maxNumOfSceneCookie = getCookie("sceneMaker_maxNumOfScene");

	if(maxNumOfSceneCookie != null && maxNumOfSceneCookie!='')
	{
		maxNumOfScene = maxNumOfSceneCookie;
		for(var i=2; i - 1 < maxNumOfScene; i++)
		{
			var x = document.getElementById('story-line-select-option');
			var option = document.createElement("option");
			option.text = "Frame ".concat(i);
			option.value = parseInt(i);

			x.add(option);
		}
	}
	$('#story-line-select-option').selectpicker('refresh');
	
}



function show (toBlock){
  setDisplay(toBlock, 'block');
}
function hide (toNone) {
  setDisplay(toNone, 'none');
}
function setDisplay (target, str) {
  document.getElementById(target).style.display = str;
}


function addStoryText()
{
	// Santize input, replace all "|" with empty character
	var tempStr = document.getElementById("story-textfield").value;
	//alert(tempStr.length)
	if(tempStr.length > maxWidth){
		tempStr = tempStr.slice(0,maxWidth);
	
	}//alert(tempStr.length);
	tempStr = tempStr.replace(/\|/g,"");
	
	// Display text
	document.getElementById('edit_text_box').innerHTML = tempStr;
	document.getElementById("story-textfield").value = tempStr;
}




function purgeOptions()
{
	$('#mySelect')
    .find('option')
    .remove()
    .end()
    .append('<option value="whatever">text</option>')
    .val('whatever');
}



function reconstruct(arr, last)
{
	var sentence = "";
	var i = 0;

	if(!last)
	{
		//alert('popping:');
		//alert(arr);
		arr.pop();	
		
		//alert(arr);
	}
	//alert(arr.length);
	//alert('peek: '.concat(arr[arr.length-1].toString()));

	// To get rid of empty charaacters
	while(true){
		if(arr.length == 0){
			break;
		}
		if(arr[arr.length-1].toString() == ''){
			arr.pop();
		} else {
			break;
		}
	}
	for(var value = ""; value = arr.pop();)
	{
		//alert('value: '.concat('[',value,']'));
		sentence = (" ".concat(value)).concat(sentence);
		//alert('forloop sentence: '.concat(sentence));	
	}

	return sentence;
}

// This script is to mainly construct text on a computer
function addText(ctx, mainTxt, xPosition,rowPosition)
{
	ctx.fillStyle = '#837255';
	ctx.font = "17px FOT-Seurat";
	ctx.textAlign = "start";
	if(mainTxt.length > totalStrLengthLimit){
    	mainTxt.slice(0,totalStrLengthLimit);
    }

    var txt = mainTxt;

    //alert('Add text: '+txt)
    
	if(ctx.measureText(txt).width >= maxLinePixelLength )
	{
		// That means the text width is zero   
		//alert('first'.concat(txt));
		//var rowPosition = 540;
		//var xPostion = 125;
		var incrementRowVal = 18; // Increment 
		
		while(true)
		{

			if(txt.length <= 0)
			{
				break;
			}

			var last = true;
			if(ctx.measureText(txt).width >= maxLinePixelLength )
		    {
		    	last = false;
		    	//xPosition += 10;
		    } 

			var remainderTxt = txt.substring(0, determineCutOffLength(txt));
			//alert('remainderTxt: '.concat(remainderTxt));
		    var splitArray = remainderTxt.split(" ");


		    var temp = reconstruct(splitArray, last);
		    //alert('temp: '.concat(temp));

		    ctx.fillText(temp, xPosition, rowPosition);	
		    rowPosition = rowPosition + incrementRowVal;

		    txt = txt.substring(temp.length, txt.length);

		    if(temp == '' || temp == null){
		    	break;
		    }

		}


	} else {
		//alert('second'.concat(txt));
		ctx.fillText(txt, xPosition, rowPosition);	

	}

}



function saveCurrentScene()
{
	document.getElementById('insertStoryText_but').disabled = true;
	storeSceneCookie();
	document.getElementById('insertStoryText_but').disabled = false;
	updateAllFrameCounter();

}


function constructGIF()
{	
	//alert("Starting");

	if(urlAr == null || urlAr.length <= 0){
		alert('You need to save at least one frame before generating the GIF');
		urlAr = [];
		document.getElementById('uploadInProcessDiv').style.display = "none";
		document.getElementById('convertGIF_but').disabled = false;
		return;
	}
	
	gifshot.createGIF({
		'images': urlAr,
		'dialogue': textAr,
		'interval': intervalForGIF,
		'gifWidth': gifWidth,
		'gifHeight': gifHeight,
		'text': 'Create your own Animal Crossing GIF at ( ac-storymaker.github.io )',
		'fontFamily':'FOT-Seurat',
		'fontSize': '10px',
		'textBaseline': 'top'
	}, function (obj) {
			
		if (!obj.error) {
		    var image = obj.image, animatedImage = document.createElement('img');
		    animatedImage.src = image;
		    var clientId = "566721a01a10a6c"; // Your client Id
			var imgUrl = image;
			var albumId = 'OeC4jum'; // Your owned album id

			uploadImageImgur(imgUrl);


		    document.getElementById('gifOutputDiv').appendChild(animatedImage);
		    document.getElementById('gifOutputDiv').style.display = "block";
		    document.getElementById("sceneLoadingBox").innerHTML = "Finishing up. . .";
		    urlAr = [];
		    document.getElementById('uploadInProcessDiv').style.display = "none";
		    document.getElementById('convertGIF_but').disabled = false;

 //uploadImageImgur(image);

		}
	});

}


function uploadImageImgur(imgUrl)
{

	imgUrl = imgUrl.replace("data:image/gif;base64,","")

	$.ajax({
		    url: 'https://api.imgur.com/3/image',
		    type: 'post',
		    headers: {
		        Authorization: 'Client-ID 566721a01a10a6c'
		    },
		    data: {
		        image: imgUrl,

		    },
		    dataType: 'json',
		    async: false, 
		    success: function(response) {
		        if(response.success) {
		        	var timeStr = new Date().toLocaleString("en-US", {timeZone: "America/New_York",hour12:false});
		        	var month = timeStr.split(",")[0].split("/")[0]
		        	var day = timeStr.split(",")[0].split("/")[1]
		        	var year = timeStr.split(",")[0].split("/")[2]

		        	var dateRearanged = year + "-" + month + "-" + day;
		        	var currentdate = dateRearanged + " : " + timeStr.split(",")[1]; 

					firebaseRef.child(currentdate).set({URL:response.data.link,Read:'N'});
		        }
		    },
		    error: function(xhr, status, error) {
		    	console.log('We encounterd an ajax error');
			    console.log(xhr.responseText);
			}
		});

}



function uploadImageURL()
{
	try {
	    var img = document.getElementById('story-canvas').toDataURL('image/png', 0.9);
	} catch(e) {
	    var img = document.getElementById('story-canvas').toDataURL();
	}


    
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem("storyMaker_imageURL-".concat(sceneNum), img);
	} else {
		alert('Sorry, your browser does not support storage. Try upgrading your browser.');
		return;
	}
	


	//document.getElementById('imageGIF').src = img;
}


function uploadSubImageURL(subValue)
{
	try {
	    var img = document.getElementById('story-canvas').toDataURL('image/png', 0.9);
	} catch(e) {
	    var img = document.getElementById('story-canvas').toDataURL();
	}
	
	
	tempSubAr.push(img);


	//document.getElementById('imageGIF').src = img;
	//alert('sample');
}



function convertAllSceneToGIF()
{
	
	document.getElementById('convertGIF_but').disabled = true;
	urlAr = [];
	document.getElementById('uploadInProcessDiv').style.display = "block";
	document.getElementById('gifOutputDiv').style.display = "none";
	$('#gifOutputDiv').empty();

	document.getElementById("sceneLoadingBox").innerHTML = "Preparing frames for conversion. . .";

	var prevSceneNum = sceneNum;
	// upload everything to urlAR
	for(var i=1; i - 1 < maxNumOfScene; i++)
	{
		sceneNum = i;
		var alreadySaved =  searchCertainCookie("alreadySaved");

		if(alreadySaved == "0")
		{
			// if frame is unsaved, ignore it
			continue;
		} else if(alreadySaved == "1"){
			// frame was saved, push it to array to convert to GIF
			urlAr.push(localStorage.getItem("storyMaker_imageURL-".concat(i)));
			//alert(i);
			//alert(localStorage.getItem("storyMaker_imageURL-".concat(i)));
		} else {
			// This should never happen
			alert('We encountered a problem when converting all frames to GIF: '.concat('[',alreadySaved,']'));
		}
	}
	sceneNum = prevSceneNum;


	document.getElementById("sceneLoadingBox").innerHTML = "Constructing GIF, please be patient. . .";
	//alert('going to construct GIF');
	constructGIF();

}

var startTime;
function getStartTime()
{
	startTime = new Date();
}
function getElapsedTime(){
	var endTime = new Date();
	var timeDiff = endTime - startTime;
	timeDiff /= 1000;
	console.log(timeDiff+"s"); 
}





function convertDirImagesToGIF()
{
	subImageAr.sort(multiSortFunction);
	
	document.getElementById('convertGIF_but').disabled = true;
	urlAr = [];
	document.getElementById('uploadInProcessDiv').style.display = "block";
	document.getElementById('gifOutputDiv').style.display = "none";
	$('#gifOutputDiv').empty();

	document.getElementById("sceneLoadingBox").innerHTML = "Preparing frames for conversion. . .";

	//getDataURLLoop();
	//var sceneAr = ["smiling","question-mark","shock-and-embarrased","closing"];
	//var sceneMaxFrame = [18,22,60,29];
	
	//var reaction = searchCertainCookie("reaction");
	//alert(reaction)
	

	var frameSkipAmount = parseInt(document.getElementById('frameSkipSelector').value); // Number to decide how many frames to skip

	//for(var sceneNum=0; sceneNum < sceneAr.length; sceneNum++){
	for(var sceneNum=1; sceneNum-1 < maxNumOfScene; sceneNum++)
	{

	    //maxLength = sceneMaxFrame[sceneNum];
	    var sceneReaction = searchCertainCookie("reaction",sceneNum);
	    var sceneSpeech = searchCertainCookie("speech",sceneNum);
	    var maxLength = sceneMaxFrameDict[sceneReaction];
	    //alert(i+" "+sceneReaction);
		for(var i=0; i < maxLength; i++){
			// Going to 
			var imgURL = './frameChoice/active/'+sceneReaction +'/'+i+'.png';
			//var speakerTxt = "Hello everyone!";

			//console.log(imgStr);

			urlAr.push(imgURL);
			textAr.push(sceneSpeech);

			i = i + frameSkipAmount;

		}
	}
	//alert(urlAr.length);



	document.getElementById("sceneLoadingBox").innerHTML = "Constructing GIF, please be patient. . .";
	//alert('going to construct GIF');
	constructGIF();
	
}





function convertAllSceneToGIFRollingText()
{
	document.getElementById('convertGIF_but').disabled = true;

	urlAr = [];
	document.getElementById('uploadInProcessDiv').style.display = "block";
	document.getElementById('gifOutputDiv').style.display = "none";
	$('#gifOutputDiv').empty();

	document.getElementById("sceneLoadingBox").innerHTML = "Preparing frames for conversion. . .";
	/*
	var prevSceneNum = sceneNum;

	var mainFrameRepeatNum = cacluateNumOfFramesForMain(document.getElementById('gifIntervalSelect').value);
	var allFrameRepeatNum = cacluateLengthOfAllFrames(document.getElementById('gifIntervalSelect').value);

	// Set intervalDivisor variable
	changeSmoothnessLevel();


	subImageAr.sort(multiSortFunction);

	// upload everything to urlAR
	for(var i=1; i - 1 < maxNumOfScene; i++)
	{
		sceneNum = i;
		var alreadySaved =  searchCertainCookie("alreadySaved");

		if(alreadySaved == "0")
		{
			// if frame is unsaved, ignore it
			continue;
		} else if(alreadySaved == "1"){
			// frame was saved, push it to array to convert to GIF

			// first, we must load subimages
			var tmpResult = pushSubImageToURLAR(i);

			var maxCount = mainFrameRepeatNum;
			if(tmpResult == -1){
				// Since we ignored subimages (speech), we are adding as many frames as the entire chosen interval
				maxCount = allFrameRepeatNum;
			}

			// then we push main image
			for(var j=0; j < maxCount; j++){
				urlAr.push(localStorage.getItem("storyMaker_imageURL-".concat(i)));
			}
			

		} else {
			// This should never happen
			alert('We encountered a problem when converting all frames to GIF: '.concat('[',alreadySaved,']'));
		}
	}
	sceneNum = prevSceneNum;
	*/

	document.getElementById("sceneLoadingBox").innerHTML = "Constructing GIF. This may take a while, please be patient. . .";
	//alert('going to construct GIF');
	constructGIF();
}




function startACGIFCreation()
{
	changeStoryGIFResolution();

	//if(document.getElementById('radio-rollingText-switch-yes').checked){
	if(1 ==2){
		// If rolling text is selected
		//alert('FPS');
		intervalForGIF = chosenFPStoRealFPS(document.getElementById('gifIntervalSelect').value);
		convertAllSceneToGIFRollingText();
	} else {
		intervalForGIF = document.getElementById('gifIntervalSelect').value;
		alert('Convert All Scene to GIF');


		//convertAllSceneToGIF();  // MODIFIED
		intervalForGIF = document.getElementById('gifIntervalSelect').value;
		convertDirImagesToGIF();
	}
}


function startGIFCreation()
{
	changeStoryGIFResolution();

	if(document.getElementById('radio-rollingText-switch-yes').checked){
		// If rolling text is selected
		intervalForGIF = chosenFPStoRealFPS(document.getElementById('gifIntervalSelect').value);
		convertAllSceneToGIFRollingText();
	} else {
		intervalForGIF = document.getElementById('gifIntervalSelect').value;
		convertAllSceneToGIF();
	}
}




function printStoryCanvas(){
	//alert('Accessing canvas');

	var mainTxt = document.getElementById('edit_text_box').innerHTML;
	//var speakerTxt = document.getElementById('edit_speaker_box').innerHTML;


	if(mainTxt.length > totalStrLengthLimit){
    	mainTxt.slice(0,totalStrLengthLimit);
    }


	mainTxt = mainTxt.concat(" ");

	var c = document.getElementById("story-canvas");
    
	var ctx = c.getContext("2d");
	var img = document.getElementById("homeScreenStory");

    c.width  = img.width; // in pixels
	c.height = img.height;


    ctx.drawImage(img, 0, 0, img.width,img.height);    
 	
    //ctx.drawImage(speakerbox, 65, 430, speakerbox.width, speakerbox.height);
    //ctx.drawImage(speechbox, 65, 490, speechbox.width, speechbox.height);

    ctx.globalAlpha = 1;

    // Preparing to write text
    ctx.font = "30px FOT-Seurat";
  
	//var mainTxt = "I hope that a study of very long sentences will arm you with strategies that are almost as diverse as the sentences themselves, such as: starting each clause with the same word, tilting with dependent clauses toward a revelation at the end, padding with parentheticals, showing great latitude toward standard punctuation, rabbit-trailing away from the initial subject, encapsulating an entire life, and lastly, as this sentence is, celebrating the list."
	//var mainTxt = "Derp";
	var txt = mainTxt;
	addText(ctx, mainTxt);


	// Speaker text
	//ctx.fillText(speakerTxt, speakerTextPosition, 465);
	//alert('here');

	//alert('Loaded main stuff to canvas');
}





$(document).ready(function(){
	 $("#story-textfield").on("change keyup paste", function(){
	    addStoryText();
	})
});

function loadNumOfScene(){
	maxNumOfScene = getCookie("sceneMaker_maxNumOfScene");

	if(!maxNumOfScene || isNaN(maxNumOfScene)){
		maxNumOfScene = 1;
	}

	for(var i =2; i < parseInt(maxNumOfScene)+1; i++){
		var x = document.getElementById('story-line-select-option');
		var option = document.createElement("option");
		option.text = "Frame ".concat(i);
		option.value = parseInt(i);
		x.add(option);
	}
}


function sceneMakerInitalization()
{
	
	loadSceneCookie();
	loadNumOfScene();
	document.getElementById('reactionGIFImg').src = './frameChoice/template/gif/'+ $("#reactionSelect :selected").val() +'/0.gif';
	updateAllFrameCounter();


	//$("#smoothnessTextSelect").selectpicker('hide');
	//document.getElementById('smoothnessLabelHide').style.display = "none";
	//speakerResize();
	//loadTotalFrameList();


}

// Loading functions
sceneMakerInitalization();
