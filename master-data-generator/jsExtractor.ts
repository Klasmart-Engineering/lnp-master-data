import * as fs from 'fs';

export const jsMasterDataExtractor = (
  dPath: { compressed: string; uncompressed: string },
  mstDataServer
) => {
  fs.writeFileSync(dPath.uncompressed, JSON.stringify(mstDataServer), 'utf8');

  fs.writeFileSync(
    dPath.compressed,
    JSON.stringify(mstDataServer, null, 4),
    'utf8'
  );
};

export const jsErrorDataExtractor = ({ dPath, mstDataServer }) => {
  let sErrCodeJs = "\n'use strict'\n\nconst eErrCode = {\n";

  for (const sKey in mstDataServer.error) {
    sErrCodeJs +=
      '  ' + mstDataServer.error[sKey].enum_str + ': ' + sKey + ',\n';
  }
  sErrCodeJs += '  END: 9999\n}\n\nmodule.exports = eErrCode\n';

  fs.writeFileSync(dPath, sErrCodeJs, 'utf8');
};

export const jsMsgDataExtractor = ({ dPath, mstDataServer }) => {
  let sMsgTypeJs = "\n'use strict'\n\nconst eMsgType = {\n";

  for (const sKey in mstDataServer.message) {
    sMsgTypeJs +=
      '  ' + mstDataServer.message[sKey].enum_str + ': ' + sKey + ',\n';
  }
  sMsgTypeJs += '  END: 9999\n}\n\nmodule.exports = eMsgType\n';

  fs.writeFileSync(dPath, sMsgTypeJs, 'utf8');
};
