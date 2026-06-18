from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_product_service
from app.schemas.common import MessageResponse, PaginatedResponse, PaginationParams
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    service: ProductService = Depends(get_product_service),
) -> ProductResponse:
    return service.create_product(data)


@router.get("", response_model=PaginatedResponse[ProductResponse])
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None, max_length=255),
    sort_by: str | None = Query(None, max_length=50),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    service: ProductService = Depends(get_product_service),
) -> PaginatedResponse[ProductResponse]:
    params = PaginationParams(
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return service.list_products(params)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    service: ProductService = Depends(get_product_service),
) -> ProductResponse:
    return service.get_product(product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    service: ProductService = Depends(get_product_service),
) -> ProductResponse:
    return service.update_product(product_id, data)


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: int,
    service: ProductService = Depends(get_product_service),
) -> MessageResponse:
    service.delete_product(product_id)
    return MessageResponse(message="Product deleted successfully")
