<?php
function deletePerch($perchInfo) {
    // need owner (id) and perch (id) (and token, authed by caller)
    if (!isset($perchInfo["owner"])) {
        echo json_encode(array("required" => "owner"));
    } elseif (!preg_match(ID_PATTERN, $perchInfo["owner"])) {
        echo json_encode(array("invalid" => "ownerFormat"));
    } elseif (!isset($perchInfo["perch"])) {
        echo json_encode(array("required" => "perch"));
    } elseif (!preg_match(ID_PATTERN, $perchInfo["perch"])) {
        echo json_encode(array("invalid" => "perchFormat"));
    } else {
        $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
        //if DB connection error
        if ($mysqli->connect_errno) {
            echo json_encode(array("error" => "databaseConnection"));
        } else {
            //get user
            if (!($stmt = $mysqli->prepare("SELECT id FROM users WHERE id=? AND token=?"))
                || !$stmt->bind_param("is", $perchInfo["owner"], $perchInfo["token"])
                || !$stmt->execute()) {
                $stmt->close();
                echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
            } else {
                $stmt->bind_result($id);
                $stmt->fetch();
                $stmt->close();

                //check if auth
                if (!$id) {
                    echo json_encode(array("error" => "authentication"));
                } else {
                    //remove perch
                    if (!($stmt = $mysqli->prepare("DELETE FROM perches WHERE ownerId=$id AND id=?"))
                        || !$stmt->bind_param("i", $perchInfo["perch"])
                        || !$stmt->execute()) {
                        echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                    } else {
                        echo json_encode(array("deleted" => true));
                    }
                    $stmt->close();
                }
            }
        }
    }
}
?>
