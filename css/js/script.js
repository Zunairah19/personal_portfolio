// =====================================
// 1. NAME HELPERS
// =====================================

var STORAGE_KEY = "portfolioVisitorName";

function getSavedName() {
    try {
        return localStorage.getItem(STORAGE_KEY) || "";
    } catch (e) {
        return "";
    }
}

function saveName(name) {
    try {
        localStorage.setItem(STORAGE_KEY, name);
    } catch (e) {
        // Ignore if the browser blocks storage
    }
}

// Changes the name everywhere on the page
// (Home heading, About heading, Personal Information, Footer)
function applyName(name) {
    var spots = document.querySelectorAll(".visitor-name");

    for (var i = 0; i < spots.length; i++) {
        spots[i].textContent = name;
    }
}


// =====================================
// 2. WELCOME SCREEN
// =====================================

var welcomeScreen = document.getElementById("welcomeScreen");
var welcomeForm = document.getElementById("welcomeForm");
var visitorInput = document.getElementById("visitorName");
var welcomeError = document.getElementById("welcomeError");

function showWelcome() {
    welcomeScreen.classList.remove("is-hidden");
    welcomeError.classList.add("is-hidden");
    document.body.classList.add("no-scroll");
    visitorInput.value = "";
    visitorInput.focus();
}

function openPortfolio(name) {
    applyName(name);
    welcomeScreen.classList.add("is-hidden");
    document.body.classList.remove("no-scroll");
    window.scrollTo(0, 0);
}

welcomeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = visitorInput.value.trim();

    if (name === "") {
        welcomeError.classList.remove("is-hidden");
        visitorInput.focus();
        return;
    }

    saveName(name);
    openPortfolio(name);
});

// On page load: skip the welcome screen if a name is already saved
var savedName = getSavedName();

if (savedName) {
    openPortfolio(savedName);
} else {
    showWelcome();
}


// =====================================
// 3. CHANGE NAME POPUP
// =====================================

var nameModalElement = document.getElementById("nameModal");
var nameForm = document.getElementById("nameForm");
var newNameInput = document.getElementById("newVisitorName");
var nameError = document.getElementById("nameError");

// When the popup opens, fill the box with the current name
nameModalElement.addEventListener("show.bs.modal", function () {
    newNameInput.value = getSavedName();
    nameError.classList.add("is-hidden");
});

// Put the cursor in the box once the popup is visible
nameModalElement.addEventListener("shown.bs.modal", function () {
    newNameInput.focus();
    newNameInput.select();
});

// When "Save Name" is clicked or Enter is pressed
nameForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var newName = newNameInput.value.trim();

    if (newName === "") {
        nameError.classList.remove("is-hidden");
        newNameInput.focus();
        return;
    }

    saveName(newName);
    applyName(newName);

    bootstrap.Modal.getOrCreateInstance(nameModalElement).hide();
});


// =====================================
// 4. PROJECT DETAILS MODAL
// =====================================

var projectModal = document.getElementById("projectModal");

projectModal.addEventListener("show.bs.modal", function (event) {
    var button = event.relatedTarget;

    if (!button) {
        return;
    }

    document.getElementById("modalProjectTitle").textContent =
        button.getAttribute("data-title") || "Project Details";

    document.getElementById("modalProjectDescription").textContent =
        button.getAttribute("data-description") || "";
});


// =====================================
// 5. CONTACT FORM VALIDATION
// =====================================

var contactForm = document.getElementById("contactForm");
var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shows a red border and a red warning line (with triangle icon) under a field
function showFieldError(inputId, message) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(inputId + "Error");

    input.classList.add("is-invalid");
    error.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i><span>' + message + '</span>';
    error.classList.add("show");
}

// Removes the red border and the red warning line
function clearFieldError(inputId) {
    var input = document.getElementById(inputId);
    var error = document.getElementById(inputId + "Error");

    input.classList.remove("is-invalid");
    error.innerHTML = "";
    error.classList.remove("show");
}

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var nameValue = document.getElementById("fullName").value.trim();
    var emailValue = document.getElementById("email").value.trim();
    var messageValue = document.getElementById("message").value.trim();

    var allGood = true;
    var firstBadField = "";

    // Name
    if (nameValue === "") {
        showFieldError("fullName", "The name field is required.");
        allGood = false;
        if (!firstBadField) { firstBadField = "fullName"; }
    } else {
        clearFieldError("fullName");
    }

    // Email
    if (emailValue === "") {
        showFieldError("email", "The email field is required.");
        allGood = false;
        if (!firstBadField) { firstBadField = "email"; }
    } else if (!emailPattern.test(emailValue)) {
        showFieldError("email", "Please enter a valid email address.");
        allGood = false;
        if (!firstBadField) { firstBadField = "email"; }
    } else {
        clearFieldError("email");
    }

    // Message
    if (messageValue === "") {
        showFieldError("message", "The message field is required.");
        allGood = false;
        if (!firstBadField) { firstBadField = "message"; }
    } else {
        clearFieldError("message");
    }

    // Stop here if anything is wrong, and put the cursor in the first bad field
    if (!allGood) {
        document.getElementById(firstBadField).focus();
        return;
    }

    // Everything is fine: show the success popup and clear the form
    var successModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("contactSuccessModal")
    );
    successModal.show();

    contactForm.reset();
});

// Remove the red error as soon as the visitor starts typing in that field
["fullName", "email", "message"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
        clearFieldError(id);
    });
});


// =====================================
// 6. EDIT MODE
// =====================================

var editMode = false;
var editButton = document.getElementById("editButton");

var EDITABLE_SELECTOR =
    "section h1, section h2:not(.accordion-header), section h3, section h4, section h5, " +
    "section p, section li, section .skill-badge, section .project-badge, " +
    "footer h4, footer p";

function toggleEditMode() {
    editMode = !editMode;

    document.body.classList.toggle("editing", editMode);

    document.querySelectorAll(EDITABLE_SELECTOR).forEach(function (element) {
        if (editMode) {
            element.setAttribute("contenteditable", "true");
            element.setAttribute("data-editable", "true");
        } else {
            element.removeAttribute("contenteditable");
            element.removeAttribute("data-editable");
        }
    });

    editButton.innerHTML = editMode
        ? '<i class="bi bi-check-circle"></i> Finish Editing'
        : '<i class="bi bi-pencil-square"></i> Edit Page';
}

editButton.addEventListener("click", toggleEditMode);