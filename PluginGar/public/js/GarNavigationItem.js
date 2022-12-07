class GarNavigationItem {

	constructor() {
		// The navigation button element before which the newly created one will be inserted
		this._nextNavigationMenuElt = document.getElementById('dashboard-profil-manager');
		// The custom navigation button element
		this._newNavigationButtonElt;
		// The gar panel element
		this._garSubscriptionPanelElt;
		this._loadedSubscriptions = []
		this._currentSubscription = {}
		this._useGlobalLicences = false
		this.idDistributeurCom = '837973296_0000000000000000'
		this.idRessource = 'ark:/49591/Vittascience'
		this.typeIdRessource = 'ark'
		this.libelleRessource = 'Vittascience - programmation informatique de cartes et console Python'
	}

	/**
	 * The method that initialize everything
	 */
	init() {
		this._createGarSubscriptionPanel();
		document.getElementById('classroom-dashboard-content').appendChild(this._garSubscriptionPanelElt);
		this._createNewSubscriptionPanel();
		document.getElementById('classroom-dashboard-content').appendChild(this._garNewSubscriptionPanelElt);
		this._createShowPanel()
		document.getElementById('classroom-dashboard-content').appendChild(this._garShowPanelElt);
		this._createEditPanel()
		document.getElementById('classroom-dashboard-content').appendChild(this._garEditPanelElt);
		this._createDeletePanel()
		document.getElementById('classroom-dashboard-content').appendChild(this._garDeletePanelElt);

		this._createNewNavigationButton();
		this._nextNavigationMenuElt.parentElement.insertBefore(this._newNavigationButtonElt, this._nextNavigationMenuElt);
		this._createNewDisplayPanelBehavior();
		// Attach the navigatePanel function to the click event on the newly appended navigation button
		this._newNavigationButtonElt.addEventListener('click', () => {
			
			// This function takes 2 arguments : the first is the id of the panel to open. The second is the id of the button that will be active after navigation.
			navigatePanel('classroom-dashboard-gar-subscriptions-panel', 'dashboard-manager-gar-subscriptions');
		});
	}

	/**
	 * Manage the creation of the gar panel element
	 */
	async _createGarSubscriptionPanel() {
		// create main div 
		this._garSubscriptionPanelElt = document.createElement('div');
		this._garSubscriptionPanelElt.id = 'classroom-dashboard-gar-subscriptions-panel';
		this._garSubscriptionPanelElt.classList.add('dashboard-block')
		this._garSubscriptionPanelElt.classList.add('p-2');
		this._garSubscriptionPanelElt.style.display = 'none';

		// create title 
		let garListPanelH2Elt = document.createElement('h2');
		garListPanelH2Elt.id = 'gar-subscriptions-title';

		// create add new subscription button


		// create header section
		const garListPanelHeaderElt = document.createElement('header')
		garListPanelHeaderElt.classList.add('d-flex')
		garListPanelHeaderElt.classList.add('justify-content-between')
		garListPanelHeaderElt.innerHTML = `
			<h2 id="gar-subscriptions-title">Liste des abonnements</h2>
			<button class="btn c-btn-outline-primary" id="new-subscription-panel">Ajouter un abonnement</button>
		`

		// create content
		let garListPanelContent = document.createElement('div')
		garListPanelContent.id = 'gar-subscriptions-content'

		// fetch subscriptions list
		const response = await fetch('/routing/Routing.php?controller=gar_subscription&action=get_subscription_list', {
			method: 'POST'
		})
		const data = await response.json()
		this._loadedSubscriptions = data.abonnement

		// generate content output
		let output = this._generateSubscriptionsListOutput()
		garListPanelContent.innerHTML = output

		// append elements to the DOM
		// this._garSubscriptionPanelElt.appendChild(garListPanelH2Elt);
		this._garSubscriptionPanelElt.appendChild(garListPanelHeaderElt);
		this._garSubscriptionPanelElt.appendChild(garListPanelContent)


		const newSubscriptionBtn = document.querySelector('#new-subscription-panel')
		newSubscriptionBtn.addEventListener('click', e=> {
			const newSubscriptionSection = document.querySelector('#classroom-dashboard-gar-subscriptions-new-subscription-panel')
			const newSubscriptionContent = newSubscriptionSection.querySelector('#gar-subscriptions-content-new-subscription')
			// reset to display custom licences fields on subscription creation
			this._useGlobalLicences = false
			// newSubscriptionContent.innerHTML = ''
			newSubscriptionContent.innerHTML = this._generateNewSubscriptionContent()
			this._generateLicencesFieldsToDisplay()
			navigatePanel('classroom-dashboard-gar-subscriptions-new-subscription-panel', 'dashboard-manager-gar-subscriptions');
		})

		const showBtns = this._garSubscriptionPanelElt.querySelectorAll('.showBtn')
		for (let showBtn of showBtns) {
			showBtn.addEventListener('click', async (e) => {
				const showSection = document.querySelector('#classroom-dashboard-gar-subscriptions-show-panel ')
				const showContent = showSection.querySelector('#gar-subscriptions-content-show')
				const subscriptionId = e.target.closest('a').dataset.id
				this._currentSubscription = this._loadedSubscriptions.filter(subscription => subscription.idAbonnement == subscriptionId)[0]
				// reset to display custom licence at start
			
				showContent.innerHTML = this._generateShowContent()
				navigatePanel('classroom-dashboard-gar-subscriptions-show-panel', 'dashboard-manager-gar-subscriptions');
			})
		}

		const editBtns = this._garSubscriptionPanelElt.querySelectorAll('.editBtn')
		for (let editBtn of editBtns) {
			editBtn.addEventListener('click', async (e) => {
				const editSection = document.querySelector('#classroom-dashboard-gar-subscriptions-edit-panel ')
				const editContent = editSection.querySelector('#gar-subscriptions-content-edit')
				const subscriptionId = e.target.closest('a').dataset.id
				this._currentSubscription = this._loadedSubscriptions.filter(subscription => subscription.idAbonnement == subscriptionId)[0]
				this._useGlobalLicences = typeof this._currentSubscription.nbLicenceGlobale !== 'undefined' ? true : false
				editContent.innerHTML = this._generateEditContent()
				
				this._generateLicencesFieldsToDisplay('update')
				navigatePanel('classroom-dashboard-gar-subscriptions-edit-panel', 'dashboard-manager-gar-subscriptions');
			})
		}

		const deleteBtns = this._garSubscriptionPanelElt.querySelectorAll('.deleteBtn')
		for (let deleteBtn of deleteBtns) {
			deleteBtn.addEventListener('click', async (e) => {
				const deleteSection = document.querySelector('#classroom-dashboard-gar-subscriptions-delete-panel ')
				const deleteContent = deleteSection.querySelector('#gar-subscriptions-content-delete')
				const subscriptionId = e.target.closest('a').dataset.id
				this._currentSubscription = this._loadedSubscriptions.filter(subscription => subscription.idAbonnement == subscriptionId)[0]
				deleteContent.innerHTML = this._generateShowContent()
				deleteContent.innerHTML += this._generateDeleteContent()

				navigatePanel('classroom-dashboard-gar-subscriptions-delete-panel', 'dashboard-manager-gar-subscriptions');
			})
		}

	}

	/**
	 * Manage the creation of the custom navigation button element
	 */
	_createNewNavigationButton() {
		this._newNavigationButtonElt = document.createElement('div');
		this._newNavigationButtonElt.id = 'dashboard-manager-gar-subscriptions';
		this._newNavigationButtonElt.classList.add('classroom-navbar-button');
		let buttonImageElt = document.createElement('img');
		buttonImageElt.src = "assets/media/my_classes.svg";
		let buttonSpanElt = document.createElement('span');
		// For the addition of custom i18next translations, see the translation plugin example
		buttonSpanElt.setAttribute('data-i18n', 'classroom.ids.myCustomNavigationButton');
		buttonSpanElt.textContent = 'Abo Gar';
		this._newNavigationButtonElt.appendChild(buttonImageElt);
		this._newNavigationButtonElt.appendChild(buttonSpanElt);
	}

	/**
	 * Run a custom code when opening the gar panel
	 */
	_createNewDisplayPanelBehavior() {
		// We attach a new method to the DisplayPanel (it is triggered when the navigatePanel function is executed and if it's first argument correspond to the method name after converting the "-" to "_")
		DisplayPanel.prototype.classroom_dashboard_gar_subscriptions_panel = function () {
			// Put your custom behavior here.
			const customPanelTitle = document.querySelector('#gar-subscriptions-title')
			// const customPanelContent = document.querySelector('#gar-subscriptions-content')
			customPanelTitle.textContent = 'Liste des abonnements'
		}
	}

	_createGoBackBtnAndRelatedEventListener() {
		let goBackToSubscriptionListBtn = document.createElement('button')
		goBackToSubscriptionListBtn.classList.add('btn')
		goBackToSubscriptionListBtn.classList.add('btn-sm')
		goBackToSubscriptionListBtn.classList.add('c-btn-outline-grey')
		goBackToSubscriptionListBtn.classList.add('my-3')
		goBackToSubscriptionListBtn.textContent = '<< Retour'
		goBackToSubscriptionListBtn.addEventListener('click', e => {
			e.preventDefault()
			return navigatePanel('classroom-dashboard-gar-subscriptions-panel', 'dashboard-manager-gar-subscriptions');
		})
		return goBackToSubscriptionListBtn
	}

	_createNewSubscriptionPanel(){
		this._garNewSubscriptionPanelElt = document.createElement('div');
		this._garNewSubscriptionPanelElt.id = 'classroom-dashboard-gar-subscriptions-new-subscription-panel';
		this._garNewSubscriptionPanelElt.classList.add('dashboard-block');
		this._garNewSubscriptionPanelElt.classList.add('p-2');
		this._garNewSubscriptionPanelElt.style.display = 'none';
		let garNewSubscriptionPanelH2Elt = document.createElement('h2');
		garNewSubscriptionPanelH2Elt.id = 'gar-subscriptions-title-new-subscription';
		garNewSubscriptionPanelH2Elt.textContent = 'Ajouter un abonnement'
		this._garNewSubscriptionPanelElt.appendChild(garNewSubscriptionPanelH2Elt);

		// generate go back btn and append it after title
		const goBackToSubscriptionListBtn = this._createGoBackBtnAndRelatedEventListener()
		this._garNewSubscriptionPanelElt.insertBefore(goBackToSubscriptionListBtn, garNewSubscriptionPanelH2Elt.nextSibling)

		let garNewSubscriptionPanelContent = document.createElement('div')
		garNewSubscriptionPanelContent.id = 'gar-subscriptions-content-new-subscription'
		this._garNewSubscriptionPanelElt.appendChild(garNewSubscriptionPanelContent)
	}

	_createShowPanel() {
		this._garShowPanelElt = document.createElement('div');
		this._garShowPanelElt.id = 'classroom-dashboard-gar-subscriptions-show-panel';
		this._garShowPanelElt.classList.add('dashboard-block');
		this._garShowPanelElt.classList.add('p-2');
		this._garShowPanelElt.style.display = 'none';
		let garShowPanelH2Elt = document.createElement('h2');
		garShowPanelH2Elt.id = 'gar-subscriptions-title-show';
		garShowPanelH2Elt.textContent = 'Détails'
		this._garShowPanelElt.appendChild(garShowPanelH2Elt);

		// generate go back btn and append it after title
		const goBackToSubscriptionListBtn = this._createGoBackBtnAndRelatedEventListener()
		this._garShowPanelElt.insertBefore(goBackToSubscriptionListBtn, garShowPanelH2Elt.nextSibling)

		let garShowPanelContent = document.createElement('div')
		garShowPanelContent.id = 'gar-subscriptions-content-show'
		this._garShowPanelElt.appendChild(garShowPanelContent)

	}
	_createEditPanel() {
		this._garEditPanelElt = document.createElement('div');
		this._garEditPanelElt.id = 'classroom-dashboard-gar-subscriptions-edit-panel';
		this._garEditPanelElt.classList.add('dashboard-block');
		this._garEditPanelElt.classList.add('p-2');
		this._garEditPanelElt.style.display = 'none';
		let garEditPanelH2Elt = document.createElement('h2');
		garEditPanelH2Elt.id = 'gar-subscriptions-title-edit';
		garEditPanelH2Elt.textContent = 'Modifier'
		this._garEditPanelElt.appendChild(garEditPanelH2Elt);

		// generate go back btn and append it after title
		const goBackToSubscriptionListBtn = this._createGoBackBtnAndRelatedEventListener()
		this._garEditPanelElt.insertBefore(goBackToSubscriptionListBtn, garEditPanelH2Elt.nextSibling)

		let garEditPanelContent = document.createElement('div')
		garEditPanelContent.id = 'gar-subscriptions-content-edit'
		this._garEditPanelElt.appendChild(garEditPanelContent)
	}

	_createDeletePanel() {
		this._garDeletePanelElt = document.createElement('div');
		this._garDeletePanelElt.id = 'classroom-dashboard-gar-subscriptions-delete-panel';
		this._garDeletePanelElt.classList.add('dashboard-block');
		this._garDeletePanelElt.classList.add('p-2');
		this._garDeletePanelElt.style.display = 'none';
		let garDeletePanelH2Elt = document.createElement('h2');
		garDeletePanelH2Elt.id = 'gar-subscriptions-title-delete';
		garDeletePanelH2Elt.textContent = 'Supprimer'
		this._garDeletePanelElt.appendChild(garDeletePanelH2Elt);

		// generate go back btn and append it after title
		const goBackToSubscriptionListBtn = this._createGoBackBtnAndRelatedEventListener()
		this._garDeletePanelElt.insertBefore(goBackToSubscriptionListBtn, garDeletePanelH2Elt.nextSibling)

		let garDeletePanelContent = document.createElement('div')
		garDeletePanelContent.id = 'gar-subscriptions-content-delete'
		this._garDeletePanelElt.appendChild(garDeletePanelContent)

	}
	_generateSubscriptionsListOutput() {
		let mainOutput = ''
		let dataOutput = ''

		this._loadedSubscriptions.map(subscription => {
			return dataOutput += `
				<tr>
					<td>${subscription.idAbonnement}</td>
					<td class="font-weight-bold">${subscription.commentaireAbonnement}</td>
					<td>${(new Date(subscription.debutValidite)).toLocaleDateString()}</td>
					<td>${(new Date(subscription.finValidite)).toLocaleDateString()}</td>
					<td>
						<a class="showBtn" data-id="${subscription.idAbonnement}" ><i class="fas fa-eye fa-2x c-link-primary"></i></a>
					</td>
					<td>
						<a class="editBtn" data-id="${subscription.idAbonnement}"><i class="fas fa-pencil-alt fa-2x c-link-secondary "></i></a>
					</td>
					<td>
						<a class="deleteBtn" data-id="${subscription.idAbonnement}"><i class="fas fa-trash-alt fa-2x c-link-red "></i></a>
					</td>
				</tr>
			`
		})

		mainOutput = `
			<table class="table c-table">
				<thead>
					<tr>
						<th scope="col" data-i18n="">#ID</th>
						<th scope="col" data-i18n="">Commentaire</th>
						<th scope="col" data-i18n="">Début</th>
						<th scope="col" data-i18n="">Fin</th>
						<th scope="col" data-i18n="">Détails</th>
						<th scope="col" data-i18n="">Modifier</th>
						<th scope="col" data-i18n="">Supprimer</th>
					</tr>
				</thead>
				<tbody id="gar-subscription-list">
					${dataOutput}
				</tbody>
			</table>
		`
		return mainOutput
	}

	_generateNewSubscriptionContent() {
		return `
			<form class="row" id="createSubscriptionForm" onsubmit="garNavigationItem.handleCreate(event)" >
				<div class="col-12 mb-3 c-secondary-form">
					<label for="idAbonnement">ID | format: "un_id_unique" ou "unIdUnique" (45 caractères max)</label>
					<input type="text" class="form-control" id="idAbonnement" name="idAbonnement">
					<input type="hidden" class="form-control" id="idAbonnementOld" name="idAbonnementOld">
					<p class="errors text-danger" id="idAbonnementIsEmpty" style="display:none;">L'identifiant est requis (45 caratères maximum).</p>
					<p class="errors text-danger" id="idAbonnementStartsWithForbiddenCharacter" style="display:none;">L'identifiant ne peut commencer par un underscore.</p>
					<p class="errors text-danger" id="idAbonnementForbiddenWhiteSpace" style="display:none;">L'identifiant ne peut contenir d'espace.</p>
					<p class="errors text-danger" id="idAbonnementIsTooLong" style="display:none;">L'identifiant est trop long (45 caratères maximum).</p>
				</div>
				<div class="col-12 mb-3 c-secondary-form">
					<label for="commentaireAbonnement">Commentaire/Nom (255 caractères max.)</label>
					<input type="text" class="form-control" id="commentaireAbonnement" name="commentaireAbonnement">
					<p class="errors text-danger" id="commentaireAbonnementIsEmpty" style="display:none;">Le commentaire/nom de l'abonnement est requis.</p>
					<p class="errors text-danger" id="commentaireAbonnementIsTooLong" style="display:none;">Le commentaire/nom de l'abonnement est limité à 255 caractères.</p>
				</div>
				<div class="col-md-6 mb-3 c-secondary-form">
					<label for="debutValidite">Début validité </label>
					<input type="date" class="form-control" id="debutValidite" name="debutValidite" value="${new Date().toISOString().substring(0, 10)}">
					<p class="errors text-danger" id="debutValiditeIsEmpty" style="display:none;">La date de début de validité ne peut être vide</p>
					<p class="errors text-danger" id="debutValiditeIsInvalid" style="display:none;">La date de début n'est pas valide</p>
					<p class="errors text-danger" id="debutValiditeIsTooEarly" style="display:none;">La date de début ne peut être antérieure à ${new Date().getFullYear() - 1}</p>
				</div>
				<div class="col-md-6 mb-3 c-secondary-form">
					<label for="finValidite">fin validité (début de validité + 10 ans max)</label>
					<input type="date" class="form-control" id="finValidite" name="finValidite">
					<p class="errors text-danger" id="finValiditeIsEmpty" style="display:none;">La date de fin de validité ne peut être vide</p>
					<p class="errors text-danger" id="finValiditeIsInvalid" style="display:none;">La date de fin n'est pas valide</p>
					<p class="errors text-danger" id="finValiditeHasToBeGreaterThanToday" style="display:none;">La date de fin ne peut être antérieure à aujourd'hui</p>
					<p class="errors text-danger" id="finValiditeIsToFar" style="display:none;">La date de fin ne peut excéder de 10 ans la date de début</p>
				</div>
				<div class="col-md-12 mb-3 c-secondary-form">
					<label for="uaiEtab">UAI en majuscule sans accents (45 caractères max)</label>
					<input type="text" class="form-control" id="uaiEtab" name="uaiEtab">
					<p class="errors text-danger" id="uaiEtabIsEmpty" style="display:none;">L'UAI de l'établissement est requis.</p>
					<p class="errors text-danger" id="uaiEtabIsTooLong" style="display:none;">L'UAI de l'établissement est trop long (45 caractères max)</p>
				</div>

				<div class="form-check m-3">
					<input class="form-check-input" type="radio" name="licences" id="customLicences" value="customLicences"  onclick="garNavigationItem.handleLicencesCheckboxChecked(event)"
					${ (this._useGlobalLicences === false) ? 'checked' : ''}>
					<label class="form-check-label" for="customLicences">
						Utiliser les licences custom
					</label>
				</div>
				<div class="form-check m-3">
					<input class="form-check-input" type="radio" name="licences" id="globalLicences" value="globalLicences" onclick="garNavigationItem.handleLicencesCheckboxChecked(event)"
					${ (this._useGlobalLicences !== false ) ? 'checked' : ''}>
					<label class="form-check-label" for="customLicences">
						Utiliser les licences globales
					</label>
				</div>

				<div class="col-12">
					<div id="licencesInputs" class="row">
						
					</div>
				</div>
				
				<div class="col-12 mb-3 c-secondary-form">
					<label for="publicCible" class="form-label">Public cible (maintenir ctrl + cliquer sur un plusieurs public cible)</label>
					<select name="publicCible" id="publicCible" name="publicCible[]" class="w-100 form-select-lg mb-3" multiple >
						<option value="ELEVE">ELEVE</option>
						<option value="ENSEIGNANT">ENSEIGNANT</option>
						<option value="DOCUMENTALISTE">DOCUMENTALISTE</option>
						<option value="AUTRE PERSONNEL">AUTRE PERSONNEL</option>
					</select>
					<p class="errors text-danger" id="publicCibleIsEmpty" style="display:none;">Le public cible est requis.</p>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="categorieAffectation" class="form-label">Catégorie d'affectation (valeur recommandée par le GAR: transférable)</label>
					<select name="categorieAffectation" id="categorieAffectation" name="categorieAffectation" class="w-100 form-select-lg mb-3">
						<option value="transferable">transferable</option>
						<option value="non transferable" >non transferable</option>
						<option value="flottante" >flottante</option>
					</select>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="typeAffectation" class="form-label">Type d'affectation (valeur recommandée par le GAR: INDIVIDUEL)</label>
					<select name="typeAffectation" id="typeAffectation" name="typeAffectation" class="w-100 form-select-lg mb-3">
						<option value="INDIV" >INDIVIDUEL</option>
						<option value="ETABL" >ÉTABLISSEMENT</option>
					</select>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="idDistributeurCom" class="form-label">Identifiant distributeur commercial (26 caractères max)</label>
					<input type="text" class="form-control" id="idDistributeurCom" name="idDistributeurCom" value="${this.idDistributeurCom}" >
					<p class="errors text-danger" id="idDistributeurComIsEmpty" style="display:none;">L'identifiant distributeur est requis.</p>
					<p class="errors text-danger" id="idDistributeurComIsTooLong" style="display:none;">L'identifiant distributeur trop long (26 caractères max).</p>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="idRessource" class="form-label">Identifiant de la ressource (1024 caractères max)</label>
					<textarea name="idRessource" id="idRessource" cols="30" rows="2" class="form-control">${this.idRessource}</textarea>
					<p class="errors text-danger" id="idRessourceIsEmpty" style="display:none;">L'identifiant de la ressource est requis.</p>
					<p class="errors text-danger" id="idRessourceIsTooLong" style="display:none;">L'identifiant de la ressource est trop long (1024 caractères max).</p>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="typeIdRessource" class="form-label">Type identifiant de la ressource (50 caractères max)</label>
					<input type="text" class="form-control" id="typeIdRessource" name="typeIdRessource" value="${this.typeIdRessource}">
					<p class="errors text-danger" id="typeIdRessourceIsEmpty" style="display:none;">Le type identifiant de la ressource est requis.</p>
					<p class="errors text-danger" id="typeIdRessourceIsTooLong" style="display:none;">Le type identifiant de la ressource est trop long (50 caractères max).</p>
				</div>

				
				<div class="col-12 mb-3 c-secondary-form">
					<label for="libelleRessource" class="form-label">Libellé de la ressource (255 caractères max)</label>
					<input type="text" class="form-control" id="libelleRessource" name="libelleRessource" value="${this.libelleRessource}">
					<p class="errors text-danger" id="libelleRessourceIsEmpty" style="display:none;">Le libellé de la ressource est requis.</p>
					<p class="errors text-danger" id="libelleRessourceIsTooLong" style="display:none;">Le libellé de la ressource est trop long (255 caractères max).</p>
				</div>

				<div class="col-12 mt-4">
					<button type="submit"  class="btn c-btn-secondary my-3" >Créer</button>
				</div>
			</form>
		`
	}

	_generateShowContent() {
		const publicCible = this._currentSubscription.publicCible.join(', ')

		const unlimitedLicencesLi = typeof this._currentSubscription.nbLicenceGlobale === 'string'
			? `<li>Nombre de licence globale : ${this._currentSubscription.nbLicenceGlobale}</li>`
			: ''
		const countTeacherLicencesLi = typeof this._currentSubscription.nbLicenceEnseignant === 'string'
			? `<li>Nombre de licence Professeur : ${this._currentSubscription.nbLicenceEnseignant}</li>`
			: ''
		const countStudentLicencesLi = typeof this._currentSubscription.nbLicenceEleve === 'string'
			? `<li>Nombre de licence élève : ${this._currentSubscription.nbLicenceEleve}</li>`
			: ''
		const countTeacherDocLicencesLi = typeof this._currentSubscription.nbLicenceProfDoc === 'string'
			? `<li>Nombre de licence professeur documentaliste : ${this._currentSubscription.nbLicenceProfDoc}</li>`
			: ''
		const countOtherEmployeeLicencesLi = typeof this._currentSubscription.nbLicenceAutrePersonnel === 'string'
			? `<li>Nombre de licence autre personnel : ${this._currentSubscription.nbLicenceAutrePersonnel}</li>`
			: ''
		return `
			<ul>
				<li>#ID : ${this._currentSubscription.idAbonnement}</li>
				<li>Commentaire : ${this._currentSubscription.commentaireAbonnement}</li>
				<li>Début de validité : ${(new Date(this._currentSubscription.debutValidite)).toLocaleDateString()}</li>
				<li>Fin de validité : ${(new Date(this._currentSubscription.finValidite)).toLocaleDateString()}</li>
				<li>UAI : ${this._currentSubscription.uaiEtab}</li>
				${unlimitedLicencesLi}
				${countTeacherLicencesLi}
				${countStudentLicencesLi}
				${countTeacherDocLicencesLi}
				${countOtherEmployeeLicencesLi}
				<li>Public cible : ${publicCible}</li>
				<li>Catégorie d'affectation : ${this._currentSubscription.categorieAffectation}</li>
				<li>Type d'affectation : ${this._currentSubscription.typeAffectation}</li>
				<li>Distributeur commercial : ${this._currentSubscription.idDistributeurCom}</li>
				<li>Identifiant de la ressource : ${this._currentSubscription.idRessource}</li>
				<li>Type Identifiant de la ressource : ${this._currentSubscription.typeIdRessource}</li>
				<li>Libellè de la ressource : ${this._currentSubscription.libelleRessource}</li>
			</ul>
		`
	}

	_generateEditContent() {
		return `
			<form class="row" id="updateSubscriptionForm" onsubmit="garNavigationItem.handleUpdate(event)" >
				<div class="col-12 mb-3 c-secondary-form">
					<label for="idAbonnement">ID (non modifiable)</label>
					<input type="text" class="form-control" id="idAbonnement" name="idAbonnement" value="${this._currentSubscription.idAbonnement}" disabled>
					<input type="hidden" class="form-control" id="idAbonnementOld" name="idAbonnementOld" value="${this._currentSubscription.idAbonnement}">
					<p class="errors text-danger" id="idAbonnementIsEmpty" style="display:none;">L'identifiant est requis (45 caratères maximum).</p>
					<p class="errors text-danger" id="idAbonnementIsTooLong" style="display:none;">L'identifiant est trop long (45 caratères maximum).</p>
					<p class="errors text-danger" id="idAbonnementDoNotMatchIdAbonnementOld" style="display:none;">L'identifiant ne peut être modifier.</p>
				</div>
				<div class="col-12 mb-3 c-secondary-form">
					<label for="commentaireAbonnement">Commentaire/Nom (255 caractères max.)</label>
					<input type="text" class="form-control" id="commentaireAbonnement" name="commentaireAbonnement" value="${this._currentSubscription.commentaireAbonnement}">
					<p class="errors text-danger" id="commentaireAbonnementIsEmpty" style="display:none;">Le commentaire/nom de l'abonnement est requis.</p>
					<p class="errors text-danger" id="commentaireAbonnementIsTooLong" style="display:none;">Le commentaire/nom de l'abonnement est limité à 255 caractères.</p>
				</div>
				<div class="col-md-6 mb-3 c-secondary-form">
					<label for="debutValidite">Début validité </label>
					<input type="date" class="form-control" id="debutValidite" name="debutValidite" value="${new Date(this._currentSubscription.debutValidite).toISOString().substring(0, 10)}" disabled>
					<p class="errors text-danger" id="debutValiditeIsTooEarly" style="display:none;">La date de début ne peut être antérieure à ${new Date().getFullYear() - 1}</p>
				</div>
				<div class="col-md-6 mb-3 c-secondary-form">
					<label for="finValidite">fin validité</label>
					<input type="date" class="form-control" id="finValidite" name="finValidite" value="${new Date(this._currentSubscription.finValidite).toISOString().substring(0, 10)}">
					<p class="errors text-danger" id="finValiditeHasToBeGreaterThanToday" style="display:none;">La date de fin ne peut être antérieure à aujourd'hui</p>
					<p class="errors text-danger" id="finValiditeIsToFar" style="display:none;">La date de fin ne peut excéder de 10 ans la date de début</p>
				</div>
				<div class="col-md-12 mb-3 c-secondary-form">
					<label for="uaiEtab">UAI </label>
					<input type="text" class="form-control" id="uaiEtab" name="uaiEtab" value="${this._currentSubscription.uaiEtab}" >
					<p class="errors text-danger" id="uaiEtabIsEmpty" style="display:none;">L'UAI de l'établissement est requis.</p>
					<p class="errors text-danger" id="uaiEtabIsTooLong" style="display:none;">L'UAI de l'établissement est trop long (45 caractères max)</p>
				</div>

				<div class="form-check m-3">
					<input class="form-check-input" type="radio" name="licences" id="customLicences" value="customLicences"  onclick="garNavigationItem.handleLicencesCheckboxChecked(event)"
					${ typeof this._currentSubscription.nbLicenceGlobale === 'undefined' ? 'checked' : ''}>
					<label class="form-check-label" for="customLicences">
						Utiliser les licences custom
					</label>
				</div>
				<div class="form-check m-3">
					<input class="form-check-input" type="radio" name="licences" id="globalLicences" value="globalLicences" onclick="garNavigationItem.handleLicencesCheckboxChecked(event)"
					${ typeof this._currentSubscription.nbLicenceGlobale !== 'undefined' ? 'checked' : ''}>
					<label class="form-check-label" for="customLicences">
						Utiliser les licences globales
					</label>
				</div>

				<div class="col-12">
					<div id="licencesInputs" class="row">
						
					</div>
				</div>
				
				<div class="col-12 mb-3 c-secondary-form">
					<label for="publicCible" class="form-label">Public cible</label>
					<select name="publicCible" id="publicCible" name="publicCible[]" class="w-100 form-select-lg mb-3" multiple >
						<option value="ELEVE" ${this._currentSubscription.publicCible.includes('ELEVE') ? 'selected' : ''}>ELEVE</option>
						<option value="ENSEIGNANT"  ${this._currentSubscription.publicCible.includes('ENSEIGNANT') ? 'selected' : ''}>ENSEIGNANT</option>
						<option value="DOCUMENTALISTE"  ${this._currentSubscription.publicCible.includes('DOCUMENTALISTE') ? 'selected' : ''}>DOCUMENTALISTE</option>
						<option value="AUTRE PERSONNEL"  ${this._currentSubscription.publicCible.includes('AUTRE PERSONNEL') ? 'selected' : ''}>AUTRE PERSONNEL</option>
					</select>
					<p class="errors text-danger" id="publicCibleIsEmpty" style="display:none;">Le public cible est requis.</p>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="categorieAffectation" class="form-label">Catégorie d'affectation (valeur recommandée par le GAR: transférable)</label>
					<select name="categorieAffectation" id="categorieAffectation" name="categorieAffectation" class="w-100 form-select-lg mb-3">
						<option value="transferable"  ${this._currentSubscription.categorieAffectation === 'transferable' ? 'selected' : ''}>transferable</option>
						<option value="non transferable"  ${this._currentSubscription.categorieAffectation === 'non transferable' ? 'selected' : ''}>non transferable</option>
						<option value="flottante"  ${this._currentSubscription.categorieAffectation === 'flottante' ? 'selected' : ''}>flottante</option>
					</select>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="typeAffectation" class="form-label">Type d'affectation (valeur recommandée par le GAR: INDIVIDUEL)</label>
					<select name="typeAffectation" id="typeAffectation" name="typeAffectation" class="w-100 form-select-lg mb-3">
						<option value="INDIV"  ${this._currentSubscription.typeAffectation === 'INDIV' ? 'selected' : ''}>INDIVIDUEL</option>
						<option value="ETABL"  ${this._currentSubscription.typeAffectation === 'ETABL' ? 'selected' : ''}>ÉTABLISSEMENT</option>
					</select>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="idDistributeurCom" class="form-label">Identifiant distributeur commercial (26 caractères max)</label>
					<input type="text" class="form-control" id="idDistributeurCom" name="idDistributeurCom" value="${this._currentSubscription.idDistributeurCom}">
					<p class="errors text-danger" id="idDistributeurComIsEmpty" style="display:none;">L'identifiant distributeur est requis.</p>
					<p class="errors text-danger" id="idDistributeurComIsTooLong" style="display:none;">L'identifiant distributeur trop long (26 caractères max).</p>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="idRessource" class="form-label">Identifiant de la ressource (1024 caractères max)</label>
					<textarea name="idRessource" id="idRessource" cols="30" rows="2" class="form-control text-left">${this._currentSubscription.idRessource}</textarea>
					<p class="errors text-danger" id="idRessourceIsEmpty" style="display:none;">L'identifiant de la ressource est requis.</p>
					<p class="errors text-danger" id="idRessourceIsTooLong" style="display:none;">L'identifiant de la ressource est trop long (1024 caractères max).</p>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="typeIdRessource" class="form-label">Type identifiant de la ressource (50 caractères max)</label>
					<input type="text" class="form-control" id="typeIdRessource" name="typeIdRessource" value="${this._currentSubscription.typeIdRessource}">
					<p class="errors text-danger" id="typeIdRessourceIsEmpty" style="display:none;">Le type identifiant de la ressource est requis.</p>
					<p class="errors text-danger" id="typeIdRessourceIsTooLong" style="display:none;">Le type identifiant de la ressource est trop long (50 caractères max).</p>
				</div>

				
				<div class="col-12 mb-3 c-secondary-form">
					<label for="libelleRessource" class="form-label">Libellé de la ressource (255 caractères max)</label>
					<input type="text" class="form-control" id="libelleRessource" name="libelleRessource" value="${this._currentSubscription.libelleRessource}">
					<p class="errors text-danger" id="libelleRessourceIsEmpty" style="display:none;">Le libellé de la ressource est requis.</p>
					<p class="errors text-danger" id="libelleRessourceIsTooLong" style="display:none;">Le libellé de la ressource est trop long (255 caractères max).</p>
				</div>

				<div class="col-12 mt-4">
					<button type="submit"  class="btn c-btn-secondary my-3" >Modifier</button>
				</div>
			</form>
		`
	}

	_generateDeleteContent() {
		return `
			<form id="deleteSubscription" onsubmit="garNavigationItem.handleDelete(event)">
				<input type="hidden" name="subscriptionIdToDelete" name="subscriptionIdToDelete" value="${this._currentSubscription.idAbonnement}" />
				<input type="submit" value="Supprimer" class="btn c-btn-red my-3" />
			</form>
		`

	}

	_generateModals() {
		const modalsData = this._getModalsData()
		for (let modal in modalsData) {
			const currentModal = new Modal(modal, modalsData[modal]);
			document.querySelector('body').appendChild(currentModal)
		}
	}

	_getModalsData() {
		return {
			'modal-1': {
				selector: '',
				header: {
					icon: '',
					title: 'classroom.modals.addStudentByCsv.title'
				},
				content: `<div class="text-center mx-auto w-100 mh-100 mb-2">
						<p>Mon modal 1</p>
					</div>`,
				footer: ``
			},
			'modal-2': {
				selector: '',
				header: {
					icon: '',
					title: 'modals.ai-interface.not-available.title'
				},
				content: `<div class="text-center mx-auto w-100 mh-100 mb-2">
						<p>Mon modal 2</p>
					</div>`,
				footer: ``
			}
		}
	}

	_generateLicencesFieldsToDisplay(context=null) {
		// setup defaulst values (creation context)
		const data = {}
		data.unlimitedLicencesInputValue =  ''
		data.countTeacherLicencesInputValue = ''
		data.countStudentLicencesInputValue = ''
		data.countTeacherDocLicencesInputValue =''
		data.countOtherEmployeeLicencesInputValue = ''
		let licencesInputs = document.querySelector('#createSubscriptionForm #licencesInputs')

		if(context === 'update'){
			// override default value (update context)
			data.unlimitedLicencesInputValue = typeof this._currentSubscription.nbLicenceGlobale === 'string'
				? this._currentSubscription.nbLicenceGlobale
				: ''
			data.countTeacherLicencesInputValue = typeof this._currentSubscription.nbLicenceEnseignant === 'string'
				? this._currentSubscription.nbLicenceEnseignant
				: ''
			data.countStudentLicencesInputValue = typeof this._currentSubscription.nbLicenceEleve === 'string'
				? this._currentSubscription.nbLicenceEleve
				: ''
			data.countTeacherDocLicencesInputValue = typeof this._currentSubscription.nbLicenceProfDoc === 'string'
				? this._currentSubscription.nbLicenceProfDoc
				: ''
			data.countOtherEmployeeLicencesInputValue = typeof this._currentSubscription.nbLicenceAutrePersonnel === 'string'
				? this._currentSubscription.nbLicenceAutrePersonnel
				: ''

			licencesInputs = document.querySelector('#updateSubscriptionForm #licencesInputs')
		}

		// initialize/reset depending on the context
		licencesInputs.innerHTML = ''
		let output = ''

		if (this._useGlobalLicences === true) {
			output = `
				<div class="col-12 mb-3 c-secondary-form">
					<label for="nbLicenceGlobale" class="form-label">Nombre de licence globale (valeurs autorisées par le GAR: nombre ou ILLIMITE)</label>
					<input type="text" class="form-control" id="nbLicenceGlobale" name="nbLicenceGlobale" value="${data.unlimitedLicencesInputValue}">
					<p class="errors text-danger" id="nbLicenceGlobaleIsEmpty" style="display:none;">Le nombre de licence globale est requis (nombre ou ILLIMITE).</p>
					<p class="errors text-danger" id="nbLicenceGlobaleIsTooLong" style="display:none;">La valeur est trop long (8 caractères max).</p>
				</div>	
			`
		} else {
			output = `
			<div class="col-6 mb-3 c-secondary-form">
				<label for="nbLicenceEnseignant" class="form-label">Nombre de licence enseignant (valeurs autorisées par le GAR: nombre ou ILLIMITE)</label>
				<input type="text" class="form-control" id="nbLicenceEnseignant" name="nbLicenceEnseignant" value="${data.countTeacherLicencesInputValue}">
				<p class="errors text-danger" id="nbLicenceEnseignantIsEmpty" style="display:none;">Le nombre de licence enseignant est requis (nombre ou ILLIMITE).</p>
				<p class="errors text-danger" id="nbLicenceEnseignantIsTooLong" style="display:none;">La valeur est trop long (8 caractères max).</p>
			</div>	
			<div class="col-6 mb-3 c-secondary-form">
				<label for="nbLicenceEleve" class="form-label">Nombre de licence élève (valeurs autorisées par le GAR: nombre ou ILLIMITE)</label>
				<input type="text" class="form-control" id="nbLicenceEleve" name="nbLicenceEleve" value="${data.countStudentLicencesInputValue}">
				<p class="errors text-danger" id="nbLicenceEleveIsEmpty" style="display:none;">Le nombre de licence 2L7VE est requis (nombre ou ILLIMITE).</p>
				<p class="errors text-danger" id="nbLicenceEleveIsTooLong" style="display:none;">La valeur est trop long (8 caractères max).</p>
			</div>
			<div class="col-6 mb-3 c-secondary-form">
				<label for="nbLicenceProfDoc" class="form-label">Nombre de licence professeur documentaliste (valeurs autorisées par le GAR: nombre ou ILLIMITE)</label>
				<input type="text" class="form-control" id="nbLicenceProfDoc" name="nbLicenceProfDoc" value="${data.countTeacherDocLicencesInputValue}">
				<p class="errors text-danger" id="nbLicenceProfDocIsEmpty" style="display:none;">Le nombre de licence prof/doc est requis (nombre ou ILLIMITE).</p>
				<p class="errors text-danger" id="nbLicenceProfDocIsTooLong" style="display:none;">La valeur est trop long (8 caractères max).</p>
			</div>
			<div class="col-6 mb-3 c-secondary-form">
				<label for="nbLicenceAutrePersonnel" class="form-label">Nombre de licence autre personnel (valeurs autorisées par le GAR: nombre ou ILLIMITE)</label>
				<input type="text" class="form-control" id="nbLicenceAutrePersonnel" name="nbLicenceAutrePersonnel" value="${data.countOtherEmployeeLicencesInputValue}">
				<p class="errors text-danger" id="nbLicenceAutrePersonnelIsEmpty" style="display:none;">Le nombre de licence autre personnel est requis (nombre ou ILLIMITE).</p>
				<p class="errors text-danger" id="nbLicenceAutrePersonnelIsTooLong" style="display:none;">La valeur est trop long (8 caractères max).</p>
			</div>
		`
		}
		licencesInputs.innerHTML = output

	}
	handleLicencesCheckboxChecked(event) {
		const licencesCheckboxes = document.querySelectorAll('[name="licences"]')
		licencesCheckboxes.forEach(checkbox => checkbox.removeAttribute('checked'))
		event.target.setAttribute('checked', true)
		this._useGlobalLicences = event.target.value === 'globalLicences' ? true : false
		this._generateLicencesFieldsToDisplay()
	}

	async handleCreate(event) {
		event.preventDefault()
		const currentErrorsDisplayed = document.querySelectorAll('#createSubscriptionForm .errors')
		currentErrorsDisplayed.forEach( errorElement => errorElement.style.display = 'none')
		// bind incoming data
		const subscriptionToCreate = this._bindIncomingData(event)
		const response = await fetch('/routing/Routing.php?controller=gar_subscription&action=create_subscription', {
			headers: {
				"Content-type": "application/json"
			},
			method: 'POST',
			body: JSON.stringify(subscriptionToCreate)

		})
		const data = await response.json()
		if(data.errors){
			const {errors} = data
			errors.forEach( error => {
				let currentErrorElement = document.querySelector(`#${error.errorType}`)
				if(currentErrorElement) currentErrorElement.style.display = 'block'
			})
		}
	}

	async handleUpdate(event) {
		event.preventDefault()
		const currentErrorsDisplayed = document.querySelectorAll('#updateSubscriptionForm .errors')
		currentErrorsDisplayed.forEach( errorElement => errorElement.style.display = 'none')
		// bind incoming data
		const subscriptionToUpdate = this._bindIncomingData(event)

		const response = await fetch('/routing/Routing.php?controller=gar_subscription&action=update_subscription', {
			headers: {
				"Content-type": "application/json"
			},
			method: 'POST',
			body: JSON.stringify(subscriptionToUpdate)

		})
		const data = await response.json()
		if(data.errors){
			const {errors} = data
			errors.forEach( error => {
				let currentErrorElement = document.querySelector(`#${error.errorType}`)
				if(currentErrorElement) currentErrorElement.style.display = 'block'
			})
		}
	}

	async handleDelete(event){
		event.preventDefault()
		const response = await fetch('/routing/Routing.php?controller=gar_subscription&action=delete_subscription', {
			headers: {
				"Content-type": "application/json"
			},
			method: 'POST',
			body: JSON.stringify({idAbonnement: this._currentSubscription.idAbonnement})

		})
		const data = await response.json()
		
	}

	_bindIncomingData(event) {
		const formEntries = {}
		const currentForm = event.target.id === 'updateSubscriptionForm'
			? document.querySelector('#updateSubscriptionForm')
			: document.querySelector('#createSubscriptionForm')

		if (currentForm.id === 'updateSubscriptionForm') {
			formEntries.idAbonnementOld = currentForm.querySelector('#idAbonnementOld').value
		}
		formEntries.licences = currentForm.querySelector('[name="licences"]:checked').value
		formEntries.idAbonnement = currentForm.querySelector('#idAbonnement').value ?? null
		formEntries.commentaireAbonnement = currentForm.querySelector('#commentaireAbonnement').value ?? null
		formEntries.uaiEtab = currentForm.querySelector('#uaiEtab').value ?? null
		formEntries.debutValidite = currentForm.querySelector('#debutValidite').value ?? null
		formEntries.finValidite = currentForm.querySelector('#finValidite').value ?? null
		if (formEntries.licences === 'globalLicences') {
			formEntries.nbLicenceGlobale = currentForm.querySelector('#nbLicenceGlobale').value ?? null
		} else {
			formEntries.nbLicenceEnseignant = currentForm.querySelector('#nbLicenceEnseignant').value ?? null
			formEntries.nbLicenceEleve = currentForm.querySelector('#nbLicenceEleve').value ?? null
			formEntries.nbLicenceProfDoc = currentForm.querySelector('#nbLicenceProfDoc').value ?? null
			formEntries.nbLicenceAutrePersonnel = currentForm.querySelector('#nbLicenceAutrePersonnel').value ?? null
		}
		formEntries.categorieAffectation = currentForm.querySelector('#categorieAffectation').value ?? null
		formEntries.typeAffectation = currentForm.querySelector('#typeAffectation').value ?? null
		formEntries.idDistributeurCom = currentForm.querySelector('#idDistributeurCom').value ?? null
		formEntries.idRessource = currentForm.querySelector('#idRessource').value ?? null
		formEntries.typeIdRessource = currentForm.querySelector('#typeIdRessource').value ?? null
		formEntries.libelleRessource = currentForm.querySelector('#libelleRessource').value ?? null
		const publicCibleOptions = currentForm.querySelector('#publicCible').children
		formEntries.publicCible = Array.from(publicCibleOptions).reduce((accumulator, currentOption) => {
			if (currentOption.selected) accumulator.push(currentOption.value)
			return accumulator
		}, [])

		return formEntries
	}


}

const garNavigationItem = new GarNavigationItem()
garNavigationItem.init()
