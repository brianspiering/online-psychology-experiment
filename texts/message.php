<?php

class TEXTMESSAGE {

    private $MESSAGE = array();

    public function __construct() {
        $this->MESSAGE["screenConsent"] = array(
            "text_header" => "Consent Information",
            "text_mainmessage" => "<br/>By continuing, you are choosing to participate in a research study.<br/> <br/>Your participation in this research is voluntary. <br/> <br/>You may decline further participation, at any time, without adverse consequences. <br/> <br/>Your anonimity is assured; the researchers will not receive any personal information about you.<br/> <br/>",
            "nextScreen" => "screenInstructions1"
        );
        $this->MESSAGE["screenInstructions1"] = array(
            "text_header" => "Instructions",
            "text_mainmessage" => "<br/>You are an alien anthropologist in training. We need your help to decipher a lost alien language found in a royal tomb on the planet Neptar. There are two different alphabets, one written by the Aron clan and one written by the Broll clan.<br><br>In your training as an alien anthropologist, you will learn which letters are Aronian and which are Brollian. You will see 1 letter at a time. Click the letter 'A' on the screen if you think the letter is Aronian. Click the letter 'B' if you think the letter is Brollian. A green O will appear if your answer was correct. A red X will appear if your answer was incorrect.",
            "nextScreen" => "screenDemo"
        );
        $this->MESSAGE["screenDemo"] = array(
            "text_header" => "Example Symbols",
            "text_mainmessage" => "<br><br>Next, 2 example letters will be show to help you get acquainted with responding. Alien letters will be presented one at a time. Click on either 'A' or 'B' on the screen. <br><br>If you are unable to finish the example trials, please <b>return</b> the HIT.",
            "nextScreen" => "screenTraining"
        );
        $this->MESSAGE["screenTraining"] = array(
            "text_header" => "Training",
            "text_mainmessage" => "<br><br>Now you are ready to begin training. After an alien letter appears, click on either 'A' for Aronian or 'B' for Brollian. If you are correct, you will see a green O. If you are wrong, you will see a red X.  By paying attention to the feedback you will learn which letters come from which clan.<br><br>This phase takes most people less than 1 minute.<br><br><b>Good Luck!</b>",
            "nextScreen" => "screenTransfer"
        );
        $this->MESSAGE["screenTransfer"] = array(
            "text_header" => "Final Phase",
            "text_mainmessage" => "<br><br>You did a great job on the training!<br><br>Now you will see words in the Neptar language. Over time, the Aronian and Brollian clans became mixed. Therefore, some words in the Neptar language may contain letters from both the Aronian and Brollian clans. Each word has 4 individual letters. You must decide whether the <b>entire word</b> is more likely to be from the Aronian or Brollian clan. Click on either 'A' for Aronian or 'B' for Brollian.<br><br>There are no right or wrong answers. Just go with your first instinct.<br><br>This is the last part and takes most people less than 1 minute.",
            "nextScreen" => "screenGoodbye"
        );
        $id = rand(10, 100);
        $this->MESSAGE["screenGoodbye"] = array(
            "text_header" => "Congratulations!",
            "text_mainmessage" => "<br><br><br><br><br><br>Your confirmation code is: <b>YouAreAwesome" . $id . "</b>.<br><br>Thank you for your time and effort.<br><br>The reseachers and the residents of Neptar really appreciate your help.",
            "nextScreen" => ""
        );
    }

    public function getMessage($value) {
        return $this->MESSAGE[$value];
    }

}

?>