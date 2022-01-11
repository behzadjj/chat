"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Db = void 0;
const mongodb_1 = require("mongodb");
const DbURI = "mongodb://localhost:27017/Mern";
class Db {
    constructor() {
        this.client = new mongodb_1.MongoClient(DbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    connectToServer(callback) {
        this.client.connect((err, db) => {
            // Verify we got a good "db" object
            if (db) {
                this.database = db.db("Mern");
                // tslint:disable-next-line:no-console
                console.log("Successfully connected to MongoDB.");
            }
            return callback(err);
        });
    }
    getDb() {
        return this.database;
    }
    getInstance() {
        return Db.INSTANCE;
    }
}
exports.Db = Db;
Db.INSTANCE = new Db();
Db.getInstance = () => Db.INSTANCE;
//# sourceMappingURL=conn.js.map