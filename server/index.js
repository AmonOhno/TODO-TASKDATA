import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import todoRoutes from './todo.js';
import dustBoxRoutes from './dustBox.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(todoRoutes);
app.use(dustBoxRoutes);


app.listen(3000, () => {
    console.log('Server running on port 3000');
});