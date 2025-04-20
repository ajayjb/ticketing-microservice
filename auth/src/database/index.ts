import mongoose, { Mongoose, Query } from "mongoose";

import { db } from "@/config/config";
import logger from "@/core/Logger";

class DbConnection {
  public dbURI: string;
  public mongoose: Mongoose;

  constructor() {
    this.dbURI = `mongodb://${db.host}:${db.port}/${db.name}`;
    this.mongoose = mongoose;
  }

  init() {
    const options = {
      autoIndex: true,
      minPoolSize: db.minPoolSize,
      maxPoolSize: db.maxPoolSize,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 45000,
    };

    logger.debug(this.dbURI);

    function setRunValidators(this: Query<any, any>) {
      this.setOptions({ runValidators: true });
    }

    this.mongoose.set("strictQuery", true);

    this.mongoose
      .plugin((schema: any) => {
        schema.pre("findOneAndUpdate", setRunValidators);
        schema.pre("updateMany", setRunValidators);
        schema.pre("updateOne", setRunValidators);
        schema.pre("update", setRunValidators);
      })
      .connect(this.dbURI, options)
      .then(() => {
        logger.info("Mongoose connection done");
      })
      .catch((e) => {
        logger.info("Mongoose connection error");
        logger.error(e);
      });

    this.mongoose.connection.on("connected", () => {
      logger.debug("Mongoose default connection open to " + this.dbURI);
    });

    this.mongoose.connection.on("error", (err) => {
      logger.error("Mongoose default connection error: " + err);
    });

    this.mongoose.connection.on("disconnected", () => {
      logger.info("Mongoose default connection disconnected");
    });

    process.on("SIGINT", () => {
      this.mongoose.connection.close().finally(() => {
        logger.info(
          "Mongoose default connection disconnected through app termination"
        );
        process.exit(0);
      });
    });
  }

  async close() {
    await this.mongoose.connection.close();
    logger.info("Mongoose connection closed manually");
  }
}

const dbConnection = new DbConnection().init();
export default dbConnection;
