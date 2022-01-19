import "dotenv/config";

import { MasterDataMongo, MasterDataMySql } from "../src";
import { eProfileLevel, eSysLang } from "../src/enum";

describe("#MasterData migration from mysql to mongo", () => {
  let masterDataInstanceMongo: MasterDataMongo | null = null;
  let masterDataInstanceMySql: MasterDataMySql | null = null;

  beforeAll(async () => {
    masterDataInstanceMongo = new MasterDataMongo(
      {
        url: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DB_NAME,
        collectionName: process.env.MONGODB_COLLECTION_MASTER,
      },
      "1642127924035"
    );

    masterDataInstanceMySql = new MasterDataMySql({
      host: process.env.MYSQL_DB_HOST,
      user: process.env.MYSQL_DB_USER,
      database: process.env.MYSQL_DB_DATABASE,
      password: process.env.MYSQL_DB_PASSWORD,
    });
  });

  it.only("other test should be skipped for now", async () => {
    console.log("skip the tests in the pipeline!");
  });

  it("#getEslLessonMidByProfileLevel", async () => {
    const profileLevel = eProfileLevel.Low;
    const mongoResult =
      await masterDataInstanceMongo.getEslLessonMidByProfileLevel(profileLevel);

    const sqlResult =
      await masterDataInstanceMySql.getEslLessonMidByProfileLevel(profileLevel);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getAllEslLessons", async () => {
    const mongoResult = await masterDataInstanceMongo.getAllEslLessons();

    const sqlResult = await masterDataInstanceMySql.getAllEslLessons();

    // console.log(mongoResult.length, sqlResult.length);

    expect(mongoResult.length).toEqual(sqlResult.length);
  });

  it("#getEslLesson", async () => {
    const mid = "rhyme-lesson1";
    const mongoResult = await masterDataInstanceMongo.getEslLesson(mid);

    const sqlResult = await masterDataInstanceMySql.getEslLesson(mid);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult.lesson_name).toEqual(sqlResult.lesson_name);
  });

  it("#getEslRewardCount", async () => {
    const mongoResult = await masterDataInstanceMongo.getEslRewardCount();

    const sqlResult = await masterDataInstanceMySql.getEslRewardCount();

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getAppIdentification", async () => {
    const mId = "Launcher";
    const mongoResult = await masterDataInstanceMongo.getAppIdentification(mId);

    const sqlResult = await masterDataInstanceMySql.getAppIdentification(mId);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getMediaboxSong", async () => {
    const mId = 10001;
    const mongoResult = await masterDataInstanceMongo.getMediaboxSong(mId);

    const sqlResult = await masterDataInstanceMySql.getMediaboxSong(mId);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getSong", async () => {
    const mId = 10001;
    const mongoResult = await masterDataInstanceMongo.getSong(mId);

    const sqlResult = await masterDataInstanceMySql.getSong(mId);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getMediaboxBook", async () => {
    const mId = 10001;
    const mongoResult = await masterDataInstanceMongo.getMediaboxBook(mId);

    const sqlResult = await masterDataInstanceMySql.getMediaboxBook(mId);

    console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getBook", async () => {
    const mId = 10001;
    const mongoResult = await masterDataInstanceMongo.getBook(mId);

    const sqlResult = await masterDataInstanceMySql.getBook(mId);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getQuickClipsContents", async () => {
    const mId = 1;
    const mongoResult = await masterDataInstanceMongo.getQuickClipsContents(
      mId
    );

    const sqlResult = await masterDataInstanceMySql.getQuickClipsContents(mId);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getGeniusTopic", async () => {
    const mId = 1;
    const mongoResult = await masterDataInstanceMongo.getGeniusTopic(mId);

    const sqlResult = await masterDataInstanceMySql.getGeniusTopic(mId);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getEslLessonPage", async () => {
    const mId = "activity.launcher.rhyme-lesson1-song-30006.korea.2020";
    const mongoResult = await masterDataInstanceMongo.getEslLessonPage(mId);

    const sqlResult = await masterDataInstanceMySql.getEslLessonPage(mId);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getAllEslLessonPages", async () => {
    const mongoResult = await masterDataInstanceMongo.getAllEslLessonPages();

    const sqlResult = await masterDataInstanceMySql.getAllEslLessonPages();

    console.log([mongoResult[0], sqlResult[0]]);
    // expect(mongoResult).toEqual(sqlResult);
  });

  it("#getEslReward", async () => {
    const mId = 1;
    const mongoResult = await masterDataInstanceMongo.getEslReward(mId);

    const sqlResult = await masterDataInstanceMySql.getEslReward(mId);

    console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getContent", async () => {
    const mId = 10111030006;
    const mongoResult = await masterDataInstanceMongo.getContent(mId);

    const sqlResult = await masterDataInstanceMySql.getContent(mId);

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getTalkLessonType", async () => {
    const mId = "lesson1_content";
    const mongoResult = await masterDataInstanceMongo.getTalkLessonType(mId);

    const sqlResult = await masterDataInstanceMySql.getTalkLessonType(mId);

    console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getTalkCommContentByMid", async () => {
    const mId = "activity.bada-talk-1.lesson1_content-book-30002.korea.2020.1";
    const mongoResult = await masterDataInstanceMongo.getTalkCommContentByMid(
      mId
    );

    const sqlResult = await masterDataInstanceMySql.getTalkCommContentByMid(
      mId
    );

    // console.log({ mongoResult, sqlResult });

    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getTalkBookList", async () => {
    const mongoResult = await masterDataInstanceMongo.getTalkBookList();

    const sqlResult = await masterDataInstanceMySql.getTalkBookList();

    // console.log({ mongoResult, sqlResult });
    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getTalkBook", async () => {
    const mongoResult = await masterDataInstanceMongo.getTalkBook("1");

    const sqlResult = await masterDataInstanceMySql.getTalkBook("1");

    // console.log({ mongoResult, sqlResult });
    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getCadetsEpisode", async () => {
    const mongoResult = await masterDataInstanceMongo.getCadetsEpisode(
      "100100"
    );

    const sqlResult = await masterDataInstanceMySql.getCadetsEpisode("100100");

    // console.log({ mongoResult, sqlResult });
    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getBadanamuStoryContent", async () => {
    const mongoResult = await masterDataInstanceMongo.getBadanamuStoryContent(
      "50000"
    );

    const sqlResult = await masterDataInstanceMySql.getBadanamuStoryContent(
      "50000"
    );

    // console.log({ mongoResult, sqlResult });
    expect(mongoResult).toEqual(sqlResult);
  });

  it("#getEmail", async () => {
    const mongoResult = await masterDataInstanceMongo.getEmail(
      1227, // eMsgType.ACCOUNT_SIGN_UP_REQ,
      eSysLang.Korean
    );

    const sqlResult = await masterDataInstanceMySql.getEmail(
      1227, //eMsgType.ACCOUNT_SIGN_UP_REQ,
      eSysLang.Korean
    );

    // console.log({ mongoResult, sqlResult });
    expect(mongoResult).toEqual(sqlResult);
  });
});
