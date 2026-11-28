// Client-side checks and chunked upload for the enquiry uploader.
// The chosen file is sent in 4 MB pieces to /api/upload/* (stored in Netlify Blobs) when the
// form is submitted. The link is then added to the form as a hidden field and the native
// Netlify Forms POST goes ahead without the file itself. setCustomValidity makes the browser
// block submit on bad input.

export const MAX_BYTES = 500 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ['wav', 'aif', 'aiff', 'flac', 'mp3', 'zip'];

const WRONG_TYPE = 'Please choose a WAV, AIFF, FLAC, MP3 or ZIP file.';
const TOO_BIG =
  'That file is over 500 MB. Please upload it to WeTransfer, Google Drive or Dropbox and paste the link in "Link to your files".';
const BAD_LINK = 'Please enter a full link that starts with https:// or http://.';
const UPLOAD_FAILED = 'Your file did not upload. Please check your connection and try again, or paste a link instead.';

export function formatSize(bytes: number) {
  const mb = bytes / 1_048_576;
  return mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
}

async function post(url: string, body: BodyInit, headers?: Record<string, string>) {
  const res = await fetch(url, { method: 'POST', body, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error((data as { error?: string }).error || 'Upload failed');
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}

// Sends the file in chunks and returns the download link. Each chunk is retried up to 3 times.
export async function uploadFile(file: File, onProgress: (fraction: number) => void): Promise<string> {
  const init = await post('/api/upload/init', JSON.stringify({ name: file.name, size: file.size }), {
    'Content-Type': 'application/json',
  });
  const { id, chunkSize, chunks } = init as { id: string; chunkSize: number; chunks: number };
  for (let i = 0; i < chunks; i++) {
    const piece = file.slice(i * chunkSize, (i + 1) * chunkSize);
    for (let attempt = 1; ; attempt++) {
      try {
        await post(`/api/upload/chunk?id=${id}&i=${i}`, piece, { 'Content-Type': 'application/octet-stream' });
        break;
      } catch (err) {
        if (attempt >= 3) throw err;
        await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }
    onProgress((i + 1) / chunks);
  }
  const done = await post('/api/upload/complete', JSON.stringify({ id }), { 'Content-Type': 'application/json' });
  return (done as { link: string }).link;
}

export function initEnquiryUpload(form: HTMLFormElement) {
  const fileInput = form.querySelector<HTMLInputElement>('#attachment');
  const linkInput = form.querySelector<HTMLInputElement>('#project_link');
  if (!fileInput || !linkInput) return;

  const fileError = form.querySelector<HTMLElement>('#attachment-error');
  const linkError = form.querySelector<HTMLElement>('#project_link-error');
  const status = form.querySelector<HTMLElement>('#attachment-status');
  const clearBtn = form.querySelector<HTMLButtonElement>('#attachment-clear');

  const setState = (input: HTMLInputElement, errorEl: HTMLElement | null, message: string) => {
    input.setCustomValidity(message);
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }
    } else {
      input.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
    }
    return !message;
  };

  const validateFile = () => {
    const file = fileInput.files?.[0];
    if (!file) {
      if (status) status.textContent = '';
      if (clearBtn) clearBtn.hidden = true;
      return setState(fileInput, fileError, '');
    }
    if (status) status.textContent = `Selected: ${file.name} (${formatSize(file.size)})`;
    if (clearBtn) clearBtn.hidden = false;
    // Filename first, then size. MIME is ignored: real audio files often report an empty or octet-stream type.
    const ext = file.name.toLowerCase().split('.').pop() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) return setState(fileInput, fileError, WRONG_TYPE);
    if (file.size > MAX_BYTES) return setState(fileInput, fileError, TOO_BIG);
    return setState(fileInput, fileError, '');
  };

  const validateLink = () => {
    const value = linkInput.value.trim();
    if (!value) return setState(linkInput, linkError, '');
    try {
      const url = new URL(value);
      if (url.protocol === 'http:' || url.protocol === 'https:') return setState(linkInput, linkError, '');
    } catch {
      /* fall through */
    }
    return setState(linkInput, linkError, BAD_LINK);
  };

  fileInput.addEventListener('change', validateFile);
  linkInput.addEventListener('input', validateLink);
  linkInput.addEventListener('blur', validateLink);

  clearBtn?.addEventListener('click', () => {
    fileInput.value = '';
    validateFile();
    fileInput.focus();
  });

  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const linkField = form.querySelector<HTMLInputElement>('input[name="upload_link"]');
  const nameField = form.querySelector<HTMLInputElement>('input[name="upload_name"]');
  let uploading = false;

  // Capture phase: validate, then upload any chosen file before the native Netlify POST.
  form.addEventListener(
    'submit',
    (e) => {
      const fileOk = validateFile();
      const linkOk = validateLink();
      if (!fileOk || !linkOk) {
        e.preventDefault();
        e.stopImmediatePropagation();
        (fileOk ? linkInput : fileInput).focus();
        return;
      }
      const file = fileInput.files?.[0];
      if (!file || !linkField) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (uploading) return;
      uploading = true;
      const label = submitBtn?.querySelector('[data-label]') ?? submitBtn;
      const originalLabel = label?.textContent ?? '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }
      const show = (text: string) => {
        if (label) label.textContent = text;
        if (status) status.textContent = text;
      };
      show('Uploading 0%');
      uploadFile(file, (f) => show(`Uploading ${Math.round(f * 100)}%`))
        .then((link) => {
          linkField.value = link;
          if (nameField) nameField.value = file.name;
          // Drop the file from the native POST: it is already stored.
          fileInput.disabled = true;
          if (label) label.textContent = 'Sending…';
          form.submit();
        })
        .catch((err: Error & { status?: number }) => {
          uploading = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
          }
          if (label) label.textContent = originalLabel;
          setState(fileInput, fileError, err?.status === 429 ? err.message : UPLOAD_FAILED);
          if (status) status.textContent = '';
          fileInput.focus();
        });
    },
    true,
  );
}
