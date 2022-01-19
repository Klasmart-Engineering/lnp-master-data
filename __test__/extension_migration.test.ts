import "dotenv/config";

import {
  getMasterDataExtensionData,
  MasterDataExMongo,
  MasterDataExtension,
  MasterDataMongo,
  MasterDataMySql,
} from "../src";

describe("#MasterDataExtension migration from mysql to mongo", () => {
  let extractedDataFromMySql: MasterDataExtension | null = null;

  beforeAll(async () => {
    const masterDataInstanceMySql = new MasterDataMySql({
      host: process.env.MYSQL_DB_HOST,
      user: process.env.MYSQL_DB_USER,
      database: process.env.MYSQL_DB_DATABASE,
      password: process.env.MYSQL_DB_PASSWORD,
    });

    extractedDataFromMySql = getMasterDataExtensionData(
      await masterDataInstanceMySql.getAllEslLessonPages(),
      await masterDataInstanceMySql.getAllEslLessons(),
      (message: string) => {
        throw Error(message);
      }
    );
  });

  it.only("other test should be skipped for now", async () => {
    console.log("skip the tests in the pipeline!");
  });

  it("#preprocessing and uploading", async () => {
    const uploader = new MasterDataExMongo(
      {
        url: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DB_NAME,
        collectionName: process.env.MONGODB_COLLECTION_EXTENSION,
      },
      "1642127924035"
    );

    const result = await uploader.upload(extractedDataFromMySql);

    console.log({ result });
  });

  it("#getAll", async () => {
    const masterDataExInstanceMongo = new MasterDataExMongo(
      {
        url: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DB_NAME,
        collectionName: process.env.MONGODB_COLLECTION_EXTENSION,
      },
      "1642127924035"
    );

    const dataFromMongo = await masterDataExInstanceMongo.getAll();

    expect(dataFromMongo).toEqual(extractedDataFromMySql);
  });
});
