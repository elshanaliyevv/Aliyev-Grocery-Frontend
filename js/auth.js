/* ==============================
   AUTH.JS - Login ve Register emeliyyatlari
   ============================== */



// ---- TAB KECIDI ----

// Login ve Register tab-lari arasinda kecid
function switchTab(tabName) {
    // Her iki tab content-i gizlet
    document.getElementById("login-tab").className = "tab-content";
    document.getElementById("register-tab").className = "tab-content";

    // Her iki tab button-u deaktiv et
    document.getElementById("login-tab-btn").className = "tab-btn";
    document.getElementById("register-tab-btn").className = "tab-btn";

    // Secilmis tab-i aktiv et
    document.getElementById(tabName + "-tab").className = "tab-content active";
    document.getElementById(tabName + "-tab-btn").className = "tab-btn active";

    // Alert-i gizlet
    hideAlert("auth-alert");
}

// ---- LOGIN ----

function handleLogin(event) {
    // Formun default davranisini dayandirmaq (sehife yenilemesin)
    event.preventDefault();

    // Input deyerlerini oxumaq
    var identifier = document.getElementById("login-identifier").value;
    var password = document.getElementById("login-password").value;

    // Button-u disable et (tekrar basmasin)
    var btn = document.getElementById("login-btn");
    btn.disabled = true;
    btn.textContent = "Gözləyin...";

    // API-ya sorgu gonder
    fetchPublic("/auth/login", "POST", {
        identifier: identifier,
        password: password
    })
    .then(function(data) {
        // Ugurlu cavab - token ve user melumatlarini saxla
        saveTokens(data.tokensResponse);
        saveUser(data.userResponse);

        // Products sehifesine yonlendir
        window.location.href = "products.html";
    })
    .catch(function(error) {
        // Xeta mesajini goster
        showAlert("auth-alert", error.message, "error");
        btn.disabled = false;
        btn.textContent = "Daxil ol";
    });
}

// ---- REGISTER ----

function handleRegister(event) {
    // Formun default davranisini dayandirmaq
    event.preventDefault();

    // Input deyerlerini oxumaq
    var username = document.getElementById("reg-username").value;
    var password = document.getElementById("reg-password").value;
    var email = document.getElementById("reg-email").value;
    var number = document.getElementById("reg-number").value;

    // Button-u disable et
    var btn = document.getElementById("register-btn");
    btn.disabled = true;
    btn.textContent = "Gözləyin...";

    // API-ya sorgu gonder
    fetchPublic("/auth/register", "POST", {
        username: username,
        password: password,
        email: email,
        number: number
    })
    .then(function(data) {
        // Ugurlu cavab - token ve user melumatlarini saxla
        saveTokens(data.tokensResponse);
        saveUser(data.userResponse);

        // Products sehifesine yonlendir
        window.location.href = "products.html";
    })
    .catch(function(error) {
        // Xeta mesajini goster
        showAlert("auth-alert", error.message, "error");
        btn.disabled = false;
        btn.textContent = "Qeydiyyatdan keç";
    });
}
