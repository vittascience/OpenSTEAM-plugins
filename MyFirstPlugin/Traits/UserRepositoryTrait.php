<?php

namespace Plugins\MyFirstPlugin\Traits;

use User\Entity\User;

trait UserRepositoryTrait{
    
    public function retrieveUserUsingARepositoryTraitWithACustomMethod($userId){
        
        $user = $this->getEntityManager()
                ->createQueryBuilder()
                ->select('u')
                ->from(User::class,'u')
                ->where('u.id = :userId')
                ->setParameters(array(
                    'userId' => $userId
                ))
                ->getQuery()
                ->getOneOrNullResult();
        return $user;
    }
}