import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';
import { validateResume } from '../src/lib/resume-file';
import { schemas, defaults } from '../src/lib/content';
test('public resume is a real PDF and resume paths are constrained', async () => {
  const bytes = await validateResume(readFileSync('assets/initial/rohit-resume.pdf'));
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), 1);
  for (const path of ['https://evil.example/file.pdf', '../../private.pdf', 'resumes/image.svg'])
    assert.equal(
      schemas.profile.safeParse({
        ...defaults.profile,
        name: 'Rohit',
        headline: 'Student',
        email: 'test@example.com',
        resume_path: path,
      }).success,
      false,
    );
});
test('resume uploads reject invalid and executable PDFs', async () => {
  await assert.rejects(validateResume(new TextEncoder().encode('not a pdf')));
  const doc = await PDFDocument.create();
  doc.addPage();
  doc.catalog.set(
    PDFName.of('OpenAction'),
    doc.context.obj({ S: 'JavaScript', JS: PDFString.of('app.alert(1)') }),
  );
  await assert.rejects(validateResume(await doc.save()));
});
