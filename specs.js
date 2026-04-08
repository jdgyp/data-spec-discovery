const SPECS = [

  // ─── OpenAPI Specs ────────────────────────────────────────────────────────

  {
    id: 'pricing-api',
    type: 'openapi',
    data: {
      openapi: '3.0.3',
      info: {
        title: 'Pricing API',
        version: '2.1.0',
        description: 'Retrieve and manage retail pricing for all UK Supermarket products including fresh produce, grocery, and general merchandise. Supports regular price, promotional price, and Loyalty card price lookups.',
        contact: { name: 'Pricing Platform Team', email: 'pricing-platform@supermarket.co.uk' },
      },
      tags: [
        { name: 'Prices', description: 'Current and historical price lookups' },
        { name: 'Promotions', description: 'Active promotional and discount pricing' },
        { name: 'Loyalty', description: 'Loyalty card loyalty pricing' },
      ],
      paths: {
        '/prices/{sku}': {
          get: {
            tags: ['Prices'],
            summary: 'Get current price for a product by SKU',
            description: 'Returns the current retail price, Loyalty card price, and any active promotional price for a given product SKU.',
            parameters: [
              { name: 'sku', in: 'path', required: true, schema: { type: 'string' }, description: 'Product SKU (e.g. 7910635)' },
              { name: 'storeId', in: 'query', schema: { type: 'string' }, description: 'Optional store ID for store-specific pricing' },
            ],
            responses: {
              200: {
                description: 'Current price data for the product',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/PriceResponse' },
                    example: {
                      sku: '7910635',
                      productName: 'Braeburn Apples 6 Pack',
                      currency: 'GBP',
                      retailPrice: 1.50,
                      loyaltyPrice: 1.20,
                      promotionalPrice: null,
                      pricePerUnit: '25p each',
                      effectiveFrom: '2024-01-15T00:00:00Z',
                    }
                  }
                }
              },
              404: { description: 'Product SKU not found' },
            }
          }
        },
        '/prices/search': {
          get: {
            tags: ['Prices'],
            summary: 'Search prices by product name, category or barcode',
            description: 'Search for pricing information using product name (e.g. "apples", "chicken breast"), category, or barcode. Returns a list of matching products with their current prices.',
            parameters: [
              { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search term — product name, category, or barcode' },
              { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category (e.g. "fruit", "dairy", "bakery")' },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            ],
            responses: {
              200: {
                description: 'List of matching products with pricing',
                content: {
                  'application/json': {
                    schema: { type: 'array', items: { $ref: '#/components/schemas/PriceResponse' } }
                  }
                }
              }
            }
          }
        },
        '/prices/{sku}/history': {
          get: {
            tags: ['Prices'],
            summary: 'Get price history for a product',
            description: 'Returns historical retail and promotional price changes for a product over a given date range.',
            parameters: [
              { name: 'sku', in: 'path', required: true, schema: { type: 'string' } },
              { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
              { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
            ],
            responses: {
              200: { description: 'Price history records', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PriceHistory' } } } } }
            }
          }
        },
        '/prices/bulk': {
          post: {
            tags: ['Prices'],
            summary: 'Bulk price lookup for multiple SKUs',
            description: 'Retrieve current prices for up to 500 SKUs in a single request. Useful for basket pricing and category page rendering.',
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { skus: { type: 'array', items: { type: 'string' }, maxItems: 500 }, storeId: { type: 'string' } } }
                }
              }
            },
            responses: { 200: { description: 'Map of SKU to price data' } }
          }
        },
        '/promotions': {
          get: {
            tags: ['Promotions'],
            summary: 'List active promotions and discounts',
            description: 'Returns all currently active promotions including meal deals, multi-buy offers, percentage discounts, and Loyalty double-up events.',
            parameters: [
              { name: 'category', in: 'query', schema: { type: 'string' } },
              { name: 'type', in: 'query', schema: { type: 'string', enum: ['MULTI_BUY', 'PERCENTAGE_OFF', 'NECTAR_DOUBLE', 'MEAL_DEAL', 'BOGOF'] } },
            ],
            responses: { 200: { description: 'Active promotions list', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Promotion' } } } } } }
          }
        },
      },
      components: {
        schemas: {
          PriceResponse: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              productName: { type: 'string' },
              currency: { type: 'string', example: 'GBP' },
              retailPrice: { type: 'number', format: 'float' },
              loyaltyPrice: { type: 'number', format: 'float', nullable: true },
              promotionalPrice: { type: 'number', format: 'float', nullable: true },
              pricePerUnit: { type: 'string' },
              effectiveFrom: { type: 'string', format: 'date-time' },
            }
          },
          PriceHistory: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              retailPrice: { type: 'number' },
              priceType: { type: 'string', enum: ['RETAIL', 'NECTAR', 'PROMOTIONAL'] },
              effectiveFrom: { type: 'string', format: 'date-time' },
              effectiveTo: { type: 'string', format: 'date-time', nullable: true },
            }
          },
          Promotion: {
            type: 'object',
            properties: {
              promotionId: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              discountValue: { type: 'number' },
              eligibleSkus: { type: 'array', items: { type: 'string' } },
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' },
            }
          }
        }
      }
    }
  },

  {
    id: 'product-catalogue-api',
    type: 'openapi',
    data: {
      openapi: '3.0.3',
      info: {
        title: 'Product Catalogue API',
        version: '3.0.0',
        description: 'Master product data service for UK Supermarket. Provides product descriptions, images, nutritional information, allergens, ingredients, and category hierarchy for all SKUs across grocery, fresh food, and general merchandise.',
        contact: { name: 'Product Data Team', email: 'product-data@supermarket.co.uk' },
      },
      tags: [
        { name: 'Products', description: 'Product master data' },
        { name: 'Nutrition', description: 'Nutritional and allergen information' },
        { name: 'Categories', description: 'Category and taxonomy management' },
      ],
      paths: {
        '/products/{sku}': {
          get: {
            tags: ['Products'],
            summary: 'Get full product details by SKU',
            description: 'Returns complete product master data including name, description, brand, weight, dimensions, images, and taxonomy.',
            parameters: [{ name: 'sku', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Product details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } } }
          }
        },
        '/products/search': {
          get: {
            tags: ['Products'],
            summary: 'Search products by name, brand, or barcode',
            description: 'Full-text product search across name, brand, description, and barcode fields. Supports filtering by category, dietary requirements (vegan, gluten-free), and availability.',
            parameters: [
              { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search term (e.g. "apples", "free range eggs", "5000436421725")' },
              { name: 'category', in: 'query', schema: { type: 'string' } },
              { name: 'dietary', in: 'query', schema: { type: 'string', enum: ['VEGAN', 'VEGETARIAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'HALAL'] } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            ],
            responses: { 200: { description: 'Matching products', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } }
          }
        },
        '/products/{sku}/nutrition': {
          get: {
            tags: ['Nutrition'],
            summary: 'Get nutritional information and allergens for a product',
            description: 'Returns per-100g and per-serving nutritional values (calories, fat, saturates, carbohydrates, sugars, fibre, protein, salt), allergen declarations, and ingredient list.',
            parameters: [{ name: 'sku', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Nutritional data', content: { 'application/json': { schema: { $ref: '#/components/schemas/NutritionInfo' } } } } }
          }
        },
        '/products/categories': {
          get: {
            tags: ['Categories'],
            summary: 'Get product category hierarchy',
            description: 'Returns the full UK Supermarket category taxonomy tree used for navigation and filtering.',
            responses: { 200: { description: 'Category tree' } }
          }
        },
        '/products/{sku}/images': {
          get: {
            tags: ['Products'],
            summary: 'Get product images and media assets',
            description: 'Returns URLs for product images in various resolutions (thumbnail, standard, zoom), including pack shots and lifestyle imagery.',
            parameters: [{ name: 'sku', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Product image assets' } }
          }
        },
      },
      components: {
        schemas: {
          Product: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              ean: { type: 'string', description: 'European Article Number (barcode)' },
              name: { type: 'string' },
              brand: { type: 'string' },
              description: { type: 'string' },
              categoryId: { type: 'string' },
              categoryPath: { type: 'string', example: 'Fruit & Veg > Fresh Fruit > Apples' },
              weight: { type: 'string' },
              countryOfOrigin: { type: 'string' },
              isAvailable: { type: 'boolean' },
              dietaryFlags: { type: 'array', items: { type: 'string' } },
            }
          },
          NutritionInfo: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              servingSize: { type: 'string' },
              per100g: {
                type: 'object',
                properties: {
                  calories: { type: 'number' },
                  fat: { type: 'number' },
                  saturates: { type: 'number' },
                  carbohydrates: { type: 'number' },
                  sugars: { type: 'number' },
                  fibre: { type: 'number' },
                  protein: { type: 'number' },
                  salt: { type: 'number' },
                }
              },
              allergens: { type: 'array', items: { type: 'string' }, example: ['MILK', 'GLUTEN', 'NUTS'] },
              ingredients: { type: 'string' },
            }
          }
        }
      }
    }
  },

  {
    id: 'inventory-api',
    type: 'openapi',
    data: {
      openapi: '3.0.3',
      info: {
        title: 'Inventory & Availability API',
        version: '1.4.0',
        description: 'Real-time and near-real-time stock levels and product availability across the UK Supermarket estate. Covers store stock, warehouse inventory, fulfilment centre availability, and online availability for grocery home delivery and click-and-collect.',
        contact: { name: 'Supply Chain Engineering', email: 'supply-chain-eng@supermarket.co.uk' },
      },
      tags: [
        { name: 'Inventory', description: 'Stock level queries' },
        { name: 'Availability', description: 'Product availability for online and in-store' },
        { name: 'Stores', description: 'Store-level stock management' },
      ],
      paths: {
        '/inventory/{sku}': {
          get: {
            tags: ['Inventory'],
            summary: 'Get aggregate stock levels for a product across all locations',
            description: 'Returns total and available stock quantities for a product across all stores and warehouses.',
            parameters: [{ name: 'sku', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Stock level summary', content: { 'application/json': { schema: { $ref: '#/components/schemas/StockSummary' } } } } }
          }
        },
        '/inventory/{sku}/stores': {
          get: {
            tags: ['Inventory', 'Stores'],
            summary: 'Get stock levels for a product across all stores',
            description: 'Returns per-store stock quantities for a given SKU. Can be filtered by region or store format (superstore, local, convenience).',
            parameters: [
              { name: 'sku', in: 'path', required: true, schema: { type: 'string' } },
              { name: 'region', in: 'query', schema: { type: 'string' } },
              { name: 'format', in: 'query', schema: { type: 'string', enum: ['SUPERSTORE', 'LOCAL', 'CONVENIENCE', 'ONLINE'] } },
            ],
            responses: { 200: { description: 'Store-level stock data', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/StoreStock' } } } } } }
          }
        },
        '/stores/{storeId}/stock': {
          get: {
            tags: ['Stores'],
            summary: 'Get all stock levels for a specific store',
            description: 'Returns stock quantities for all products held in a specific store, with optional filtering by category or low-stock threshold.',
            parameters: [
              { name: 'storeId', in: 'path', required: true, schema: { type: 'string' } },
              { name: 'category', in: 'query', schema: { type: 'string' } },
              { name: 'lowStockOnly', in: 'query', schema: { type: 'boolean' } },
            ],
            responses: { 200: { description: 'Store stock list' } }
          }
        },
        '/availability/{sku}': {
          get: {
            tags: ['Availability'],
            summary: 'Check online availability for home delivery and click-and-collect',
            description: 'Returns whether a product is available for home delivery or click-and-collect, with expected delivery windows.',
            parameters: [
              { name: 'sku', in: 'path', required: true, schema: { type: 'string' } },
              { name: 'postcode', in: 'query', schema: { type: 'string' } },
            ],
            responses: { 200: { description: 'Availability and delivery windows' } }
          }
        },
      },
      components: {
        schemas: {
          StockSummary: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              totalQuantity: { type: 'integer' },
              availableQuantity: { type: 'integer' },
              reservedQuantity: { type: 'integer' },
              inStoreCount: { type: 'integer', description: 'Number of stores holding this product' },
              lastUpdated: { type: 'string', format: 'date-time' },
            }
          },
          StoreStock: {
            type: 'object',
            properties: {
              storeId: { type: 'string' },
              storeName: { type: 'string' },
              sku: { type: 'string' },
              quantity: { type: 'integer' },
              isAvailable: { type: 'boolean' },
              lastUpdated: { type: 'string', format: 'date-time' },
            }
          }
        }
      }
    }
  },

  {
    id: 'order-management-api',
    type: 'openapi',
    data: {
      openapi: '3.0.3',
      info: {
        title: 'Order Management API',
        version: '4.0.0',
        description: 'Create and manage customer orders for UK Supermarket grocery home delivery and click-and-collect. Covers the full order lifecycle from basket creation through picking, dispatch, and delivery.',
        contact: { name: 'Order Platform Team', email: 'order-platform@supermarket.co.uk' },
      },
      tags: [
        { name: 'Orders', description: 'Order creation and management' },
        { name: 'Fulfilment', description: 'Picking, dispatch, and delivery' },
      ],
      paths: {
        '/orders': {
          post: {
            tags: ['Orders'],
            summary: 'Create a new grocery order',
            description: 'Submit a new order for home delivery or click-and-collect. Requires a valid basket, delivery slot, and payment method.',
            requestBody: {
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateOrderRequest' }
                }
              }
            },
            responses: { 201: { description: 'Order created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } } }
          },
          get: {
            tags: ['Orders'],
            summary: 'List orders for a customer',
            description: 'Returns paginated order history for a customer, filterable by status and date range.',
            parameters: [
              { name: 'customerId', in: 'query', required: true, schema: { type: 'string' } },
              { name: 'status', in: 'query', schema: { type: 'string', enum: ['CREATED', 'CONFIRMED', 'PICKING', 'PICKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'] } },
            ],
            responses: { 200: { description: 'Order list' } }
          }
        },
        '/orders/{orderId}': {
          get: {
            tags: ['Orders'],
            summary: 'Get order details by ID',
            description: 'Returns full order details including items, prices, delivery information, and current status.',
            parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Order details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } } }
          },
          delete: {
            tags: ['Orders'],
            summary: 'Cancel an order',
            description: 'Cancel an order. Only possible before the picking stage begins.',
            parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Order cancelled' }, 409: { description: 'Order cannot be cancelled — already in picking or later stage' } }
          }
        },
        '/orders/{orderId}/status': {
          get: {
            tags: ['Fulfilment'],
            summary: 'Get real-time fulfilment status for an order',
            description: 'Returns the current fulfilment status, estimated delivery time, and driver location (where available).',
            parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Order status and fulfilment details' } }
          }
        },
        '/orders/{orderId}/substitutions': {
          get: {
            tags: ['Fulfilment'],
            summary: 'Get substitutions made during picking',
            description: 'Returns a list of items that were substituted during the picking process due to stock unavailability.',
            parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Substitution list' } }
          }
        },
      },
      components: {
        schemas: {
          Order: {
            type: 'object',
            properties: {
              orderId: { type: 'string' },
              customerId: { type: 'string' },
              status: { type: 'string', enum: ['CREATED', 'CONFIRMED', 'PICKING', 'PICKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'] },
              fulfilmentType: { type: 'string', enum: ['HOME_DELIVERY', 'CLICK_AND_COLLECT'] },
              totalValue: { type: 'number' },
              loyaltyPointsEarned: { type: 'integer' },
              items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
              deliverySlot: { type: 'object', properties: { date: { type: 'string', format: 'date' }, startTime: { type: 'string' }, endTime: { type: 'string' } } },
              createdAt: { type: 'string', format: 'date-time' },
            }
          },
          OrderItem: {
            type: 'object',
            properties: {
              sku: { type: 'string' },
              productName: { type: 'string' },
              quantity: { type: 'integer' },
              unitPrice: { type: 'number' },
              totalPrice: { type: 'number' },
            }
          },
          CreateOrderRequest: {
            type: 'object',
            required: ['customerId', 'items', 'fulfilmentType', 'deliverySlotId'],
            properties: {
              customerId: { type: 'string' },
              items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
              fulfilmentType: { type: 'string', enum: ['HOME_DELIVERY', 'CLICK_AND_COLLECT'] },
              deliverySlotId: { type: 'string' },
              allowSubstitutions: { type: 'boolean', default: true },
            }
          }
        }
      }
    }
  },

  {
    id: 'customer-loyalty-api',
    type: 'openapi',
    data: {
      openapi: '3.0.3',
      info: {
        title: 'Customer & Loyalty API',
        version: '2.0.0',
        description: 'Customer profile management and Loyalty programme programme integration. Provides access to customer accounts, Loyalty card balances, points transactions, and personalised offers.',
        contact: { name: 'Customer Identity Team', email: 'customer-identity@supermarket.co.uk' },
      },
      tags: [
        { name: 'Customers', description: 'Customer profile and account management' },
        { name: 'Loyalty', description: 'Loyalty programme points and rewards' },
      ],
      paths: {
        '/customers/{customerId}': {
          get: {
            tags: ['Customers'],
            summary: 'Get customer profile',
            description: 'Returns customer profile information including name, contact details, address book, and account preferences.',
            parameters: [{ name: 'customerId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Customer profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/Customer' } } } } }
          }
        },
        '/customers/{customerId}/nectar': {
          get: {
            tags: ['Loyalty'],
            summary: 'Get Loyalty card details and points balance for a customer',
            description: 'Returns the customer\'s linked Loyalty card number, current points balance, and equivalent monetary value.',
            parameters: [{ name: 'customerId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Loyalty card and balance details', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoyaltyAccount' } } } } }
          }
        },
        '/nectar/balance/{cardNumber}': {
          get: {
            tags: ['Loyalty'],
            summary: 'Get Loyalty points balance by card number',
            description: 'Returns current Loyalty points balance and monetary value for a given Loyalty card number.',
            parameters: [{ name: 'cardNumber', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Nectar balance' } }
          }
        },
        '/nectar/transactions': {
          get: {
            tags: ['Loyalty'],
            summary: 'Get Loyalty points transaction history',
            description: 'Returns a history of Loyalty points earned and redeemed, filterable by date range and transaction type.',
            parameters: [
              { name: 'cardNumber', in: 'query', required: true, schema: { type: 'string' } },
              { name: 'type', in: 'query', schema: { type: 'string', enum: ['EARN', 'REDEEM'] } },
              { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
              { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
            ],
            responses: { 200: { description: 'Transaction history' } }
          }
        },
        '/customers/{customerId}/offers': {
          get: {
            tags: ['Loyalty'],
            summary: 'Get personalised Nectar offers for a customer',
            description: 'Returns active personalised Loyalty bonus point offers available to a specific customer, based on purchase history.',
            parameters: [{ name: 'customerId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: { description: 'Personalised offers' } }
          }
        },
      },
      components: {
        schemas: {
          Customer: {
            type: 'object',
            properties: {
              customerId: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', format: 'email' },
              loyaltyCardNumber: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            }
          },
          LoyaltyAccount: {
            type: 'object',
            properties: {
              cardNumber: { type: 'string' },
              customerId: { type: 'string' },
              pointsBalance: { type: 'integer' },
              monetaryValue: { type: 'number', description: 'Points balance in GBP (500 points = £2.50)' },
              tier: { type: 'string', enum: ['STANDARD', 'SILVER', 'GOLD'] },
            }
          }
        }
      }
    }
  },

  // ─── AsyncAPI Specs (Kafka Topics) ────────────────────────────────────────

  {
    id: 'price-updated-topic',
    type: 'asyncapi',
    data: {
      asyncapi: '2.6.0',
      info: {
        title: 'Price Updated Topic',
        version: '1.3.0',
        description: 'Kafka topic published whenever a retail price changes for any UK Supermarket product. Includes regular price changes, promotional pricing activation/deactivation, and Loyalty card price updates. Consumed by e-commerce, in-store display systems, and analytics.',
        contact: { name: 'Pricing Platform Team', email: 'pricing-platform@supermarket.co.uk' },
      },
      channels: {
        'supermarket.pricing.price.updated.v1': {
          description: 'Published on every price change event for a product, including promotional pricing and Nectar price updates.',
          subscribe: {
            summary: 'Receive real-time price change events',
            description: 'Subscribe to receive price change events as they occur. Events are published within 500ms of a price change being committed to the pricing system.',
            tags: [{ name: 'pricing' }, { name: 'retail' }, { name: 'loyalty' }, { name: 'promotions' }],
            message: { $ref: '#/components/messages/PriceUpdatedEvent' },
          }
        }
      },
      components: {
        messages: {
          PriceUpdatedEvent: {
            name: 'PriceUpdatedEvent',
            contentType: 'application/json',
            payload: { $ref: '#/components/schemas/PriceUpdatedPayload' },
          }
        },
        schemas: {
          PriceUpdatedPayload: {
            type: 'object',
            required: ['eventId', 'sku', 'newPrice', 'priceType', 'effectiveFrom'],
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              sku: { type: 'string', description: 'Product SKU' },
              productName: { type: 'string' },
              category: { type: 'string', example: 'Fruit & Veg > Fresh Fruit > Apples' },
              previousPrice: { type: 'number', format: 'float', nullable: true },
              newPrice: { type: 'number', format: 'float', description: 'New retail, Nectar, or promotional price in GBP' },
              priceType: { type: 'string', enum: ['RETAIL', 'NECTAR', 'PROMOTIONAL'], description: 'Type of price being updated' },
              promotionId: { type: 'string', nullable: true, description: 'Linked promotion ID if priceType is PROMOTIONAL' },
              storeId: { type: 'string', nullable: true, description: 'Null for national price; store ID for store-specific overrides' },
              effectiveFrom: { type: 'string', format: 'date-time' },
              effectiveTo: { type: 'string', format: 'date-time', nullable: true },
              publishedAt: { type: 'string', format: 'date-time' },
            }
          }
        }
      },
      bindings: {
        kafka: {
          topic: 'supermarket.pricing.price.updated.v1',
          partitions: 12,
          replicas: 3,
          retentionMs: 604800000,
        }
      }
    }
  },

  {
    id: 'stock-changed-topic',
    type: 'asyncapi',
    data: {
      asyncapi: '2.6.0',
      info: {
        title: 'Stock Level Changed Topic',
        version: '2.0.0',
        description: 'Real-time stock level change events published by store systems (EPOS) and warehouse management systems. Triggered by sales, goods-in deliveries, shrinkage adjustments, and waste. Consumed by inventory management, availability services, and replenishment systems.',
        contact: { name: 'Supply Chain Engineering', email: 'supply-chain-eng@supermarket.co.uk' },
      },
      channels: {
        'supermarket.inventory.stock.changed.v2': {
          description: 'Published whenever stock quantity changes for a product at a given location (store or fulfilment centre).',
          subscribe: {
            summary: 'Receive real-time stock level change events',
            description: 'Events are published per location per SKU. High-volume topic — expect up to 50,000 messages per minute during peak trading hours.',
            tags: [{ name: 'inventory' }, { name: 'stock' }, { name: 'availability' }, { name: 'warehouse' }, { name: 'store' }],
            message: { $ref: '#/components/messages/StockChangedEvent' },
          }
        }
      },
      components: {
        messages: {
          StockChangedEvent: {
            name: 'StockChangedEvent',
            contentType: 'application/json',
            payload: { $ref: '#/components/schemas/StockChangedPayload' },
          }
        },
        schemas: {
          StockChangedPayload: {
            type: 'object',
            required: ['eventId', 'sku', 'locationId', 'locationType', 'newQuantity', 'changeReason'],
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              sku: { type: 'string' },
              locationId: { type: 'string', description: 'Store ID or warehouse/fulfilment centre ID' },
              locationType: { type: 'string', enum: ['STORE', 'WAREHOUSE', 'FULFILMENT_CENTRE'] },
              previousQuantity: { type: 'integer' },
              newQuantity: { type: 'integer' },
              quantityChange: { type: 'integer', description: 'Positive for goods-in, negative for sales or waste' },
              changeReason: { type: 'string', enum: ['SALE', 'GOODS_IN', 'SHRINKAGE', 'WASTE', 'ADJUSTMENT', 'RETURN'] },
              triggeredBy: { type: 'string', description: 'System or process that triggered the change (e.g. EPOS, WMS, MANUAL)' },
              publishedAt: { type: 'string', format: 'date-time' },
            }
          }
        }
      },
      bindings: {
        kafka: {
          topic: 'supermarket.inventory.stock.changed.v2',
          partitions: 24,
          replicas: 3,
          retentionMs: 86400000,
        }
      }
    }
  },

  {
    id: 'order-lifecycle-topic',
    type: 'asyncapi',
    data: {
      asyncapi: '2.6.0',
      info: {
        title: 'Order Lifecycle Topic',
        version: '3.1.0',
        description: 'Order status transition events covering the full lifecycle from basket creation through to delivery or cancellation. Published by the Order Management System. Consumed by customer notification services, fulfilment systems, and analytics platforms.',
        contact: { name: 'Order Platform Team', email: 'order-platform@supermarket.co.uk' },
      },
      channels: {
        'supermarket.orders.lifecycle.v3': {
          description: 'Published on every order status transition. Consumers should be idempotent as duplicate events may be published in failure scenarios.',
          subscribe: {
            summary: 'Receive order status transition events',
            description: 'Events are published for every status transition. Use the status field to filter for the transitions relevant to your service.',
            tags: [{ name: 'orders' }, { name: 'fulfilment' }, { name: 'delivery' }, { name: 'click-and-collect' }, { name: 'grocery' }],
            message: { $ref: '#/components/messages/OrderLifecycleEvent' },
          }
        }
      },
      components: {
        messages: {
          OrderLifecycleEvent: {
            name: 'OrderLifecycleEvent',
            contentType: 'application/json',
            payload: { $ref: '#/components/schemas/OrderLifecyclePayload' },
          }
        },
        schemas: {
          OrderLifecyclePayload: {
            type: 'object',
            required: ['eventId', 'orderId', 'customerId', 'status', 'fulfilmentType'],
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              orderId: { type: 'string' },
              customerId: { type: 'string' },
              status: { type: 'string', enum: ['CREATED', 'CONFIRMED', 'PICKING', 'PICKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'] },
              previousStatus: { type: 'string', nullable: true },
              fulfilmentType: { type: 'string', enum: ['HOME_DELIVERY', 'CLICK_AND_COLLECT'] },
              storeId: { type: 'string' },
              totalValue: { type: 'number' },
              itemCount: { type: 'integer' },
              estimatedDeliveryTime: { type: 'string', format: 'date-time', nullable: true },
              cancellationReason: { type: 'string', nullable: true },
              publishedAt: { type: 'string', format: 'date-time' },
            }
          }
        }
      },
      bindings: {
        kafka: {
          topic: 'supermarket.orders.lifecycle.v3',
          partitions: 6,
          replicas: 3,
          retentionMs: 2592000000,
        }
      }
    }
  },

  {
    id: 'loyalty-points-topic',
    type: 'asyncapi',
    data: {
      asyncapi: '2.6.0',
      info: {
        title: 'Loyalty Points Transaction Topic',
        version: '1.1.0',
        description: 'Loyalty points earn and redemption events for the Loyalty programme. Published when a customer earns points through a purchase or partner transaction, or redeems points at checkout. Consumed by the Loyalty platform, customer communications, and analytics.',
        contact: { name: 'Loyalty Platform Team', email: 'loyalty-platform@supermarket.co.uk' },
      },
      channels: {
        'supermarket.loyalty.loyalty.points.transaction.v1': {
          description: 'Published for every Loyalty points earn or redemption event across UK Supermarket and partner transactions.',
          subscribe: {
            summary: 'Receive Loyalty points earn and redemption events',
            tags: [{ name: 'loyalty' }, { name: 'loyalty' }, { name: 'points' }, { name: 'rewards' }, { name: 'customer' }],
            message: { $ref: '#/components/messages/LoyaltyTransactionEvent' },
          }
        }
      },
      components: {
        messages: {
          LoyaltyTransactionEvent: {
            name: 'LoyaltyTransactionEvent',
            contentType: 'application/json',
            payload: { $ref: '#/components/schemas/NectarTransactionPayload' },
          }
        },
        schemas: {
          NectarTransactionPayload: {
            type: 'object',
            required: ['eventId', 'cardNumber', 'transactionType', 'points'],
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              cardNumber: { type: 'string' },
              customerId: { type: 'string' },
              transactionType: { type: 'string', enum: ['EARN', 'REDEEM', 'ADJUSTMENT', 'EXPIRE'] },
              points: { type: 'integer', description: 'Points earned (positive) or redeemed (negative)' },
              balanceAfter: { type: 'integer', description: 'Total points balance after this transaction' },
              monetaryValue: { type: 'number', description: 'GBP value of points transacted' },
              orderId: { type: 'string', nullable: true },
              source: { type: 'string', enum: ['SUPERMARKET', 'PARTNER'], description: 'Which brand or partner triggered the transaction' },
              publishedAt: { type: 'string', format: 'date-time' },
            }
          }
        }
      },
      bindings: {
        kafka: {
          topic: 'supermarket.loyalty.loyalty.points.transaction.v1',
          partitions: 6,
          replicas: 3,
          retentionMs: 2592000000,
        }
      }
    }
  },

  {
    id: 'product-catalogue-updated-topic',
    type: 'asyncapi',
    data: {
      asyncapi: '2.6.0',
      info: {
        title: 'Product Catalogue Updated Topic',
        version: '2.0.0',
        description: 'Published when product master data changes in the UK Supermarket product information management (PIM) system. Covers new product listings, product discontinuations, nutritional updates, allergen changes, description edits, image refreshes, and category reassignments.',
        contact: { name: 'Product Data Team', email: 'product-data@supermarket.co.uk' },
      },
      channels: {
        'supermarket.catalogue.product.updated.v2': {
          description: 'Published for any change to product master data. Consumers should use the changedFields array to determine whether the update is relevant to them.',
          subscribe: {
            summary: 'Receive product catalogue change events',
            tags: [{ name: 'product' }, { name: 'catalogue' }, { name: 'sku' }, { name: 'nutrition' }, { name: 'allergen' }, { name: 'master-data' }],
            message: { $ref: '#/components/messages/ProductCatalogueUpdatedEvent' },
          }
        }
      },
      components: {
        messages: {
          ProductCatalogueUpdatedEvent: {
            name: 'ProductCatalogueUpdatedEvent',
            contentType: 'application/json',
            payload: { $ref: '#/components/schemas/ProductCatalogueUpdatedPayload' },
          }
        },
        schemas: {
          ProductCatalogueUpdatedPayload: {
            type: 'object',
            required: ['eventId', 'sku', 'changeType', 'changedFields'],
            properties: {
              eventId: { type: 'string', format: 'uuid' },
              sku: { type: 'string' },
              ean: { type: 'string', description: 'European Article Number / barcode' },
              productName: { type: 'string' },
              changeType: { type: 'string', enum: ['NEW', 'UPDATED', 'DISCONTINUED', 'REINSTATED'] },
              changedFields: { type: 'array', items: { type: 'string' }, description: 'List of fields that changed', example: ['description', 'nutritionInfo', 'allergens'] },
              category: { type: 'string' },
              brand: { type: 'string' },
              publishedAt: { type: 'string', format: 'date-time' },
            }
          }
        }
      },
      bindings: {
        kafka: {
          topic: 'supermarket.catalogue.product.updated.v2',
          partitions: 6,
          replicas: 3,
          retentionMs: 604800000,
        }
      }
    }
  },

];
