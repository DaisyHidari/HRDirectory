// Set up dotenv
require("dotenv").config();
const pg = require("pg");
const employees = new pg.Employees(
    process.env.DATABASE_URL || `postgres://localhost/${process.env.DB_NAME}` 
);

const express = require("express");
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

// READ employees
app.get('/api/employees', async(req, res, next) => {
    try {
        const SQL = `SELECT * from employees`
        const response = await employees.query(SQL);
        res.send(response.rows)
    } catch (error) {
        next(error)
        
    }
});

//READ departments
app.get('/api/departments', async(req, res, next) => {
    try {
        const SQL = `SELECT * from departments`
        const response = await employees.query(SQL);
        res.send(response.rows)
    } catch (error) {
        next(error)
        
    }
});

// Payload
app.post('/api/employees', async (req, res, next) => {
    try {
        const SQL = /* sql */ `
        INSERT INTO notes(txt, employees_id)
        VALUES($1, $2)
        RETURNING *
        `;
        const response = await employees.query(SQL, [req.body.txt, req.body.employees_id]);
        res.send(response.row[0]);
    } catch (error) {
        next(error)
    }
});

// DELETE note
app.delete("/api/employees/:id", async(req, res, next) => {
    try {
        const SQL = `DELETE from notes WHERE id = $1`;
        await employees.query(SQL, [req.params.id]);
        res.send.status(204);
    } catch (error) {
        next(error)
    }
})

// UPDATE NOTE
app.put('/api/employees/:id', async(req, res, next) => {
    try {
        const SQL = /* sql */ `
        UPDATE employees
        SET txt=$1, ranking=$2, employees_id=$3, updated_at=now()
        WHERE id=$4
        RETURNING *
        `;
        const response = await employees.query(SQL, [req.body.txt, req.body.ranking, req.body.category_id, req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error)
    }
});

// handle errors
app.use((error, req, res, next) => {
    res.status.(res.status ||)
});

const init = async () => {
    await employees.connect();

    let SQL = /* sql */ `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;

    CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
    );

    CREATE TABLE employees(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        ranking INTEGER DEFAULT 3 NOT NULL,
        txt VARCHAR(255) NOT NULL,
        employees_id INTEGER REFERENCES employees(id) NOT NULL
    );

    `;
    await employees.query(SQL);
    console.log('table created');

    SQL = /* sql */ `
    INSERT INTO employees(name) VALUES('SQL');
    INSERT INTO employees(name) VALUES('Express');
    INSERT INTO employees(name) VALUES('Category');

    INSERT INTO notes(txt, ranking, employees_id) VALUES('learn express', 5, (SELECT id FROM categories WHERE name='Express'));
    INSERT INTO notes(txt, ranking, employees_id) VALUES('add logging middleware', 5, (SELECT id FROM categories WHERE name='Express'));

    INSERT INTO notes(txt, ranking, employees_id) VALUES('write SQL queries', 4, (SELECT id FROM categories WHERE name='SQL'));

    `;

    await employees.query(SQL);
    console.log("data seeded"); 

    const port = process.env.PORT;
    app.listen(port, () => {console.log('listening on ${port}');});
};

init();