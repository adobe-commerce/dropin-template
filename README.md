![Drop-in_Template (1)](https://github.com/user-attachments/assets/dfb8c575-0a1e-4f2a-9380-f915a8ec83f5)

This repository provides a template for creating custom drop-ins. Drop-ins allow you to extend and customize your storefront with reusable components and APIs. Follow the steps below to set up your development environment and start building your own drop-ins.

Not sure what a dropin is? Get an overview of dropins [here](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/introduction/).

## Prerequisites

>- Go through the instructions on [Creating drop-in components](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/creating/) from this template.
>- Supported Node versions are: Maintenance (v20) and Active (v22).

> Need to download/update your node version? You can use [nvm](https://github.com/nvm-sh/nvm).
---

## Quickstart
```bash
npm install
npx elsie generate config --name <DropInName>
cp .env.sample .env   # then set ENDPOINT in .env
npm run dev
```

## Common scripts
```bash
npm run dev        # Dev environment (HTML sandbox host)
npm run storybook  # Storybook at http://localhost:6006
npm run serve      # Sandbox at http://127.0.0.1:3000
npm run test       # Run unit tests
npm run build      # Production build (dist/)
```


## Quick links
- Creating drop-in components: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/creating/
- Introduction to dropins: https://experienceleague.adobe.com/developer/commerce/storefront/dropins/all/introduction/
- SDK reference: https://experienceleague.adobe.com/developer/commerce/storefront/sdk/reference/
