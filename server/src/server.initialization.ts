import cors from "cors";
import express, { Express } from "express";

import { Db } from "./db/conn";
import { register as registerRoutes } from "./routes";

class ServerClass {
  private static PORT = 5000;

  private static instance: ServerClass;

  public static get Instance() {
    if (!ServerClass.instance) ServerClass.instance = new ServerClass();

    return ServerClass.instance;
  }

  app: Express;

  private constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
  }

  register() {
    registerRoutes(this.app);
    this.app.listen(ServerClass.PORT, () => {
      // perform a database connection when server starts
      Db.getInstance().connectToServer((err: any) => {
        // tslint:disable-next-line:no-console
        if (err) console.error(err);
      });

      // tslint:disable-next-line:no-console
      console.log(`Server is running on port: ${ServerClass.PORT}`);
    });
  }
}

export const Server = ServerClass.Instance;
