/**
 * Manage the changes in canope context
 * -> Add buttons to return to canope access page for teachers and students (demostudent)
 */
 class CanopeAdaptations {
    constructor() {
        // The area where the "return to canope access" button will be displayed for teachers
        this._topButtonsLocationElt = document.querySelector('#classroom-dashboard-classes-panel-teacher .buttons-interactions');
        // The area where the "return to canope access" button will be displayed for students
        this._studentProfileButtonAreaElt = document.querySelector('#classroom-dashboard-profil-panel #teacherSwitchButton').parentElement;
        // target the add new classroom button 
        this.addNewClassBtn = document.querySelector('.buttons-interactions #teacher-new-classroom-btn')
        this._isFromCanope = getCookie('isFromCanope');
        // The "return to canope access" button text for teachers
        this._canopeAccessTeacherButtonText = "Retour à l'accueil";
        // The "return to canope access" button text for students
        this._canopeAccessStudentButtonText = "Retour à l'accueil";
    }

    /**
     * Create and setup the button
     * @param {string} buttonText - The text to be displayed in the button
     * @param {string} spanClass - [OPTIONAL] The class to be added to the span containing the button text
     * @returns {DOMElement} The button DOM element
     */
    _generateCanopeAccessButtonElt(buttonText, spanClass = '') {
        let canopeAccessButtonElt = document.createElement('a');
        canopeAccessButtonElt.classList.add('btn', 'c-btn-outline-primary');
        canopeAccessButtonElt.style.color = 'var(--classroom-primary)';
        canopeAccessButtonElt.href = '/classroom/canope_access.php';
        let canopeAccessSpanElt = document.createElement('span');
        if (spanClass != '') {
            canopeAccessSpanElt.classList.add(spanClass);
        }
        canopeAccessSpanElt.textContent = buttonText;
        let canopeAccessIElt = document.createElement('i');
        canopeAccessIElt.classList.add('fas', 'fa-chevron-right', 'ml-1');
        // canopeAccessButtonElt.appendChild(canopeAccessImageElt);
        canopeAccessButtonElt.appendChild(canopeAccessSpanElt);
        canopeAccessButtonElt.appendChild(canopeAccessIElt);
        return canopeAccessButtonElt;
    }

    /**
     * Start all the required methods
     */
    init() {
        if (this._isFromCanope == 'true' || this._isFromCanope == '1') {
            // hide add new class btn
            if(this.addNewClassBtn){
                this.addNewClassBtn.style.display = 'none'
            }
            let teacherButtonElt = this._generateCanopeAccessButtonElt(this._canopeAccessTeacherButtonText);
            this._topButtonsLocationElt.appendChild(teacherButtonElt);
            let studentButtonElt = this._generateCanopeAccessButtonElt(this._canopeAccessStudentButtonText, 'text-span-initial');
            this._studentProfileButtonAreaElt.insertBefore(studentButtonElt, this._studentProfileButtonAreaElt.firstChild);
        }
    }
}

canopeAdaptations = new CanopeAdaptations();
canopeAdaptations.init();