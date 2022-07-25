<?php

namespace Plugins\PluginCanope\Controller;

use User\Entity\User;
use User\Entity\Regular;
use User\Entity\UserPremium;
use User\Entity\ClassroomUser;
use Classroom\Entity\Classroom;
use Classroom\Entity\ClassroomLinkUser;

class ControllerCanope extends Controller
{
    public function __construct($entityManager, $user)
    {
        parent::__construct($entityManager, $user);
        $this->actions = array(
            'save_canope_teacher' => function () {
                // accept only POST request
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') return ["error" => "Method not Allowed"];

                // bind incoming data
                $canopeId = !empty($_POST['id']) ? intval($_POST['id']): null;
                $prenom = !empty($_POST['prenom']) ? htmlspecialchars(strip_tags(trim($_POST['prenom']))):'';
                $nom = !empty($_POST['nom']) ? htmlspecialchars(strip_tags(trim($_POST['nom']))):'';
                $uai = !empty($_POST['uai']) ? htmlspecialchars(strip_tags(trim($_POST['uai']))):'';
                $email = !empty($_POST['email']) ? htmlspecialchars(strip_tags(trim($_POST['email']))):'';

                // get user from user_classroom_users table
                $canopeUserExists = $this->entityManager->getRepository(ClassroomUser::class)->findOneBy(array(
                    'canopeId'=> $canopeId 
                ));

                // user found, return its id
                if($canopeUserExists){
                    return array('userId'=> $canopeUserExists->getId()->getId());
                }

                // no user found, create it
                // create a hashed password
                $hashedPassword = password_hash($this->passwordGenerator(), PASSWORD_BCRYPT);
                $fakeRegularEmail = $this->generateFakeEmailWithPrefix("canope.teacher");

                // create the user to be saved in users table
                $user = new User();
                $user->setFirstname($prenom);
                $user->setSurname($nom);
                $user->setPseudo("$prenom $nom");
                $user->setPassword($hashedPassword);

                // save the user 
                $this->entityManager->persist($user);
                $this->entityManager->flush();

                // create a classroomUser to be saved in user_classroom_users
                $classroomUser = new ClassroomUser($user);
                $classroomUser->setCanopeId($canopeId);
                $classroomUser->setSchoolId($uai);
                $classroomUser->setIsTeacher(true);
                $classroomUser->setMailTeacher($email);
                $this->entityManager->persist($classroomUser);
                $this->entityManager->flush();

                // create a regular user to be saved in user_regulars table and persist it
                $regularUser = new Regular($user, $fakeRegularEmail);
                $regularUser->setActive(true);
                $this->entityManager->persist($regularUser);
                $this->entityManager->flush();

                // create a premiumUser to be stored in user_premium table and persist it
                $userPremium = new UserPremium($user);
                $this->entityManager->persist($userPremium);
                $this->entityManager->flush();

                return array(
                    'userId' => $user->getId()
                );


                dd($_POST);
            },
            'create_and_get_canope_teacher_classroom'=> function(){
                // accept only POST request
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') return ["error" => "Method not Allowed"];

                $teacherId = !empty($_POST['teacherId']) ? intval($_POST['teacherId']) : null;
                $uai = !empty($_POST['teacherId']) ? htmlspecialchars(strip_tags(trim($_POST['teacherId']))) : '';
                // get demoStudent from .env file
                $demoStudent = !empty($this->envVariables['VS_DEMOSTUDENT'])
                ? htmlspecialchars(strip_tags(trim(strtolower($this->envVariables['VS_DEMOSTUDENT']))))
                : 'demostudent';
                
                $teacher = $this->entityManager->getRepository(User::class)->find($teacherId);
                $classroomExists = $this->entityManager->getRepository(ClassroomLinkUser::class)->findOneBy(array(
                    'user'=> $teacher
                ));

                if($classroomExists){
                    return array('classroom'=> $classroomExists->getClassroom());
                }

                // classroom does not exists, create it
                 // create the classroom
                 $uniqueLink = $this->generateUniqueClassroomLink();
                 $classroom = new Classroom('Classe test');
                 $classroom->setUai($uai);
                 $classroom->setLink($uniqueLink);
                 $this->entityManager->persist($classroom);
                 $this->entityManager->flush();
                 $classroom->getId();

                 // add the teacher to the classroom with teacher rights=2
                 $classroomLinkUser = new ClassroomLinkUser($teacher, $classroom, 2);
                 $this->entityManager->persist($classroomLinkUser);
                 $this->entityManager->flush();

                 // create default demoStudent user (required for the dashboard to work properly)
                 $password = $this->passwordGenerator();
                 $user = new User();
                 $user->setFirstname("élève");
                 $user->setSurname("modèl");
                 $user->setPseudo($demoStudent);
                 $user->setPassword(password_hash($password, PASSWORD_DEFAULT));

                 // persist and save demoStudent user in users table
                 $this->entityManager->persist($user);
                 $this->entityManager->flush();

                 // add the demoStudent user to the classroom with students rights=0 (classroom_users_link_classrooms table)
                 $classroomLinkUser = new ClassroomLinkUser($user, $classroom, 0);
                 $this->entityManager->persist($classroomLinkUser);
                 $this->entityManager->flush();

                 return array('classroom'=> $classroom);
            }
        );
    }

    private function generateUniqueClassroomLink(){
        $alphaNums = "abcdefghijklmnopqrstuvwxyz0123456789";
        do{
            $link = "";
            
            for ($i = 0; $i < 5; $i++) {
                $link .= substr($alphaNums, rand(0, 35), 1);
            }

            $classroomByLinkFound = $this->entityManager
                ->getRepository(Classroom::class)
                ->findOneByLink($link);
        }
        while($classroomByLinkFound);

        return $link;
    }
    
    /**
     * generate fake email for gar users
     * as the email is optional but mandatory for saving a Regular user
     *
     * @param string $prefix
     * @return string
     */
    private function generateFakeEmailWithPrefix($prefix){
        
        // generate the new password and check if a record exists in db with these credentials
        do {
           $email = $prefix.'.'.$this->passwordGenerator()."@gmail.com";
           $emailExists = $this->entityManager
               ->getRepository(Regular::class)
               ->findOneBy(array(
                   'email' => $email
               ));
       }
       // continue as long as the passwords match and a record exists in db
       while ($emailExists);

       return $email;
   }

    private function passwordGenerator()
    {
        $password = '';
        for ($i = 0; $i < 4; $i++) {
            $password .= rand(0, 9);
        }
        return $password;
    }
}
