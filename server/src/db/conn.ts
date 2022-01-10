import { MongoClient, Db as MongoDb } from "mongodb";

const DbURI = "mongodb://localhost:27017/Mern";

export class Db {
  client: MongoClient;
  database: MongoDb;
  private static INSTANCE = new Db();
  static getInstance = () => Db.INSTANCE;

  private constructor() {
    this.client = new MongoClient(DbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  connectToServer(callback: (err: any) => void) {
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
