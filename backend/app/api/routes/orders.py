from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_order_service
from app.schemas.common import PaginatedResponse, PaginationParams
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: OrderCreate,
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    return service.create_order(data)


@router.get("", response_model=PaginatedResponse[OrderResponse])
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None, max_length=255),
    sort_by: str | None = Query(None, max_length=50),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    service: OrderService = Depends(get_order_service),
) -> PaginatedResponse[OrderResponse]:
    params = PaginationParams(
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return service.list_orders(params)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    service: OrderService = Depends(get_order_service),
) -> OrderResponse:
    return service.get_order(order_id)
