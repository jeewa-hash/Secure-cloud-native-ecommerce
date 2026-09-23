import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order & Cart Management Service API',
      version: '1.0.0',
      description: 'API contract for the Order and Cart microservices of the Cloud-Native E-Commerce Platform',
    },
    servers: [
      {
        url: 'http://orderservice-alb-1335748857.eu-north-1.elb.amazonaws.com',
        description: 'AWS Production Server',
      },
      {
        url: 'http://localhost:4000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/health': {
        get: {
          summary: 'Health Check',
          description: 'Check if the Order Management Service is running.',
          tags: ['System'],
          security: [],
          responses: {
            200: {
              description: 'Service is healthy',
              content: {
                'text/plain': { schema: { type: 'string', example: 'OK' } },
              },
            },
          },
        },
      },

      // ---------------- CART ----------------
      '/api/cart': {
        get: {
          summary: 'Get User Cart',
          description: 'Retrieve the current user\'s shopping cart.',
          tags: ['Cart'],
          responses: { 200: { description: 'Successful response' } },
        },
      },
      '/api/cart/add': {
        post: {
          summary: 'Add to Cart',
          description: 'Add an item to the shopping cart.',
          tags: ['Cart'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string', example: 'P001' },
                    quantity: { type: 'integer', example: 2 },
                  },
                  required: ['productId'],
                },
              },
            },
          },
          responses: { 200: { description: 'Item added successfully' } },
        },
      },
      '/api/cart/update': {
        put: {
          summary: 'Update Cart Item Quantity',
          description: 'Update the quantity of an item in the cart.',
          tags: ['Cart'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string', example: 'P001' },
                    quantity: { type: 'integer', example: 3 },
                  },
                  required: ['productId', 'quantity'],
                },
              },
            },
          },
          responses: { 200: { description: 'Item updated successfully' } },
        },
      },
      '/api/cart/remove': {
        delete: {
          summary: 'Remove from Cart',
          description: 'Remove an item from the cart.',
          tags: ['Cart'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { productId: { type: 'string', example: 'P001' } },
                  required: ['productId'],
                },
              },
            },
          },
          responses: { 200: { description: 'Item removed successfully' } },
        },
      },
      '/api/cart/clear': {
        delete: {
          summary: 'Clear Cart',
          description: 'Empty the entire cart.',
          tags: ['Cart'],
          responses: { 200: { description: 'Cart cleared successfully' } },
        },
      },

      // ---------------- ORDER ----------------
      '/api/order/checkout': {
        post: {
          summary: 'Checkout Order',
          description: 'Create a new order from items in the user\'s cart. Communicates with Shop Service to verify products.',
          tags: ['Order'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    address: { type: 'string', example: '123 Street, City' },
                    phone: { type: 'string', example: '0712345678' },
                    paymentMethod: { type: 'string', example: 'cod' },
                    deliveryType: { type: 'string', example: 'home' },
                    instructions: { type: 'string', example: 'Leave at door' },
                    shippingFee: { type: 'number', example: 109 },
                  },
                  required: ['address', 'phone', 'deliveryType'],
                },
              },
            },
          },
          responses: { 201: { description: 'Order created successfully' } },
        },
      },
      '/api/order/history': {
        get: {
          summary: 'Get User Orders',
          description: 'Retrieve all orders for the authenticated user',
          tags: ['Order'],
          responses: { 200: { description: 'Successful response' } },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };