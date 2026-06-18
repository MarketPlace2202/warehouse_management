from dataclasses import dataclass
from typing import Generic, TypeVar

from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.schemas.common import PaginationParams

ModelT = TypeVar("ModelT")


@dataclass
class PageResult(Generic[ModelT]):
    items: list[ModelT]
    total: int
    page: int
    page_size: int
    total_pages: int


class BaseRepository(Generic[ModelT]):
    def __init__(self, db: Session, model: type[ModelT]):
        self.db = db
        self.model = model

    def get_by_id(self, entity_id: int) -> ModelT | None:
        return self.db.get(self.model, entity_id)

    def create(self, entity: ModelT) -> ModelT:
        self.db.add(entity)
        self.db.flush()
        self.db.refresh(entity)
        return entity

    def delete(self, entity: ModelT) -> None:
        self.db.delete(entity)
        self.db.flush()

    def paginate(
        self,
        stmt: Select,
        params: PaginationParams,
        *,
        default_sort_column: str = "id",
        allowed_sort_columns: set[str] | None = None,
    ) -> PageResult[ModelT]:
        allowed = allowed_sort_columns or {default_sort_column}
        sort_column = params.sort_by if params.sort_by in allowed else default_sort_column
        sort_order = params.sort_order.lower()

        column = getattr(self.model, sort_column, None)
        if column is not None:
            stmt = stmt.order_by(desc(column) if sort_order == "desc" else asc(column))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        offset = (params.page - 1) * params.page_size
        items = list(
            self.db.scalars(stmt.offset(offset).limit(params.page_size)).all()
        )

        total_pages = (total + params.page_size - 1) // params.page_size if total else 0
        return PageResult(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages,
        )

    @staticmethod
    def apply_search(stmt: Select, search: str | None, *columns) -> Select:
        if not search:
            return stmt
        pattern = f"%{search}%"
        conditions = [col.ilike(pattern) for col in columns]
        return stmt.where(or_(*conditions))
