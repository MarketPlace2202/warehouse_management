def test_get_inventory(client):
    client.post(
        "/api/products",
        json={
            "name": "Inventory Item",
            "sku": "INV-001",
            "price": "15.00",
            "stock_quantity": 5,
        },
    )

    response = client.get("/api/inventory")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(item["sku"] == "INV-001" for item in data["items"])


def test_dashboard_stats(client):
    client.post(
        "/api/products",
        json={
            "name": "Low Stock",
            "sku": "LOW-001",
            "price": "5.00",
            "stock_quantity": 2,
        },
    )
    client.post(
        "/api/customers",
        json={"name": "Stats Customer", "email": "stats@example.com"},
    )

    response = client.get("/api/inventory/dashboard-stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_products" in data
    assert "total_customers" in data
    assert "total_orders" in data
    assert "low_stock_products" in data
