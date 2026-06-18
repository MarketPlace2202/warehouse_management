from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, NotFoundException
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.schemas.common import PaginatedResponse, PaginationParams
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.repository = ProductRepository(db)
        self.db = db

    def create_product(self, data: ProductCreate) -> ProductResponse:
        if self.repository.get_by_sku(data.sku):
            raise ConflictException("Product SKU must be unique")

        product = Product(**data.model_dump())
        created = self.repository.create(product)
        self.db.commit()
        return ProductResponse.model_validate(created)

    def list_products(self, params: PaginationParams) -> PaginatedResponse[ProductResponse]:
        result = self.repository.list_products(params)
        return PaginatedResponse[ProductResponse](
            items=[ProductResponse.model_validate(item) for item in result.items],
            total=result.total,
            page=result.page,
            page_size=result.page_size,
            total_pages=result.total_pages,
        )

    def get_product(self, product_id: int) -> ProductResponse:
        product = self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        return ProductResponse.model_validate(product)

    def update_product(self, product_id: int, data: ProductUpdate) -> ProductResponse:
        product = self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")

        update_data = data.model_dump(exclude_unset=True)
        if "sku" in update_data and update_data["sku"] != product.sku:
            existing = self.repository.get_by_sku(update_data["sku"])
            if existing:
                raise ConflictException("Product SKU must be unique")

        for field, value in update_data.items():
            setattr(product, field, value)

        self.db.commit()
        self.db.refresh(product)
        return ProductResponse.model_validate(product)

    def delete_product(self, product_id: int) -> None:
        product = self.repository.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")
        self.repository.delete(product)
        self.db.commit()
