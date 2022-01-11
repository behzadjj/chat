import { Server } from "./server.initialization";
import { Socket } from "./socket-initialization";

Server.register();
Socket.register(Server.app);
