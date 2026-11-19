# Invitation Checker

Code and data for the article:

> A. A. El-Douh, "Verifying the sender, not the message: Detecting hijacked and predatory academic invitations in the inbox," submitted to *Journal of Information Security and Applications*.

Invitation Checker is a Gmail add-on that checks an academic invitation at the moment of reading. It runs twelve checks against public sources (Scopus, Crossref, DOAJ and domain registration data) and marks an email as genuine only when the sender is positively verified. Each verdict comes with a reason, an attack type mapped to MITRE ATT&CK, and advice in English or Arabic. The email text never leaves the user's account; only the sender domain, the ISSN and the venue name are sent to the public services.

## Contents

| Path | Description |
|---|---|
| `addon/Code.gs` | The add-on (Google Apps Script). SHA-256: `a9ac81644f576914a808eaafd3466533613ba9ebb15a43ab54f2dfb595ad3027` |
| `evaluation/Evaluation.gs` | The evaluation run used in the article. It reads the emails from Google Drive and writes one row per email to a Google Sheet. |
| `data/emails.json` | The 142 real emails, anonymized (see below). |
| `data/labels.csv` | The label and evidence rule of every real email. Contributors are shown as R1 to R4. |
| `data/labeling_rules.csv` | The evidence rules (Table 4 of the article). |
| `data/llm-emails.json` | The 40 emails written by a language model after the code was frozen (Section 6.4). |
| `results/run1.csv` to `results/run4-final.csv` | The four online runs on the real emails (Appendix A). `run4-final.csv` gives the results reported in Section 6. |
| `results/llm-test.csv` | The single run of the frozen tool on the 40 unseen emails. |

The two Scopus lists used by the add-on (inactive journals and conference series, built from the Scopus Source List of October 2026) are hosted in [eldouh3030/checker-assets](https://github.com/eldouh3030/checker-assets) and pinned in the code by their SHA-256 hashes.

## Running the add-on

1. Create a new Apps Script project and paste `addon/Code.gs`.
2. Configure the project as a Gmail add-on with a contextual trigger that runs when a message is opened.
3. Optional: add a Scopus API key (free from the Elsevier Developer Portal) as the script property `SCOPUS_API_KEY`. Without a key, the indexing check returns *unknown*.
4. Install the test deployment and open any email in Gmail.

## Reproducing the evaluation

1. Put `data/emails.json` (and `data/llm-emails.json` for the unseen test) in Google Drive.
2. Add `evaluation/Evaluation.gs` to the same project as the add-on.
3. Run `runEvaluation` (or `runLlmEvaluation`) until the log says "finished". Apps Script stops a run after six minutes, so the function resumes where it stopped.
4. Join the output sheet with `data/labels.csv` on `id`. Under the strict metric, *warning* and *danger* count as an alert.

The checks query live services, so a new run can differ slightly from the reported one when Scopus, Crossref, DOAJ or the domain registries change.

## Anonymization

All four researchers who contributed emails agreed to their publication after anonymization. In `data/emails.json`:

- the names and e-mail addresses of the recipients, their co-authors and the authors of manuscripts under review are replaced by `[recipient]` and `[email]`;
- paper titles are replaced by `[paper title]`, manuscript numbers by `[manuscript ID]`, and author lists and abstracts by `[redacted]`;
- e-mail addresses in the text are kept only when they belong to the sender's own domain;
- in every email not labeled Suspicious, the names and personal addresses of the senders (editors, conference chairs and staff) are replaced by `[sender]` and `[name]@domain`. Role addresses such as `info@` or `no-reply@` are kept.

Sender domains, reply-to domains, links and authentication results are kept, because they are the subject of the study. In suspicious emails, the sender display names and addresses are kept as they appeared, since they are part of the attack. The anonymization was applied after the evaluation, so rerunning the tool on the anonymized text can give a slightly different result for a few emails.

## License

The code is released under the MIT License. The data are released under CC BY 4.0.
