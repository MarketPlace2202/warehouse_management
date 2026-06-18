from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class InventoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    price: Decimal
    stock_quantity: int
    updated_at: datetime


class InventorySummaryResponse(BaseModel):
    total_products: int
    total_stock: int
    low_stock_count: int
    items: list[InventoryItemResponse]
