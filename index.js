import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import pricemanager from "./routes/pricemanager.route.js";

dotenv.config();
const mongoClient = mongodb.MongoClient;

const PORT = process.env.PORT || 8000;

(async function() {
    try {
        const client = await mongoClient.connect(
            process.env.ATLAS_URI,
            {
                maxPoolSize: 50,
                connectTimeoutMS: 2500,
        });

        app.use('/api', pricemanager(client));
        app.use('*', (req, res) => { return res.status(404).json({
            'success': false,
            'errorMessage': 'Route not found',
            'errorCode': '1000',
        })});

        app.listen(PORT, () => {
            console.log(`Backend Server Listening on port: ${PORT}`);
        });
    } catch(error) {
        console.error(error.stack);
        process.exit(1);
    }
})();