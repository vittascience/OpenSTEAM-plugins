/**
 * This code is an example of the addition of a new main panel and it's associated button in the navigation menu.
 */
class MyCustomNavigationItem {
	constructor() {
		// The navigation button element before which the newly created one will be inserted
		this._nextNavigationMenuElt = document.getElementById('dashboard-profil-teacher');
		// The custom navigation button element
		this._newNavigationButtonElt;
		// The custom panel element
		this._customPanelElt;
	}

	/**
	 * The method that initialize everything
	 */
	init() {
		this._createCustomPanel();
		document.getElementById('classroom-dashboard-content').appendChild(this._customPanelElt);
		this._createNewNavigationButton();
		this._nextNavigationMenuElt.parentElement.insertBefore(this._newNavigationButtonElt, this._nextNavigationMenuElt);
		this._createNewDisplayPanelBehavior();
		// Attach the navigatePanel function to the click event on the newly appended navigation button
		this._newNavigationButtonElt.addEventListener('click', () => {
			// This function takes 2 arguments : the first is the id of the panel to open. The second is the id of the button that will be active after navigation.
			navigatePanel('classroom-dashboard-custom-panel-teacher', 'dashboard-custom-panel');
		});
	}

	/**
	 * Manage the creation of the custom panel element
	 */
	_createCustomPanel() {
		this._customPanelElt = document.createElement('div');
		this._customPanelElt.id = 'classroom-dashboard-custom-panel-teacher';
		this._customPanelElt.classList.add('dashboard-block', 'd-flex', 'flex-column', 'align-items-center');
		this._customPanelElt.style.display = 'none';
		let customPanelH2Elt = document.createElement('h2');
		customPanelH2Elt.classList.add('d-flex', 'flex-column');
		// For the addition of custom i18next translations, see the translation plugin example
		customPanelH2Elt.setAttribute('data-i18n', 'classroom.customPanel.customPanelTitle');
		customPanelH2Elt.textContent = "Fallback title text";
		this._customPanelElt.appendChild(customPanelH2Elt);
	}

	/**
	 * Manage the creation of the custom navigation button element
	 */
	_createNewNavigationButton() {
		this._newNavigationButtonElt = document.createElement('div');
		this._newNavigationButtonElt.id = 'dashboard-custom-panel';
		this._newNavigationButtonElt.classList.add('classroom-navbar-button');
		let buttonImageElt = document.createElement('img');
		buttonImageElt.src = "assets/media/my_classes.svg";
		let buttonSpanElt = document.createElement('span');
		// For the addition of custom i18next translations, see the translation plugin example
		buttonSpanElt.setAttribute('data-i18n', 'classroom.ids.myCustomNavigationButton');
		buttonSpanElt.textContent = 'My fallback text';
		this._newNavigationButtonElt.appendChild(buttonImageElt);
		this._newNavigationButtonElt.appendChild(buttonSpanElt);
	}

	/**
	 * Run a custom code when opening the custom panel
	 */
	_createNewDisplayPanelBehavior() {
		// We attach a new method to the DisplayPanel (it is triggered when the navigatePanel function is executed and if it's first argument correspond to the method name after converting the "-" to "_")
		DisplayPanel.prototype.classroom_dashboard_custom_panel_teacher = function () {
			// Put your custom behavior here.
			console.log('Custom panel opened');
		}
	}
}

const myCustomNavigationItem = new MyCustomNavigationItem();
myCustomNavigationItem.init();