<?php

error_reporting(E_ALL);
ini_set('error_reporting', -1);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 0);
ini_set('report_memleaks', 1);
ini_set('date.timezone', 'Europe/Paris');
chdir('/src');

require './vendor/autoload.php';

use ApiPlatform\Playground\Kernel;
use Symfony\Component\HttpFoundation\Request;

$app = function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG'], "use-doctrine-orm-filters");
};

$runtime = $_SERVER['APP_RUNTIME'] ?? $_ENV['APP_RUNTIME'] ?? 'Symfony\\Component\\Runtime\\SymfonyRuntime';
$runtime = new $runtime(['disable_dotenv']);
[$app, $args] = $runtime
    ->getResolver($app)
    ->resolve();

$app = $app(...$args);
$app->executeMigrations();
$app->loadFixtures();
$app->request(Request::create('/docs.jsonld'));
// $app->request();
