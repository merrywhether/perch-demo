<?php
function makeToken($username, $email, $password) {
    return hash("sha256", $username . $email . $password . date(DATE_ISO8601));
}
?>
