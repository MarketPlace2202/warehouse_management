from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.repositories.base import BaseRepository, PageResult
from app.schemas.common import PaginationParams


class CustomerRepository(BaseRepository[Customer]):
    SORT_COLUMNS = {"id", "name", "email", "created_at"}

    def __init__(self, db: Session):
        super().__init__(db, Customer)

    def get_by_email(self, email: str) -> Customer | None:
        stmt = select(Customer).where(Customer.email == email)
        return self.db.scalar(stmt)

    def list_customers(self, params: PaginationParams) -> PageResult[Customer]:
        stmt = select(Customer)
        stmt = self.apply_search(stmt, params.search, Customer.name, Customer.email, Customer.phone)
        return self.paginate(
            stmt,
            params,
            default_sort_column="created_at",
            allowed_sort_columns=self.SORT_COLUMNS,
        )

    def count_all(self) -> int:
        stmt = select(Customer)
        return len(list(self.db.scalars(stmt).all()))
