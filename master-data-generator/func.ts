export const bIsCorrectAccess = function (sAccess) {
  return ['common', 'design', 'client', 'server'].indexOf(sAccess) > -1;
};

export const bIsCorrectType = function (sType) {
  return (
    [
      'int(11)',
      'bigint(20)',
      'double',
      'char(1)',
      'varchar(255)',
      'text',
      'datetime',
      'list<int(11)>',
      'list<bigint(20)>',
      'list<varchar(255)>',
    ].indexOf(sType) > -1
  );
};

export const sCsharpTypeSqlite3 = function (sType) {
  if (sType === 'char(1)') {
    return 'int';
  } else if (sType === 'datetime') {
    return 'string';
  }

  return sCsharpType(sType);
};

export const sCsharpType = function (sType) {
  if (sType === 'int(11)') {
    return 'int';
  } else if (sType === 'bigint(20)') {
    return 'long';
  } else if (sType === 'double') {
    return 'double';
  } else if (sType === 'char(1)') {
    return 'bool';
  } else if (['varchar(255)', 'text'].indexOf(sType) > -1) {
    return 'string';
  } else if (sType === 'datetime') {
    return 'DateTime';
  } else if (sType === 'list<int(11)>') {
    return 'List<int>';
  } else if (sType === 'list<bigint(20)>') {
    return 'List<long>';
  } else if (sType === 'list<varchar(255)>') {
    return 'List<string>';
  }

  return '';
};

export const sGoLangType = function (sType) {
  if (sType === 'int(11)') {
    return 'int64';
  } else if (sType === 'bigint(20)') {
    return 'int64';
  } else if (sType === 'double') {
    return 'float64';
  } else if (sType === 'char(1)') {
    return 'bool';
  } else if (['varchar(255)', 'text'].indexOf(sType) > -1) {
    return 'string';
  } else if (sType === 'datetime') {
    return 'string';
  } else if (sType === 'list<int(11)>') {
    return '[]int64';
  } else if (sType === 'list<bigint(20)>') {
    return '[]int64';
  } else if (sType === 'list<varchar(255)>') {
    return '[]string';
  }

  return '';
};

export const sCamelCase = function (sName) {
  if (sName.length === 0) {
    return '';
  }

  let sUnderscoreToSpace = '';
  for (let i = 0; i < sName.length; ++i) {
    if (sName[i] === '_') {
      sUnderscoreToSpace += ' ';
    } else {
      sUnderscoreToSpace += sName[i];
    }
  }
  let sTrimmed = sUnderscoreToSpace.trim();

  const aSplited = sTrimmed.split(' ');
  for (let j = 0; j < aSplited.length; ++j) {
    if (aSplited[j] === 'id') {
      aSplited[j] = 'ID';
    } else if (aSplited[j] === 'uri') {
      aSplited[j] = 'URI';
    } else if (aSplited[j] === 'url') {
      aSplited[j] = 'URL';
    } else if (aSplited[j] === 'ui') {
      aSplited[j] = 'UI';
    } else if (aSplited[j] === 'html') {
      aSplited[j] = 'HTML';
    }
  }
  sTrimmed = aSplited.join(' ');

  let sCamelCased = sTrimmed[0].toUpperCase();
  for (let k = 1; k < sTrimmed.length; ++k) {
    if (sTrimmed[k] === ' ' && k < sTrimmed.length - 1) {
      sCamelCased += sTrimmed[++k].toUpperCase();
      continue;
    }

    sCamelCased += sTrimmed[k];
  }

  return sCamelCased;
};

export const sSqlite3Type = function (sType) {
  if (sType === 'int(11)') {
    return 'INT';
  } else if (sType === 'bigint(20)') {
    return 'BIGINT';
  } else if (sType === 'double') {
    return 'DOUBLE';
  } else if (sType === 'char(1)') {
    return 'INT';
  } else if (sType === 'varchar(255)') {
    return 'VARCHAR(255)';
  } else if (sType === 'text') {
    return 'TEXT';
  } else if (sType === 'datetime') {
    return 'DATETIME';
  } else if (sType === 'list<int(11)>') {
    return 'TEXT';
  } else if (sType === 'list<bigint(20)>') {
    return 'TEXT';
  } else if (sType === 'list<varchar(255)>') {
    return 'TEXT';
  }

  return '';
};

export const bIsNumberType = function (sType) {
  return ['int(11)', 'bigint(20)', 'double'].indexOf(sType) > -1;
};

export const bIsNumber = function (sNum) {
  if (sNum === '') {
    return false;
  }

  let i = 0;
  if (sNum.length > 0 && sNum[0] === '-') {
    ++i;
  }

  for (; i < sNum.length; ++i) {
    if (sNum[i] >= '0' && sNum[i] <= '9') {
      continue;
    }

    return false;
  }

  return true;
};

export const bIsDouble = function (sNum) {
  if (sNum.indexOf('.') > -1) {
    if (sNum.split('.').length > 2) {
      return false;
    }

    return bIsNumber(sNum.substr(0, sNum.indexOf('.')));
  }

  return bIsNumber(sNum);
};

export const bIsValidValue = function (sType, sValue) {
  if (sType === 'int(11)') {
    if (bIsNumber(sValue) === false) {
      return false;
    }

    if (parseInt(sValue) > 2147483647 || parseInt(sValue) < -2147483648) {
      return false;
    }
  } else if (sType === 'bigint(20)') {
    if (bIsNumber(sValue) === false) {
      return false;
    }

    if (
      parseInt(sValue) > Number.MAX_SAFE_INTEGER ||
      parseInt(sValue) < Number.MIN_SAFE_INTEGER
    ) {
      return false;
    }
  } else if (sType === 'double') {
    if (bIsDouble(sValue) === false) {
      return false;
    }

    if (
      parseFloat(sValue) > Number.MAX_SAFE_INTEGER ||
      parseFloat(sValue) < Number.MIN_SAFE_INTEGER
    ) {
      return false;
    }
  } else if (sType === 'char(1)') {
    if (sValue !== '0' && sValue !== '1') {
      return false;
    }
  } else if (sType === 'varchar(255)') {
    if (sValue !== null && sValue.length > 255) {
      return false;
    }
  }

  return true;
};

export const defaultValue = function (sType) {
  if (['int(11)', 'bigint(20)', 'double'].indexOf(sType) > -1) {
    return 0;
  } else if (sType === 'char(1)') {
    return false;
  } else if (sType === 'datetime') {
    return '1970-01-01 00:00:00';
  } else if (sType.indexOf('list') > -1) {
    return [];
  } else {
    return '';
  }
};
