MULTI-LANGUAGE SERVER-SIDE:

 * Default lang: en
 * How to get lang from request:
  + get from user setting: req.user
  + get from query string: req.query._locale_ (example: ...?_locale_=en&...)
  + get from cookies: req.cookies._locale_
  + get from headers: req.header('Accept-Language')

 * How to get lang content: res.locals.lang(key[, data])

 * Manage multi-language resources:
  - create a .lang file corresponding to language in '/server/resources/lang' folder.
    Example: en.lang, vi.lang, fr.lang, ...
  - in each .lang file, write the content that need to be translated, with their key and value: key = value
    Example: email.header=Welcome!
  - Comment: // or #
  - Use \ to break line (use for multi-line content)
  - Static content:
    . Use ${ var } in value , var is passed as a param in lang method.
    . Use ${ var | singular | plural } or ${ var | zero | singular | plural } to translate with countable var
    Example: + in .lang file: email.welcome = Welcome ${firstName} ${lastName}
             => get content: res.locals.lang('email.welcome', { firstName: "John", lastName: "Doe"})
             + in .lang file: email.content = We have ${0} ${1} ${2}
             => get content: res.locals.lang('email.content', ["pen", "phone", "book"])
             + in .lang file: statistic.description = We have ${numberOfProducts} ${ numberOfProducts | 'product' | 'products' }
             + in .lang file: content.having = There ${ numberOfProducts | "is" | "are" }

  - Show all language contents with a defined language:
    Request to: api_url/app-data/lang?_locale_=...

 * Usage: - Use when sending email with multi-lang user
          - Use when sending response with multi-lang
          - Push multi-lang notification

