from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, NotFoundException
from app.models.customer import Customer
from app.repositories.customer_repository import CustomerRepository
from app.schemas.common import PaginatedResponse, PaginationParams
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate


class CustomerService:
    def __init__(self, db: Session):
        self.repository = CustomerRepository(db)
        self.db = db

    def create_customer(self, data: CustomerCreate) -> CustomerResponse:
        if self.repository.get_by_email(str(data.email)):
            raise ConflictException("Customer email must be unique")

        customer = Customer(**data.model_dump())
        created = self.repository.create(customer)
        self.db.commit()
        return CustomerResponse.model_validate(created)

    def list_customers(self, params: PaginationParams) -> PaginatedResponse[CustomerResponse]:
        result = self.repository.list_customers(params)
        return PaginatedResponse[CustomerResponse](
            items=[CustomerResponse.model_validate(item) for item in result.items],
            total=result.total,
            page=result.page,
            page_size=result.page_size,
            total_pages=result.total_pages,
        )

    def get_customer(self, customer_id: int) -> CustomerResponse:
        customer = self.repository.get_by_id(customer_id)
        if not customer:
            raise NotFoundException("Customer not found")
        return CustomerResponse.model_validate(customer)

    def update_customer(self, customer_id: int, data: CustomerUpdate) -> CustomerResponse:
        customer = self.repository.get_by_id(customer_id)
        if not customer:
            raise NotFoundException("Customer not found")

        update_data = data.model_dump(exclude_unset=True)
        if "email" in update_data and update_data["email"] != customer.email:
            existing = self.repository.get_by_email(str(update_data["email"]))
            if existing:
                raise ConflictException("Customer email must be unique")

        for field, value in update_data.items():
            setattr(customer, field, value)

        self.db.commit()
        self.db.refresh(customer)
        return CustomerResponse.model_validate(customer)

    def delete_customer(self, customer_id: int) -> None:
        customer = self.repository.get_by_id(customer_id)
        if not customer:
            raise NotFoundException("Customer not found")
        self.repository.delete(customer)
        self.db.commit()
