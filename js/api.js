var API_URL = "http://localhost:9095/api";
function getAccessToken() {
    return localStorage.getItem("accessToken");
}
function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}
function saveTokens(tokensResponse) {
    localStorage.setItem("accessToken", tokensResponse.accessToken);
    localStorage.setItem("refreshToken", tokensResponse.refreshToken);
}
function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}
function saveUser(userResponse) {
    localStorage.setItem("user", JSON.stringify(userResponse));
}
function getUser() {
    var userStr = localStorage.getItem("user");
    if (userStr) {
        return JSON.parse(userStr);
    }
    return null;
}
function isLoggedIn() {
    return getAccessToken() !== null;
}
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = "index.html";
    }
}

function fetchPublic(endpoint, method, body) {
    var options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    return fetch(API_URL + endpoint, options)
        .then(function(response) {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(function(errorData) {
                var errorMsg = errorData.message || errorData.error || "Xəta baş verdi";
                throw new Error(errorMsg);
            });
        });
}
function showAlert(elementId, message, type) {
    var alertEl = document.getElementById(elementId);
    if (alertEl) {
        alertEl.textContent = message;
        alertEl.className = "alert show alert-" + type;
    }
}
function hideAlert(elementId) {
    var alertEl = document.getElementById(elementId);
    if (alertEl) {
        alertEl.className = "alert";
    }
}

