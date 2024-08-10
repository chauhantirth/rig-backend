import express from "express";
import dotenv from "dotenv";

import DB_INFO from '../constants/constants.js';

dotenv.config();

async function findItem(client, db_name, collection) {
    const result = await client.db(db_name).collection(collection).find({});
    return result;
};

async function modifyItem(client, filterItemId, newItemData, db_name, collection) {
    const result = await client.db(db_name).collection(collection).updateOne({_id: filterItemId}, { $set: newItemData});
    console.log(`Items Updated: ${result}`);
    return result;
}

async function createItem(client, itemData, db_name, collection) {
    const result = await client.db(db_name).collection(collection).insertOne(itemData);
    console.log(`Inserted Doc: ${result.insertedId}`);
    return result;
}

async function getItem(req, res, mongoClient) {
    const result = await findItem(
        mongoClient, 
        DB_INFO.jay-ambe.DB_NAME, 
        DB_INFO.jay-ambe.COLLECTION        
    );
    if (!result) {
        res.send({
            'success': false,
            'errorMessage': 'We are unable to fetch the item(s), Please try again later.',
            'errorCode': '3000'
        })
    } else {
        res.send({
            'success': true,
            'container': [result],
        });
    }
}

async function insertItem(req, res, mongoClient) {
    if (!req.body.price || !req.body.label) {
        res.send({
            'success': false,
            'errorMessage': 'No post data found',
            'errorCode': '2000'
        })
    }

    const result = await createItem(
        mongoClient, 
        req.body, 
        DB_INFO.jay-ambe.DB_NAME, 
        DB_INFO.jay-ambe.COLLECTION
    );

    if (!result.insertedId) {
        res.send({
            'success': false,
            'errorMessage': 'We are unable to insert the item, Please try again later.',
            'errorCode': '3000'
        })
    } else {
        res.send({
            'success': true,
            'container': [result],
        });
    }
}

async function updateItem(req, res, mongoClient) {
    if (!req.body.new_price || !req.body.new_label, !req.body.item_id) {
        res.send({
            'success': false,
            'errorMessage': 'No post data found',
            'errorCode': '2000'
        })
    }
    const result = await modifyItem(
        mongoClient, 
        req.body.item_id,
        { 
            label: req.body.new_label,
            name: req.body.new_name,
            price: req.body.new_price,
        },
        DB_INFO.gujcet.DB_NAME, 
        DB_INFO.gujcet.COLLECTION
    );

    if (!result) {
        res.send({
            'success': false,
            'errorMessage': 'We are unable to find the result, Please verify your Aadhar Number and try again',
            'errorCode': '3000'
        })
    } else {
        res.send({
            'success': true,
            'container': [reault],
        });
    }
}

var wrapper = function(mongoClient) {
    var router = express.Router();
    console.log("Inside pricemanager")
    router.post('/addItem', (req, res) => insertItem(req, res, mongoClient));
    router.get('/getItem', (req, res) => getItem(req, res, mongoClient));
    router.post('/updateItem', (req, res) => updateItem(req, res, mongoClient));
    router.get('/', (req, res) =>  {return res.status(404).json({
        'success': false,
        'errorMessage': 'Method not allowed on this route',
        'errorCode': '1001',
    })})

    return router;
}

export default wrapper;