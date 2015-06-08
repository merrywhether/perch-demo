<?php
function changeBooking($bookInfo, $action) {
    // need user (id), perch (id), and date (and token, enforced by caller)
    if (!isset($bookInfo["user"])) {
        echo json_encode(array("required" => "user"));
    } elseif (!preg_match(ID_PATTERN, $bookInfo["user"])) {
        echo json_encode(array("invalid" => "userFormat"));
    } elseif (!isset($bookInfo["perch"])) {
        echo json_encode(array("required" => "perch"));
    } elseif (!preg_match(ID_PATTERN, $bookInfo["perch"])) {
        echo json_encode(array("invalid" => "perchFormat"));
    } elseif (!isset($bookInfo["date"])) {
        echo json_encode(array("required" => "date"));
    } elseif (!preg_match(DATE_PATTERN, $bookInfo["date"])) {
        echo json_encode(array("invalid" => "dateFormat"));
    } else {
        $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
        //if DB connection error
        if ($mysqli->connect_errno) {
            echo json_encode(array("error" => "databaseConnection"));
        } else {
            //get user
            if (!($stmt = $mysqli->prepare("SELECT id FROM users WHERE id=? AND token=?"))
                || !$stmt->bind_param("is", $bookInfo["user"], $bookInfo["token"])
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
                    if ($action == "add") {
                        //make sure date is available
                        if (!($stmt = $mysqli->prepare("SELECT perchId, id, availDate FROM available WHERE perchId=? AND availDate=?"))
                            || !$stmt->bind_param("is", $bookInfo["perch"], $bookInfo["date"])
                            || !$stmt->execute()) {
                            $stmt->close();
                            echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                        } else {
                            $stmt->bind_result($perchId, $availId, $date);
                            $stmt->fetch();
                            $stmt->close();

                            //if no ID, then date isn't available
                            if (!$perchId) {
                                echo json_encode(array("unavailable" => "date"));
                            } else {
                                //make booking
                                if (!$mysqli->query("INSERT INTO bookings (perchId, userId, bookDate) VALUES ($perchId, $userId, '$date')")) {
                                    if ($mysqli->errno == 1062) {
                                        echo json_encode(array("error" => "duplicate"));
                                    } else {
                                        echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                                    }
                                } else {
                                    //delete available
                                    if (!$mysqli->query("DELETE FROM available WHERE id=$availId")) {
                                        echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                                    } else {
                                        echo json_encode(array("booked" => "true"));
                                    }
                                }
                            }
                        }
                    } elseif ($action == "cancel") {
                        //find booking
                        if (!($stmt = $mysqli->prepare("SELECT perchId, id, bookDate FROM bookings WHERE perchId=? AND bookDate=? AND userId=$userId"))
                            || !$stmt->bind_param("is", $bookInfo["perch"], $bookInfo["date"])
                            || !$stmt->execute()) {
                            $stmt->close();
                            echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                        } else {
                            $stmt->bind_result($perchId, $bookId, $date);
                            $stmt->fetch();
                            $stmt->close();

                            //if no ID, then booking doesn't exist
                            if (!$perchId) {
                                echo json_encode(array("unavailable" => "booking"));
                            } else {
                                //delete booking
                                if (!$mysqli->query("DELETE FROM bookings WHERE id=$bookId")) {
                                    echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                                } else {
                                    //recreate available
                                    if (!$mysqli->query("INSERT INTO available (perchId, availDate) VALUES ($perchId, '$date')")) {
                                        echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                                    } else {
                                        echo json_encode(array("cancelled" => "true"));
                                    }
                                }
                            }
                        }
                    } elseif ($action == "delete") {
                        //owners can delete bookings without recreating (because reasons?)
                        //find booking using ownerId as auth
                        if (!($stmt = $mysqli->prepare("SELECT bookings.id FROM bookings JOIN perches ON bookings.perchId = perches.id WHERE perches.id=? AND bookings.bookDate=? AND perches.ownerId=$userId"))
                            || !$stmt->bind_param("is", $bookInfo["perch"], $bookInfo["date"])
                            || !$stmt->execute()) {
                            $stmt->close();
                            echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                        } else {
                            $stmt->bind_result($bookId);
                            $stmt->fetch();
                            $stmt->close();

                            //if not id, then doesn't exist or not authorized
                            if (!$bookId) {
                                echo json_encode(array("unavailable" => "booking"));
                            } else {
                                //delete booking
                                if (!$mysqli->query("DELETE FROM bookings WHERE id=$bookId")) {
                                    echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
                                } else {
                                    echo json_encode(array("deleted" => "true"));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
?>
