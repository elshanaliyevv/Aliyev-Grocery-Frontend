requireLogin();

var user = getUser();
if (user) {
    document.getElementById("navbar-user").textContent = user.username;
}
applyNavbarRole();

function logout() {
    clearTokens();
    window.location.href = "index.html";
}

var allProducts = [];

function loadCategories() {
    fetchWithAuth("/categories", "GET")
        .then(function(data) {
            var select = document.getElementById("category-filter");
            select.innerHTML = '<option value="all">Bütün kateqoriyalar</option>';
            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement("option");
                opt.value = data[i].id;
                opt.textContent = data[i].name;
                select.appendChild(opt);
            }
        })
        .catch(function(err) {
            console.error("Kateqoriyalar yüklənmədi", err);
        });
}

function loadProducts() {
    fetchWithAuth("/products", "GET")
        .then(function(data) {
            allProducts = data;
            applyFilters();
        })
        .catch(function(err) {
            showAlert("products-alert", "Məhsullar yüklənmədi: " + err.message, "error");
        });
}

function showProducts(list) {
    var grid = document.getElementById("products-grid");
    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = '<div class="empty-state">' +
            '<div class="empty-state-icon">🔍</div>' +
            '<div class="empty-state-text">Məhsul tapılmadı</div>' +
            '</div>';
        return;
    }

    for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var letter = p.name ? p.name.charAt(0).toUpperCase() : "?";

        var html = '<div class="product-card">' +
            '<div class="product-img" style="background-color: var(--green-pale); color: var(--green-dark);">' + letter + '</div>' +
            '<div class="product-info">' +
                '<div class="product-name">' + p.name + '</div>' +
                '<div class="product-category">' + (p.categoryName || "") + '</div>' +
                '<div class="product-bottom">' +
                    '<div class="product-price">₼' + formatPrice(p.price) + '</div>' +
                    '<button class="btn btn-primary btn-sm">Səbətə +</button>' +
                '</div>' +
            '</div>' +
            '</div>';

        var div = document.createElement("div");
        div.innerHTML = html;
        var productEl = div.firstChild;
        var addBtn = productEl.querySelector('.btn-primary');
        (function(productId) {
            addBtn.addEventListener('click', function() { addToCart(productId, 1); });
        })(p.id);
        grid.appendChild(productEl);
    }
}
function applyFilters() {
    var searchVal = document.getElementById("search-input").value.toLowerCase().trim();
    var catId = document.getElementById("category-filter").value;

    var result = [];
    for (var i = 0; i < allProducts.length; i++) {
        var p = allProducts[i];
        var matchSearch = p.name.toLowerCase().indexOf(searchVal) !== -1;
        var matchCat = catId === "all" || (p.categoryId && p.categoryId.toString() === catId);
        if (matchSearch && matchCat) {
            result.push(p);
        }
    }
    showProducts(result);
}

function filterProducts() {
    applyFilters();
}

function addToCart(productId, qty) {
    fetchWithAuth("/user-products", "POST", { productId: productId, quantity: qty })
        .then(function() {
            showAlert("products-alert", "Məhsul səbətə əlavə edildi ✓", "success");
            setTimeout(function() { hideAlert("products-alert"); }, 2000);
        })
        .catch(function(err) {
            showAlert("products-alert", "Xəta: " + err.message, "error");
        });
}

document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('category-filter').addEventListener('change', filterProducts);

loadCategories();
loadProducts();
