const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Newsletter System API",
      version: "1.0.0",
      description:
        "Email automation backend with subscribe/unsubscribe and scheduled mail sending",
      contact: {
        name: "Serkanby",
        url: "https://serkanbayraktar.com/",
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
    components: {
      schemas: {
        Subscriber: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "john@example.com" },
            name: { type: "string", example: "John Doe" },
            is_active: { type: "integer", example: 1 },
            subscribed_at: {
              type: "string",
              example: "2026-03-01 12:00:00",
            },
          },
        },
        Newsletter: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            subject: { type: "string", example: "March Newsletter" },
            content: { type: "string", example: "<p>Hello!</p>" },
            status: {
              type: "string",
              enum: ["draft", "scheduled", "sending", "sent", "failed"],
              example: "draft",
            },
            scheduled_at: { type: "string", nullable: true },
            sent_at: { type: "string", nullable: true },
            created_at: { type: "string", example: "2026-03-01 12:00:00" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
