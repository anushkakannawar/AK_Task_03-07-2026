import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import DarkVeil from '../components/backgrounds/DarkVeil';

/* ── Animated floating particles ── */
const useParticles = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2 + 0.4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.3 + 0.06,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,230,${p.a})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(200,210,230,${0.05 * (1 - d/120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [canvasRef]);
};

const Login = () => {
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  const doLogin = async (email, password) => {
    setLoading(true);
    try {
      const result = await login(email, password);
      navigate(result.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim())   errs.email    = 'Email is required';
    if (!form.password.trim()) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    await doLogin(form.email.trim(), form.password);
  };

  const fillDemo = async (role) => {
    const creds = role === 'admin'
      ? { email: 'admin@hrms.com', password: 'password' }
      : { email: 'john@hrms.com',  password: 'password' };
    setForm(creds);
    setErrors({});
    await doLogin(creds.email, creds.password);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#060610',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', overflow: 'hidden',
    }}>

      {/* DarkVeil — full screen background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <DarkVeil
          speed={0.4}
          hueShift={220}
          noiseIntensity={0.02}
          scanlineIntensity={0.03}
          scanlineFrequency={80}
          warpAmount={0.2}
          resolutionScale={1}
        />
      </div>

      {/* Particles canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      />

      {/* Light overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(6,6,16,0.45)' }} />

      {/* Login card */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: '390px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '50px', height: '50px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            marginBottom: '14px',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>H</span>
          </div>
          <h1 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.3rem', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            HR Management System
          </h1>
          <p style={{ color: 'rgba(203,213,225,0.6)', fontSize: '0.78rem', margin: 0 }}>NeoWesolutize Technology</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(14,16,24,0.85)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          <h2 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1rem', margin: '0 0 2px' }}>Welcome back</h2>
          <p style={{ color: 'rgba(203,213,225,0.6)', fontSize: '0.78rem', margin: '0 0 20px' }}>Sign in to your account</p>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(203,213,225,0.85)' }}>Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${errors.email ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '8px', color: '#f1f5f9', fontSize: '0.875rem',
                  padding: '9px 12px', outline: 'none', width: '100%',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.35)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                onBlur={e =>  { e.target.style.borderColor = errors.email ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              />
              {errors.email && <p style={{ fontSize: '0.7rem', color: '#f87171', margin: 0 }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(203,213,225,0.85)' }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${errors.password ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '8px', color: '#f1f5f9', fontSize: '0.875rem',
                  padding: '9px 12px', outline: 'none', width: '100%',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.35)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                onBlur={e =>  { e.target.style.borderColor = errors.password ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
              />
              {errors.password && <p style={{ fontSize: '0.7rem', color: '#f87171', margin: 0 }}>{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '4px', width: '100%', padding: '10px', borderRadius: '9px', border: 'none',
                background: isLoading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.12)',
                color: '#f1f5f9', fontWeight: 600, fontSize: '0.88rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.18)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
              onMouseOver={e => { if (!isLoading) { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; } }}
              onMouseOut={e =>  { e.currentTarget.style.background = isLoading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            >
              {isLoading ? (
                <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo quick access */}
          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(203,213,225,0.45)', marginBottom: '10px' }}>
              Quick demo access
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ role: 'admin', label: 'Admin Access' }, { role: 'employee', label: 'Employee Access' }].map(({ role, label }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  disabled={isLoading}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(203,213,225,0.8)',
                    cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseOver={e => { if (!isLoading) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; } }}
                  onMouseOut={e =>  { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.67rem', color: 'rgba(100,116,139,0.5)', marginTop: '18px' }}>
          © 2024 NeoWesolutize Technology
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
