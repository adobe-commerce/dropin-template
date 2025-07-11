![Drop-in_Template (1)](https://github.com/user-attachments/assets/b2d8a1b7-37fd-436c-bf2d-2a49b9127470)


> 🔰**Note:** Supported Node versions are: Maintenance (v20) and Active (v22).

This repository provides a template for creating custom drop-ins. Drop-ins allow you to extend and customize your storefront with reusable components and APIs. Follow the steps below to set up your development environment and start building your own drop-ins.

Not sure what a dropin is? Get an overview of dropins [here](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/introduction/).

Need to download/update your node version? You can use [nvm](https://github.com/nvm-sh/nvm).

---

## Table of Contents

1. [Getting Started](#getting-started)
   - [Install Dependencies](#1-install-dependencies)
   - [Generate New Config](#2-generate-new-config)
   - [Update Mesh Endpoint](#3-update-mesh/backend-endpoint-for-development-only)
   - [Generate New UI Component](#4-generate-new-ui-component)
   - [Generate New API Function](#5-generate-new-api-function)
   - [Generate New Frontend Container](#6-generate-new-frontend-container)
   - [Launch Development Environment](#7-launch-development-environment)
2. [Development and Testing](#development-and-testing)
   - [Storybook](#i-storybook)
   - [Sandbox](#ii-sandbox)
   - [Run Unit Tests](#iii-run-unit-tests)
   - [Build Production Bundles](#iv-build-production-bundles)

---

## Getting Started

### Follow these steps to set up and run your development environment for this project.


### 1. Install Dependencies

Before you begin, make sure you have all the necessary dependencies installed. Run the following command to install all required packages:

```bash
npm install
```

### 2. Generate New Config
To create a new configuration file, run the following command. Replace ```<DropInName>``` with the name of your new drop-in.

```bash
npx elsie generate config --name <DropInName>
```

### 3. Update Mesh/Backend Endpoint (for development only)
For development purposes, you will need to update the .env.local file with the correct mesh/backend endpoint. This file is used to store environment-specific configurations.

```bash
.env.local
```

### 4. Generate new UI Component
UI components in this codebase are primarily responsible for rendering the UI, handling presentation, and managing styling.
To generate a new UI component, use the following command. Replace ```<MyUIComponent>``` with the name of your component. 

**Make sure to use Pascal casing for the component name.**
```bash
npx elsie generate component --pathname <MyUIComponent>
```

### 5. Generate new Frontend Container

Containers, on the other hand, handle business logic, state management, API calls, and data fetching using the components, but notably contain no CSS or styling logic..
To create a new frontend container, use this command. Replace ```<MyContainer>``` with the desired name of your frontend container. 

**Make sure to use Pascal casing for the container name.**

```bash
npx elsie generate container --pathname <MyContainer>
```

### 6. Generate new API Function
If you need to add a new API function, run the following command. Replace ```<myApiFunction>``` with the desired name for your API function. 

The API layer provides core functionalities like fetching, handling events, and GraphQL operations. This API is primarily consumed by a container.

**Make sure to use Camel casing for the API name.**

```bash
npx elsie generate api --pathname <myApiFunction>
```
> **Location:**  
> Generated files will be placed in `src/components/`, `src/containers/`, and `src/api/` respectively

### 7. Launch development environment
Once the dependencies are installed and configurations are set up, start the development server with the following command:

```bash
npm run dev
```
This will launch your app and automatically open it in your browser. You can now start developing and testing your drop-in.

---

## Development and Testing
These steps help ensure that your development process is smooth and your code is properly tested.

### I. Storybook
The Storybook is a tool used for developing and testing UI components in isolation. Once a container/component is created using one of the commands above, a `.stories.tsx` file will also be created in the same directory as the component/container which can be editted to preview the component/container.

Use ```yarn run storybook``` to spin up the Storybook environment at `http://localhost:6006/`.

### II. Sandbox
The Sandbox is a broader concept for a safe, isolated environment where you can experiment with code, configurations, or features without impacting the actual production environment. As a result, containers can typically be previewed in the sandbox.

To render your container in the sandbox, Update the `examples/html-host/index.html` file.
Use ```yarn run serve``` to spin up the Sandbox environment at `http://127.0.0.1:3000`.

Need help figuring out how to render your containers in `examples/html-host/index.html`? [Here](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/creating/) is a detailed explanation.

### III. Run Unit Tests
To ensure your code is working as expected, you should run the unit tests. This will help catch any issues early in the development process:

```bash
npm run test
````

### IV. Build Production Bundles
Once you're ready to prepare your app for production, run the following command to build the production bundles:

```bash
npm run build
```