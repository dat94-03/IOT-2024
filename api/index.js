require('dotenv').config();
require('./mqtt/subscriber');
const cors = require('cors');
const express = require('express');
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

// Enable CORS with custom config for a specific origin
app.use(
  cors({
    origin: 'http://localhost:5500', // Frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies, headers, etc.
  })
);

app.use(express.json());

// Preflight OPTIONS requests handler
app.options('*', cors());  // Allow all OPTIONS requests for CORS preflight

// Routes setup
app.use('/api/auth', userRouter);
app.use('/api/room', authenticationMiddleware, roomRouter);
app.use('/api/device', authenticationMiddleware, deviceRouter);
app.use('/api/devicetype', deviceTypeRouter);
app.use('/api/data', authenticationMiddleware, deviceDataRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger));

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    throw err;
  }
};

start();
