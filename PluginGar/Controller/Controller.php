<?php

namespace Plugins\PluginGar\Controller;

use Dotenv\Dotenv;
use GuzzleHttp\Client;
use SimpleXMLElement;

class Controller
{
    protected $actions = [];
    protected $entityManager;
    protected $user;


    public function __construct($entityManager, $user)
    {
        $dotenv = Dotenv::createImmutable(__DIR__ . "/../");
        $dotenv->safeLoad();
        $this->envVariables = $_ENV;
        $this->entityManager = $entityManager;
        $this->user = $user;
    }

    public function action($action, $data = [])
    {
        return call_user_func($this->actions[$action], $data);
    }
}
