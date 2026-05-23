initPage();
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('order-btn').addEventListener('click', placeOrder);
document.getElementById('cancel-address-btn').addEventListener('click', closeAddressModal);
document.getElementById('confirm-order-btn').addEventListener('click', confirmOrderWithAddress);
function loadCart() {
    document.getElementById("cart-loading").style.display = "block";
    document.getElementById("cart-content").style.display = "none";

    fetchWithAuth("/user-products/me/cart", "GET")
        .then(function(data) {
            document.getElementById("cart-loading").style.display = "none";
            document.getElementById("cart-content").style.display = "block";
            if (!data.items || data.items.length === 0) {
                document.getElementById("cart-empty").style.display = "block";
                document.getElementById("cart-items-wrapper").style.display = "none";
                return;
            }
            document.getElementById("cart-empty").style.display = "none";
            document.getElementById("cart-items-wrapper").style.display = "block";

            showCartItems(data.items);
            document.getElementById("cart-total").textContent = "₼" + formatPrice(data.totalPrice);
        })
        .catch(function(error) {
            document.getElementById("cart-loading").style.display = "none";
            document.getElementById("cart-content").style.display = "block";
            showAlert("cart-alert", "Səbət yüklənərkən xəta: " + error.message, "error");
        });
}
function showCartItems(items) {
    var container = document.getElementById("cart-items");
    container.innerHTML = "";

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemHTML = '<div class="cart-item">' +
            '<div class="cart-item-info">' +
                '<div class="cart-item-name">' + item.productName + '</div>' +
                '<div class="cart-item-price">₼' + formatPrice(item.unitPrice) + ' x ' + item.quantity + '</div>' +
            '</div>' +
            '<div class="cart-item-actions">' +
                '<div class="quantity-control">' +
                    '<button>−</button>' +
                    '<span>' + item.quantity + '</span>' +
                    '<button>+</button>' +
                '</div>' +
                '<div class="cart-item-total">₼' + formatPrice(item.totalPrice) + '</div>' +
            '</div>' +
            '</div>';

        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = itemHTML;
        var cartItem = tempDiv.firstChild;
        var btns = cartItem.querySelectorAll('.quantity-control button');
        (function(id, qty) {
            btns[0].addEventListener('click', function() { updateQuantity(id, qty - 1); });
            btns[1].addEventListener('click', function() { updateQuantity(id, qty + 1); });
        })(item.id, item.quantity);
        container.appendChild(cartItem);
    }
}
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        if (!confirm("Bu məhsulu səbətdən silmək istəyirsiniz?")) {
            return;
        }
        newQuantity = 0;
    }

    fetchWithAuth("/user-products/" + itemId + "/quantity", "PATCH", {
        quantity: newQuantity
    })
    .then(function() {
        loadCart();
    })
    .catch(function(error) {
        showAlert("cart-alert", "Xəta: " + error.message, "error");
    });
}
function placeOrder() {
    var overlay = document.getElementById("address-modal-overlay");
    overlay.style.display = "flex";
    document.getElementById("addr-modal-loading").style.display = "block";
    document.getElementById("addr-modal-empty").style.display = "none";
    document.getElementById("addr-modal-card").style.display = "none";
    document.getElementById("addr-modal-actions").style.display = "none";
    hideAlert("addr-modal-alert");
    fetchWithAuth("/addresses/me", "GET")
        .then(function(address) {
            document.getElementById("addr-modal-loading").style.display = "none";

            if (!address || !address.city) {
                document.getElementById("addr-modal-empty").style.display = "block";
                return;
            }
            var card = document.getElementById("addr-modal-card");
            var rows = "";
            if (address.city)      rows += '<div class="addr-modal-row"><span class="addr-icon">🏙</span><span>' + address.city + '</span></div>';
            if (address.street)    rows += '<div class="addr-modal-row"><span class="addr-icon">🛣</span><span>' + address.street + '</span></div>';
            if (address.building)  rows += '<div class="addr-modal-row"><span class="addr-icon">🏢</span><span>Bina ' + address.building + '</span></div>';
            if (address.apartment) rows += '<div class="addr-modal-row"><span class="addr-icon">🚪</span><span>Mənzil ' + address.apartment + '</span></div>';
            if (address.note)      rows += '<div class="addr-modal-row"><span class="addr-icon">📝</span><span>' + address.note + '</span></div>';
            card.innerHTML = rows;
            card.style.display = "flex";

            document.getElementById("addr-modal-actions").style.display = "flex";
        })
        .catch(function(error) {
            document.getElementById("addr-modal-loading").style.display = "none";
            document.getElementById("addr-modal-empty").style.display = "block";
        });
}
function closeAddressModal() {
    document.getElementById("address-modal-overlay").style.display = "none";
}
function confirmOrderWithAddress() {
    var btn = document.getElementById("confirm-order-btn");
    btn.disabled = true;
    btn.textContent = "Gözləyin...";
    hideAlert("addr-modal-alert");

    fetchWithAuth("/user-products/order", "POST")
        .then(function(data) {
            closeAddressModal();
            showAlert("cart-alert", "Sifariş uğurla verildi! ✓", "success");
            setTimeout(function() {
                window.location.href = "orders.html";
            }, 2000);
        })
        .catch(function(error) {
            btn.disabled = false;
            btn.textContent = "✓ Sifarişi təsdiqlə";
            showAlert("addr-modal-alert", "Xəta: " + error.message, "error");
        });
}
loadCart();
