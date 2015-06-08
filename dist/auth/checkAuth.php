<?php
function checkAuth($userInfo) {
    // need user (id) and token
    if (!isset($userInfo["user"])) {
        echo json_encode(array("required" => "user"));
    } elseif (!preg_match(ID_PATTERN, $userInfo["user"])) {
        echo json_encode(array("invalid" => "userFormat"));
    } elseif (!isset($userInfo["token"])) {
        echo json_encode(array("required" => "token"));
    } else {
        $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
        //if DB connection error
        if ($mysqli->connect_errno) {
            echo json_encode(array("error" => "databaseConnection"));
        } else {
            //get user
            if (!($stmt = $mysqli->prepare("SELECT id FROM users WHERE id=? AND token=?"))
                || !$stmt->bind_param("is", $userInfo["user"], $userInfo["token"])
                || !$stmt->execute()) {
                $stmt->close();
                echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
            } else {
                $stmt->bind_result($id);
                $stmt->fetch();
                $stmt->close();

                //check if match
                if (!$id) {
                    echo json_encode(array("valid" => "false"));
                } else {
                    echo json_encode(array("valid" => "true"));
                }
            }
        }
    }
}
?>
