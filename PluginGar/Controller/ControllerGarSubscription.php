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
        $this->garBaseUrl = 'https://abonnement.partenaire.test-gar.education.fr';
        $this->actions = array(
            'get_subscription_list' => function () {
                $fakeData = json_decode('{"abonnement":[{"idAbonnement":"AUTO_0350042F_21202_1596629146787","commentaireAbonnement":"Abonnement automatique","idDistributeurCom":"837973296_0000000000000000","idRessource":"ark:/49591/Vittascience.p","typeIdRessource":"ARK","libelleRessource":"Vittascience - programmation informatique de cartes et console Python","debutValidite":"2020-08-05T14:05:47.000+02:00","finValidite":"2024-08-15T00:00:01.000+02:00","anneeFinValidite":"2020-2021","uaiEtab":"0350042F","categorieAffectation":"transferable","typeAffectation":"ETABL","nbLicenceGlobale":"ILLIMITE","publicCible":["ELEVE","ENSEIGNANT","DOCUMENTALISTE"]},{"idAbonnement":"AUTO_0350042F_21202_1629007364871","commentaireAbonnement":"Abonnement automatique","idDistributeurCom":"837973296_0000000000000000","idRessource":"ark:/49591/Vittascience.p","typeIdRessource":"ARK","libelleRessource":"Vittascience - programmation informatique de cartes et console Python","debutValidite":"2021-08-15T08:02:45.000+02:00","finValidite":"2023-08-15T00:00:00.000+02:00","anneeFinValidite":"2021-2022","uaiEtab":"0350042F","categorieAffectation":"transferable","typeAffectation":"ETABL","nbLicenceGlobale":"ILLIMITE","publicCible":["ELEVE","ENSEIGNANT","DOCUMENTALISTE","AUTRE PERSONNEL"]},{"idAbonnement":"testCollegeCousteau_2","commentaireAbonnement":"test CLG-COUSTEAU-ac-RENNES","idDistributeurCom":"837973296_0000000000000000","idRessource":"ark:/49591/Vittascience.p","typeIdRessource":"ark","libelleRessource":"Fleury et Bott Junior","debutValidite":"2022-08-16T00:00:00.000+02:00","finValidite":"2023-08-15T23:59:59.000+02:00","uaiEtab":"0561622J","categorieAffectation":"transferable","typeAffectation":"INDIV","nbLicenceEnseignant":"11","nbLicenceEleve":"320","nbLicenceProfDoc":"1","nbLicenceAutrePersonnel":"1","publicCible":["ELEVE","ENSEIGNANT","DOCUMENTALISTE","AUTRE PERSONNEL"]},{"idAbonnement":"testLyceeMauperthuis_1","commentaireAbonnement":"TEST LGT-MAUPERTUIS-ac-RENNES","idDistributeurCom":"837973296_0000000000000000","idRessource":"ark:/49591/Vittascience.p","typeIdRessource":"ark","libelleRessource":"Fleury et Bott Junior","debutValidite":"2022-08-16T00:00:00.000+02:00","finValidite":"2023-08-15T23:59:59.000+02:00","uaiEtab":"0350042F","categorieAffectation":"transferable","typeAffectation":"INDIV","nbLicenceEnseignant":"ILLIMITE","nbLicenceEleve":"ILLIMITE","nbLicenceProfDoc":"1","nbLicenceAutrePersonnel":"1","publicCible":["ELEVE","ENSEIGNANT","DOCUMENTALISTE","AUTRE PERSONNEL"]}]}');

                return  $fakeData;
                try {
                    $body = '<?xml version="1.0" encoding="UTF-8"?><filtres xmlns="http://www.atosworldline.com/wsabonnement/v1.0/"><triPar>idAbonnement</triPar><tri>ASC</tri></filtres>';

                    $response = $this->client->request('GET', "{$this->garBaseUrl}/abonnements?debut=0&fin=100", array(
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
                    return array('data' => $subscriptionListXmlDecoded);
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
                $body = $this->generateBodyString($sanitizedData);
                dd($body);
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
                    
                    return array('data' => $response->getBody()->getContents());
                } catch (\Exception $e) {
                    return array('error' => $e->getResponse()->getBody()->getContents());
                }



                return array('msg' => $sanitizedData);
            },
            'update_subscription' => function () {

                // bind and sanitize incoming data
                $incomingData = json_decode(file_get_contents('php://input'));
                $sanitizedData = $this->sanitizeIncomingData($incomingData, 'update');

                // check for errors and return them if any
                $errors = $this->checkForErrors($sanitizedData, 'update');
                if(!empty($errors)) return array('errors'=> $errors);

                // no errors found, prepare the string for the request body
                $body = $this->generateBodyString($sanitizedData);
                dd($body);
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
                    
                    return array('data' => $response->getBody()->getContents());
                } catch (\Exception $e) {
                    return array('error' => $e->getResponse()->getBody()->getContents());
                }
            },
            'delete_subscription' => function () {
                $incomingData = json_decode(file_get_contents('php://input'));
                $sanitizedIdToDelete = !empty($incomingData->idAbonnement) 
                    ? htmlspecialchars(strip_tags(trim($incomingData->idAbonnement)))
                    : '';

                if(empty($sanitizedIdToDelete)){
                    return array('errorType' => 'idAbonnementIsInvalid');
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
                     
                     return array('data' => $response->getBody()->getContents());
                 } catch (\Exception $e) {
                     return array('error' => $e->getResponse()->getBody()->getContents());
                 }
                
                return array('msg' => 'delete subscription');
            }
        );
    }

    private function sanitizeIncomingData($incomingData, $context=null)
    {
        $dataToReturn = new \stdClass;
        return $incomingData;
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
       
        // check on date (start/end)
        if (empty($data->debutValidite)) array_push($errors, array('errorType' => 'debutValiditeIsEmpty'));

        $startYear = explode('-',$data->debutValidite)[0];
        $currentYear = date("Y");
        $maxEndDate = date('Y-m-d', strtotime('+10year', strtotime($data->debutValidite)) );
        $today = (new \Datetime('now'))->format('Y-m-d');

        if (empty($data->debutValidite)) array_push($errors, array('errorType' => 'debutValiditeIsEmpty'));
        elseif(strlen($data->debutValidite) != 10) array_push($errors, array('errorType' => 'debutValiditeIsInvalid'));
        elseif($startYear < $currentYear - 1){
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

        if(empty($data->publicCible)) array_push($errors, array('errorType' => 'publicCibleIsEmpty'));


        if (empty($data->categorieAffectation)) array_push($errors, array('errorType' => 'categorieAffectationIsEmpty'));
        if (empty($data->typeAffectation)) array_push($errors, array('errorType' => 'typeAffectationIsEmpty'));
        if (empty($data->idDistributeurCom)) array_push($errors, array('errorType' => 'idDistributeurComIsEmpty'));
        elseif(strlen($data->idDistributeurCom) > 26) array_push($errors, array('errorType' => 'idDistributeurComIsTooLong'));
        if (empty($data->idRessource)) array_push($errors, array('errorType' => 'idRessourceIsEmpty'));
        elseif(strlen($data->idRessource) > 1024) array_push($errors, array('errorType' => 'idRessourceIsTooLong'));
        if (empty($data->typeIdRessource)) array_push($errors, array('errorType' => 'typeIdRessourceIsEmpty'));
        elseif(strlen($data->typeIdRessource) > 50) array_push($errors, array('errorType' => 'typeIdRessourceIsTooLong'));
        if (empty($data->libelleRessource)) array_push($errors, array('errorType' => 'libelleRessourceIsEmpty'));
        elseif(strlen($data->libelleRessource) > 255) array_push($errors, array('errorType' => 'libelleRessourceIsTooLong'));

        return $errors;
    }

    private function generateBodyString($sanitizedData){
        $uaiEtab = strtoupper($sanitizedData->uaiEtab);

        $output = "<?xml version='1.0' encoding='UTF-8'?>
        <abonnement xmlns='http://www.atosworldline.com/wsabonnement/v1.0'>
        <idAbonnement>{$sanitizedData->idAbonnement}</idAbonnement>
        <commentaireAbonnement>{$sanitizedData->commentaireAbonnement}</commentaireAbonnement>
        <idDistributeurCom>{$sanitizedData->idDistributeurCom}</idDistributeurCom>
        <idRessource>{$sanitizedData->idRessource}</idRessource>
        <typeIdRessource>{$sanitizedData->typeIdRessource}</typeIdRessource>
        <libelleRessource>{$sanitizedData->libelleRessource}</libelleRessource>
        <debutValidite>{$sanitizedData->debutValidite}T00:00:00</debutValidite>
        <finValidite>{$sanitizedData->finValidite}T23:59:59</finValidite>
        <uaiEtab>{$uaiEtab}</uaiEtab>
        <categorieAffectation>{$sanitizedData->categorieAffectation}</categorieAffectation>
        <typeAffectation>{$sanitizedData->typeAffectation}</typeAffectation>
        ";

        if($sanitizedData->licences === "globalLicences"){
            $nbLicenceGlobale = strtoupper($sanitizedData->nbLicenceGlobale);
            $output .= "<nbLicenceGlobale>$nbLicenceGlobale</nbLicenceGlobale>";
        } else {
            $nbLicenceEnseignant = strtoupper($sanitizedData->nbLicenceEnseignant);
            $nbLicenceEleve = strtoupper($sanitizedData->nbLicenceEleve);
            $nbLicenceProfDoc = strtoupper($sanitizedData->nbLicenceProfDoc);
            $nbLicenceAutrePersonnel = strtoupper($sanitizedData->nbLicenceAutrePersonnel);

            $output .= "<nbLicenceEnseignant>$nbLicenceEnseignant</nbLicenceEnseignant>
            <nbLicenceEleve>$nbLicenceEleve</nbLicenceEleve>
            <nbLicenceProfDoc>$nbLicenceProfDoc</nbLicenceProfDoc>
            <nbLicenceAutrePersonnel>$nbLicenceAutrePersonnel</nbLicenceAutrePersonnel>
            ";
        }

        foreach($sanitizedData->publicCible as $publicCible){
            $output .= " <publicCible>$publicCible</publicCible>
            ";
        }
        $output = preg_replace("~\r|\n|\s+~", '', $output);
        return $output;

    }
}
