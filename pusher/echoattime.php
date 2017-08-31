<?php
//initial connection config
$config = [ 'redis' =>
	[ 'host' => 'moonactive.pnhgpb.0001.usw2.cache.amazonaws.com', 'port' => 6379 ]];

$response = array('status' => 'failure', 'reason' => 'unknown');


if (isset($_GET) && isset($_GET['time']) && $_GET['time'] && isset($_GET['message']) && $_GET['message'])
{
	if ((intval($_GET['time']) > time())) //validating time
	{
		//connecting to the queue
	    $redis = new Redis();
	    $redis->pconnect($config['redis']['host'], $config['redis']['port']);

	    //message format:
	    //key: echo.timestamp
	    //value: message
	    $redis->rPush('echo.' . $_GET['time'], $_GET['message']);

	    //job-is-done exit point
	    $response = array('status' => 'success');
    }
    else
    	$response = array('status' => 'failure', 'reason' => 'incorrect time');
}
else
	$response = array('status' => 'failure', 'reason' => 'incorrect format');

echo json_encode($response);
exit();

?>