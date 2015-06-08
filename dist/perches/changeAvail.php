<?php
function changeAvail($availInfo, $action) {
    // need owner (id), perch (id), and date (and token, enforced by caller)
    if (!isset($availInfo["owner"])) {
        echo json_encode(array("required" => "owner"));
    } elseif (!preg_match(ID_PATTERN, $availInfo["owner"])) {
        echo json_encode(array("invalid" => "ownerFormat"));
    } elseif (!isset($availInfo["perch"])) {
        echo json_encode(array("required" => "perch"));
    } elseif (!preg_match(ID_PATTERN, $availInfo["perch"])) {
        echo json_encode(array("invalid" => "perchFormat"));
    } elseif (!isset($availInfo["date"])) {
        echo json_encode(array("required" => "date"));
    } elseif (!preg_match(DATE_PATTERN, $availInfo["date"])) {
        echo json_encode(array("invalid" => "dateFormat"));
    } else {
        $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
        //if DB connection error
        if ($mysqli->connect_errno) {
            echo json_encode(array("error" => "databaseConnection"));
        } else {
            //get perchId tied to owner
            if (!($stmt = $mysqli->prepare("SELECT perches.id FROM perches JOIN users ON perches.ownerId = users.id WHERE users.id = ? AND users.token = ? AND perches.id = ?"))
                || !$stmt->bind_param("isi", $availInfo["owner"], $availInfo["token"], $availInfo["perch"])
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
                    if ($action == "add") {
                        //add avail
                        if (!($stmt = $mysqli->prepare("INSERT INTO available (perchId, availDate) VALUES ($id, ?)"))
                            || !$stmt->bind_param("s", $availInfo["date"])
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
                    } elseif ($action == "delete") {
                        //remove avail
                        if (!($stmt = $mysqli->prepare("DELETE FROM available WHERE perchId=$id AND availDate=?"))
                            || !$stmt->bind_param("s", $availInfo["date"])
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
}
?>
