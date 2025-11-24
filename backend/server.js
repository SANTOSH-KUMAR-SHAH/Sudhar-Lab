require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const corsoptions = require('./utils/cors')

const app = express();
app.use(express.json());
app.use(cors(corsoptions));
app.use(cookieParser());
app.use('/api', require('./routes'));

app.listen(4040, () => {
    console.log('Server is running on port 4040');
});
module.exports = app;


