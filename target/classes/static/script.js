// --- GESTIONE LOGIN / REGISTRAZIONE ---

let currentUser = null;

function showRegister() {
    document.getElementById('login-box').classList.add('d-none');
    document.getElementById('register-box').classList.remove('d-none');
}

function showLogin() {
    document.getElementById('register-box').classList.add('d-none');
    document.getElementById('login-box').classList.remove('d-none');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        if (res.ok) {
            currentUser = await res.json();
            loginSuccess();
        } else {
            document.getElementById('auth-msg').innerText = "❌ Credenziali errate";
        }
    } catch (err) { console.error(err); }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    const role = document.getElementById('reg-role').value;
    
    try {
        const res = await fetch('/api/auth/registrati', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass, ruolo: role })
        });
        
        if (res.ok) {
            alert("Registrazione ok! Ora accedi.");
            showLogin();
        } else {
            const txt = await res.text();
            alert("Errore: " + txt);
        }
    } catch (err) { console.error(err); }
});

function loginSuccess() {
    // Nascondi sezione Auth
    document.getElementById('auth-section').classList.add('d-none');
    
    // Mostra info utente in navbar
    document.getElementById('user-info').classList.remove('d-none');
    document.getElementById('user-info').classList.add('d-flex'); // Per allineamento
    document.getElementById('username-display').innerText = `Ciao, ${currentUser.username}`;

    if (currentUser.ruolo === 'ADMIN') {
        document.getElementById('admin-section').classList.remove('d-none');
        caricaPrenotazioni();
    } else {
        document.getElementById('cliente-section').classList.remove('d-none');
        document.getElementById('nome').value = currentUser.username;
        impostaDataDefault();
    }
}

function impostaDataDefault() {
    const inputData = document.getElementById('data');
    const oraAttuale = new Date();
    
    // Formato richiesto da datetime-local: YYYY-MM-DDTHH:mm
    // Uso un piccolo trick per gestire il fuso orario locale
    oraAttuale.setMinutes(oraAttuale.getMinutes() - oraAttuale.getTimezoneOffset());
    const stringaData = oraAttuale.toISOString().slice(0, 16);
    
    inputData.min = stringaData;  // Non permette di scegliere prima di ora
    inputData.value = stringaData; // Imposta ora attuale come default
}

function logout() {
    location.reload(); // Ricarica la pagina per logout semplice
}

// --- GESTIONE PRENOTAZIONI ---

document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const dataOra = document.getElementById('data').value;
    const msgDiv = document.getElementById('msg-cliente');

    try {
        const response = await fetch('/api/prenotazioni', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomeCliente: nome, dataOra: dataOra }) 
        });

        if (response.ok) {
            msgDiv.textContent = "✅ Richiesta inviata con successo!";
            msgDiv.className = "mt-3 text-center fw-bold text-success";
            impostaDataDefault(); // Resetta all'ora attuale
        } else {
            const errore = await response.text();
            msgDiv.textContent = "❌ " + errore;
            msgDiv.className = "mt-3 text-center fw-bold text-danger";
        }
    } catch (err) {
        msgDiv.textContent = "❌ Errore di connessione";
        msgDiv.className = "mt-3 text-center fw-bold text-danger";
    }
});

async function caricaPrenotazioni() {
    const listaDiv = document.getElementById('lista-prenotazioni');
    listaDiv.innerHTML = '<p>Caricamento...</p>';

    try {
        const response = await fetch('/api/prenotazioni');
        if(!response.ok) throw new Error("Err");
        const prenotazioni = await response.json();

        listaDiv.innerHTML = '';
        if (prenotazioni.length === 0) {
            listaDiv.innerHTML = '<p>Nessuna prenotazione.</p>';
            return;
        }

        prenotazioni.sort((a, b) => new Date(b.dataOra) - new Date(a.dataOra));

        prenotazioni.forEach(p => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            
            let dataLeggibile = new Date(p.dataOra).toLocaleString('it-IT', { 
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' 
            });
            
            let azioni = '';
            let statusBadge = '';
            let borderClass = `border-status-${p.stato}`;

            if (p.stato === 'IN_ATTESA') {
                statusBadge = '<span class="badge bg-warning text-dark">In Attesa</span>';
                azioni = `
                    <div class="mt-3 d-flex gap-2">
                        <button class="btn btn-success flex-grow-1" onclick="gestisciPrenotazione(${p.id}, true)">
                            <i class="fa-solid fa-check"></i> Accetta
                        </button>
                        <button class="btn btn-outline-danger flex-grow-1" onclick="gestisciPrenotazione(${p.id}, false)">
                            <i class="fa-solid fa-xmark"></i> Rifiuta
                        </button>
                    </div>`;
            } else if (p.stato === 'CONFERMATA') {
                statusBadge = '<span class="badge bg-success">Confermata</span>';
            } else {
                statusBadge = '<span class="badge bg-danger">Rifiutata</span>';
            }

            col.innerHTML = `
                <div class="card h-100 shadow-sm border-0 ${borderClass} prenotazione-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold mb-0">${p.nomeCliente}</h5>
                            ${statusBadge}
                        </div>
                        <p class="card-text text-muted mb-1">
                            <i class="fa-regular fa-calendar me-2"></i> ${dataLeggibile}
                        </p>
                        ${azioni}
                    </div>
                </div>
            `;
            listaDiv.appendChild(col);
        });
    } catch (err) {
        listaDiv.innerHTML = '<p>Errore caricamento.</p>';
    }
}

async function gestisciPrenotazione(id, accetta) {
    await fetch(`/api/prenotazioni/${id}/conferma?accetta=${accetta}`, { method: 'POST' });
    caricaPrenotazioni();
}
