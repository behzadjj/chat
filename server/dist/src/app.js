"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_initialization_1 = require("./server.initialization");
const socket_initialization_1 = require("./socket-initialization");
server_initialization_1.Server.register();
socket_initialization_1.Socket.register(server_initialization_1.Server.app);
//# sourceMappingURL=app.js.map