<?php
function getBookings($info, $action) {
    // need user (id) and optional perch (id) (and token, enforced by caller)
    if (!isset($info["user"])) {
        echo json_encode(array("required" => "user"));
    } elseif (!preg_match(ID_PATTERN, $info["user"])) {
        echo json_encode(array("invalid" => "userFormat"));
    } elseif (isset($info["perch"]) && !preg_match(ID_PATTERN, $info["perch"])) {
        echo json_encode(array("invalid" => "perchFormat"));
    } else {
        $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
        //if DB connection error
        if ($mysqli->connect_errno) {
            echo json_encode(array("error" => "databaseConnection"));
        } else {
            //get user
            if (!($stmt = $mysqli->prepare("SELECT id FROM users WHERE id=? AND token=?"))
                || !$stmt->bind_param("is", $info["user"], $info["token"])
                || !$stmt->execute()) {
                $stmt->close();
                echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
            } else {
                $stmt->bind_result($userId);
                $stmt->fetch();
                $stmt->close();

                //check if auth
                if (!$userId) {
                    echo json_encode(array("error" => "authentication"));
                } else {
                    if ($action == "user") {
                        if (!$res = $mysqli->query("SELECT perches.id, perches.perchName, perches.address, bookings.bookDate FROM bookings JOIN perches ON bookings.perchId = perches.id WHERE bookings.userId=$userId")) {
                            echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                        } else {
                            $bookings = array();
                            $res->fetch_all();
                            foreach ($res as $data) {
                                $bookings[] = array("perchId" => $data["id"], "name" => $data["perchName"], "address" => $data["address"], "date" => $data["bookDate"]);
                            }
                            echo json_encode(array("dates" => $bookings));
                        }
                    } elseif ($action == "owner") {
                        $perches = array();
                        $avail = array();
                        $bookings = array();

                        if (!$res = $mysqli->query("SELECT id, perchName, address FROM perches WHERE ownerId=$userId")) {
                            echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                        } else {
                            $res->fetch_all();
                            foreach ($res as $data) {
                                $perches[] = array("id" => $data["id"], "name" => $data["perchName"], "address" => $data["address"]);
                            }
                        }


                        if (!$res = $mysqli->query("SELECT perches.id, perches.perchName, perches.address, available.availDate FROM available JOIN perches ON available.perchId = perches.id WHERE perches.ownerId=$userId")) {
                            echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                        } else {
                            $res->fetch_all();
                            foreach ($res as $data) {
                                $avail[] = array("id" => $data["id"], "name" => $data["perchName"], "address" => $data["address"], "availDate" => $data["availDate"]);
                            }
                            $res->close();
                        }


                        if (!$res = $mysqli->query("SELECT perches.id, perches.perchName, perches.address, bookings.bookDate FROM bookings JOIN perches ON bookings.perchId = perches.id WHERE perches.ownerId=$userId")) {
                            echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                        } else {
                            $res->fetch_all();
                            foreach ($res as $data) {
                                $bookings[] = array("id" => $data["id"], "name" => $data["perchName"], "address" => $data["address"], "bookDate" => $data["bookDate"]);
                            }
                            $res->close();
                        }



                        echo json_encode(array("perches" => $perches, "avail" => $avail, "bookings" => $bookings));

                    } elseif ($action == "perch") {
                        if (!($stmt = $mysqli->prepare("SELECT id, perchName, address FROM perches WHERE ownerId=$userId AND id=?"))
                            || !$stmt->bind_param("i", $info["perch"])
                            || !$stmt->execute()) {
                            $stmt->close();
                            echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                        } else {
                            $stmt->bind_result($id, $name, $address);
                            $stmt->fetch();
                            $stmt->close();

                            if (!$id) {
                                echo json_encode(array("error" => "notOwner"));
                            } else {
                                $avail = array();
                                $bookings = array();
                                if (!$res = $mysqli->query("SELECT availDate FROM available WHERE perchId = $id")) {
                                    echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                                } else {
                                    $res->fetch_all();
                                    foreach ($res as $availDate) {
                                        $avail[] = array("date" => $availDate["availDate"], "perchId" => $id);
                                    }
                                    $res->close();
                                }
                                if (!$res = $mysqli->query("SELECT bookDate FROM bookings WHERE perchId = $id")) {
                                    echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                                } else {
                                    $res->fetch_all();
                                    foreach ($res as $bookDate) {
                                        $bookings[] = array("date" => $bookDate["bookDate"], "perchId" => $id);
                                    }
                                    $res->close();
                                }
                                echo json_encode(array("id" => $id, "name" => $name, "address" => $address, "availDates" => $avail, "bookDates" => $bookings));
                            }
                        }
                    }
                }
            }
        }
    }
}
?>
