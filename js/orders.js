initPage();
document.getElementById('logout-btn').addEventListener('click', logout);

function loadOrders() {
    document.getElementById("orders-loading").style.display = "block";
    document.getElementById("orders-content").style.display = "none";

    fetchWithAuth("/user-products/me", "GET")
        .then(function(data) {
            document.getElementById("orders-loading").style.display = "none";
            document.getElementById("orders-content").style.display = "block";
            var orders = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].status !== "CART") {
                    orders.push(data[i]);
                }
            }
            if (orders.length === 0) {
                document.getElementById("orders-empty").style.display = "block";
                document.getElementById("orders-list").style.display = "none";
                return;
            }

            document.getElementById("orders-empty").style.display = "none";
            document.getElementById("orders-list").style.display = "block";

            showOrders(orders);
        })
        .catch(function(error) {
            document.getElementById("orders-loading").style.display = "none";
            document.getElementById("orders-content").style.display = "block";
            showAlert("orders-alert", "Sifarişlər yüklənərkən xəta: " + error.message, "error");
        });
}

function showOrders(orders) {
    var container = document.getElementById("orders-list");
    container.innerHTML = "";

    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var cancelBtnHTML = "";
        if (order.status === "PENDING") {
            cancelBtnHTML = '<button class="btn btn-danger btn-sm">✕ Ləğv et</button>';
        }

        var cardHTML = '<div class="order-card">' +
            '<div class="order-header">' +
                '<div>' +
                    '<div class="order-id">' + order.productName + '</div>' +
                    '<div class="order-date">' + formatDate(order.createdAt) + '</div>' +
                '</div>' +
                '<div>' + createBadge(order.status) + '</div>' +
            '</div>' +
            '<div class="order-details">' +
                '<div>' +
                    '<span style="color: var(--gray-500); font-size: 13px;">Miqdar: ' + order.quantity + '</span>' +
                    '<span style="color: var(--gray-500); font-size: 13px; margin-left: 16px;">Vahid: ₼' + formatPrice(order.unitPrice) + '</span>' +
                '</div>' +
                '<div style="display: flex; align-items: center; gap: 12px;">' +
                    '<span style="font-weight: 700; color: var(--green-dark); font-size: 16px;">₼' + formatPrice(order.totalPrice) + '</span>' +
                    cancelBtnHTML +
                '</div>' +
            '</div>' +
            '</div>';

        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = cardHTML;
        var orderEl = tempDiv.firstChild;
        if (order.status === "PENDING") {
            var cancelBtn = orderEl.querySelector('.btn-danger');
            (function(orderId) {
                cancelBtn.addEventListener('click', function() { cancelOrder(orderId); });
            })(order.id);
        }
        container.appendChild(orderEl);
    }
}

function cancelOrder(orderId) {
    if (!confirm("Bu sifarişi ləğv etmək istəyirsiniz?")) {
        return;
    }

    fetchWithAuth("/user-products/" + orderId + "/cancel", "PATCH")
        .then(function() {
            showAlert("orders-alert", "Sifariş ləğv edildi", "success");
            loadOrders();
        })
        .catch(function(error) {
            showAlert("orders-alert", "Xəta: " + error.message, "error");
        });
}

loadOrders();
