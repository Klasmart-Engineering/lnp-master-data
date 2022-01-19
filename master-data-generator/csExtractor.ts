import * as fs from 'fs';
import { sCamelCase } from './func';

export const csMasterDataExtractor = ({
  dPath,
  aTableNames,
  asDefineNameNames,
}: {
  dPath: string;
  aTableNames: string[];
  asDefineNameNames: string[];
}) => {
  let sMasterDataCs = '';

  sMasterDataCs += 'using System.IO;\n';
  sMasterDataCs += '\n';
  sMasterDataCs += 'using UnityEngine;\n';
  sMasterDataCs += 'using SQLite4Unity3d;\n';
  sMasterDataCs += 'using System;\n';
  sMasterDataCs += 'using System.Security.Cryptography;\n';
  sMasterDataCs += '\n';
  sMasterDataCs += 'namespace CalmIsland\n';
  sMasterDataCs += '{\n';
  sMasterDataCs += '\tpublic class MasterData\n';
  sMasterDataCs += '\t{\n';
  sMasterDataCs += '\t\tpublic bool LoadAssetbundle(string phase)\n';
  sMasterDataCs += '\t\t{\n';
  sMasterDataCs +=
    '\t\t\tvar dbName = string.Format("master_data_{0}.bytes", phase);\n';
  sMasterDataCs +=
    '\t\t\tvar dbPath = string.Format("{0}/{1}", Application.persistentDataPath, dbName);\n';
  sMasterDataCs +=
    '\t\t\tvar db = Resources.Load<TextAsset>(string.Format("MasterData/master_data_{0}", phase));\n';
  sMasterDataCs += '\t\t\tCopyTextAssetToDatabase(dbPath, db);\n';
  sMasterDataCs += '\n';
  sMasterDataCs += '\t\t\treturn Load(phase);\n';
  sMasterDataCs += '\t\t}\n';
  sMasterDataCs += '\n';
  sMasterDataCs += '\t\tpublic bool Load(string phase)\n';
  sMasterDataCs += '\t\t{\n';
  sMasterDataCs +=
    '\t\t\tvar dbName = string.Format("master_data_{0}.bytes", phase);\n';
  sMasterDataCs +=
    '\t\t\tvar dbPath = string.Format("{0}/{1}", Application.persistentDataPath, dbName);\n';
  sMasterDataCs += '\n';
  sMasterDataCs +=
    '\t\t\tvar dbConn = new SQLiteConnection(dbPath, SQLiteOpenFlags.ReadOnly);\n';
  sMasterDataCs += '\n';

  let sTableName = '';
  let sDefineName = '';

  for (let i = 0; i < aTableNames.length; ++i) {
    sTableName = sCamelCase(aTableNames[i]);
    sDefineName = asDefineNameNames[i];

    if (sDefineName !== 'COMMON') {
      sMasterDataCs += '#if MASTERDATA_' + sDefineName + ' || MASTERDATA_ALL\n';
    }

    sMasterDataCs +=
      '\t\t\tvar mstTable' +
      sTableName +
      ' = new MasterTable' +
      sTableName +
      '();\n';
    sMasterDataCs +=
      '\t\t\tif (!mstTable' + sTableName + '.Load(dbConn)) return false;\n';

    if (sDefineName !== 'COMMON') {
      sMasterDataCs += '#endif\n';
    }

    sMasterDataCs += '\n';
  }

  sMasterDataCs += '\t\t\tdbConn.Close();\n';
  sMasterDataCs += '\t\t\tdbConn.Dispose();\n';
  sMasterDataCs += '\n';
  sMasterDataCs += '\t\t\treturn true;\n';
  sMasterDataCs += '\t\t}\n';
  sMasterDataCs += '\n';
  sMasterDataCs +=
    '\t\tprivate static void CopyTextAssetToDatabase(string dbPath, TextAsset db)\n';
  sMasterDataCs += '\t\t{\n';
  sMasterDataCs += '\t\t\tFileStream stream = null;\n';
  sMasterDataCs += '\n';
  sMasterDataCs += '\t\t\ttry\n';
  sMasterDataCs += '\t\t\t{\n';
  sMasterDataCs += '\t\t\t\tif (!File.Exists(dbPath))\n';
  sMasterDataCs += '\t\t\t\t{\n';
  sMasterDataCs += '\t\t\t\t\tstream = File.Create(dbPath);\n';
  sMasterDataCs += '\t\t\t\t}\n';
  sMasterDataCs += '\t\t\t\telse\n';
  sMasterDataCs += '\t\t\t\t{\n';
  sMasterDataCs += '\t\t\t\t\tvar fileHash = CalculateMD5FromFile(dbPath);\n';
  sMasterDataCs +=
    '\t\t\t\t\tvar assetHash = CalculateMD5FromByte(db.bytes);\n';
  sMasterDataCs += '\n';
  sMasterDataCs += '\t\t\t\t\tif (fileHash.Equals(assetHash))\n';
  sMasterDataCs += '\t\t\t\t\t{\n';
  sMasterDataCs +=
    '\t\t\t\t\t\tDebug.Log("File is same with text asset. skip copying.");\n';
  sMasterDataCs += '\t\t\t\t\t\treturn;\n';
  sMasterDataCs += '\t\t\t\t\t}\n';
  sMasterDataCs += '\n';
  sMasterDataCs += '\t\t\t\t\tstream = File.OpenWrite(dbPath);\n';
  sMasterDataCs += '\t\t\t\t}\n';
  sMasterDataCs += '\n';
  sMasterDataCs += '\t\t\t\tvar writer = new BinaryWriter(stream);\n';
  sMasterDataCs += '\t\t\t\twriter.Write(db.bytes);\n';
  sMasterDataCs += '\t\t\t\twriter.Flush();\n';
  sMasterDataCs += '\t\t\t\twriter.Close();\n';
  sMasterDataCs += '\t\n';
  sMasterDataCs += '#if UNITY_IOS\n';
  sMasterDataCs += '\t\t\t\tUnityEngine.iOS.Device.SetNoBackupFlag(dbPath);\n';
  sMasterDataCs += '#endif\n';
  sMasterDataCs += '\t\t\t}\n';
  sMasterDataCs += '\t\t\tcatch (Exception e)\n';
  sMasterDataCs += '\t\t\t{\n';
  sMasterDataCs += '\t\t\t\tthrow e;\n';
  sMasterDataCs += '\t\t\t}\n';
  sMasterDataCs += '\t\t}\n';
  sMasterDataCs += '\n';
  sMasterDataCs +=
    '\t\tprivate static string CalculateMD5FromFile(string filename)\n';
  sMasterDataCs += '\t\t{\n';
  sMasterDataCs += '\t\t\tusing(var md5 = MD5.Create())\n';
  sMasterDataCs += '\t\t\t{\n';
  sMasterDataCs += '\t\t\t\tusing (var stream = File.OpenRead(filename))\n';
  sMasterDataCs += '\t\t\t\t{\n';
  sMasterDataCs += '\t\t\t\t\tvar hash = md5.ComputeHash(stream);\n';
  sMasterDataCs += '\t\t\t\t\treturn ConvertBitToString(hash);\n';
  sMasterDataCs += '\t\t\t\t}\n';
  sMasterDataCs += '\t\t\t}\n';
  sMasterDataCs += '\t\t}\n';
  sMasterDataCs += '\n';
  sMasterDataCs +=
    '\t\tprivate static string CalculateMD5FromByte(byte[] buffer)\n';
  sMasterDataCs += '\t\t{\n';
  sMasterDataCs += '\t\t\tusing(var md5 = MD5.Create())\n';
  sMasterDataCs += '\t\t\t{\n';
  sMasterDataCs += '\t\t\t\tvar hash = md5.ComputeHash(buffer);\n';
  sMasterDataCs += '\t\t\t\treturn ConvertBitToString(hash);\n';
  sMasterDataCs += '\t\t\t}\n';
  sMasterDataCs += '\t\t}\n';
  sMasterDataCs += '\n';
  sMasterDataCs +=
    '\t\tprivate static string ConvertBitToString(byte[] hash)\n';
  sMasterDataCs += '\t\t{\n';
  sMasterDataCs +=
    '\t\t\treturn BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();\n';
  sMasterDataCs += '\t\t}\n';
  sMasterDataCs += '\t}\n';
  sMasterDataCs += '}\n';

  fs.writeFileSync(dPath, sMasterDataCs, 'utf8');
};

export const csMsgDataExtractor = ({ mstDataServer, dPath }) => {
  let sMsgTypeCs = '\npublic enum MsgType\n{\n';

  for (const sKey in mstDataServer.message) {
    sMsgTypeCs +=
      '\t' + mstDataServer.message[sKey].enum_str + ' = ' + sKey + ',\n';
  }
  sMsgTypeCs += '\tEND = 9999\n}\n';

  fs.writeFileSync(dPath, sMsgTypeCs, 'utf8');
};

export const csErrorDataExtractor = ({ mstDataServer, dPath }) => {
  let sErrCodeCs = '\npublic enum ErrCode\n{\n';

  for (const sKey in mstDataServer.error) {
    sErrCodeCs +=
      '\t' + mstDataServer.error[sKey].enum_str + ' = ' + sKey + ',\n';
  }
  sErrCodeCs += '\tEND = 9999\n}\n';

  fs.writeFileSync(dPath, sErrCodeCs, 'utf8');
};
