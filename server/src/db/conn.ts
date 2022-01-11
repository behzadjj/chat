import { MongoClient, Db as MongoDb } from "mongodb";

const DbURI = "mongodb://localhost:27017/Mern";

export class DbClass {
  private static instance: DbClass;
  public static get Instance() {
    if (!DbClass.instance) DbClass.instance = new DbClass();

    return DbClass.instance;
  }

  client: MongoClient;
  database: MongoDb;

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
}

export const Db = DbClass.Instance;
