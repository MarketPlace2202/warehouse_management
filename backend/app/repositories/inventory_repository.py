from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.base import BaseRepository, PageResult
from app.schemas.common import PaginationParams


class InventoryRepository(BaseRepository[Product]):
    SORT_COLUMNS = {"id", "name", "sku", "stock_quantity", "price", "updated_at"}

    def __init__(self, db: Session):
        super().__init__(db, Product)

    def list_inventory(self, params: PaginationParams) -> PageResult[Product]:
        stmt = select(Product)
        stmt = self.apply_search(stmt, params.search, Product.name, Product.sku)
        return self.paginate(
            stmt,
            params,
            default_sort_column="stock_quantity",
            allowed_sort_columns=self.SORT_COLUMNS,
        )

    def get_summary(self, low_stock_threshold: int = 10) -> dict:
        total_products = self.db.scalar(select(func.count()).select_from(Product)) or 0
        total_stock = self.db.scalar(select(func.coalesce(func.sum(Product.stock_quantity), 0))) or 0
        low_stock_count = (
            self.db.scalar(
                select(func.count()).select_from(Product).where(
                    Product.stock_quantity <= low_stock_threshold
                )
            )
            or 0
        )
        return {
            "total_products": total_products,
            "total_stock": int(total_stock),
            "low_stock_count": low_stock_count,
        }
