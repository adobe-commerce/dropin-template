![Drop-in_Template (1)](https://github.com/user-attachments/assets/dfb8c575-0a1e-4f2a-9380-f915a8ec83f5)


## Prerequisites

>- Complete steps 1-3 in the "How to use the Adobe Commerce drop-in template" section of [Creating drop-in components](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/creating/) before proceeding.
>- Supported Node versions are: Maintenance (v20) and Active (v22).

> Need to download/update your node version? You can use [nvm](https://github.com/nvm-sh/nvm).
---

This repository provides a template for creating custom drop-ins. Drop-ins allow you to extend and customize your storefront with reusable components and APIs. Follow the steps below to set up your development environment and start building your own drop-ins.

Not sure what a dropin is? Get an overview of dropins [here](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/introduction/).



---

## Table of Contents

1. [Getting Started](#getting-started)
   - [Install Dependencies](#1-install-dependencies)
   - [Generate New Config](#2-generate-new-config)
   - [Update Mesh/Backend Endpoint](#3-update-meshbackend-endpoint-for-development-only)
   - [Launch Development Environment](#4-launch-development-environment)
   - [Generate New UI Component](#5-generate-new-ui-component)
   - [Generate New Frontend Container](#6-generate-new-frontend-container)
   - [Generate New API Function](#7-generate-new-api-function)
   

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

Before you can start developing, you need to generate the .elsie.js config file. The Elsie CLI uses this file to generate new components, containers, and API functions to specified directories within your projects.  
To create a new configuration file, run the following command. Replace ```<DropInName>``` with the name of your new drop-in.

```bash
npx elsie generate config --name <DropInName>
```
After generating the .elsie.js config, open it and take a look. Below is an annotated version describing the main properties:

```js
module.exports = {
  name: 'Login', // The name of your frontend. This name can be changed at any time.
  api: {
    root: './src/api', // Directory where the CLI will add all your generated API functions.
    importAliasRoot: '@/login/api',
  },
  components: [
    {
      id: 'Components',
      root: './src/components', // Directory where the CLI will add all your generated components.
      importAliasRoot: '@/login/components',
      cssPrefix: 'elsie',
      default: true,
    },
  ],
  containers: {
    root: './src/containers', // Directory where the CLI will add all your generated containers.
    importAliasRoot: '@/login/containers',
  },
};
```

### 3. Update Mesh/Backend Endpoint (for development only)

For development purposes, you will need to rename your `.env.sample` file to `.env` and update the new `.env` file with the correct mesh/backend endpoint. This file is used to store environment-specific configurations.

```env
ENDPOINT="your-endpoint"
```

### 4. Launch development environment
Let’s take it for a spin! Start the development server with the following command:

```bash
npm run dev
```
Congrats! You just launched your frontend development environment. It's a preconfigured HTML page `(examples > html-host > index.html)` that loads your frontend components for testing during development:

  <img src="https://github.com/user-attachments/assets/e38a7856-625e-4eae-a1b7-0863516231a8" 
       alt="Frontend development environment" />

Now we're ready to start building a composable frontend. Stop the server with `ctrl + c` and let's get started.

### 5. Generate new UI Component
UI components in this codebase are primarily responsible for rendering the UI, handling presentation, and managing styling.
To generate a new UI component, use the following command. Replace ```<MyUIComponent>``` with the name of your component. 

**Make sure to use Pascal casing for the component name.**
```bash
npx elsie generate component --pathname <MyUIComponent>
```

Let’s take a quick look at the files that are generated for you:

```console
~/composable-login [main] » npx elsie generate component --pathname LoginForm
🆕 src/components/LoginForm/LoginForm.css created
🆕 src/components/LoginForm/LoginForm.stories.tsx created
🆕 src/components/LoginForm/LoginForm.test.tsx created
🆕 src/components/LoginForm/LoginForm.tsx created
🆕 src/components/LoginForm/index.ts created
🆕 src/components/index.ts created
~/composable-login [main] »
```

These files were not only generated with the appropriate names, but they are completely preconfigured to work together as a unit. For example, the `LoginForm` component was automatically imported into `src/components/index.ts` to let you start referencing the component throughout your project.

And if you run `npm run dev` again, you'll see your new component in the Storybook UI, configured with an example and best practices to help you get started with Storybook.

### 6. Generate new Frontend Container

Containers handle business logic, state management, API calls, and data fetching using the components. They do not contain CSS or styling logic.
To create a new frontend container, use this command. Replace ```<MyContainer>``` with the desired name of your frontend container. 

**Make sure to use Pascal casing for the container name.**

```bash
npx elsie generate container --pathname <MyContainer>
```

### 7. Generate new API Function
If you need to add a new API function, run the following command. Replace ```<myApiFunction>``` with the desired name for your API function. 

The API layer provides core functionalities like fetching, handling events, and GraphQL operations. This API is primarily consumed by a container.

**Make sure to use Camel casing for the API name.**

```bash
npx elsie generate api --pathname <myApiFunction>
```
> **Location:**  
> Generated files will be placed in `src/components/`, `src/containers/`, and `src/api/` respectively

---

## Development and Testing
These development tools help you preview components during your development process and ensure that your code is properly tested.

### I. Storybook
Storybook is a tool used for developing and testing UI components in isolation. Once a container/component is created using one of the commands above, a `.stories.tsx` file is also created in the same directory as the component/container to preview the component/container.

Use ```npm run storybook``` to spin up the Storybook environment at `http://localhost:6006/`.

[Here](https://storybook.js.org/docs) is the official Storybook documentation.

### II. Sandbox
The Sandbox is an html file with minimal application setup to deploy your dropin. It is useful for testing and integration between different peices of your project.

To render your container in the sandbox, Update the `examples/html-host/index.html` file.
Use ```npm run serve``` to spin up the Sandbox environment at `http://127.0.0.1:3000`.

Need help figuring out how to work with the Sandbox? [Here](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/creating/) is a detailed explanation.

### III. Run Unit Tests
The commands to generate a component, container or an API, also create a `.test.tsx` file in their respective directories. These files are useful for unit testing.

To ensure your code is working as expected, you should run these unit tests to catch any issues early in the development process:

```bash
npm run test
````

This project is set up to use the jest testing framework. Here are some useful documentations:

- [Jest Getting Started (official docs)](https://jestjs.io/docs/getting-started)
- [Preact Testing Library Intro](https://testing-library.com/docs/preact-testing-library/intro)

### IV. Build Production Bundles
Once you're ready to prepare your app for production, run the following command to build the production bundles:

```bash
npm run build
```
