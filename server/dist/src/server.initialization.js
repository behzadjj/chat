"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const conn_1 = require("./db/conn");
const routes_1 = require("./routes");
class ServerClass {
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    static get Instance() {
        if (!ServerClass.instance)
            ServerClass.instance = new ServerClass();
        return ServerClass.instance;
    }
    register() {
        (0, routes_1.register)(this.app);
        this.app.listen(ServerClass.PORT, () => {
            // perform a database connection when server starts
            conn_1.Db.getInstance().connectToServer((err) => {
                // tslint:disable-next-line:no-console
                if (err)
                    console.error(err);
            });
            // tslint:disable-next-line:no-console
            console.log(`Server is running on port: ${ServerClass.PORT}`);
        });
    }
}
ServerClass.PORT = 5000;
exports.Server = ServerClass.Instance;
//# sourceMappingURL=server.initialization.js.map