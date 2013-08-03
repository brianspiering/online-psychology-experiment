//-----VARIABLES----
var debugFlag = 1 //0 = final version; 1 = debug mode
if(debugFlag == 0){
    var stopDemoTrialIndex = 5;
    var currentDataSet = 999; //Math.floor(Math.random() * (499 - 401 + 1)) + 401;
} else if(debugFlag == 1){
    var stopDemoTrialIndex = 2;
    var currentDataSet = 999;
    // Data set for testing. Each one has different number of trials.
    // 901 = 1 training, 1 transfer
    // 902 = 2 training, 2 transfer
    // 999 = 4 training, 4 transfer
};

// Define initial values.
var opt={
    "type":"message",
    "value":"screenConsent"
};

// Define JSON data parameters.
var JSONFile = {};
var imageSizeRescaled = 350; 	  // the size of the image
var nImages = 12;                    //the number of alien images; total number possible

// Create the list of images.
var Images=new Array(nImages); // the Images list

// Define the Error class.
var Errors={
    AJAX_ERROR_MESSAGE:"Server connection error!"
};

// Define the Demo class.
var Demo=new Array(stopDemoTrialIndex);

// Define the Training class.
var Training={
    dataset:currentDataSet,
    dataArray:new Array(),
    timeFeeback:750 // in milliseconds. Final value =750.
};

// Define the Transfer class.
var Transfer={
    dataset:currentDataSet,
    dataArray:new Array(),
    timeStimulusLatency:200 // in milliseconds. Final value = 200.
};

// Define the Data class.
var Data={
    userID:Math.floor(Math.random()*89999+10000), // Random 5 digit number
    type:'demo',
    crtIndex:0,
    filename:"",
    data:[]
};
//----------------------------------------------------

//--- Functions --------------------------------------
(function($) { // Prints in the console during debugging.
    $.message = function(text) {
        if(debugFlag == 1){
            console.log(text);
        }
    };
})(jQuery);

(function($) { // Alerts an error.
    $.Error = function(text) {
        alert(text);
    };
})(jQuery);

(function($) { // Writes a text into the footer of the container.
    $.footerWrite= function(text) {
        $("#text_footermessage").show();
        $("#text_footermessage").text(text);
        setTimeout(function(){
            $("#text_footermessage").hide();
        }, 500);
    };
})(jQuery);

(function($){ // Load the next data.
    $.loadData=function(opt){
        $.ajax({
            url:'response.php',
            type:"post",
            data: opt,
            success: function(data) {
                data=eval('('+data+')');
                $("div#response").html(data.div); //Store the next description in the response div.
                $("a#nextScreen, a#nextImage").attr("next",data.nextData); //Store the next link to the next description into the "next" attribute.
            },
            error: function() {
                alert('The website failed to load. Please return the hit');
                $.message('Error demo trials!');
                $.Error(Errors.AJAX_ERROR_MESSAGE);
            }
        });
    }
})(jQuery);

(function($){ // Retrieve a JSON file.
    // Load the desired JSON file.
    $.loadJSON=function(opt){
        $.ajax({
            url:'response.php',
            type:"post",
            data: opt,
            success: function(data) {
                data=eval('('+data+')');
                JSONFile=data.inputTrials;
            },
            error: function() {
                alert('The website failed to load. Please return the hit');
                $.message('Error demo trials!');
                $.Error(Errors.AJAX_ERROR_MESSAGE);
            }
        });
    }
})(jQuery);

(function($){ // Save a file.
    $.footerWrite("Saving data...");
    $.saveFile=function(opt){
        $.ajax({
            url:'response.php',
            type:"post",
            data: opt,
            success: function(data) {
                $.footerWrite(data); // Append the response to the footer.
            },
            error: function() {
                alert('The website failed to load. Please return the hit');
                $.message('Error demo trials!');
                $.Error(Errors.AJAX_ERROR_MESSAGE);
            }
        });
    }
})(jQuery);
//---------------------------------------------------------

// The main function.
$(document).ready(function(){
    $.loadData(opt); // Load the second description page.
    $("a#nextScreen").live("click",function(){ // Load the next description page.

        $("div#description").html($("div#response").html()); // Update the information the client sees.

        $(this).attr("current",$(this).attr("next")); // Update the next information the client should request from the server.

        reset("div#description"); // Reset the description div.
        opt={
            "type":"message",
            "value": $(this).attr("current")
        }
        switch(opt.value){
            // Start of Training part.
            case "screenTraining":{
                $(this).attr("id","nextImage"); // Change the id of the button from 'nextScreen' to 'nextImage'.

                $.loadData(opt);
                opt={
                    "type":"json",
                    "value":"demo_stimuli"
                };
                $.loadJSON(opt) // Load the demo values before they are needed.
                if(Images[0]==undefined){ // Test to see if the images are loaded or not.
                    preloadImages(); // Load images.
                }
                loadImages(); // Start showing  images.
                break;
            }
            // Start the Training part.
            case "screenTransfer":{
                $(this).attr("id","nextImage"); // Change the id of the button from 'nextScreen' to 'nextImage'.
                $.loadData(opt); // Loads the next description.
                loadImages(); // Start showing the images.
                break;
            }
            default:{
                // Loads the next description.
                $.loadData(opt);
                break;
            }
        }
    });
});

// Generate the Demo, Training, Transfer classes.
// Then start each part depending on the Data.type.
function loadImages(){
    $("a#nextImage").on("click", function(){
        switch(Data.type){
            case "demo":{
                generateDemo();
                loadDemo(); // Show the demo.
                break;
            }
            case "training":{
                generateTraining();
                loadTraining();
                break;
            }
            case "transfer":{
                generateTransfer();
                loadTransfer();
                break;
            }
        }
    });
}

// Show an image in the middle of the screen.
function showImage(Image){
    setupImage(); // Hide the other information.
    $('#currentimage_center').attr('src', Image.image.src);
    $('#currentimage_center').load(function() {
        $('#currentimage_center').height(imageSizeRescaled); //TODO: change to be a css class for image
        $('#currentimage_center').width(imageSizeRescaled);
        $('#currentimage_center').show();
        showResponseCues()
    }); // Wait for current image is loaded before displaying.

}

// Put the images during Transfer part.
function showImageTransfer() {
    setupImage();
    $("#imagelocationtraining_center").hide();
    image = Transfer.dataArray[Data.crtIndex].image[0];
    $('#currentimage_top').attr('src', image.src)
    $('#currentimage_top').load(function() {
        showFirstImage_CuesNo();
        setTimeout(showSecondImage_CuesNo, Transfer.timeStimulusLatency);
    }); // Wait for image to load.
}

// These functions will generate the DEMO, Training and Transfer classes.

// Populates the Demo object.
function generateDemo(){
    tempJson=JSONFile;
    opt={
        "type":"json",
        "value":'stimuli/dataset_'+Training.dataset+'_training'
    };
    $.loadJSON(opt) // Load the training values.

    for(i=0;i<Demo.length;i++){
        Demo[i]={
            image:Images[tempJson[i].imageNumber-1].image,
            data:{
                trialNumber:tempJson[i].trialNumber,
                imageNumber:tempJson[i].imageNumber,
                correctResponse:tempJson[i].correctResponse
            }
        };
    }
    $.message(Demo);
}

//  Populate the Training object.
function generateTraining(){
    tempJson=JSONFile;
    opt={
        "type":"json",
        "value":'stimuli/dataset_'+Transfer.dataset+'_transfer'
    };
    $.loadJSON(opt) // Load the transfer values.

    for(i=0;i<tempJson.length;i++){
        Training.dataArray[i]={
            image:Images[tempJson[i].imageNumber-1].image,
            data:{
                trialNumber:tempJson[i].trialNumber,
                imageNumber:tempJson[i].imageNumber,
                correctResponse:tempJson[i].correctResponse
            }
        };
    }
    $.message(Training);
}
// Populate the Transfer object.
function generateTransfer(){

    for(i=0;i<JSONFile.length;i++){
        var images=new Array()  ;
        images[0]=Images[JSONFile[i].firstStimuli-1].image;
        images[1]=Images[JSONFile[i].secondStimuli-1].image;
        images[2]=Images[JSONFile[i].thirdStimuli-1].image;
        images[3]=Images[JSONFile[i].fourthStimuli-1].image;

        Transfer.dataArray[i]={
            image:images,
            data:{
                trialNumber:JSONFile[i].trialNumber,
                numberofStimuli:JSONFile[i].numberofStimuli,
                firstStimuli:JSONFile[i].firstStimuli,
                secondStimuli:JSONFile[i].secondStimuli,
                thirdStimuli:JSONFile[i].thirdStimuli,
                fourthStimuli:JSONFile[i].fourthStimuli
            }
        };Transfer
    }
    $.message(Transfer);
}

//-----------------------------------------------------------------

// Load the Demo images.
function loadDemo(){
    if(Data.crtIndex < Demo.length){
        showImage(Demo[Data.crtIndex]);
    }
    else{
        screenTraining();
    }
}

// Loads the Training images.
function loadTraining() {
    if(Data.crtIndex < Training.dataArray.length){
        showImage(Training.dataArray[Data.crtIndex]);
    }
    else
        screenTransfer();
}

// Loads the Transfer images.
function loadTransfer() {
    if(Data.crtIndex < Transfer.dataArray.length){
        showImageTransfer();
    }
    else
        screenGoodbye();
}

function screenGoodbye() {
    $(document).ready(function() {
        saveTransfer(); // Save the Transfer file.
        setupScreen();
        $("div#description").html($("div#response").html());
        $.footerWrite("Saving your data. Please wait...");
        $('#nextScreen, a#nextImage').hide();
        $.message('Experiment ran successfully!');
    }); // Wait for DOM to load.
}

// Excute if participant didn't reach learning criteria during training.
function screenGoodbyeWithoutTransfer(){
    // TODO: double check that it works correctly before incorperating
        $(document).ready(function() {
        setupScreen();
        $("div#description").html($("div#response").html());
        $('#nextScreen, a#nextImage').hide();
        $.message('Experiment ran successfully!');
    }); // Wait for DOM to load.
    setDescriptionPage();
    saveTraining();

    changeDataType('transfer'); // Change from training to transfer.
}

function setDescriptionPage(){
    $("#nextImage").attr("id","nextScreen");
    $("#nextScreen").show();
    setupScreen();
}

// Show the Training screen.
function screenTraining() {
    setDescriptionPage();

    resetDataField(); // Empty the data so we can put only string.
    Data.filename="Subject"+Data.userID+"_Header.txt";
    Data.data[0]="Subject ID = "+Data.userID+"\n"+
    "Data Set Number = "+currentDataSet+"\n"+
    "Start Training Trials: "+new Date()+"\n";

    saveFile(); // Save the Header file.
    changeDataType('training'); // Change from demo to training.

    $("div#description").html($("div#response").html());
    reset("div#description");
}

// Show the Transfer screen.
function screenTransfer() {
    setDescriptionPage();
    saveTraining();

    changeDataType('transfer'); // Change from training to transfer.

    $("div#description").html($("div#response").html());
    reset("div#description");

}

// Saves the Training data.
function saveTraining(){
    setDescriptionPage();

    Data.filename='Subject'+Data.userID+'_Training.txt';
    saveFile(); // Save the Training file.

    // Update the header file.
    // The saves are async, so they are done aprox. at the same time.
    // Chose to do this way to save memory space on the client.
    resetDataField();   // Reset the Data.data array for temporary hold of string.
    Data.filename="Subject"+Data.userID+"_Header.txt";
    Data.data[0]="Training Trials = Complete\n"+
    "Start Transfer Trials: "+new Date()+"\n";
    saveFile();//update the header file

    $("#imagelocationtraining_center").hide();
    $('#nextScreen').show();
}

// Saves the Transfer data.
function saveTransfer(){

    setDescriptionPage();
    // Save the Transfer file.
    Data.filename='Subject'+Data.userID+'_Transfer.txt';
    saveFile(); // Save into the Transfer file the values we already have.

    // Save into the the Complete file.
    resetDataField();
    Data.filename='Subject'+Data.userID+'_Complete.txt';
    Data.data[0]='Subject'+Data.userID+'  = Complete Data Set!';
    saveFile();

    // Update the header file.
    // Saves are async, so they are done aprox at the same time.
    // Chose to do this way to save memory space on the client.
    resetDataField();
    Data.filename="Subject"+Data.userID+"_Header.txt";
    Data.data[0]="Transfer Trials = Complete\n"+
    "End of Experiment: "+new Date()+"\n";
    saveFile(); //Update the header file.
}

// Empty the Data.data array.
function resetDataField(){
    Data.data.length=0;
}

// Changes the Data object type and resets values.
function changeDataType(Datatype){
    Data.type=Datatype;
    Data.crtIndex=0;
    resetDataField();
    Data.filename="";
}

// Loads the images from the server.
function preloadImages(){
    for (i = 0; i<nImages; i++) {
        alienImage = new Image();
        alienImage.src = 'images/alien'+(i+1)+'.svg';
        Images[i] = {
            image:alienImage
        };
    }
    $.message('Images have been loaded');
}

// Sets the Image screen.
function setupImage() {
    $('#description').hide();
    $('a').hide();
    $('#feedbacklocation').hide();
    $("div#image").show();
    $("#image_response").removeAttr("disabled");
}

function showResponseCues(){
    $("#image_response").removeAttr('disabled');
    $('#responselocation_left').show();
    $('#responselocation_right').show();
    $("#responselocation_left").on('click', function(e){
        e.stopImmediatePropagation();
        processLeftClick(e);
        hideImages();
    });
    $("#responselocation_right").on('click', function(e){
        e.stopImmediatePropagation();
        processRightClick(e);
        hideImages();
    });
    $("#responselocation_left").hover(function(){
        $('#responselocation_left').css( 'cursor', 'pointer' );
    });
    $("#responselocation_right").hover(function(){
        $('#responselocation_right').css( 'cursor', 'pointer' );
    });
}

function processLeftClick() {
    Data.data[Data.crtIndex] ='a';
    updateResponseArray();
}
function processRightClick() {
    Data.data[Data.crtIndex] = 'b';
    updateResponseArray();
}

function updateResponseArray(){
    switch(Data.type){
        case "training":{
            Data.data[Data.crtIndex]={
                trialNumber:        Training.dataArray[Data.crtIndex].data.trialNumber,
                imageNumber:        Training.dataArray[Data.crtIndex].data.imageNumber,
                correctResponse:    Training.dataArray[Data.crtIndex].data.correctResponse,
                userAnswer:         Data.data[Data.crtIndex] // the user's answer is temporary stored into this variable
            }
            break;
        }
        case "transfer":{
            Data.data[Data.crtIndex]={
                trialNumber:        Transfer.dataArray[Data.crtIndex].data.trialNumber,
                numberofStimuli:    Transfer.dataArray[Data.crtIndex].data.numberofStimuli,
                firstStimuli:       Transfer.dataArray[Data.crtIndex].data.firstStimuli,
                secondStimuli:      Transfer.dataArray[Data.crtIndex].data.secondStimuli,
                thirdStimuli:       Transfer.dataArray[Data.crtIndex].data.thirdStimuli,
                fourthStimuli:      Transfer.dataArray[Data.crtIndex].data.fourthStimuli,
                userAnswer:         Data.data[Data.crtIndex] // the user's answer is temporary stored into this variable
            }
            break;
        }
        default:{
            break;
        }

    }
    hideTrialStuff();
}

function hideTrialStuff(){
    $("div#image").hide();
    $("#image_response").attr("disabled","disabled");
    $('#feedbacklocation').show();
    switch(Data.type){
        case "training":{
            showFeedback();
            break;
        }
        default:{
            nextTrialImage();
            break;
        }
    }
}
// The feedback shown during Training.
function showFeedback() {
    if(Data.data[Data.crtIndex].userAnswer == Data.data[Data.crtIndex].correctResponse){
        $('#feedbacklocation').text('O');
        $('#feedbacklocation').css('color', 'green');
    }
    else {
        $('#feedbacklocation').text('X');
        $('#feedbacklocation').css('color', 'red');
    }
    setTimeout(nextTrialImage, Training.timeFeeback); // wait for feedbackTime then continue
}

function setupScreen() {
    $('div#image').hide();
    $('#image_response').attr("disabled","disabled");
    $('#text_footermessage').hide();
    $('#feedbacklocation').hide();
    $('div#description').show();
    $('div#nextScreen').show();
}

function nextTrialImage() {
    Data.crtIndex++;
    switch(Data.type){
        case "demo":{
            loadDemo();
            break;
        }
        case "training":{
            loadTraining();
            break;
        }
        case "transfer":{
            loadTransfer();
            break;
        }
        default:{
            screenGoodbye();
            break;
        }
    }
}

//------FILE SAVES-------

// Saves the response.
function saveFile(){
    opt={
        "type":"file",
        "value":{
            "fileName":Data.filename,
            "data":Data.data
        }
    };
    $.saveFile(opt);
}

//-------------------------------------------------------

// The first image at Transfer Area.
function showFirstImage_CuesNo(){
    $('#currentimage_top').height(imageSizeRescaled);
    $('#currentimage_top').width(imageSizeRescaled);
    $('#currentimage_top').show();
}
// The second image at Transfer Area.
function showSecondImage_CuesNo(){
    image = Transfer.dataArray[Data.crtIndex].image[1];
    $('#currentimage_right').attr('src',image.src);
    $('#currentimage_right').ready(function() {
        $('#currentimage_right').height(imageSizeRescaled);
        $('#currentimage_right').width(imageSizeRescaled);
        $('#currentimage_right').show();
        setTimeout(showThirdImage_CuesNo,Transfer.timeStimulusLatency);
    });
}
// The third image at Transfer Area.
function showThirdImage_CuesNo(){
    image = Transfer.dataArray[Data.crtIndex].image[2];
    $('#currentimage_bottom').attr('src', image.src);
    $('#currentimage_bottom').ready(function() {
        $('#currentimage_bottom').height(imageSizeRescaled);
        $('#currentimage_bottom').width(imageSizeRescaled);
        $('#currentimage_bottom').show();
        setTimeout(showFourthImage, Transfer.timeStimulusLatency);
    });
}
// The fourth image at Transfer Area.
function showFourthImage(){
    image = Transfer.dataArray[Data.crtIndex].image[3];
    $('#currentimage_left').attr('src', image.src);
    $('#currentimage_left').ready(function() {
        $('#currentimage_left').height(imageSizeRescaled);
        $('#currentimage_left').width(imageSizeRescaled);
        $('#currentimage_left').show();
        showResponseCues();
    });
}
function hideImages(){
    $('#currentimage_top').hide();
    $('#currentimage_right').hide();
    $('#currentimage_bottom').hide();
    $('#currentimage_left').hide();
    $('#responselocation_left').hide();
    $('#responselocation_right').hide();
}
function reset(field){
    $(field).html();
}