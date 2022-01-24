<?php

namespace Plugins\MyFirstPlugin\Controller;

use Plugins\MyFirstPlugin\Entity\MyUserAdditionalDetails;
use User\Entity\User;
use Utils\DoctrineSchemaUpdater;

class ControllerMyUserAdditionalDetails extends Controller{

    public function __construct($entityManager, $user){
        parent::__construct($entityManager, $user);

        $this->actions['generate_database_table'] = function(){

            /**
             * 1/ create an entity in Entity folder (ex: MyUserAdditionalDetails.php)
             * 2/ add doctrine annotations for properties and associations
             * 3/ create the code below to display or update your db
             */
            // initialize the schemaUpdater
            $schemaUpdater = new DoctrineSchemaUpdater;

            // add entities 
            $schemaUpdater->setEntityArray(array(
                MyUserAdditionalDetails::class
            ));

            // display sql queries
            $schemaUpdater->displaySql();

            // run sql queries to generate the new table in db from MyUserAdditionalDetails  entity
            //$schemaUpdater->runSqlToUpdate();
            return array('msg'=> 'done'); 
        };

        $this->actions['fill_db_with_data'] = function(){

            // Once your new table created, you can fill it with data like below
            // the user by its ID
            $user = $this->entityManager->getRepository(User::class)->find(5716);

            // create $userAdditionalDetails and fill it with data
            $userAdditionalDetails = new MyUserAdditionalDetails;
            $userAdditionalDetails->setUser($user);
            $userAdditionalDetails->setPhoneNumber('01 02 03 04 05');

            // persist and save data in db
            $this->entityManager->persist($userAdditionalDetails);
            $this->entityManager->flush();

            // dd()=> dump and die Or dump() methods allows you to display your data using symfony var_dumper 
            dd($userAdditionalDetails);

        };

        $this->actions['custom_doctrine_query_on_my_user_additional_details_using_the_repository'] = function(){

            // bind and sanitize incoming data
            $userId = intval($_POST['id']);

            // retrieve data from db using a custom repository method located in Repository=>MyUserAdditionalDetailsRepository.php
            $userWithCustomDoctrineQuery = $this->entityManager->getRepository(MyUserAdditionalDetails::class)->retrieveUserWithLimitedFields($userId);

            //dd($userWithCustomDoctrineQuery);
            return array(
                'user'=> $userWithCustomDoctrineQuery
            );
        };
    }
   
}