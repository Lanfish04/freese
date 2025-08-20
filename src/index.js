const express = require('express');
const cors = require('cors');
const router = require('./routes')
const path = require('path');
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(router);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;