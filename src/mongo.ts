import _ from "lodash";
import { MongoClient } from "mongodb";
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

export interface MasterDataMongoParam {
  url: string;
  dbName: string;
  collectionName: string;
}

export class MasterDataMongo implements IMasterData {
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

  public async upload(data: any) {
    const collection = await this.getCollection();

    return await collection.insertOne({
      versionCode: this.versionCode,
      data,
    });
  }

  public async getEmail(iMsgType: number, iSysLang: eSysLang): Promise<Email> {
    const collection = await this.getCollection();
    const {
      data: { email },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            email: 1,
          },
        },
      }
    );

    let sIndex = iMsgType.toString() + "_" + iSysLang.toString();
    const mstEmail = email[sIndex] as Email;

    if (!mstEmail) return mstEmail;

    sIndex = iMsgType.toString() + "_" + eSysLang.English.toString();

    return email[sIndex];
  }

  public async getBadanamuStoryContent(
    contentId: string
  ): Promise<BadanamuStoryContent> {
    const collection = await this.getCollection();
    const {
      data: { badanamu_stories },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            badanamu_stories: 1,
          },
        },
      }
    );

    return badanamu_stories[contentId] as BadanamuStoryContent;
  }

  public async getCadetsEpisode(mId: string): Promise<CadetsEpisode> {
    const collection = await this.getCollection();
    const {
      data: { cadets_episode },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            cadets_episode: 1,
          },
        },
      }
    );

    return cadets_episode[mId] as CadetsEpisode;
  }

  public async getTalkBook(mId: string): Promise<TalkBook> {
    const collection = await this.getCollection();
    const {
      data: { talk_book },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            talk_book: 1,
          },
        },
      }
    );

    return talk_book[mId] as TalkBook;
  }

  public async getTalkBookList(): Promise<TalkBook[]> {
    const collection = await this.getCollection();
    const {
      data: { talk_book },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            talk_book: 1,
          },
        },
      }
    );

    const ret: TalkBook[] = _.map(Object.keys(talk_book), (key) => {
      return talk_book[key];
    });

    return ret;
  }

  public async getTalkCommContentByMid(
    contentMid: string
  ): Promise<TalkCommContent> {
    const collection = await this.getCollection();
    const {
      data: { talk_comm_content },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            talk_comm_content: 1,
          },
        },
      }
    );

    return talk_comm_content[contentMid];
  }

  public async getTalkLessonType(mid: string): Promise<TalkLessonType> {
    const collection = await this.getCollection();
    const {
      data: { talk_lesson_type },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            talk_lesson_type: 1,
          },
        },
      }
    );

    return talk_lesson_type[mid];
  }
  public async getContent(mid: number): Promise<Content> {
    const collection = await this.getCollection();
    const { data } = await collection.findOne({
      versionCode: this.versionCode,
    });

    const { content } = data;

    return content[mid];
  }
  public async getEslReward(mid: number): Promise<EslReward> {
    const collection = await this.getCollection();
    const {
      data: { esl_reward },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            esl_reward: 1,
          },
        },
      }
    );

    return esl_reward[mid];
  }

  public async getAllEslLessonPages(): Promise<EslLessonPage[]> {
    const collection = await this.getCollection();
    const {
      data: { esl_lesson_page },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            esl_lesson_page: 1,
          },
        },
      }
    );

    const list: EslLessonPage[] = _.map(Object.keys(esl_lesson_page), (key) => {
      return esl_lesson_page[key];
    });

    return list;
  }

  public async getEslLessonPage(mid: string): Promise<EslLessonPage | null> {
    const collection = await this.getCollection();
    const {
      data: { esl_lesson_page },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            esl_lesson_page: 1,
          },
        },
      }
    );

    return esl_lesson_page[mid] as EslLessonPage | null;
  }

  public async getGeniusTopic(mid: number): Promise<GeniusTopic> {
    const collection = await this.getCollection();
    const {
      data: { genius_topic },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            genius_topic: 1,
          },
        },
      }
    );

    return genius_topic[mid];
  }

  public async getQuickClipsContents(mid: number): Promise<QuickClipsContents> {
    const collection = await this.getCollection();
    const {
      data: { quick_clips_contents },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            quick_clips_contents: 1,
          },
        },
      }
    );

    return quick_clips_contents[mid];
  }

  public async getBook(mid: number): Promise<Book> {
    const collection = await this.getCollection();
    const {
      data: { books },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            books: 1,
          },
        },
      }
    );

    return books[mid];
  }

  public async getMediaboxBook(mid: number): Promise<MediaboxBook> {
    const collection = await this.getCollection();
    const {
      data: { books_mediabox },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            books_mediabox: 1,
          },
        },
      }
    );

    return books_mediabox[mid];
  }

  public async getSong(mid: number): Promise<Song> {
    const collection = await this.getCollection();
    const {
      data: { songs },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            songs: 1,
          },
        },
      }
    );

    return songs[mid];
  }
  public async getMediaboxSong(mid: number): Promise<MediaboxSong> {
    const collection = await this.getCollection();
    const {
      data: { songs_mediabox },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            songs_mediabox: 1,
          },
        },
      }
    );

    return songs_mediabox[mid];
  }

  public async getAppIdentification(mid: string): Promise<AppIdentification> {
    const collection = await this.getCollection();
    const {
      data: { app_identification },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            app_identification: 1,
          },
        },
      }
    );

    return app_identification[mid];
  }

  public async getEslRewardCount() {
    const collection = await this.getCollection();
    const {
      data: { esl_reward },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            esl_reward: 1,
          },
        },
      }
    );

    return Object.keys(esl_reward).length;
  }

  public async getEslLesson(mid: string): Promise<EslLesson> {
    const collection = await this.getCollection();
    const {
      data: { esl_lesson },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            esl_lesson: 1,
          },
        },
      }
    );

    return esl_lesson[mid];
  }

  public async getAllEslLessons(): Promise<EslLesson[]> {
    const collection = await this.getCollection();
    const {
      data: { esl_lesson },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            esl_lesson: 1,
          },
        },
      }
    );

    return _.map(Object.keys(esl_lesson), (key) => {
      return esl_lesson[key];
    }) as EslLesson[];
  }

  public async getEslLessonMidByProfileLevel(
    level: number
  ): Promise<string | undefined> {
    const list = await this.getAllEslLessons();

    for (const item of list) {
      if (item.lesson_day === level) return item.esl_lesson_mid;
    }

    return undefined;
  }

  public async getEslLessonPageMidsByEslLessonMid(eslLessonMid: eProfileLevel) {
    const collection = await this.getCollection();
    const {
      data: { esl_lesson_page },
    } = await collection.findOne(
      { versionCode: this.versionCode },
      {
        projection: {
          data: {
            esl_lesson_page: 1,
          },
        },
      }
    );

    return esl_lesson_page[eslLessonMid.toString()] as EslLessonPage;
  }
}
