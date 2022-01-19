import { eProfileLevel, eSysLang } from "./enum";

export interface IMasterData {
  getEmail(iMsgType: number, iSysLang: eSysLang): Promise<Email>;
  getBadanamuStoryContent(contentId: string): Promise<BadanamuStoryContent>;
  getCadetsEpisode(mId: string): Promise<CadetsEpisode>;
  getTalkBook(mId: string): Promise<TalkBook>;
  getTalkBookList(): Promise<TalkBook[]>;
  getTalkCommContentByMid(contentMid: string): Promise<TalkCommContent>;
  getTalkLessonType(mid: string): Promise<TalkLessonType>;
  getContent(mid: number): Promise<Content>;
  getEslReward(mid: number): Promise<EslReward>;
  getAllEslLessonPages(): Promise<EslLessonPage[]>;
  getEslLessonPage(mid: string): Promise<EslLessonPage | null>;
  getGeniusTopic(mid: number): Promise<GeniusTopic>;
  getQuickClipsContents(mid: number): Promise<QuickClipsContents>;
  getBook(mid: number): Promise<Book>;
  getMediaboxBook(mid: number): Promise<MediaboxBook>;
  getSong(mid: number): Promise<Song>;
  getMediaboxSong(mid: number): Promise<MediaboxSong>;
  getAppIdentification(mid: string): Promise<AppIdentification>;
  getEslRewardCount(): Promise<number>;
  getEslLesson(mid: string): Promise<EslLesson>;
  getAllEslLessons(): Promise<EslLesson[]>;
  getEslLessonMidByProfileLevel(level: eProfileLevel): Promise<string>;
}

export interface MasterDataExtension {
  ESL_SEQ: {
    contentsMId: string;
    lessonMId: string;
  }[];
  ESL_SEQ_START: string;
  ESL_LAST_LESSON: string;
  ESL_LESSON: {
    [key: string]: string[];
  };
  ESL_LESSON_INDEX_MAP: { [key: string]: number };
}

export interface BadanamuStoryContent {
  badanamu_stories_mid: number;
  version: number;
  category: string;
  episode_index: string;
  activity_id: string;
  episode_title: string;
  episode_description: string;
  learning_points: string;
  episode_thumbnail: string;
  content_ids: string;
  state: string;
  pdf_url: string;
}

export interface CadetsEpisode {
  cadets_episode_mid: number;
  version: number;
  season_id: number;
  episode_id: number;
  episode_name: string;
  episode_description: string;
  episode_subject: string;
  episode_mainimage: string;
  content_ids: string;
  state: string;
  mark: string;
  pdf_url: string;
  product_id: string;
}

export interface TalkBook {
  talk_book_mid: number;
  version: number;
  talk_book_title: string;
  talk_book_unlock: number;
  talk_title_img: string;
}

export interface TalkCommContent {
  talk_comm_content_mid: string;
  version: number;
  type_info: string;
  talk_lesson_type_mid: string;
  activity_identifier: string;
  content_type_mid: number;
  activity_index: string;
  market_info: string;
  year_info: number;
  content_open: number;
}

export interface TalkLessonType {
  talk_lesson_type_mid: string;
  version: number;
  talk_book_mid: number;
}

export interface Content {
  content_mid: number;
  version: number;
  course_mid: number;
  subject_mid: number;
  lesson_idex: number;
  content_type_mid: number;
  content_idex: number;
  content_next: number;
  content_open: number;
}

export interface AppAsset {
  app_asset_mid: string;
  version: number;
  is_free: number;
  product_ids: string[];
}

export interface EslReward {
  esl_reward_mid: number;
  version: number;
  activity_id: string;
  program_name: string;
  season_id: number;
  episode_id: string;
  episode_name: string;
  stream_url: string;
  episode_image: string;
  subtitle_file: string;
}

export interface EslLesson {
  esl_lesson_mid: string;
  version: number;
  app_name: string;
  lesson_num_id: string;
  color_info: string[];
  lesson_name: string;
  Keyword: string[];
  layout_type: number;
  color_activity: string[];
  content_open: number;
  free_open: number;
  btn_color: string[];
  lesson_level: number;
  lesson_day: number;
  lesson_index: number;
}

export interface EslLessonPage {
  esl_lesson_page_mid: string;
  version: number;
  esl_lesson_mid: string;
  activity_identifier: string;
  content_type_mid: number;
  content_index: number;
  market_info: string;
  year_info: number;
  lesson_loop: string;
  content_next: string;
  content_open: number;
  app_identification_mid: string;
  content_thumb: string;
  bundle_thumb: string;
  bundle: string[];
  bundle_common: string[];
  stream_url: string;
  stream_open: number;
}

export interface GeniusTopic {
  genius_topic_mid: number;
  version: number;
  geniustopic_name: string;
  geniustopic_sfx_path: string;
  geniustopic_label: number;
}

export interface QuickClipsContents {
  quick_clips_contents_mid: string;
  version: number;
  contents_id: string;
  content_name: string;
  clip_image: string;
  video_url: string;
  stars: number;
  content_type: string;
  difficulty: string;
  status: string;
  mark: string;
  reward: number;
}

export interface Book {
  books_mid: number;
  version: number;
  file_name: string;
  name: string;
  category: string;
  difficult: string;
  books_content_open: number;
}

export interface MediaboxBook {
  books_mediabox_mid: number;
  version: number;
  oid: number[];
  category_id: number;
  file_name: string;
  name: string;
  category: string;
  difficult: string;
}

export interface Song {
  app_identification_mid: string;
  version: 1;
  identification_google: string;
  identification_apple: string;
  google_play_uri: string;
  app_store_uri: string;
  app_content_id: string;
  use_app: 1;
  beta_versions_google: string[];
  prod_versions_google: string[];
  beta_versions_apple: string[];
  prod_versions_apple: string[];
  ceo_versions: string[];
  embed_versions: string[];
}

export interface MediaboxSong {
  songs_mediabox_mid: number;
  version: number;
  oid: number[];
  category_id: number;
  file_name: string;
  name: string;
  category: string;
  release_date: string;
  length: string;
  view_count: number;
  customize: string;
  is_free: string;
}

export interface AppIdentification {
  app_identification_mid: string;
  version: number;
  identification_google: string;
  identification_apple: string;
  google_play_uri: string;
  app_store_uri: string;
  app_content_id: string;
  use_app: number;
  beta_versions_google: string[];
  prod_versions_google: string[];
  beta_versions_apple: string[];
  prod_versions_apple: string[];
  ceo_versions: string[];
  embed_versions: string[];
}

export interface Email {
  email_mid: string;
  version: number;
  subject: string;
  contents_html: string[];
  contents_text: string[];
  verify_front_html: string;
  verify_back_html: string;
  verify_front_text: string;
  verify_back_text: string;
  href_front: string;
  href_back: string;
}
