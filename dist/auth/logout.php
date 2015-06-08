<?php
function logout($creds)
{
    if (!isset($creds["id"])) {
        echo json_encode(array("required" => "id"));
    } elseif (!isset($creds["token"])) {
        echo json_encode(array("required" => "token"));
    } else {
        $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
        //if DB connection error
        if ($mysqli->connect_errno) {
            echo json_encode(array("error" => "databaseConnection"));
        } else {
            if (!($stmt = $mysqli->prepare("UPDATE users SET token=NULL WHERE id=? AND token=?"))
                || !$stmt->bind_param("is", $creds["id"], $creds["token"])
                || !$stmt->execute()) {
                echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
            } else {
              echo json_encode(array("logout" => true));
              $stmt->close();
            }
        }
    }
}
?>
