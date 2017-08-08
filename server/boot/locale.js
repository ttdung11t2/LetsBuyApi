const DEFAULT_LANGUAGE_LOCALE = 'en';
const COOKIE_LANGUAGE_KEY = '_locale_';
const QUERY_LANGUAGE_KEY = '_locale_';

import _path from 'path';
import _lang from '../lang';
const langDirectory = _path.resolve(__dirname, '../resources/lang');

export default bootLang;

function bootLang(app) {
  
  // default lang locale
  _lang.setDefaultLocale(DEFAULT_LANGUAGE_LOCALE);
  
  // use middlware to refresh languages per each request
  app.use(refreshLangMiddleware);
  
  // lang middleware
  app.use(langMiddleware);
  
  app.get('/app-data/lang', serveLangData);
}

function refreshLangMiddleware(req, res, next) {
  _lang.importLanguageDirectory(langDirectory, next);
}

function langMiddleware(req, res, next) {
  // export "lang" method to views
  res.locals.lang = (key, params) => _lang.getLanguageItem(res.locals.locale, key, params);
  
  if (res.locals.locale && _lang.isSupportLanguage(res.locals.locale)) {
    next();
  } else {
    getRequestLanguageLocale(req, locale => {
      res.locals.locale = locale;
      // set cookie for locale
      res.cookie(COOKIE_LANGUAGE_KEY, locale);
      next();
    })
  }
}

function serveLangData(req, res) {
  const langData = _lang.getLanguageData(req.query.locale || res.locals.locale || DEFAULT_LANGUAGE_LOCALE);
  
  res.send(langData);
}

function getRequestLanguageLocale(req, callback) {
  detectLanguageLocaleFromUserSettings(req, locale => {
    if (locale) {
      return callback(locale);
    }
    detectLanguageLocaleFromQueries(req, locale => {
      if (locale) {
        return callback(locale);
      }
      detectLanguageLocaleFromCookies(req, locale => {
        if (locale) {
          return callback(locale);
        }
        detectLanguageLocaleFromHeaders(req, locale => {
          if (locale) {
            return callback(locale);
          }
          callback(DEFAULT_LANGUAGE_LOCALE);
        })
      })
    })
  });
}

function detectLanguageLocaleFromQueries(req, callback) {
  if (req.query && req.query[QUERY_LANGUAGE_KEY]) {
    const locale = req.query[QUERY_LANGUAGE_KEY].toLowerCase();
    
    if (_lang.isSupportLanguage(locale)) {
      callback(locale);
      return;
    }
  }
  
  callback(null);
}

function detectLanguageLocaleFromCookies(req, callback) {
  if (req.cookies && req.cookies[COOKIE_LANGUAGE_KEY]) {
    const locale = req.cookies[COOKIE_LANGUAGE_KEY].toLowerCase();
    
    if (_lang.isSupportLanguage(locale)) {
      callback(locale);
      return;
    }
  }
  
  callback(null);
}

function detectLanguageLocaleFromHeaders(req, callback) {
  let acceptLanguages = req.header('Accept-Language') || DEFAULT_LANGUAGE_LOCALE;
  
  acceptLanguages = acceptLanguages.split(/\s*[,;]\s*/);
  
  for (let i = 0; i < acceptLanguages.length; i++) {
    const acceptLanguage = acceptLanguages[i].toLowerCase();
    
    if (_lang.isSupportLanguage(acceptLanguage)) {
      callback(acceptLanguage);
      return;
    }
  }
  
  callback(null);
}

function detectLanguageLocaleFromUserSettings(req, callback) {
  callback(null);
}
