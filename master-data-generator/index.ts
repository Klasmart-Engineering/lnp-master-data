import "dotenv/config";

import _ from "lodash";
import svnUltimate from "node-svn-ultimate";
import shell from "shelljs";
import { promisify } from "util";

import { EslLesson, EslLessonPage } from "../src";
import {
  csErrorDataExtractor,
  csMasterDataExtractor,
  csMsgDataExtractor,
} from "./csExtractor";
import extractXml, { validateData } from "./extractXml";
import {
  goErrorDataExtractor,
  goMasterDataExtractor,
  goMsgTypeDataExtractor,
} from "./goExtractor";
import {
  jsErrorDataExtractor,
  jsMasterDataExtractor,
  jsMsgDataExtractor,
} from "./jsExtractor";
import { uploadToMongoDB } from "./mongoUploader";
import {
  tsErrorDataExtractor,
  tsMasterDataExtractor,
  tsMsgDataExtractor,
} from "./tsExtractor";

const checkout = promisify(svnUltimate.commands.checkout);

const main = async () => {
  const SVN_HOSTNAME = process.env.SVN_HOSTNAME;
  const SVN_PATHNAME = process.env.SVN_PATHNAME;

  if (!SVN_HOSTNAME || !SVN_PATHNAME) {
    throw new Error(`Environment is required: SVN_HOSTNAME and SVN_PATHNAME`);
  }

  if (process.env.MASTER_DATA_SVN_CHECKOUT === "1") {
    process.env.MASTER_DATA_URL = `${SVN_HOSTNAME}/${SVN_PATHNAME}`;

    console.log("=================================");
    console.log(`${process.env.MASTER_DATA_URL}`);
    console.log("=================================");

    await checkout(
      process.env.MASTER_DATA_URL,
      process.env.MASTER_DATA_BUILD_DIR + "/" + SVN_PATHNAME,
      {
        username: process.env.MASTER_DATA_SVN_ID, // same as --username
        password: process.env.MASTER_DATA_SVN_PASS, // same as --password
      }
    );
    console.log("Checkout complete");
  }

  const sPath = `${process.env.MASTER_DATA_BUILD_DIR}/${SVN_PATHNAME}/${process.env.MASTER_DATA_SUB_DIR}`;
  const timestamp = Date.now();
  const dPath = `${process.env.MASTER_DATA_BUILD_DIR}/output/${SVN_PATHNAME}/${timestamp}`;
  shell.mkdir("-p", dPath);

  console.log("Output Directory================");
  console.log(dPath);
  console.log("=================================");

  const generateCs = false;
  const generateGo = false;
  const generateJs = false;
  const generateTs = false;
  const enabledMongoDB = process.env.MONGODB_URL !== undefined;
  console.log(`MongoDB Upload enabled: ${enabledMongoDB}`);

  const {
    aTableNames,
    asDefineNameNames,
    aMidColumnNames,
    aMidColumnTables,
    aListColumnNames,
    aListColumnTables,
    mstDataAll,
    mstDataServer,
  } = await extractXml({ sPath, dPath, generateCs, generateGo });

  validateData({
    aListColumnTables,
    aMidColumnTables,
    aListColumnNames,
    aMidColumnNames,
    mstDataAll,
  });

  if (enabledMongoDB) {
    const mstESL: EslLessonPage[] = _.map(
      Object.keys(mstDataServer.esl_lesson_page),
      (key) => {
        return mstDataServer.esl_lesson_page[key];
      }
    );

    const lessons = _.map(Object.keys(mstDataServer.esl_lesson), (key) => {
      return mstDataServer.esl_lesson[key];
    }) as EslLesson[];

    await uploadToMongoDB({
      versionCode: timestamp.toString(),
      mstESL,
      lessons,
      mstDataServer,
      serverParam: {
        url: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DB_NAME,
        collectionName: process.env.MONGODB_COLLECTION_MASTER,
      },
      exServerParam: {
        url: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DB_NAME,
        collectionName: process.env.MONGODB_COLLECTION_EXTENSION,
      },
    });
  }

  // const targetTableName = `master-data-${timestamp}`;

  // const sql = fs.readFileSync(`${dPath}/master_data.sql`).toString();
  // const result = await query({ query: sql, targetTableName });

  // console.log({ targetTableName, result });

  if (generateCs) {
    csMasterDataExtractor({
      dPath: `${dPath}/cs/MasterData.cs`,
      aTableNames,
      asDefineNameNames,
    });

    csErrorDataExtractor({
      dPath: `${dPath}/cs/ErrCode.cs`,
      mstDataServer,
    });

    csMsgDataExtractor({
      dPath: `${dPath}/cs/MsgType.cs`,
      mstDataServer,
    });
  }

  if (generateGo) {
    goMasterDataExtractor({
      dPath: `${dPath}/mst_data.go`,
      aTableNames,
    });

    goErrorDataExtractor({
      mstDataServer,
      dPath: "./output/enum_err_code.go",
    });

    goMsgTypeDataExtractor({
      mstDataServer,
      dPath: "./output/enum_msg_type.go",
    });
  }

  if (generateJs) {
    jsMasterDataExtractor(
      {
        uncompressed: `${dPath}/masterdata.json`,
        compressed: `${dPath}/masterdata.uncompressed.json`,
      },
      mstDataServer
    );

    jsErrorDataExtractor({
      dPath: `${dPath}/err_code.js`,
      mstDataServer,
    });

    jsMsgDataExtractor({
      dPath: `${dPath}/msg_type.js`,
      mstDataServer,
    });
  }

  if (generateTs) {
    tsMasterDataExtractor({
      dPath: `./output`,
      mstDataServer,
    });

    tsErrorDataExtractor({
      dPath: "./output/err_code.ts",
      mstDataServer,
    });

    tsMsgDataExtractor({
      dPath: "./output/msg_type.ts",
      mstDataServer,
    });
  }

  console.log("\nOK");
  console.log("=================================");
  console.log(`Output data directory: ${dPath}`);
  console.log("=================================");

  process.exit(0);
};

main();

// if (process.argv.length < 3) {
//   console.log('Usage: node converter.js stage');
//   process.exit(1);
// }
