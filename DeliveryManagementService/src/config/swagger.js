import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Delivery Management Service API",
      version: "1.0.0",
      description:
        "API documentation for the Delivery Management Service in the Cloud-Native Food Ordering Platform.",
    },
    servers: [
      {
        url: "http://localhost:5003",
        description: "Local server",
      },
      {
        url: "http://delivery-service-alb-1864288318.eu-north-1.elb.amazonaws.com",
        description: "AWS ECS deployed server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        serviceTokenAuth: {
          type: "apiKey",
          in: "header",
          name: "x-service-token",
        },
      },
      schemas: {
        DeliveryPerson: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "65f1c2a8d4f9a12345678901",
            },
            userId: {
              type: "string",
              example: "65f1c2a8d4f9a12345678999",
            },
            name: {
              type: "string",
              example: "Kasun Perera",
            },
            email: {
              type: "string",
              example: "kasun@example.com",
            },
            phone: {
              type: "string",
              example: "0771234567",
            },
            zipCode: {
              type: "string",
              example: "10100",
            },
            vehicleType: {
              type: "string",
              enum: ["bike", "scooter", "car", "van"],
              example: "bike",
            },
            availabilityStatus: {
              type: "string",
              enum: ["AVAILABLE", "BUSY", "OFFLINE"],
              example: "AVAILABLE",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
          },
        },

        Shipment: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "65f1c2a8d4f9a12345670000",
            },
            orderId: {
              type: "string",
              example: "ORD-1001",
            },
            deliveryPersonId: {
              type: "string",
              example: "65f1c2a8d4f9a12345678901",
            },
            zipCode: {
              type: "string",
              example: "10100",
            },
            address: {
              type: "string",
              example: "No 10, Main Street, Colombo",
            },
            phone: {
              type: "string",
              example: "0771234567",
            },
            status: {
              type: "string",
              enum: [
                "ASSIGNED",
                "PICKED_UP",
                "IN_TRANSIT",
                "DELIVERED",
                "FAILED",
                "RETURN_IN_TRANSIT",
                "RETURNED_TO_SHOP",
              ],
              example: "ASSIGNED",
            },
            trackingSteps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: {
                    type: "string",
                    example: "Assigned",
                  },
                  note: {
                    type: "string",
                    example: "Delivery person assigned automatically",
                  },
                  at: {
                    type: "string",
                    format: "date-time",
                    example: "2026-04-26T10:30:00.000Z",
                  },
                },
              },
            },
          },
        },

        CreateDeliveryProfileRequest: {
          type: "object",
          required: ["name", "email", "phone", "zipCode", "vehicleType"],
          properties: {
            name: {
              type: "string",
              example: "Kasun Perera",
            },
            email: {
              type: "string",
              example: "kasun@example.com",
            },
            phone: {
              type: "string",
              example: "0771234567",
            },
            zipCode: {
              type: "string",
              example: "10100",
            },
            vehicleType: {
              type: "string",
              enum: ["bike", "scooter", "car", "van"],
              example: "bike",
            },
          },
        },

        UpdateAvailabilityRequest: {
          type: "object",
          required: ["availabilityStatus"],
          properties: {
            availabilityStatus: {
              type: "string",
              enum: ["AVAILABLE", "BUSY", "OFFLINE"],
              example: "AVAILABLE",
            },
          },
        },

        AssignOrderRequest: {
          type: "object",
          required: ["orderId", "zipCode"],
          properties: {
            orderId: {
              type: "string",
              example: "ORD-1001",
            },
            zipCode: {
              type: "string",
              example: "10100",
            },
            address: {
              type: "string",
              example: "No 10, Main Street, Colombo",
            },
            phone: {
              type: "string",
              example: "0771234567",
            },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },
      },
    },

    paths: {
      "/": {
        get: {
          summary: "Check Delivery Management Service status",
          tags: ["Health"],
          responses: {
            200: {
              description: "Service is running",
            },
          },
        },
      },

      "/health": {
        get: {
          summary: "Health check endpoint",
          tags: ["Health"],
          responses: {
            200: {
              description: "Service is healthy",
            },
          },
        },
      },

      "/delivery/delivery-persons": {
        post: {
          summary: "Create delivery person profile",
          tags: ["Delivery Profile"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateDeliveryProfileRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Delivery profile created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DeliveryPerson",
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
            },
            403: {
              description: "Only delivery users can access this endpoint",
            },
          },
        },
      },

      "/delivery/delivery-profile": {
        get: {
          summary: "Get logged-in delivery person's profile",
          tags: ["Delivery Profile"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Delivery profile returned successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/DeliveryPerson",
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
            },
          },
        },

        put: {
          summary: "Update logged-in delivery person's profile",
          tags: ["Delivery Profile"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateDeliveryProfileRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Delivery profile updated successfully",
            },
            401: {
              description: "Unauthorized",
            },
          },
        },
      },

      "/delivery/delivery-profile/availability": {
        patch: {
          summary: "Update delivery person's availability status",
          tags: ["Delivery Profile"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateAvailabilityRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Availability status updated successfully",
            },
            401: {
              description: "Unauthorized",
            },
          },
        },
      },

      "/delivery/shipments/my": {
        get: {
          summary: "Get shipments assigned to logged-in delivery person",
          tags: ["Shipments"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Assigned shipments returned successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Shipment",
                    },
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
            },
          },
        },
      },

      "/delivery/shipments/{id}": {
        get: {
          summary: "Get shipment by ID",
          tags: ["Shipments"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
              example: "65f1c2a8d4f9a12345670000",
            },
          ],
          responses: {
            200: {
              description: "Shipment returned successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Shipment",
                  },
                },
              },
            },
            404: {
              description: "Shipment not found",
            },
          },
        },
      },

      "/delivery/shipments/{id}/pickup": {
        patch: {
          summary: "Mark shipment as picked up",
          tags: ["Shipment Status"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Shipment marked as picked up",
            },
          },
        },
      },

      "/delivery/shipments/{id}/in-transit": {
        patch: {
          summary: "Mark shipment as in transit",
          tags: ["Shipment Status"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Shipment marked as in transit",
            },
          },
        },
      },

      "/delivery/shipments/{id}/deliver": {
        patch: {
          summary: "Mark shipment as delivered",
          tags: ["Shipment Status"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Shipment marked as delivered",
            },
          },
        },
      },

      "/delivery/shipments/{id}/fail": {
        patch: {
          summary: "Mark shipment as failed",
          tags: ["Shipment Status"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Shipment marked as failed",
            },
          },
        },
      },

      "/delivery/shipments/{id}/return": {
        patch: {
          summary: "Mark shipment as return in transit",
          tags: ["Shipment Status"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Shipment marked as return in transit",
            },
          },
        },
      },

      "/delivery/shipments/{id}/returned": {
        patch: {
          summary: "Mark shipment as returned to shop",
          tags: ["Shipment Status"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Shipment marked as returned to shop",
            },
          },
        },
      },

      "/delivery/internal/assign-order": {
        post: {
          summary: "Assign an order to a delivery person internally",
          description:
            "This endpoint is intended to be called by another microservice such as the Order Service when an order becomes ready for delivery.",
          tags: ["Internal Integration"],
          security: [{ serviceTokenAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AssignOrderRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Order assignment response",
            },
            401: {
              description: "Invalid or missing service token",
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;