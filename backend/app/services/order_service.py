from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import InsufficientStockException, NotFoundException, ValidationException
from app.models.order import Order, OrderItem, OrderStatus
from app.repositories.customer_repository import CustomerRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.common import PaginatedResponse, PaginationParams
from app.schemas.order import OrderCreate, OrderResponse


class OrderService:
    def __init__(self, db: Session):
        self.repository = OrderRepository(db)
        self.product_repository = ProductRepository(db)
        self.customer_repository = CustomerRepository(db)
        self.db = db

    def create_order(self, data: OrderCreate) -> OrderResponse:
        customer = self.customer_repository.get_by_id(data.customer_id)
        if not customer:
            raise NotFoundException("Customer not found")

        if not data.items:
            raise ValidationException("Order must contain at least one item")

        product_ids = [item.product_id for item in data.items]
        if len(product_ids) != len(set(product_ids)):
            raise ValidationException("Duplicate products in order items are not allowed")

        products_map: dict[int, object] = {}
        for item in data.items:
            product = self.product_repository.get_by_id(item.product_id)
            if not product:
                raise NotFoundException(f"Product with id {item.product_id} not found")
            if product.stock_quantity < item.quantity:
                raise InsufficientStockException("Insufficient stock")
            products_map[item.product_id] = product

        try:
            total_amount = Decimal("0.00")
            order_items: list[OrderItem] = []

            for item in data.items:
                product = products_map[item.product_id]
                unit_price = Decimal(str(product.price))
                subtotal = unit_price * item.quantity
                total_amount += subtotal

                order_items.append(
                    OrderItem(
                        product_id=item.product_id,
                        quantity=item.quantity,
                        unit_price=unit_price,
                        subtotal=subtotal,
                    )
                )

            order = Order(
                customer_id=data.customer_id,
                total_amount=total_amount,
                status=OrderStatus.CONFIRMED.value,
                items=order_items,
            )

            created_order = self.repository.create(order)

            for item in data.items:
                product = products_map[item.product_id]
                product.stock_quantity -= item.quantity
                if product.stock_quantity < 0:
                    raise InsufficientStockException("Insufficient stock")

            self.db.commit()
            self.db.refresh(created_order)
            order_with_items = self.repository.get_with_items(created_order.id)
            return OrderResponse.model_validate(order_with_items)

        except Exception:
            self.db.rollback()
            raise

    def list_orders(self, params: PaginationParams) -> PaginatedResponse[OrderResponse]:
        result = self.repository.list_orders(params)
        return PaginatedResponse[OrderResponse](
            items=[OrderResponse.model_validate(item) for item in result.items],
            total=result.total,
            page=result.page,
            page_size=result.page_size,
            total_pages=result.total_pages,
        )

    def get_order(self, order_id: int) -> OrderResponse:
        order = self.repository.get_with_items(order_id)
        if not order:
            raise NotFoundException("Order not found")
        return OrderResponse.model_validate(order)
