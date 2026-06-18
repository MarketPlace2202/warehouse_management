from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order
from app.repositories.base import BaseRepository, PageResult
from app.schemas.common import PaginationParams


class OrderRepository(BaseRepository[Order]):
    SORT_COLUMNS = {"id", "customer_id", "total_amount", "status", "created_at"}

    def __init__(self, db: Session):
        super().__init__(db, Order)

    def get_with_items(self, order_id: int) -> Order | None:
        stmt = (
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        return self.db.scalar(stmt)

    def list_orders(self, params: PaginationParams) -> PageResult[Order]:
        stmt = select(Order).options(selectinload(Order.items))
        return self.paginate(
            stmt,
            params,
            default_sort_column="created_at",
            allowed_sort_columns=self.SORT_COLUMNS,
        )

    def count_all(self) -> int:
        stmt = select(Order)
        return len(list(self.db.scalars(stmt).all()))
