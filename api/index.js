require('dotenv').config();
require('./mqtt/subscriber');
const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db-config');
const swaggerUi = require('swagger-ui-express');

const userRouter = require('./routes/user.route');
const roomRouter = require('./routes/room.route');
const deviceRouter = require('./routes/device.route');
const deviceTypeRouter = require('./routes/devicetype.route');
const deviceDataRouter = require('./routes/devicedata.route');

const authenticationMiddleware = require('./middlewares/authentication');
const notFoundMiddleware = require('./middlewares/notfound.middleware');
const errorHandlerMiddleware = require('./middlewares/errorhandler.middleware');

const swagger = require('./swagger/swagger.json');

const app = express();

// Allowed origins for CORS
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, server-to-server requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies, headers, etc.
  })
);

// Preflight requests handler
app.options('*', cors()); // Handle OPTIONS requests for preflight

// Body parser middleware
app.use(express.json());

// API routes
app.use('/api/auth', userRouter);
app.use('/api/room', authenticationMiddleware, roomRouter);
app.use('/api/device', authenticationMiddleware, deviceRouter);
app.use('/api/devicetype', deviceTypeRouter);
app.use('/api/data', deviceDataRouter);

// Swagger API documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger));

// Middleware for handling 404 errors
app.use(notFoundMiddleware);

// Middleware for handling errors
app.use(errorHandlerMiddleware);

// Start the server
const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
