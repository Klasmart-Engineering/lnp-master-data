import { MongoClient } from "mongodb";

import { MasterDataMongoParam } from "./mongo";
import { MasterDataExtension } from "./type";

export class MasterDataExMongo {
  dbInstance: MongoClient | null = null;
  dbParams: MasterDataMongoParam;
  versionCode: string;

  public constructor(dbParams: MasterDataMongoParam, versionCode: string) {
    this.dbParams = dbParams;
    this.versionCode = versionCode;
  }

  private async getMongoInstance() {
    if (this.dbInstance) return this.dbInstance;

    try {
      // Connection URL
      this.dbInstance = new MongoClient(this.dbParams.url);

      await this.dbInstance.connect();
    } catch (e) {
      console.error({ e });
      await this.dbInstance.close();
      this.dbInstance = null;
    }

    return this.dbInstance;
  }

  private async getCollection() {
    const db = (await this.getMongoInstance()).db(this.dbParams.dbName);
    return db.collection(this.dbParams.collectionName);
  }

  public async upload(data: MasterDataExtension) {
    const collection = await this.getCollection();

    return await collection.insertOne({
      versionCode: this.versionCode,
      data,
    });
  }

  public async getAll() {
    const collection = await this.getCollection();

    const { data } = await collection.findOne({
      versionCode: this.versionCode,
    });

    return data as MasterDataExtension;
  }
}
