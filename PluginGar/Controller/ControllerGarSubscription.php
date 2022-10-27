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
        parent::__construct($entityManager,$user);
        $this->client = new Client();
        $this->garBaseUrl = 'https://abonnement.partenaire.test-gar.education.fr';
        $this->actions = array(
            'get_subscription_list' => function(){
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
            }
        );
    }

    public function getSubscriptionList()
    {
        // $fakeData = json_decode('{"abonnement":[{"idAbonnement":"AUTO_0350042F_21202_1596629146787","commentaireAbonnement":"Abonnement automatique","idDistributeurCom":"837973296_0000000000000000","idRessource":"ark:/49591/Vittascience.p","typeIdRessource":"ARK","libelleRessource":"Vittascience - programmation informatique de cartes et console Python","debutValidite":"2020-08-05T14:05:47.000+02:00","finValidite":"2024-08-15T00:00:01.000+02:00","anneeFinValidite":"2020-2021","uaiEtab":"0350042F","categorieAffectation":"transferable","typeAffectation":"ETABL","nbLicenceGlobale":"ILLIMITE","publicCible":["ELEVE","ENSEIGNANT","DOCUMENTALISTE"]},{"idAbonnement":"AUTO_0350042F_21202_1629007364871","commentaireAbonnement":"Abonnement automatique","idDistributeurCom":"837973296_0000000000000000","idRessource":"ark:/49591/Vittascience.p","typeIdRessource":"ARK","libelleRessource":"Vittascience - programmation informatique de cartes et console Python","debutValidite":"2021-08-15T08:02:45.000+02:00","finValidite":"2023-08-15T00:00:00.000+02:00","anneeFinValidite":"2021-2022","uaiEtab":"0350042F","categorieAffectation":"transferable","typeAffectation":"ETABL","nbLicenceGlobale":"ILLIMITE","publicCible":["ELEVE","ENSEIGNANT","DOCUMENTALISTE","AUTRE PERSONNEL"]},{"idAbonnement":"testCollegeCousteau_2","commentaireAbonnement":"test CLG-COUSTEAU-ac-RENNES","idDistributeurCom":"837973296_0000000000000000","idRessource":"ark:/49591/Vittascience.p","typeIdRessource":"ark","libelleRessource":"Fleury et Bott Junior","debutValidite":"2022-08-16T00:00:00.000+02:00","finValidite":"2023-08-15T23:59:59.000+02:00","uaiEtab":"0561622J","categorieAffectation":"transferable","typeAffectation":"INDIV","nbLicenceEnseignant":"11","nbLicenceEleve":"320","nbLicenceProfDoc":"1","nbLicenceAutrePersonnel":"1","publicCible":["ELEVE","ENSEIGNANT","DOCUMENTALISTE","AUTRE PERSONNEL"]},{"idAbonnement":"testLyceeMauperthuis_1","commentaireAbonnement":"TEST LGT-MAUPERTUIS-ac-RENNES","idDistributeurCom":"837973296_0000000000000000","idRessource":"ark:/49591/Vittascience.p","typeIdRessource":"ark","libelleRessource":"Fleury et Bott Junior","debutValidite":"2022-08-16T00:00:00.000+02:00","finValidite":"2023-08-15T23:59:59.000+02:00","uaiEtab":"0350042F","categorieAffectation":"transferable","typeAffectation":"INDIV","nbLicenceEnseignant":"ILLIMITE","nbLicenceEleve":"ILLIMITE","nbLicenceProfDoc":"1","nbLicenceAutrePersonnel":"1","publicCible":["ELEVE","ENSEIGNANT","DOCUMENTALISTE","AUTRE PERSONNEL"]}]}');
        // return  $fakeData;
        // try {
          /*   $body = '<?xml version="1.0" encoding="UTF-8"?><filtres <!-- xmlns="http://www.atosworldline.com/wsabonnement/v1.0/"><triPar>idAbonnement</triPar><tri>ASC</tri></filtres>';

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

 */
        // echo "<pre>" . print_r($subscriptionListXmlDecoded, true) . "</pre>"; -->
    }
}
