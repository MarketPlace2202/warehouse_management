from sqlalchemy.orm import Session

from app.repositories.inventory_repository import InventoryRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.common import PaginatedResponse, PaginationParams
from app.schemas.inventory import InventoryItemResponse, InventorySummaryResponse


class InventoryService:
    LOW_STOCK_THRESHOLD = 10

    def __init__(self, db: Session):
        self.repository = InventoryRepository(db)
        self.product_repository = ProductRepository(db)
        self.customer_repository = CustomerRepository(db)
        self.order_repository = OrderRepository(db)

    def get_inventory(self, params: PaginationParams) -> PaginatedResponse[InventoryItemResponse]:
        result = self.repository.list_inventory(params)
        return PaginatedResponse[InventoryItemResponse](
            items=[InventoryItemResponse.model_validate(item) for item in result.items],
            total=result.total,
            page=result.page,
            page_size=result.page_size,
            total_pages=result.total_pages,
        )

    def get_summary(self) -> InventorySummaryResponse:
        summary = self.repository.get_summary(self.LOW_STOCK_THRESHOLD)
        params = PaginationParams(page=1, page_size=100, sort_by="stock_quantity", sort_order="asc")
        items_result = self.repository.list_inventory(params)
        return InventorySummaryResponse(
            total_products=summary["total_products"],
            total_stock=summary["total_stock"],
            low_stock_count=summary["low_stock_count"],
            items=[InventoryItemResponse.model_validate(item) for item in items_result.items],
        )

    def get_dashboard_stats(self) -> dict:
        return {
            "total_products": self.product_repository.count_all(),
            "total_customers": self.customer_repository.count_all(),
            "total_orders": self.order_repository.count_all(),
            "low_stock_products": self.product_repository.count_low_stock(self.LOW_STOCK_THRESHOLD),
        }
