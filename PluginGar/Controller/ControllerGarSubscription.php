<?php

namespace Plugins\PluginGar\Controller;

use Dotenv\Dotenv;
use GuzzleHttp\Client;
use SimpleXMLElement;

class ControllerGarSubscription extends Controller
{
    protected $actions = [];
    protected $entityManager;
    protected $user;
    private $garBaseUrl;
    private $client;


    public function __construct($entityManager, $user)
    {
        parent::__construct($entityManager, $user);
        $this->client = new Client();
        $this->garBaseUrl = 'https://abonnement.gar.education.fr';
        $this->actions = array(
            'get_subscription_list' => function () {
                $currentPage = intval($_POST['current_page']);
                $perPage = intval($_POST['per_page']);

                $startIndex =(($currentPage -1) * $perPage) + 1;
                $endIndex = $startIndex + $perPage;

                try {
                    $body = '<?xml version="1.0" encoding="UTF-8"?><filtres xmlns="http://www.atosworldline.com/wsabonnement/v1.0/"><triPar>idAbonnement</triPar><tri>ASC</tri></filtres>';

                    $response = $this->client->request('GET', "{$this->garBaseUrl}/abonnements?debut=$startIndex&fin=$endIndex", array(
                        'headers' => array(
                            'Content-Type' => 'application/xml',
                            'Accept'     => 'application/xml',
                        ),
                        'body' => $body,
                        'cert' => '../abogarprod/abogar.vittascience.com.pem',
                        'ssl_key' => '../abogarprod/vittascience_abogar_prod_fev2022.key'
                    ));
                    
                    $subscriptionListXml = new SimpleXMLElement($response->getBody()->getContents());
                    $subscriptionListXmlDecoded = json_decode(json_encode($subscriptionListXml));
                    
                    return array(
                        'data' => $subscriptionListXmlDecoded,
                        'count' => count($subscriptionListXml)
                    );
                } catch (\Exception $e) {
                   
                    return array('error' => $e->getResponse()->getBody()->getContents());
                }


                // echo "<pre>" . print_r($subscriptionListXmlDecoded, true) . "</pre>";
            },
            'create_subscription' => function () {

                // bind and sanitize incoming data
                $incomingData = json_decode(file_get_contents('php://input'));
                $sanitizedData = $this->sanitizeIncomingData($incomingData);

                // check for errors and return them if any
                $errors = $this->checkForErrors($sanitizedData);
                if(!empty($errors)) return array('errors'=> $errors);

                // no errors found, prepare the string for the request body
                $body = $this->generateCreateBodyString($sanitizedData);
               
                try {
                    $response = $this->client->request('PUT', "{$this->garBaseUrl}/{$sanitizedData->idAbonnement}", array(
                        'headers' => array(
                            'Content-Type' => 'application/xml',
                            'Accept'     => 'application/xml',
                        ),
                        'body' => $body,
                        'cert' => '../abogarprod/abogar.vittascience.com.pem',
                        'ssl_key' => '../abogarprod/vittascience_abogar_prod_fev2022.key'
                    ));
                    
                    return array(
                        'data' => $response->getBody()->getContents(),
                        'statusCode' => $response->getStatusCode()
                    );
                } catch (\Exception $e) {
                    $errorXml = new SimpleXMLElement($e->getResponse()->getBody()->getContents());
                    $errorXmlDecoded = json_decode(json_encode($errorXml));

                    return array('garError' => $errorXmlDecoded);
                }
            },
            'update_subscription' => function () {

                // bind and sanitize incoming data
                $incomingData = json_decode(file_get_contents('php://input'));
                $sanitizedData = $this->sanitizeIncomingData($incomingData, 'update');
                
                // check for errors and return them if any
                $errors = $this->checkForErrors($sanitizedData, 'update');
                if(!empty($errors)) return array('errors'=> $errors);

                // no errors found, prepare the string for the request body
                $body = $this->generateUpdateBodyString($sanitizedData);
            
                try {
                    $response = $this->client->request('POST', "{$this->garBaseUrl}/{$sanitizedData->idAbonnement}", array(
                        'headers' => array(
                            'Content-Type' => 'application/xml',
                            'Accept'     => 'application/xml',
                        ),
                        'body' => $body,
                        'cert' => '../abogarprod/abogar.vittascience.com.pem',
                        'ssl_key' => '../abogarprod/vittascience_abogar_prod_fev2022.key'
                    ));
                    
                    return array(
                        'data' => $response->getBody()->getContents(),
                        'statusCode' => $response->getStatusCode()
                    );
                } catch (\Exception $e) {
                    $errorXml = new SimpleXMLElement($e->getResponse()->getBody()->getContents());
                    $errorXmlDecoded = json_decode(json_encode($errorXml));

                    return array('garError' => $errorXmlDecoded);
                }
            },
            'delete_subscription' => function () {
                $incomingData = json_decode(file_get_contents('php://input'));
                $sanitizedIdToDelete = !empty($incomingData->idAbonnement) 
                    ? htmlspecialchars(strip_tags(trim($incomingData->idAbonnement)))
                    : '';
                
                $errors = [];
                if(empty($sanitizedIdToDelete)){
                    array_push($errors,array('errorType' => 'idAbonnementIsInvalid'));
                    return array('errors'=> $errors);
                }
                
                 // no errors found, prepare the string for the request body
                 try {
                     $response = $this->client->request('DELETE', "{$this->garBaseUrl}/$sanitizedIdToDelete", array(
                         'headers' => array(
                             'Content-Type' => 'application/xml',
                             'Accept'     => 'application/xml',
                         ),
                         'cert' => '../abogarprod/abogar.vittascience.com.pem',
                         'ssl_key' => '../abogarprod/vittascience_abogar_prod_fev2022.key'
                     ));
                     
                     return array(
                        'data' => $response->getBody()->getContents(),
                        'statusCode' => $response->getStatusCode()
                    );
                 } catch (\Exception $e) {
                    $errorXml = new SimpleXMLElement($e->getResponse()->getBody()->getContents());
                    $errorXmlDecoded = json_decode(json_encode($errorXml));

                    return array('garError' => $errorXmlDecoded);
                 }
            }
        );
    }

    /**
     * return sanitized data based on user inputs
     *
     * @param   object       $incomingData  
     * @param   string|null  $context       
     *
     * @return  object
     */
    private function sanitizeIncomingData($incomingData, $context=null)
    {
        $dataToReturn = new \stdClass;
        
        $dataToReturn->idAbonnement = !empty($incomingData->idAbonnement)
            ? htmlspecialchars(strip_tags(trim($incomingData->idAbonnement)))
            : '';
        
        // sanitize idAbonnementOld in update context
        if ($context === 'update') {
            $dataToReturn->idAbonnementOld = !empty($incomingData->idAbonnementOld)
                ? htmlspecialchars(strip_tags(trim($incomingData->idAbonnementOld)))
                : '';
        }
        $dataToReturn->commentaireAbonnement = !empty($incomingData->commentaireAbonnement)
            ? htmlspecialchars(strip_tags(trim($incomingData->commentaireAbonnement)))
            : '';
        $dataToReturn->uaiEtab = !empty($incomingData->uaiEtab)
            ? htmlspecialchars(strip_tags(trim($incomingData->uaiEtab)))
            : '';
        $dataToReturn->uaiEtab = strtoupper($dataToReturn->uaiEtab);
       
        $dataToReturn->debutValidite = !empty($incomingData->debutValidite)
            ? htmlspecialchars(strip_tags(trim($incomingData->debutValidite)))
            : '';
       
        $dataToReturn->finValidite = !empty($incomingData->finValidite)
            ? htmlspecialchars(strip_tags(trim($incomingData->finValidite)))
            : '';

        // sanitize relevant inputs for global licences or custom licences
        $dataToReturn->licences = $incomingData->licences;
        if ($incomingData->licences === 'globalLicences') {
            $dataToReturn->nbLicenceGlobale = !empty($incomingData->nbLicenceGlobale)
                ? htmlspecialchars(strip_tags(trim($incomingData->nbLicenceGlobale)))
                : '';
        } else {
            $dataToReturn->nbLicenceEnseignant = !empty($incomingData->nbLicenceEnseignant)
                ? htmlspecialchars(strip_tags(trim($incomingData->nbLicenceEnseignant)))
                : '';
            $dataToReturn->nbLicenceEleve = !empty($incomingData->nbLicenceEleve)
                ? htmlspecialchars(strip_tags(trim($incomingData->nbLicenceEleve)))
                : '';
            $dataToReturn->nbLicenceProfDoc = !empty($incomingData->nbLicenceProfDoc)
                ? htmlspecialchars(strip_tags(trim($incomingData->nbLicenceProfDoc)))
                : '';
            $dataToReturn->nbLicenceAutrePersonnel = !empty($incomingData->nbLicenceAutrePersonnel)
                ? htmlspecialchars(strip_tags(trim($incomingData->nbLicenceAutrePersonnel)))
                : '';
        }

        // sanitize public cible array
        if (!empty($incomingData->publicCible)) {
            $dataToReturn->publicCible = array_map(function ($currentIteration) {
                return !empty($currentIteration)
                    ? htmlspecialchars(strip_tags(trim($currentIteration)))
                    : '';
            }, $incomingData->publicCible);
        }

        $dataToReturn->categorieAffectation = !empty($incomingData->categorieAffectation)
            ? htmlspecialchars(strip_tags(trim($incomingData->categorieAffectation)))
            : '';
        $dataToReturn->typeAffectation = !empty($incomingData->typeAffectation)
            ? htmlspecialchars(strip_tags(trim($incomingData->typeAffectation)))
            : '';
        $dataToReturn->idDistributeurCom = !empty($incomingData->idDistributeurCom)
            ? htmlspecialchars(strip_tags(trim($incomingData->idDistributeurCom)))
            : '';
        $dataToReturn->idRessource = !empty($incomingData->idRessource)
            ? htmlspecialchars(strip_tags(trim($incomingData->idRessource)))
            : '';
        $dataToReturn->typeIdRessource = !empty($incomingData->typeIdRessource)
            ? htmlspecialchars(strip_tags(trim($incomingData->typeIdRessource)))
            : '';
        $dataToReturn->libelleRessource = !empty($incomingData->libelleRessource)
            ? htmlspecialchars(strip_tags(trim($incomingData->libelleRessource)))
            : '';

        return $dataToReturn;
    }

    /**
     * return user inputs errors once they have been sanitized
     *
     * @param   object       $data  
     * @param   string|null  $context
     *
     * @return  array      
     */
    private function checkForErrors($data, $context=null)
    {
        $errors = [];

        // checks on idAbonnement
        if (empty($data->idAbonnement)) array_push($errors, array('errorType' => 'idAbonnementIsEmpty'));
        elseif(substr($data->idAbonnement, 0, 1 ) === "_") array_push($errors, array('errorType' => 'idAbonnementStartsWithForbiddenCharacter'));
        elseif(strpos($data->idAbonnement,' ')) array_push($errors, array('errorType' => 'idAbonnementForbiddenWhiteSpace'));
        elseif(strlen($data->idAbonnement) > 45) array_push($errors, array('errorType' => 'idAbonnementIsTooLong'));
        elseif ($context === 'update' && ($data->idAbonnement !== $data->idAbonnementOld)) {
            array_push($errors, array('errorType' => 'idAbonnementDoNotMatchIdAbonnementOld'));
        }

        // checks on subscript comment/name
        if (empty($data->commentaireAbonnement)) array_push($errors, array('errorType' => 'commentaireAbonnementIsEmpty'));
        elseif (strlen($data->commentaireAbonnement) > 255) array_push($errors, array('errorType' => 'commentaireAbonnementIsTooLong'));
       
        // checks on date (start/end)
        if (empty($data->debutValidite)) array_push($errors, array('errorType' => 'debutValiditeIsEmpty'));

        $startYear = explode('-',$data->debutValidite)[0];
        $currentYear = date("Y");
        $maxEndDate = date('Y-m-d', strtotime('+10year', strtotime($data->debutValidite)) );
        $today = (new \Datetime('now'))->format('Y-m-d');

        if (empty($data->debutValidite)) array_push($errors, array('errorType' => 'debutValiditeIsEmpty'));
        elseif(strlen($data->debutValidite) != 10) array_push($errors, array('errorType' => 'debutValiditeIsInvalid'));
        // check on debutValidité when we are creation context only (field update disabled in update context)
        elseif($context !== 'update' && $startYear < $currentYear - 1){
            array_push($errors, array('errorType' => 'debutValiditeIsTooEarly'));
        }
        if (empty($data->finValidite)) array_push($errors, array('errorType' => 'finValiditeIsEmpty'));
        elseif(strlen($data->finValidite) != 10) array_push($errors, array('errorType' => 'finValiditeIsInvalid'));
        elseif($data->finValidite < $today){
            array_push($errors, array('errorType' => 'finValiditeHasToBeGreaterThanToday'));
        }
        elseif(strtotime($data->finValidite) > strtotime($maxEndDate)){
            array_push($errors, array('errorType' => 'finValiditeIsToFar'));
        }

        // checks on UAI
        if (empty($data->uaiEtab)) array_push($errors, array('errorType' => 'uaiEtabIsEmpty'));
        elseif(strlen($data->uaiEtab) > 45) array_push($errors, array('errorType' => 'uaiEtabIsTooLong'));

        // checks on licences (global/custom)
        if ($data->licences === 'globalLicences') {
            if(empty($data->nbLicenceGlobale)) array_push($errors, array('errorType' => 'nbLicenceGlobaleIsEmpty'));
            elseif(strlen($data->nbLicenceGlobale) > 8) array_push($errors, array('errorType' => 'nbLicenceGlobaleIsTooLong'));
        } 
        else {
            if(empty($data->nbLicenceEnseignant)) array_push($errors, array('errorType' => 'nbLicenceEnseignantIsEmpty'));
            elseif(strlen($data->nbLicenceEnseignant) > 8) array_push($errors, array('errorType' => 'nbLicenceEnseignantIsTooLong'));
            if(empty($data->nbLicenceEleve)) array_push($errors, array('errorType' => 'nbLicenceEleveIsEmpty'));
            elseif(strlen($data->nbLicenceEleve) > 8) array_push($errors, array('errorType' => 'nbLicenceEleveIsTooLong'));
            if(empty($data->nbLicenceProfDoc)) array_push($errors, array('errorType' => 'nbLicenceProfDocIsEmpty'));
            elseif(strlen($data->nbLicenceProfDoc) > 8) array_push($errors, array('errorType' => 'nbLicenceProfDocIsTooLong'));
            if(empty($data->nbLicenceAutrePersonnel)) array_push($errors, array('errorType' => 'nbLicenceAutrePersonnelIsEmpty'));
            elseif(strlen($data->nbLicenceAutrePersonnel) > 8) array_push($errors, array('errorType' => 'nbLicenceAutrePersonnelIsTooLong'));
        }

        $atLeastOnePublicCibleIsMissing = array('ELEVE','ENSEIGNANT','DOCUMENTALISTE','AUTRE PERSONNEL') != $data->publicCible ;
        if(empty($data->publicCible)) array_push($errors, array('errorType' => 'publicCibleIsEmpty'));
        elseif($data->licences === 'customLicences' && $atLeastOnePublicCibleIsMissing){
            array_push($errors, array('errorType' => 'publicCibleNeedsAllOptionsToBeChecked'));
        }
        if (empty($data->categorieAffectation)) array_push($errors, array('errorType' => 'categorieAffectationIsEmpty'));
        if (empty($data->typeAffectation)) array_push($errors, array('errorType' => 'typeAffectationIsEmpty'));

        // checks on idDistributeurCom
        if (empty($data->idDistributeurCom)) array_push($errors, array('errorType' => 'idDistributeurComIsEmpty'));
        elseif(strlen($data->idDistributeurCom) > 26) array_push($errors, array('errorType' => 'idDistributeurComIsTooLong'));

        // checks on idResource
        if (empty($data->idRessource)) array_push($errors, array('errorType' => 'idRessourceIsEmpty'));
        elseif(strlen($data->idRessource) > 1024) array_push($errors, array('errorType' => 'idRessourceIsTooLong'));

        // checks on typeIdResource
        if (empty($data->typeIdRessource)) array_push($errors, array('errorType' => 'typeIdRessourceIsEmpty'));
        elseif(strlen($data->typeIdRessource) > 50) array_push($errors, array('errorType' => 'typeIdRessourceIsTooLong'));

        // checks on libelleResource
        if (empty($data->libelleRessource)) array_push($errors, array('errorType' => 'libelleRessourceIsEmpty'));
        elseif(strlen($data->libelleRessource) > 255) array_push($errors, array('errorType' => 'libelleRessourceIsTooLong'));

        return $errors;
    }

    /**
     * generate xml formated string based on user inputs 
     * which will be send in the guzzle request body for subscription update
     *
     * @param   object  $sanitizedData 
     *
     * @return  string  
     */
    private function generateUpdateBodyString($sanitizedData){
        if($sanitizedData->licences === "globalLicences"){
            $nbLicenceGlobale = strtoupper($sanitizedData->nbLicenceGlobale);

            $output = '<?xml version="1.0" encoding="UTF-8"?>
            <abonnement xmlns="http://www.atosworldline.com/wsabonnement/v1.0/">
            <idAbonnement>'.$sanitizedData->idAbonnement.'</idAbonnement>
            <commentaireAbonnement>'.$sanitizedData->commentaireAbonnement.'</commentaireAbonnement>
            <idDistributeurCom>'.$sanitizedData->idDistributeurCom.'</idDistributeurCom>
            <idRessource>'.$sanitizedData->idRessource.'</idRessource>
            <typeIdRessource>'.$sanitizedData->typeIdRessource.'</typeIdRessource>
            <libelleRessource>'.$sanitizedData->libelleRessource.'</libelleRessource>
            <debutValidite>'.$sanitizedData->debutValidite.'T00:00:00</debutValidite>
            <finValidite>'.$sanitizedData->finValidite.'T23:59:59</finValidite>
            <categorieAffectation>'.$sanitizedData->categorieAffectation.'</categorieAffectation>
            <typeAffectation>'.$sanitizedData->typeAffectation.'</typeAffectation>
            <nbLicenceGlobale>'.$nbLicenceGlobale.'</nbLicenceGlobale>';
        } else {
            $nbLicenceEnseignant = strtoupper($sanitizedData->nbLicenceEnseignant);
            $nbLicenceEleve = strtoupper($sanitizedData->nbLicenceEleve);
            $nbLicenceProfDoc = strtoupper($sanitizedData->nbLicenceProfDoc);
            $nbLicenceAutrePersonnel = strtoupper($sanitizedData->nbLicenceAutrePersonnel);

            $output = '<?xml version="1.0" encoding="UTF-8"?>
            <abonnement xmlns="http://www.atosworldline.com/wsabonnement/v1.0/">
            <idAbonnement>'.$sanitizedData->idAbonnement.'</idAbonnement>
            <commentaireAbonnement>'.$sanitizedData->commentaireAbonnement.'</commentaireAbonnement>
            <idDistributeurCom>'.$sanitizedData->idDistributeurCom.'</idDistributeurCom>
            <idRessource>'.$sanitizedData->idRessource.'</idRessource>
            <typeIdRessource>'.$sanitizedData->typeIdRessource.'</typeIdRessource>
            <libelleRessource>'.$sanitizedData->libelleRessource.'</libelleRessource>
            <debutValidite>'.$sanitizedData->debutValidite.'T00:00:00</debutValidite>
            <finValidite>'.$sanitizedData->finValidite.'T23:59:59</finValidite>
            <categorieAffectation>'.$sanitizedData->categorieAffectation.'</categorieAffectation>
            <typeAffectation>'.$sanitizedData->typeAffectation.'</typeAffectation>
            <nbLicenceEnseignant>'.$nbLicenceEnseignant.'</nbLicenceEnseignant>
            <nbLicenceEleve>'.$nbLicenceEleve.'</nbLicenceEleve>
            <nbLicenceProfDoc>'.$nbLicenceProfDoc.'</nbLicenceProfDoc>
            <nbLicenceAutrePersonnel>'.$nbLicenceAutrePersonnel.'</nbLicenceAutrePersonnel>';
        }
        // if(!empty($nbLicenceProfDoc)) $output .= '<nbLicenceProfDoc>'.$nbLicenceProfDoc.'</nbLicenceProfDoc>';
        // if(!empty($nbLicenceAutrePersonnel)) $output .= '<nbLicenceAutrePersonnel>'.$nbLicenceAutrePersonnel.'</nbLicenceAutrePersonnel>';
       
         // concatenate all publicCible
         foreach($sanitizedData->publicCible as $publicCible){
            $output .= '<publicCible>'.$publicCible.'</publicCible>';
        }
   
        $output .= '</abonnement>';
        return $output;
    }

    /**
     * generate xml formated string based on user inputs 
     * which will be send in the guzzle request body for subscription creation
     *
     * @param   object  $sanitizedData 
     *
     * @return  string  
     */
    private function generateCreateBodyString($sanitizedData){
        $uaiEtab = strtoupper($sanitizedData->uaiEtab);

        if($sanitizedData->licences === "globalLicences"){
            $nbLicenceGlobale = strtoupper($sanitizedData->nbLicenceGlobale);
            
            $output = '<?xml version="1.0" encoding="UTF-8"?>
            <abonnement xmlns="http://www.atosworldline.com/wsabonnement/v1.0/">
            <idAbonnement>'.$sanitizedData->idAbonnement.'</idAbonnement>
            <commentaireAbonnement>'.$sanitizedData->commentaireAbonnement.'</commentaireAbonnement>
            <idDistributeurCom>'.$sanitizedData->idDistributeurCom.'</idDistributeurCom>
            <idRessource>'.$sanitizedData->idRessource.'</idRessource>
            <typeIdRessource>'.$sanitizedData->typeIdRessource.'</typeIdRessource>
            <libelleRessource>'.$sanitizedData->libelleRessource.'</libelleRessource>
            <debutValidite>'.$sanitizedData->debutValidite.'T00:00:00</debutValidite>
            <finValidite>'.$sanitizedData->finValidite.'T23:59:59</finValidite>
            <uaiEtab>'.$uaiEtab.'</uaiEtab>
            <categorieAffectation>'.$sanitizedData->categorieAffectation.'</categorieAffectation>
            <typeAffectation>'.$sanitizedData->typeAffectation.'</typeAffectation>
            <nbLicenceGlobale>'.$nbLicenceGlobale.'</nbLicenceGlobale>';
        } else {
            $nbLicenceEnseignant = strtoupper($sanitizedData->nbLicenceEnseignant);
            $nbLicenceEleve = strtoupper($sanitizedData->nbLicenceEleve);
            $nbLicenceProfDoc = strtoupper($sanitizedData->nbLicenceProfDoc);
            $nbLicenceAutrePersonnel = strtoupper($sanitizedData->nbLicenceAutrePersonnel);

            $output = '<?xml version="1.0" encoding="UTF-8"?>
            <abonnement xmlns="http://www.atosworldline.com/wsabonnement/v1.0/">
            <idAbonnement>'.$sanitizedData->idAbonnement.'</idAbonnement>
            <commentaireAbonnement>'.$sanitizedData->commentaireAbonnement.'</commentaireAbonnement>
            <idDistributeurCom>'.$sanitizedData->idDistributeurCom.'</idDistributeurCom>
            <idRessource>'.$sanitizedData->idRessource.'</idRessource>
            <typeIdRessource>'.$sanitizedData->typeIdRessource.'</typeIdRessource>
            <libelleRessource>'.$sanitizedData->libelleRessource.'</libelleRessource>
            <debutValidite>'.$sanitizedData->debutValidite.'T00:00:00</debutValidite>
            <finValidite>'.$sanitizedData->finValidite.'T23:59:59</finValidite>
            <uaiEtab>'.$uaiEtab.'</uaiEtab>
            <categorieAffectation>'.$sanitizedData->categorieAffectation.'</categorieAffectation>
            <typeAffectation>'.$sanitizedData->typeAffectation.'</typeAffectation>
            <nbLicenceEnseignant>'.$nbLicenceEnseignant.'</nbLicenceEnseignant>
            <nbLicenceEleve>'.$nbLicenceEleve.'</nbLicenceEleve>
            <nbLicenceProfDoc>'.$nbLicenceProfDoc.'</nbLicenceProfDoc>
            <nbLicenceAutrePersonnel>'.$nbLicenceAutrePersonnel.'</nbLicenceAutrePersonnel>';
        }
        // if(!empty($nbLicenceProfDoc)) $output .= '<nbLicenceProfDoc>'.$nbLicenceProfDoc.'</nbLicenceProfDoc>';
        // if(!empty($nbLicenceAutrePersonnel)) $output .= '<nbLicenceAutrePersonnel>'.$nbLicenceAutrePersonnel.'</nbLicenceAutrePersonnel>';
       
         // concatenate all publicCible
         foreach($sanitizedData->publicCible as $publicCible){
            $output .= '<publicCible>'.$publicCible.'</publicCible>';
        }
   
        $output .= '</abonnement>';
        return $output;
    }
}
