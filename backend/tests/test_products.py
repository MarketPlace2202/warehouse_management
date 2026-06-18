def test_create_product(client):
    payload = {
        "name": "Widget",
        "description": "A test widget",
        "sku": "WGT-001",
        "price": "19.99",
        "stock_quantity": 100,
    }
    response = client.post("/api/products", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Widget"
    assert data["sku"] == "WGT-001"
    assert data["stock_quantity"] == 100


def test_create_product_duplicate_sku(client):
    payload = {
        "name": "Widget",
        "description": "A test widget",
        "sku": "WGT-DUP",
        "price": "19.99",
        "stock_quantity": 100,
    }
    client.post("/api/products", json=payload)
    response = client.post("/api/products", json=payload)
    assert response.status_code == 409
    assert response.json()["message"] == "Product SKU must be unique"


def test_list_products_with_pagination(client):
    for i in range(3):
        client.post(
            "/api/products",
            json={
                "name": f"Product {i}",
                "sku": f"SKU-{i}",
                "price": "10.00",
                "stock_quantity": 5,
            },
        )

    response = client.get("/api/products?page=1&page_size=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] == 3


def test_get_update_delete_product(client):
    create_resp = client.post(
        "/api/products",
        json={
            "name": "Gadget",
            "sku": "GAD-001",
            "price": "29.99",
            "stock_quantity": 50,
        },
    )
    product_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/products/{product_id}")
    assert get_resp.status_code == 200

    update_resp = client.put(
        f"/api/products/{product_id}",
        json={"name": "Updated Gadget", "stock_quantity": 40},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Updated Gadget"

    delete_resp = client.delete(f"/api/products/{product_id}")
    assert delete_resp.status_code == 200

    not_found = client.get(f"/api/products/{product_id}")
    assert not_found.status_code == 404
