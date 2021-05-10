// Gets elements by id or query
const findElementById = (id) => document.getElementById(id);
const findElementByQuery = (query) => document.querySelector(query);

// sets event listener to element by id
const setEventListener = (id, eventListened, eventFunction) => {
    findElementById(id).addEventListener(eventListened, eventFunction);
};

// sets progress bar display
const setProgressDisplay = (display) => {
    findElementByQuery(".progress").style.display = display;
};

// handles progress bar showing and hiding
const handleProgressDisplay = (functionsAfterDisplayNone, params) => {
    // Shows Progress
    setProgressDisplay("block");
    // Timeout 1 Second
    setTimeout(() => {
        // hides Progress
        setProgressDisplay("none");
        functionsAfterDisplayNone(params);
    }, 1000);
};

// sets an item to local storage
const handleLocalStorageSet = (itemKey, itemValue) => {
    localStorage.setItem(itemKey, handleJSONData(itemValue, "stringify"));
};

// gets an item from local storage
const handleLocalStorageGet = (itemKey) => {
    const item = localStorage.getItem(itemKey);
    return item;
};

// sets "Selected" state to contacts
const setSelectedState = (e) => {
    e.target.parentElement.parentElement.children[6].textContent = "Selected";
};

// handles JSON parse and stringify
const handleJSONData = (data, action) => {
    if (action === "parse") {
        return JSON.parse(data);
    } else {
        return JSON.stringify(data);
    }
};

// Local Storage Class
class Contact {
    constructor(name, email, phone, birthday) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.birthday = birthday;
    }
}

// UI Class
class UI {
    // adds to contact list
    addContactToList(contact) {
        const contactList = findElementById("contact-list");
        // Creates tr Element
        const row = document.createElement("tr");
        // Inserts Column
        row.innerHTML = `
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.phone}</td>
            <td>${contact.birthday}</td>
            <td><a class="btn select" style="padding: 0">Select</a></td>
            <td><a class="btn btn-floating delete">x</a></td>
            <td id="selected-state">Not Selected</td>
        `;
        contactList.appendChild(row);
    }

    // shows alert
    showAlert(getMsg, getClass) {
        // Creates div
        const div = document.createElement("div");
        // Adds Classes
        div.className = `alert alert-${getClass}`;
        // Adds Text
        div.appendChild(document.createTextNode(getMsg));
        // Gets Parent
        const card = findElementByQuery(".card");
        // Gets Form
        const cardAction = findElementByQuery(".card-action");
        // Inserts Alert
        card.insertBefore(div, cardAction);
        // Timeout 3 Seconds for alert dismiss
        setTimeout(() => {
            findElementByQuery(".alert").remove();
        }, 2000);
    }

    // deletes contact
    deleteContact(target) {
        const contactList = target.parentElement.parentElement;
        // removes from UI
        contactList.remove();
        //Removes from Local Storage
        Store.removeContact(contactList.children[2].textContent);
        // Shows message
        this.showAlert("Contact Removed!", "danger");
    }

    // clears all the input fields
    clearFields() {
        findElementById("name").value = "";
        findElementById("phone").value = "";
        findElementById("email").value = "";
        findElementById("birthday").value = "";
    }

    // searches for a contact
    searchName(text) {
        const rows = document.querySelectorAll("#contact-list tr");
        rows.forEach((row) => {
            if (row.children[0].textContent.indexOf(text) != -1) {
                row.style.display = "table-row";
            } else {
                row.style.display = "none";
            }
        });
    }
}

// Local Storage Class
class Store {
    static getContact(contactListName) {
        const localStorageContacts = handleLocalStorageGet(contactListName);
        let contact;
        if (localStorageContacts === null) {
            contact = [];
        } else {
            contact = handleJSONData(localStorageContacts, "parse");
        }
        return contact;
    }

    static displayContact() {
        const contacts = Store.getContact("contacts");
        contacts.forEach((contact) => {
            // Add  to UI
            ui.addContactToList(contact);
        });
    }

    static addContact(contact) {
        //contacts from LocalStorage
        const contacts = Store.getContact("contacts");
        // checks if contact with the phone number exists
        const matchedPhones = contacts
            ? contacts.filter(
                  (storedContact) => storedContact.phone === contact.phone
              )
            : [];
        if (!matchedPhones[0]) {
            //Add contact to list
            ui.addContactToList(contact);
            // Push a new contact with unique number into the contact array
            contacts.push(contact);
            handleLocalStorageSet("contacts", contacts);
            // Show Success
            ui.showAlert("New Contact Added!", "success");
        } else {
            handleProgressDisplay(() => {
                ui.showAlert("Phone Number must be unique", "danger");
            });
        }
    }

    static selectContact(e) {
        // phone number of the selected contact
        const phone =
            e.target.parentElement.parentElement.children[2].textContent;
        const contacts = Store.getContact("contacts");
        const localStorageContacts = handleLocalStorageGet("selectedContacts");
        let selectedContactsList;
        // checks if there is any selected contact
        selectedContactsList = localStorageContacts
            ? handleJSONData(localStorageContacts, "parse")
            : [];
        // checks if the current contact is already selected
        const ifSelected = selectedContactsList[0]
            ? selectedContactsList.filter(
                  (selectedContact) => selectedContact.phone === phone
              )
            : [];
        if (ifSelected[0]) {
            alert("Already Selected");
        } else {
            setSelectedState(e);
            const newSelectedContact = contacts.filter(
                (contact) => contact.phone === phone
            );
            const newSelectedContactList = [
                ...selectedContactsList,
                newSelectedContact[0],
            ];
            handleLocalStorageSet("selectedContacts", newSelectedContactList);
        }
    }

    static removeContact(phone) {
        const contacts = Store.getContact("contacts");
        contacts.forEach((contact, index) => {
            if (contact.phone === phone) {
                contacts.splice(index, 1);
            }
        });
        handleLocalStorageSet("contacts", contacts);
    }
}
// Instantiate UI
const ui = new UI();
// DOM Load Event
document.addEventListener("DOMContentLoaded", () => {
    Store.displayContact();
    localStorage.removeItem("selectedContacts");
});

// Submit Event Listener
setEventListener("contact-form", "submit", (e) => {
    e.preventDefault();
    // Get Form Values
    const name = findElementById("name").value,
        email = findElementById("email").value,
        phone = findElementById("phone").value;
    birthday = findElementById("birthday").value;
    // Instantiate Contact
    const contact = new Contact(name, email, phone, birthday);
    // Validate
    if (name === "" || phone === "") {
        handleProgressDisplay(() => {
            ui.showAlert("Please fill Name & Phone Fields at least", "danger");
        });
    } else {
        handleProgressDisplay(() => {
            // Clear Fields
            ui.clearFields();
        }, contact);
        // Add contact to Local Storage
        Store.addContact(contact);
    }
});

// X Button Event
setEventListener("contact-list", "click", (e) => {
    e.preventDefault();
    const classesList = e.target.classList;
    if (classesList.contains("delete") && confirm("Are you sure?")) {
        handleProgressDisplay(() => {
            ui.deleteContact(e.target);
        }, e);
    } else if (classesList.contains("select")) {
        Store.selectContact(e);
        findElementById("delete-multiple-btn").style.display = "block";
    }
});

// multiple-delete button event
setEventListener("delete-multiple-btn", "click", (e) => {
    e.preventDefault();
    if (confirm("Are you sure?")) {
        const selectedContacts = handleJSONData(
            handleLocalStorageGet("selectedContacts"),
            "parse"
        );
        const allContacts = handleJSONData(
            handleLocalStorageGet("contacts"),
            "parse"
        );
        // deleting all the selected contacts from the contacts list
        selectedContacts.map((selectedContact) => {
            allContacts.splice(
                allContacts.findIndex(
                    (contact) => contact.phone === selectedContact.phone
                ),
                1
            );
        });
        handleLocalStorageSet("contacts", allContacts);
        window.location.reload();
    }
});

// Search / Filter
setEventListener("search", "keyup", (e) => {
    ui.searchName(e.target.value);
});
