<?php

namespace Plugins\MyFirstPlugin\Traits;

trait UserEntityTrait{

    /**
     * @ORM\Column(name="some_new_field", type="string", length=255, nullable=true)
     */
    private $someNewField;
    
    /**
     * Get the value of someNewField
     */ 
    public function getSomeNewField()
    {
        return $this->someNewField;
    }

    /**
     * Set the value of someNewField
     *
     * @return  self
     */ 
    public function setSomeNewField($someNewField)
    {
        $this->someNewField = $someNewField;

        return $this;
    }
}