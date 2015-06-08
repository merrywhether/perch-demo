<?php
date_default_timezone_set("UTC");
// include "devSecrets.php";
include "secrets.php";
include "patterns.php";

include "perches/changeAvail.php";
include "perches/changeBooking.php";
include "perches/create.php";
include "perches/delete.php";
include "perches/getAvail.php";
include "perches/getBookings.php";
header("Content-type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_POST["action"])) {
        echo json_encode(array("required" => "action"));
    } elseif (!isset($_POST["token"])) {
        echo json_encode(array("required" => "token"));
    } elseif ($_POST["action"] === "createPerch") {
        createPerch($_POST);
    } elseif ($_POST["action"] === "deletePerch") {
        deletePerch($_POST);
    } elseif ($_POST["action"] === "addAvail") {
        changeAvail($_POST, "add");
    } elseif ($_POST["action"] === "deleteAvail") {
        changeAvail($_POST, "delete");
    } elseif ($_POST["action"] === "addBooking") {
        changeBooking($_POST, "add");
    } elseif ($_POST["action"] === "cancelBooking") {
        changeBooking($_POST, "cancel");
    } elseif ($_POST["action"] === "deleteBooking") {
        changeBooking($_POST, "delete");
    } elseif ($_POST["action"] === "userBookings") {
        getBookings($_POST, "user");
    } elseif ($_POST["action"] === "ownerBookings") {
        getBookings($_POST, "owner");
    } elseif ($_POST["action"] === "perchBookings") {
        getBookings($_POST, "perch");
    } else {
        echo json_encode(array("invalid" => "request"));
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (!isset($_GET["action"])) {
        echo json_encode(array("required" => "action"));
    } elseif ($_GET["action"] === "getAllAvail") {
        getAvail(null);
    } elseif ($_GET["action"] === "getAvail") {
        if (!isset($_GET["perch"])) {
            echo json_encode(array("required" => "perch"));
        } else {
            getAvail($_GET["perch"]);
        }
    } else {
        echo json_encode(array("invalid" => "request"));
    }
} else {
    echo json_encode(array("invalid" => "request"));
}

?>
