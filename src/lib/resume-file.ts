import { PDFDocument, PDFDict, PDFName } from 'pdf-lib';
export async function validateResume(bytes: Uint8Array) {
  if (bytes.length > 4_000_000 || new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-')
    throw new Error('Choose a valid PDF under 4 MB.');
  const document = await PDFDocument.load(bytes, { updateMetadata: false });
  if (document.isEncrypted || document.getPageCount() < 1 || document.getPageCount() > 20)
    throw new Error('Use an unencrypted PDF with 1–20 pages.');
  // Accept documents, not executable actions or attachments.
  for (const [, object] of document.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFDict)) continue;
    for (const key of ['JavaScript', 'JS', 'OpenAction', 'AA', 'EmbeddedFiles', 'RichMediaContent'])
      if (object.has(PDFName.of(key)))
        throw new Error('PDF actions and embedded files are not supported. Export a plain PDF.');
    const action = object.get(PDFName.of('S'))?.toString();
    if (
      action &&
      ['/JavaScript', '/Launch', '/GoToR', '/SubmitForm', '/ImportData'].includes(action)
    )
      throw new Error('PDF actions are not supported. Export a plain PDF.');
  }
  return document.save();
}
