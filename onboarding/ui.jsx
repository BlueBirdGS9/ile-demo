/* Ilé Onboarding — shared UI primitives */
const { useState, useEffect, useRef } = React;

/* extend icon set */
Object.assign(window.ICONS, {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M5 4h4l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  arrowLeft: '<path d="M19 12H5M11 18 5 12l6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  idCard: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8.5" cy="12" r="2"/><path d="M13 10h5M13 14h3"/>',
  face: '<circle cx="12" cy="12" r="9"/><path d="M8.5 10v1M15.5 10v1M9 15a4 4 0 0 0 6 0"/>',
  passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M9 16h6"/>',
  car: '<path d="M5 11l1.5-4h11L19 11M4 11h16v5h-2M4 16v-5M4 16h3M9 16h7"/><circle cx="7.5" cy="16" r="1.5"/><circle cx="16.5" cy="16" r="1.5"/>',
  vote: '<path d="M5 21h14M6 21V8l6-3 6 3v13M9 12h6M9 16h6"/>',
  deed: '<path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  cert: '<rect x="4" y="3" width="16" height="13" rx="2"/><circle cx="12" cy="9" r="2.5"/><path d="M9 19l3-2 3 2v3l-3-2-3 2z"/>',
  sparkle: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  handshake: '<path d="M11 8 8 5 3 9v4l3 3 2-2M13 8l3-3 5 4v4l-3 3-2-2M8 14l3 3M11 11l2 2"/>',
  store: '<path d="M4 9h16M5 9V6h14v3M5 9v11h14V9M9 20v-5h6v5"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  shieldLock: '<path d="M12 3 5 6v5.5c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6l-7-3Z"/><rect x="9.5" y="11" width="5" height="4" rx="1"/><path d="M10.5 11v-1a1.5 1.5 0 0 1 3 0v1"/>'
});

function Icon({ name, className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: window.ICONS[name] || '' }} />
  );
}

function Field({ label, req, hint, error, children }) {
  return (
    <div className="field" style={{ marginBottom: 16 }}>
      {label && <label className="field-label">{label}{req && <span className="req"> *</span>}</label>}
      {children}
      {error ? <span className="field-error"><Icon name="alertCircle" />{error}</span>
        : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

function TextInput(props) {
  const { error, prefix, ...rest } = props;
  if (prefix) {
    return (
      <div className="input-group">
        <span className="prefix">{prefix}</span>
        <input className={"input" + (error ? " is-error" : "")} {...rest} />
      </div>
    );
  }
  return <input className={"input" + (error ? " is-error" : "")} {...rest} />;
}

/* Trust footer note */
function SecureNote({ children }) {
  return (
    <div className="ob-foot-note">
      <Icon name="lock" />
      <span>{children || "Bank-grade encryption. Your data is never shared without consent."}</span>
    </div>
  );
}

/* OTP input group */
function OtpInput({ value, onChange, error }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);
  function set(i, v) {
    v = v.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = v;
    const next = arr.join('').slice(0, 6);
    onChange(next);
    if (v && refs.current[i + 1]) refs.current[i + 1].focus();
  }
  function key(i, e) {
    if (e.key === 'Backspace' && !digits[i].trim() && refs.current[i - 1]) refs.current[i - 1].focus();
  }
  return (
    <div className="otp-row">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input key={i} ref={el => refs.current[i] = el} inputMode="numeric" maxLength="1"
          className={"otp-box" + (digits[i].trim() ? " filled" : "") + (error ? " err" : "")}
          value={digits[i].trim()} onChange={e => set(i, e.target.value)} onKeyDown={e => key(i, e)} />
      ))}
    </div>
  );
}

/* Simulated upload that shows loading -> success */
function UploadCard({ label, fileName, fileSize, onUploaded }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  function go() {
    if (status === 'uploading') return;
    setStatus('uploading');
    setTimeout(() => { setStatus('done'); onUploaded && onUploaded(); }, 1400);
  }
  if (status === 'idle') {
    return (
      <div className="upload" onClick={go}>
        <div className="upload-ic"><Icon name="download" /></div>
        <h4>Upload {label}</h4>
        <p>Tap to capture or choose a file · JPG, PNG or PDF</p>
      </div>
    );
  }
  return (
    <div className="file-row">
      <div className="file-ic"><Icon name="file" /></div>
      <div className="file-meta">
        <div className="file-name">{fileName}</div>
        <div className="file-sub">
          {status === 'uploading' ? 'Uploading…' : <><Icon name="check" style={{ width: 14, height: 14, color: 'var(--success)' }} />Uploaded · {fileSize}</>}
        </div>
        {status === 'uploading' && <div className="file-bar"><div className="fill" style={{ width: '100%' }} /></div>}
      </div>
      {status === 'done' && <span className="chip chip--paid"><span className="dot"></span>Ready</span>}
    </div>
  );
}

Object.assign(window, { Icon, Field, TextInput, SecureNote, OtpInput, UploadCard });
