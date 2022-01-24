<?php

namespace Plugins\MyFirstPlugin\Controller;

use Dotenv\Dotenv;

class Controller
{
    protected $actions = [];
    protected $entityManager;
    protected $user;
    
    protected function __construct($entityManager, $user)
    {
        // load .env variables (optional)
        $dotenv = Dotenv::createImmutable(__DIR__."/../");
        $dotenv->safeLoad();
        $this->envVariables = $_ENV;

        // bind $entityManager and $user coming from routin/Routing.php
        $this->entityManager = $entityManager;
        $this->user = $user;
    }

    public function action($action, $data = [])
    {
        return call_user_func($this->actions[$action], $data);
    }
}
