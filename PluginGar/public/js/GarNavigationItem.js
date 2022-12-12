class GarNavigationItem {

	constructor() {
		// The navigation button element before which the newly created one will be inserted
		this._nextNavigationMenuElt = document.getElementById('dashboard-profil-manager');
		// The custom navigation button element
		this._newNavigationButtonElt;
		// The gar panel element
		this._garSubscriptionPanelElt;

		// initialize default variables
		this._loadedSubscriptions = []
		this._currentSubscription = {}
		this._useGlobalLicences = false
		this._currentContext = null
		this._subscriptionsPerPage = 2
		this._currentPage = 1

		// initialize specific variables related to subscriptions requests
		this.idDistributeurCom = '837973296_0000000000000000'
		this.idRessource = 'ark:/49591/Vittascience'
		this.typeIdRessource = 'ark'
		this.libelleRessource = 'Vittascience - programmation informatique de cartes et console Python'
	}

	/**
	 * The method that initialize everything
	 */
	init() {

		// generate panels default content
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

		// generate a new button to access the main subscription panel
		this._createNewNavigationButton();
		this._nextNavigationMenuElt.parentElement.insertBefore(this._newNavigationButtonElt, this._nextNavigationMenuElt);
		this._createNewDisplayPanelBehavior();
		// Attach the navigatePanel function to the click event on the newly appended navigation button
		this._newNavigationButtonElt.addEventListener('click', () => {
			this._createSubscriptionListAndRelatedEventListeners()
			
			// This function takes 2 arguments : the first is the id of the panel to open. The second is the id of the button that will be active after navigation.
			navigatePanel('classroom-dashboard-gar-subscriptions-panel', 'dashboard-manager-gar-subscriptions');
		});
	}

	/**
	 * Manage the creation of the Main gar panel element
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

		// create header section
		const garListPanelHeaderElt = document.createElement('header')
		// garListPanelHeaderElt.classList.add('d-flex')
		// garListPanelHeaderElt.classList.add('justify-content-between')
		// garListPanelHeaderElt.classList.add('my-3')
		garListPanelHeaderElt.innerHTML = `
			<div class="d-flex justify-content-between my-3">
				<h2 id="gar-subscriptions-title">Liste des abonnements</h2>
				<button class="btn c-btn-outline-primary" id="new-subscription-panel">Ajouter un abonnement</button>
			</div>
			
			<div class="row my-3 c-primary-form justify-content-between" id="subscriptions_options">
				<!-- Search bar -->
				<form class="col col-md-6  d-flex align-items-center">
					<input class="flex-fill" type="search" id="name_group_search" placeholder="Rechercher" aria-label="Search">
					<button class="btn c-btn-primary" id="search_group" style="width: 3em; height: 3em;">
						<i class="fas fa-search"></i>
					</button>
				</form>
				
				<!-- View filter -->
				<div class="col text-right">
					<form>
						<label for="subscriptions_per_page">abonnements par page</label>
						<select name="subscriptions_per_page" id="subscriptions_per_page" class="form-select" onchange="garNavigationItem.handleSubscriptionsPerPageChange(event)">
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="5">5</option>
						</select>
					</form>
				</div>
			</div>
		`
		

		// create content div
		let garListPanelContent = document.createElement('div')
		garListPanelContent.id = 'gar-subscriptions-content'

	
		// create pagination section
		let garListPanelPagination = document.createElement('div')
		garListPanelPagination.id = 'gar-subscriptions-pagination'
		garListPanelPagination.innerHTML = `
			<nav onclick="garNavigationItem.handleNavigation(event)" aria-label="subscriptions pagination">
				<ul class="pagination">
					<li class="page-item">
						<a class="page-link" id="previous" aria-label="Previous">
							<span aria-hidden="true">&laquo;</span>
						</a>
					</li>
					<li class="page-item"><a class="page-link" id="current-page" disabled>${this._currentPage}</a></li>
					<li class="page-item">
						<a class="page-link" id="next" aria-label="Next">
							<span aria-hidden="true">&raquo;</span>
						</a>
					</li>
				</ul>
			</nav>
		`
		// append elements to the DOM
		this._garSubscriptionPanelElt.appendChild(garListPanelHeaderElt);
		this._garSubscriptionPanelElt.appendChild(garListPanelContent)
		this._garSubscriptionPanelElt.appendChild(garListPanelPagination)
	}

	/**
	 * Manage the creation of the custom navigation button element
	 */
	_createNewNavigationButton() {

		// create and set up the elements
		this._newNavigationButtonElt = document.createElement('div');
		this._newNavigationButtonElt.id = 'dashboard-manager-gar-subscriptions';
		this._newNavigationButtonElt.classList.add('classroom-navbar-button');

		let buttonImageElt = document.createElement('img');
		buttonImageElt.src = "/openClassroom/classroom/assets/media/my_classes.svg";

		let buttonSpanElt = document.createElement('span');
		// For the addition of custom i18next translations, see the translation plugin example
		buttonSpanElt.setAttribute('data-i18n', 'classroom.ids.myCustomNavigationButton');
		buttonSpanElt.textContent = 'Abo Gar';

		// append elements to the DOM
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
			// get the title element and set its text content
			const customPanelTitle = document.querySelector('#gar-subscriptions-title')
			customPanelTitle.textContent = 'Liste des abonnements'
		}
	}

	 async _createSubscriptionListAndRelatedEventListeners(){
		
			// fetch subscriptions list
			const response = await fetch('/routing/Routing.php?controller=gar_subscription&action=get_subscription_list', {
				headers:{
					"Content-Type":"application/x-www-form-urlencoded"
				},
				method: 'POST',
				body: `current_page=${this._currentPage}&per_page=${this._subscriptionsPerPage}`
			})
			const data = await response.json()
			const subscriptionsCount = data.count

			// reset
			this._loadedSubscriptions = []
			let garListPanelContent = document.querySelector('#gar-subscriptions-content')
			garListPanelContent.innerHTML = ''

			if(subscriptionsCount === 0){
				return garListPanelContent.innerHTML = "PAS DE DONNEES A AFFICHER"
			}
			else if(subscriptionsCount === 1) this._loadedSubscriptions.push(data.data.abonnement) 
			else this._loadedSubscriptions = data.data.abonnement

			
			let output = this._generateSubscriptionsListOutput()
			garListPanelContent.innerHTML = output

			// get the "create new" button and append a click event handler
			const newSubscriptionBtn = document.querySelector('#new-subscription-panel')
			newSubscriptionBtn.addEventListener('click', e=> {
				this._currentContext = null
				const newSubscriptionSection = document.querySelector('#classroom-dashboard-gar-subscriptions-new-subscription-panel')
				const newSubscriptionContent = newSubscriptionSection.querySelector('#gar-subscriptions-content-new-subscription')

				// set this._useGlobalLicences to false in order to display custom licences fields by default on subscription creation
				this._useGlobalLicences = false

				// set up the content/custom fields and display them
				newSubscriptionContent.innerHTML = this._generateNewSubscriptionContent()
				this._generateLicencesFieldsToDisplay()
				navigatePanel('classroom-dashboard-gar-subscriptions-new-subscription-panel', 'dashboard-manager-gar-subscriptions');
			})

			// get the "show" buttons and append a click event handler
			const showBtns = this._garSubscriptionPanelElt.querySelectorAll('.showBtn')
			for (let showBtn of showBtns) {
				showBtn.addEventListener('click', e => {
					const showSection = document.querySelector('#classroom-dashboard-gar-subscriptions-show-panel')
					const showContent = showSection.querySelector('#gar-subscriptions-content-show')
					const subscriptionId = e.target.closest('a').dataset.id
					this._currentSubscription = this._loadedSubscriptions.filter(subscription => subscription.idAbonnement == subscriptionId)[0]
				
					// set up the content and display it
					showContent.innerHTML = this._generateShowContent()
					navigatePanel('classroom-dashboard-gar-subscriptions-show-panel', 'dashboard-manager-gar-subscriptions');
				})
			}

			// get the "edit" buttons and append a click event handler
			const editBtns = this._garSubscriptionPanelElt.querySelectorAll('.editBtn')
			for (let editBtn of editBtns) {
				editBtn.addEventListener('click', e => {
					// set the current context to be used in this._generateLicencesFieldsToDisplay()
					this._currentContext = 'update'


					const editSection = document.querySelector('#classroom-dashboard-gar-subscriptions-edit-panel ')
					const editContent = editSection.querySelector('#gar-subscriptions-content-edit')
					const subscriptionId = e.target.closest('a').dataset.id
					this._currentSubscription = this._loadedSubscriptions.filter(subscription => subscription.idAbonnement == subscriptionId)[0]
					this._useGlobalLicences = typeof this._currentSubscription.nbLicenceGlobale !== 'undefined' ? true : false

					// set up the content/custom fields and display it
					editContent.innerHTML = this._generateEditContent()
					this._generateLicencesFieldsToDisplay()
					navigatePanel('classroom-dashboard-gar-subscriptions-edit-panel', 'dashboard-manager-gar-subscriptions');
				})
			}

			// get the "delete" buttons and append a click event handler
			const deleteBtns = this._garSubscriptionPanelElt.querySelectorAll('.deleteBtn')
			for (let deleteBtn of deleteBtns) {
				deleteBtn.addEventListener('click', e => {
					const deleteSection = document.querySelector('#classroom-dashboard-gar-subscriptions-delete-panel ')
					const deleteContent = deleteSection.querySelector('#gar-subscriptions-content-delete')
					const subscriptionId = e.target.closest('a').dataset.id
					this._currentSubscription = this._loadedSubscriptions.filter(subscription => subscription.idAbonnement == subscriptionId)[0]

					// set up the contents and display it
					deleteContent.innerHTML = this._generateShowContent()
					deleteContent.innerHTML += this._generateDeleteContent()
					navigatePanel('classroom-dashboard-gar-subscriptions-delete-panel', 'dashboard-manager-gar-subscriptions');
				})
			}
	}

	/**
	 * generate a Go Back button with its click handler
	 * it will be displayed on each read,create,update,delete sub-panels
	 *
	 * @return  {HTMLElement}  
	 */
	_createGoBackBtnAndRelatedEventListener() {

		// create and set up the button
		let goBackToSubscriptionListBtn = document.createElement('button')
		goBackToSubscriptionListBtn.classList.add('btn')
		goBackToSubscriptionListBtn.classList.add('btn-sm')
		goBackToSubscriptionListBtn.classList.add('c-btn-outline-grey')
		goBackToSubscriptionListBtn.classList.add('my-3')
		goBackToSubscriptionListBtn.textContent = '<< Retour'

		// append a click event listener on the button
		goBackToSubscriptionListBtn.addEventListener('click', e => {
			e.preventDefault()
			return navigatePanel('classroom-dashboard-gar-subscriptions-panel', 'dashboard-manager-gar-subscriptions');
		})
		return goBackToSubscriptionListBtn
	}

	/**
	 * generate the default sub-panel for subscription creation
	 * @includes main div, goBack button, h2, content div
	 *
	 * @return  {void}  elements appended to the main div
	 */
	_createNewSubscriptionPanel(){
		// create and set up the panel element
		this._garNewSubscriptionPanelElt = document.createElement('div');
		this._garNewSubscriptionPanelElt.id = 'classroom-dashboard-gar-subscriptions-new-subscription-panel';
		this._garNewSubscriptionPanelElt.classList.add('dashboard-block');
		this._garNewSubscriptionPanelElt.classList.add('p-2');
		this._garNewSubscriptionPanelElt.style.display = 'none';

		// create and set up a h2 tag, then append it to the panel element
		let garNewSubscriptionPanelH2Elt = document.createElement('h2');
		garNewSubscriptionPanelH2Elt.id = 'gar-subscriptions-title-new-subscription';
		garNewSubscriptionPanelH2Elt.textContent = 'Ajouter un abonnement'
		this._garNewSubscriptionPanelElt.appendChild(garNewSubscriptionPanelH2Elt);

		// generate go back btn and append it after title
		const goBackToSubscriptionListBtn = this._createGoBackBtnAndRelatedEventListener()
		this._garNewSubscriptionPanelElt.insertBefore(goBackToSubscriptionListBtn, garNewSubscriptionPanelH2Elt.nextSibling)

		// create and set up content div, then append it to the panel element
		let garNewSubscriptionPanelContent = document.createElement('div')
		garNewSubscriptionPanelContent.id = 'gar-subscriptions-content-new-subscription'
		this._garNewSubscriptionPanelElt.appendChild(garNewSubscriptionPanelContent)
	}

	/**
	 * generate the default sub-panel to show subscription
	 * @includes main div, goBack button, h2, content div
	 *
	 * @return  {void}  elements appended to the main div
	 */
	_createShowPanel() {
		// create and set up the panel element
		this._garShowPanelElt = document.createElement('div');
		this._garShowPanelElt.id = 'classroom-dashboard-gar-subscriptions-show-panel';
		this._garShowPanelElt.classList.add('dashboard-block');
		this._garShowPanelElt.classList.add('p-2');
		this._garShowPanelElt.style.display = 'none';

		// create and set up a h2 tag, then append it to the panel element
		let garShowPanelH2Elt = document.createElement('h2');
		garShowPanelH2Elt.id = 'gar-subscriptions-title-show';
		garShowPanelH2Elt.textContent = 'Détails'
		this._garShowPanelElt.appendChild(garShowPanelH2Elt);

		// generate go back btn and append it after title
		const goBackToSubscriptionListBtn = this._createGoBackBtnAndRelatedEventListener()
		this._garShowPanelElt.insertBefore(goBackToSubscriptionListBtn, garShowPanelH2Elt.nextSibling)

		// create and set up content div, then append it to the panel element
		let garShowPanelContent = document.createElement('div')
		garShowPanelContent.id = 'gar-subscriptions-content-show'
		this._garShowPanelElt.appendChild(garShowPanelContent)

	}

	/**
	 * generate the default sub-panel to edit subscription
	 * @includes main div, goBack button, h2, content div
	 *
	 * @return  {void}  elements appended to the main div
	 */
	_createEditPanel() {
		// create and set up the panel element
		this._garEditPanelElt = document.createElement('div');
		this._garEditPanelElt.id = 'classroom-dashboard-gar-subscriptions-edit-panel';
		this._garEditPanelElt.classList.add('dashboard-block');
		this._garEditPanelElt.classList.add('p-2');
		this._garEditPanelElt.style.display = 'none';

		// create and set up a h2 tag, then append it to the panel element
		let garEditPanelH2Elt = document.createElement('h2');
		garEditPanelH2Elt.id = 'gar-subscriptions-title-edit';
		garEditPanelH2Elt.textContent = 'Modifier'
		this._garEditPanelElt.appendChild(garEditPanelH2Elt);

		// generate go back btn and append it after title
		const goBackToSubscriptionListBtn = this._createGoBackBtnAndRelatedEventListener()
		this._garEditPanelElt.insertBefore(goBackToSubscriptionListBtn, garEditPanelH2Elt.nextSibling)

		// create and set up content div, then append it to the panel element
		let garEditPanelContent = document.createElement('div')
		garEditPanelContent.id = 'gar-subscriptions-content-edit'
		this._garEditPanelElt.appendChild(garEditPanelContent)
	}

	/**
	 * generate the default sub-panel to delete subscription
	 * @includes main div, goBack button, h2, content div
	 *
	 * @return  {void}  elements appended to the main div
	 */
	_createDeletePanel() {
		// create and set up the panel element
		this._garDeletePanelElt = document.createElement('div');
		this._garDeletePanelElt.id = 'classroom-dashboard-gar-subscriptions-delete-panel';
		this._garDeletePanelElt.classList.add('dashboard-block');
		this._garDeletePanelElt.classList.add('p-2');
		this._garDeletePanelElt.style.display = 'none';

		// create and set up a h2 tag, then append it to the panel element
		let garDeletePanelH2Elt = document.createElement('h2');
		garDeletePanelH2Elt.id = 'gar-subscriptions-title-delete';
		garDeletePanelH2Elt.textContent = 'Supprimer'
		this._garDeletePanelElt.appendChild(garDeletePanelH2Elt);

		// generate go back btn and append it after title
		const goBackToSubscriptionListBtn = this._createGoBackBtnAndRelatedEventListener()
		this._garDeletePanelElt.insertBefore(goBackToSubscriptionListBtn, garDeletePanelH2Elt.nextSibling)

		// create and set up content div, then append it to the panel element
		let garDeletePanelContent = document.createElement('div')
		garDeletePanelContent.id = 'gar-subscriptions-content-delete'
		this._garDeletePanelElt.appendChild(garDeletePanelContent)

	}

	/**
	 * generate html table with data to be displayed on main panel
	 *
	 * @return  {HTMLElement}  
	 */
	_generateSubscriptionsListOutput() {
		let mainOutput = ''
		let dataOutput = ''

		// loop through the subscriptions to generate the table body 
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

		// generate the table and related body data
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

	/**
	 * generate the form used to create a new subscription
	 *
	 * @return  {HTMLElement}  form with inputs and submit button
	 */
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

	/**
	 * generate the content to be displayed on the show sub-panel
	 *
	 * @return  {HTMLElement}  ul containing the current subscription details
	 */
	_generateShowContent() {
		// convert array to string separated by commas
		const publicCible = this._currentSubscription.publicCible.join(', ')

		// bind strings to be display
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

	/**
	 * generate the form to be used when the user wants to update a subscription
	 *
	 * @return  {HTMLElement}  form with inputs and submit button
	 */
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

	/**
	 * generate the form tp delete a subscription
	 *
	 * @return  {HTMLElement}  form with hidden input containing the subscription id
	 */
	_generateDeleteContent() {
		return `
			<form id="deleteSubscription" onsubmit="garNavigationItem.handleDelete(event)">
				<input type="hidden" name="subscriptionIdToDelete" name="subscriptionIdToDelete" value="${this._currentSubscription.idAbonnement}" />
				<input type="submit" value="Supprimer" class="btn c-btn-red my-3" />
			</form>
		`

	}

	/**
	 * instanciate all registered modals (linked with _getModalsData)
	 * and append them to the DOM
	 *
	 * @return  {void}  
	 */
	_generateModals() {
		const modalsData = this._getModalsData()
		for (let modal in modalsData) {
			const currentModal = new Modal(modal, modalsData[modal]);
			document.querySelector('body').appendChild(currentModal)
		}
	}

	/**
	 * allow to set up an array of modals properties/values
	 *
	 * @return  {array}  
	 */
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

	/**
	 * generate licences fields (global/custom)
	 * to be used with the create/update forms based on the context
	 *
	 * @param   {string|null}  context  
	 *
	 * @return  {void}      the fields generated are appended to the parent 
	 */
	_generateLicencesFieldsToDisplay(context=null) {
		// setup defaulst values (creation context)
		const data = {}
		data.unlimitedLicencesInputValue =  ''
		data.countTeacherLicencesInputValue = ''
		data.countStudentLicencesInputValue = ''
		data.countTeacherDocLicencesInputValue =''
		data.countOtherEmployeeLicencesInputValue = ''
		let licencesInputs = document.querySelector('#createSubscriptionForm #licencesInputs')

		if(this._currentContext === 'update'){
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

		// set up output according to the context
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

		// set output to DOM element
		licencesInputs.innerHTML = output

	}

	/**
	 * handle clicks on radio buttons to choose global/custom licences
	 *
	 * @param   {Event}  event  
	 *
	 * @return  {void}  
	 */
	handleLicencesCheckboxChecked(event) {

		// get all inputs and reset them by default
		const licencesCheckboxes = document.querySelectorAll('[name="licences"]')
		licencesCheckboxes.forEach(checkbox => checkbox.removeAttribute('checked'))

		// add checked attribute to the currently clicked input, set global variable and display appropriate fields
		event.target.setAttribute('checked', true)
		this._useGlobalLicences = event.target.value === 'globalLicences' ? true : false
		this._generateLicencesFieldsToDisplay()
	}

	handleSubscriptionsPerPageChange(event){
		this._subscriptionsPerPage = parseInt(event.target.value)
		console.log(this._subscriptionsPerPage)
		this._createSubscriptionListAndRelatedEventListeners()
	}

	/**
	 * handle form submission when user create a new subscription
	 * including sending request with user inputs to the server, errors and success 
	 *
	 * @param   {Event}  event  
	 *
	 * @return  {void}  
	 */
	async handleCreate(event) {
		event.preventDefault()

		// get all errors displayed and hide them at start/re-submission
		const currentErrorsDisplayed = document.querySelectorAll('#createSubscriptionForm .errors')
		currentErrorsDisplayed.forEach( errorElement => errorElement.style.display = 'none')

		// bind incoming data
		const subscriptionToCreate = this._bindIncomingData(event)

		// send the request
		const response = await fetch('/routing/Routing.php?controller=gar_subscription&action=create_subscription', {
			headers: {
				"Content-type": "application/json"
			},
			method: 'POST',
			body: JSON.stringify(subscriptionToCreate)

		})
		const data = await response.json()

		// there are some errors, display them to the user
		if(data.errors){
			const {errors} = data
			errors.forEach( error => {
				let currentErrorElement = document.querySelector(`#${error.errorType}`)
				if(currentErrorElement) currentErrorElement.style.display = 'block'
			})
		}

		// no errors
		// @TODO DISPLAY SUCCESS OR GAR ERRORS IF ANY
	}

	/**
	 * handle form submission when user create a update a subscription
	 * including sending request with user inputs to the server, errors and success 
	 *
	 * @param   {Event}  event  
	 *
	 * @return  {void}  
	 */
	async handleUpdate(event) {
		event.preventDefault()

		// get all errors displayed and hide them at start/re-submission
		const currentErrorsDisplayed = document.querySelectorAll('#updateSubscriptionForm .errors')
		currentErrorsDisplayed.forEach( errorElement => errorElement.style.display = 'none')

		// bind incoming data
		const subscriptionToUpdate = this._bindIncomingData(event)

		// send the request
		const response = await fetch('/routing/Routing.php?controller=gar_subscription&action=update_subscription', {
			headers: {
				"Content-type": "application/json"
			},
			method: 'POST',
			body: JSON.stringify(subscriptionToUpdate)

		})
		const data = await response.json()

		// there are some errors, display them to the user
		if(data.errors){
			const {errors} = data
			errors.forEach( error => {
				let currentErrorElement = document.querySelector(`#${error.errorType}`)
				if(currentErrorElement) currentErrorElement.style.display = 'block'
			})
		}

		// no errors
		// @TODO DISPLAY SUCCESS OR GAR ERRORS IF ANY
	}

	/**
	 * handle form submission when user delete a subscription
	 * including sending request with user inputs to the server, errors and success 
	 *
	 * @param   {Event}  event  
	 *
	 * @return  {void}  
	 */
	async handleDelete(event){
		event.preventDefault()

		// send the request
		const response = await fetch('/routing/Routing.php?controller=gar_subscription&action=delete_subscription', {
			headers: {
				"Content-type": "application/json"
			},
			method: 'POST',
			body: JSON.stringify({idAbonnement: this._currentSubscription.idAbonnement})

		})
		const data = await response.json()
		// @TODO DISPLAY SUCCESS OR GAR ERRORS IF ANY
		
	}

	handleNavigation(event){
		event.preventDefault()
		const currentPage = document.querySelector('#gar-subscriptions-pagination #current-page')
		if(event.target.closest('#previous') && this._currentPage > 1){
			this._currentPage = this._currentPage - 1 
			console.log('previous page')
		}
		if(event.target.closest('#next')){
			this._currentPage = this._currentPage + 1 
			console.log('next page')
		}
		currentPage.textContent = this._currentPage
		this._createSubscriptionListAndRelatedEventListeners()
		console.log(this._currentPage)
	}

	/**
	 * bind incoming user input conditionaly to an object
	 *
	 * @param   {Event}  event 
	 *
	 * @return  {object} 
	 */
	_bindIncomingData(event) {

		// initialize empty object and current form according to the context
		const formEntries = {}
		const currentForm = event.target.id === 'updateSubscriptionForm'
			? document.querySelector('#updateSubscriptionForm')
			: document.querySelector('#createSubscriptionForm')

		// update context, bind the idAbonnement set at the time of the subscription creation
		if (currentForm.id === 'updateSubscriptionForm') {
			formEntries.idAbonnementOld = currentForm.querySelector('#idAbonnementOld').value
		}
		formEntries.licences = currentForm.querySelector('[name="licences"]:checked').value
		formEntries.idAbonnement = currentForm.querySelector('#idAbonnement').value ?? null
		formEntries.commentaireAbonnement = currentForm.querySelector('#commentaireAbonnement').value ?? null
		formEntries.uaiEtab = currentForm.querySelector('#uaiEtab').value ?? null
		formEntries.debutValidite = currentForm.querySelector('#debutValidite').value ?? null
		formEntries.finValidite = currentForm.querySelector('#finValidite').value ?? null

		// bind global/custom Licences according to user choice
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

		// get publicCible chosen and bind them
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
