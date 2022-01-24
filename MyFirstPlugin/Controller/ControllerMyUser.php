<?php

namespace Plugins\MyFirstPlugin\Controller;

use User\Entity\User;
use User\Controller\ControllerUser;
use Utils\DoctrineSchemaUpdater;

class ControllerMyUser extends ControllerUser
{
	public function __construct($entityManager, $user)
	{
		parent::__construct($entityManager, $user);

		// overwrite generate_classroom_user_password 
		$this->actions['generate_classroom_user_password'] = function(){
			
			// do some incoming data binding

			// do some things with incoming data

			// return some data 
            return array('msg'=> 'je viens du controller myControllerUser methode generate_classroom_user_password');
        };

		// overwrite get_student_password
		$this->actions['get_student_password'] = function(){

            return array('msg'=> 'je viens du controller myControllerUser methode get_student_password');
        };

		// define a new method that does not exists in vendor/vtuser/.../ControllerUser.php
		$this->actions['update_user_entity_using_a_trait_and_doctrine_schema_updater_class'] = function(){
			/**
			 * 1/ we create a Trait (ie. UserEntityTrait.php in Traits=>UserEntityTrait.php)
			 * 2/ we add the related use statement inside the User entity just after the opening curl brace (use UserEntityTrait;)
			 * in vendor=>vittascience=>src=>Entity=>User.php
			 */
			// initialize the updater vtutils=>src=>DoctrineSchemaUpdater.php
			$schemaUpdater = new DoctrineSchemaUpdater();

			// add 1 or more entities using a valid format like below format
			$schemaUpdater->setEntityArray(array(
				User::class
			));

			/**
			 * 3/ now you can run the command below to display the Sql queries 
			 * which will be execute during the step 4
			 * comment/remove the line below once you want to run the sql queries
			 */
			$schemaUpdater->displaySql();

			/**
			 * 4/ now that you saw the Sql queries and want to run them
			 * uncomment the line below
			 */
			//$schemaUpdater->runSqlToUpdate();
			
		};

		$this->actions['insert_some_new_field_in_user_table'] = function(){

			// sanitize incoming data and retrieve the user with it
			$userId = intval($_POST['id']);
			$user = $this->entityManager->getRepository(User::class)->find($userId);
			
			// update user field(s), persist and save it in db
			$user->setSomeNewField('some new data');
			$this->entityManager->persist($user);
			$this->entityManager->flush();
		};

		$this->actions['retrieve_user_with_custom_query_from_repository_trait'] = function(){
			
			// bind and sanitize incoming data
			$userId = intval($_POST['id']);

			/**
			 * 1/ create a UserRepositoryTrait in Traits folder (Traits=>UserRepositoryTrait.php)
			 * 2/ add the use statement just after the opening curly brace (use UserRepositoryTrait;)
			 * in vtuser=>src=>Repository=>UserRepository.php
			 * 3/ create the code below to retrieve user data using a custom doctrine query
			 */

			 // get data from db
			$updatedUser = $this->entityManager
							->getRepository(User::class)
							->retrieveUserUsingARepositoryTraitWithACustomMethod($userId);

			return array(
				'user' => array(
					'id'=> $updatedUser->getId(),
					'name' => $updatedUser->getFirstname(),
					'someNewField' => $updatedUser->getSomeNewField()
				)
			);
		};
	}

	
}