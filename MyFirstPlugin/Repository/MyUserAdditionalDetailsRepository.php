<?php

namespace Plugins\MyFirstPlugin\Repository;

use Doctrine\ORM\EntityRepository;
use Plugins\MyFirstPlugin\Entity\MyUserAdditionalDetails;
use User\Entity\Regular;
use User\Entity\User;

class MyUserAdditionalDetailsRepository extends EntityRepository{
    public function retrieveUserWithLimitedFields($userId){
        $user = $this->getEntityManager()
                        ->createQueryBuilder()
                        ->select('muad.phoneNumber,u.firstname,r.email')
                        ->from(MyUserAdditionalDetails::class,'muad')
                        ->join(User::class,'u','WITH','muad.user=u.id')
                        ->join(Regular::class,'r','WITH','r.user = :userId')
                        ->where('muad.user = :userId')
                        ->setParameters(array(
                            'userId'=>$userId
                        ))
                        ->getQuery()
                        ->getOneOrNullResult();
        
        return $user;
    }
}