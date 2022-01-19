import * as fs from 'fs';
import { sCamelCase } from './func';

export const goMasterDataExtractor = ({
  dPath,
  aTableNames,
}: {
  dPath: string;
  aTableNames: string[];
}) => {
  if (fs.existsSync(dPath)) {
    fs.unlinkSync(dPath);
  }

  fs.appendFileSync(
    dPath,
    'package globals\n\nimport (\n\t"encoding/json"\n\t"io/ioutil"\n)\n\n',
    'utf8'
  );

  let sMasterDataGo = '';

  sMasterDataGo += '// Mst is Global\n';
  sMasterDataGo += 'type Mst struct {\n';

  let sTableName = '';

  for (let i = 0; i < aTableNames.length; ++i) {
    sTableName = aTableNames[i];

    sMasterDataGo +=
      '\t' +
      sCamelCase(sTableName) +
      ' map[string]mst' +
      sCamelCase(sTableName) +
      ' `json:"' +
      sTableName +
      '"`\n';
  }

  sMasterDataGo += '}\n';
  sMasterDataGo += '\n';
  sMasterDataGo += 'func (m *Mst) parseFrom(file string) {\n';
  sMasterDataGo += '\tbytes, err := ioutil.ReadFile(file)\n';
  sMasterDataGo += '\tif err != nil {\n';
  sMasterDataGo += '\t\tpanic(err)\n';
  sMasterDataGo += '\t}\n';
  sMasterDataGo += '\n';
  sMasterDataGo += '\terr = json.Unmarshal(bytes, m)\n';
  sMasterDataGo += '\tif err != nil {\n';
  sMasterDataGo += '\t\tpanic(err)\n';
  sMasterDataGo += '\t}\n';
  sMasterDataGo += '}\n';

  fs.appendFileSync(dPath, sMasterDataGo, 'utf8');
};

export const goMsgTypeDataExtractor = ({
  mstDataServer,
  dPath,
}: {
  mstDataServer: any;
  dPath: string;
}) => {
  let sMsgTypeGo = 'package common\n\nconst (\n';

  for (const sKey in mstDataServer.message) {
    sMsgTypeGo +=
      '\t' +
      sCamelCase(
        'MsgType_' + mstDataServer.message[sKey].enum_str.toLowerCase()
      ) +
      ' int64 = ' +
      sKey +
      '\n';
  }
  sMsgTypeGo += ')\n';

  fs.writeFileSync(dPath, sMsgTypeGo, 'utf8');
};

export const goErrorDataExtractor = ({
  mstDataServer,
  dPath,
}: {
  mstDataServer: any;
  dPath: string;
}) => {
  let sErrCodeGo = 'package common\n\nconst (\n';

  for (const sKey in mstDataServer.error) {
    sErrCodeGo +=
      '\t' +
      sCamelCase(
        'ErrCode_' + mstDataServer.error[sKey].enum_str.toLowerCase()
      ) +
      ' int64 = ' +
      sKey +
      '\n';
  }
  sErrCodeGo += ')\n';

  fs.writeFileSync(dPath, sErrCodeGo, 'utf8');
};
