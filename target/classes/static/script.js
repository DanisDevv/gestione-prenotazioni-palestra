// --- HELPER NOTIFICHE ---
function showAlert(titolo, messaggio) {
    document.getElementById('alert-title').innerText = titolo;
    document.getElementById('alert-message').innerText = messaggio;
    new bootstrap.Modal(document.getElementById('modalCustomAlert')).show();
}

function showConfirm(titolo, messaggio, onConfirm) {
    document.getElementById('confirm-title').innerText = titolo;
    document.getElementById('confirm-message').innerText = messaggio;
    
    const btnYes = document.getElementById('btn-confirm-yes');
    const newBtn = btnYes.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtn, btnYes);
    
    newBtn.addEventListener('click', () => {
        const modalEl = document.getElementById('modalCustomConfirm');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        onConfirm();
    });

    new bootstrap.Modal(document.getElementById('modalCustomConfirm')).show();
}

// --- NAVIGAZIONE ---

function nascondiTutto() {
    const sezioni = ['landing-section', 'auth-section', 'cliente-section', 'admin-section', 'salapesi-section', 'corsi-admin-section', 'albo-trainers-section', 'gestione-utenti-section'];
    sezioni.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('d-none');
    });
}

function mostraLanding() {
    nascondiTutto();
    document.getElementById('landing-section').classList.remove('d-none');
    
    // Gestione Bottoni Hero e Navbar
    if (currentUser) {
        document.getElementById('public-menu').classList.add('d-none');
        document.getElementById('user-info').classList.remove('d-none');
        document.getElementById('hero-btns-guest').classList.add('d-none');
        document.getElementById('hero-btns-user').classList.remove('d-none');
        document.getElementById('hero-btns-user').classList.add('d-flex');
    } else {
        document.getElementById('public-menu').classList.remove('d-none');
        document.getElementById('user-info').classList.add('d-none');
        document.getElementById('hero-btns-guest').classList.remove('d-none');
        document.getElementById('hero-btns-user').classList.add('d-none');
        document.getElementById('hero-btns-user').classList.remove('d-flex');
    }
}

function mostraLogin() {
    nascondiTutto();
    document.getElementById('auth-section').classList.remove('d-none');
    document.getElementById('login-box').classList.remove('d-none');
    document.getElementById('register-box').classList.add('d-none');
    document.getElementById('auth-title').innerText = "Accedi";
}

function mostraRegister() {
    nascondiTutto();
    document.getElementById('auth-section').classList.remove('d-none');
    document.getElementById('login-box').classList.add('d-none');
    document.getElementById('register-box').classList.remove('d-none');
    document.getElementById('auth-title').innerText = "Registrati";
}

function verificaAccessoCorsi() {
    if (!currentUser) {
        showConfirm("🔒 Accesso Riservato", "Devi essere un membro del team. Vuoi accedere ora?", () => {
            mostraLogin();
        });
    } else {
        loginSuccess();
    }
}

// --- GESTIONE UTENTE E LOGIN ---

let currentUser = null;

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    try {
        const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, password: pass }) });
        if (res.ok) {
            currentUser = await res.json();
            loginSuccess();
        } else {
            document.getElementById('auth-msg').innerText = "❌ Credenziali errate";
            document.getElementById('auth-msg').className = "text-center mt-3 fw-bold text-danger";       
        }
    } catch (err) { console.error(err); }
}

async function handleRegister(e) {
    e.preventDefault();
    const user = document.getElementById('reg-user').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    try {
        const res = await fetch('/api/auth/registrati', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: user, email: email, password: pass }) });
        if (res.ok) { showAlert("Benvenuto!", "Registrazione completata!"); mostraLogin(); } 
        else showAlert("Attenzione", "Errore: " + await res.text());
    } catch (err) { console.error(err); }
}

function loginSuccess() {
    console.log("Login Success per:", currentUser.username, "Ruolo:", currentUser.ruolo);
    localStorage.setItem('fitlife_user', JSON.stringify(currentUser));
    nascondiTutto();
    
    const userImg = currentUser.fotoUrl || `https://i.pravatar.cc/150?u=${currentUser.username}`;
    const imgEl = document.getElementById('nav-user-img');
    const nameEl = document.getElementById('username-display');
    if(imgEl) imgEl.src = userImg;
    if(nameEl) nameEl.innerText = currentUser.username;
    
    document.getElementById('public-menu').classList.add('d-none');
    document.getElementById('user-info').classList.remove('d-none');
    document.getElementById('user-info').classList.add('d-flex');

    document.querySelectorAll('.private-link').forEach(el => el.classList.remove('d-none'));

    const dropGestione = document.getElementById('dropdown-gestione');
    const itemUtenti = document.getElementById('item-gestione-utenti');
    const itemCorsi = document.getElementById('item-gestione-corsi');
    
    if(dropGestione) dropGestione.classList.add('d-none');
    if(itemUtenti) itemUtenti.classList.add('d-none');
    if(itemCorsi) itemCorsi.classList.add('d-none');

    // Routing
    if (currentUser.ruolo === 'ADMIN') {
        console.log("-> Admin View");
        document.getElementById('admin-section').classList.remove('d-none');
        if(dropGestione) dropGestione.classList.remove('d-none');
        if(itemUtenti) itemUtenti.classList.remove('d-none');
        if(itemCorsi) itemCorsi.classList.remove('d-none');
        caricaPrenotazioni();
        caricaStats();
    } 
    else if (currentUser.ruolo === 'TRAINER') {
        console.log("-> Trainer View");
        document.getElementById('admin-section').classList.remove('d-none');
        if(dropGestione) dropGestione.classList.remove('d-none');
        if(itemCorsi) itemCorsi.classList.remove('d-none');
        const rowStats = document.querySelector('#admin-section .row.mb-4');
        if(rowStats) rowStats.classList.add('d-none'); 
        caricaPrenotazioni(true);
    } 
    else {
        console.log("-> Cliente View");
        const clientSection = document.getElementById('cliente-section');
        if(clientSection) clientSection.classList.remove('d-none');
        
        const nomeInput = document.getElementById('nome');
        if(nomeInput) nomeInput.value = currentUser.username;
        
        impostaDataDefault();
        caricaCorsiCliente();
        caricaMiePrenotazioni();
    }
}

function impostaDataDefault() {
    const inputData = document.getElementById('data');
    if (!inputData) return; // Protezione se l'elemento non c'è
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const str = now.toISOString().slice(0, 16);
    inputData.min = str;
    inputData.value = str;
}

function logout() {
    localStorage.removeItem('fitlife_user');
    location.reload(); 
}

// --- PROFILO ---

function apriModalProfilo() {
    const img = currentUser.fotoUrl || `https://i.pravatar.cc/300?u=${currentUser.username}`;
    document.getElementById('preview-profilo').src = img;
    document.getElementById('input-foto-profilo').value = currentUser.fotoUrl || '';
    document.getElementById('file-foto-profilo').value = '';
    new bootstrap.Modal(document.getElementById('modalProfilo')).show();
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

async function handleProfilo(e) {
    e.preventDefault();
    const fileInput = document.getElementById('file-foto-profilo');
    const urlInput = document.getElementById('input-foto-profilo');
    let fotoFinale = urlInput.value;

    if (fileInput.files.length > 0) {
        try { fotoFinale = await toBase64(fileInput.files[0]); } 
        catch (err) { showAlert("Errore", "Impossibile leggere file"); return; }
    }
    
    try {
        const res = await fetch('/api/utenti/me/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: currentUser.username, fotoUrl: fotoFinale })
        });
        if (res.ok) {
            showAlert("Ottimo!", "Profilo aggiornato.");
            currentUser.fotoUrl = fotoFinale;
            localStorage.setItem('fitlife_user', JSON.stringify(currentUser));
            loginSuccess(); 
            location.reload();
        } else showAlert("Errore", "Impossibile aggiornare.");
    } catch(e) { showAlert("Errore", "Problema di connessione."); }
}

// --- SALA PESI ---

function mostraSalaPesi() {
    nascondiTutto();
    document.getElementById('salapesi-section').classList.remove('d-none');
    const oggi = new Date().toISOString().slice(0, 10);
    const dateInput = document.getElementById('data-salapesi');
    dateInput.min = oggi;
    if(!dateInput.value || dateInput.value < oggi) {
        dateInput.value = oggi;
    }
    caricaTabellone();
}

async function caricaTabellone() {
    const dataSelezionata = document.getElementById('data-salapesi').value;
    const grid = document.getElementById('grid-salapesi');
    grid.innerHTML = '<p class="text-center text-muted">Caricamento...</p>';

    const now = new Date();
    const oggiStr = now.toISOString().slice(0, 10);
    const oraAttuale = now.getHours();
    const isPassato = dataSelezionata < oggiStr;
    const isOggi = dataSelezionata === oggiStr;

    try {
        const res = await fetch(`/api/salapesi?data=${dataSelezionata}`);
        const slots = await res.json();
        grid.innerHTML = '';
        
        slots.forEach(slot => {
            const isTrainer = currentUser.ruolo === 'ADMIN' || currentUser.ruolo === 'TRAINER';
            const fineSlot = slot.ora + 2;
            const isSlotPassato = isPassato || (isOggi && fineSlot <= oraAttuale);
            
            let cardOpacity = isSlotPassato ? 'opacity-50 grayscale' : '';
            let trainerClass = slot.trainer ? 'bg-black text-white border-danger' : 'bg-light text-muted border-secondary-subtle';
            const jsonNomi = JSON.stringify(slot.listaIscritti || []).replace(/"/g, '&quot;');

            let trainerHtml = slot.trainer ? 
                `<div class="d-flex align-items-center justify-content-center p-2 mb-2 rounded border border-2 ${trainerClass}" ${isTrainer && !isSlotPassato ? `onclick="toggleTrainer('${dataSelezionata}', ${slot.ora})"` : ''} style="cursor:${isTrainer ? 'pointer' : 'default'}"><img src="${slot.trainerFoto || `https://i.pravatar.cc/100?u=${slot.trainer}`}" class="rounded-circle me-2 border border-white" style="width: 30px; height: 30px; object-fit: cover;"><div><small class="text-uppercase fw-bold d-block" style="font-size:0.6rem; line-height:1;">Trainer</small><span class="small fw-bold">${slot.trainer}</span></div></div>` :
                `<div class="p-2 mb-2 rounded border border-2 ${trainerClass}" ${isTrainer && !isSlotPassato ? `onclick="toggleTrainer('${dataSelezionata}', ${slot.ora})"` : ''} style="cursor:${isTrainer ? 'pointer' : 'default'}"><small class="text-uppercase fw-bold" style="font-size:0.7rem">Trainer</small><br><i class="fa-solid fa-user-shield opacity-50"></i> Nessuno</div>`;

            let footerContent = '';
            let btnLista = `<button class="btn btn-sm btn-link text-decoration-none text-dark w-100 mb-2" onclick="mostraIscritti('${jsonNomi}')"><small><i class="fa-solid fa-eye text-danger"></i> Vedi chi c'è</small></button>`;

            if (isSlotPassato) {
                footerContent = `<div class="text-muted fw-bold small"><i class="fa-solid fa-lock"></i> CONCLUSO</div>`;
            } else if (!isTrainer) {
                const isBooked = slot.listaIscritti && slot.listaIscritti.some(u => u.nome === currentUser.username);
                footerContent = isBooked ? 
                    `<button class="btn btn-sm btn-outline-secondary w-100" onclick="disiscrivitiSlot('${dataSelezionata}', ${slot.ora})"><i class="fa-solid fa-xmark"></i> Annulla</button>` :
                    `<button class="btn btn-sm btn-outline-danger w-100" onclick="prenotaSlot('${dataSelezionata}', ${slot.ora})"><i class="fa-solid fa-plus"></i> Iscriviti</button>`;
            } else {
                footerContent = '<small class="text-muted">Gestisci Turno</small>';
            }

            grid.innerHTML += `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100 shadow-sm border-0 ${cardOpacity}">
                        <div class="card-header bg-danger text-white text-center fw-bold">${slot.ora}:00 - ${slot.ora + 2}:00</div>
                        <div class="card-body text-center d-flex flex-column justify-content-between">
                            <div>${trainerHtml}<div class="mb-1"><i class="fa-solid fa-users"></i> Iscritti: <strong class="fs-5">${slot.iscritti}</strong></div>${btnLista}</div>
                            <div class="mt-auto">${footerContent}</div>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) { console.error(err); }
}

async function toggleTrainer(data, ora) {
    showConfirm("Gestione Turno", "Modificare il turno?", async () => {
        await fetch('/api/salapesi/trainer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data, ora: String(ora), trainer: currentUser.username })
        });
        caricaTabellone();
    });
}

async function prenotaSlot(data, ora) {
    showConfirm("Iscrizione", `Iscriverti alle ${ora}:00?`, async () => {
        const oraFormat = String(ora).padStart(2, '0');
        try {
            const res = await fetch('/api/prenotazioni', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomeCliente: currentUser.username, dataOra: `${data}T${oraFormat}:00:00` })
            });
            if (res.ok) { showAlert("Fatto", "Iscrizione ok!"); caricaTabellone(); }
            else showAlert("Errore", await res.text());
        } catch (e) { showAlert("Errore", "Problema rete"); }
    });
}

async function disiscrivitiSlot(data, ora) {
    showConfirm("Annulla", "Cancellare prenotazione?", async () => {
        try {
            const res = await fetch(`/api/salapesi/prenotazione?data=${data}&ora=${ora}&username=${currentUser.username}`, { method: 'DELETE' });
            if (res.ok) { showAlert("Fatto", "Cancellata."); caricaTabellone(); } 
            else showAlert("Errore", await res.text());
        } catch (e) { showAlert("Errore", "Problema rete"); }
    });
}

function mostraIscritti(jsonNomi) {
    const iscritti = JSON.parse(jsonNomi);
    const listaHtml = document.getElementById('lista-nomi-modal');
    listaHtml.innerHTML = '';
    if (iscritti.length === 0) {
        listaHtml.innerHTML = '<li class="list-group-item text-center text-muted py-4">Nessun atleta.</li>';
    } else {
        iscritti.forEach(u => {
            const img = u.foto || `https://i.pravatar.cc/150?u=${u.nome}`;
            listaHtml.innerHTML += `<li class="list-group-item d-flex align-items-center"><img src="${img}" class="rounded-circle border border-2 border-danger me-3" style="width: 40px; height: 40px; object-fit: cover;"><span class="fw-bold text-dark text-uppercase small">${u.nome}</span></li>`;
        });
    }
    new bootstrap.Modal(document.getElementById('modalIscritti')).show();
}

// --- GESTIONE CORSI ADMIN ---

function mostraGestioneCorsi() {
    nascondiTutto();
    document.getElementById('corsi-admin-section').classList.remove('d-none');
    document.getElementById('corso-data').min = new Date().toISOString().slice(0, 10);
    caricaCorsiAdmin();
}

async function caricaCorsiAdmin() {
    const lista = document.getElementById('lista-lezioni-admin');
    lista.innerHTML = '<p class="text-muted">Caricamento...</p>';
    try {
        const res = await fetch('/api/lezioni');
        const lezioni = await res.json();
        lista.innerHTML = '';
        if(lezioni.length === 0) { lista.innerHTML = '<div class="alert alert-warning">Nessuna lezione.</div>'; return; }

        lezioni.forEach(l => {
            const date = new Date(l.dataOra);
            const giorno = date.toLocaleDateString('it-IT', { weekday:'short', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
            const fine = l.orarioFine ? l.orarioFine.slice(0,5) : ''; 
            const orarioCompleto = fine ? `${date.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' })} - ${fine}` : date.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });

            lista.innerHTML += `
                <div class="col-12"><div class="card shadow-sm border-start border-4 border-danger"><div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="fw-bold mb-0 text-uppercase">${l.materia}</h5>
                        <p class="mb-1 text-muted small"><i class="fa-regular fa-clock"></i> ${giorno} ${orarioCompleto} <br> Trainer: <strong>${l.trainer}</strong></p>
                        <span class="badge bg-secondary">Iscritti: ${l.iscrittiAttuali} / ${l.maxPosti}</span>
                    </div>
                    <div>
                        <button onclick="mostraIscrittiLezione(${l.id})" class="btn btn-sm btn-outline-dark me-2"><i class="fa-solid fa-users"></i></button>
                        <button onclick="eliminaLezione(${l.id})" class="btn btn-sm btn-outline-danger"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div></div></div>`;
        });
    } catch(e) { console.error(e); }
}

async function mostraIscrittiLezione(id) {
    try {
        const res = await fetch(`/api/lezioni/${id}/iscritti`);
        const nomi = await res.json();
        const oggetti = nomi.map(n => ({ nome: n, foto: null }));
        mostraIscritti(JSON.stringify(oggetti));
    } catch(e) { showAlert("Errore", "Recupero iscritti fallito."); }
}

async function handleCreaLezione(e) {
    e.preventDefault();
    const payload = {
        materia: document.getElementById('corso-materia').value,
        data: document.getElementById('corso-data').value,
        ora: document.getElementById('corso-ora').value,
        oraFine: document.getElementById('corso-ora-fine').value,
        maxPosti: document.getElementById('corso-max-posti').value,
        trainer: currentUser.username
    };
    try {
        const res = await fetch('/api/lezioni', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
        if(res.ok) { showAlert("Fatto", "Lezione creata!"); caricaCorsiAdmin(); } else showAlert("Errore", "Fallito.");
    } catch(e) { showAlert("Errore", "Rete."); }
}

async function eliminaLezione(id) {
    showConfirm("Eliminare?", "Cancellerai anche le prenotazioni.", async () => {
        await fetch(`/api/lezioni/${id}`, { method: 'DELETE' });
        caricaCorsiAdmin();
    });
}

// --- CORSI CLIENTE ---

async function caricaCorsiCliente() {
    const lista = document.getElementById('lista-corsi-disponibili');
    lista.innerHTML = '<p class="text-center text-muted">Caricamento...</p>';
    try {
        const res = await fetch('/api/lezioni');
        const lezioni = await res.json();
        lista.innerHTML = '';
        const futuri = lezioni.filter(l => new Date(l.dataOra) > new Date());

        if(futuri.length === 0) { lista.innerHTML = '<div class="col-12 text-center text-muted py-5">Nessun corso futuro.</div>'; return; }

        futuri.forEach(l => {
            const date = new Date(l.dataOra);
            const giorno = date.toLocaleDateString('it-IT', { weekday:'long', day:'numeric' });
            const ora = date.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
            const fine = l.orarioFine ? l.orarioFine.slice(0,5) : '';
            const isPieno = l.iscrittiAttuali >= l.maxPosti;
            
            let icon = 'fa-dumbbell';
            if(l.materia === 'Yoga') icon = 'fa-spa';
            if(l.materia === 'Pilates') icon = 'fa-heart-pulse';
            if(l.materia === 'Zumba') icon = 'fa-music';
            if(l.materia === 'Boxe') icon = 'fa-hand-fist';

            lista.innerHTML += `
                <div class="col-md-6 col-lg-4"><div class="card h-100 shadow-sm border-0 prenotazione-card"><div class="card-body text-center">
                    <div class="mb-3"><i class="fa-solid ${icon} fa-3x text-danger opacity-75"></i></div>
                    <h4 class="fw-bold text-uppercase mb-1">${l.materia}</h4>
                    <p class="text-muted fw-bold mb-2">${giorno} <br> ${ora} - ${fine}</p>
                    <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3"><small>TRAINER</small><span class="fw-bold">${l.trainer}</span></div>
                    <div class="mb-3 small fw-bold ${isPieno ? 'text-danger' : 'text-success'}">Posti: ${l.iscrittiAttuali} / ${l.maxPosti}</div>
                    <button onclick="prenotaCorso(${l.id})" class="btn ${isPieno ? 'btn-secondary disabled' : 'btn-danger'} w-100 fw-bold text-uppercase">${isPieno ? 'SOLD OUT' : 'PRENOTA'}</button>
                </div></div></div>`;
        });
    } catch(e) { console.error(e); }
}

async function prenotaCorso(lezioneId) {
    showConfirm("Confermi?", "Vuoi prenotarti?", async () => {
        try {
            const res = await fetch('/api/prenotazioni', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ nomeCliente: currentUser.username, lezioneId: lezioneId })
            });
            if(res.ok) { showAlert("Evviva!", "Prenotato!"); caricaMiePrenotazioni(); caricaCorsiCliente(); }
            else showAlert("Errore", await res.text());
        } catch(e) { showAlert("Errore", "Rete."); }
    });
}

// --- ALBO TRAINERS ---

function mostraAlboTrainers() {
    nascondiTutto();
    document.getElementById('albo-trainers-section').classList.remove('d-none');
    caricaTrainers();
}

async function caricaTrainers() {
    const grid = document.getElementById('grid-trainers');
    grid.innerHTML = '<p class="text-center">Caricamento...</p>';
    try {
        const res = await fetch('/api/trainers');
        const trainers = await res.json();
        grid.innerHTML = '';
        if(trainers.length === 0) { grid.innerHTML = '<p class="text-center">Nessun trainer.</p>'; return; }

        trainers.forEach(t => {
            const img = t.fotoUrl || `https://i.pravatar.cc/300?u=${t.username}`;
            const bio = t.bio || "Esperto Fitness.";
            let btnEdit = (currentUser && currentUser.ruolo === 'ADMIN') ? 
                `<button class="btn btn-sm btn-dark position-absolute top-0 end-0 m-3 rounded-circle shadow btn-edit-trainer" onclick="apriModalEditTrainer('${t.username}', '', '${bio.replace(/'/g, "&apos;")}')"><i class="fa-solid fa-pencil text-warning"></i></button>` : '';

            grid.innerHTML += `
                <div class="col-md-6 col-lg-4 col-xl-3"><div class="trainer-card shadow-sm">${btnEdit}
                    <div class="trainer-header"><img src="${img}" alt="${t.username}" class="trainer-img shadow"></div>
                    <div class="trainer-body"><h4 class="fw-bold text-uppercase mb-1">${t.username}</h4><span class="trainer-role">Coach</span><p class="text-muted small mt-3">${bio}</p></div>
                </div></div>`;
        });
    } catch(e) { console.error(e); }
}

function apriModalEditTrainer(username, foto, bio) {
    document.getElementById('edit-trainer-username').value = username;
    document.getElementById('edit-trainer-foto').value = foto;
    document.getElementById('file-edit-trainer-foto').value = '';
    document.getElementById('edit-trainer-bio').value = bio;
    new bootstrap.Modal(document.getElementById('modalEditTrainer')).show();
}

async function handleEditTrainer(e) {
    e.preventDefault();
    const target = document.getElementById('edit-trainer-username').value;
    const urlInput = document.getElementById('edit-trainer-foto').value;
    const bio = document.getElementById('edit-trainer-bio').value;
    const fileInput = document.getElementById('file-edit-trainer-foto');
    
    let fotoFinale = urlInput;
    if (fileInput.files.length > 0) {
        try { fotoFinale = await toBase64(fileInput.files[0]); } catch (err) { showAlert("Errore", "File non valido"); return; }
    }

    try {
        const res = await fetch('/api/utenti/admin/update-trainer', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ targetUsername: target, fotoUrl: fotoFinale, bio: bio })
        });
        if (res.ok) { showAlert("Fatto", "Aggiornato!"); location.reload(); } 
        else showAlert("Errore", "Fallito.");
    } catch(e) { showAlert("Errore", "Rete"); }
}

// --- GESTIONE UTENTI ADMIN ---

function mostraGestioneUtenti() {
    nascondiTutto();
    document.getElementById('gestione-utenti-section').classList.remove('d-none');
    caricaUtenti();
}

async function caricaUtenti() {
    const tbody = document.getElementById('tabella-utenti');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Caricamento...</td></tr>';
    try {
        const res = await fetch('/api/utenti');
        const utenti = await res.json();
        tbody.innerHTML = '';
        utenti.forEach(u => {
            const img = u.fotoUrl || `https://i.pravatar.cc/150?u=${u.username}`;
            const isMe = u.username === currentUser.username;
            let selectRuolo = `<select class="form-select form-select-sm gym-input" onchange="cambiaRuolo('${u.username}', this.value)" ${isMe ? 'disabled' : ''} style="width: 130px;">
                <option value="USER" ${u.ruolo === 'USER' ? 'selected' : ''}>Atleta</option>
                <option value="TRAINER" ${u.ruolo === 'TRAINER' ? 'selected' : ''}>Trainer</option>
                <option value="ADMIN" ${u.ruolo === 'ADMIN' ? 'selected' : ''}>Admin</option>
            </select>`;
            
            tbody.innerHTML += `<tr><td class="ps-4"><div class="d-flex align-items-center"><img src="${img}" class="rounded-circle me-3 border" style="width:40px;height:40px;object-fit:cover;"><div><div class="fw-bold">${u.username}</div><div class="small text-muted">ID: ${u.id}</div></div></div></td><td>${u.email || '-'}</td><td>${selectRuolo}</td><td>${isMe ? '<span class="badge bg-secondary">Tu</span>' : '<button class="btn btn-sm btn-outline-danger" disabled><i class="fa-solid fa-lock"></i></button>'}</td></tr>`;
        });
    } catch(e) { console.error(e); }
}

async function cambiaRuolo(username, nuovoRuolo) {
    showConfirm("Ruolo", `Cambiare ${username} a ${nuovoRuolo}?`, async () => {
        try {
            await fetch('/api/utenti/role', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username: username, ruolo: nuovoRuolo })
            });
            showAlert("Fatto", "Ruolo aggiornato.");
            caricaUtenti();
        } catch(e) { showAlert("Errore", "Rete."); }
    });
}

// --- STATISTICHE & NOTIFICHE ---

async function caricaStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        let div = document.getElementById('numero-oggi');
        if(!div) {
            div = document.createElement('div');
            div.id = 'numero-oggi';
            div.className = 'text-center py-4';
            document.getElementById('chart-prenotazioni').replaceWith(div);
        }
        div.innerHTML = `<h1 class="display-1 fw-bold text-danger">${data.oggi}</h1><p class="text-muted">Nuovi Ingressi</p>`;

        renderChart('chart-stato', 'doughnut', {
            labels: ['Ok', 'Attesa', 'No'],
            datasets: [{ data: [data.stati['CONFERMATA']||0, data.stati['IN ATTESA']||0, data.stati['RIFIUTATA']||0], backgroundColor: ['#198754','#ffc107','#dc3545'] }]
        });

        renderChart('chart-corsi', 'bar', {
            labels: Object.keys(data.corsi),
            datasets: [{ label:'Iscritti', data: Object.values(data.corsi), backgroundColor: '#e74c3c' }]
        });
    } catch(e) { console.error(e); }
}

let charts = {};
function renderChart(id, type, data) {
    const ctx = document.getElementById(id);
    if(!ctx) return;
    if(charts[id]) { charts[id].destroy(); delete charts[id]; }
    charts[id] = new Chart(ctx, { type: type, data: data, options: { responsive:true, maintainAspectRatio:false } });
}

async function caricaNotifiche() {
    const lista = document.getElementById('lista-notifiche');
    try {
        const res = await fetch(`/api/notifiche?username=${currentUser.username}`);
        const notifiche = await res.json();
        lista.innerHTML = `<li><h6 class="dropdown-header text-uppercase fw-bold text-danger">Notifiche</h6></li><li><hr class="dropdown-divider"></li>`;
        if (notifiche.length === 0) {
            lista.innerHTML += '<li class="text-center text-muted small py-3">Nessuna notifica</li>';
            document.getElementById('badge-notifiche').classList.add('d-none');
        } else {
            document.getElementById('badge-notifiche').classList.remove('d-none');
            notifiche.forEach(n => {
                const data = new Date(n.dataOra).toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'});
                lista.innerHTML += `<li><a class="dropdown-item small text-wrap" href="#"><div class="d-flex justify-content-between"><strong class="text-dark">Info</strong><span class="text-muted" style="font-size:0.7rem">${data}</span></div><p class="mb-0 text-secondary">${n.messaggio}</p></a></li><li><hr class="dropdown-divider"></li>`;
            });
        }
    } catch(e) {}
}

async function handleBooking(e) {
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
            msgDiv.textContent = "✅ Richiesta inviata!";
            msgDiv.className = "mt-3 text-center fw-bold text-success";
            impostaDataDefault();
            caricaMiePrenotazioni();
        } else {
            msgDiv.textContent = "❌ " + await response.text();
            msgDiv.className = "mt-3 text-center fw-bold text-danger";
        }
    } catch (err) { msgDiv.textContent = "Errore"; }
}

async function caricaMiePrenotazioni() {
    const listaDiv = document.getElementById('lista-mie-prenotazioni');
    try {
        const res = await fetch(`/api/prenotazioni?username=${currentUser.username}`);
        const prenotazioni = await res.json();
        listaDiv.innerHTML = '';
        if (prenotazioni.length === 0) { listaDiv.innerHTML = '<div class="alert alert-info">Nessuna prenotazione.</div>'; return; }
        
        prenotazioni.sort((a, b) => new Date(b.dataOra) - new Date(a.dataOra));
        prenotazioni.forEach(p => {
            const dataLeggibile = new Date(p.dataOra).toLocaleString('it-IT', { day: '2-digit', month: 'long', hour: '2-digit', minute:'2-digit' });
            let badge = p.stato === 'CONFERMATA' ? 'bg-success' : (p.stato === 'RIFIUTATA' ? 'bg-danger' : 'bg-warning text-dark');
            let infoRifiuto = (p.stato === 'RIFIUTATA' && (p.note || p.adminRevisione)) ? `<div class="mt-2 p-2 bg-light border-start border-4 border-danger rounded small"><strong>Motivo:</strong> ${p.note || ''}<br><span>Staff: ${p.adminRevisione || ''}</span></div>` : '';
            let titolo = p.lezione ? '🧘‍♀️ ' + p.lezione.materia : '📅 Prenotazione';
            
            listaDiv.innerHTML += `<div class="col-12"><div class="card shadow-sm border-0"><div class="card-body"><div class="d-flex justify-content-between align-items-center mb-2"><div><h6 class="mb-0 fw-bold">${titolo}</h6><small class="text-muted">${dataLeggibile}</small></div><span class="badge ${badge} rounded-pill">${p.stato}</span></div>${infoRifiuto}</div></div></div>`;
        });
    } catch (err) { console.error(err); }
}

async function caricaPrenotazioni(isTrainer = false) {
    const listaDiv = document.getElementById('lista-prenotazioni');
    listaDiv.innerHTML = '<p>Caricamento...</p>';
    try {
        let url = '/api/prenotazioni';
        if (isTrainer) url += `?trainer=${currentUser.username}`;
        const res = await fetch(url);
        const prenotazioni = await res.json();
        listaDiv.innerHTML = '';
        if (prenotazioni.length === 0) { listaDiv.innerHTML = '<p>Nessuna richiesta.</p>'; return; }      
        prenotazioni.sort((a, b) => new Date(b.dataOra) - new Date(a.dataOra));
        prenotazioni.forEach(p => {
            let azioni = '';
            if (p.stato === 'IN ATTESA') {
                azioni = `<div class="mt-3 d-flex gap-2"><button class="btn btn-success flex-grow-1" onclick="gestisciPrenotazione(${p.id}, true)">Accetta</button><button class="btn btn-outline-danger flex-grow-1" onclick="gestisciPrenotazione(${p.id}, false)">Rifiuta</button></div>`;
            }
            let noteHtml = p.note ? `<div class="mt-2 small text-danger border-top pt-2">Note: ${p.note}</div>` : '';
            let titolo = p.lezione ? `${p.nomeCliente} - 🧘‍♀️ ${p.lezione.materia}` : p.nomeCliente;
            const classStato = p.stato.replace(' ', '-');
            listaDiv.innerHTML += `<div class="col-md-6 col-lg-4"><div class="card h-100 shadow-sm border-0 border-status-${classStato} prenotazione-card"><div class="card-body"><h5 class="fw-bold">${titolo}</h5><p class="text-muted mb-1">📅 ${new Date(p.dataOra).toLocaleString('it-IT')}</p><span class="badge ${p.stato === 'CONFERMATA' ? 'bg-success' : (p.stato === 'RIFIUTATA' ? 'bg-danger' : 'bg-warning text-dark')}">${p.stato}</span>${noteHtml} ${azioni}</div></div></div>`;
        });
    } catch (err) { console.error(err); }
}

async function gestisciPrenotazione(id, accetta) {
    let motivazione = '';
    if (!accetta) {
        motivazione = prompt("Motivazione rifiuto:");
        if (motivazione === null) return;
    }
    try {
        await fetch(`/api/prenotazioni/${id}/conferma?accetta=${accetta}&motivazione=${encodeURIComponent(motivazione || '')}&admin=${currentUser.username}`, { method: 'POST' });
        caricaPrenotazioni(currentUser.ruolo === 'TRAINER');
    } catch (err) { showAlert("Errore", "Rete"); }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Ripristino
    const savedUser = localStorage.getItem('fitlife_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            if (currentUser && currentUser.username) {
                console.log("Ripristino:", currentUser.username);
                loginSuccess();
            } else { throw new Error("Invalido"); }
        } catch (e) {
            localStorage.removeItem('fitlife_user');
            currentUser = null;
            mostraLanding();
        }
    } else {
        mostraLanding();
    }

    // 2. Event Listeners Sicuri
    const forms = [
        { id: 'login-form', handler: handleLogin },
        { id: 'register-form', handler: handleRegister },
        { id: 'form-profilo', handler: handleProfilo },
        { id: 'form-crea-lezione', handler: handleCreaLezione },
        { id: 'form-edit-trainer', handler: handleEditTrainer },
        { id: 'booking-form', handler: handleBooking }
    ];

    forms.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) el.addEventListener('submit', f.handler);
    });
});
