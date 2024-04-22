import express from 'express';
import cors from 'cors';
import fs from 'fs';
import mongoose from "mongoose";
import path from 'path';
import dotenv from 'dotenv'
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import authController from './DNS_Controller/authController.js';
import dnsController from './DNS_Controller/dnsController.js'
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});


app.use(express.json());
app.use(morgan("dev"));

const connection = async () => {
    await mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log("Connected to Database");
    }).catch((err) => {
        console.log(err);
    })
}
connection();

app.use('/auth', authController);
app.use('/dns', dnsController);

/*app.use(express.static(path.join(__dirname, './client/build')))

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, './client/build/index.html'))
})
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../client/.next')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/.next/server/app/index.html'));
});*/



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
