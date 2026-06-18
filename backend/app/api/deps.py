from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.customer_service import CustomerService
from app.services.inventory_service import InventoryService
from app.services.order_service import OrderService
from app.services.product_service import ProductService


def get_product_service(db: Session = Depends(get_db)) -> Generator[ProductService, None, None]:
    yield ProductService(db)


def get_customer_service(db: Session = Depends(get_db)) -> Generator[CustomerService, None, None]:
    yield CustomerService(db)


def get_order_service(db: Session = Depends(get_db)) -> Generator[OrderService, None, None]:
    yield OrderService(db)


def get_inventory_service(db: Session = Depends(get_db)) -> Generator[InventoryService, None, None]:
    yield InventoryService(db)
