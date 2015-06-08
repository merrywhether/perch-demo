<?php
function checkValue($info)
{
    if (isset($info["username"])) {
        if (!preg_match(USERNAME_PATTERN, $info["username"])) {
            echo json_encode(array("invalid" => "usernameFormat"));
        } else {
            $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
            //if DB connection error
            if ($mysqli->connect_errno) {
                echo json_encode(array("error" => "databaseConnection"));
            } else {
                if (!($stmt = $mysqli->prepare("SELECT COUNT(id) FROM users WHERE username=?"))
                    || !$stmt->bind_param("s", $info["username"])
                    || !$stmt->execute()) {
                    echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                } else {
                    $stmt->bind_result($count);
                    $stmt->fetch();
                    if ($count === 0) {
                        echo json_encode(array("available" => true));
                    } else {
                        echo json_encode(array("available" => false));
                    }
                }
                $stmt->close();
            }
        }
    } else if (isset($info["email"])) {
        if (!preg_match(EMAIL_PATTERN, $info["email"])) {
            echo json_encode(array("invalid" => "emailFormat"));
        } else {
            $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
            //if DB connection error
            if ($mysqli->connect_errno) {
                echo json_encode(array("error" => "databaseConnection"));
            } else {
                if (!($stmt = $mysqli->prepare("SELECT COUNT(id) FROM users WHERE email=?"))
                    || !$stmt->bind_param("s", $info["email"])
                    || !$stmt->execute()) {
                    echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                } else {
                    $stmt->bind_result($count);
                    $stmt->fetch();
                    if ($count === 0) {
                        echo json_encode(array("available" => true));
                    } else {
                        echo json_encode(array("available" => false));
                    }
                }
                $stmt->close();
            }
        }
    } else {
        echo json_encode(array("invalid" => "request"));
    }
}
?>
