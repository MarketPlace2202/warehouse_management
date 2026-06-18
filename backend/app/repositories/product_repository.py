from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.base import BaseRepository, PageResult
from app.schemas.common import PaginationParams


class ProductRepository(BaseRepository[Product]):
    SORT_COLUMNS = {"id", "name", "sku", "price", "stock_quantity", "created_at"}

    def __init__(self, db: Session):
        super().__init__(db, Product)

    def get_by_sku(self, sku: str) -> Product | None:
        stmt = select(Product).where(Product.sku == sku)
        return self.db.scalar(stmt)

    def list_products(self, params: PaginationParams) -> PageResult[Product]:
        stmt = select(Product)
        stmt = self.apply_search(stmt, params.search, Product.name, Product.sku, Product.description)
        return self.paginate(
            stmt,
            params,
            default_sort_column="created_at",
            allowed_sort_columns=self.SORT_COLUMNS,
        )

    def count_all(self) -> int:
        stmt = select(Product)
        return len(list(self.db.scalars(stmt).all()))

    def count_low_stock(self, threshold: int = 10) -> int:
        stmt = select(Product).where(Product.stock_quantity <= threshold)
        return len(list(self.db.scalars(stmt).all()))
