class GarNavigationItem {

	constructor() {
		// The navigation button element before which the newly created one will be inserted
		this._nextNavigationMenuElt = document.getElementById('dashboard-profil-manager');
		// The custom navigation button element
		this._newNavigationButtonElt;
		// The gar panel element
		this._garSubscriptionPanelElt;
		this._loadedSubscriptions = []
		this._currentSubscription = null
	}

	/**
	 * The method that initialize everything
	 */
	init() {
		this._createGarSubscriptionPanel();
		document.getElementById('classroom-dashboard-content').appendChild(this._garSubscriptionPanelElt);
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
		this._garSubscriptionPanelElt.classList.add('dashboard-block');
		this._garSubscriptionPanelElt.style.display = 'none';

		// create title 
		let garListPanelH2Elt = document.createElement('h2');
		garListPanelH2Elt.id = 'gar-subscriptions-title';


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
		this._garSubscriptionPanelElt.appendChild(garListPanelH2Elt);
		this._garSubscriptionPanelElt.appendChild(garListPanelContent)


		const showBtns = this._garSubscriptionPanelElt.querySelectorAll('.showBtn')
		for (let showBtn of showBtns) {
			showBtn.addEventListener('click', async (e) => {
				const showSection = document.querySelector('#classroom-dashboard-gar-subscriptions-show-panel ')
				const showContent = showSection.querySelector('#gar-subscriptions-content-show')
				const subscriptionId = e.target.closest('a').dataset.id
				this._currentSubscription = this._loadedSubscriptions.filter(subscription => subscription.idAbonnement == subscriptionId)[0]
				console.log(this._currentSubscription)
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
				console.log(this._currentSubscription)
				editContent.innerHTML = `
					<ul>
						<li>edit 1</li>
						<li>edit 2</li>
						<li>edit 3</li>
						<li>edit 4</li>
						<li>edit 5</li>
						<li>edit 6</li>
					</ul>
				`

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
				console.log(this._currentSubscription)
				deleteContent.innerHTML = `
					<ul>
						<li>delete 1</li>
						<li>delete 2</li>
						<li>delete 3</li>
						<li>delete 4</li>
						<li>delete 5</li>
						<li>delete 6</li>
					</ul>
				`

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
			const customPanelContent = document.querySelector('#gar-subscriptions-content')
			customPanelTitle.textContent = 'TEST'
			// console.log('Custom panel opened',customPanelContent);
		}
	}

	_createShowPanel() {
		this._garShowPanelElt = document.createElement('div');
		this._garShowPanelElt.id = 'classroom-dashboard-gar-subscriptions-show-panel';
		this._garShowPanelElt.classList.add('dashboard-block');
		this._garShowPanelElt.style.display = 'none';
		let garShowPanelH2Elt = document.createElement('h2');
		garShowPanelH2Elt.id = 'gar-subscriptions-title-show';
		garShowPanelH2Elt.textContent = 'Show'
		this._garShowPanelElt.appendChild(garShowPanelH2Elt);

		let garShowPanelContent = document.createElement('div')
		garShowPanelContent.id = 'gar-subscriptions-content-show'
		this._garShowPanelElt.appendChild(garShowPanelContent)


		// navigatePanel('classroom-dashboard-gar-subscriptions-edit-panel', 'dashboard-manager-gar-subscriptions');
	}
	_createEditPanel() {
		this._garEditPanelElt = document.createElement('div');
		this._garEditPanelElt.id = 'classroom-dashboard-gar-subscriptions-edit-panel';
		this._garEditPanelElt.classList.add('dashboard-block');
		this._garEditPanelElt.style.display = 'none';
		let garEditPanelH2Elt = document.createElement('h2');
		garEditPanelH2Elt.id = 'gar-subscriptions-title-edit';
		garEditPanelH2Elt.textContent = 'Edit'
		this._garEditPanelElt.appendChild(garEditPanelH2Elt);

		let garEditPanelContent = document.createElement('div')
		garEditPanelContent.id = 'gar-subscriptions-content-edit'
		this._garEditPanelElt.appendChild(garEditPanelContent)

	}

	_createDeletePanel() {
		this._garDeletePanelElt = document.createElement('div');
		this._garDeletePanelElt.id = 'classroom-dashboard-gar-subscriptions-delete-panel';
		this._garDeletePanelElt.classList.add('dashboard-block');
		this._garDeletePanelElt.style.display = 'none';
		let garDeletePanelH2Elt = document.createElement('h2');
		garDeletePanelH2Elt.id = 'gar-subscriptions-title-delete';
		garDeletePanelH2Elt.textContent = 'Delete'
		this._garDeletePanelElt.appendChild(garDeletePanelH2Elt);

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

	_generateShowContent() {
		const publicCible = this._currentSubscription.publicCible.join(', ')
		return `
			<ul>
				<li>#ID : ${this._currentSubscription.idAbonnement}</li>
				<li>Commentaire : ${this._currentSubscription.commentaireAbonnement}</li>
				<li>Début de validité : ${(new Date(this._currentSubscription.debutValidite)).toLocaleDateString()}</li>
				<li>Fin de validité : ${(new Date(this._currentSubscription.finValidite)).toLocaleDateString()}</li>
				<li>UAI : ${this._currentSubscription.uaiEtab}</li>
				<li>Nombre de licence globale : ${this._currentSubscription.nbLicenceGlobale}</li>
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

	_generateModals() {
		const modalsData = this._getModalsData()
		for(let modal in modalsData){
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
}

const garNavigationItem = new GarNavigationItem()
garNavigationItem.init()