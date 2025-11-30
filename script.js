let user = localStorage.getItem('user');
let selectedHospital = null;
let editingIndex = null;


const hospitals = [
    { name: "St. Luke’s Medical Center - Global City", location: "Taguig City", contact: "+63 2 8789 7700", photo: "LukesQ.webp" },
    { name: "St. Luke’s Medical Center - Quezon City", location: "Quezon City", contact: "+63 2 8723 0101", photo: "LUKESGLOBAL.jpg" },
    { name: "Makati Medical Center", location: "Makati City", contact: "+63 2 8888 8999", photo: "makatimedcen.webp" },
    { name: "The Medical City", location: "Pasig City", contact: "+63 2 8988 1000", photo: "THEMEDICALCITYPASIG.jpg" },
    { name: "Asian Hospital and Medical Center", location: "Muntinlupa City", contact: "+63 2 8771 9000", photo: "asian.jpg" },
    { name: "Cardinal Santos Medical Center", location: "San Juan City", contact: "+63 2 8727 0001", photo: "cardinal.webp" },
    { name: "Manila Doctors Hospital", location: "Ermita, Manila", contact: "+63 2 8558 0888", photo: "manila.jpg" },
    { name: "Chinese General Hospital", location: "Santa Cruz, Manila", contact: "+63 2 8711 4141", photo: "chinese.jpg" },
    { name: "University of Santo Tomas Hospital", location: "Sampaloc, Manila", contact: "+63 2 8731 3000", photo: "ust.png" },
    { name: "Fe Del Mundo Medical Center", location: "Quezon City", contact: "+63 2 8712 2121", photo: "fe.png" }
];

function login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    if (!email) return alert("Please enter your email");
    localStorage.setItem('user', email);
    user = email;
    document.getElementById('login-fullscreen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    showSection('hospitals');
    document.getElementById('appointments-tab').style.display = 'block';
    renderHospitals();
}

function logout() {
    if (confirm("Log out?")) {
        localStorage.removeItem('user');
        user = null;
        location.reload();
    }
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.nav-tab[onclick="showSection('${id}')"]`)?.classList.add('active');
    if (id === 'hospitals') renderHospitals();
    if (id === 'my-appointments') loadAppointments();
}

function renderHospitals() {
    const list = document.getElementById('hospital-list');
    list.innerHTML = hospitals.map(h => `
        <div class="hospital-card" onclick="selectHospital('${h.name.replace(/'/g, "\\'")}')">
            <h3>${h.name}</h3>
            <p>${h.location}</p>
            <p>${h.contact}</p>
            <button class="select-btn">Continue</button>
        </div>
    `).join('');
}

function filterHospitals() {
    const term = document.getElementById('hospital-search').value.toLowerCase();
    const filtered = hospitals.filter(h => h.name.toLowerCase().includes(term) || h.location.toLowerCase().includes(term));
    document.getElementById('hospital-list').innerHTML = filtered.map(h => `
        <div class="hospital-card" onclick="selectHospital('${h.name.replace(/'/g, "\\'")}')">
            <h3>${h.name}</h3>
            <p>${h.location}</p>
            <button class="select-btn">Continue</button>
        </div>
    `).join('');
}

function selectHospital(name) {
    selectedHospital = hospitals.find(h => h.name === name);
    document.getElementById('selected-name').textContent = selectedHospital.name;
    document.getElementById('selected-location').textContent = selectedHospital.location;
    document.getElementById('selected-contact').textContent = selectedHospital.contact;
    document.getElementById('hospital-photo').src = selectedHospital.photo;

    document.getElementById('appointment-form').reset();
    document.querySelector('.submit-btn').textContent = 'Book Appointment';
    editingIndex = null;
    showSection('booking');
}

function bookAppointment(e) {
    e.preventDefault();
    if (!selectedHospital) return alert("Please select a hospital first");

    const apt = {
        hospital: selectedHospital.name,
        doctor: document.getElementById('doctor').value || "General Consultation",
        patient: document.getElementById('patient-name').value,
        contact: document.getElementById('contact-number').value,
        email: document.getElementById('patient-email').value,
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        user: user
    };

    let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    if (editingIndex !== null) {
        appointments[editingIndex] = apt;
        editingIndex = null;
        alert("Appointment updated!");
    } else {
        appointments.push(apt);
        alert("Appointment booked!");
    }

    localStorage.setItem('appointments', JSON.stringify(appointments));
    document.getElementById('appointment-form').reset();
    document.querySelector('.submit-btn').textContent = 'Book Appointment';
    showSection('my-appointments');
}

function loadAppointments() {
    const all = JSON.parse(localStorage.getItem('appointments') || '[]');
    const mine = all.filter(a => a.user === user);
    const list = document.getElementById('appointments-list');
    if (mine.length === 0) {
        list.innerHTML = "<li>No appointments yet</li>";
        return;
    }
    list.innerHTML = mine.map((apt, i) => {
        const index = all.indexOf(apt);
        return `
            <li>
                <div>
                    <strong>${apt.hospital}</strong><br>
                    ${apt.doctor} • ${apt.patient}<br>
                    ${apt.date} at ${apt.time}<br>
                    <small>${apt.contact} • ${apt.email}</small>
                </div>
                <div class="apt-actions">
                    <button class="edit-btn" onclick="editAppointment(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteAppointment(${index})">Delete</button>
                </div>
            </li>`;
    }).join('');
}

function editAppointment(index) {
    const all = JSON.parse(localStorage.getItem('appointments') || '[]');
    const apt = all[index];
    if (apt.user !== user) return;

    selectedHospital = hospitals.find(h => h.name === apt.hospital);
    document.getElementById('selected-name').textContent = selectedHospital.name;
    document.getElementById('selected-location').textContent = selectedHospital.location;
    document.getElementById('selected-contact').textContent = selectedHospital.contact;
    document.getElementById('hospital-photo').src = selectedHospital.photo;

    document.getElementById('doctor').value = apt.doctor;
    document.getElementById('patient-name').value = apt.patient;
    document.getElementById('contact-number').value = apt.contact;
    document.getElementById('patient-email').value = apt.email;
    document.getElementById('appointment-date').value = apt.date;
    document.getElementById('appointment-time').value = apt.time;

    editingIndex = index;
    document.querySelector('.submit-btn').textContent = 'Save Changes';
    showSection('booking');
}

function deleteAppointment(index) {
    if (!confirm("Delete this appointment?")) return;
    let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.splice(index, 1);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointments();
}

if (user) {
    document.getElementById('login-fullscreen').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    showSection('hospitals');
    document.getElementById('appointments-tab').style.display = 'block';
    renderHospitals();

}


