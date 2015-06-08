<?php
date_default_timezone_set("UTC");
// include "devSecrets.php";
include "secrets.php";
include "patterns.php";

include "auth/checkAuth.php";
include "auth/checkValue.php";
include "auth/create.php";
include "auth/login.php";
include "auth/logout.php";
include "auth/token.php";
header("Content-type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_POST["action"])) {
        echo json_encode(array("required" => "action"));
    } elseif ($_POST["action"] === "create") {
        createUser($_POST);
    } elseif ($_POST["action"] === "login") {
        login($_POST);
    } elseif ($_POST["action"] === "logout") {
        logout($_POST);
    } elseif ($_POST["action"] === "checkAuth") {
        checkAuth($_POST);
    } else {
        echo json_encode(array("invalid" => "request"));
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (!isset($_GET["action"])) {
        echo json_encode(array("required" => "action"));
    } elseif ($_GET["action"] === "checkValue") {
        checkValue($_GET);
    } else {
        echo json_encode(array("invalid" => "request"));
    }
} else {
    echo json_encode(array("invalid" => "request"));
}
?>
