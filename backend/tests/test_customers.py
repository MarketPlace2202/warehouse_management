def test_create_customer(client):
    payload = {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
    }
    response = client.post("/api/customers", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "john@example.com"


def test_create_customer_duplicate_email(client):
    payload = {
        "name": "John Doe",
        "email": "duplicate@example.com",
        "phone": "+1234567890",
    }
    client.post("/api/customers", json=payload)
    response = client.post("/api/customers", json=payload)
    assert response.status_code == 409
    assert response.json()["message"] == "Customer email must be unique"


def test_list_customers_search(client):
    client.post(
        "/api/customers",
        json={"name": "Alice Smith", "email": "alice@example.com"},
    )
    client.post(
        "/api/customers",
        json={"name": "Bob Jones", "email": "bob@example.com"},
    )

    response = client.get("/api/customers?search=alice")
    assert response.status_code == 200
    assert response.json()["total"] == 1
