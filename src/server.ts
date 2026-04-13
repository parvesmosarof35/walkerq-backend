import { Server as HttpServer } from "http";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import { socketService } from "./app/socket/socket.service";
import app from "./app";
import config from "./app/config";

import httpStatus from "http-status";
import AppError from "./app/errors/AppError";

let server: HttpServer | null = null;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log("database connected successfully");

    server = app.listen(config.port, () => {
      console.log(` app listening http://${config.host}:${config.port}`);
    });

    // Initialize Socket.io for Real-time Dual Scanning Synchronization
    const io = new SocketIOServer(server, {
      cors: {
        origin: "*", // In production, this should be restricted to known domains
        methods: ["GET", "POST"]
      }
    });

    // Start Socket Service listeners
    socketService(io);





  



    process.on("unhandledRejection", () => {
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    process.on("uncaughtException", () => {
      if (server) {
        server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received");
      if (server) {
        server.close(() => {
          console.log("Server closed due to SIGTERM");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received");
      if (server) {
        server.close(() => {
          console.log("Server closed due to SIGINT");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  } catch (err: any) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "server unavailable",
      err
    );
  }
}

main().then(() => {
  console.log("-- Luggage Transfer System server is running---");
});
