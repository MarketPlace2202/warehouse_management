from fastapi import APIRouter, Depends, Query

from app.api.deps import get_inventory_service
from app.schemas.common import PaginatedResponse, PaginationParams
from app.schemas.inventory import InventoryItemResponse, InventorySummaryResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=PaginatedResponse[InventoryItemResponse])
def get_inventory(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None, max_length=255),
    sort_by: str | None = Query(None, max_length=50),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    service: InventoryService = Depends(get_inventory_service),
) -> PaginatedResponse[InventoryItemResponse]:
    params = PaginationParams(
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return service.get_inventory(params)


@router.get("/summary", response_model=InventorySummaryResponse)
def get_inventory_summary(
    service: InventoryService = Depends(get_inventory_service),
) -> InventorySummaryResponse:
    return service.get_summary()


@router.get("/dashboard-stats")
def get_dashboard_stats(
    service: InventoryService = Depends(get_inventory_service),
) -> dict:
    return service.get_dashboard_stats()
