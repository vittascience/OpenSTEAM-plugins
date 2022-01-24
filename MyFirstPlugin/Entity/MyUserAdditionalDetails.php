<?php

namespace Plugins\MyFirstPlugin\Entity;

use User\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Plugins\MyFirstPlugin\Repository\MyUserAdditionalDetailsRepository;

/**
 * @ORM\Entity(repositoryClass=MyUserAdditionalDetailsRepository::class)
 * @ORM\Table(name="user_additional_details")
 */
class MyUserAdditionalDetails {

    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     *
     * @var integer
     */
    private $id;

    /**
     * @ORM\OneToOne(targetEntity="User\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     *
     * @var User
     */
    private $user;

    /**
     * @ORM\Column(name="phone_number",type="string",length=255, nullable=true)
     *
     * @var string
     */
    private $phoneNumber;

    /**
     * Get the value of id
     *
     * @return  integer
     */ 
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get the value of user
     *
     * @return  User
     */ 
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set the value of user
     *
     * @param  User  $user
     *
     * @return  self
     */ 
    public function setUser($user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get the value of phoneNumber
     *
     * @return  string
     */ 
    public function getPhoneNumber()
    {
        return $this->phoneNumber;
    }

    /**
     * Set the value of phoneNumber
     *
     * @param  string  $phoneNumber
     *
     * @return  self
     */ 
    public function setPhoneNumber(string $phoneNumber)
    {
        $this->phoneNumber = $phoneNumber;

        return $this;
    }
}