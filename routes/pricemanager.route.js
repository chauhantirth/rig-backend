import express from "express";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

import DB_INFO from '../constants/constants.js';

dotenv.config();

async function findItem(client, db_name, collection) {
    const result = await client.db(db_name).collection(collection).find({}).toArray();
    return result;
};

async function modifyItem(client, filterItemId, newItemData, db_name, collection) {
    // console.log(`Inside modifyItem(). recieved: ${JSON.stringify({newItemData})} to update _id: ${filterItemId}`)
    var o_id = new ObjectId(filterItemId);
    const result = await client.db(db_name).collection(collection).updateOne({_id: o_id}, {$set: newItemData});
    console.log(`Items Updated: ${JSON.stringify(result)}`);
    return result;
}

async function createItem(client, itemData, db_name, collection) {
    const result = await client.db(db_name).collection(collection).insertOne(itemData);
    return result;
}

async function getItem(req, res, mongoClient) {
    const result = await findItem(
        mongoClient, 
        DB_INFO.main.DB_NAME, 
        DB_INFO.main.COLLECTION        
    );
    if (!result) {
        res.send({
            'success': false,
            'errorMessage': 'We are unable to fetch the item(s), Please try again later.',
            'errorCode': '3000'
        })
        return;
    } else {
        res.send({
            'success': true,
            'container': [result],
        });
        return;
    }
}

async function insertItem(req, res, mongoClient) {
    if (!req.body.price || !req.body.label || !req.body.value) {
        res.send({
            'success': false,
            'errorMessage': 'Improper post data.',
            'errorCode': '2001'
        })
        return;
    }
    const result = await createItem(
        mongoClient, 
        {
            "value": req.body.value,
            "label": req.body.label,
            "price": req.body.price
        },
        DB_INFO.main.DB_NAME, 
        DB_INFO.main.COLLECTION
    );

    if (!result.insertedId) {
        res.send({
            'success': false,
            'errorMessage': 'We are unable to insert the item, Please try again later.',
            'errorCode': '2000'
        })
        return;
    } else {
        res.send({
            'success': true,
            'message': 'Item successfully added to the database.',
            'container': JSON.stringify(result),
        });
        return;
    }
}

async function updateItem(req, res, mongoClient) {
    if (!req.body.item_id) {
        res.send({
            'success': false,
            'errorMessage': 'Item id not found.',
            'errorCode': '1001'
        })
        return;
    }
    if (!req.body.price && !req.body.value && !req.body.label) {
        res.send({
            'success': false,
            'errorMessage': 'Please attach the data to be updated.',
            'errorCode': '1002'
        })     
        return;       
    }

    let updateDocument = {}
    if (req.body.value) {updateDocument.value = req.body.value}
    if (req.body.label) {updateDocument.label = req.body.label}
    if (req.body.price) {updateDocument.price = req.body.price}

    const result = await modifyItem(
        mongoClient, 
        req.body.item_id,
        updateDocument,
        DB_INFO.main.DB_NAME, 
        DB_INFO.main.COLLECTION
    );

    if (!result.acknowledged) {
        res.send({
            'success': false,
            'errorMessage': 'We are unable to update the item, Please try again later.',
            'errorCode': '1000'
        })
        return;
    } else {
        res.send({
            'success': true,
            'container': JSON.stringify(result),
        });
        return;
    }
}

var wrapper = function(mongoClient) {
    var router = express.Router();
    router.post('/addItem', (req, res) => insertItem(req, res, mongoClient));
    router.get('/getItem', (req, res) => getItem(req, res, mongoClient));
    router.post('/updateItem', (req, res) => updateItem(req, res, mongoClient));
    router.get('/', (req, res) =>  {return res.status(404).json({
        'success': false,
        'errorMessage': 'Method not allowed on this route',
        'errorCode': '100',
    })})

    return router;
}

export default wrapper;