const findElementById = (id) => document.getElementById(id);
const findElementByQuery = (query) => document.querySelector(query);
const setEventListener = (id, eventListened, eventFunction) => {
    findElementById(id).addEventListener(eventListened, eventFunction);
};

const setProgressDisplay = (display) => {
    findElementByQuery(".progress").style.display = display;
};

const handleProgressDisplay = (functionsAfterDisplayNone, params) => {
    // Show Progress
    setProgressDisplay("block");
    // Timeout 1 Second
    setTimeout(() => {
        // hide Progress
        setProgressDisplay("none");
        functionsAfterDisplayNone(params);
    }, 1000);
};

const handleLocalStorageSet = (itemKey, itemValue) => {
    localStorage.setItem(itemKey, JSON.stringify(itemValue));
};

const setSelectedState = (e) => {
    e.target.parentElement.parentElement.children[6].textContent = "Selected";
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
    addContactToList(contact) {
        const contactList = findElementById("contact-list");
        // Create tr Element
        const row = document.createElement("tr");
        // Insert Column
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

    showAlert(getMsg, getClass) {
        // Create div
        const div = document.createElement("div");
        // Add Classes
        div.className = `alert alert-${getClass}`;
        // Add Text
        div.appendChild(document.createTextNode(getMsg));
        // Get Parent
        const card = findElementByQuery(".card");
        // Get Form
        const cardAction = findElementByQuery(".card-action");
        // Insert Alert
        card.insertBefore(div, cardAction);
        // Timeout 3 Seconds for alert dismiss
        setTimeout(() => {
            findElementByQuery(".alert").remove();
        }, 2000);
    }

    deleteContact(target) {
        const contactList = target.parentElement.parentElement;
        contactList.remove();
        //Remove from Local Storage
        Store.removeContact(contactList.children[2].textContent);
        // Show message
        this.showAlert("Contact Removed!", "danger");
    }

    clearFields() {
        findElementById("name").value = "";
        findElementById("phone").value = "";
        findElementById("email").value = "";
        findElementById("birthday").value = "";
    }

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
        const localStorageContacts = localStorage.getItem(contactListName);
        let contact;
        if (localStorageContacts === null) {
            contact = [];
        } else {
            contact = JSON.parse(localStorageContacts);
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
        // Push New contact into contact array with previous array
        contacts.push(contact);
        handleLocalStorageSet("contacts", contacts);
    }

    static selectContact(e) {
        const phone =
            e.target.parentElement.parentElement.children[2].textContent;
        const contacts = Store.getContact("contacts");
        const localStorageContacts = localStorage.getItem("selectedContacts");
        let selectedContactsList;
        if (localStorageContacts === null) {
            selectedContactsList = [];
        } else {
            selectedContactsList = JSON.parse(localStorageContacts);
        }
        if (selectedContactsList[0]) {
            const ifSelected = selectedContactsList.filter(
                (selectedContact) => selectedContact.phone === phone
            );
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
                localStorage.setItem(
                    "selectedContacts",
                    JSON.stringify(newSelectedContactList)
                );
            }
        } else {
            setSelectedState(e);
            const newSelectedContact = contacts.filter(
                (contact) => contact.phone === phone
            );
            const newSelectedContactList = [
                ...selectedContactsList,
                newSelectedContact[0],
            ];
            localStorage.setItem(
                "selectedContacts",
                JSON.stringify(newSelectedContactList)
            );
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
            //Add contact to list
            ui.addContactToList(contact);
            // Add contact to Local Storage
            Store.addContact(contact);
            // Show Success
            ui.showAlert("New Contact Added!", "success");
            // Clear Fields
            ui.clearFields();
        }, contact);
    }
});

// Action Buttons Event
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

setEventListener("delete-multiple-btn", "click", (e) => {
    e.preventDefault();
    if (confirm("Are you sure?")) {
        const selectedContacts = JSON.parse(
            localStorage.getItem("selectedContacts")
        );
        const allContacts = JSON.parse(localStorage.getItem("contacts"));
        selectedContacts.map((selectedContact) => {
            allContacts.splice(
                allContacts.findIndex(
                    (contact) => contact.phone === selectedContact.phone
                ),
                1
            );
        });
        console.log(allContacts);
        localStorage.setItem("contacts", JSON.stringify(allContacts));
        window.location.reload();
    }
});

// Search / Filter
setEventListener("search", "keyup", (e) => {
    ui.searchName(e.target.value);
});
