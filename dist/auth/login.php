<?php
function login($creds)
{
    $hasUsername = isset($creds["username"]) && preg_match(USERNAME_PATTERN, $creds["username"]);
    $hasEmail = isset($creds["username"]) && preg_match(EMAIL_PATTERN, $creds["username"]);
    $hasPassword = isset($creds["password"]) && preg_match(PASSWORD_PATTERN, $creds["password"]);

    if ((!$hasUsername && !$hasEmail) or !$hasPassword) {
        echo json_encode(array("invalid" => "credentials"));
    //check credentials
    } else {
        $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
        //if DB connection error
        if ($mysqli->connect_errno) {
            echo json_encode(array("error" => "databaseConnection"));
        } else {
            if ($hasUsername) {
                if (!($stmt = $mysqli->prepare("SELECT id, username, email, password FROM users WHERE username=?"))
                    || !$stmt->bind_param("s", $creds["username"])
                    || !$stmt->execute()) {
                    $stmt->close();
                    echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                } else {
                    $stmt->bind_result($id, $username, $email, $password);
                    $stmt->fetch();
                    $stmt->close();
                    if ($id && password_verify($creds["password"], $password)) {
                        $token = makeToken($username, $email, $password);
                        if (!$mysqli->query("UPDATE users SET token='$token' WHERE id=$id")) {
                            echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                        } else {
                            echo json_encode(array("id" => $id, "username" => $username, "token" => $token));
                        }
                    } else {
                        echo json_encode(array("invalid" => "credentials"));
                    }
                }
            } elseif ($hasEmail) {
                if (!($stmt = $mysqli->prepare("SELECT id, username, email, password FROM users WHERE email=?"))
                    || !$stmt->bind_param("s", $creds["username"])
                    || !$stmt->execute()) {
                    $stmt->close();
                    echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                } else {
                    $stmt->bind_result($id, $username, $email, $password);
                    $stmt->fetch();
                    $stmt->close();
                    if ($id && password_verify($creds["password"], $password)) {
                        $token = makeToken($username, $email, $password);
                        if (!$mysqli->query("UPDATE users SET token='$token' WHERE id=$id")) {
                            echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                        } else {
                            echo json_encode(array("id" => $id, "username" => $username, "token" => $token));
                        }
                    } else {
                        echo json_encode(array("invalid" => "credentials"));
                    }
                }
            }
        }
    }
}
?>
