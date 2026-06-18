from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_customer_service
from app.schemas.common import MessageResponse, PaginatedResponse, PaginationParams
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    data: CustomerCreate,
    service: CustomerService = Depends(get_customer_service),
) -> CustomerResponse:
    return service.create_customer(data)


@router.get("", response_model=PaginatedResponse[CustomerResponse])
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None, max_length=255),
    sort_by: str | None = Query(None, max_length=50),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    service: CustomerService = Depends(get_customer_service),
) -> PaginatedResponse[CustomerResponse]:
    params = PaginationParams(
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return service.list_customers(params)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    service: CustomerService = Depends(get_customer_service),
) -> CustomerResponse:
    return service.get_customer(customer_id)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    service: CustomerService = Depends(get_customer_service),
) -> CustomerResponse:
    return service.update_customer(customer_id, data)


@router.delete("/{customer_id}", response_model=MessageResponse)
def delete_customer(
    customer_id: int,
    service: CustomerService = Depends(get_customer_service),
) -> MessageResponse:
    service.delete_customer(customer_id)
    return MessageResponse(message="Customer deleted successfully")
