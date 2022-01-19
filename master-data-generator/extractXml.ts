import * as et from "elementtree";
import * as fs from "fs";
import * as SQLite3 from "sqlite3";

import {
  bIsCorrectAccess,
  bIsCorrectType,
  bIsNumberType,
  bIsValidValue,
  defaultValue,
  sCamelCase,
  sCsharpType,
  sCsharpTypeSqlite3,
  sGoLangType,
  sSqlite3Type,
} from "./func";
import { Element } from "elementtree";
import { open } from "sqlite";

const sqlite3 = SQLite3.verbose();

const extractXml = async ({
  sPath,
  dPath,
  generateCs = true,
  generateGo = true,
}) => {
  const sSqlFile = `${dPath}/master_data.sql`;
  if (fs.existsSync(sSqlFile)) {
    fs.unlinkSync(sSqlFile);
  }

  const sDbFile = `${dPath}/master_data.bytes`;
  if (fs.existsSync(sDbFile)) {
    fs.unlinkSync(sDbFile);
  }

  console.log({ sSqlFile, sDbFile });

  // const db = new sqlite3.Database(sDbFile);
  const db = await open({ filename: sDbFile, driver: sqlite3.Database });

  // db.on("trace", (data) => {
  //   console.log({ data });
  // });

  await db.run("PRAGMA journal_mode = PERSIST");
  await db.run("BEGIN TRANSACTION");

  const mstDataAll = {} as any;
  const mstDataServer = {} as any;

  let sTableName = "";
  const aTableNames = [] as string[];

  let sDefineName = "";
  const asDefineNameNames = [] as string[];

  const aMidColumnNames = [] as string[];
  const aMidColumnTables = [] as string[];

  const aListColumnNames = [] as string[];
  const aListColumnTables = [] as string[];

  const sVersionColumnName = "version";

  const aFiles = fs.readdirSync(sPath);
  for (let i = 0; i < aFiles.length; ++i) {
    if (aFiles[i].split(".").pop() !== "xml") {
      continue;
    }
    const sFile = aFiles[i];

    const aColumnAccesses = [] as string[];

    const aColumnTypes = [] as string[];
    const aServerColumnTypes = [] as string[];
    const aClientColumnTypes = [] as string[];

    const aColumnNames = [] as string[];
    const aServerColumnNames = [] as string[];
    const aClientColumnNames = [] as string[];

    const sXml = fs.readFileSync(sPath + "/" + sFile, "utf8").toString();

    const tree = et.parse(sXml);
    const root = tree.getroot();

    const worksheets = root.findall("Worksheet");
    for (let j = 0; j < worksheets.length; ++j) {
      const worksheet = worksheets[j];
      const splitList = worksheet.get("ss:Name")!.split("|");

      if (splitList.length <= 1) {
        console.log(
          "ERROR : " + worksheet.get("ss:Name") + ", not found Define"
        );
      }
      sDefineName = splitList[0];
      sTableName = splitList[1];
      console.log(sFile + " : " + ", " + sDefineName + ", " + sTableName);

      if (aTableNames.indexOf(sTableName) > -1) {
        console.log("ERROR : " + sTableName + ", masterName already exists");
        process.exit(1);
      }
      aTableNames.push(sTableName);
      asDefineNameNames.push(sDefineName);

      const mstTable = {};

      aColumnAccesses.length = 0;
      aColumnTypes.length = 0;
      aColumnNames.length = 0;

      let iRowIndex = 0;
      let iColumnIdx = 0;
      let iColumnLen = 0;

      const rows = worksheet.find("Table")!.findall("Row");
      let cells = null as Element[] | null;

      let data = null as Element | null;
      let sDataText = "";

      let aFonts = [] as Element[];
      let bHasDataStarted = false;

      const lastVersionInfo = {};

      for (let k = 0; k < rows.length; ++k) {
        const row = rows[k];

        if (iRowIndex === 0) {
          // column_access
          cells = row.findall("Cell");
          for (let m = 0; m < cells.length; ++m) {
            data = cells[m].find("Data");
            if (!data || !data.text) {
              console.log("ERROR : " + sTableName + ", invalid access");
            }
            sDataText = data!.text as string;

            if (sDataText === "END_OF_COLUMNS") {
              break;
            }

            if (bIsCorrectAccess(sDataText) === false) {
              console.log(
                "ERROR : " + sTableName + ", invalid access, " + sDataText
              );
              process.exit(1);
            }

            aColumnAccesses.push(sDataText);
          }

          // // this happens a lot
          // if (aColumnAccesses[0] !== "common") {
          //   aColumnAccesses[0] = "common";
          // }

          // if (aColumnAccesses[1] !== "common") {
          //   aColumnAccesses[1] = "common";
          // }

          iColumnLen = aColumnAccesses.length;
        } else if (iRowIndex === 1) {
          // column_type
          iColumnIdx = 0;

          cells = row.findall("Cell");
          for (let m = 0; m < cells.length; ++m) {
            if (iColumnIdx === iColumnLen) {
              break;
            }

            data = cells[m].find("Data");
            if (!data || !data.text) {
              console.log(
                "ERROR : " +
                  sTableName +
                  ", invalid type, " +
                  aColumnNames[m] +
                  ", " +
                  data!.text
              );
            }
            sDataText = data!.text as string;

            if (bIsCorrectType(sDataText) === false) {
              console.log(
                "ERROR : " +
                  sTableName +
                  ", invalid type, " +
                  aColumnNames[m] +
                  ", " +
                  sDataText
              );
              process.exit(1);
            }

            aColumnTypes.push(sDataText);
            ++iColumnIdx;
          }

          if (aColumnAccesses.length !== aColumnTypes.length) {
            console.log(
              "ERROR : " +
                sTableName +
                ", column_access_count and column_type_count mismatch"
            );
            process.exit(1);
          }

          if (
            aColumnTypes[0] !== "int(11)" &&
            aColumnTypes[0] !== "bigint(20)" &&
            aColumnTypes[0] !== "varchar(255)"
          ) {
            console.log("ERROR : " + sTableName + ", invalid type for mid");
            process.exit(1);
          }
        } else if (iRowIndex === 2) {
          // column_description
          ++iRowIndex;
          continue;
        } else if (iRowIndex === 3) {
          // column_name
          iColumnIdx = 0;

          cells = row.findall("Cell");

          if (cells.length < 3) {
            console.log("ERROR : " + sTableName + ", Not Enough Column Count");
            process.exit(1);
          }

          for (let m = 0; m < cells.length; ++m) {
            if (iColumnIdx === iColumnLen) {
              break;
            }

            data = cells[m].find("Data");
            if (data === null) {
              aFonts = cells[m].findall("*/Font");

              sDataText = "";
              for (let n = 0; n < aFonts.length; ++n) {
                sDataText += aFonts[n].text;
              }
            } else if (data.text !== null) {
              sDataText = data.text.toString();
            }

            if (m === 1 && sDataText !== sVersionColumnName) {
              console.log(
                "ERROR : " + sTableName + ", Not Exist version - " + sDataText
              );
              process.exit(1);
            }

            aColumnNames.push(sDataText);
            if (m > 0 && aColumnNames[m].indexOf("_mid") > -1) {
              if (sDataText.indexOf("list") > -1) {
                aListColumnNames.push(aColumnNames[m]);
                aListColumnTables.push(sTableName);
              } else {
                aMidColumnNames.push(aColumnNames[m]);
                aMidColumnTables.push(sTableName);
              }
            }

            ++iColumnIdx;
          }

          if (aColumnAccesses.length !== aColumnNames.length) {
            console.log(
              "ERROR : " +
                sTableName +
                ", column_access_count and column_name_count mismatch"
            );
            process.exit(1);
          }
        } else {
          // data
          if (bHasDataStarted === false) {
            bHasDataStarted = true;

            aServerColumnNames.length = 0;
            aServerColumnTypes.length = 0;

            aClientColumnNames.length = 0;
            aClientColumnTypes.length = 0;

            for (let p = 0; p < aColumnAccesses.length; ++p) {
              if (aColumnAccesses[p] === "design") {
                continue;
              } else if (aColumnAccesses[p] === "server") {
                aServerColumnNames.push(aColumnNames[p]);
                aServerColumnTypes.push(aColumnTypes[p]);

                aClientColumnNames.push(aColumnNames[p]);
                aClientColumnTypes.push(aColumnTypes[p]);
              } else if (aColumnAccesses[p] === "client") {
                aClientColumnNames.push(aColumnNames[p]);
                aClientColumnTypes.push(aColumnTypes[p]);
              } else if (aColumnAccesses[p] === "common") {
                aServerColumnNames.push(aColumnNames[p]);
                aServerColumnTypes.push(aColumnTypes[p]);

                aClientColumnNames.push(aColumnNames[p]);
                aClientColumnTypes.push(aColumnTypes[p]);
              }
            }

            if (generateCs) {
              generateCsMasterTable({
                dPath: `${dPath}/${sCamelCase(sTableName)}.cs`,
                sTableName,
                aClientColumnNames,
                aClientColumnTypes,
              });

              generateCsMasterInfo({
                dPath: `${dPath}/${sCamelCase(sTableName)}.cs`,
                sTableName,
                aClientColumnNames,
                aClientColumnTypes,
              });
            }

            if (generateGo) {
              generateGoMasterInfo({
                dPath: "./output/mst_data.go",
                sTableName,
                aServerColumnNames,
                aServerColumnTypes,
              });
            }

            let sCreateTable = `DROP TABLE IF EXISTS \`${sTableName}\`;`;
            sCreateTable += "create table `" + sTableName + "`(";
            for (let p = 0; p < aClientColumnNames.length; ++p) {
              sCreateTable +=
                "`" +
                aClientColumnNames[p] +
                "`" +
                " " +
                sSqlite3Type(aClientColumnTypes[p]);

              if (p === 0) {
                sCreateTable += " PRIMARY KEY";
              }

              if (p < aClientColumnNames.length - 1) {
                sCreateTable += ", ";
              }
            }
            sCreateTable += ")";

            // console.log(createTable)
            fs.appendFileSync(sSqlFile, "\n" + sCreateTable + ";\n\n", "utf8");

            await db.exec(sCreateTable);
          }

          iColumnIdx = 0;
          let sDataMid = "";
          let blSkipSqlInsertRow = false;

          cells = row.findall("Cell");
          for (let m = 0; m < cells.length; ++m) {
            const cell = cells[m];
            const cellSsIndex = cell.get("ss:Index");

            if (sDataMid !== "" && cellSsIndex !== null) {
              const iSsIndex = parseInt(cellSsIndex!) - 1;

              while (iColumnIdx < iSsIndex && iColumnIdx < iColumnLen) {
                mstTable[sDataMid][aColumnNames[iColumnIdx]] = defaultValue(
                  aColumnTypes[iColumnIdx]
                );
                ++iColumnIdx;
              }
            }

            if (iColumnIdx === iColumnLen) {
              break;
            }

            sDataText = "";
            data = cells[m].find("Data");
            if (data === null) {
              aFonts = cells[m].findall("*/Font");

              sDataText = "";
              for (let n = 0; n < aFonts.length; ++n) {
                sDataText += aFonts[n].text;
              }
            } else if (data.text !== null) {
              sDataText = data.text.toString();
            }

            if (sDataText === "END_OF_DATA") {
              break;
            }

            if (iColumnIdx === 0) {
              sDataMid = sDataText;

              if (aColumnTypes[iColumnIdx] === "int(11)") {
                if (
                  bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
                ) {
                  console.log(
                    "ERROR : " +
                      sTableName +
                      ", " +
                      sDataMid +
                      ", " +
                      aColumnNames[iColumnIdx] +
                      ", invalid int(11)"
                  );
                  process.exit(1);
                }
              } else if (aColumnTypes[iColumnIdx] === "bigint(20)") {
                if (
                  bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
                ) {
                  console.log(
                    "ERROR : " +
                      sTableName +
                      ", " +
                      sDataMid +
                      ", " +
                      aColumnNames[iColumnIdx] +
                      ", invalid bigint(20)"
                  );
                  process.exit(1);
                }
              } else if (aColumnTypes[iColumnIdx] === "varchar(255)") {
                if (
                  bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
                ) {
                  console.log(
                    "ERROR : " +
                      sTableName +
                      ", " +
                      sDataMid +
                      ", " +
                      aColumnNames[iColumnIdx] +
                      ", data_size is bigger than 255"
                  );
                  process.exit(1);
                }
              }

              if (!mstTable[sDataMid]) {
                mstTable[sDataMid] = {};

                if (["int(11)", "bigint(20)"].indexOf(aColumnTypes[0]) > -1) {
                  mstTable[sDataMid][aColumnNames[0]] = parseInt(sDataMid);
                } else {
                  mstTable[sDataMid][aColumnNames[0]] = sDataMid;
                }

                for (let n = 1; n < aColumnNames.length; ++n) {
                  mstTable[sDataMid][aColumnNames[n]] = defaultValue(
                    aColumnTypes[n]
                  );
                }
              }
            } else if (iColumnIdx === 1) {
              // version infomation
              if (aColumnTypes[iColumnIdx] !== "int(11)") {
                console.log(
                  "ERROR : " +
                    sTableName +
                    ", " +
                    sDataMid +
                    ", " +
                    aColumnNames[iColumnIdx] +
                    ", invalid version type"
                );
                process.exit(1);
              }

              if (
                bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
              ) {
                console.log(
                  "ERROR : " +
                    sTableName +
                    ", " +
                    sDataMid +
                    ", " +
                    aColumnNames[iColumnIdx] +
                    ", invalid int(11)"
                );
                process.exit(1);
              }

              const iVersionValue = parseInt(sDataText);

              if (lastVersionInfo[sDataMid]) {
                const iOldVersionValue = lastVersionInfo[sDataMid];

                if (iVersionValue < iOldVersionValue) {
                  blSkipSqlInsertRow = true;
                  break;
                } else if (iVersionValue === iOldVersionValue) {
                  console.log(
                    "ERROR : " +
                      sTableName +
                      ", " +
                      sDataMid +
                      ", " +
                      aColumnNames[iColumnIdx] +
                      ", duplicate version, version : " +
                      iVersionValue
                  );
                  process.exit(1);
                } else {
                  console.log(
                    "ERROR : " +
                      sTableName +
                      ", " +
                      sDataMid +
                      ", " +
                      aColumnNames[iColumnIdx] +
                      ", invalid version, oldversion : " +
                      iOldVersionValue +
                      ", nowversion : " +
                      iVersionValue
                  );
                  process.exit(1);
                }
              }

              lastVersionInfo[sDataMid] = iVersionValue;

              mstTable[sDataMid][aColumnNames[iColumnIdx]] =
                parseInt(sDataText);
            } else if (aColumnTypes[iColumnIdx] === "int(11)") {
              if (
                sDataText !== "" &&
                bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
              ) {
                console.log(
                  "ERROR : " +
                    sTableName +
                    ", " +
                    sDataMid +
                    ", " +
                    aColumnNames[iColumnIdx] +
                    ", invalid int(11)"
                );
                process.exit(1);
              }
              mstTable[sDataMid][aColumnNames[iColumnIdx]] =
                sDataText === "" ? 0 : parseInt(sDataText);
            } else if (aColumnTypes[iColumnIdx] === "bigint(20)") {
              if (
                sDataText !== "" &&
                bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
              ) {
                console.log(
                  "ERROR : " +
                    sTableName +
                    ", " +
                    sDataMid +
                    ", " +
                    aColumnNames[iColumnIdx] +
                    ", invalid bigint(20)"
                );
                process.exit(1);
              }
              mstTable[sDataMid][aColumnNames[iColumnIdx]] =
                sDataText === "" ? 0 : parseInt(sDataText);
            } else if (aColumnTypes[iColumnIdx] === "double") {
              if (
                sDataText !== "" &&
                bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
              ) {
                console.log(
                  "ERROR : " +
                    sTableName +
                    ", " +
                    sDataMid +
                    ", " +
                    aColumnNames[iColumnIdx] +
                    ", invalid double"
                );
                process.exit(1);
              }
              mstTable[sDataMid][aColumnNames[iColumnIdx]] =
                sDataText === "" ? 0 : parseFloat(sDataText);
            } else if (aColumnTypes[iColumnIdx] === "char(1)") {
              if (
                sDataText !== "" &&
                bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
              ) {
                console.log(
                  "ERROR : " +
                    sTableName +
                    ", " +
                    sDataMid +
                    ", " +
                    aColumnNames[iColumnIdx] +
                    ", invalid char(1)"
                );
                process.exit(1);
              }
              mstTable[sDataMid][aColumnNames[iColumnIdx]] =
                sDataText !== "" && parseInt(sDataText) === 1;
            } else if (aColumnTypes[iColumnIdx] === "varchar(255)") {
              if (
                bIsValidValue(aColumnTypes[iColumnIdx], sDataText) === false
              ) {
                console.log(
                  "ERROR : " +
                    sTableName +
                    ", " +
                    sDataMid +
                    ", " +
                    aColumnNames[iColumnIdx] +
                    ", data_size is bigger than 255"
                );
                process.exit(1);
              }
              mstTable[sDataMid][aColumnNames[iColumnIdx]] = sDataText;
            } else if (aColumnTypes[iColumnIdx] === "list<int(11)>") {
              if (sDataText.length > 0) {
                // this happens a lot
                if (sDataText === "0") {
                  console.log(
                    "ERROR : " +
                      sTableName +
                      ", " +
                      sDataMid +
                      ", " +
                      aColumnNames[iColumnIdx] +
                      ", invalid data"
                  );
                  process.exit(1);
                }

                const aDataTexts = sDataText.split(";");
                for (let n = 0; n < aDataTexts.length; ++n) {
                  if (bIsValidValue("int(11)", aDataTexts[n]) === false) {
                    console.log(
                      "ERROR : " +
                        sTableName +
                        ", " +
                        sDataMid +
                        ", " +
                        aColumnNames[iColumnIdx] +
                        ", invalid int(11)"
                    );
                    process.exit(1);
                  }
                  mstTable[sDataMid][aColumnNames[iColumnIdx]].push(
                    parseInt(aDataTexts[n])
                  );
                }
              }
            } else if (aColumnTypes[iColumnIdx] === "list<bigint(20)>") {
              if (sDataText.length > 0) {
                // this happens a lot
                if (sDataText === "0") {
                  console.log(
                    "ERROR : " +
                      sTableName +
                      ", " +
                      sDataMid +
                      ", " +
                      aColumnNames[iColumnIdx] +
                      ", invalid data"
                  );
                  process.exit(1);
                }

                const aDataTexts = sDataText.split(";");
                for (let n = 0; n < aDataTexts.length; ++n) {
                  if (bIsValidValue("bigint(20)", aDataTexts[n]) === false) {
                    console.log(
                      "ERROR : " +
                        sTableName +
                        ", " +
                        sDataMid +
                        ", " +
                        aColumnNames[iColumnIdx] +
                        ", invalid bigint(20)"
                    );
                    process.exit(1);
                  }
                  mstTable[sDataMid][aColumnNames[iColumnIdx]].push(
                    parseInt(aDataTexts[n])
                  );
                }
              }
            } else if (aColumnTypes[iColumnIdx] === "list<varchar(255)>") {
              if (sDataText.length > 0) {
                // this happens a lot
                if (sDataText === "0") {
                  console.log(
                    "ERROR : " +
                      sTableName +
                      ", " +
                      sDataMid +
                      ", " +
                      aColumnNames[iColumnIdx] +
                      ", invalid data"
                  );
                  process.exit(1);
                }

                const aDataTexts = sDataText.split(";");
                for (let n = 0; n < aDataTexts.length; ++n) {
                  if (bIsValidValue("varchar(255)", aDataTexts[n]) === false) {
                    console.log(
                      "ERROR : " +
                        sTableName +
                        ", " +
                        sDataMid +
                        ", " +
                        aColumnNames[iColumnIdx] +
                        ", data_size is bigger than 255"
                    );
                    process.exit(1);
                  }
                }
                mstTable[sDataMid][aColumnNames[iColumnIdx]] = aDataTexts;
              }
            } else {
              mstTable[sDataMid][aColumnNames[iColumnIdx]] = sDataText;
            }

            ++iColumnIdx;
          }

          if (blSkipSqlInsertRow) {
            ++iRowIndex;
            continue;
          }

          if (sDataText === "END_OF_DATA") {
            break;
          } else {
            let sInsertIntoTable = "";
            sInsertIntoTable += "insert into `" + sTableName + "` values(";

            let sValue = "";
            for (let m = 0; m < aClientColumnNames.length; ++m) {
              if (aClientColumnTypes[m].indexOf("list") > -1) {
                sValue = Array.prototype.join.call(
                  mstTable[sDataMid][aClientColumnNames[m]],
                  ";"
                );
                sInsertIntoTable += "'" + sValue.split("'").join("''") + "'";
              } else {
                if (bIsNumberType(aClientColumnTypes[m])) {
                  sInsertIntoTable += mstTable[sDataMid][aClientColumnNames[m]];
                } else if (aClientColumnTypes[m] === "char(1)") {
                  sInsertIntoTable += mstTable[sDataMid][aClientColumnNames[m]]
                    ? 1
                    : 0;
                } else {
                  sValue = mstTable[sDataMid][aClientColumnNames[m]]
                    .split("'")
                    .join("''");
                  sInsertIntoTable += "'" + sValue + "'";
                }
              }

              if (m < aClientColumnNames.length - 1) {
                sInsertIntoTable += ", ";
              }
            }
            sInsertIntoTable += ")";

            // console.log(insertIntoTable)
            fs.appendFileSync(
              sSqlFile,
              "\t" + sInsertIntoTable + ";\n",
              "utf8"
            );
            await db.exec(sInsertIntoTable);
          }
        }

        ++iRowIndex;
      }

      mstDataAll[sTableName] = JSON.parse(JSON.stringify(mstTable));

      const mstTableServer = JSON.parse(JSON.stringify(mstTable));

      let hasServerData = false;
      for (const sKey in mstTableServer) {
        for (let p = 0; p < aColumnAccesses.length; ++p) {
          if (
            aColumnAccesses[p] === "common" ||
            aColumnAccesses[p] === "server"
          ) {
            hasServerData = true;
            continue;
          }

          delete mstTableServer[sKey][aColumnNames[p]];
        }
      }

      if (hasServerData)
        mstDataServer[sTableName] = JSON.parse(JSON.stringify(mstTableServer));
    }
  }

  await db.run("COMMIT");
  await db.close();

  return {
    asDefineNameNames,
    aTableNames,
    aMidColumnNames,
    aMidColumnTables,
    aListColumnNames,
    aListColumnTables,
    mstDataAll,
    mstDataServer,
  };
};

const generateCsMasterTable = ({
  sTableName,
  aClientColumnNames,
  aClientColumnTypes,
  dPath,
}) => {
  let sMasterTableCs = "";

  sMasterTableCs += "using System;\n";
  sMasterTableCs += "using System.Collections.Generic;\n";
  sMasterTableCs += "using SQLite4Unity3d;\n";
  sMasterTableCs += "\n";
  sMasterTableCs += "namespace CalmIsland\n";
  sMasterTableCs += "{\n";
  sMasterTableCs += "\tpublic class master_info_" + sTableName + "_tmp\n";
  sMasterTableCs += "\t{\n";

  for (let p = 0; p < aClientColumnNames.length; ++p) {
    const sName = aClientColumnNames[p];
    const sType = aClientColumnTypes[p];

    if (sType.substr(0, 5) === "list<") {
      sMasterTableCs += "\t\tpublic string " + sName + " { get; set; }\n";
    } else {
      sMasterTableCs +=
        "\t\tpublic " +
        sCsharpTypeSqlite3(sType) +
        " " +
        sName +
        " { get; set; }\n";
    }
  }

  sMasterTableCs += "\n";
  sMasterTableCs += "\t\tpublic master_info_" + sTableName + "_tmp()\n";
  sMasterTableCs += "\t\t{\n";

  for (let p = 0; p < aClientColumnNames.length; ++p) {
    const sName = aClientColumnNames[p];
    const sType = aClientColumnTypes[p];

    if (bIsNumberType(sType)) {
      sMasterTableCs += "\t\t\tthis." + sName + " = 0;\n";
    } else if (sType === "char(1)") {
      sMasterTableCs += "\t\t\tthis." + sName + " = 0;\n";
    } else if (sType === "datetime") {
      sMasterTableCs += "\t\t\tthis." + sName + " = string.Empty;\n";
    } else if (sType === "list<int(11)>") {
      sMasterTableCs += "\t\t\tthis." + sName + " = string.Empty;\n";
    } else if (sType === "list<bigint(20)>") {
      sMasterTableCs += "\t\t\tthis." + sName + " = string.Empty;\n";
    } else if (sType === "list<varchar(255)>") {
      sMasterTableCs += "\t\t\tthis." + sName + " = string.Empty;\n";
    } else {
      sMasterTableCs += "\t\t\tthis." + sName + " = string.Empty;\n";
    }
  }

  sMasterTableCs += "\t\t}\n";
  sMasterTableCs += "\t}\n";
  sMasterTableCs += "\n";
  sMasterTableCs +=
    "\tpublic class MasterTable" + sCamelCase(sTableName) + "\n";
  sMasterTableCs += "\t{\n";
  sMasterTableCs +=
    "\t\tpublic static Dictionary<" +
    sCsharpType(aClientColumnTypes[0]) +
    ", MasterInfo" +
    sCamelCase(sTableName) +
    "> mstTable" +
    sCamelCase(sTableName) +
    ";\n";
  sMasterTableCs += "\n";
  sMasterTableCs += "\t\tpublic MasterTable" + sCamelCase(sTableName) + "()\n";
  sMasterTableCs += "\t\t{\n";
  sMasterTableCs +=
    "\t\t\tmstTable" +
    sCamelCase(sTableName) +
    " = new Dictionary<" +
    sCsharpType(aClientColumnTypes[0]) +
    ", MasterInfo" +
    sCamelCase(sTableName) +
    ">();\n";
  sMasterTableCs += "\t\t}\n";
  sMasterTableCs += "\n";
  sMasterTableCs += "\t\tpublic bool Load(SQLiteConnection dbConn)\n";
  sMasterTableCs += "\t\t{\n";
  sMasterTableCs +=
    '\t\t\tvar cmdSelect = dbConn.CreateCommand("SELECT * FROM ' +
    sTableName +
    '");\n';
  sMasterTableCs +=
    "\t\t\tvar rows = cmdSelect.ExecuteQuery<master_info_" +
    sTableName +
    "_tmp>();\n";
  sMasterTableCs += "\n";
  sMasterTableCs += "\t\t\tforeach (var row in rows)\n";
  sMasterTableCs += "\t\t\t{\n";
  sMasterTableCs +=
    "\t\t\t\tvar info = new MasterInfo" + sCamelCase(sTableName) + "();\n";
  sMasterTableCs += "\n";

  for (let p = 0; p < aClientColumnNames.length; ++p) {
    const sName = aClientColumnNames[p];
    const sType = aClientColumnTypes[p];

    if (sType === "char(1)") {
      sMasterTableCs +=
        "\t\t\t\tinfo." + sCamelCase(sName) + " = row." + sName + " == 1;\n";
    } else if (sType === "datetime") {
      sMasterTableCs +=
        "\t\t\t\tinfo." +
        sCamelCase(sName) +
        " = DateTime.Parse(row." +
        sName +
        ");\n";
    } else if (sType === "list<int(11)>") {
      sMasterTableCs += "\t\t\t\tif (row." + sName + ".Length > 0)\n";
      sMasterTableCs += "\t\t\t\t{\n";
      sMasterTableCs +=
        "\t\t\t\t\tstring[] " +
        sName +
        "_arr = row." +
        sName +
        ".Split(';');\n";
      sMasterTableCs += "\t\t\t\t\tforeach (var i in " + sName + "_arr)\n";
      sMasterTableCs += "\t\t\t\t\t{\n";
      sMasterTableCs +=
        "\t\t\t\t\t\tinfo." + sCamelCase(sName) + ".Add(Convert.ToInt32(i));\n";
      sMasterTableCs += "\t\t\t\t\t}\n";
      sMasterTableCs += "\t\t\t\t}\n";
    } else if (sType === "list<bigint(20)>") {
      sMasterTableCs += "\t\t\t\tif (row." + sName + ".Length > 0)\n";
      sMasterTableCs += "\t\t\t\t{\n";
      sMasterTableCs +=
        "\t\t\t\t\tstring[] " +
        sName +
        "_arr = row." +
        sName +
        ".Split(';');\n";
      sMasterTableCs += "\t\t\t\t\tforeach (var i in " + sName + "_arr)\n";
      sMasterTableCs += "\t\t\t\t\t{\n";
      sMasterTableCs +=
        "\t\t\t\t\t\tinfo." + sCamelCase(sName) + ".Add(Convert.ToInt64(i));\n";
      sMasterTableCs += "\t\t\t\t\t}\n";
      sMasterTableCs += "\t\t\t\t}\n";
    } else if (sType === "list<varchar(255)>") {
      sMasterTableCs += "\t\t\t\tif (row." + sName + ".Length > 0)\n";
      sMasterTableCs += "\t\t\t\t{\n";
      sMasterTableCs +=
        "\t\t\t\t\tstring[] " +
        sName +
        "_arr = row." +
        sName +
        ".Split(';');\n";
      sMasterTableCs += "\t\t\t\t\tforeach (var i in " + sName + "_arr)\n";
      sMasterTableCs += "\t\t\t\t\t{\n";
      sMasterTableCs += "\t\t\t\t\t\tinfo." + sCamelCase(sName) + ".Add(i);\n";
      sMasterTableCs += "\t\t\t\t\t}\n";
      sMasterTableCs += "\t\t\t\t}\n";
    } else {
      sMasterTableCs +=
        "\t\t\t\tinfo." + sCamelCase(sName) + " = row." + sName + ";\n";
    }
  }

  sMasterTableCs += "\n";
  sMasterTableCs +=
    "\t\t\t\tmstTable" +
    sCamelCase(sTableName) +
    ".Add(info." +
    sCamelCase(sTableName) +
    "Mid, info);\n";
  sMasterTableCs += "\t\t\t}\n";
  sMasterTableCs += "\n";
  sMasterTableCs += "\t\t\treturn true;\n";
  sMasterTableCs += "\t\t}\n";
  sMasterTableCs += "\n";
  sMasterTableCs +=
    "\t\tpublic static MasterInfo" +
    sCamelCase(sTableName) +
    " GetInfo(" +
    sCsharpType(aClientColumnTypes[0]) +
    " " +
    aClientColumnNames[0] +
    ")\n";
  sMasterTableCs += "\t\t{\n";
  sMasterTableCs +=
    "\t\t\tif (mstTable" +
    sCamelCase(sTableName) +
    ".ContainsKey(" +
    aClientColumnNames[0] +
    "))\n";
  sMasterTableCs += "\t\t\t{\n";
  sMasterTableCs +=
    "\t\t\t\treturn mstTable" +
    sCamelCase(sTableName) +
    "[" +
    aClientColumnNames[0] +
    "];\n";
  sMasterTableCs += "\t\t\t}\n";
  sMasterTableCs += "\n";
  sMasterTableCs += "\t\t\treturn null;\n";
  sMasterTableCs += "\t\t}\n";
  sMasterTableCs += "\n";
  sMasterTableCs +=
    "\t\tpublic static Dictionary<" +
    sCsharpType(aClientColumnTypes[0]) +
    ", MasterInfo" +
    sCamelCase(sTableName) +
    "> GetDic()\n";
  sMasterTableCs += "\t\t{\n";
  sMasterTableCs += "\t\t\treturn mstTable" + sCamelCase(sTableName) + ";\n";
  sMasterTableCs += "\t\t}\n";
  sMasterTableCs += "\t}\n";
  sMasterTableCs += "}\n";

  fs.writeFileSync(dPath, sMasterTableCs, "utf8");
};

const generateCsMasterInfo = ({
  sTableName,
  aClientColumnNames,
  aClientColumnTypes,
  dPath,
}) => {
  let sMasterInfoCs = "";

  sMasterInfoCs += "using System;\n";
  sMasterInfoCs += "using System.Collections.Generic;\n";
  sMasterInfoCs += "\n";
  sMasterInfoCs += "namespace CalmIsland\n";
  sMasterInfoCs += "{\n";
  sMasterInfoCs += "\tpublic class MasterInfo" + sCamelCase(sTableName) + "\n";
  sMasterInfoCs += "\t{\n";

  for (let p = 0; p < aClientColumnNames.length; ++p) {
    const sName = aClientColumnNames[p];
    const sType = aClientColumnTypes[p];

    sMasterInfoCs +=
      "\t\tpublic " +
      sCsharpType(sType) +
      " " +
      sCamelCase(sName) +
      " { get; set; }\n";
    /*
    if (sType.substr(0, 5) === 'list<') {
      sMasterInfoCs += '\t\tpublic ' + sCsharpType(sType) + ' ' + sCamelCase(sName) + ' { get; set; }\n'
    } else {
      sMasterInfoCs += '\t\tpublic ' + sCsharpType(sType) + ' ' + sCamelCase(sName) + ' { get; set; }\n'
    }
    */
  }

  sMasterInfoCs += "\n";
  sMasterInfoCs += "\t\tpublic MasterInfo" + sCamelCase(sTableName) + "()\n";
  sMasterInfoCs += "\t\t{\n";

  for (let p = 0; p < aClientColumnNames.length; ++p) {
    const sName = aClientColumnNames[p];
    const sType = aClientColumnTypes[p];

    if (bIsNumberType(sType)) {
      sMasterInfoCs += "\t\t\tthis." + sCamelCase(sName) + " = 0;\n";
    } else if (sType === "char(1)") {
      sMasterInfoCs += "\t\t\tthis." + sCamelCase(sName) + " = false;\n";
    } else if (sType === "datetime") {
      sMasterInfoCs +=
        "\t\t\tthis." + sCamelCase(sName) + " = DateTime.MinValue;\n";
    } else if (sType === "list<int(11)>") {
      sMasterInfoCs +=
        "\t\t\tthis." + sCamelCase(sName) + " = new List<int>();\n";
    } else if (sType === "list<bigint(20)>") {
      sMasterInfoCs +=
        "\t\t\tthis." + sCamelCase(sName) + " = new List<long>();\n";
    } else if (sType === "list<varchar(255)>") {
      sMasterInfoCs +=
        "\t\t\tthis." + sCamelCase(sName) + " = new List<string>();\n";
    } else {
      sMasterInfoCs += "\t\t\tthis." + sCamelCase(sName) + " = string.Empty;\n";
    }
  }

  sMasterInfoCs += "\t\t}\n";
  sMasterInfoCs += "\t}\n";
  sMasterInfoCs += "}\n";

  fs.writeFileSync(dPath, sMasterInfoCs, "utf8");
};

const generateGoMasterInfo = ({
  dPath,
  sTableName,
  aServerColumnNames,
  aServerColumnTypes,
}) => {
  let sMasterInfoGo = "";

  sMasterInfoGo += "type mst" + sCamelCase(sTableName) + " struct {\n";

  for (let p = 0; p < aServerColumnNames.length; ++p) {
    const sName = aServerColumnNames[p];
    const sType = aServerColumnTypes[p];

    sMasterInfoGo +=
      "\t" +
      sCamelCase(sName) +
      " " +
      sGoLangType(sType) +
      ' `json:"' +
      sName +
      '"`\n';
    /*
    if (sType.substr(0, 5) === 'list<') {
      sMasterInfoGo += '\t' + sCamelCase(sName) + ' ' + sGoLangType(sType) + ' ' + sName + '\n'
    } else {
      sMasterInfoGo += '\t' + sCamelCase(sName) + ' ' + sGoLangType(sType) + ' ' + sName + '\n'
    }
    */
  }

  sMasterInfoGo += "}\n";
  sMasterInfoGo += "\n";

  fs.appendFileSync(dPath, sMasterInfoGo, "utf8");
};

export default extractXml;

export const validateData = ({
  aListColumnTables,
  aMidColumnTables,
  aListColumnNames,
  aMidColumnNames,
  mstDataAll,
}) => {
  for (let i = 0; i < aMidColumnNames.length; ++i) {
    const sMidColumnName = aMidColumnNames[i];
    const sSrcTableName = sMidColumnName.split("_mid")[0];

    const sCurrTableName = aMidColumnTables[i];

    if (sSrcTableName in mstDataAll === false) {
      console.log(
        "VALIDATION : " +
          sCurrTableName +
          " : table " +
          sSrcTableName +
          " not found in masterData"
      );
      continue;
    }

    for (const sKey in mstDataAll[sCurrTableName]) {
      if (
        mstDataAll[sCurrTableName][sKey][sMidColumnName] === 0 ||
        mstDataAll[sCurrTableName][sKey][sMidColumnName] === "0"
      ) {
        continue;
      }

      if (
        mstDataAll[sCurrTableName][sKey][sMidColumnName] in
          mstDataAll[sSrcTableName] ===
        false
      ) {
        console.log(
          "VALIDATION : " +
            sCurrTableName +
            "[" +
            sKey +
            "]." +
            sMidColumnName +
            " = " +
            mstDataAll[sCurrTableName][sKey][sMidColumnName] +
            ", mid " +
            mstDataAll[sCurrTableName][sKey][sMidColumnName] +
            " not found in " +
            sSrcTableName +
            " table"
        );
      }
    }
  }

  for (let i = 0; i < aListColumnNames.length; ++i) {
    const sListColumnName = aListColumnNames[i];
    const sSrcTableName = sListColumnName.split("_mid")[0];

    const sCurrTableName = aListColumnTables[i];

    if (sSrcTableName in mstDataAll === false) {
      console.log(
        "VALIDATION : " +
          sCurrTableName +
          " : table " +
          sSrcTableName +
          " not found in masterData"
      );
      continue;
    }

    for (const sKey in mstDataAll[sCurrTableName]) {
      for (
        let j = 0;
        j < mstDataAll[sCurrTableName][sKey][sListColumnName].length;
        ++j
      ) {
        if (
          mstDataAll[sCurrTableName][sKey][sListColumnName][j] in
            mstDataAll[sSrcTableName] ===
          false
        ) {
          console.log(
            "VALIDATION : " +
              sCurrTableName +
              "[" +
              sKey +
              "]." +
              sListColumnName +
              "[" +
              j +
              "] = " +
              mstDataAll[sCurrTableName][sKey][sListColumnName][j] +
              ", mid " +
              mstDataAll[sCurrTableName][sKey][sListColumnName][j] +
              " not found in " +
              sSrcTableName +
              " table"
          );
        }
      }
    }
  }
};
