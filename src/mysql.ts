import _ from "lodash";
import mysql from "mysql2/promise";

import { eProfileLevel, eSysLang } from "./enum";
import {
  AppIdentification,
  BadanamuStoryContent,
  Book,
  CadetsEpisode,
  Content,
  Email,
  EslLesson,
  EslLessonPage,
  EslReward,
  GeniusTopic,
  IMasterData,
  MediaboxBook,
  MediaboxSong,
  QuickClipsContents,
  Song,
  TalkBook,
  TalkCommContent,
  TalkLessonType,
} from "./type";

interface MasterDataMySQLParam {
  host: string;
  user: string;
  database: string;
  password?: string;
}

export class MasterDataMySql implements IMasterData {
  poolInstance: mysql.Pool = null;
  dbParams: MasterDataMySQLParam;

  public constructor(dbParams: MasterDataMySQLParam) {
    this.dbParams = dbParams;
  }

  private async getDBInstance() {
    if (this.poolInstance) return this.poolInstance;

    const dbConfig = _.merge(
      {
        queueLimit: 0,
      },
      this.dbParams
    );

    this.poolInstance = await mysql.createPool(dbConfig);

    return this.poolInstance;
  }

  private async query(query: string) {
    const [rows, fileds] = await (await this.getDBInstance()).query(query);

    return { rows, fileds };
  }

  public async getEmail(iMsgType: number, iSysLang: eSysLang) {
    const { rows } = await this.query(`select * from email`);

    const rawValues = rows as mysql.RowDataPacket[];

    const mstDataEmailAll = rawValues.map((v) => {
      v.contents_html = v.contents_html.toString().split(";");
      v.contents_text = v.contents_text.toString().split(";");
      return v;
    }) as Email[];

    let sIndex = iMsgType.toString() + "_" + iSysLang.toString();
    const mstEmail = _.find(mstDataEmailAll, (v) => v.email_mid === sIndex);

    if (!mstEmail) return mstEmail;

    sIndex = iMsgType.toString() + "_" + eSysLang.English.toString();

    return _.find(mstDataEmailAll, (v) => v.email_mid === sIndex);
  }

  public async getBadanamuStoryContent(
    contentId: string
  ): Promise<BadanamuStoryContent> {
    const { rows } = await this.query(
      `select * from badanamu_stories where badanamu_stories_mid=${contentId}`
    );

    return rows[0];
  }

  public async getCadetsEpisode(mId: string): Promise<CadetsEpisode> {
    const { rows } = await this.query(
      `select * from cadets_episode where cadets_episode_mid=${mId}`
    );

    return rows[0];
  }

  public async getTalkBook(mId: string): Promise<TalkBook> {
    const { rows } = await this.query(
      `select * from talk_book where talk_book_mid=${mId}`
    );

    return rows[0] as TalkBook;
  }

  public async getTalkBookList(): Promise<TalkBook[]> {
    const { rows } = await this.query(`select * from talk_book`);

    return rows as TalkBook[];
  }

  public async getTalkCommContentByMid(
    contentMid: string
  ): Promise<TalkCommContent> {
    const { rows } = await this.query(
      `select * from talk_comm_content where talk_comm_content_mid='${contentMid}'`
    );

    return rows[0];
  }
  public async getTalkLessonType(mid: string): Promise<TalkLessonType> {
    const { rows } = await this.query(
      `select * from talk_lesson_type where talk_lesson_type_mid='${mid}'`
    );

    return rows[0];
  }
  public async getContent(mid: number): Promise<Content> {
    const { rows } = await this.query(
      `select * from content where content_mid='${mid}'`
    );

    return rows[0];
  }
  public async getEslReward(mid: number): Promise<EslReward> {
    const { rows } = await this.query(
      `select * from esl_reward where esl_reward_mid='${mid}'`
    );

    return rows[0];
  }
  public async getAllEslRewards(): Promise<EslReward[]> {
    const { rows } = await this.query(`select * from esl_reward`);

    return rows as EslReward[];
  }
  public async getAllEslLessonPages(): Promise<EslLessonPage[]> {
    const { rows } = await this.query(`select * from esl_lesson_page`);

    return (rows as unknown as EslLessonPage[]).map((rawValue) => {
      const bundle_common_str: string =
        rawValue.bundle_common as unknown as string;
      const bundle_common: string[] = [];
      const splited_bundle = bundle_common_str.split(";");
      for (const i in splited_bundle) {
        if (splited_bundle[i].length !== 0)
          bundle_common.push(splited_bundle[i]);
      }
      rawValue.bundle_common = bundle_common;
      return rawValue;
    });
  }
  public async getEslLessonPage(mid: string): Promise<EslLessonPage | null> {
    const { rows } = await this.query(
      `select * from esl_lesson_page where esl_lesson_page_mid='${mid}'`
    );

    const rawValue = rows[0];

    if (!rawValue) return null;

    rawValue.bundle = [rawValue.bundle];
    const bundle_common_str: string = rawValue.bundle_common;
    const bundle_common: string[] = [];
    const splited_bundle = bundle_common_str.split(";");
    for (const i in splited_bundle) {
      if (splited_bundle[i].length !== 0) bundle_common.push(splited_bundle[i]);
    }
    rawValue.bundle_common = bundle_common;

    return rawValue as EslLessonPage;
  }
  public async getGeniusTopic(mid: number): Promise<GeniusTopic> {
    const { rows } = await this.query(
      `select * from genius_topic where genius_topic_mid='${mid}'`
    );

    const rawValue = rows[0];

    return rawValue;
  }
  public async getQuickClipsContents(mid: number): Promise<QuickClipsContents> {
    const { rows } = await this.query(
      `select * from quick_clips_contents where quick_clips_contents_mid='${mid}'`
    );

    const rawValue = rows[0];

    return rawValue;
  }

  public async getBook(mid: number): Promise<Book> {
    const { rows } = await this.query(
      `select * from books where books_mid='${mid}'`
    );

    const rawValue = rows[0];

    return rawValue;
  }

  public async getMediaboxBook(mid: number): Promise<MediaboxBook> {
    const { rows } = await this.query(
      `select * from books_mediabox where books_mediabox_mid='${mid}'`
    );

    const rawValue = rows[0];
    const arr = rawValue.oid.split(";");

    rawValue.oid = arr.map((v) => parseInt(v, 10));

    return rawValue;
  }

  public async getSong(mid: number): Promise<Song> {
    const { rows } = await this.query(
      `select * from songs where songs_mid='${mid}'`
    );

    const rawValue = rows[0];

    return rawValue;
  }

  public async getMediaboxSong(mid: number): Promise<MediaboxSong> {
    const { rows } = await this.query(
      `select * from songs_mediabox where songs_mediabox_mid='${mid}'`
    );

    const rawValue = rows[0];

    const arr = rawValue.oid.split(";");

    rawValue.oid = arr.map((v) => parseInt(v, 10));

    return rawValue;
  }

  public async getAppIdentification(mid: string): Promise<AppIdentification> {
    const { rows } = await this.query(
      `select * from app_identification where app_identification_mid='${mid}'`
    );

    const rawValue = rows[0];

    rawValue.beta_versions_google = rawValue.beta_versions_google.split(";");
    rawValue.prod_versions_google = rawValue.prod_versions_google.split(";");
    rawValue.beta_versions_apple = rawValue.beta_versions_apple.split(";");
    rawValue.prod_versions_apple = rawValue.prod_versions_apple.split(";");
    rawValue.ceo_versions = rawValue.ceo_versions.split(";");
    rawValue.embed_versions = rawValue.embed_versions.split(";");

    delete rawValue.Categorization;
    delete rawValue.beta_versions;
    delete rawValue.prod_versions;

    return rawValue;
  }

  public async getEslRewardCount() {
    const { rows } = await this.query(`select count(*) from esl_reward;`);

    return rows[0]["count(*)"] as number;
  }

  public async getEslLesson(mid: string): Promise<EslLesson> {
    const { rows } = await this.query(
      `select * from esl_lesson where esl_lesson_mid='${mid}'`
    );

    const rawValue = rows[0];

    return rawValue;
  }

  public async getAllEslLessons(): Promise<EslLesson[]> {
    const { rows } = await this.query(`select * from esl_lesson`);

    const rawValue = rows;

    return rawValue as EslLesson[];
  }

  public async getEslLessonMidByProfileLevel(level: eProfileLevel) {
    const { rows } = await this.query(
      `select * from esl_lesson where lesson_day=${level}`
    );

    const rawValue: EslLesson = rows[0];

    return rawValue.esl_lesson_mid;
  }
}
