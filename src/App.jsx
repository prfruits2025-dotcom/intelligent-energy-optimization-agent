/**
 * INTELLIGENT ENERGY OPTIMIZATION AGENT
 * Final Year Engineering Project - Complete Software Prototype
 * Tech: React + Tailwind CSS + Recharts + Lucide React
 * Features: Dashboard, Device Control, AI Optimization, Analytics,
 *           Smart Automation, Reports, Admin Settings, Landing Page
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import {
  Zap, Activity, Cpu, Thermometer, Wind, Sun, Moon,
  Power, Settings, BarChart2, Layout, Shield, Bell,
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle,
  Home, Lightbulb, Wifi, Clock, Download, FileText,
  ChevronRight, ChevronDown, ToggleLeft, ToggleRight,
  RefreshCw, Play, Pause, Eye, EyeOff, Lock, Unlock,
  Battery, BatteryCharging, Layers, Radio, Monitor,
  Globe, ArrowRight, Star, Award, Target, Sliders,
  PlusCircle, Trash2, Edit3, Save, X, Menu, LogOut,
  User, Database, Server, HardDrive, Gauge, Flame,
  Droplets, Leaf, DollarSign, Calendar, Filter, Search
} from "lucide-react";

// ─── CONSTANTS & SEED DATA ───────────────────────────────────────────────────

const NEON_GREEN = "#00ff88";
const NEON_BLUE = "#00b4ff";
const NEON_PURPLE = "#a855f7";
const NEON_ORANGE = "#ff6b35";
const NEON_CYAN = "#06d6ff";

const INITIAL_DEVICES = [
  { id: 1, name: "Central AC Unit", type: "ac", icon: "wind", power: 3200, status: true, auto: true, temp: 72, location: "Main Hall", efficiency: 87 },
  { id: 2, name: "Industrial Lighting", type: "lights", icon: "lightbulb", power: 850, status: true, auto: false, temp: 45, location: "Floor 1", efficiency: 92 },
  { id: 3, name: "Server Room Cooling", type: "ac", icon: "server", power: 2100, status: true, auto: true, temp: 68, location: "Server Room", efficiency: 78 },
  { id: 4, name: "CNC Machine #1", type: "machine", icon: "cpu", power: 5500, status: false, auto: false, temp: 85, location: "Workshop A", efficiency: 95 },
  { id: 5, name: "Smart LED Grid", type: "lights", icon: "sun", power: 420, status: true, auto: true, temp: 38, location: "Office Floor", efficiency: 96 },
  { id: 6, name: "Conveyor Motor", type: "machine", icon: "activity", power: 7800, status: true, auto: false, temp: 91, location: "Production", efficiency: 82 },
  { id: 7, name: "Exhaust Fans (x4)", type: "fan", icon: "wind", power: 1200, status: true, auto: true, temp: 52, location: "Factory Floor", efficiency: 89 },
  { id: 8, name: "Smart Plug Cluster", type: "plug", icon: "zap", power: 680, status: false, auto: false, temp: 41, location: "Break Room", efficiency: 94 },
];

const generateHourlyData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    consumption: Math.round(15 + Math.random() * 20 + (i >= 8 && i <= 18 ? 15 : 0)),
    predicted: Math.round(13 + Math.random() * 18 + (i >= 8 && i <= 18 ? 13 : 0)),
    cost: parseFloat((0.12 + Math.random() * 0.06).toFixed(3)),
  }));

const generateWeeklyData = () =>
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    actual: Math.round(280 + Math.random() * 120),
    target: 320,
    savings: Math.round(20 + Math.random() * 40),
  }));

const AUTOMATION_RULES = [
  { id: 1, name: "Peak Hour Reduction", trigger: "Time: 14:00–18:00", action: "Reduce AC by 15%", active: true, savings: "₹340/day" },
  { id: 2, name: "Idle Device Shutdown", trigger: "No motion 30 min", action: "Power off Floor lights", active: true, savings: "₹180/day" },
  { id: 3, name: "Morning Warm-up Schedule", trigger: "Time: 07:30", action: "Pre-cool facility", active: false, savings: "₹95/day" },
  { id: 4, name: "Weekend Low-Power Mode", trigger: "Sat–Sun all day", action: "Reduce to 40% capacity", active: true, savings: "₹520/week" },
  { id: 5, name: "Voltage Spike Protection", trigger: "Voltage > 245V", action: "Disconnect heavy loads", active: true, savings: "Equipment safety" },
  { id: 6, name: "Smart Load Balancing", trigger: "Total load > 18kW", action: "Stagger machine starts", active: false, savings: "₹210/day" },
];

const AI_RECOMMENDATIONS = [
  { id: 1, severity: "high", title: "CNC Machine Idle Detection", desc: "CNC Machine #1 drew 1.2kW in standby for 3h. Auto-off can save ₹28/day.", savings: 28, confidence: 94 },
  { id: 2, severity: "medium", title: "AC Pre-cooling Opportunity", desc: "Pre-cool 30 min before peak saves 18% compressor load during peak.", savings: 45, confidence: 87 },
  { id: 3, severity: "low", title: "LED Dimming at Dawn/Dusk", desc: "Natural light sensors can reduce LED Grid power by 35% at transition hours.", savings: 12, confidence: 91 },
  { id: 4, severity: "high", title: "Conveyor Motor Overconsumption", desc: "Running 23% above rated load. Schedule maintenance check + load reduction.", savings: 62, confidence: 98 },
  { id: 5, severity: "medium", title: "Server Cooling Optimization", desc: "Raise setpoint from 68°F to 72°F — still within safe range, saves 12% energy.", savings: 34, confidence: 85 },
];

const DEVICE_PIE = [
  { name: "AC Systems", value: 5300, color: NEON_BLUE },
  { name: "Machines", value: 7800, color: NEON_ORANGE },
  { name: "Lighting", value: 1270, color: "#ffd700" },
  { name: "Fans", value: 1200, color: NEON_CYAN },
  { name: "Plugs", value: 680, color: NEON_PURPLE },
];

// ─── UTILITY HOOKS ────────────────────────────────────────────────────────────

function useInterval(cb, delay) {
  const savedCb = useRef(cb);
  useEffect(() => { savedCb.current = cb; }, [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCb.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useAnimatedCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 60;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.round(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────────────────────

function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === "success" ? "rgba(0,255,136,0.12)" : t.type === "error" ? "rgba(255,80,80,0.12)" : "rgba(0,180,255,0.12)",
          border: `1px solid ${t.type === "success" ? NEON_GREEN : t.type === "error" ? "#ff5050" : NEON_BLUE}`,
          borderRadius: 10, padding: "12px 18px", color: "#e0e0e0", fontSize: 13,
          backdropFilter: "blur(16px)", display: "flex", alignItems: "center", gap: 10,
          animation: "slideInRight 0.3s ease", minWidth: 280,
          boxShadow: `0 0 18px ${t.type === "success" ? "rgba(0,255,136,0.2)" : "rgba(0,180,255,0.2)"}`,
        }}>
          {t.type === "success" ? <CheckCircle size={16} color={NEON_GREEN} /> : <Bell size={16} color={NEON_BLUE} />}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

function LandingPage({ onEnter }) {
  const [tick, setTick] = useState(0);
  useInterval(() => setTick(t => t + 1), 80);

  const stats = [
    { label: "kWh Saved Daily", value: 847, suffix: "+" },
    { label: "Cost Reduction", value: 34, suffix: "%" },
    { label: "CO₂ Reduced (kg)", value: 1240, suffix: "" },
    { label: "Devices Managed", value: 8, suffix: "" },
  ];

  const features = [
    { icon: <Zap size={28} />, title: "Real-Time Monitoring", desc: "Live IoT sensor data from voltage, current, temperature — updated every 2 seconds." },
    { icon: <Cpu size={28} />, title: "AI Optimization Engine", desc: "Machine-learning recommendations reduce wastage by detecting patterns invisible to humans." },
    { icon: <Shield size={28} />, title: "Smart Automation", desc: "Rule-based automation shuts down idle devices, schedules load balancing, and prevents spikes." },
    { icon: <BarChart2 size={28} />, title: "Advanced Analytics", desc: "Drill-down charts for hourly, daily, weekly consumption with cost and carbon analysis." },
    { icon: <Leaf size={28} />, title: "Carbon Footprint Tracker", desc: "Real-time CO₂ equivalence of your energy use with reduction projections." },
    { icon: <Download size={28} />, title: "Report Generation", desc: "Export professional PDF/CSV energy reports for audits and sustainability filings." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#030912", color: "#e0e0e0", fontFamily: "'Rajdhani', 'Orbitron', sans-serif", overflowX: "hidden" }}>
      {/* Animated grid background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(0,180,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.04) 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />

      {/* Glow orbs */}
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)", top: "10%", left: "5%", pointerEvents: "none", animation: "pulse 4s ease-in-out infinite" }} />
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,180,255,0.06) 0%, transparent 70%)", bottom: "10%", right: "5%", pointerEvents: "none", animation: "pulse 6s ease-in-out infinite 2s" }} />

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 60px", borderBottom: "1px solid rgba(0,180,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #00ff88, #00b4ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={22} color="#030912" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>IEOА</div>
            <div style={{ fontSize: 10, color: "#00b4ff", letterSpacing: 2 }}>ENERGY AGENT</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEnter} style={{ background: "rgba(0,180,255,0.1)", border: "1px solid rgba(0,180,255,0.3)", color: NEON_BLUE, padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 13, letterSpacing: 1 }}>
            LOGIN
          </button>
          <button onClick={onEnter} style={{ background: "linear-gradient(135deg, #00ff88, #00b4ff)", border: "none", color: "#030912", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
            LAUNCH DEMO →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "100px 40px 60px" }}>
        <div style={{ display: "inline-block", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 20, padding: "6px 18px", fontSize: 11, color: NEON_GREEN, letterSpacing: 3, marginBottom: 24 }}>
          ◉ LIVE SIMULATION ACTIVE — FINAL YEAR PROJECT 2025
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.1, letterSpacing: 2 }}>
          <span style={{ color: "#fff" }}>Intelligent Energy</span><br />
          <span style={{ background: "linear-gradient(135deg, #00ff88, #00b4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Optimization Agent</span>
        </h1>
        <p style={{ fontSize: 18, color: "#8892a4", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.7 }}>
          AI-powered IoT energy management platform that simulates industrial sensors, predicts wastage, and autonomously optimizes power consumption in real-time.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onEnter} style={{ background: "linear-gradient(135deg, #00ff88, #00b4ff)", border: "none", color: "#030912", padding: "16px 40px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, letterSpacing: 1, boxShadow: "0 0 30px rgba(0,255,136,0.4)" }}>
            ENTER DASHBOARD
          </button>
          <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", color: "#ccc", padding: "16px 40px", borderRadius: 10, cursor: "pointer", fontSize: 15, letterSpacing: 1 }}>
            VIEW ARCHITECTURE
          </button>
        </div>
      </div>

      {/* LIVE STATS */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap", padding: "0 40px 80px" }}>
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* FEATURES */}
      <div style={{ position: "relative", zIndex: 5, padding: "60px 60px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 38, fontWeight: 700, color: "#fff", letterSpacing: 1, margin: "0 0 12px" }}>Platform Capabilities</h2>
          <div style={{ width: 60, height: 3, background: "linear-gradient(90deg, #00ff88, #00b4ff)", margin: "0 auto" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,180,255,0.15)", borderRadius: 14, padding: "28px 24px", transition: "all 0.3s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,255,136,0.4)"; e.currentTarget.style.background = "rgba(0,255,136,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,180,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ color: NEON_GREEN, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8, letterSpacing: 0.5 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#7a8899", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "40px 40px 80px", position: "relative", zIndex: 5 }}>
        <button onClick={onEnter} style={{ background: "linear-gradient(135deg, #00ff88, #00b4ff)", border: "none", color: "#030912", padding: "18px 60px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 700, letterSpacing: 2, boxShadow: "0 0 40px rgba(0,180,255,0.3)" }}>
          LAUNCH FULL DEMO →
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
        @keyframes pulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes slideInRight { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f1a; } ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, suffix }) {
  const animated = useAnimatedCounter(value);
  return (
    <div style={{ background: "rgba(0,180,255,0.06)", border: "1px solid rgba(0,180,255,0.2)", borderRadius: 12, padding: "28px 36px", textAlign: "center", minWidth: 160 }}>
      <div style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: NEON_GREEN, fontFamily: "Orbitron, monospace" }}>{animated.toLocaleString()}{suffix}</div>
      <div style={{ fontSize: 11, color: "#6a7a8a", letterSpacing: 2, marginTop: 6 }}>{label}</div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1400);
  };

  const handleDemo = () => {
    setEmail("admin@energyops.in");
    setPass("demo1234");
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030912", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Rajdhani, sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(0,180,255,0.05) 1px, transparent 1px),linear-gradient(90deg, rgba(0,180,255,0.05) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div style={{ position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

      <div style={{ position: "relative", zIndex: 5, width: "100%", maxWidth: 420, padding: 40 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #00ff88, #00b4ff)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 30px rgba(0,255,136,0.4)" }}>
            <Zap size={32} color="#030912" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: 2, margin: 0 }}>ENERGY AGENT</h1>
          <p style={{ fontSize: 12, color: "#00b4ff", letterSpacing: 3, margin: "4px 0 0" }}>INTELLIGENT OPTIMIZATION PLATFORM</p>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,180,255,0.2)", borderRadius: 18, padding: 32, backdropFilter: "blur(20px)" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: "#8892a4", letterSpacing: 2, display: "block", marginBottom: 8 }}>EMAIL ADDRESS</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@energyops.in"
              style={{ width: "100%", background: "rgba(0,180,255,0.06)", border: "1px solid rgba(0,180,255,0.2)", borderRadius: 8, padding: "12px 16px", color: "#e0e0e0", fontSize: 14, outline: "none", fontFamily: "Rajdhani, sans-serif" }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 11, color: "#8892a4", letterSpacing: 2, display: "block", marginBottom: 8 }}>PASSWORD</label>
            <input value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="••••••••"
              style={{ width: "100%", background: "rgba(0,180,255,0.06)", border: "1px solid rgba(0,180,255,0.2)", borderRadius: 8, padding: "12px 16px", color: "#e0e0e0", fontSize: 14, outline: "none", fontFamily: "Rajdhani, sans-serif" }} />
          </div>
          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", background: loading ? "rgba(0,255,136,0.3)" : "linear-gradient(135deg, #00ff88, #00b4ff)", border: "none", color: "#030912", padding: "14px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, letterSpacing: 2, marginBottom: 12, transition: "all 0.3s" }}>
            {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
          </button>
          <button onClick={handleDemo} style={{ width: "100%", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.35)", color: NEON_PURPLE, padding: "12px", borderRadius: 8, cursor: "pointer", fontSize: 12, letterSpacing: 2 }}>
            ⚡ QUICK DEMO ACCESS
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#3a4a5a", marginTop: 20, letterSpacing: 1 }}>
          FINAL YEAR PROJECT · DEPT. OF ISE · 2025–26
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #4a5a6a; }
      `}</style>
    </div>
  );
}

// ─── MAIN APP SHELL ───────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("landing"); // landing | login | app
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [sensorData, setSensorData] = useState({ voltage: 231, current: 68.4, power: 15780, temp: 34.2, freq: 50.01, pf: 0.94 });
  const [hourlyData, setHourlyData] = useState(generateHourlyData());
  const [weeklyData] = useState(generateWeeklyData());
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState(3);
  const toastId = useRef(0);

  const addToast = useCallback((message, type = "info") => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  // Simulate live sensor updates
  useInterval(() => {
    setSensorData(prev => ({
      voltage: +(prev.voltage + (Math.random() - 0.5) * 2).toFixed(1),
      current: +(prev.current + (Math.random() - 0.5) * 1.5).toFixed(1),
      power: Math.round(prev.power + (Math.random() - 0.5) * 300),
      temp: +(prev.temp + (Math.random() - 0.5) * 0.5).toFixed(1),
      freq: +(49.95 + Math.random() * 0.1).toFixed(2),
      pf: +(0.91 + Math.random() * 0.06).toFixed(2),
    }));
  }, 2000);

  const totalPower = devices.filter(d => d.status).reduce((s, d) => s + d.power, 0);
  const activeCount = devices.filter(d => d.status).length;
  const savingsToday = 847;
  const co2Saved = 1.24;
  const efficiency = 84;

  if (page === "landing") return <LandingPage onEnter={() => setPage("login")} />;
  if (page === "login") return <LoginPage onLogin={() => setPage("app")} />;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Layout size={18} /> },
    { id: "devices", label: "Device Control", icon: <Power size={18} /> },
    { id: "ai", label: "AI Optimizer", icon: <Cpu size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    { id: "automation", label: "Automation", icon: <Shield size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#030912", color: "#e0e0e0", fontFamily: "Rajdhani, sans-serif" }}>
      <Toast toasts={toasts} remove={removeToast} />

      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 240 : 64, background: "rgba(5,15,35,0.95)", borderRight: "1px solid rgba(0,180,255,0.12)", transition: "width 0.3s ease", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative", zIndex: 20 }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(0,180,255,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00ff88, #00b4ff)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={18} color="#030912" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>ENERGY AGENT</div>
              <div style={{ fontSize: 9, color: NEON_BLUE, letterSpacing: 2 }}>v2.4.1 LIVE</div>
            </div>
          )}
        </div>

        {/* Sensor Summary */}
        {sidebarOpen && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,180,255,0.08)" }}>
            <div style={{ fontSize: 9, color: "#4a6070", letterSpacing: 2, marginBottom: 10 }}>LIVE SENSORS</div>
            {[
              { label: "Voltage", value: `${sensorData.voltage}V`, color: NEON_GREEN },
              { label: "Current", value: `${sensorData.current}A`, color: NEON_BLUE },
              { label: "Power", value: `${(sensorData.power / 1000).toFixed(1)}kW`, color: NEON_ORANGE },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#6a7a8a" }}>{s.label}</span>
                <span style={{ fontSize: 11, color: s.color, fontFamily: "Orbitron, monospace" }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, transition: "all 0.2s", textAlign: "left", fontSize: 13, letterSpacing: 0.5, fontFamily: "Rajdhani, sans-serif",
                background: activeTab === item.id ? "rgba(0,255,136,0.1)" : "transparent",
                color: activeTab === item.id ? NEON_GREEN : "#7a8899",
                borderLeft: activeTab === item.id ? `2px solid ${NEON_GREEN}` : "2px solid transparent",
              }}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(0,180,255,0.08)" }}>
          <button onClick={() => setPage("landing")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "rgba(255,80,80,0.08)", color: "#ff6060", fontSize: 12, fontFamily: "Rajdhani, sans-serif" }}>
            <LogOut size={16} />
            {sidebarOpen && "LOGOUT"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{ height: 60, background: "rgba(5,15,35,0.9)", borderBottom: "1px solid rgba(0,180,255,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", color: "#7a8899", cursor: "pointer" }}>
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
                {navItems.find(n => n.id === activeTab)?.label}
              </div>
              <div style={{ fontSize: 10, color: "#4a6070", letterSpacing: 2 }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 6, padding: "5px 12px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: NEON_GREEN, animation: "blink 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: 11, color: NEON_GREEN, letterSpacing: 1 }}>LIVE</span>
            </div>
            <div style={{ position: "relative" }}>
              <button style={{ background: "none", border: "none", color: "#7a8899", cursor: "pointer" }}>
                <Bell size={20} />
              </button>
              {notifications > 0 && (
                <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ff4444", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notifications}
                </div>
              )}
            </div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #00ff88, #00b4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#030912" }}>
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 24, position: "relative" }}>
          {activeTab === "dashboard" && <DashboardPage sensorData={sensorData} devices={devices} hourlyData={hourlyData} totalPower={totalPower} activeCount={activeCount} savingsToday={savingsToday} co2Saved={co2Saved} efficiency={efficiency} />}
          {activeTab === "devices" && <DevicesPage devices={devices} setDevices={setDevices} addToast={addToast} />}
          {activeTab === "ai" && <AIPage addToast={addToast} />}
          {activeTab === "analytics" && <AnalyticsPage hourlyData={hourlyData} weeklyData={weeklyData} />}
          {activeTab === "automation" && <AutomationPage addToast={addToast} />}
          {activeTab === "reports" && <ReportsPage addToast={addToast} />}
          {activeTab === "settings" && <SettingsPage addToast={addToast} />}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030912; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideInRight { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes fadeInUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #040d1e; }
        ::-webkit-scrollbar-thumb { background: #1a3050; border-radius: 3px; }
        input, select, button { font-family: inherit; }
      `}</style>
    </div>
  );
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

function GlassCard({ children, style = {}, glow = NEON_BLUE, onClick }) {
  return (
    <div onClick={onClick} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(0,180,255,0.15)`, borderRadius: 14, padding: 20, backdropFilter: "blur(10px)", transition: "all 0.25s", ...style }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.borderColor = `rgba(0,255,136,0.35)`; e.currentTarget.style.boxShadow = `0 0 24px rgba(0,255,136,0.08)`; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.borderColor = "rgba(0,180,255,0.15)"; e.currentTarget.style.boxShadow = "none"; } : undefined}>
      {children}
    </div>
  );
}

function MetricBig({ label, value, unit, icon, color, change }) {
  return (
    <GlassCard style={{ flex: 1, minWidth: 160 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#6a7a8a", letterSpacing: 2 }}>{label}</div>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "Orbitron, monospace", letterSpacing: 1 }}>
        {value}<span style={{ fontSize: 13, fontWeight: 400, color: "#7a8899", marginLeft: 4 }}>{unit}</span>
      </div>
      {change && (
        <div style={{ fontSize: 11, color: change > 0 ? "#ff6060" : NEON_GREEN, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
          {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change)}% vs yesterday
        </div>
      )}
    </GlassCard>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: 1, margin: 0 }}>{title}</h2>
      {sub && <div style={{ fontSize: 12, color: "#4a6070", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

function DashboardPage({ sensorData, devices, hourlyData, totalPower, activeCount, savingsToday, co2Saved, efficiency }) {
  const animPower = useAnimatedCounter(Math.round(totalPower / 1000 * 10) / 10);

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      {/* KPI Row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <MetricBig label="TOTAL POWER LOAD" value={(totalPower / 1000).toFixed(1)} unit="kW" icon={<Zap size={20} />} color={NEON_GREEN} change={-3.2} />
        <MetricBig label="ACTIVE DEVICES" value={activeCount} unit={`/ ${devices.length}`} icon={<Activity size={20} />} color={NEON_BLUE} />
        <MetricBig label="TODAY'S SAVINGS" value={`₹${savingsToday}`} unit="" icon={<DollarSign size={20} />} color={NEON_ORANGE} change={-8.4} />
        <MetricBig label="CO₂ OFFSET" value={co2Saved} unit="tonnes" icon={<Leaf size={20} />} color="#00ffcc" />
        <MetricBig label="EFFICIENCY SCORE" value={efficiency} unit="%" icon={<Gauge size={20} />} color={NEON_PURPLE} change={2.1} />
      </div>

      {/* Live Sensor Strip */}
      <GlassCard style={{ marginBottom: 20, padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: NEON_GREEN, animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: 10, color: NEON_GREEN, letterSpacing: 2 }}>LIVE SENSOR TELEMETRY</span>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Voltage", value: `${sensorData.voltage} V`, color: NEON_GREEN },
            { label: "Current", value: `${sensorData.current} A`, color: NEON_BLUE },
            { label: "Power", value: `${(sensorData.power / 1000).toFixed(2)} kW`, color: NEON_ORANGE },
            { label: "Temperature", value: `${sensorData.temp} °C`, color: "#ffd700" },
            { label: "Frequency", value: `${sensorData.freq} Hz`, color: NEON_CYAN },
            { label: "Power Factor", value: sensorData.pf, color: NEON_PURPLE },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 9, color: "#4a6070", letterSpacing: 2 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "Orbitron, monospace", marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 20 }}>
        {/* Consumption Chart */}
        <GlassCard>
          <SectionTitle title="24-Hour Energy Consumption" sub="Actual vs AI-Predicted — kWh" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="aGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NEON_GREEN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={NEON_GREEN} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="aBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NEON_BLUE} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={NEON_BLUE} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: "#5a6a7a", fontSize: 10 }} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "#5a6a7a", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0a1525", border: "1px solid rgba(0,180,255,0.25)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="consumption" stroke={NEON_GREEN} strokeWidth={2} fill="url(#aGreen)" name="Actual (kWh)" />
              <Area type="monotone" dataKey="predicted" stroke={NEON_BLUE} strokeWidth={1.5} strokeDasharray="4 4" fill="url(#aBlue)" name="Predicted (kWh)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Device Pie */}
        <GlassCard>
          <SectionTitle title="Load Distribution" sub="By device category" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={DEVICE_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {DEVICE_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0a1525", border: "1px solid rgba(0,180,255,0.25)", borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
            {DEVICE_PIE.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ color: "#8a9aaa" }}>{d.name}</span>
                </div>
                <span style={{ color: d.color, fontFamily: "Orbitron, monospace" }}>{(d.value / 1000).toFixed(1)}kW</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Device Status */}
      <SectionTitle title="Device Status Overview" sub="Real-time device monitoring" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {devices.map(d => (
          <GlassCard key={d.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#d0d8e8" }}>{d.name}</div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.status ? NEON_GREEN : "#444", flexShrink: 0, animation: d.status ? "blink 2s infinite" : "none" }} />
            </div>
            <div style={{ fontSize: 11, color: "#5a6a7a", marginBottom: 6 }}>{d.location}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: d.status ? NEON_BLUE : "#444", fontFamily: "Orbitron, monospace" }}>
                {d.status ? `${(d.power / 1000).toFixed(1)}kW` : "OFF"}
              </span>
              <span style={{ fontSize: 11, color: "#4a5a6a" }}>{d.temp}°C</span>
            </div>
            <div style={{ marginTop: 8, background: "rgba(255,255,255,0.05)", borderRadius: 3, height: 3 }}>
              <div style={{ width: `${d.efficiency}%`, height: "100%", background: d.efficiency > 90 ? NEON_GREEN : d.efficiency > 80 ? NEON_BLUE : NEON_ORANGE, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 9, color: "#4a5a6a", marginTop: 4 }}>Efficiency: {d.efficiency}%</div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ─── DEVICES PAGE ─────────────────────────────────────────────────────────────

function DevicesPage({ devices, setDevices, addToast }) {
  const toggle = (id, field) => {
    setDevices(ds => ds.map(d => {
      if (d.id !== id) return d;
      const updated = { ...d, [field]: !d[field] };
      if (field === "status") addToast(`${d.name} turned ${updated.status ? "ON" : "OFF"}`, updated.status ? "success" : "info");
      return updated;
    }));
  };

  const typeIcons = { ac: <Wind size={22} />, lights: <Sun size={22} />, machine: <Cpu size={22} />, fan: <Wind size={22} />, plug: <Zap size={22} /> };
  const typeColors = { ac: NEON_BLUE, lights: "#ffd700", machine: NEON_ORANGE, fan: NEON_CYAN, plug: NEON_PURPLE };

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle title="Device Control Panel" sub="Manage and monitor all industrial devices" />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setDevices(ds => ds.map(d => ({ ...d, status: true }))); addToast("All devices powered ON", "success"); }}
            style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: NEON_GREEN, padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, letterSpacing: 1 }}>
            ALL ON
          </button>
          <button onClick={() => { setDevices(ds => ds.map(d => ({ ...d, status: false }))); addToast("All devices powered OFF", "info"); }}
            style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff6060", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, letterSpacing: 1 }}>
            ALL OFF
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {devices.map(d => {
          const color = typeColors[d.type] || NEON_BLUE;
          return (
            <GlassCard key={d.id} style={{ padding: 20 }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `rgba(0,0,0,0.3)`, border: `1px solid ${d.status ? color : "#2a3a4a"}`, display: "flex", alignItems: "center", justifyContent: "center", color: d.status ? color : "#3a4a5a", transition: "all 0.3s" }}>
                    {typeIcons[d.type]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#d0d8e8" }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "#5a6a7a" }}>{d.location} · {d.type.toUpperCase()}</div>
                  </div>
                </div>
                {/* Power toggle */}
                <button onClick={() => toggle(d.id, "status")}
                  style={{ background: d.status ? `rgba(0,255,136,0.1)` : "rgba(255,255,255,0.04)", border: `1px solid ${d.status ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.1)"}`, color: d.status ? NEON_GREEN : "#5a6a7a", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 11, letterSpacing: 1, transition: "all 0.3s" }}>
                  {d.status ? "● ON" : "○ OFF"}
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "POWER", value: d.status ? `${(d.power / 1000).toFixed(1)}kW` : "0.0kW", color: d.status ? color : "#3a4a5a" },
                  { label: "TEMP", value: `${d.temp}°C`, color: d.temp > 80 ? "#ff6060" : "#ffd700" },
                  { label: "EFF", value: `${d.efficiency}%`, color: d.efficiency > 90 ? NEON_GREEN : NEON_BLUE },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#4a5a6a", letterSpacing: 2, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color, fontFamily: "Orbitron, monospace" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Efficiency bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "#5a6a7a" }}>EFFICIENCY</span>
                  <span style={{ fontSize: 10, color: color }}>{d.efficiency}%</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 5 }}>
                  <div style={{ width: `${d.efficiency}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: "width 0.5s" }} />
                </div>
              </div>

              {/* Auto mode toggle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#5a6a7a", letterSpacing: 1 }}>SMART AUTO MODE</span>
                <button onClick={() => toggle(d.id, "auto")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: d.auto ? NEON_PURPLE : "#3a4a5a", display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: 1 }}>
                  {d.auto ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  {d.auto ? "AUTO" : "MANUAL"}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

// ─── AI OPTIMIZER PAGE ────────────────────────────────────────────────────────

function AIPage({ addToast }) {
  const [applying, setApplying] = useState(null);
  const [applied, setApplied] = useState([]);
  const score = 84;

  const apply = (id) => {
    setApplying(id);
    setTimeout(() => {
      setApplying(null);
      setApplied(a => [...a, id]);
      addToast("AI optimization applied successfully!", "success");
    }, 1800);
  };

  const severityColor = { high: "#ff6060", medium: NEON_ORANGE, low: NEON_GREEN };
  const severityBg = { high: "rgba(255,80,80,0.08)", medium: "rgba(255,107,53,0.08)", low: "rgba(0,255,136,0.05)" };

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      {/* Score + Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
        <GlassCard style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#4a6070", letterSpacing: 2, marginBottom: 16 }}>AI EFFICIENCY SCORE</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: NEON_GREEN, fontFamily: "Orbitron, monospace" }}>{score}</div>
          <div style={{ fontSize: 12, color: "#6a7a8a", marginBottom: 20 }}>out of 100</div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 8, marginBottom: 8 }}>
            <div style={{ width: `${score}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${NEON_GREEN}, ${NEON_BLUE})` }} />
          </div>
          <div style={{ fontSize: 12, color: NEON_GREEN }}>↑ 3.2 pts since last week</div>
        </GlassCard>

        <GlassCard>
          <SectionTitle title="AI Analysis Summary" sub="Machine learning insights from sensor data" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Waste Detected", value: "₹1,240/mo", icon: <AlertTriangle size={16} />, color: "#ff6060" },
              { label: "Potential Savings", value: "₹3,780/mo", icon: <TrendingDown size={16} />, color: NEON_GREEN },
              { label: "Predictions Made", value: "247 today", icon: <Target size={16} />, color: NEON_BLUE },
              { label: "Actions Suggested", value: `${AI_RECOMMENDATIONS.length} open`, icon: <Zap size={16} />, color: NEON_ORANGE },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: 10, color: "#5a6a7a", letterSpacing: 1 }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "Orbitron, monospace" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recommendations */}
      <SectionTitle title="AI Recommendations" sub="Prioritized optimization actions" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {AI_RECOMMENDATIONS.map(rec => (
          <div key={rec.id} style={{ background: severityBg[rec.severity], border: `1px solid ${severityColor[rec.severity]}40`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${severityColor[rec.severity]}15`, border: `1px solid ${severityColor[rec.severity]}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={18} color={severityColor[rec.severity]} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#d0d8e8" }}>{rec.title}</span>
                <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: `${severityColor[rec.severity]}20`, color: severityColor[rec.severity], letterSpacing: 1 }}>{rec.severity.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 12, color: "#7a8899", marginBottom: 6 }}>{rec.desc}</div>
              <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                <span style={{ color: NEON_GREEN }}>Saves ₹{rec.savings}/day</span>
                <span style={{ color: "#5a6a7a" }}>Confidence: {rec.confidence}%</span>
              </div>
            </div>
            {applied.includes(rec.id) ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: NEON_GREEN, fontSize: 12 }}>
                <CheckCircle size={16} /> APPLIED
              </div>
            ) : (
              <button onClick={() => apply(rec.id)} disabled={applying === rec.id}
                style={{ background: applying === rec.id ? "rgba(0,255,136,0.1)" : "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.35)", color: NEON_GREEN, padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, letterSpacing: 1, minWidth: 80 }}>
                {applying === rec.id ? "..." : "APPLY"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Prediction chart */}
      <GlassCard style={{ marginTop: 20 }}>
        <SectionTitle title="48-Hour Power Demand Forecast" sub="AI-predicted load curve" />
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={Array.from({ length: 48 }, (_, i) => ({
            hour: i, load: Math.round(10 + Math.random() * 14 + (i % 24 >= 8 && i % 24 <= 18 ? 10 : 0)),
            upper: Math.round(14 + Math.random() * 18 + (i % 24 >= 8 && i % 24 <= 18 ? 12 : 0)),
          }))}>
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NEON_PURPLE} stopOpacity={0.4} />
                <stop offset="95%" stopColor={NEON_PURPLE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="hour" tick={{ fill: "#5a6a7a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#5a6a7a", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a1525", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 8, fontSize: 11 }} />
            <Area type="monotone" dataKey="upper" stroke={NEON_PURPLE} strokeWidth={1} strokeDasharray="3 3" fill="url(#forecastGrad)" name="Upper Bound" />
            <Area type="monotone" dataKey="load" stroke={NEON_BLUE} strokeWidth={2} fill="none" name="Predicted Load (kW)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────

function AnalyticsPage({ hourlyData, weeklyData }) {
  const [range, setRange] = useState("daily");

  const costData = hourlyData.map(h => ({ ...h, cost: +(h.consumption * 0.12).toFixed(2) }));

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle title="Energy Analytics" sub="Comprehensive consumption analysis" />
        <div style={{ display: "flex", gap: 6 }}>
          {["daily", "weekly", "monthly"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: "7px 16px", borderRadius: 6, border: `1px solid ${range === r ? NEON_BLUE : "rgba(0,180,255,0.15)"}`, background: range === r ? "rgba(0,180,255,0.1)" : "transparent", color: range === r ? NEON_BLUE : "#6a7a8a", cursor: "pointer", fontSize: 11, letterSpacing: 1, fontFamily: "Rajdhani, sans-serif" }}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "TOTAL CONSUMED", value: "642 kWh", color: NEON_BLUE },
          { label: "PEAK DEMAND", value: "18.4 kW", color: NEON_ORANGE },
          { label: "AVG LOAD", value: "12.1 kW", color: NEON_GREEN },
          { label: "TOTAL COST", value: "₹5,840", color: NEON_PURPLE },
        ].map(k => (
          <GlassCard key={k.label} style={{ padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#4a6070", letterSpacing: 2, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color, fontFamily: "Orbitron, monospace" }}>{k.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Hourly Consumption */}
      <GlassCard style={{ marginBottom: 16 }}>
        <SectionTitle title="Hourly Consumption Pattern" sub="kWh consumption with cost overlay" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="hour" tick={{ fill: "#5a6a7a", fontSize: 9 }} interval={2} />
            <YAxis tick={{ fill: "#5a6a7a", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#0a1525", border: "1px solid rgba(0,180,255,0.25)", borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#8a9aaa" }} />
            <Bar dataKey="consumption" name="Consumption (kWh)" fill={NEON_BLUE} radius={[3, 3, 0, 0]} opacity={0.8} />
            <Bar dataKey="predicted" name="Predicted (kWh)" fill={NEON_PURPLE} radius={[3, 3, 0, 0]} opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Weekly Trend */}
        <GlassCard>
          <SectionTitle title="Weekly Energy Trend" sub="Actual vs Target" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#5a6a7a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#5a6a7a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0a1525", border: "1px solid rgba(0,180,255,0.25)", borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="actual" stroke={NEON_GREEN} strokeWidth={2} dot={{ fill: NEON_GREEN, r: 4 }} name="Actual (kWh)" />
              <Line type="monotone" dataKey="target" stroke="#ff6060" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Target (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Savings */}
        <GlassCard>
          <SectionTitle title="Daily Savings" sub="kWh saved vs baseline" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#5a6a7a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#5a6a7a", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0a1525", border: "1px solid rgba(0,180,255,0.25)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="savings" name="Savings (kWh)" fill={NEON_GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Cost Analysis Table */}
      <GlassCard>
        <SectionTitle title="Cost Analysis — Hourly Breakdown" sub="Energy cost per hour" />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,180,255,0.15)" }}>
                {["Hour", "Consumption (kWh)", "Cost (₹)", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#5a6a7a", fontSize: 10, letterSpacing: 1, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costData.filter((_, i) => i % 3 === 0).map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,180,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 14px", color: NEON_BLUE, fontFamily: "Orbitron, monospace", fontSize: 11 }}>{r.hour}</td>
                  <td style={{ padding: "10px 14px", color: "#d0d8e8" }}>{r.consumption}</td>
                  <td style={{ padding: "10px 14px", color: NEON_GREEN, fontFamily: "Orbitron, monospace" }}>₹{(r.consumption * 9.5).toFixed(0)}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: r.consumption > 35 ? "rgba(255,80,80,0.12)" : "rgba(0,255,136,0.1)", color: r.consumption > 35 ? "#ff6060" : NEON_GREEN, letterSpacing: 1 }}>
                      {r.consumption > 35 ? "PEAK" : "NORMAL"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ─── AUTOMATION PAGE ──────────────────────────────────────────────────────────

function AutomationPage({ addToast }) {
  const [rules, setRules] = useState(AUTOMATION_RULES);

  const toggle = (id) => {
    setRules(rs => rs.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, active: !r.active };
      addToast(`Rule "${r.name}" ${updated.active ? "enabled" : "disabled"}`, updated.active ? "success" : "info");
      return updated;
    }));
  };

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <SectionTitle title="Smart Automation Rules" sub="Configure intelligent energy management rules" />
        <button onClick={() => addToast("New rule dialog — feature in full build", "info")}
          style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", color: NEON_GREEN, padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
          <PlusCircle size={15} /> NEW RULE
        </button>
      </div>

      {/* Active/Inactive Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <GlassCard style={{ flex: 1, textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: NEON_GREEN, fontFamily: "Orbitron, monospace" }}>{rules.filter(r => r.active).length}</div>
          <div style={{ fontSize: 10, color: "#5a6a7a", letterSpacing: 2, marginTop: 4 }}>ACTIVE RULES</div>
        </GlassCard>
        <GlassCard style={{ flex: 1, textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#5a6a7a", fontFamily: "Orbitron, monospace" }}>{rules.filter(r => !r.active).length}</div>
          <div style={{ fontSize: 10, color: "#5a6a7a", letterSpacing: 2, marginTop: 4 }}>PAUSED RULES</div>
        </GlassCard>
        <GlassCard style={{ flex: 2, padding: 14 }}>
          <div style={{ fontSize: 10, color: "#4a6070", letterSpacing: 2, marginBottom: 8 }}>TOTAL DAILY SAVINGS (ACTIVE)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: NEON_GREEN, fontFamily: "Orbitron, monospace" }}>
            ₹{rules.filter(r => r.active).reduce((s, r) => s + (parseInt(r.savings) || 0), 0)}/day
          </div>
        </GlassCard>
      </div>

      {/* Rules List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rules.map(rule => (
          <GlassCard key={rule.id} style={{ padding: 18, borderColor: rule.active ? "rgba(0,255,136,0.2)" : "rgba(0,180,255,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: rule.active ? NEON_GREEN : "#2a3a4a", flexShrink: 0, boxShadow: rule.active ? `0 0 8px ${NEON_GREEN}` : "none" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#d0d8e8", marginBottom: 6 }}>{rule.name}</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 11, color: "#6a7a8a" }}>
                    <span style={{ color: NEON_BLUE }}>TRIGGER:</span> {rule.trigger}
                  </div>
                  <div style={{ fontSize: 11, color: "#6a7a8a" }}>
                    <span style={{ color: NEON_ORANGE }}>ACTION:</span> {rule.action}
                  </div>
                  <div style={{ fontSize: 11, color: NEON_GREEN }}>SAVES: {rule.savings}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={() => addToast("Edit rule — available in full build", "info")}
                  style={{ background: "none", border: "none", color: "#5a6a7a", cursor: "pointer" }}>
                  <Edit3 size={16} />
                </button>
                <button onClick={() => toggle(rule.id)}
                  style={{ background: rule.active ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${rule.active ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}`, color: rule.active ? NEON_GREEN : "#5a6a7a", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, letterSpacing: 1, fontFamily: "Rajdhani, sans-serif" }}>
                  {rule.active ? "DISABLE" : "ENABLE"}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Automation Timeline */}
      <GlassCard style={{ marginTop: 20 }}>
        <SectionTitle title="Today's Automation Log" sub="Rule executions in the last 24 hours" />
        {[
          { time: "14:02", event: "Peak Hour Reduction triggered — AC load reduced by 15%", color: NEON_GREEN },
          { time: "13:34", event: "Idle Detection: Floor 1 lights powered off after 32-min idle", color: NEON_BLUE },
          { time: "11:18", event: "Load Balancing: CNC Machine #1 startup staggered by 45s", color: NEON_ORANGE },
          { time: "09:00", event: "Weekend Low-Power Mode deactivated — workday detected", color: "#ffd700" },
          { time: "07:30", event: "Morning Warm-up Schedule executed: pre-cooling initiated", color: NEON_PURPLE },
        ].map((log, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <span style={{ fontSize: 12, color: NEON_BLUE, fontFamily: "Orbitron, monospace", flexShrink: 0, minWidth: 50 }}>{log.time}</span>
            <div style={{ width: 2, background: log.color, borderRadius: 1, opacity: 0.5 }} />
            <span style={{ fontSize: 12, color: "#8a9aaa" }}>{log.event}</span>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────

function ReportsPage({ addToast }) {
  const [generating, setGenerating] = useState(null);

  const generate = (type) => {
    setGenerating(type);
    setTimeout(() => {
      setGenerating(null);
      addToast(`${type} report generated and ready for download!`, "success");
    }, 2000);
  };

  const reports = [
    { id: "energy", title: "Monthly Energy Report", desc: "Total consumption, peak hours, device-wise breakdown, cost analysis", icon: <Zap size={24} />, color: NEON_BLUE, size: "2.4 MB" },
    { id: "efficiency", title: "Efficiency Audit Report", desc: "Device efficiency scores, wastage analysis, improvement roadmap", icon: <Gauge size={24} />, color: NEON_GREEN, size: "1.8 MB" },
    { id: "carbon", title: "Carbon Footprint Report", desc: "CO₂ equivalent, sustainability metrics, reduction progress", icon: <Leaf size={24} />, color: "#00ffcc", size: "1.2 MB" },
    { id: "cost", title: "Cost Optimization Report", desc: "Billing analysis, tariff optimization, ROI on automation", icon: <DollarSign size={24} />, color: NEON_ORANGE, size: "3.1 MB" },
    { id: "ai", title: "AI Insights Report", desc: "All ML recommendations, prediction accuracy, applied optimizations", icon: <Cpu size={24} />, color: NEON_PURPLE, size: "1.6 MB" },
    { id: "compliance", title: "Regulatory Compliance Report", desc: "BEE, ECBC compliance checklist, audit trail, certifications", icon: <Shield size={24} />, color: "#ffd700", size: "0.9 MB" },
  ];

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      <SectionTitle title="Report Generation" sub="Professional energy reports for audits and presentations" />

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Reports Generated", value: "48", color: NEON_BLUE },
          { label: "Last Generated", value: "2h ago", color: NEON_GREEN },
          { label: "Data Period", value: "Jan–May 2025", color: NEON_ORANGE },
        ].map(s => (
          <GlassCard key={s.label} style={{ flex: 1, textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "Orbitron, monospace" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#5a6a7a", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {reports.map(r => (
          <GlassCard key={r.id} style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: `${r.color}15`, border: `1px solid ${r.color}40`, display: "flex", alignItems: "center", justifyContent: "center", color: r.color, flexShrink: 0 }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#d0d8e8", marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: "#6a7a8a", lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#4a5a6a", letterSpacing: 1 }}>EST. {r.size} · PDF + XLSX</span>
              <button onClick={() => generate(r.id)} disabled={generating === r.id}
                style={{ background: generating === r.id ? "rgba(0,180,255,0.08)" : `${r.color}15`, border: `1px solid ${r.color}40`, color: r.color, padding: "8px 16px", borderRadius: 7, cursor: "pointer", fontSize: 11, letterSpacing: 1, display: "flex", alignItems: "center", gap: 6, fontFamily: "Rajdhani, sans-serif" }}>
                {generating === r.id ? <><RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> GENERATING</> : <><Download size={13} /> GENERATE</>}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Recent Reports Table */}
      <GlassCard style={{ marginTop: 20 }}>
        <SectionTitle title="Recent Reports" sub="Previously generated reports" />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,180,255,0.15)" }}>
              {["Report Name", "Generated", "Period", "Size", "Download"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#5a6a7a", fontSize: 10, letterSpacing: 1, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Monthly Energy Report", date: "15 May 2025", period: "April 2025", size: "2.1 MB" },
              { name: "Efficiency Audit Report", date: "12 May 2025", period: "Q1 2025", size: "1.7 MB" },
              { name: "Carbon Footprint Report", date: "1 May 2025", period: "Jan–Apr 2025", size: "1.1 MB" },
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px 14px", color: "#c0c8d8" }}>{r.name}</td>
                <td style={{ padding: "12px 14px", color: "#6a7a8a" }}>{r.date}</td>
                <td style={{ padding: "12px 14px", color: "#6a7a8a" }}>{r.period}</td>
                <td style={{ padding: "12px 14px", color: "#6a7a8a" }}>{r.size}</td>
                <td style={{ padding: "12px 14px" }}>
                  <button onClick={() => addToast("Download started!", "success")}
                    style={{ background: "none", border: "none", color: NEON_BLUE, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                    <Download size={14} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────

function SettingsPage({ addToast }) {
  const [energyThreshold, setEnergyThreshold] = useState(18);
  const [tempAlert, setTempAlert] = useState(85);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const save = () => addToast("Settings saved successfully!", "success");

  return (
    <div style={{ animation: "fadeInUp 0.4s ease" }}>
      <SectionTitle title="System Settings" sub="Configure platform preferences and thresholds" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Energy Thresholds */}
        <GlassCard>
          <SectionTitle title="Energy Thresholds" sub="Alert trigger levels" />
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: "#8892a4", letterSpacing: 1, display: "block", marginBottom: 12 }}>
              MAX POWER THRESHOLD: <span style={{ color: NEON_GREEN }}>{energyThreshold} kW</span>
            </label>
            <input type="range" min={5} max={30} value={energyThreshold} onChange={e => setEnergyThreshold(+e.target.value)}
              style={{ width: "100%", accentColor: NEON_GREEN }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4a5a6a", marginTop: 4 }}>
              <span>5 kW</span><span>30 kW</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#8892a4", letterSpacing: 1, display: "block", marginBottom: 12 }}>
              TEMP ALERT: <span style={{ color: "#ffd700" }}>{tempAlert}°C</span>
            </label>
            <input type="range" min={60} max={100} value={tempAlert} onChange={e => setTempAlert(+e.target.value)}
              style={{ width: "100%", accentColor: "#ffd700" }} />
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard>
          <SectionTitle title="Notification Settings" sub="Alert delivery preferences" />
          {[
            { label: "Email Alerts", sub: "admin@energyops.in", state: notifEmail, set: setNotifEmail },
            { label: "SMS Alerts", sub: "+91 98XXXXXXXX", state: notifSms, set: setNotifSms },
            { label: "Dark Mode", sub: "Futuristic dark theme", state: darkMode, set: setDarkMode },
            { label: "Auto-save Reports", sub: "Save every 24 hours", state: autoSave, set: setAutoSave },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div>
                <div style={{ fontSize: 13, color: "#d0d8e8" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#5a6a7a" }}>{s.sub}</div>
              </div>
              <button onClick={() => s.set(!s.state)}
                style={{ background: "none", border: "none", cursor: "pointer", color: s.state ? NEON_GREEN : "#3a4a5a" }}>
                {s.state ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))}
        </GlassCard>

        {/* Device Management */}
        <GlassCard>
          <SectionTitle title="Device Registry" sub="Registered IoT endpoints" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { name: "Energy Meter Gateway", ip: "192.168.1.10", status: "online" },
              { name: "MQTT Broker (Local)", ip: "192.168.1.1:1883", status: "online" },
              { name: "Temperature Sensors (x6)", ip: "192.168.1.20-25", status: "online" },
              { name: "Current Transformers", ip: "192.168.1.30", status: "warning" },
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#c0c8d8" }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: "#4a5a6a", fontFamily: "monospace" }}>{d.ip}</div>
                </div>
                <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: d.status === "online" ? "rgba(0,255,136,0.1)" : "rgba(255,200,0,0.1)", color: d.status === "online" ? NEON_GREEN : "#ffd700", letterSpacing: 1 }}>
                  {d.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* System Info */}
        <GlassCard>
          <SectionTitle title="System Information" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Platform Version", value: "v2.4.1" },
              { label: "Database", value: "SQLite 3.44 — Local" },
              { label: "API Server", value: "Node.js v20 · Express 4" },
              { label: "Simulation Engine", value: "ACTIVE — 2s interval" },
              { label: "Last Backup", value: "Today, 06:00 AM" },
              { label: "Uptime", value: "14 days, 6 hrs" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "#6a7a8a" }}>{s.label}</span>
                <span style={{ color: NEON_BLUE, fontFamily: "monospace" }}>{s.value}</span>
              </div>
            ))}
          </div>
          <button onClick={save} style={{ marginTop: 20, width: "100%", background: "linear-gradient(135deg, #00ff88, #00b4ff)", border: "none", color: "#030912", padding: 12, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
            SAVE ALL SETTINGS
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
