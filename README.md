# My Domain Package

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate new config

```bash
npx elsie generate config --name <Domain>
```

### 3. Update Mesh Endpoint (for development only)

```bash
.env.local
```

### 4. Launch development environment

```bash
npm run dev
```

- Storybook: http://localhost:6006/
- ESM Bundles: http://localhost:3002/

### 5. Generate new API Function

```bash
npx elsie generate api --name <myApiFunction>
```

### 6. Generate new UI Component

```bash
npx elsie generate component --name <myUIComponent>
```

### 7. Generate new UI Frontend Container

```bash
npx elsie generate container --name <MyContainer>
```

### 8. Run unit tests

```bash
npm run test
```

### 9. Build production bundles

```bash
npm run build
```
