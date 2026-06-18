from fastapi import APIRouter

from app.api.routes import customers, inventory, orders, products

api_router = APIRouter(prefix="/api")
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(orders.router)
api_router.include_router(inventory.router)
