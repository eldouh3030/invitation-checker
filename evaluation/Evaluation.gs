// Evaluation run for the paper.
// Reads emails.json from Google Drive, runs every check with the internet on,
// and writes one row per email to a Google Sheet named "Invitation Checker evaluation".
// Apps Script stops a run after 6 minutes, so run runEvaluation again until the log says "finished".

var EVAL_FILE = 'emails.json';
var EVAL_TIME_LIMIT = 5 * 60 * 1000;
var EVAL_HEADER = ['id', 'level', 'why', 'attacks', 'seconds', 'checks'];

function runEvaluation() { runFile(EVAL_FILE, 'EVAL_SHEET_ID', 'Invitation Checker evaluation'); }

// The test set written by a language model after the code was frozen.
function runLlmEvaluation() { runFile('llm-emails.json', 'LLM_SHEET_ID', 'Invitation Checker LLM test'); }

function runFile(fileName, propKey, title) {
  var start = Date.now();
  var files = DriveApp.getFilesByName(fileName);
  if (!files.hasNext()) throw new Error('Upload ' + fileName + ' to Google Drive first.');
  var emails = JSON.parse(files.next().getBlob().getDataAsString('UTF-8'));

  var sheet = evalSheet(propKey, title);
  var done = {};
  var last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, 1).getValues().forEach(function (r) { done[r[0]] = true; });

  var count = Object.keys(done).length;
  for (var i = 0; i < emails.length; i++) {
    var e = emails[i];
    if (done[e.id]) continue;
    if (Date.now() - start > EVAL_TIME_LIMIT) break;
    sheet.appendRow(evalOne(e));
    count++;
  }
  Logger.log('Done ' + count + ' of ' + emails.length + (count === emails.length ? '. Evaluation finished.' : '. Run the same function again.'));
  Logger.log('Results: ' + sheet.getParent().getUrl());
}

// Creates the results sheet the first time, then reuses it.
function evalSheet(propKey, title) {
  propKey = propKey || 'EVAL_SHEET_ID';
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(propKey);
  if (id) return SpreadsheetApp.openById(id).getSheetByName('Results');
  var ss = SpreadsheetApp.create(title || 'Invitation Checker evaluation');
  var sheet = ss.getSheets()[0].setName('Results');
  sheet.appendRow(EVAL_HEADER);
  props.setProperty(propKey, ss.getId());
  return sheet;
}

// Runs the add-on's own analysis on one stored email.
function evalOne(e) {
  var t0 = Date.now();
  var a = analyzeMessage(fakeMessage(e), 'en');
  var seconds = function () { return Math.round((Date.now() - t0) / 100) / 10; };
  if (!a) return [e.id, 'none', '', '', seconds(), ''];
  var L = T.en;
  var dec = decide(a.checks, L, a.ctx);
  var attacks = dec.level === 'success' ? [] : detectAttacks(a.checks, dec, a.senderEmail, ATTACK_TEXT.en);
  // Every check is kept, so the ablation study can be computed later without running again.
  var checks = JSON.stringify({ ctx: a.ctx, checks: a.checks });
  return [e.id, dec.level, dec.why, attacks.map(function (x) { return x.id; }).join(' '), seconds(), checks];
}

// Gives a stored email the same methods as a Gmail message.
function fakeMessage(e) {
  return {
    getFrom: function () { return e.from || ''; },
    getSubject: function () { return e.subject || ''; },
    getPlainBody: function () { return e.body || ''; },
    getReplyTo: function () { return e.replyTo || ''; },
    getHeader: function (name) { return name === 'Authentication-Results' ? (e.auth || '') : ''; },
    getAttachments: function () { return (e.files || []).map(function (n) { return { getName: function () { return n; } }; }); }
  };
}

// Starts the evaluation again from the first email (keeps the old sheet in Drive).
function resetEvaluation() {
  PropertiesService.getScriptProperties().deleteProperty('EVAL_SHEET_ID');
  Logger.log('Reset done. The next runEvaluation creates a new results sheet.');
}

// Saves the results as a CSV file in My Drive, for when the Sheets download does not work.
function exportResults() {
  var sheet = evalSheet();
  var rows = sheet.getDataRange().getValues();
  var csv = rows.map(function (r) {
    return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  var file = DriveApp.createFile('Invitation Checker results.csv', csv, MimeType.CSV);
  Logger.log('Saved in My Drive: ' + file.getName() + ' (' + rows.length + ' rows)');
}
