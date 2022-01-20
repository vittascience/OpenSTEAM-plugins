// Changing/adding translations in i18next for custome use
function loadCustomTexts() {
    if (i18next && i18next.isInitialized) {
        let currentLang = getCookie('lng');
        if (!currentLang){
            currentLang = 'fr';
        }
        switch (currentLang) {
            case 'fr':
                i18next.addResourceBundle('fr', 'translation', {
					// Changing the classroom.ids.classroom-dashboard-classes-panel-teacher text (classroom label in main navigation menu) for french translation
                    "classroom": {
						"ids": {
							"classroom-dashboard-classes-panel-teacher": "Classe perso"
						}
					},
					// Adding the newSection and the newSubsection and providing it a new title for french translation (the i18next path will be newSection.newSubsection.newSubsectionTitle)
					"newSection": {
						"newSubsection": {
							"newSubsectionTitle": "Le titre de la nouvelle sous-section"
						}
					}
                }, true, true);
                i18next.customLoaded = true;
                break;
        
            case 'en':
                i18next.addResourceBundle('fr', 'translation', {
					// Changing the classroom.ids.classroom-dashboard-classes-panel-teacher text (classroom label in main navigation menu) for english translation
                    "classroom": {
						"ids": {
							"classroom-dashboard-classes-panel-teacher": "Custom classroom"
						}
					},
					// Adding the newSection and the newSubsection and providing it a new title for english translation (the i18next path will be newSection.newSubsection.newSubsectionTitle)
					"newSection": {
						"newSubsection": {
							"newSubsectionTitle": "The new sub-section title"
						}
					}
                }, true, true);
                i18next.customLoaded = true;
                break;
                
            default:
                i18next.customLoaded = true;
                break;
        }
		$('body').localize();
    } else {
        setTimeout(loadCustomFaqTexts, 1000);
    }
}

loadCustomTexts();