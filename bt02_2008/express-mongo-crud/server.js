const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./src/config/db');
const webRoutes = require('./src/routes/web');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', './src/views');

connectDB();
app.use('/', webRoutes);

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
