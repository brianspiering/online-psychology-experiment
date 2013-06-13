<?php
include_once 'texts/message.php'; // we include the text that will be shown on the page

$response = new Response($_POST['type'], $_POST['value']);

echo $response->getResponse();

//This class 
class Response {

    private $file;
    private $type;
    private $value;
    private $TEXTMESSAGE;
    private $response;

    public function __construct($type, $value, $file = null) {
        $this->file = $file;
        $this->type = $type;
        $this->value = $value;
        $this->response = array();
        $this->TEXTMESSAGE = new TEXTMESSAGE();
    }

    public function getResponse() {
        switch ($this->type) {
            case "message": {
                    return $this->getMessage($this->value);
                    break;
                }
            case "json": {
                    return $this->getJSON($this->value);
                    break;
                }
            case "file": {
                    return $this->saveFile($this->value);
                    break;
                }
        }
    }

    private function saveFile($value) {
        $f = fopen('output/' . $value['fileName'], 'a+'); //should the file be appended or rewritten?

        if (!fwrite($f, serialize($value['data']))) {//we write the information into the file
            $this->response = "Error at writting file.\n";
        } else {
            $this->response = " "; // "The file was succesfully written!\n";
        }
        fclose($f);
        return $this->response;
    }

    private function getJSON($link) {
        return file_get_contents("input/$link.json");
    }

    private function getMessage($value) {//we retrieve the values
        $data = $this->TEXTMESSAGE->getMessage($value);
        //we create the temporary div where the next description will be store
        $div = "<h1 id='text_header'>" . $data['text_header'] . "</h1>"; //the header of the description
        $div .="<div id='text_mainmessage'>" . $data['text_mainmessage'] . "</div>"; //the description
        $this->response["div"] = $div;
        $this->response["nextData"] = $data["nextScreen"];
        return $this->encode($this->response);
    }

    //we encode the PHP array into JSON for the client
    private function encode($array) {
        return json_encode($array);
    }

}

?>
