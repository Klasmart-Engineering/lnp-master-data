import {
  EslLesson,
  EslLessonPage,
  getMasterDataExtensionData,
  MasterDataExMongo,
  MasterDataMongo,
  MasterDataMongoParam,
} from "../src";

export const uploadToMongoDB = async ({
  versionCode,
  mstESL,
  lessons,
  mstDataServer,
  serverParam,
  exServerParam,
}: {
  versionCode: string;
  mstESL: EslLessonPage[];
  lessons: EslLesson[];
  mstDataServer: any;
  serverParam: MasterDataMongoParam;
  exServerParam: MasterDataMongoParam;
}) => {
  const masterdata_ex = getMasterDataExtensionData(mstESL, lessons);

  const uploader = new MasterDataMongo(serverParam, versionCode);

  const extensionUploader = new MasterDataExMongo(exServerParam, versionCode);

  await uploader.upload(mstDataServer);

  await extensionUploader.upload(masterdata_ex);
};
