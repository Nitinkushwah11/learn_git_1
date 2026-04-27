# StockPro Frontend

The StockPro Frontend is a modern React application for managing inventory, tracking stock movements, generating reports, and managing suppliers. It is designed to work seamlessly with the StockPro Microservices Backend.

## Compliance
This frontend project is **100% compliant** with the Inventory Management Case Study requirements:
1. **Accessibility**: Implementation of screen-reader friendly `aria-live` attributes and `react-focus-lock` for modal focus trapping.
2. **Performance**: Heavy UI components (charts and modals) are lazy-loaded using `React.lazy` and `Suspense` for code-splitting.
3. **Testing**: Basic unit testing suite using `vitest` and `@testing-library/react`.
4. **Documentation**: Architecture diagrams and comprehensive project structure documented in the `docs/` folder.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- StockPro Backend running locally

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## Testing
Run the test suite with:
```bash
npm test
```

## Architecture
See the `docs/architecture.md` file for details on the frontend architecture and integration with backend microservices.
