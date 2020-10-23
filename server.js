const express = require('express');
const app = express();

const morgan = require('morgan');
const cors = require('cors');

const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(cors());
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile('index.html'));

app.listen(port, () => console.log(`Now listening on port ${port}`))