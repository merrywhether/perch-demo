<?php
function createPerch($perchInfo) {
    // need owner (id), perch (name), and address (and token, authed by caller)
    if (!isset($perchInfo["owner"])) {
        echo json_encode(array("required" => "owner"));
    } elseif (!preg_match(ID_PATTERN, $perchInfo["owner"])) {
        echo json_encode(array("invalid" => "ownerFormat"));
    } elseif (!isset($perchInfo["perch"])) {
        echo json_encode(array("required" => "perch"));
    } elseif (!preg_match(PERCH_PATTERN, $perchInfo["perch"])) {
        echo json_encode(array("invalid" => "perchFormat"));
    } elseif (!isset($perchInfo["address"])) {
        echo json_encode(array("required" => "address"));
    } elseif (!preg_match(PERCH_PATTERN, $perchInfo["address"])) {
        echo json_encode(array("invalid" => "addressFormat"));
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
                    //add perch
                    if (!($stmt = $mysqli->prepare("INSERT INTO perches (perchName, address, ownerId) VALUES (?, ?, $id)"))
                        || !$stmt->bind_param("ss", $perchInfo["perch"], $perchInfo["address"])
                        || !$stmt->execute()) {
                        if ($stmt->errno == 1062) {
                            echo json_encode(array("error" => "duplicate"));
                        } else {
                            echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                        }
                    } else {
                        echo json_encode(array("added" => true, "id" => $stmt->insert_id));
                    }
                    $stmt->close();
                }
            }
        }
    }
}
?>
