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
		this._garSubscriptionPanelElt.classList.add('dashboard-block')
		this._garSubscriptionPanelElt.classList.add('p-2');
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
				editContent.innerHTML = this._generateEditContent()

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
			const customPanelContent = document.querySelector('#gar-subscriptions-content')
			customPanelTitle.textContent = 'Liste des abonnements'
			// console.log('Custom panel opened',customPanelContent);
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
		console.log(this._currentSubscription)
		const unlimitedLicencesInputValue = typeof this._currentSubscription.nbLicenceGlobale === 'string'
			? this._currentSubscription.nbLicenceGlobale
			: ''
		const countTeacherLicencesInputValue = typeof this._currentSubscription.nbLicenceEnseignant === 'string'
			? this._currentSubscription.nbLicenceEnseignant
			: ''
		const countStudentLicencesInputValue = typeof this._currentSubscription.nbLicenceEleve === 'string'
			? this._currentSubscription.nbLicenceEleve
			: ''
		const countTeacherDocLicencesInputValue = typeof this._currentSubscription.nbLicenceProfDoc === 'string'
			? this._currentSubscription.nbLicenceProfDoc
			: ''
		const countOtherEmployeeLicencesInputValue = typeof this._currentSubscription.nbLicenceAutrePersonnel === 'string'
			? this._currentSubscription.nbLicenceAutrePersonnel
			: ''

		return `
			<form class="row" id="updateSubscriptionForm" onsubmit="garNavigationItem.handleUpdate(event)" >
				<div class="col-12 mb-3 c-secondary-form">
					<label for="idAbonnement">ID (45 caratères max) SHOULD NOT BE UPDATED</label>
					<input type="text" class="form-control" id="idAbonnement" name="idAbonnement" value="${this._currentSubscription.idAbonnement}">
				</div>
				<div class="col-12 mb-3 c-secondary-form">
					<label for="commentaireAbonnement">Commentaire</label>
					<input type="text" class="form-control" id="commentaireAbonnement" name="commentaireAbonnement" value="${this._currentSubscription.commentaireAbonnement}">
				</div>
				<div class="col-md-6 mb-3 c-secondary-form">
					<label for="debutValidite">Début validité SHOULD NOT BE UPDATED</label>
					<input type="date" class="form-control" id="debutValidite" name="debutValidite" value="${new Date(this._currentSubscription.debutValidite).toISOString().substring(0, 10)}">
				</div>
				<div class="col-md-6 mb-3 c-secondary-form">
					<label for="finValidite">fin validité</label>
					<input type="date" class="form-control" id="finValidite" name="finValidite" value="${new Date(this._currentSubscription.finValidite).toISOString().substring(0, 10)}">
				</div>
				<div class="col-12 mb-3 c-secondary-form">
					<label for="nbLicenceGlobale" class="form-label">Nombre de licence globale</label>
					<input type="text" class="form-control" id="nbLicenceGlobale" name="nbLicenceGlobale" value="${unlimitedLicencesInputValue}">
				</div>	
				<div class="col-6 mb-3 c-secondary-form">
					<label for="nbLicenceEnseignant" class="form-label">Nombre de licence enseignant</label>
					<input type="text" class="form-control" id="nbLicenceEnseignant" name="nbLicenceEnseignant" value="${countTeacherLicencesInputValue}">
				</div>	
				<div class="col-6 mb-3 c-secondary-form">
					<label for="nbLicenceEleve" class="form-label">Nombre de licence élève</label>
					<input type="text" class="form-control" id="nbLicenceEleve" name="nbLicenceEleve" value="${countStudentLicencesInputValue}">
				</div>
				<div class="col-6 mb-3 c-secondary-form">
					<label for="nbLicenceProfDoc" class="form-label">Nombre de licence professeur documentaliste</label>
					<input type="text" class="form-control" id="nbLicenceProfDoc" name="nbLicenceProfDoc" value="${countTeacherDocLicencesInputValue}">
				</div>
				<div class="col-6 mb-3 c-secondary-form">
					<label for="nbLicenceAutrePersonnel" class="form-label">Nombre de licence autre personnel</label>
					<input type="text" class="form-control" id="nbLicenceAutrePersonnel" name="nbLicenceAutrePersonnel" value="${countOtherEmployeeLicencesInputValue}">
				</div>
				
				<div class="col-12 mb-3 c-secondary-form">
					<label for="publicCible" class="form-label">Public cible</label>
					<select name="publicCible" id="publicCible" name="publicCible[]" class="w-100 form-select-lg mb-3" multiple >
						<option value="ELEVE" ${this._currentSubscription.publicCible.includes('ELEVE') ? 'selected' : ''}>ELEVE</option>
						<option value="ENSEIGNANT"  ${this._currentSubscription.publicCible.includes('ENSEIGNANT') ? 'selected' : ''}>ENSEIGNANT</option>
						<option value="DOCUMENTALISTE"  ${this._currentSubscription.publicCible.includes('DOCUMENTALISTE') ? 'selected' : ''}>DOCUMENTALISTE</option>
						<option value="AUTRE PERSONNEL"  ${this._currentSubscription.publicCible.includes('AUTRE PERSONNEL') ? 'selected' : ''}>AUTRE PERSONNEL</option>
					</select>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="categorieAffectation" class="form-label">Catégorie d'affectation SHOULD NOT BE UPDATED</label>
					<select name="categorieAffectation" id="categorieAffectation" name="categorieAffectation" class="w-100 form-select-lg mb-3">
						<option value="transferable" selected>transferable</option>
						<option value="non transferable">non transferable</option>
						<option value="flottante">flottante</option>
					</select>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="typeAffectation" class="form-label">Type d'affectation SHOULD NOT BE UPDATED</label>
					<select name="typeAffectation" id="typeAffectation" name="typeAffectation" class="w-100 form-select-lg mb-3">
						<option value="INDIV" selected>INDIViDUEL</option>
						<option value="ETABL">ÉTABLISSEMENT</option>
					</select>
				</div>

				<div class="col-12 mb-3 c-secondary-form">
					<label for="idDistributeurCom" class="form-label">Identifiant distributeur commercial SHOULD NOT BE UPDATED</label>
					<input type="text" class="form-control" id="idDistributeurCom" name="idDistributeurCom" value="${this._currentSubscription.idDistributeurCom}">
				</div>

				<div class="col-6 mb-3 c-secondary-form">
					<label for="idRessource" class="form-label">Identifiant de la ressource SHOULD NOT BE UPDATED</label>
					<input type="text" class="form-control" id="idRessource" name="idRessource" value="${this._currentSubscription.idRessource}">
				</div>

				<div class="col-6 mb-3 c-secondary-form">
					<label for="typeIdRessource" class="form-label">Type identifiant de la ressource SHOULD NOT BE UPDATED</label>
					<input type="text" class="form-control" id="typeIdRessource" name="typeIdRessource" value="${this._currentSubscription.typeIdRessource}">
				</div>

				
				<div class="col-12 mb-3 c-secondary-form">
					<label for="libelleRessource" class="form-label">Identifiant distributeur commercial SHOULD NOT BE UPDATED</label>
					<input type="text" class="form-control" id="libelleRessource" name="libelleRessource" value="${this._currentSubscription.libelleRessource}">
				</div>

				<div class="col-12 mt-4">
					<button type="submit"  class="btn c-btn-secondary my-3" >Modifier</button>
				</div>
			</form>
		`
	}

	_generateDeleteContent() {
		return `
			<form id="deleteSubscription">
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

	handleUpdate(event) {
		event.preventDefault()
		const publicCible = document.querySelector('#publicCible')
		const options = publicCible.children
		// const myPublicCible = ().reduce((accumulator,currentOption) => {
		// 	if(currentOption.selected == true) accumulator.push(option.value)
		// 	 return accumulator
		// })
		const values = Array.from(options).reduce((accumulator,currentOption) => {
				if(currentOption.selected) accumulator.push(currentOption.value)
				 return accumulator
			},[])
		console.log(publicCible,options,values)
		// const subscriptionToUpdate = this._bindIncomingData(event)
		// console.log('ON SUBMIT TEST EDIT', event.target.id, subscriptionToUpdate)
	}

	_bindIncomingData(event) {
		const formEntries = {}
		if (event.target.id === 'updateSubscriptionForm') {
			formEntries.idAbonnement = document.querySelector('#idAbonnement').value ?? null
		}
		formEntries.commentaireAbonnement = document.querySelector('#commentaireAbonnement').value ?? null
		formEntries.debutValidite = document.querySelector('#debutValidite').value ?? null
		formEntries.finValidite = document.querySelector('#finValidite').value ?? null
		formEntries.nbLicenceGlobale = document.querySelector('#nbLicenceGlobale').value ?? null
		formEntries.nbLicenceEnseignant = document.querySelector('#nbLicenceEnseignant').value ?? null
		formEntries.nbLicenceEleve = document.querySelector('#nbLicenceEleve').value ?? null
		formEntries.nbLicenceProfDoc = document.querySelector('#nbLicenceProfDoc').value ?? null
		formEntries.nbLicenceAutrePersonnel = document.querySelector('#nbLicenceAutrePersonnel').value ?? null
		formEntries.categorieAffectation = document.querySelector('#categorieAffectation').value ?? null
		formEntries.typeAffectation = document.querySelector('#typeAffectation').value ?? null
		formEntries.idDistributeurCom = document.querySelector('#idDistributeurCom').value ?? null
		formEntries.idRessource = document.querySelector('#idRessource').value ?? null
		formEntries.typeIdRessource = document.querySelector('#typeIdRessource').value ?? null
		formEntries.libelleRessource = document.querySelector('#libelleRessource').value ?? null
		const publicCible = document.querySelector('#publicCible')
		formEntries.publicCible = (publicCible.children).reduce((accumulator,currentOption) => {
			if(currentOption.selected == true) accumulator.push(option.value)
			 return accumulator
		})

		return formEntries
	}


}

const garNavigationItem = new GarNavigationItem()
garNavigationItem.init()
