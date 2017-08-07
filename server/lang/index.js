import _fs from 'fs';
import _path from 'path';
import _lodash from 'lodash';

let _langData = {};
let _defaultLocale = 'fr';

export default {
  setDefaultLocale,
  getDefaultLocale,
  importLanguageDirectory,
  isSupportLanguage,
  getLanguageItem,
  getLanguageData,
  getLanguage
};

function getLanguageData(locale) {
  return _lodash.assign({}, _langData[_defaultLocale], _langData[locale]);
}

function setDefaultLocale(locale) {
  locale = locale.toLowerCase();
  
  _defaultLocale = locale;
}

function getDefaultLocale() {
  return _defaultLocale;
}

function isSupportLanguage(locale) {
  locale = locale.toLowerCase();
  
  return !!_langData[locale];
}

function importLanguageDirectory(dir, cb) {
  _langData = {};
  
  const files = _fs.readdirSync(dir);
  
  files.forEach(file => {
    if (!file.match(/\.lang$/)) return;
    
    importLanguageFile(dir, file);
  });
  
  if (cb) {
    cb();
  }
}

function importLanguageFile(dir, file) {
  const locale = file.replace(/\.lang$/, '');
  const text = _fs.readFileSync(_path.join(dir, file), {encoding: 'utf8'});
  
  let lines = text.split(/\s*\r?\n\s*/);
  
  lines = lines.filter(line => line != '');
  
  importLanguageData(locale, lines);
}

function importLanguageData(locale, lines) {
  locale = locale.toLowerCase();
  
  const langData = {};
  
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    
    // skip comment line
    if (line.startsWith('//') || line.startsWith('#')) {
      index++;
      continue;
    }
    
    const equalSign = line.indexOf('=');
    
    // skip incorrect format line
    if (equalSign == -1) {
      index++;
      continue;
    }
    
    const key   = line.slice(0, equalSign).trim();
    let value = line.slice(equalSign + 1).trim();
    
    // if value end with \ and not \\, means it's multi-lines value
    if (value.endsWith('\\') && !value.endsWith('\\\\')) {
      // remove last \
      value = value.slice(0, -1).trim();
      
      do {
        index++;
        const nextLine = lines[index];
        
        if (!nextLine) break;
        
        if (nextLine.endsWith('\\') && !value.endsWith('\\\\')) {
          value += `\n${nextLine.slice(0, -1).trim()}`;
        } else {
          value += `\n${nextLine}`;
          break;
        }
      } while (true);
    }
    
    langData[key] = value.trim();
    
    index++;
  }
  
  _langData[locale] = langData;
}

function getLanguageItem(locale, key, params) {
  
  locale = locale.toLowerCase();
  
  if (locale && _langData[locale] && _langData[locale][key]) {
    return parseLanguageItem(locale, _langData[locale][key], params);
  }
  
  if (_langData[_defaultLocale] && _langData[_defaultLocale][key]) {
    return parseLanguageItem(locale, _langData[_defaultLocale][key], params);
  }
  
  return makeUnparsableText(key);
}

function getLanguage(locale) {
  const self = this;
  return (key, params) => self.getLanguageItem(locale || _defaultLocale, key, params)
}

function parseLanguageItem(locale, text, params) {
  const regex = /\$\{\s*([^\{\}]+?)\s*\}/gi;
  
  const expressions = [];
  
  let match;
  while ((match = regex.exec(text))) {
    match[0] = match[0].trim();
    expressions.push(match);
  }
  
  expressions.forEach(expression => {
    const value = parseExpression(locale, expression[1], params);
    
    while (text.includes(expression[0])) {
      text = text.replace(expression[0], value);
    }
  });
  
  return text;
}

function parseExpression(locale, expression, params) {
  if (!expression.includes('|')) {
    // ${ var}
    
    try {
      return getExpressionVariable(locale, expression, params);
    } catch (error) {
      return makeUnparsableText(expression);
    }
  } else {
    // ${ var | singular | plural }
    // ${ var | zero | singular | plural }
    
    const parts = expression.split(/\s*\|\s*/);
    
    if (parts.length !== 3 && parts.length !== 4) {
      return makeUnparsableText(expression);
    }
    
    try {
      const num = +getExpressionVariable(locale, parts[0], params);
      
      if (num == 0) return parts[1];
      if (num == 1) return parts.length == 3 ? parts[1] : parts[2];
      return parts.length == 3 ? parts[2] : parts[3];
    } catch (error) {
      return makeUnparsableText(parts[0]);
    }
  }
}

function getExpressionVariable(locale, name, params) {
  if (name[0] == '#') {
    return getLanguageItem(locale, name.slice(1), params);
  }
  
  name = name.split('.');
  
  let value = params || {};
  
  for (let i = 0; i < name.length; i++) {
    if (!value.hasOwnProperty(name[i])) throw name;
    
    value = value[name[i]];
  }
  
  return value;
}

function makeUnparsableText(error) {
  return `:${error}:`;
}
