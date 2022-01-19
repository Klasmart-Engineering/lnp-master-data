import _ from "lodash";

import { EslLesson, EslLessonPage, MasterDataExtension } from "./type";

type ErrorNotifier = (message: string) => void;

export const preprocessActivity = (
  mstESL: EslLessonPage[],
  errorNotifier: ErrorNotifier | undefined = undefined
) => {
  // ESL ContentsSequece
  const sEslFirstContentsMid =
    "activity.launcher.rhyme-lesson1-song-30006.korea.2020";

  const eslSeqList = [];
  const eslLesson = {};

  let contentsMid = sEslFirstContentsMid;
  let contents: EslLessonPage = null;

  let lastLessonMid = "";

  const checkContentsLoop = {};

  while (true) {
    contents = _.find(mstESL, (v) => v.esl_lesson_page_mid === contentsMid); // mstESL[contentsMid];
    if (!contents && errorNotifier) {
      errorNotifier(
        "MasterData info not Found - esl_lesson_page - sContentMid : " +
          contentsMid
      );
      break;
    }

    const lessonMId = contents.esl_lesson_mid;
    if (lessonMId === "" && errorNotifier) {
      errorNotifier(
        "MasterData info(esl_lesson_mid) is Wrong - esl_lesson_page - sContentMid : " +
          contentsMid
      );
      break;
    }

    const nextContentsMid = contents.content_next;
    if (nextContentsMid === "" && errorNotifier) {
      errorNotifier(
        "MasterData info(content_next) is Wrong - esl_lesson_page - sContentMid : " +
          contentsMid
      );
      break;
    }

    if (nextContentsMid in checkContentsLoop) {
      if (errorNotifier)
        errorNotifier(
          "MasterData info(content_next) is duplicated - esl_lesson_page - content_next : " +
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
    "MasterDataEx.ESL_SEQ - esl_lesson_page - listCount: " + eslSeqList.length
  );

  console.log("MasterDataEx.ESL_SEQ_START: " + sEslFirstContentsMid);

  console.log(
    "MasterDataEx.ESL_LAST_LESSON - esl_lesson - lastLessonMid: " +
      lastLessonMid
  );

  console.log(
    "MasterDataEx.ESL_LESSON - mapCount: " + Object.keys(eslLesson).length
  );

  return {
    ESL_SEQ: eslSeqList,
    ESL_SEQ_START: sEslFirstContentsMid,
    ESL_LAST_LESSON: lastLessonMid,
    ESL_LESSON: eslLesson,
  };
};

const preprocessLesson = (lessons: EslLesson[]) => {
  const ESL_LESSON_INDEX_MAP: { [key: string]: number } = {};

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    ESL_LESSON_INDEX_MAP[lesson.esl_lesson_mid] = lesson.lesson_index;
  }

  // console.log(JSON.stringify({ ESL_LESSON_INDEX_MAP }, null, 2));

  return ESL_LESSON_INDEX_MAP;
};

export const getMasterDataExtensionData = (
  mstESL: EslLessonPage[],
  lessons: EslLesson[],
  errorNotifier: ErrorNotifier | undefined = undefined
): MasterDataExtension => {
  const { ESL_SEQ, ESL_SEQ_START, ESL_LAST_LESSON, ESL_LESSON } =
    preprocessActivity(mstESL);

  const ESL_LESSON_INDEX_MAP = preprocessLesson(lessons);

  return {
    ESL_SEQ,
    ESL_SEQ_START,
    ESL_LAST_LESSON,
    ESL_LESSON,
    ESL_LESSON_INDEX_MAP,
  };
};
