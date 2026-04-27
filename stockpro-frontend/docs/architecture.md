# StockPro Frontend Architecture

The StockPro Frontend is built using React and Vite, communicating with a Spring Boot Microservices backend via an API Gateway.

## Component Architecture

```mermaid
graph TD
    UI[Frontend Application] --> API_Gateway(API Gateway - Port 8080)
    API_Gateway --> Auth[Auth Service]
    API_Gateway --> Warehouse[Warehouse Service]
    API_Gateway --> Purchase[Purchase Service]
    API_Gateway --> Report[Report Service]
    API_Gateway --> Product[Product Service]
    API_Gateway --> Movement[Movement Service]
    API_Gateway --> Supplier[Supplier Service]
```

## Technologies
- React (Components, Hooks)
- Vite (Build Tool)
- React Router (Routing)
- Axios (API Calls)
- Bootstrap (Styling)
- Vitest (Testing)
- React Focus Lock (Accessibility)

## Structure
- `src/components/`: Reusable UI components
- `src/pages/`: Route-level page components
- `src/services/`: API integration services
- `src/layouts/`: Common layouts (Sidebar, Header)
- `src/__tests__/`: Unit and integration tests
