const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Management API',
      version: '1.0.0',
      description: 'API documentation for Employee Management System'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['mobile', 'password', 'fullName'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            mobile: {
              type: 'string',
              description: 'User mobile number'
            },
            password: {
              type: 'string',
              description: 'User password'
            },
            fullName: {
              type: 'string',
              description: 'User full name'
            }
          }
        },
        Worker: {
          type: 'object',
          required: ['name', 'wage'],
          properties: {
            _id: {
              type: 'string',
              description: 'Worker ID'
            },
            name: {
              type: 'string',
              description: 'Worker name'
            },
            wage: {
              type: 'number',
              description: 'Worker wage'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this worker'
            }
          }
        },
        Attendance: {
          type: 'object',
          required: ['workerId', 'date', 'status'],
          properties: {
            _id: {
              type: 'string',
              description: 'Attendance ID'
            },
            workerId: {
              type: 'string',
              description: 'Worker ID'
            },
            userId: {
              type: 'string',
              description: 'User ID'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Attendance date'
            },
            status: {
              type: 'string',
              enum: ['present', 'absent'],
              description: 'Attendance status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Created at timestamp'
            }
          }
        },
        Bill: {
          type: 'object',
          required: ['billData', 'name', 'generatedDate', 'date'],
          properties: {
            _id: {
              type: 'string',
              description: 'Bill ID'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this bill'
            },
            billData: {
              type: 'object',
              description: 'Bill data object'
            },
            name: {
              type: 'string',
              description: 'Bill name'
            },
            generatedDate: {
              type: 'string',
              description: 'Generated date in DD/MM/YYYY format'
            },
            date: {
              type: 'string',
              description: 'Date in DD/MM/YYYY format'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Created at timestamp'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
