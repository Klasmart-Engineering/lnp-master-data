import * as fs from 'fs';

const extraDataProcess = (mst: any) => {
  const sEslFirstContentsMid =
    'activity.launcher.rhyme-lesson1-song-30006.korea.2020';

  const eslSeqList: any[] = [];
  const eslLesson: any = {};
  const mstESL = mst.esl_lesson_page;

  let contentsMid = sEslFirstContentsMid;
  let contents: any = null;

  let lastLessonMid = '';

  const checkContentsLoop = {};

  while (true) {
    contents = mstESL[contentsMid];

    const lessonMId = contents.esl_lesson_mid;
    if (lessonMId === '') {
      console.log(
        'MasterData info(esl_lesson_mid) is Wrong - esl_lesson_page - sContentMid : ' +
          contentsMid
      );
      break;
    }

    const nextContentsMid = contents.content_next;
    if (nextContentsMid === '') {
      console.log(
        'MasterData info(content_next) is Wrong - esl_lesson_page - sContentMid : ' +
          contentsMid
      );
      break;
    }

    if (nextContentsMid in checkContentsLoop) {
      console.log(
        'MasterData info(content_next) is duplicated - esl_lesson_page - content_next : ' +
          nextContentsMid
      );
      break;
    } else {
      checkContentsLoop[nextContentsMid] = contentsMid;
    }

    eslSeqList.push({
      contentsMId: contentsMid,
      lessonMId: lessonMId,
    });

    if (lessonMId in eslLesson === false) {
      eslLesson[lessonMId] = [];
    }

    eslLesson[lessonMId].push(contentsMid);

    if (nextContentsMid === sEslFirstContentsMid) {
      lastLessonMid = lessonMId;
      break;
    }

    contentsMid = nextContentsMid;
  }

  console.log(
    'MasterData - esl_lesson_page - listCount : ' + eslSeqList.length
  );

  const ESLRewardCount = Object.keys(mst.esl_reward).length;

  console.log('MasterData - esl_lesson - lastLessonMid : ' + lastLessonMid);
  console.log('MasterData - esl_reward - Count : ' + ESLRewardCount);

  const ret = {
    ESL_SEQ: eslSeqList,
    ESL_LESSON: eslLesson,
  };

  return ret;
};

export const tsMasterDataExtractor = ({
  dPath,
  mstDataServer,
}: {
  dPath: string;
  mstDataServer: any;
}) => {
  // uncompressed: `./output/masterdata.json`,
  // compressed: `./output/masterdata.uncompressed.json`,

  fs.writeFileSync(
    `${dPath}/master.compressed.json`,
    JSON.stringify(mstDataServer),
    'utf8'
  );
  fs.writeFileSync(
    `${dPath}/master.json`,
    JSON.stringify(mstDataServer, null, 4),
    'utf8'
  );

  const extra = extraDataProcess(mstDataServer);

  fs.writeFileSync(
    `${dPath}/master_ex.json`,
    JSON.stringify(extra, null, 4),
    'utf8'
  );

  // for (const key in mstDataServer) {
  //   fs.writeFileSync(
  //     `${dPath}/${key}.master.compressed.json`,
  //     JSON.stringify(mstDataServer[key]),
  //     'utf8'
  //   );
  //   fs.writeFileSync(
  //     `${dPath}/${key}.master.json`,
  //     JSON.stringify(mstDataServer[key], null, 4),
  //     'utf8'
  //   );
  // }
};

export const tsErrorDataExtractor = ({ dPath, mstDataServer }) => {
  let sErrCodeTs = 'export enum eErrCode {\n';

  for (const sKey in mstDataServer.error) {
    sErrCodeTs +=
      '  ' + mstDataServer.error[sKey].enum_str + '= ' + sKey + ',\n';
  }
  sErrCodeTs += '  END= 9999\n}';

  fs.writeFileSync(dPath, sErrCodeTs, 'utf8');
};

export const tsMsgDataExtractor = ({ dPath, mstDataServer }) => {
  let sMsgTypeTs = 'export enum eMsgType {\n';

  for (const sKey in mstDataServer.message) {
    sMsgTypeTs +=
      '  ' + mstDataServer.message[sKey].enum_str + '= ' + sKey + ',\n';
  }
  sMsgTypeTs += '  END= 9999\n}';

  fs.writeFileSync(dPath, sMsgTypeTs, 'utf8');
};
