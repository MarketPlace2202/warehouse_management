def _create_customer(client):
    response = client.post(
        "/api/customers",
        json={"name": "Order Customer", "email": "order@example.com"},
    )
    return response.json()["id"]


def _create_product(client, sku: str, stock: int, price: str = "10.00"):
    response = client.post(
        "/api/products",
        json={
            "name": f"Product {sku}",
            "sku": sku,
            "price": price,
            "stock_quantity": stock,
        },
    )
    return response.json()["id"]


def test_create_order_success(client):
    customer_id = _create_customer(client)
    product1 = _create_product(client, "ORD-P1", 100)
    product2 = _create_product(client, "ORD-P2", 50)

    response = client.post(
        "/api/orders",
        json={
            "customer_id": customer_id,
            "items": [
                {"product_id": product1, "quantity": 2},
                {"product_id": product2, "quantity": 3},
            ],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["customer_id"] == customer_id
    assert len(data["items"]) == 2
    assert float(data["total_amount"]) == 50.0

    product_resp = client.get(f"/api/products/{product1}")
    assert product_resp.json()["stock_quantity"] == 98


def test_create_order_insufficient_stock(client):
    customer_id = _create_customer(client)
    product_id = _create_product(client, "LOW-STOCK", 1)

    response = client.post(
        "/api/orders",
        json={
            "customer_id": customer_id,
            "items": [{"product_id": product_id, "quantity": 5}],
        },
    )
    assert response.status_code == 400
    assert response.json()["message"] == "Insufficient stock"

    product_resp = client.get(f"/api/products/{product_id}")
    assert product_resp.json()["stock_quantity"] == 1


def test_create_order_invalid_customer(client):
    product_id = _create_product(client, "NO-CUST", 10)
    response = client.post(
        "/api/orders",
        json={
            "customer_id": 9999,
            "items": [{"product_id": product_id, "quantity": 1}],
        },
    )
    assert response.status_code == 404


def test_list_and_get_order(client):
    customer_id = _create_customer(client)
    product_id = _create_product(client, "GET-ORD", 20)

    create_resp = client.post(
        "/api/orders",
        json={
            "customer_id": customer_id,
            "items": [{"product_id": product_id, "quantity": 1}],
        },
    )
    order_id = create_resp.json()["id"]

    list_resp = client.get("/api/orders")
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1

    get_resp = client.get(f"/api/orders/{order_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == order_id
