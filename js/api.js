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

function isAdminOrCourier() {
    var user = getUser();
    return user && (user.role === "ADMIN" || user.role === "COURIER");
}

function applyNavbarRole() {
    var adminLink = document.getElementById("nav-admin-link");
    if (adminLink) {
        if (!isAdminOrCourier()) {
            adminLink.style.display = "none";
        }
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

function fetchWithAuth(endpoint, method, body) {
    var token = getAccessToken();

    var options = {
        method: method || "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    return fetch(API_URL + endpoint, options)
        .then(function(response) {
            if (response.status === 401) {
                return tryRefreshToken().then(function() {
                    options.headers["Authorization"] = "Bearer " + getAccessToken();
                    return fetch(API_URL + endpoint, options);
                }).then(function(retryResponse) {
                    if (retryResponse.ok) {
                        if (retryResponse.status === 204) {
                            return null;
                        }
                        return retryResponse.json();
                    }
                    throw new Error("Sorğu uğursuz oldu");
                });
            }
            if (response.ok) {
                if (response.status === 204) {
                    return null;
                }
                return response.json();
            }
            return response.json().then(function(errorData) {
                var errorMsg = errorData.message || errorData.error || "Xəta baş verdi";
                throw new Error(errorMsg);
            });
        });
}

function tryRefreshToken() {
    var refreshToken = getRefreshToken();
    if (!refreshToken) {
        clearTokens();
        window.location.href = "index.html";
        return Promise.reject("No refresh token");
    }

    return fetch(API_URL + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshToken })
    })
    .then(function(response) {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Refresh failed");
    })
    .then(function(data) {
        saveTokens(data);
    })
    .catch(function() {
        clearTokens();
        window.location.href = "index.html";
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

function formatPrice(price) {
    if (price === null || price === undefined) return "0.00";
    return Number(price).toFixed(2);
}

function initPage() {
    requireLogin();
    var currentUser = getUser();
    if (currentUser) {
        var navUser = document.getElementById("navbar-user");
        if (navUser) {
            navUser.textContent = currentUser.username;
        }
    }
    applyNavbarRole();
}

function logout() {
    clearTokens();
    window.location.href = "index.html";
}