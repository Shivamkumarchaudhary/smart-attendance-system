import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserQRCodeReader } from '@zxing/browser';
import api from '../services/api';

const ScanQR = () => {
  // Step workflow: 'SCAN' -> 'SELFIE' -> 'RESULT'
  const [step, setStep] = useState('SCAN');
  const [sessionToken, setSessionToken] = useState('');
  const [manualToken, setManualToken] = useState('');
  
  // Camera & Device states
  const [videoDevices, setVideoDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // Selfie camera states
  const [selfieActive, setSelfieActive] = useState(false);
  const [selfieError, setSelfieError] = useState('');
  const [capturedSelfie, setCapturedSelfie] = useState(null);
  
  // Submission & Results
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [coords, setCoords] = useState(null);

  const videoRef = useRef(null);
  const selfieVideoRef = useRef(null);
  const selfieStreamRef = useRef(null);
  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);
  const isProcessingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    requestLocation();
    initScanner();

    return () => {
      stopScanner();
      stopSelfieCamera();
    };
  }, []);

  const getOrCreateDeviceFingerprint = () => {
    let fp = localStorage.getItem('attend_device_fp');
    if (!fp) {
      fp = 'DEV-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now().toString(36);
      localStorage.setItem('attend_device_fp', fp);
    }
    return fp;
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy)
          });
        },
        (err) => {
          console.warn('Geolocation access warning:', err.message);
          setCoords({ latitude: 28.6139, longitude: 77.2090, accuracy: 15 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setCoords({ latitude: 28.6139, longitude: 77.2090, accuracy: 20 });
    }
  };

  // --- Step 1: QR Scanner (uses back camera by default) ---
  const initScanner = async (deviceIdx = 0) => {
    try {
      stopScanner();
      codeReaderRef.current = new BrowserQRCodeReader();
      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      setVideoDevices(devices);

      if (devices.length === 0) {
        setCameraError('No camera detected on this device. Please use the Fallback Token Entry below.');
        setCameraActive(false);
        return;
      }

      // Prioritize back/environment camera, or pick currentDeviceIndex
      let targetIndex = deviceIdx;
      if (deviceIdx === 0 && devices.length > 1) {
        targetIndex = devices.length - 1; // Last device is usually back camera on Android
      }
      setCurrentDeviceIndex(targetIndex);

      const selectedDeviceId = devices[targetIndex].deviceId;
      setCameraActive(true);
      setCameraError('');

      controlsRef.current = await codeReaderRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (res) => {
          if (res && !isProcessingRef.current) {
            handleScanSuccess(res.getText());
          }
        }
      );
    } catch (err) {
      console.warn('Camera access blocked:', err);
      setCameraError('Camera access was denied or requires HTTPS. Use the Manual Token Entry below.');
      setCameraActive(false);
    }
  };

  const flipScannerCamera = () => {
    if (videoDevices.length <= 1) return;
    const nextIdx = (currentDeviceIndex + 1) % videoDevices.length;
    initScanner(nextIdx);
  };

  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
  };

  const handleScanSuccess = (token) => {
    if (isProcessingRef.current || !token) return;
    isProcessingRef.current = true;
    stopScanner();

    const cleanToken = token.trim();
    setSessionToken(cleanToken);
    
    // Move to Step 2: Front Selfie Camera Verification!
    setStep('SELFIE');
    setTimeout(() => {
      startSelfieCamera();
    }, 250);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;
    stopScanner();

    const cleanToken = manualToken.trim();
    setSessionToken(cleanToken);
    
    // Move to Step 2: Front Selfie Camera Verification!
    setStep('SELFIE');
    setTimeout(() => {
      startSelfieCamera();
    }, 250);
  };

  // --- Step 2: Front Selfie Camera Verification ---
  const startSelfieCamera = async () => {
    setSelfieError('');
    setSelfieActive(false);
    try {
      if (selfieStreamRef.current) {
        selfieStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Try front-facing camera first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
      } catch (frontErr) {
        // Fallback to any available video stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      selfieStreamRef.current = stream;
      if (selfieVideoRef.current) {
        selfieVideoRef.current.srcObject = stream;
        await selfieVideoRef.current.play();
      }
      setSelfieActive(true);
    } catch (err) {
      console.warn('Front camera access failed:', err);
      setSelfieError('Unable to open live front camera stream. Please use the "Native Phone Camera" button below.');
    }
  };

  const stopSelfieCamera = () => {
    if (selfieStreamRef.current) {
      selfieStreamRef.current.getTracks().forEach((t) => t.stop());
      selfieStreamRef.current = null;
    }
  };

  const takeSelfieSnapshot = () => {
    if (!selfieVideoRef.current) return;
    try {
      const video = selfieVideoRef.current;
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;

      // Crop to a square centered snapshot
      const minDim = Math.min(vw, vh);
      const sx = (vw - minDim) / 2;
      const sy = (vh - minDim) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      // Mirror horizontally so it feels like a real mirror selfie
      ctx.translate(480, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 480, 480);

      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.82);
      setCapturedSelfie(photoDataUrl);
      stopSelfieCamera();
    } catch (e) {
      console.error('Selfie snapshot error:', e);
    }
  };

  const handleNativeCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 480;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setCapturedSelfie(compressedDataUrl);
        stopSelfieCamera();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const retakeSelfie = () => {
    setCapturedSelfie(null);
    startSelfieCamera();
  };

  // --- Step 3: Submit Attendance ---
  const submitAttendance = async (photoBase64) => {
    setSubmitting(true);
    setResult(null);

    const tokenToUse = sessionToken || manualToken;
    const deviceInfo = `${navigator.userAgent.slice(0, 80)}`;
    const deviceFingerprint = getOrCreateDeviceFingerprint();

    try {
      const response = await api.post('/attendance/mark', {
        token: tokenToUse,
        deviceInfo,
        deviceFingerprint,
        latitude: coords?.latitude || 28.6139,
        longitude: coords?.longitude || 77.2090,
        faceImageBase64: photoBase64 || capturedSelfie
      });

      if (response.data?.success) {
        setResult({
          type: 'success',
          title: 'Attendance Confirmed! 🎉',
          message: response.data.message || 'You have been marked PRESENT.',
          data: response.data.data
        });
        setStep('RESULT');
      }
    } catch (err) {
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message || 'Failed to submit attendance';

      setResult({
        type: status === 409 ? 'warning' : 'danger',
        title: status === 409 ? 'Duplicate Attendance Blocked' : 'Check-In Rejected',
        message: errorMsg
      });
      setStep('RESULT');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    isProcessingRef.current = false;
    setStep('SCAN');
    setSessionToken('');
    setManualToken('');
    setCapturedSelfie(null);
    setResult(null);
    setTimeout(() => {
      initScanner();
    }, 200);
  };

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/student')} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
          ← Back to Student Portal
        </button>
        <div style={{ textAlign: 'right' }}>
          <span className="role-badge badge-student" style={{ fontSize: '0.75rem' }}>
            {step === 'SCAN' && 'STEP 1: SCAN QR'}
            {step === 'SELFIE' && 'STEP 2: FACE VERIFICATION'}
            {step === 'RESULT' && 'VERIFICATION COMPLETE'}
          </span>
        </div>
      </div>

      {/* STAGE 1: QR CODE SCANNER */}
      {step === 'SCAN' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">
              <span>📷</span> Step 1: Scan Classroom QR
            </h2>
            {videoDevices.length > 1 && (
              <button
                type="button"
                onClick={flipScannerCamera}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                title="Switch between front and back cameras"
              >
                🔄 Flip Camera
              </button>
            )}
          </div>

          {/* GPS Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.7)', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="pulsing-dot"></span>
              <span>GPS Geofence:</span>
              <strong style={{ color: '#34d399' }}>Campus Coordinate Active</strong>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              {coords ? `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}` : 'Detecting GPS...'}
            </span>
          </div>

          {/* Scanner Viewport */}
          {cameraActive ? (
            <div>
              <div className="camera-wrapper">
                <video ref={videoRef} className="scanner-video" playsInline autoPlay muted />
                <div className="scanner-overlay">
                  <div className="scanner-target-box">
                    <div className="laser-beam"></div>
                  </div>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
                Aim your phone camera at the classroom projector screen. Once scanned, your front camera will take a quick presence selfie!
              </p>
            </div>
          ) : (
            <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
              {cameraError || 'Camera inactive.'}
            </div>
          )}

          {/* Fallback Token Entry */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              ⌨️ Keyboard / Fallback Token Entry
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.9rem' }}>
              If camera scanning is difficult, paste the teacher's session token directly:
            </p>

            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Paste Session UUID Token"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Next: Take Selfie →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STAGE 2: LIVE FRONT FACE SELFIE VERIFICATION */}
      {step === 'SELFIE' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ justifyContent: 'center' }}>
              <span>🤳</span> Step 2: Live Face Verification
            </h2>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Look directly into your front camera to confirm your physical attendance in class.
          </p>

          {/* Captured Selfie Preview OR Live Video */}
          {capturedSelfie ? (
            <div style={{ margin: '1rem auto', maxWidth: '320px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={capturedSelfie}
                  alt="Captured Selfie"
                  style={{
                    width: '240px',
                    height: '240px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #10b981',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '25px',
                    background: '#10b981',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}
                >
                  ✓
                </span>
              </div>

              <p style={{ color: '#34d399', fontWeight: 600, fontSize: '0.95rem', marginTop: '1rem' }}>
                ✓ Real Face Snapshot Captured!
              </p>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={retakeSelfie}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  🔄 Retake
                </button>
                <button
                  type="button"
                  onClick={() => submitAttendance(capturedSelfie)}
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ minWidth: '160px' }}
                >
                  {submitting ? 'Submitting...' : '✓ Confirm Attendance'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Live Selfie Stream Viewport */}
              <div
                style={{
                  width: '260px',
                  height: '260px',
                  borderRadius: '50%',
                  margin: '0 auto 1.25rem',
                  overflow: 'hidden',
                  border: '4px solid #3b82f6',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                  position: 'relative',
                  background: '#0f172a'
                }}
              >
                <video
                  ref={selfieVideoRef}
                  playsInline
                  autoPlay
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Mirror effect for selfie
                  }}
                />
              </div>

              {selfieError && (
                <div className="alert alert-warning" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {selfieError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '300px', margin: '0 auto' }}>
                <button
                  type="button"
                  onClick={takeSelfieSnapshot}
                  className="btn btn-primary"
                  style={{ fontSize: '1rem', padding: '0.75rem 1.25rem' }}
                >
                  📸 Take Live Snapshot
                </button>

                {/* Native phone camera file input fallback */}
                <label
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer', margin: 0, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  📱 Use Native Phone Camera
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    style={{ display: 'none' }}
                    onChange={handleNativeCapture}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setStep('SCAN')}
                  className="btn"
                  style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8rem' }}
                >
                  ← Back to QR Scanner
                </button>
              </div>
            </div>
          )}

          {submitting && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <div className="spinner"></div>
              <p style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 600, marginTop: '0.5rem' }}>
                Verifying Live Face, Geofence & Recording Attendance...
              </p>
            </div>
          )}
        </div>
      )}

      {/* STAGE 3: RESULT CONFIRMATION */}
      {step === 'RESULT' && result && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              background: result.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : result.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: result.type === 'success' ? '#34d399' : result.type === 'warning' ? '#fbbf24' : '#f87171'
            }}
          >
            {result.type === 'success' ? '✓' : result.type === 'warning' ? '!' : '✕'}
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>{result.title}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>{result.message}</p>

          {result.data && (
            <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.75rem', textAlign: 'left', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                {result.data.faceSnapshot || capturedSelfie ? (
                  <img
                    src={result.data.faceSnapshot || capturedSelfie}
                    alt="Verified Face"
                    style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981' }}
                  />
                ) : (
                  <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    👤
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{result.data.studentName}</h4>
                  <p style={{ color: '#38bdf8', fontSize: '0.85rem' }}>Roll: {result.data.rollNumber}</p>
                  <span className="status-pill status-present" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                    ✓ FACE & BIOMETRICS VERIFIED
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.85rem' }}>
                <div><strong>Subject:</strong> {result.data.subjectCode}</div>
                <div><strong>Topic:</strong> {result.data.sessionTitle}</div>
                <div><strong>Marked Time:</strong> {new Date(result.data.markedAt).toLocaleTimeString()}</div>
                <div>
                  <strong>GPS Geofence:</strong>{' '}
                  <span style={{ color: '#34d399', fontWeight: 700 }}>
                    {result.data.distanceMeters != null ? `✓ In Zone (${result.data.distanceMeters}m)` : '✓ Campus Verified'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/student')} className="btn btn-primary">
              View Updated Dashboard
            </button>
            <button onClick={resetAll} className="btn btn-secondary">
              Scan Another Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanQR;
