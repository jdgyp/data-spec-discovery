# API & Data Service Discovery — UK Supermarket Tech

A natural language search tool for discovering OpenAPI (REST) and AsyncAPI (Kafka) specs across UK Supermarket data services. Built for engineers and product teams who need to find the right API or Kafka topic without knowing exactly where to look.

**[Open the tool](https://jdgyp.github.io/sainsburys-spec-discovery)**

## What it does

Type a question in plain English — the tool scores all loaded specs for relevance and returns ranked results. Click a result to view the full, unmodified spec rendered in Swagger UI (OpenAPI) or a structured AsyncAPI viewer.

**Example queries:**
- `where can I find the price of apples?`
- `real-time stock level changes`
- `Loyalty points balance for a customer`
- `order delivery status updates`
- `nutritional information and allergens`

## Specs included (representative examples)

| Type | Spec | Description |
|------|------|-------------|
| OpenAPI | Pricing API v2.1 | Retail, Loyalty, and promotional pricing by SKU |
| OpenAPI | Product Catalogue API v3.0 | Product master data, nutrition, allergens, images |
| OpenAPI | Inventory & Availability API v1.4 | Store and warehouse stock levels |
| OpenAPI | Order Management API v4.0 | Order lifecycle, fulfilment, substitutions |
| OpenAPI | Customer & Loyalty API v2.0 | Customer profiles and Loyalty points |
| AsyncAPI | price.updated v1.3 | Real-time Kafka topic for price change events |
| AsyncAPI | stock.changed v2.0 | Stock level change events from EPOS and WMS |
| AsyncAPI | order.lifecycle v3.1 | Order status transition events |
| AsyncAPI | loyalty.points.transaction v1.1 | Loyalty points earn and redemption events |
| AsyncAPI | product.catalogue.updated v2.0 | Product master data change events |

## Adding real specs

Replace or extend the `specs.js` file. Each entry follows this structure:

```js
{
  id: 'my-api',           // unique identifier
  type: 'openapi',        // 'openapi' or 'asyncapi'
  data: { /* full spec object */ }
}
```

The search engine automatically indexes titles, descriptions, paths/channels, tags, and schema field names — no additional configuration needed.

## How it works

- **Search:** Keyword scoring across weighted fields (title, tags, paths, descriptions, schema fields). No external API or backend required.
- **OpenAPI rendering:** [Swagger UI](https://swagger.io/tools/swagger-ui/) loaded from CDN — spec displayed unchanged.
- **AsyncAPI rendering:** Custom viewer showing channels, message schemas, and Kafka binding configuration.

## Built with

Two static files — `index.html` and `specs.js`. No build step, no backend, no dependencies to install. Built with [Claude Code](https://claude.ai/code).
