<?php
function getAvail($perchId) {
    $mysqli = new mysqli(DBHOST, DBUSER, DBPASS, DBNAME);
    //if DB connection error
    if ($mysqli->connect_errno) {
        echo json_encode(array("error" => "databaseConnection"));
    } else {
        if ($perchId) {
            if (!preg_match(ID_PATTERN, $perchId)) {
                echo json_encode(array("invalid" => "perchFormat"));
            } else {
                if (!($stmt = $mysqli->prepare("SELECT perches.id, perches.perchName, perches.address, available.availDate FROM available JOIN perches ON perches.id = available.perchId WHERE available.perchId = ? ORDER BY available.availDate ASC"))
                    || !$stmt->bind_param("i", $perchId)
                    || !$stmt->execute()) {
                    echo json_encode(array("error" => "PHP/MySQL: $stmt->error"));
                } else {
                    $dates = array();
                    $stmt->bind_result($id, $name, $address, $date);
                    while ($stmt->fetch()) {
                        $dates[] = array("id" => $id, "name" => $name, "address" => $address, "date" => $date);
                    }
                    echo json_encode(array("dates" => $dates));
                }
                $stmt->close();
            }
        } else {
            if (!$res = $mysqli->query("SELECT perches.id, perches.perchName, perches.address, available.availDate FROM available JOIN perches ON perches.id = available.perchId ORDER BY available.availDate ASC")) {
                echo json_encode(array("error" => "PHP/MySQL: $mysqli->error"));
            } else {
                $dates = array();
                $res->fetch_all();
                foreach ($res as $data) {
                    $dates[] = array("id" => $data["id"], "name" => $data["perchName"], "address" => $data["address"], "date" => $data["availDate"]);
                }
                echo json_encode(array("dates" => $dates));
            }
            $res->close();
        }
    }
}
?>
