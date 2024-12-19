# Shopify Vue Theme


This package helps you to use Vuejs, Scss in development and build into javascript, css files to integrate into Shopify theme.

## Benefit

- The limitation of Shopify theme structure source code is that it is difficult to manage when your project grows larger because you cannot customize the folder hierarchy according to each category or function that you want to group. With SVueTheme you can do that comfortably, as you only need to care about the javascript or css files that SVueTheme exports for use in your Shopify theme.

- With VanilaJs, you have to set up and define everything from scratch, while using SVueTheme you develop entirely on Vuejs, so it's easy to reuse the features provided by Vue, as well as use external services and plugins easily by integrating into Vue.

- With CSS, we also allow publishing from SCSS separately from Javascript. It's convenient when you can use all the features that SCSS brings.

## Get started
### Installation

|npm|yarn|
|:---:|:---:|
|`npm i -D svuet`|`yarn add -D svuet`|

### Setup

1. Create `svuet.config.js` file and export the following required object:

| Fields | Example | Default |
|:---|:---|:---:|
| `store`: Your store name, this field is required if you want to run the `shopify theme dev` command | `vue-stheme`, `vue-stheme.myshopify.com` | - |

2. Add command to `package.json` file:

- Use the command `npm init -y` to create a `package.json` file if your project doesn't have one yet.
- Add the script as follows:
```json
{
  // your other configuration
  "scripts": {
    "dev": "svuet dev",
    "build": "svuet build"
    // your other scripts
  }
  // your other configuration
}
```

TODO: update new document later
