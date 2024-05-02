// Set up dotenv
require("dotenv").config();
const pg = require("pg");
const name = new pg.Name(
    process.env.DATABASE_URL || `postgres://localhost/${process.env.DB_NAME}` 
);

const express = require("express");
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

