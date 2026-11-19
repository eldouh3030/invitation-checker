// ===== Settings =====
var ASSET_BASE = 'https://raw.githubusercontent.com/eldouh3030/checker-assets/main/';
var SCOPUS_API_KEY = PropertiesService.getScriptProperties().getProperty('SCOPUS_API_KEY') || '';

var COLORS = { danger: '#D93025', warning: '#E37400', success: '#188038', unknown: '#5F6368' };
var SYMBOLS = { danger: '✖', warning: '▲', success: '✔', unknown: '●' };

// Main publishers in the Scopus Source List (Oct 2026), largest first, plus indexing services.
// keys: brand words searched in domains and names. A key that starts with '=' must match a whole word.
// official: registrable domains the publisher sends email from. Shared university domains are left out on purpose,
// because any member of the university could send from them.
var PUBLISHERS = [
  { name: 'Elsevier', keys: ['elsevier', 'sciencedirect'], official: ['elsevier.com', 'sciencedirect.com', 'elsevier.net', 'cell.com', 'thelancet.com'] },
  { name: 'Springer Nature', keys: ['springer', 'springernature'], official: ['springer.com', 'springernature.com', 'springeropen.com', 'nature.com', 'biomedcentral.com'] },
  { name: 'Taylor and Francis', keys: ['tandf', 'taylorandfrancis', 'taylorfrancis', 'routledge'], official: ['tandfonline.com', 'taylorandfrancis.com', 'informa.com', 'tandf.co.uk', 'routledge.com'] },
  { name: 'Wiley', keys: ['wiley'], official: ['wiley.com', 'wiley-vch.de'] },
  { name: 'SAGE', keys: ['sagepub'], official: ['sagepub.com', 'sagepub.co.uk'] },
  { name: 'Wolters Kluwer', keys: ['wolterskluwer', 'lippincott'], official: ['wolterskluwer.com', 'lww.com'] },
  { name: 'Oxford University Press', keys: ['oxforduniversitypress', 'oup'], official: ['oup.com'] },
  { name: 'IEEE', keys: ['ieee'], official: ['ieee.org', 'ieee-pdf-express.org'], sponsor: true },
  { name: 'Emerald', keys: ['emerald'], official: ['emerald.com', 'emeraldgrouppublishing.com'] },
  { name: 'Cambridge University Press', keys: ['cambridgeuniversitypress', 'cambridgecore'], official: ['cambridge.org'] },
  { name: 'MDPI', keys: ['mdpi'], official: ['mdpi.com'] },
  { name: 'De Gruyter', keys: ['degruyter'], official: ['degruyter.com', 'degruyterbrill.com'] },
  { name: 'Brill', keys: ['=brill'], official: ['brill.com', 'degruyterbrill.com'] },
  { name: 'Inderscience', keys: ['inderscience'], official: ['inderscience.com', 'inderscienceonline.com'] },
  { name: 'KeAi', keys: ['keai'], official: ['keaipublishing.com'] },
  { name: 'Pleiades Publishing', keys: ['pleiadespublishing'], official: ['pleiades.online'] },
  { name: 'Frontiers', keys: ['frontiersin', 'frontiers'], official: ['frontiersin.org'] },
  { name: 'World Scientific', keys: ['worldscientific'], official: ['worldscientific.com', 'wspc.com', 'wspc.com.sg'] },
  { name: 'Bentham Science', keys: ['bentham'], official: ['benthamscience.com', 'benthamopen.com', 'eurekaselect.com'] },
  { name: 'Thieme', keys: ['thieme'], official: ['thieme.com', 'thieme.de', 'thieme-connect.com', 'thieme-connect.de'] },
  { name: 'Karger', keys: ['karger'], official: ['karger.com'] },
  { name: 'IOP Publishing', keys: ['ioppublishing'], official: ['ioppublishing.org', 'iop.org'] },
  { name: 'American Chemical Society', keys: ['acspubs'], official: ['acs.org'] },
  { name: 'Intellect', keys: ['intellectbooks'], official: ['intellectbooks.com', 'intellectbooks.co.uk'] },
  { name: 'American Psychological Association', keys: ['apapsycnet'], official: ['apa.org'] },
  { name: 'IGI Global', keys: ['igiglobal', 'igi'], official: ['igi-global.com'] },
  { name: 'John Benjamins', keys: ['johnbenjamins', '=benjamins'], official: ['benjamins.com', 'benjamins.nl'] },
  { name: 'ACM', keys: ['acm'], official: ['acm.org'], sponsor: true },
  { name: 'BMJ', keys: ['bmj'], official: ['bmj.com'] },
  { name: 'Dove Medical Press', keys: ['dovepress'], official: ['dovepress.com'] },
  { name: 'Royal Society of Chemistry', keys: ['rscpublishing'], official: ['rsc.org'] },
  { name: 'Duke University Press', keys: ['dukeupress'], official: ['dukeupress.edu'] },
  { name: 'University of Toronto Press', keys: ['utorontopress'], official: ['utorontopress.com'] },
  { name: 'Il Mulino', keys: ['=mulino'], official: ['mulino.it'] },
  { name: 'Galenos', keys: ['galenos'], official: ['galenos.com.tr'] },
  { name: 'Common Ground Research Networks', keys: ['cgnetworks'], official: ['cgnetworks.org'] },
  { name: 'Edinburgh University Press', keys: ['euppublishing'], official: ['euppublishing.com'] },
  { name: 'AME Publishing', keys: ['amegroups'], official: ['amegroups.com', 'amegroups.cn', 'amegroups.org'] },
  { name: 'Liverpool University Press', keys: ['liverpooluniversitypress'], official: ['liverpooluniversitypress.co.uk'] },
  { name: 'Penn State University Press', keys: ['psupress'], official: ['psupress.org'] },
  { name: 'Copernicus Publications', keys: ['copernicuspublications'], official: ['copernicus.org'] },
  { name: 'EDP Sciences', keys: ['edpsciences'], official: ['edpsciences.org'] },
  { name: 'Akademiai Kiado', keys: ['akjournals', 'akademiai'], official: ['akjournals.com', 'akademiai.hu'] },
  { name: 'Hindawi', keys: ['hindawi'], official: ['hindawi.com', 'wiley.com'] },
  { name: 'PLOS', keys: ['plos'], official: ['plos.org'] },
  { name: 'Scopus', keys: ['scopus'], official: ['scopus.com', 'elsevier.com'] },
  { name: 'Clarivate', keys: ['clarivate', 'webofscience'], official: ['clarivate.com', 'webofscience.com'] }
];

var INVITE_WORDS = /\b(invit\w*|call for (papers|chapters|abstracts|submissions)|submit\w*|submission|manuscript|reviewers?|review request|peer review|special issue|editorial board|register|registration|abstract deadline|deadline|publish your|accepted for publication|acceptance|article processing charge|apc|contribute|mini[\s\-]review|case report|need (one|an|your) (article|paper|manuscript)|lack (a|one) (single )?(article|paper)|(one|single) article (short|for)|speaker (opportunity|invitation|guidelines)|(featured|keynote|invited|distinguished|renowned) speaker|upcoming issue|volume \d+,? issue \d+)\b/i;
var PREDATORY = {
  shortfall: /(short of|shortfall|in need of|need (of )?one|one article)[^.\n]{0,80}(volume|issue|release)|volume\s*\d+[^.\n]{0,15}issue\s*\d+[^.\n]{0,60}(short|need|complet|release)/i,
  shortpiece: /\b(2|two)[- ]page\b|\bmini[- ]?reviews?\b|\bopinion (piece|article)s?\b/i,
  rapid: /(publication|publish(?:ed)?|decision|review|acceptance)[^.\n]{0,25}?(?:within|in|time|:)\s*:?\s*(\d+)\s*(hours|hrs|days?)\b/ig,
  urgent: /within\s*24\s*(hrs|hours)|acknowledge[^.\n]{0,30}24/i,
  speaker: /(invite|invitation|join)[^.\n]{0,80}(as a|as an|as our|to be a)[^.\n]{0,20}speaker|renowned speaker/i,
  award: /(provisionally selected|nominate|nomination)[^.\n]{0,60}(award|editorial board)/i,
  feebait: /(waiver|discount|\d+\s*% off)[^.\n]{0,40}(publication|processing|apc|charges|fee)/i,
  pressure: /second time|didn'?t get back|did not get back|have not heard back|final follow-?up/i
};
var FAKE_METRICS = /\b(cosmos impact factor|global impact factor|universal impact factor|general impact factor|sjif|scientific journal impact factor|index copernicus value|icv|citefactor|i2or|isi impact factor|isi\s*:\s*\d|advanced sciences index|journal impact factor\s*\(jif\)\s*:?\s*\d)/i;
var ACADEMIC_WORDS = /\b(journal|conference|manuscript|call for papers|call for chapters|special issue|editorial board|editor|reviewers?|review request|invitation to review|peer review|proceedings|symposium|congress|summit|publication|publish|issn|scopus|book|chapter|article|paper|submission|submit your)\b/i;
var PAYMENT_WORDS = /\b(apc|article processing charge|publication fee|registration fee|processing fee|bank transfer|wire transfer|western union|paypal|pay the|payment)\b/i;
var EMAIL_SUBMISSION = /(send|submit|email|e-mail|forward|share)[^.\n]{0,60}(manuscript|paper|article)[^.\n]{0,60}(to this e-?mail|to our e-?mail|to our mail|by e-?mail|as an attachment|via e-?mail)|reply[^.\n]{0,40}(with|attach)[^.\n]{0,30}(manuscript|paper)/i;

// ===== Text in two languages =====
var T = {
  en: {
    subtitle: 'Academic invitation verification',
    open: 'Open an invitation email to check it.',
    meaning: 'What the colors mean',
    legendMain: { danger: 'Likely fake. Do not reply or pay.', warning: 'Not verified. Treat as suspicious until you check.', success: 'Publisher or journal verified.' },
    legendChecks: { danger: 'strong warning', warning: 'weak warning', success: 'passed', unknown: 'no data' },
    notAcademic: 'This email does not look like an academic invitation.',
    checks: 'Checks', details: 'Message details', sender: 'Sender', links: 'Link domains', none: 'None',
    na: '{n} checks not applicable',
    why: 'Why?', how: 'How was this decided?  ·  {n} security checks', verified: 'Verified with: {s}',
    src: { pub: 'publisher list', reg: 'domain registry', crossref: 'Crossref', scopus: 'Scopus', list: 'hijacked journals list', auth: 'email authentication', doaj: 'DOAJ' }, site: 'Real site', scopus: 'Scopus', pay: 'Asks for payment',
    unknownSite: 'Unknown', yes: 'Yes', no: 'No',
    checkIssn: 'Check this journal on the ISSN portal', checkScopus: 'Check this journal on Scopus',
    checkConf: 'Check this conference in {p} library',
    scopusState: { conf: 'Conference in Scopus {y}', mismatch: 'ISSN of another journal', yes: 'Indexed', no: 'Not indexed', absent: 'Not in Scopus', stopped: 'No longer indexed', removed: 'Removed by Scopus', none: 'Not mentioned', nojournal: 'No journal named', off: 'Not checked' },
    reasons: {
      pubFake: 'This email pretends to be from {p}, but it was not sent from the {p} website.',
      hijacked: 'The website is on the list of hijacked journals.',
      issnOther: 'The ISSN in the email belongs to a different journal.',
      issnUnknown: 'The ISSN in the email was not found.',
      idxFake: 'The email says the journal is in Scopus, but it is not.',
      idxNotFound: 'The email mentions Scopus, but no journal with this name was found there.',
      idxStopped: 'The email says the journal is in Scopus, but Scopus no longer indexes it (last covered year: {y}).',
      idxRemoved: 'The email says the journal is in Scopus, but Scopus removed it from its index (last covered year: {y}).',
      webOff: 'The links do not go to the official {p} website.',
      ageNew: 'The website was created only {n} ago.',
      authFail: 'The sender address could not be verified.',
      reqPay: 'The email asks you to pay a fee.',
      reqMail: 'The email asks you to send your paper by email.',
      reqBoth: 'The email asks you to pay a fee and to send your paper by email.',
      files: 'The email has a risky attachment or file link.',
      okPub: 'Sent from the official {p} website.',
      okDoaj: 'Sent from the official website of the journal {t}, as listed in DOAJ.',
      okConf: 'The conference {a} is real: Scopus lists its proceedings {y}{p}, and the sender is its own.',
      okScopus: 'The journal {t} is verified in Scopus.',
      lookalike: 'The address imitates the {p} website ({w}).',
      idn: 'The address uses look-alike characters to imitate a real website.',
      nameFake: 'The sender name says {p}, but the email did not come from {p}.',
      nameConf: 'The conference uses the {p} name. Many real conferences do this, so check that {p} lists it.',
      signFake: 'The email is signed as {p}, but it did not come from {p}.',
      replyDiff: 'Your reply would go to a different address ({r}).',
      okAll: 'None of the checks found a problem.',
      metricsFake: 'The email uses impact factors that are not real journal metrics.',
      predatory: 'The email follows known predatory publishing patterns: {l}.',
      unverified: 'This email is not linked to any known publisher or journal, so it could not be verified.',
      realJournalOtherSender: 'The journal {t} is real, but this email was not sent from its publisher or a known submission system.'
    },
    units: { day: ['day', 'days'], month: ['month', 'months'], year: ['year', 'years'], and: ' and ' },
    verdict: { danger: 'LIKELY FAKE', warning: 'NOT VERIFIED', success: 'LOOKS GENUINE' },
    advice: { danger: 'Do not reply, do not send your paper, and do not pay any fee.',
              warning: "Treat as suspicious. Don't reply, click, or pay until you check the journal yourself.",
              success: 'No warning signs found. Still confirm on the official website before you pay any fee.' },
    c: { publisher: 'Publisher name', hijacked: 'Hijacked journals list', issn: 'ISSN', indexing: 'Indexing claim',
         website: 'Official website', age: 'Domain age', auth: 'Sender authentication', requests: 'Risky requests', files: 'Dangerous attachments', name: 'Sender name', reply: 'Reply address', metrics: 'Journal metrics', predatory: 'Predatory patterns' },
    d: {
      pubFake: '{d} is not a {p} domain',
      pubOk: '{d} is an official {p} domain',
      doajOk: '{d} is the website of {t} in DOAJ',
      confOk: '{a} proceedings in Scopus {y}{p}',
      confDomain: '{d} carries the name {a} and was registered in {y}, before its last edition',
      confPlatform: '{d} is a known conference platform, and {a} is in Scopus',
      nameSponsorOk: 'Name mentions {p}, and Scopus lists {p} as the publisher',
      pubNone: 'No known publisher name in the domains',
      listOff: 'List not loaded yet',
      listHit: '{d} is in the hijacked journals list',
      listOk: 'Not in the list',
      issnNone: 'No ISSN in the message',
      issnScopus: '{i} (Scopus)',
      issnUnknown: 'ISSN {i} not found in Crossref',
      issnOther: 'ISSN {i} belongs to another journal: {t}',
      issnOk: 'ISSN {i} matches {t}',
      issnFail: 'Could not check the ISSN',
      idxNone: 'No indexing claim',
      idxMismatch: 'Not checked: the ISSN belongs to another journal',
      idxAbsent: '{i} is not in Scopus (the email does not claim it is)',
      idxNotFound: 'Says Scopus, but no journal named {i} was found',
      idxInfo: '{i}: {s} (the email does not claim Scopus)',
      idxOff: 'Mentions Scopus; Scopus key not set yet',
      idxNoJournal: 'Mentions Scopus, but no journal name or ISSN',
      idxFake: 'Says Scopus, but {i} is not in Scopus',
      idxOk: '{i} is in Scopus',
      idxStopped: '{i} is no longer indexed (last covered year: {y})',
      idxRemoved: '{i} was removed by Scopus (last covered year: {y})',
      webOff: 'Links do not go to {w}',
      webOk: 'Links go to {w}',
      webNone: 'Publisher website unknown',
      ageNew: 'Registered {n} ago',
      ageOld: 'Registered {n} ago',
      ageNone: 'Registration date not available for {d}',
      authOk: 'SPF and DKIM pass',
      authDkim: 'DKIM passes',
      authSpf: 'SPF passes',
      authFail: 'Sender authentication failed',
      authNone: 'No authentication result',
      reqPay: 'Asks for a payment',
      reqMail: 'Asks you to send your paper by email',
      reqBoth: 'Asks for a payment and for your paper by email',
      reqNone: 'No payment or email submission request',
      reqTrusted: 'Requests come from a verified sender',
      fileBad: 'Risky file: {f}',
      fileLink: 'Link to a file server instead of a website',
      fileOk: 'No risky attachments or file links',
      metricsFake: 'Uses a misleading metric: {m}',
      metricsOk: 'No misleading metrics',
      predFound: 'Found: {l}',
      predNone: 'No predatory patterns',
      predTrusted: 'Not checked: verified sender',
      pat: { shortfall: '"one article short" of an issue', shortpiece: 'asks for a 2-page or mini review', rapid: 'publication in days or hours', urgent: 'reply within 24 hours', speaker: 'speaker invitation', award: 'award or editorial board nomination', feebait: 'fee waiver or discount', pressure: 'repeated follow-up pressure' },
      lookalike: '{d} imitates {w}',
      idn: '{d} uses look-alike characters',
      nameFake: 'Name says {p}, but the address is {d}',
      nameConf: 'Name mentions {p}; address is {d}. Check that {p} lists this conference',
      signFake: 'Signed as {p}, but the address is {d}',
      nameOk: 'Sender name matches the address',
      replyDiff: 'Replies go to {r}',
      replyFree: 'Replies go to a personal mailbox: {r}',
      replyOk: 'Replies go to the sender',
      listBad: 'Scopus list failed the integrity check'
    }
  },
  ar: {
    subtitle: 'التحقق من الدعوات الأكاديمية',
    open: 'افتح رسالة دعوة لفحصها.',
    meaning: 'معنى الألوان',
    legendMain: { danger: 'على الأرجح مزيفة. لا ترد ولا تدفع.', warning: 'غير موثقة. تعامل معها كمشبوهة حتى تتحقق.', success: 'تم التحقق من الناشر أو المجلة.' },
    legendChecks: { danger: 'تحذير قوي', warning: 'تحذير ضعيف', success: 'ناجح', unknown: 'لا توجد بيانات' },
    notAcademic: 'هذه الرسالة لا تبدو دعوة أكاديمية.',
    checks: 'الفحوصات', details: 'بيانات الرسالة', sender: 'المرسل', links: 'نطاقات الروابط', none: 'لا يوجد',
    na: '{n} فحوصات لا تنطبق',
    why: 'لماذا؟', how: 'كيف تم الحكم؟  ·  {n} فحوصات أمنية', verified: 'تم التحقق عبر: {s}',
    src: { pub: 'قائمة الناشرين', reg: 'سجل النطاقات', crossref: 'Crossref', scopus: 'Scopus', list: 'قائمة المجلات المسروقة', auth: 'توثيق البريد', doaj: 'DOAJ' }, site: 'الموقع الحقيقي', scopus: 'سكوبس', pay: 'يطلب دفع رسوم',
    unknownSite: 'غير معروف', yes: 'نعم', no: 'لا',
    checkIssn: 'تحقق من المجلة على بوابة ISSN', checkScopus: 'تحقق من المجلة على Scopus',
    checkConf: 'تحقق من المؤتمر في مكتبة {p}',
    scopusState: { conf: 'مؤتمر في Scopus {y}', mismatch: 'رقم ISSN لمجلة أخرى', yes: 'مفهرسة', no: 'غير مفهرسة', absent: 'ليست في Scopus', stopped: 'لم تعد مفهرسة', removed: 'حذفها Scopus', none: 'غير مذكور', nojournal: 'لا توجد مجلة محددة', off: 'لم يفحص' },
    reasons: {
      pubFake: 'هذه الرسالة تدعي أنها من {p}، لكنها لم ترسل من موقع {p}.',
      hijacked: 'الموقع موجود في قائمة المجلات المسروقة.',
      issnOther: 'رقم ISSN في الرسالة يخص مجلة أخرى.',
      issnUnknown: 'رقم ISSN في الرسالة غير موجود.',
      idxFake: 'الرسالة تقول إن المجلة في Scopus، وهي ليست فيه.',
      idxNotFound: 'الرسالة تذكر Scopus، لكن لم نجد فيه مجلة بهذا الاسم.',
      idxStopped: 'الرسالة تقول إن المجلة في Scopus، لكن Scopus لم يعد يفهرسها، وآخر سنة مغطاة {y}.',
      idxRemoved: 'الرسالة تقول إن المجلة في Scopus، لكن Scopus حذفها من فهرسه، وآخر سنة مغطاة {y}.',
      webOff: 'الروابط لا تؤدي إلى الموقع الرسمي لـ {p}.',
      ageNew: 'الموقع أنشئ منذ {n} فقط.',
      authFail: 'تعذر التحقق من عنوان المرسل.',
      reqPay: 'الرسالة تطلب دفع رسوم.',
      reqMail: 'الرسالة تطلب إرسال البحث بالبريد.',
      reqBoth: 'الرسالة تطلب دفع رسوم وإرسال البحث بالبريد.',
      files: 'الرسالة فيها مرفق أو رابط ملف خطير.',
      okPub: 'مرسلة من الموقع الرسمي لـ {p}.',
      okDoaj: 'مرسلة من الموقع الرسمي لمجلة {t} كما هو مسجل في DOAJ.',
      okConf: 'مؤتمر {a} حقيقي: Scopus يدرج أعماله {y}{p}، والمرسل تابع له.',
      okScopus: 'تم التحقق من مجلة {t} في Scopus.',
      lookalike: 'العنوان يقلد موقع {p} ({w}).',
      idn: 'العنوان يستخدم حروفا شبيهة لتقليد موقع حقيقي.',
      nameFake: 'اسم المرسل يقول {p}، لكن الرسالة لم تأت من {p}.',
      nameConf: 'المؤتمر يستخدم اسم {p}. مؤتمرات حقيقية كثيرة تفعل ذلك، فتأكد أن {p} يدرج هذا المؤتمر.',
      signFake: 'الرسالة موقعة باسم {p}، لكنها لم تأت من {p}.',
      replyDiff: 'ردك سيذهب إلى عنوان آخر ({r}).',
      okAll: 'لم تجد الفحوصات أي مشكلة.',
      metricsFake: 'الرسالة تستخدم معاملات تأثير ليست مقاييس حقيقية للمجلات.',
      predatory: 'الرسالة تتبع أنماط النشر المفترس المعروفة: {l}.',
      unverified: 'هذه الرسالة غير مرتبطة بأي ناشر أو مجلة معروفة، لذلك تعذر التحقق منها.',
      realJournalOtherSender: 'مجلة {t} حقيقية، لكن هذه الرسالة لم ترسل من ناشرها أو من نظام تقديم معروف.'
    },
    units: { day: ['يوم', 'أيام'], month: ['شهر', 'أشهر'], year: ['سنة', 'سنوات'], and: ' و' },
    verdict: { danger: 'على الأرجح مزيف', warning: 'غير موثق', success: 'يبدو سليما' },
    advice: { danger: 'لا ترد، ولا ترسل بحثك، ولا تدفع أي رسوم.',
              warning: 'تعامل معها كرسالة مشبوهة. لا ترد ولا تضغط على الروابط ولا تدفع حتى تتحقق من المجلة بنفسك.',
              success: 'لم تظهر علامات تحذير. تأكد من الموقع الرسمي قبل دفع أي رسوم.' },
    c: { publisher: 'اسم الناشر', hijacked: 'قائمة المجلات المسروقة', issn: 'رقم ISSN', indexing: 'ادعاء الفهرسة',
         website: 'الموقع الرسمي', age: 'عمر النطاق', auth: 'توثيق المرسل', requests: 'طلبات خطيرة', files: 'مرفقات خطيرة', name: 'اسم المرسل', reply: 'عنوان الرد', metrics: 'مقاييس المجلة', predatory: 'أنماط النشر المفترس' },
    d: {
      pubFake: 'النطاق {d} ليس نطاقا رسميا لـ {p}',
      pubOk: 'النطاق {d} نطاق رسمي لـ {p}',
      doajOk: 'النطاق {d} هو موقع مجلة {t} في DOAJ',
      confOk: 'أعمال {a} في Scopus {y}{p}',
      confDomain: 'النطاق {d} يحمل اسم {a} وسجل في {y} قبل آخر دورة له',
      confPlatform: 'النطاق {d} منصة مؤتمرات معروفة، و{a} في Scopus',
      nameSponsorOk: 'الاسم يذكر {p}، وScopus يذكر {p} ناشرا',
      pubNone: 'لا يوجد اسم ناشر معروف في النطاقات',
      listOff: 'القائمة غير محملة بعد',
      listHit: 'النطاق {d} موجود في قائمة المجلات المسروقة',
      listOk: 'غير موجود في القائمة',
      issnNone: 'لا يوجد رقم ISSN في الرسالة',
      issnScopus: '{i} من Scopus',
      issnUnknown: 'الرقم {i} غير موجود في Crossref',
      issnOther: 'الرقم {i} يخص مجلة أخرى: {t}',
      issnOk: 'الرقم {i} يطابق {t}',
      issnFail: 'تعذر فحص الرقم',
      idxNone: 'لا يوجد ادعاء فهرسة',
      idxMismatch: 'لم يفحص: رقم ISSN يخص مجلة أخرى',
      idxAbsent: '{i} ليست في Scopus، والرسالة لا تدعي ذلك',
      idxNotFound: 'تذكر Scopus، ولم نجد مجلة باسم {i}',
      idxInfo: '{i}: {s}، والرسالة لا تدعي Scopus',
      idxOff: 'تذكر Scopus، ومفتاح Scopus غير مضبوط بعد',
      idxNoJournal: 'تذكر Scopus، لكن بدون اسم مجلة أو رقم ISSN',
      idxFake: 'تذكر Scopus، لكن {i} غير موجودة فيه',
      idxOk: '{i} موجودة في Scopus',
      idxStopped: '{i} لم تعد مفهرسة، وآخر سنة مغطاة {y}',
      idxRemoved: '{i} حذفها Scopus، وآخر سنة مغطاة {y}',
      webOff: 'الروابط لا تؤدي إلى {w}',
      webOk: 'الروابط تؤدي إلى {w}',
      webNone: 'موقع الناشر غير معروف',
      ageNew: 'مسجل منذ {n}',
      ageOld: 'مسجل منذ {n}',
      ageNone: 'تاريخ تسجيل {d} غير متاح',
      authOk: 'نجح فحص SPF و DKIM',
      authDkim: 'نجح فحص DKIM',
      authSpf: 'نجح فحص SPF',
      authFail: 'فشل توثيق المرسل',
      authNone: 'لا توجد نتيجة توثيق',
      reqPay: 'تطلب دفع رسوم',
      reqMail: 'تطلب إرسال البحث بالبريد',
      reqBoth: 'تطلب دفع رسوم وإرسال البحث بالبريد',
      reqNone: 'لا توجد طلبات دفع أو إرسال بالبريد',
      reqTrusted: 'الطلبات صادرة عن مرسل موثق',
      fileBad: 'ملف خطير: {f}',
      fileLink: 'رابط إلى خادم ملفات بدلا من موقع ويب',
      fileOk: 'لا توجد مرفقات أو روابط ملفات خطيرة',
      metricsFake: 'تستخدم مقياسا مضللا: {m}',
      metricsOk: 'لا توجد مقاييس مضللة',
      predFound: 'تم العثور على: {l}',
      predNone: 'لا توجد أنماط نشر مفترس',
      predTrusted: 'لم يفحص: المرسل موثق',
      pat: { shortfall: 'نقص مقالة لإكمال عدد', shortpiece: 'طلب مقال من صفحتين أو مراجعة قصيرة', rapid: 'نشر خلال أيام أو ساعات', urgent: 'الرد خلال 24 ساعة', speaker: 'دعوة كمتحدث', award: 'ترشيح لجائزة أو هيئة تحرير', feebait: 'إعفاء أو خصم من الرسوم', pressure: 'ضغط بالمتابعة المتكررة' },
      lookalike: 'النطاق {d} يقلد {w}',
      idn: 'النطاق {d} يستخدم حروفا شبيهة',
      nameFake: 'الاسم يقول {p} لكن العنوان {d}',
      nameConf: 'الاسم يذكر {p} والعنوان {d}. تأكد أن {p} يدرج هذا المؤتمر',
      signFake: 'موقعة باسم {p} لكن العنوان {d}',
      nameOk: 'اسم المرسل يطابق العنوان',
      replyDiff: 'الرد يذهب إلى {r}',
      replyFree: 'الرد يذهب إلى بريد شخصي: {r}',
      replyOk: 'الرد يذهب إلى المرسل',
      listBad: 'قائمة Scopus فشلت في فحص السلامة'
    }
  }
};

function fill(s, v) { return s.replace(/\{(\w)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; }); }
function langOf(e) {
  var loc = (e && e.commonEventObject && e.commonEventObject.userLocale) || Session.getActiveUserLocale() || 'en';
  return loc.toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
}

// ===== Entry points =====
function onHomepage(e) {
  var lang = langOf(e), L = T[lang];
  var sec = CardService.newCardSection().addWidget(CardService.newTextParagraph().setText('<b>' + L.open + '</b>'));
  var legend = CardService.newCardSection().setHeader(L.meaning);
  ['danger', 'warning', 'success'].forEach(function (lv) {
    legend.addWidget(CardService.newDecoratedText()
      .setText('<font color="' + COLORS[lv] + '"><b>' + SYMBOLS[lv] + '  ' + L.verdict[lv] + '</b></font>')
      .setBottomLabel(L.legendMain[lv]).setWrapText(true));
  });
  return CardService.newCardBuilder().addSection(sec).addSection(legend).build();
}

function onGmailMessage(e) {
  var lang = langOf(e), L = T[lang];
  GmailApp.setCurrentMessageAccessToken(e.gmail.accessToken);
  var message = GmailApp.getMessageById(e.gmail.messageId);
  var a = analyzeMessage(message, lang);
  if (!a) return simpleCard(L, L.notAcademic);
  return buildCard(lang, L, a.senderEmail, a.linkHosts, a.checks, a.ctx);
}

// Runs every check on one message. Returns null when the message is not an academic invitation.
// The evaluation script calls this function directly.
function analyzeMessage(message, lang) {
  var L = T[lang];

  var from = message.getFrom();
  var displayName = from.replace(/<[^>]*>/, '').replace(/["']/g, '').trim();
  var m = from.match(/<([^>]+)>/);
  var senderEmail = (m ? m[1] : from).trim().toLowerCase();
  var senderDomain = registrable(senderEmail.split('@')[1] || '');
  var subject = message.getSubject() || '';
  var body = message.getPlainBody() || '';
  var text = subject + '\n' + body;

  var probe = displayName + '\n' + text;
  if (!ACADEMIC_WORDS.test(probe) || !INVITE_WORDS.test(probe)) return null;

  var linkHosts = [];
  (body.match(/https?:\/\/[^\s"'<>)\]]+/g) || []).forEach(function (u) {
    u = unwrapLink(u);
    var h = u.replace(/^https?:\/\//, '').split(/[\/?#:]/)[0].toLowerCase();
    if (h && IGNORED_LINK_HOSTS.indexOf(registrable(h)) === -1 && linkHosts.indexOf(h) === -1) linkHosts.push(h);
  });
  var linkDomains = unique(linkHosts.map(registrable));
  var allDomains = unique([senderDomain].concat(linkDomains));
  var issn = findIssn(text);
  var journalNames = journalCandidates(text, subject, displayName);

  var journal = issn ? lookupIssn(issn) : null;
  var checks = [
    checkPublisher(L, allDomains),
    checkIssn(L, issn, journal, text),
    checkIndexing(L, issn, journalNames, text),
    checkWebsite(L, journal, allDomains, linkDomains),
    checkDomainAge(L, senderDomain),
    checkAuth(L, message),
    checkRequests(L, text, senderDomain),
    checkFiles(L, message, body),
    checkSenderName(L, displayName, senderDomain, body),
    checkReplyTo(L, message, senderDomain),
    checkMetrics(L, text),
    checkPredatory(L, text, senderDomain)
  ];
  // A verified publisher naming its own journal: a name we could not find in Scopus says nothing against it.
  if (checks[0].status === 'success' && checks[2].byName) checks[2] = R('unknown', L.c.indexing, checks[2].detail, '', { scopus: 'absent' });
  // If the ISSN belongs to another journal, the Scopus result is about that other journal: do not show it as this journal's status
  if (checks[1].status === 'danger' && checks[2].scopus && checks[2].scopus !== 'none') {
    checks[2] = R('unknown', L.c.indexing, L.d.idxMismatch, '', { scopus: 'mismatch' });
  }
  // If the email has no ISSN but Scopus found the journal, show the journal's ISSN from Scopus
  var idx = checks[2], iss = checks[1];
  if (!issn && idx.scopusIssn && iss.status === 'unknown') {
    var raw = String(idx.scopusIssn).replace(/[^0-9Xx]/g, '').toUpperCase();
    if (raw.length === 8) checks[1] = R('success', L.c.issn, fill(L.d.issnScopus, { i: raw.substr(0, 4) + '-' + raw.substr(4) }), '', { src: 'scopus' });
  }
  // A small journal outside the publisher list: the sender is verified if its domain is the journal's own website in DOAJ.
  checkDoaj(L, checks, issn || idx.scopusIssn || '', senderDomain, text);
  // A conference in the Scopus conference list: real conference, and maybe a verified sender
  applyConference(L, checks, conferenceInScopus(subject + '\n' + text), senderDomain);
  // A conference that claims IEEE or ACM: offer a search in the sponsor's own library
  var sponsor = checks[8].sponsor || sponsorClaim(subject + '\n' + text);
  var conf = sponsor ? conferenceQuery(subject + '\n' + text) : '';
  return { senderEmail: senderEmail, linkHosts: linkHosts, checks: checks,
    ctx: { platform: PLATFORMS.indexOf(senderDomain) !== -1, issn: issn || (checks[2].scopusIssn || ''), sponsor: sponsor, conf: conf } };
}

// ===== Helpers =====
function unique(a) { var o = []; a.forEach(function (x) { if (x && o.indexOf(x) === -1) o.push(x); }); return o; }
function registrable(host) {
  if (!host) return '';
  var p = host.toLowerCase().replace(/\.$/, '').split('.');
  if (p.length <= 2) return p.join('.');
  var sld = p[p.length - 2], tld = p[p.length - 1];
  var n = (tld.length === 2 && ['co', 'ac', 'com', 'edu', 'org', 'gov', 'net'].indexOf(sld) !== -1) ? 3 : 2;
  return p.slice(-n).join('.');
}
// An ISSN has a check digit. Numbers like manuscript IDs (2026-2445) or dates rarely pass it.
function issnValid(s) {
  var d = String(s).replace(/[^0-9Xx]/g, '').toUpperCase();
  if (d.length !== 8) return false;
  var sum = 0;
  for (var i = 0; i < 7; i++) sum += parseInt(d.charAt(i), 10) * (8 - i);
  var c = (11 - sum % 11) % 11;
  return d.charAt(7) === (c === 10 ? 'X' : String(c));
}
function findIssn(text) {
  var all = text.match(/\b\d{4}-\d{3}[\dXx]\b/g) || [];
  var named = (text.match(/ISSN[^0-9]{0,25}(\d{4}-\d{3}[\dXx])\b/i) || [])[1];
  if (named && issnValid(named)) return named.toUpperCase();
  for (var i = 0; i < all.length; i++) if (issnValid(all[i])) return all[i].toUpperCase();
  return '';
}
function norm(s) { return (s || '').toLowerCase().replace(/&amp;/g, 'and').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim(); }
function publisherOf(name) {
  var n = norm(name);
  for (var i = 0; i < PUBLISHERS.length; i++) {
    if (brandIn(PUBLISHERS[i], name || '')) return PUBLISHERS[i];
  }
  return null;
}
function publisherInDomains(domains) {
  for (var i = 0; i < domains.length; i++)
    for (var j = 0; j < PUBLISHERS.length; j++)
      if (PUBLISHERS[j].official.indexOf(domains[i]) !== -1 || PUBLISHERS[j].keys.some(function (k) { return keyIn(k, domains[i]); }))
        return PUBLISHERS[j];
  return null;
}
function lookupIssn(issn) {
  try {
    var r = UrlFetchApp.fetch('https://api.crossref.org/journals/' + issn, { muteHttpExceptions: true });
    if (r.getResponseCode() === 404) return { found: false };
    if (r.getResponseCode() !== 200) return null;
    var msg = JSON.parse(r.getContentText()).message;
    return { found: true, title: msg.title || '', publisher: msg.publisher || '' };
  } catch (err) { return null; }
}
function ageText(L, days) {
  function u(n, k) { return n + ' ' + L.units[k][n === 1 ? 0 : 1]; }
  if (days < 60) return u(days, 'day');
  if (days < 365) return u(Math.floor(days / 30), 'month');
  var y = Math.floor(days / 365), mo = Math.floor((days % 365) / 30);
  return mo ? u(y, 'year') + L.units.and + u(mo, 'month') : u(y, 'year');
}
function R(status, title, detail, why, extra) {
  var r = { status: status, title: title, detail: detail, why: why || '' };
  for (var k in (extra || {})) r[k] = extra[k];
  return r;
}

// Links added by mail systems, not by the sender
var IGNORED_LINK_HOSTS = ['aka.ms', 'outlook.com', 'office.com', 'office365.com', 'microsoft.com', 'google.com', 'gstatic.com', 'googleusercontent.com'];

function unwrapLink(u) {
  // Outlook SafeLinks and Google redirects hide the real address in a parameter
  var m = u.match(/safelinks\.protection\.outlook\.com\/?\?url=([^&]+)/i) || u.match(/google\.com\/url\?(?:.*&)?q=([^&]+)/i);
  if (m) { try { return decodeURIComponent(m[1]); } catch (err) { return u; } }
  return u;
}

// Short brand words (like sage, ieee, mdpi) and words marked with '=' must match a whole word;
// longer ones may be part of a word (so 'elsevier-journals' still matches).
function keyIn(key, s) {
  var whole = key.length <= 4 || key.charAt(0) === '=';
  key = key.replace(/^=/, '');
  if (whole) return (' ' + s.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ').indexOf(' ' + key + ' ') !== -1;
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '').indexOf(key) !== -1;
}
function brandIn(p, s) {
  return p.keys.some(function (k) { return keyIn(k, s); }) || (' ' + norm(s) + ' ').indexOf(' ' + norm(p.name) + ' ') !== -1;
}

// Submission platforms that send email for many publishers
var PLATFORMS = ['editorialmanager.com', 'manuscriptcentral.com', 'scholarone.com', 'ejournalpress.com', 'easychair.org', 'openreview.net', 'softconf.com', 'researchsquare.com', 'evise.com', 'edas.info'];
var FREE_MAIL = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'aol.com', '163.com', '126.com', 'qq.com', 'yandex.com', 'mail.ru', 'proton.me', 'protonmail.com', 'gmx.com', 'zoho.com', 'icloud.com'];

function skeleton(label) {
  return label.toLowerCase().replace(/rn/g, 'm').replace(/vv/g, 'w').replace(/0/g, 'o').replace(/[1i]/g, 'l')
    .replace(/3/g, 'e').replace(/5/g, 's').replace(/[^a-z]/g, '');
}
function editDistance(a, b) {
  var d = []; for (var i = 0; i <= a.length; i++) { d[i] = [i]; }
  for (var j = 1; j <= b.length; j++) d[0][j] = j;
  for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// Official domains too short or too common to compare with (ceii.asia would look like cell.com).
var NO_LOOKALIKE = ['cell.com'];

function lookalikeOf(domain) {
  var label = domain.split('.')[0];
  if (label.length < 4) return null;
  var sk = skeleton(label);
  for (var i = 0; i < PUBLISHERS.length; i++) {
    var p = PUBLISHERS[i];
    if (p.official.indexOf(domain) !== -1) return null;
    for (var j = 0; j < p.official.length; j++) {
      if (NO_LOOKALIKE.indexOf(p.official[j]) !== -1) continue;
      var target = skeleton(p.official[j].split('.')[0]);
      if ((target.length >= 4 && sk === target) || (target.length >= 5 && editDistance(sk, target) <= 1)) return { p: p, w: p.official[j] };
    }
  }
  return null;
}

// "Daryl Feng" or "Zhipeng Cai" are people, not journals. "Computer Networks" has a subject word, so it is a journal.
var SUBJECT_WORDS = /\b(journal|transactions|review|letters|research|sciences?|computing|computers?|engineering|networks?|systems?|technology|medicine|medical|health|security|intelligence|informatics|applications?|studies|bulletin|annals|archives|reports?|sensors|electronics|access|materials|chemistry|physics|biology|molecules|mathematics|energy|innovation|management|education|economics|cybersecurity|things|cluster|data|learning|communications?|discover)\b/i;
function looksLikePerson(name) {
  return /^(dr\.?\s+|prof\.?\s+)?[A-Z][a-z]+(\s+[A-Z]\.)?(\s+[A-Z][a-z'\-]+){1,2}$/.test(name.trim()) && !SUBJECT_WORDS.test(name);
}
var GENERIC_NAMES = /\b(service|services|office|team|support|no.?reply|editor|editors|editorial|admin|info|customer|peer review|secretariat|committee|department|center|centre)\b/i;

function journalCandidates(text, subject, displayName) {
  var out = [];
  function add(x) {
    x = (x || '').replace(/\s+/g, ' ').replace(/^(the|a)\s+/i, '').trim();
    if (x.length >= 4 && x.length <= 90 && out.indexOf(x) === -1) out.push(x);
  }
  var m = text.match(/\b(?:International )?(?:Journal|Transactions|Annals|Archives|Review|Letters) (?:of|on|in) [A-Z][A-Za-z&\- ]{3,80}/);
  if (m) add(m[0].split(/ (?:is|has|with|indexed|invites|welcomes|which|that|published|seeks)\b| - /)[0]);
  var sub = subject.match(/(?:submission|manuscript|paper|article)s? (?:to|for|in) (?:the )?(?:journal )?([A-Z][^,.:;!?\n()\[\]]{3,80})/);
  if (sub) add(sub[1]);
  var full = (displayName || '').replace(/\(.*?\)/g, ' ')
    .replace(/\b(editorial|editor|editors|office|team|support|service|services|secretariat|desk|journal office)\b/gi, ' ')
    .replace(/\s+/g, ' ').trim();
  // A display name like "IEEE Access" is a journal; a name that is only the publisher ("Elsevier") or a person is not.
  var onlyPublisher = PUBLISHERS.some(function (p) { return norm(full) === norm(p.name) || p.keys.some(function (k) { return norm(full) === k.replace(/^=/, ''); }); });
  if (full && !GENERIC_NAMES.test(full) && !onlyPublisher && !looksLikePerson(full) && /^[A-Z]/.test(full) && !/@/.test(full)) {
    add(full);
    add(full.replace(/\s+journal\s*$/i, ''));
  }
  return out.slice(0, 3);
}

// ===== The checks =====
// status: danger = strong sign, warning = weak sign, success = passed, unknown = no result
function checkPublisher(L, domains) {
  // The sender address decides first: an email sent from an official publisher domain is trusted,
  // even if quoted text or signatures contain links to the publisher's country websites.
  for (var o = 0; o < PUBLISHERS.length; o++)
    if (domains[0] && PUBLISHERS[o].official.indexOf(domains[0]) !== -1)
      return R('success', L.c.publisher, fill(L.d.pubOk, { d: domains[0], p: PUBLISHERS[o].name }), fill(L.reasons.okPub, { p: PUBLISHERS[o].name }), { site: domains[0] });
  for (var x = 0; x < domains.length; x++) {
    if (domains[x].indexOf('xn--') !== -1)
      return R('danger', L.c.publisher, fill(L.d.idn, { d: domains[x] }), L.reasons.idn, { kind: 'lookalike' });
    var lk = lookalikeOf(domains[x]);
    if (lk) return R('danger', L.c.publisher, fill(L.d.lookalike, { d: domains[x], w: lk.w }), fill(L.reasons.lookalike, { p: lk.p.name, w: lk.w }), { site: lk.w, kind: 'lookalike' });
  }
  for (var i = 0; i < domains.length; i++) for (var j = 0; j < PUBLISHERS.length; j++) {
    var p = PUBLISHERS[j], d = domains[i];
    if (p.keys.some(function (k) { return keyIn(k, d); }) && p.official.indexOf(d) === -1)
      return R('danger', L.c.publisher, fill(L.d.pubFake, { d: d, p: p.name }), fill(L.reasons.pubFake, { p: p.name }), { site: p.official[0], kind: 'brand' });
  }
  // A link to a publisher's website does not prove who sent the email, so only the sender domain can verify it.
  return R('unknown', L.c.publisher, L.d.pubNone);
}

// DOAJ lists open access journals with their official website.
function lookupDoaj(issn) {
  var cache = CacheService.getScriptCache(), key = 'doaj-' + issn;
  var hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  try {
    var r = UrlFetchApp.fetch('https://doaj.org/api/search/journals/issn:' + issn, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return null;
    var res = (JSON.parse(r.getContentText()).results || [])[0];
    var out = { found: false };
    if (res && res.bibjson) {
      var b = res.bibjson, home = (b.ref && b.ref.journal) || '';
      if (!home && b.link) home = (b.link.filter(function (l) { return l.type === 'homepage'; })[0] || {}).url;
      out = { found: true, title: b.title || '', home: home };
    }
    try { cache.put(key, JSON.stringify(out), 86400); } catch (err) {}
    return out;
  } catch (err) { return null; }
}

function checkDoaj(L, checks, issn, senderDomain, text) {
  // Used when the publisher check found nothing, or when Crossref did not know the ISSN. Never when the ISSN is misused.
  var needPub = checks[0].status === 'unknown', needIssn = checks[1].status === 'warning';
  if ((!needPub && !needIssn) || checks[1].status === 'danger') return;
  var id = String(issn).replace(/[^0-9Xx]/g, '').toUpperCase();
  if (id.length !== 8) return;
  var shown = id.substr(0, 4) + '-' + id.substr(4);
  var j = lookupDoaj(shown);
  if (!j || !j.found) return;
  // The email must name this journal, so the ISSN of another journal cannot verify anything.
  var named = norm(j.title) && norm(text).indexOf(norm(j.title)) !== -1;
  var sameAsScopus = checks[2].journalTitle && norm(checks[2].journalTitle) === norm(j.title);
  if (!named && !sameAsScopus) return;
  if (needIssn) checks[1] = R('success', L.c.issn, fill(L.d.issnOk, { i: shown, t: j.title }), '', { src: 'doaj' });
  if (!needPub || !j.home || !senderDomain || FREE_MAIL.indexOf(senderDomain) !== -1) return;
  var host = j.home.replace(/^https?:\/\//i, '').split(/[\/?#:]/)[0];
  if (registrable(host) !== senderDomain) return;
  checks[0] = R('success', L.c.publisher, fill(L.d.doajOk, { d: senderDomain, t: j.title }), fill(L.reasons.okDoaj, { t: j.title }), { site: senderDomain, src: 'doaj' });
}

function checkIssn(L, issn, journal, text) {
  if (!issn) return R('unknown', L.c.issn, L.d.issnNone);
  if (!journal) return R('unknown', L.c.issn, L.d.issnFail);
  if (!journal.found) return R('warning', L.c.issn, fill(L.d.issnUnknown, { i: issn }), L.reasons.issnUnknown, { src: 'crossref' });
  if (norm(text).indexOf(norm(journal.title)) !== -1) return R('success', L.c.issn, fill(L.d.issnOk, { i: issn, t: journal.title }), '', { src: 'crossref' });
  return R('danger', L.c.issn, fill(L.d.issnOther, { i: issn, t: journal.title }), L.reasons.issnOther, { src: 'crossref' });
}

// List of journals that left Scopus, built from the official Scopus Source List
var INACTIVE_FILE = 'scopus-inactive.txt';
var INACTIVE_VERSION = '2026-10';
var INACTIVE_SHA256 = '160a3806a595968fe74b2a5f843866f87097d2a3f16b7c2177d9ec6f013ce14f';

function sha256Hex(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function inactiveList() {
  var cache = CacheService.getScriptCache();
  var key = 'inactive-' + INACTIVE_VERSION;
  var parts = cache.get(key + '-n'), text = '';
  if (parts) {
    var keys = []; for (var i = 0; i < +parts; i++) keys.push(key + '-' + i);
    var got = cache.getAll(keys);
    if (Object.keys(got).length === +parts) keys.forEach(function (k) { text += got[k]; });
  }
  if (!text) {
    var r = UrlFetchApp.fetch(ASSET_BASE + INACTIVE_FILE + '?v=' + INACTIVE_VERSION, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return null;
    text = r.getContentText();
    if (sha256Hex(text) !== INACTIVE_SHA256) return 'TAMPERED';
    var chunks = {}, size = 90000, n = Math.ceil(text.length / size);
    for (var c = 0; c < n; c++) chunks[key + '-' + c] = text.substring(c * size, (c + 1) * size);
    chunks[key + '-n'] = String(n);
    try { cache.putAll(chunks, 21600); } catch (err) {}
  }
  return text;
}

// ===== Conferences =====
// conf-A.txt ... conf-Z.txt are built from the Scopus Source List, sheet "All Conf. Proceedings" (Jun 2026).
// One line per conference series: ACRONYM|name words|publisher|first year|last year. Each file is pinned by its SHA-256.
var CONF_VERSION = '1';
var CONF_DIR = 'Conference%20list/conf/';  // folder in the asset store
var CONF_SHA256 = {
  A: '2b2c89c937d33c839deba61551919f42bb929279fc1637c6c02254156788f4d8',
  B: '142500e3511409a312e9af3dec1cf283c09556aa4b9be4391a88654e3ea48c5f',
  C: '07d476c4e2a9c26d67db7dfd4f5d70207f1af6c473d4766f3ef8d52d00eec714',
  D: '1d08c49e48b219348b20f531a6b6937efa99c9c064ecc57cd71fc32c31f1d8d9',
  E: '29c85fd51e5e6293a54c1f6403fe8be949fb94ef1d3f41e4b6fb29ae7d969944',
  F: '984c30076973c1bcd47e8a5547d47585f72cafd383b0b3d55390c5121dc2539a',
  G: '98a49d9b5b013f962d875b6dd43b4aae629b9d19b3a9b18a9e901cb5ee75f876',
  H: '2bc4ddcd8958752f6d17f722062232090ec1182296ee5b5e0bc7f81c0f2bd314',
  I: 'e89827063a5d23bd778932a88cc005a3f88bdec7c8ef72c9e6c1043443258faa',
  J: 'ebd49e7f7ecc133f6c9ab4e84a8b928722bfdf24daa45f13436f56df0d0c9b7f',
  K: 'ca03e34cdd7221216dfb3a699c6d056f1ef856792197d055cbadd5dc6e3538d2',
  L: '1770f54e5d1a4705163fea1f82479926844700aadec9093fd58da32b23739a0d',
  M: '63368f410dfa7d6f333fb180def101704d70f85df42d02adc478d291c7ee380b',
  N: 'bce79ade1530d134526b9372d10130fdd73cd566a47539e6988af1aa98d265bd',
  O: 'e0f1300a26fe5768209d02df60358ebfd048193685c6e6d9db7fa4d36f9d943d',
  P: 'cb63594f25561c4016d62ab9b23786d1fb4667ce1d550e008d343f1282cbcb5a',
  Q: 'a4530801b52e6d9cac2d6296192b63ecf8e605840aac9b57d1fe1beff04bcd10',
  R: '920276719550f1c98929bc51c2a46c7e1bf7249c50b4adde542a6224cf7cc6ef',
  S: 'e4f1bbbf5d83245abfc8df311368d3ae4c90ada3ffdba88fbf44de2646342bdb',
  T: '9bd9c7cddff9d8a090595a45b60c7c00203bb9f68095c5cc7f3ade5c17abdb2d',
  U: 'd7752557c4f98fc4ae949032824c132d5d60486a5840f06d9a0360623ecf4c2e',
  V: 'c9d288d553e81e57fa4135ec73c0fe2c03e1cbc2eee59357af15cd2bce8e4960',
  W: '29937fca23cbb4997bd2100506baff87501a06510863bddc34963cb5635bb10c',
  X: '803e6d453bb995fd2b2e86bf65800864b82878e3b7eeef0824376f3136fd8c8f',
  Y: '2cf1140f1282ee4f2e405fc0ffa518a6f3de58b1ef3791f81cf6d93da5821e4b',
  Z: '0cb28a49d70c410e0730cd10a72a4dc8e863f08b3649784a28701913d264ea74'
};
var CONF_STOP = /^(the|of|on|and|for|in|to|a|an|at|by|with|proceedings|proceeding|international|conference|conferences|ieee|acm|annual|workshop|symposium)$/;

// Loads one pinned text file from the asset store, cached in pieces (the cache holds at most 100 KB per key).
function pinnedText(file, sha, version) {
  var cache = CacheService.getScriptCache(), key = file + '-' + version;
  var parts = cache.get(key + '-n'), text = '';
  if (parts) {
    var keys = []; for (var i = 0; i < +parts; i++) keys.push(key + '-' + i);
    var got = cache.getAll(keys);
    if (Object.keys(got).length === +parts) keys.forEach(function (k) { text += got[k]; });
  }
  if (text) return text;
  var r = UrlFetchApp.fetch(ASSET_BASE + file + '?v=' + version, { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return null;
  text = r.getContentText();
  if (sha256Hex(text) !== sha) return 'TAMPERED';
  var chunks = {}, size = 90000, n = Math.ceil(text.length / size);
  for (var c = 0; c < n; c++) chunks[key + '-' + c] = text.substring(c * size, (c + 1) * size);
  chunks[key + '-n'] = String(n);
  try { cache.putAll(chunks, 21600); } catch (err) {}
  return text;
}

function confWords(t) {
  t = t.replace(/&/g, ' and ').replace(/\b(19|20)\d\d\b/g, ' ').replace(/\b\d+(st|nd|rd|th)\b/gi, ' ').replace(/\([^)]*\)/g, ' ');
  return t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w && !CONF_STOP.test(w) && !/^\d+$/.test(w); });
}

// Acronyms written with a year, like "ICCA 2025", "IEEE/ICCA 2025", "ICAISET'26" or "(EECSI 2026)".
function confAcronyms(text) {
  var out = [], re = /\b([A-Z][A-Za-z&]*[A-Z][A-Za-z&]*)[\s\-]*['\u2019]?\s*(?:19|20)?\d\d\b/g, m;
  while ((m = re.exec(text)) && out.length < 8) {
    var a = m[1].toUpperCase().replace(/-/g, '');
    if (a.length >= 3 && a.length <= 12 && !/^(IEEE|ACM|SPIE|IFIP|ISSN|ISBN|USD|EUR|GMT|UTC|IST|WIB|PM|AM|APC|DOI)$/.test(a) && out.indexOf(a) === -1) out.push(a);
  }
  return out;
}

// Finds the conference of this email in the Scopus conference list.
// With a full name: the words must match (Jaccard 0.6 or more). With only an acronym: it must be unambiguous.
function conferenceInScopus(text) {
  var name = conferenceQuery(text), words = /conference/i.test(name) ? confWords(name) : [];
  var acrs = confAcronyms(text);
  for (var i = 0; i < acrs.length; i++) {
    var a = acrs[i], shard = /[A-Z]/.test(a.charAt(0)) ? a.charAt(0) : '0';
    if (!CONF_SHA256[shard]) continue;
    var list = pinnedText(CONF_DIR + 'conf-' + shard + '.txt', CONF_SHA256[shard], CONF_VERSION);
    if (list === 'TAMPERED') return { tampered: true };
    if (!list) return null;
    var rows = [], at = list.indexOf(a + '|') === 0 ? 0 : list.indexOf('\n' + a + '|');
    while (at !== -1) {
      if (list.charAt(at) === '\n') at++;
      var line = list.substring(at, list.indexOf('\n', at)).split('|');
      rows.push({ acr: line[0], words: line[1].split(' '), pub: line[2], first: +line[3], last: +line[4] });
      at = list.indexOf('\n' + a + '|', at);
    }
    if (!rows.length) continue;
    if (words.length) {
      var best = null, bestScore = 0;
      rows.forEach(function (r) {
        var inter = r.words.filter(function (w) { return words.indexOf(w) !== -1; }).length;
        var score = inter / (r.words.length + words.length - inter);
        if (score > bestScore) { bestScore = score; best = r; }
      });
      if (best && bestScore >= 0.6) return best;
    } else {
      // Only the acronym: the conference name Scopus gives must also be written in the email,
      // so "RESS 2027" for an energy summit does not match an old "RESS" on requirements engineering.
      var all = confWords(text);
      rows = rows.filter(function (r) { return r.words.filter(function (w) { return all.indexOf(w) !== -1; }).length / r.words.length >= 0.6; });
      if (!rows.length) continue;
      // Accept it when every series left is the same conference
      // (Scopus sometimes lists one conference twice, with a small spelling difference).
      var same = rows.every(function (r) {
        var inter = r.words.filter(function (w) { return rows[0].words.indexOf(w) !== -1; }).length;
        return inter / (r.words.length + rows[0].words.length - inter) >= 0.6;
      });
      if (same) return rows.reduce(function (a, b) { return { acr: a.acr, words: a.words, pub: a.pub || b.pub, first: Math.min(a.first, b.first), last: Math.max(a.last, b.last) }; });
    }
  }
  return null;
}

// A conference that Scopus lists is real. Its sender is verified only from a known platform, or from a domain
// that carries the conference acronym and was registered before the last edition Scopus lists.
function applyConference(L, checks, conf, senderDomain) {
  if (!conf || conf.tampered) return;
  var span = conf.first === conf.last ? String(conf.last) : conf.first + '\u2013' + conf.last;
  var pubText = conf.pub ? ' (' + conf.pub + ')' : '';
  var idx = checks[2];
  if (['none', 'nojournal', 'absent', 'off'].indexOf(idx.scopus) !== -1 || idx.status === 'unknown')
    checks[2] = R('success', L.c.indexing, fill(L.d.confOk, { a: conf.acr, y: span, p: pubText }), '', { scopus: 'conf', scopusYear: span, src: 'scopus' });
  if (checks[0].status !== 'unknown') return;
  var label = senderDomain.split('.')[0].replace(/[^a-z0-9]/g, '');
  var platform = PLATFORMS.indexOf(senderDomain) !== -1;
  var reg = platform ? null : registrationDate(senderDomain);
  var ownDomain = label.indexOf(conf.acr.toLowerCase()) !== -1 && reg && !isNaN(reg) && reg.getFullYear() < conf.last;
  if (!platform && !ownDomain) return;
  checks[0] = R('success', L.c.publisher, fill(platform ? L.d.confPlatform : L.d.confDomain, { d: senderDomain, a: conf.acr, y: reg ? reg.getFullYear() : '' }),
    fill(L.reasons.okConf, { a: conf.acr, y: span, p: pubText }), { site: platform ? '' : senderDomain, src: 'scopus' });
  // The sponsor named by the sender (IEEE, ACM) is the publisher Scopus lists: the name is no longer a warning.
  if (checks[8].kind === 'sponsor' && conf.pub === checks[8].sponsor) checks[8] = R('success', L.c.name, fill(L.d.nameSponsorOk, { p: conf.pub }));
}

function inactiveStatus(issns) {
  var text = inactiveList();
  if (text === 'TAMPERED') return { kind: 'X' };
  if (!text) return null;
  for (var i = 0; i < issns.length; i++) {
    var id = (issns[i] || '').replace(/[^0-9Xx]/g, '').toUpperCase();
    if (id.length !== 8) continue;
    var at = text.indexOf(id + '|') === 0 ? 0 : text.indexOf('\n' + id + '|');
    if (at === -1) continue;
    if (at > 0) at += 1;
    var line = text.substring(at, text.indexOf('\n', at)).split('|');
    return { kind: line[1], year: line[2] };
  }
  return null;
}

function quartileOf(entry) {
  try {
    var years = ((entry.citeScoreYearInfoList || {}).citeScoreYearInfo) || [];
    if (!Array.isArray(years)) years = [years];
    years = years.filter(function (y) { return y['@status'] === 'Complete'; })
                 .sort(function (a, b) { return parseInt(b['@year'], 10) - parseInt(a['@year'], 10); });
    if (!years.length) return '';
    var best = -1;
    var lists = years[0].citeScoreInformationList || [];
    if (!Array.isArray(lists)) lists = [lists];
    lists.forEach(function (l) {
      var infos = l.citeScoreInfo || [];
      if (!Array.isArray(infos)) infos = [infos];
      infos.forEach(function (inf) {
        var ranks = inf.citeScoreSubjectRank || [];
        if (!Array.isArray(ranks)) ranks = [ranks];
        ranks.forEach(function (r) { var pc = parseFloat(r.percentile); if (pc > best) best = pc; });
      });
    });
    if (best < 0) return '';
    return best >= 75 ? 'Q1' : best >= 50 ? 'Q2' : best >= 25 ? 'Q3' : 'Q4';
  } catch (err) { return ''; }
}

function checkIndexing(L, issn, names, text) {
  var claims = /scopus/i.test(text);
  if (!SCOPUS_API_KEY) return R('unknown', L.c.indexing, L.d.idxOff, '', { scopus: claims ? 'off' : 'none' });
  if (!issn && !names.length) return R('unknown', L.c.indexing, claims ? L.d.idxNoJournal : L.d.idxNone, '', { scopus: claims ? 'nojournal' : 'none' });
  try {
    var opts = { muteHttpExceptions: true, headers: { Accept: 'application/json', 'X-ELS-APIKey': SCOPUS_API_KEY } };
    var entry = null, checked = false, label = issn, byName = false;
    if (issn) {
      var r = UrlFetchApp.fetch('https://api.elsevier.com/content/serial/title/issn/' + issn + '?view=CITESCORE', opts);
      if (r.getResponseCode() === 200) {
        checked = true;
        entry = (((JSON.parse(r.getContentText())['serial-metadata-response'] || {}).entry) || [])[0] || null;
      } else if (r.getResponseCode() === 404) checked = true;
    }
    for (var n = 0; !entry && n < names.length; n++) {
      var q = UrlFetchApp.fetch('https://api.elsevier.com/content/serial/title?title=' + encodeURIComponent(names[n]) + '&count=25&view=CITESCORE', opts);
      if (q.getResponseCode() === 200 || q.getResponseCode() === 404) checked = true;
      if (q.getResponseCode() !== 200) continue;
      var entries = ((JSON.parse(q.getContentText())['serial-metadata-response'] || {}).entry) || [];
      // Old and new journals can share a title (Computer Networks 1976-1978 and today's). Take the newest coverage.
      // Old and new journals can share a title (Computer Networks 1976-1978 and today's). Prefer one that is not
      // in the inactive list, then the one with the newest CiteScore or coverage year.
      var recent = function (en) {
        if (inactiveStatus([en['prism:issn'], en['prism:eIssn']])) return -1;
        var y = Math.max.apply(null, String(en.coverageEndYear || '0').match(/\d{4}/g) || [0]);
        var info = ((en.citeScoreYearInfoList || {}).citeScoreCurrentMetricYear) || ((en.citeScoreYearInfoList || {}).citeScoreTracker);
        return Math.max(y, parseInt(info, 10) || 0);
      };
      entry = entries.filter(function (en) { return norm(en['dc:title']) === norm(names[n]); })
        .sort(function (a, b) { return recent(b) - recent(a); })[0] || null;
      byName = true;
      if (entry) label = entry['dc:title'];
    }
    if (!label) label = names[0] || '';
    var ids = [issn];
    if (entry) { ids.push(entry['prism:issn']); ids.push(entry['prism:eIssn']); }
    var gone = inactiveStatus(ids);
    if (gone && gone.kind === 'X') return R('unknown', L.c.indexing, L.d.listBad, '', { scopus: 'off' });
    var state = null, year = '';
    if (gone) { state = gone.kind === 'D' ? 'removed' : 'stopped'; year = gone.year; }
    // Only the Scopus inactive list decides that a journal stopped. The API's coverageEndYear is the end of the
    // last coverage block it lists, not the latest year (Computer Networks "1996-2027; ...; 1978" gives 1978).
    if (state) {
      var detail = fill(state === 'removed' ? L.d.idxRemoved : L.d.idxStopped, { i: label, y: year });
      if (claims) return R('danger', L.c.indexing, detail, fill(state === 'removed' ? L.reasons.idxRemoved : L.reasons.idxStopped, { y: year }), { scopus: state, scopusYear: year, src: 'scopus' });
      return R('unknown', L.c.indexing, detail, '', { scopus: state, scopusYear: year, src: 'scopus' });
    }
    if (entry) return R('success', L.c.indexing, fill(L.d.idxOk, { i: label }), fill(L.reasons.okScopus, { t: entry['dc:title'] || label }), { scopus: 'yes', journalTitle: entry['dc:title'] || label, journalPublisher: entry['dc:publisher'] || '', quartile: quartileOf(entry), src: 'scopus', scopusIssn: entry['prism:issn'] || entry['prism:eIssn'] || '' });
    // Not found by ISSN: the claim is false. Not found by name: the name we read may be wrong, so it is only a weak sign.
    if (checked && claims && issn) return R('danger', L.c.indexing, fill(L.d.idxFake, { i: label }), L.reasons.idxFake, { scopus: 'no', src: 'scopus' });
    if (checked && claims) return R('warning', L.c.indexing, fill(L.d.idxNotFound, { i: label }), L.reasons.idxNotFound, { scopus: 'no', src: 'scopus', byName: true });
    if (checked) return R('unknown', L.c.indexing, fill(L.d.idxAbsent, { i: label }), '', { scopus: 'absent', src: 'scopus' });
  } catch (err) {}
  return R('unknown', L.c.indexing, L.d.idxOff, '', { scopus: 'off' });
}

function checkWebsite(L, journal, allDomains, linkDomains) {
  var p = journal && journal.found ? publisherOf(journal.publisher) : null;
  if (!p) p = publisherInDomains(allDomains);
  if (p && p.official.indexOf(allDomains[0]) !== -1) return R('success', L.c.website, fill(L.d.webOk, { w: allDomains[0] }), '', { site: allDomains[0] });
  if (!p || !linkDomains.length) return R('unknown', L.c.website, L.d.webNone);
  var hit = linkDomains.filter(function (d) { return p.official.indexOf(d) !== -1; })[0];
  var ok = !!hit;
  return ok ? R('success', L.c.website, fill(L.d.webOk, { w: hit }), '', { site: hit })
            : R('warning', L.c.website, fill(L.d.webOff, { w: p.official[0] }), fill(L.reasons.webOff, { p: p.name }), { site: p.official[0] });
}

var RDAP_DIRECT = {
  com: 'https://rdap.verisign.com/com/v1/domain/',
  net: 'https://rdap.verisign.com/net/v1/domain/',
  org: 'https://rdap.publicinterestregistry.org/rdap/domain/'
};

function registrationDate(domain) {
  var cache = CacheService.getScriptCache(), key = 'reg-' + domain;
  var hit = cache.get(key);
  if (hit) return new Date(hit);
  var tld = domain.split('.').pop();
  var urls = [];
  if (RDAP_DIRECT[tld]) urls.push(RDAP_DIRECT[tld] + encodeURIComponent(domain));
  urls.push('https://rdap.org/domain/' + encodeURIComponent(domain));
  for (var i = 0; i < urls.length; i++) {
    for (var attempt = 0; attempt < 2; attempt++) {
      try {
        var r = UrlFetchApp.fetch(urls[i], { muteHttpExceptions: true, followRedirects: true, headers: { Accept: 'application/rdap+json' } });
        var code = r.getResponseCode();
        if (code === 200) {
          var reg = null;
          (JSON.parse(r.getContentText()).events || []).forEach(function (ev) { if (ev.eventAction === 'registration') reg = ev.eventDate; });
          if (reg) { try { cache.put(key, reg, 86400); } catch (err) {} return new Date(reg); }
          break;
        }
        if (code === 404) break;
      } catch (err) {}
      Utilities.sleep(400);
    }
  }
  return null;
}

function checkDomainAge(L, domain) {
  var none = R('unknown', L.c.age, fill(L.d.ageNone, { d: domain }));
  if (!domain) return none;
  var reg = registrationDate(domain);
  if (!reg || isNaN(reg)) return none;
  var days = Math.floor((new Date() - reg) / 86400000), t = ageText(L, days);
  if (days < 365) return R('warning', L.c.age, fill(L.d.ageNew, { n: t }), fill(L.reasons.ageNew, { n: t }), { src: 'reg' });
  return R('success', L.c.age, fill(L.d.ageOld, { n: t }), '', { src: 'reg' });
}

function checkAuth(L, message) {
  var h = '';
  try { h = (message.getHeader('Authentication-Results') || '').toLowerCase(); } catch (err) {}
  if (!h) return R('unknown', L.c.auth, L.d.authNone);
  var dkim = /dkim=pass/.test(h), spf = /spf=pass/.test(h), dmarcFail = /dmarc=fail/.test(h);
  if (dmarcFail || (!dkim && !spf)) return R('warning', L.c.auth, L.d.authFail, L.reasons.authFail, { src: 'auth' });
  return R('success', L.c.auth, dkim && spf ? L.d.authOk : (dkim ? L.d.authDkim : L.d.authSpf), '', { src: 'auth' });
}

function checkRequests(L, text, senderDomain) {
  var pay = PAYMENT_WORDS.test(text), mail = EMAIL_SUBMISSION.test(text);
  // A verified publisher or submission platform talking about fees or files is normal correspondence.
  var verified = PLATFORMS.indexOf(senderDomain) !== -1 || PUBLISHERS.some(function (p) { return p.official.indexOf(senderDomain) !== -1; });
  if (verified && (pay || mail)) return R('success', L.c.requests, L.d.reqTrusted, '', { pay: pay, mail: false });
  if (pay && mail) return R('warning', L.c.requests, L.d.reqBoth, L.reasons.reqBoth, { pay: true, mail: true });
  if (pay) return R('warning', L.c.requests, L.d.reqPay, L.reasons.reqPay, { pay: true });
  if (mail) return R('warning', L.c.requests, L.d.reqMail, L.reasons.reqMail, { pay: false, mail: true });
  return R('success', L.c.requests, L.d.reqNone, '', { pay: false });
}

var RISKY_FILES = /\.(msg|eml|oft|exe|scr|com|pif|bat|cmd|js|jse|vbs|vbe|wsf|hta|lnk|iso|img|vhd|docm|dotm|xlsm|xltm|pptm|potm|ppsm)$/i;
var FILE_LINKS = /(file:\/\/|smb:\/\/|\\\\[a-z0-9.\-]+\\)/i;

function signatureLines(body) {
  // Keep only the new message: cut quoted replies and forwarded parts
  var lines = (body || '').split(/\r?\n/), out = [];
  for (var i = 0; i < lines.length; i++) {
    var ln = lines[i].trim();
    if (/^>/.test(ln) || /^-{2,}\s*(original message|forwarded message)/i.test(ln) || /^On .{5,120} wrote:$/i.test(ln) || /^From:\s/i.test(ln)) break;
    if (ln) out.push(ln);
  }
  return out.slice(-8).filter(function (ln) { return ln.length <= 70 && !/(published by|indexed in|proceedings|in collaboration|sponsored|partner|unsubscribe|http)/i.test(ln); });
}

function publisherNamedIn(text) {
  if (!norm(text)) return null;
  for (var i = 0; i < PUBLISHERS.length; i++) if (brandIn(PUBLISHERS[i], text)) return PUBLISHERS[i];
  return null;
}

// Which sponsor (IEEE or ACM) the conference says it belongs to, if any
function sponsorClaim(text) {
  var m = text.match(/\b(IEEE|ACM)\b[^.\n]{0,80}\b(conference|proceedings|xplore|digital library)\b|\b(conference|proceedings)\b[^.\n]{0,80}\b(IEEE|ACM)\b/i);
  if (!m) return '';
  return /acm/i.test(m[1] || m[4]) ? 'ACM' : 'IEEE';
}

// The conference name to search for: the full name if the email gives one, else its acronym and year
function conferenceQuery(text) {
  var m = text.match(/\b((?:\d+(?:st|nd|rd|th)\s+)?(?:IEEE[\s\-]+)?International Conference on [A-Z][A-Za-z&,\- ]{4,90})/);
  if (m) {
    var name = m[1].replace(/^\d+(?:st|nd|rd|th)\s+/, '').replace(/^IEEE[\s\-]+/, '');
    name = name.split(/\s*(?:\(|\u2013|\s-\s|\s(?:to be|will|which|is|in|at|held|on \d)\s)/)[0];
    name = name.replace(/,?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\b.*$/, '');
    return name.replace(/[\s,\-]+$/, '').replace(/\s+(and|on|in|of|the|for)$/i, '').trim();
  }
  var a = text.match(/\b(?:IEEE\s*\/\s*)?([A-Z][A-Z]{2,11})[\s\-]*['\u2019]?\s?(20\d\d|\d\d)\b/);
  return a ? a[1] + ' ' + (a[2].length === 2 ? '20' + a[2] : a[2]) : '';
}

function checkSenderName(L, displayName, senderDomain, body) {
  var senderIsPublisher = PUBLISHERS.some(function (x) { return x.official.indexOf(senderDomain) !== -1; });
  var trusted = function (p) { return senderIsPublisher || p.official.indexOf(senderDomain) !== -1 || PLATFORMS.indexOf(senderDomain) !== -1; };
  var p = publisherNamedIn(displayName);
  // Many real conferences put IEEE or ACM in their name. From the conference's own domain this is
  // a claim to check, not proof of fraud. A sponsor name inside the domain stays a strong sign (publisher check).
  if (p && !trusted(p) && p.sponsor && FREE_MAIL.indexOf(senderDomain) === -1)
    return R('warning', L.c.name, fill(L.d.nameConf, { p: p.name, d: senderDomain }), fill(L.reasons.nameConf, { p: p.name }), { kind: 'sponsor', sponsor: p.name });
  if (p && !trusted(p))
    return R('danger', L.c.name, fill(L.d.nameFake, { p: p.name, d: senderDomain }), fill(L.reasons.nameFake, { p: p.name }), { kind: 'display' });
  var sig = signatureLines(body);
  for (var i = 0; i < sig.length; i++) {
    var q = publisherNamedIn(sig[i]);
    if (q && q.sponsor && !trusted(q)) continue;
    if (q && !trusted(q))
      return R('danger', L.c.name, fill(L.d.signFake, { p: q.name, d: senderDomain }), fill(L.reasons.signFake, { p: q.name }), { kind: 'signature' });
  }
  if (!norm(displayName)) return R('unknown', L.c.name, L.d.nameOk);
  return R('success', L.c.name, L.d.nameOk);
}

function checkReplyTo(L, message, senderDomain) {
  var rt = '';
  try { rt = (message.getReplyTo() || '').toLowerCase(); } catch (err) {}
  var m = rt.match(/[a-z0-9._%+\-]+@([a-z0-9.\-]+)/);
  if (!m) return R('success', L.c.reply, L.d.replyOk);
  var addr = m[0], dom = registrable(m[1]);
  if (dom === senderDomain) return R('success', L.c.reply, L.d.replyOk);
  // Submission platforms set the reply address to the handling editor, who may use a personal mailbox.
  if (PLATFORMS.indexOf(senderDomain) !== -1) return R('success', L.c.reply, L.d.replyOk);
  if (FREE_MAIL.indexOf(dom) !== -1) return R('warning', L.c.reply, fill(L.d.replyFree, { r: addr }), fill(L.reasons.replyDiff, { r: addr }));
  if (PLATFORMS.indexOf(senderDomain) !== -1 || PLATFORMS.indexOf(dom) !== -1) return R('success', L.c.reply, L.d.replyOk);
  return R('warning', L.c.reply, fill(L.d.replyDiff, { r: addr }), fill(L.reasons.replyDiff, { r: addr }));
}

function checkPredatory(L, text, senderDomain) {
  var trusted = PLATFORMS.indexOf(senderDomain) !== -1 || PUBLISHERS.some(function (p) { return p.official.indexOf(senderDomain) !== -1; });
  if (trusted) return R('unknown', L.c.predatory, L.d.predTrusted);
  var hits = [];
  Object.keys(PREDATORY).forEach(function (k) {
    var re = PREDATORY[k];
    if (k === 'rapid') {
      re.lastIndex = 0; var m;
      while ((m = re.exec(text))) { var n = +m[2], u = m[3].toLowerCase(); if (u.charAt(0) === 'h' || n <= 7) { hits.push(k); break; } }
    } else if (re.test(text)) hits.push(k);
  });
  if (!hits.length) return R('success', L.c.predatory, L.d.predNone);
  var list = hits.map(function (k) { return L.d.pat[k]; }).join(', ');
  // Two or more patterns together are a strong sign; one alone is weak.
  return R(hits.length >= 2 ? 'danger' : 'warning', L.c.predatory, fill(L.d.predFound, { l: list }), fill(L.reasons.predatory, { l: list }));
}

function checkMetrics(L, text) {
  var m = text.match(FAKE_METRICS);
  if (m) return R('warning', L.c.metrics, fill(L.d.metricsFake, { m: m[0].trim() }), L.reasons.metricsFake);
  return R('success', L.c.metrics, L.d.metricsOk);
}

function checkFiles(L, message, body) {
  var names = [];
  try { message.getAttachments().forEach(function (a) { var n = a.getName() || ''; if (RISKY_FILES.test(n)) names.push(n); }); } catch (err) {}
  if (names.length) return R('warning', L.c.files, fill(L.d.fileBad, { f: names.join(', ') }), L.reasons.files);
  if (FILE_LINKS.test(body)) return R('warning', L.c.files, L.d.fileLink, L.reasons.files);
  return R('success', L.c.files, L.d.fileOk);
}

// ===== Attack types =====
var MITRE = 'https://attack.mitre.org/techniques/';
var ATTACKS = {
  lookalike: { mitre: ['T1583.001', 'T1566.002'], lv: 'danger' },
  brand:     { mitre: ['T1656', 'T1583.001'], lv: 'danger' },
  display:   { mitre: ['T1656', 'T1566'], lv: 'danger' },
  hijack:    { mitre: ['T1656', 'T1583.001'], lv: 'warning' },
  indexing:  { mitre: ['T1656'], lv: 'danger' },
  issn:      { mitre: ['T1656'], lv: 'danger' },
  reply:     { mitre: ['T1598'], lv: 'warning' },
  payment:   { mitre: ['T1656', 'T1566'], lv: 'warning' },
  harvest:   { mitre: ['T1598'], lv: 'warning' },
  attach:    { mitre: ['T1566.001'], lv: 'warning' },
  metrics:   { mitre: ['T1656'], lv: 'warning' },
  predatory: { mitre: ['T1566', 'T1598'], lv: 'danger' },
  newdomain: { mitre: ['T1583.001'], lv: 'warning' },
  spoof:     { mitre: ['T1566'], lv: 'warning' },
  unverified:{ mitre: ['T1566'], lv: 'warning' }
};
var ATTACK_TEXT = {
  en: {
    unverifiedEv: 'Sender {s} is not linked to any publisher, journal or submission system.',
    label: 'Attack type', types: 'Attack types', what: 'What it is', found: 'In this email', todo: 'What to do', more: 'MITRE ATT&CK page',
    lookalike: ['Domain lookalike', 'A domain that copies a real one with small changes, like 1 for l.', "Don't click the links. Type the real address yourself."],
    brand: ['Brand impersonation', "A fake domain that uses a real publisher's name.", "Don't click the links. Go to the real site yourself."],
    display: ['Display-name spoofing', 'The sender name shows a known publisher, but the address is different.', 'Always look at the full email address, not the name.'],
    hijack: ['Journal hijacking', 'Someone uses the name of a real journal from a domain that is not its own.', "Find the journal's site through Scopus or the publisher, not the email."],
    indexing: ['Fake indexing claim', 'The email says the journal is in Scopus, but it is not, or no longer is.', 'Check the journal yourself on scopus.com before you submit.'],
    issn: ['ISSN misuse', 'The email uses the ISSN of a different journal to look legitimate.', 'Search the ISSN on portal.issn.org and compare the title.'],
    reply: ['Reply-to redirection', 'Your reply goes to a different address than the sender.', 'Do not reply. Contact the journal through its official site.'],
    payment: ['Unverified payment request', 'A fee request from a sender that could not be verified. It may be payment fraud.', "Never pay from an email link. Pay only on the publisher's site."],
    harvest: ['Manuscript harvesting', 'You are asked to send your paper by email instead of a submission system.', 'Submit only through the official submission system.'],
    attach: ['Malicious attachment', 'A file type that can run code or leak your login.', 'Do not open the file.'],
    predatory: ['Predatory solicitation', 'A bulk invitation that follows known predatory publishing tactics.', 'Do not submit or pay. Check the journal in Scopus or DOAJ yourself.'],
    metrics: ['Fake journal metrics', 'Made-up impact factors used to look like a respected journal.', 'Check the journal in Scopus or Web of Science yourself.'],
    newdomain: ['Newly registered domain', 'The website was created recently, a common sign of a fake.', 'Be careful. Real journals use long-established websites.'],
    spoof: ['Email spoofing', 'The email failed the checks that prove where it came from.', 'Treat the sender as unknown.'],
    unverified: ['Unverified solicitation', 'A mass invitation from a sender that is not linked to any known publisher.', "Verify the journal yourself before you reply."]
  },
  ar: {
    unverifiedEv: 'المرسل {s} غير مرتبط بأي ناشر أو مجلة أو نظام تقديم.',
    label: 'نوع الهجوم', types: 'أنواع الهجوم', what: 'ما هو', found: 'في هذه الرسالة', todo: 'ماذا تفعل', more: 'صفحة MITRE ATT&CK',
    lookalike: ['نطاق مقلد', 'نطاق ينسخ نطاقا حقيقيا مع تغيير بسيط، مثل 1 بدل l.', 'لا تضغط على الروابط، واكتب العنوان الحقيقي بنفسك.'],
    brand: ['انتحال اسم ناشر', 'نطاق مزيف يستخدم اسم ناشر حقيقي.', 'لا تضغط على الروابط، وادخل الموقع الحقيقي بنفسك.'],
    display: ['انتحال اسم المرسل', 'اسم المرسل يظهر كناشر معروف، لكن العنوان مختلف.', 'انظر دائما إلى عنوان البريد كاملا، لا إلى الاسم.'],
    hijack: ['اختطاف مجلة', 'شخص يستخدم اسم مجلة حقيقية من نطاق ليس تابعا لها.', 'ابحث عن موقع المجلة من Scopus أو الناشر، لا من الرسالة.'],
    indexing: ['ادعاء فهرسة كاذب', 'الرسالة تقول إن المجلة في Scopus، وهي ليست فيه أو خرجت منه.', 'تحقق من المجلة بنفسك على scopus.com قبل التقديم.'],
    issn: ['إساءة استخدام ISSN', 'الرسالة تستخدم رقم ISSN لمجلة أخرى لتبدو حقيقية.', 'ابحث عن الرقم في portal.issn.org وقارن الاسم.'],
    reply: ['تحويل الرد', 'ردك يذهب إلى عنوان غير عنوان المرسل.', 'لا ترد، وتواصل مع المجلة من موقعها الرسمي.'],
    payment: ['طلب دفع غير موثق', 'طلب رسوم من مرسل لم يتم التحقق منه، وقد يكون احتيالا ماليا.', 'لا تدفع أبدا من رابط في رسالة، وادفع فقط من موقع الناشر.'],
    harvest: ['سرقة الأبحاث', 'يطلب منك إرسال بحثك بالبريد بدلا من نظام التقديم.', 'قدم فقط عبر نظام التقديم الرسمي.'],
    attach: ['مرفق خبيث', 'نوع ملف يمكن أن يشغل برامج أو يسرب بيانات دخولك.', 'لا تفتح الملف.'],
    predatory: ['دعوة نشر مفترس', 'دعوة جماعية تتبع أساليب النشر المفترس المعروفة.', 'لا تقدم ولا تدفع، وتحقق من المجلة في Scopus أو DOAJ بنفسك.'],
    metrics: ['مقاييس مجلة مزيفة', 'معاملات تأثير مختلقة تستخدم لتبدو المجلة محترمة.', 'تحقق من المجلة في Scopus أو Web of Science بنفسك.'],
    newdomain: ['نطاق حديث التسجيل', 'الموقع أنشئ حديثا، وهذه علامة شائعة للمواقع المزيفة.', 'كن حذرا، فالمجلات الحقيقية تستخدم مواقع قديمة.'],
    spoof: ['تزوير البريد', 'الرسالة فشلت في الفحوص التي تثبت مصدرها.', 'اعتبر المرسل مجهولا.'],
    unverified: ['دعوة غير موثقة', 'دعوة جماعية من مرسل غير مرتبط بأي ناشر معروف.', 'تحقق من المجلة بنفسك قبل الرد.']
  }
};

function detectAttacks(checks, dec, sender, A) {
  var pub = checks[0], issnC = checks[1], idx = checks[2], age = checks[4], auth = checks[5], req = checks[6], files = checks[7], name = checks[8], reply = checks[9];
  var out = [];
  function add(id, ev) { if (!out.some(function (a) { return a.id === id; })) out.push({ id: id, ev: ev }); }
  if (pub.status === 'danger') add(pub.kind === 'lookalike' ? 'lookalike' : 'brand', pub.detail);
  if (name.status === 'danger') add(name.kind === 'signature' ? 'brand' : 'display', name.detail);
  if (issnC.status === 'danger') add('issn', issnC.detail);
  if (idx.status === 'danger') add('indexing', idx.detail);
  if (dec.hijack) add('hijack', dec.why);
  if (reply.status === 'warning') add('reply', reply.detail);
  if (req.pay && req.status === 'warning' && dec.level !== 'success') add('payment', req.detail);
  if (req.mail) add('harvest', req.detail);
  if (files.status === 'warning') add('attach', files.detail);
  if (checks[10] && checks[10].status === 'warning') add('metrics', checks[10].detail);
  if (checks[11] && (checks[11].status === 'warning' || checks[11].status === 'danger')) add('predatory', checks[11].detail);
  if (age.status === 'warning') add('newdomain', age.detail);
  if (auth.status === 'warning') add('spoof', auth.detail);
  if (!out.length && dec.level === 'warning') add('unverified', fill(A.unverifiedEv, { s: sender }));
  out.sort(function (a, b) { return (ATTACKS[a.id].lv === 'danger' ? 0 : 1) - (ATTACKS[b.id].lv === 'danger' ? 0 : 1); });
  return out;
}

function showAttack(e) {
  var lang = e.parameters.lang, A = ATTACK_TEXT[lang], id = e.parameters.id, info = A[id], lv = ATTACKS[id].lv;
  var head = CardService.newCardSection().addWidget(CardService.newDecoratedText()
    .setTopLabel(A.label)
    .setText('<font color="' + COLORS[lv] + '"><b>' + SYMBOLS[lv] + '  ' + info[0] + '</b></font>')
    .setBottomLabel('MITRE ATT&CK: ' + ATTACKS[id].mitre.join(', ')).setWrapText(true));
  var body = CardService.newCardSection();
  [[A.what, info[1]], [A.found, e.parameters.ev], [A.todo, info[2]]].forEach(function (row) {
    body.addWidget(CardService.newDecoratedText().setText('<b>' + row[0] + '</b>').setBottomLabel(row[1]).setWrapText(true));
  });
  var first = ATTACKS[id].mitre[0].replace('.', '/');
  body.addWidget(CardService.newTextButton().setText(A.more).setTextButtonStyle(CardService.TextButtonStyle.TEXT)
    .setOpenLink(CardService.newOpenLink().setUrl(MITRE + first + '/')));
  var card = CardService.newCardBuilder().addSection(head).addSection(body).build();
  return CardService.newActionResponseBuilder().setNavigation(CardService.newNavigation().pushCard(card)).build();
}

// ===== Decision and card =====
function decide(checks, L, ctx) {
  var pub = checks[0], issnC = checks[1], idx = checks[2];
  var journalOk = idx.status === 'success' || issnC.status === 'success';
  var strong = checks.filter(function (c) { return c.status === 'danger'; });
  var weak = checks.filter(function (c) { return c.status === 'warning'; });

  // A real journal of a large publisher that writes from an unrelated domain is a warning sign by itself (journal hijacking).
  var hijackWhy = '';
  if (journalOk && idx.journalTitle && pub.status !== 'success' && !ctx.platform) {
    hijackWhy = fill(L.reasons.realJournalOtherSender, { t: idx.journalTitle });
    if (publisherOf(idx.journalPublisher || '')) weak = [{ why: hijackWhy }].concat(weak);
  }

  var hj = !!hijackWhy;
  if (strong.length >= 1) return { level: 'danger', why: strong[0].why, hijack: hj };
  if (weak.length >= 2) return { level: 'danger', why: weak[0].why, hijack: hj };
  if (weak.length === 1) return { level: 'warning', why: weak[0].why, hijack: hj };

  // Green needs proof of WHO sent the email, not only that the journal exists:
  // the sender domain is an official publisher domain, or a known submission system sends for a verified journal.
  if (pub.status === 'success') return { level: 'success', why: pub.why };
  if (ctx.platform && journalOk) return { level: 'success', why: idx.status === 'success' ? idx.why : L.reasons.okAll };
  return { level: 'warning', why: hijackWhy || L.reasons.unverified, hijack: hj };
}

var ADVICE_ICON = { danger: 'stop', warning: 'search', success: 'check' };
var ADVICE_EMOJI = { danger: '⛔', warning: '🔍', success: '✅' };

var ASSET_VERSION = '4';

function asset(name) { return ASSET_BASE + name + '.png?v=' + ASSET_VERSION; }

function buildCard(lang, L, senderEmail, linkHosts, checks, ctx) {
  var dec = decide(checks, L, ctx || {});

  // 1. Decision
  var top = CardService.newCardSection();
  if (ASSET_BASE) {
    top.addWidget(CardService.newImage().setImageUrl(asset(dec.level + '-' + lang)).setAltText(L.verdict[dec.level]));
  } else {
    top.addWidget(CardService.newTextParagraph().setText('<font color="' + COLORS[dec.level] + '"><b>' + SYMBOLS[dec.level] + '  ' + L.verdict[dec.level] + '</b></font>'));
  }

  // 2. Advice
  var adviceText = '<font color="' + COLORS[dec.level] + '"><b>' + L.advice[dec.level] + '</b></font>';
  var advice = CardService.newDecoratedText().setWrapText(true);
  if (ASSET_BASE) advice.setText(adviceText).setStartIcon(CardService.newIconImage().setIconUrl(asset('icon-' + ADVICE_ICON[dec.level] + '-' + dec.level)));
  else advice.setText(ADVICE_EMOJI[dec.level] + ' ' + adviceText);
  top.addWidget(advice);

  // 3. Why
  var why = CardService.newDecoratedText().setTopLabel(ASSET_BASE ? L.why : '❔ ' + L.why).setText(dec.why).setWrapText(true);
  if (ASSET_BASE) why.setStartIcon(CardService.newIconImage().setIconUrl(asset('icon-help')));
  top.addWidget(why);

  // 3b. Attack type (most important one)
  var attacks = dec.level === 'success' ? [] : detectAttacks(checks, dec, senderEmail, ATTACK_TEXT[lang]);
  if (attacks.length) {
    var a0 = attacks[0], lv0 = ATTACKS[a0.id].lv;
    top.addWidget(CardService.newDecoratedText().setTopLabel(ATTACK_TEXT[lang].label)
      .setText('<font color="' + COLORS[lv0] + '"><b>' + ATTACK_TEXT[lang][a0.id][0] + '  ›</b></font>').setWrapText(true)
      .setOnClickAction(CardService.newAction().setFunctionName('showAttack').setParameters({ lang: lang, id: a0.id, ev: a0.ev })));
  }

  // 4. Key facts
  var site = '', scopus = 'none', scopusYear = '', quartile = '', pay = false;
  checks.forEach(function (c) {
    if (c.site && !site) site = c.site;
    if (c.scopus) scopus = c.scopus;
    if (c.scopusYear) scopusYear = c.scopusYear;
    if (c.quartile) quartile = c.quartile;
    if (c.pay) pay = true;
  });
  var scopusColor = { conf: COLORS.success, yes: COLORS.success, no: COLORS.danger, stopped: COLORS.danger, removed: COLORS.danger, mismatch: COLORS.danger, absent: COLORS.unknown, nojournal: COLORS.unknown, none: COLORS.unknown, off: COLORS.unknown }[scopus];
  var facts = CardService.newCardSection();
  var siteRow = CardService.newDecoratedText().setText('<b>' + L.site + ':</b>  ' +
    (site ? '<font color="#185FA5"><b>' + site + '</b></font>' : '<font color="' + COLORS.unknown + '"><b>' + L.unknownSite + '</b></font>'));
  if (site) siteRow.setOpenLink(CardService.newOpenLink().setUrl('https://' + site));
  facts.addWidget(siteRow);
  facts.addWidget(CardService.newDecoratedText().setText('<b>' + L.scopus + ':</b>  <font color="' + scopusColor + '"><b>' + fill(L.scopusState[scopus], { y: scopusYear }) + (quartile ? '  ·  ' + quartile : '') + '</b></font>'));
  facts.addWidget(CardService.newDecoratedText().setText('<b>' + L.pay + ':</b>  <font color="' + (pay ? COLORS.warning : COLORS.success) + '"><b>' + (pay ? L.yes : L.no) + '</b></font>'));

  // 5. Button that opens the details page
  var data = JSON.stringify({ lang: lang, sender: senderEmail, links: linkHosts, checks: checks.map(function (c) {
    return { s: c.status, t: c.title, d: c.detail, src: c.src || '' }; }), attacks: attacks });
  // Let the user check the journal through an official source, never through links in the email
  if (dec.level !== 'success' && ctx.sponsor && ctx.conf) {
    // Search the sponsor's own library, never a link from the email
    // IEEE: search the name as a phrase in proceedings titles only. ACM: search the name as a phrase.
    var sUrl = ctx.sponsor === 'ACM'
      ? 'https://dl.acm.org/action/doSearch?AllField=' + encodeURIComponent('"' + ctx.conf + '"')
      : 'https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=' + encodeURIComponent('("Publication Title":"' + ctx.conf + '")');
    facts.addWidget(CardService.newTextButton().setText(fill(L.checkConf, { p: ctx.sponsor }))
      .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
      .setOpenLink(CardService.newOpenLink().setUrl(sUrl)));
  } else if (dec.level !== 'success') {
    var raw = String(ctx.issn || '').replace(/[^0-9Xx]/g, '').toUpperCase();
    var checkUrl = raw.length === 8 ? 'https://portal.issn.org/resource/ISSN/' + raw.substr(0, 4) + '-' + raw.substr(4) : 'https://www.scopus.com/sources';
    facts.addWidget(CardService.newTextButton().setText(raw.length === 8 ? L.checkIssn : L.checkScopus)
      .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
      .setOpenLink(CardService.newOpenLink().setUrl(checkUrl)));
  }
  facts.addWidget(CardService.newTextButton().setText(fill(L.how, { n: checks.length }))
    .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
    .setOnClickAction(CardService.newAction().setFunctionName('showDetails').setParameters({ data: data })));

  return CardService.newCardBuilder().addSection(top).addSection(facts).build();
}

function legendItem(L, lv) {
  return '<font color="' + COLORS[lv] + '"><b>' + SYMBOLS[lv] + '</b> ' + L.legendChecks[lv] + '</font>';
}

function showDetails(e) {
  var data = JSON.parse(e.parameters.data);
  var L = T[data.lang];
  var used = [L.src.pub];
  data.checks.forEach(function (c) { if (c.src && c.s !== 'unknown' && used.indexOf(L.src[c.src]) === -1) used.push(L.src[c.src]); });

  var list = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText('<font color="' + COLORS.unknown + '">' + fill(L.verified, { s: used.join(', ') }) + '</font>'))
    .addWidget(ASSET_BASE
      ? CardService.newImage().setImageUrl(asset('legend-' + data.lang)).setAltText(L.meaning)
      : CardService.newTextParagraph().setText(legendItem(L, 'danger') + '&nbsp;&nbsp;&nbsp;&nbsp;' + legendItem(L, 'warning') + '<br>' +
        legendItem(L, 'success') + '&nbsp;&nbsp;&nbsp;&nbsp;' + legendItem(L, 'unknown')))
    .addWidget(CardService.newDivider());
  data.checks.forEach(function (c) {
    list.addWidget(CardService.newDecoratedText()
      .setText('<font color="' + COLORS[c.s] + '"><b>' + SYMBOLS[c.s] + '  ' + c.t + '</b></font>')
      .setBottomLabel(c.d).setWrapText(true));
  });
  var info = CardService.newCardSection().setHeader(L.details)
    .addWidget(CardService.newDecoratedText().setTopLabel(L.sender).setText(data.sender).setWrapText(true))
    .addWidget(CardService.newDecoratedText().setTopLabel(L.links).setText(data.links.length ? data.links.join(', ') : L.none).setWrapText(true));

  var builder = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(fill(L.how, { n: data.checks.length })));
  // The main page already shows the main attack type: list attack types here only when there is more than one
  if (data.attacks && data.attacks.length > 1) {
    var A = ATTACK_TEXT[data.lang];
    var atk = CardService.newCardSection().setHeader(A.types);
    data.attacks.forEach(function (a) {
      var lv = ATTACKS[a.id].lv;
      atk.addWidget(CardService.newDecoratedText()
        .setText('<font color="' + COLORS[lv] + '"><b>' + SYMBOLS[lv] + '  ' + A[a.id][0] + '  ›</b></font>')
        .setWrapText(true)
        .setOnClickAction(CardService.newAction().setFunctionName('showAttack').setParameters({ lang: data.lang, id: a.id, ev: a.ev })));
    });
    builder.addSection(atk);
  }
  var card = builder.addSection(list).addSection(info).build();
  return CardService.newActionResponseBuilder().setNavigation(CardService.newNavigation().pushCard(card)).build();
}

function simpleCard(L, msg) {
  return CardService.newCardBuilder()
    .addSection(CardService.newCardSection().addWidget(CardService.newTextParagraph().setText(msg)))
    .build();
}

function testScopus() {
  Logger.log('Neutrosophic Sets and Systems: ' + JSON.stringify(inactiveStatus(['2331-6055'])));
  Logger.log('Computers and Security: ' + JSON.stringify(inactiveStatus(['0167-4048'])));
  var L = T.en;
  var a = checkIndexing(L, '2331-6055', '', 'indexed in Scopus');
  Logger.log('Panel for Neutrosophic: ' + fill(L.scopusState[a.scopus], {}) + ' | ' + a.why);
  var b = checkIndexing(L, '0167-4048', '', 'indexed in Scopus');
  Logger.log('Panel for Computers and Security: ' + L.scopusState[b.scopus] + (b.quartile ? ' · ' + b.quartile : ''));
}

function testDomainAge() {
  ['bentham-peer-review-service-029.net', 'peerreviewservice.net', 'springernature.com', 'frontiersin.org', 'mdpi.com'].forEach(function (d) {
    var reg = registrationDate(d);
    Logger.log(d + ': ' + (reg ? Utilities.formatDate(reg, 'GMT', 'yyyy-MM-dd') : 'NOT FOUND'));
  });
}

function testDoaj() {
  // PLOS ONE is in DOAJ; the second ISSN is not a real journal
  Logger.log('PLOS ONE: ' + JSON.stringify(lookupDoaj('1932-6203')));
  Logger.log('Unknown ISSN: ' + JSON.stringify(lookupDoaj('1234-5679')));
}

function testConference() {
  // Checks that the conference list loads from the asset store and that ICCA is found
  var list = pinnedText(CONF_DIR + 'conf-I.txt', CONF_SHA256.I, CONF_VERSION);
  Logger.log('List I: ' + (list === 'TAMPERED' ? 'TAMPERED' : list ? list.length + ' characters' : 'NOT LOADED'));
  var c = conferenceInScopus('We invite you to the 7th International Conference on Computer and Applications (IEEE/ICCA 2025).');
  Logger.log('ICCA: ' + JSON.stringify(c));
  var d = registrationDate('icca-conf.info');
  Logger.log('icca-conf.info registered: ' + (d ? d.getFullYear() : 'NOT FOUND'));
}
