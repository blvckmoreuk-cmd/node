// Client-side checks for the enquiry uploader. Native multipart POST stays:
// no fetch/XHR, no headers. setCustomValidity makes the browser block submit itself.

// Netlify Forms caps the whole request at 8 MB. 7 MB leaves room for the other fields.
export const MAX_BYTES = 7_000_000;

const WRONG_TYPE = 'Please choose a single .wav file.';
const TOO_BIG =
  'That file is over 7 MB, which is the limit for a direct upload. Please upload it to WeTransfer, Google Drive or Dropbox and paste the link below.';
const BAD_LINK = 'Please enter a full link that starts with https:// or http://.';

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
    if (status) status.textContent = `Selected: ${file.name} (${(file.size / 1_000_000).toFixed(1)} MB)`;
    if (clearBtn) clearBtn.hidden = false;
    // Filename first, then size. MIME is ignored: real WAVs often report an empty or octet-stream type.
    if (!file.name.toLowerCase().endsWith('.wav')) return setState(fileInput, fileError, WRONG_TYPE);
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

  // Safety net for engines that skip constraint validation.
  form.addEventListener(
    'submit',
    (e) => {
      const fileOk = validateFile();
      const linkOk = validateLink();
      if (fileOk && linkOk) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      (fileOk ? linkInput : fileInput).focus();
    },
    true,
  );
}
