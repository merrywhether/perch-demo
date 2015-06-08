<?php
function createUser($userInfo)
{
    if (!isset($userInfo["username"])) {
        echo json_encode(array("required" => "username", "info" => $userInfo));
    } elseif (!preg_match(USERNAME_PATTERN, $userInfo["username"])) {
        echo json_encode(array("invalid" => "usernameFormat"));
    } elseif (!isset($userInfo["email"])) {
        echo json_encode(array("required" => "email"));
    } elseif (!preg_match(EMAIL_PATTERN, $userInfo["email"])) {
        echo json_encode(array("invalid" => "emailFormat"));
    } elseif (!isset($userInfo["password1"]) || !isset($userInfo["password2"])) {
        echo json_encode(array("required" => "passwords"));
    } elseif ($userInfo["password1"] !== $userInfo["password2"]) {
        echo json_encode(array("invalid" => "passwordMatch"));
    } elseif (!preg_match(PASSWORD_PATTERN, $userInfo["password1"])) {
        echo json_encode(array("invalid" => "passwordFormat"));
    } else {
        $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
        //if DB connection error
        if ($mysqli->connect_errno) {
            echo json_encode(array("error" => "databaseConnection"));
        } else {
            $password = password_hash($userInfo["password1"], PASSWORD_DEFAULT);
            $token = makeToken($userInfo["username"], $userInfo["email"], $userInfo["password1"]);
            if (!($stmt = $mysqli->prepare("INSERT INTO users (username, email, password, token) VALUES (?, ?, ?, ?)"))
                || !$stmt->bind_param("ssss", $userInfo["username"], $userInfo["email"], $password, $token)
                || !$stmt->execute()) {
                if ($stmt->errno == 1062) {
                    echo json_encode(array("error" => "duplicate"));
                } else {
                    echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                }
            } else {
                echo json_encode(array("id" => $stmt->insert_id, "username" => $userInfo["username"], "token" => $token));
            }
            $stmt->close();
        }
    }
}
?>
