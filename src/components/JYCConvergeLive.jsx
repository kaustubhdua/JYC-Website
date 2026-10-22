import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './jyc-converge-live.css';

const CONVERGE_STAGES = [
  { id: 'all', name: 'All Arenas' },
  { id: 'oat', name: 'Open Air Theatre (OAT)' },
  { id: 'audi', name: 'Main Auditorium' },
  { id: 'sac', name: 'SAC Activity Hub' },
  { id: 'grounds', name: 'Sports Complex & Arena' }
];

const SCHEDULE_ITEMS = [
  { id: 1, time: '10:00 AM', title: 'National Robowars Championship: Heavyweight Clash', venue: 'Sports Complex & Arena', stage: 'grounds', club: 'CICR', category: 'Technical', status: 'live', prize: '₹50,000' },
  { id: 2, time: '11:30 AM', title: 'Haute Couture Runway: Convergence in Style', venue: 'Open Air Theatre (OAT)', stage: 'oat', club: 'Panache', category: 'Cultural', status: 'live', prize: 'Trophies & Styling Kits' },
  { id: 3, time: '01:00 PM', title: 'HackConvergence 2027: 36-Hr Prototype Pitch', venue: 'SAC Activity Hub', stage: 'sac', club: 'JODC & Zencoders', category: 'Technical', status: 'upcoming', prize: '₹1,00,000' },
  { id: 4, time: '03:00 PM', title: 'Battle of the Bands: Rock & Acoustic Finals', venue: 'Open Air Theatre (OAT)', stage: 'oat', club: 'Fortissimo', category: 'Cultural', status: 'upcoming', prize: '₹40,000 + Studio Session' },
  { id: 5, time: '04:30 PM', title: 'Street Play Prelims: Nukkad Natak Social Showcase', venue: 'Open Air Theatre (OAT)', stage: 'oat', club: 'Abhivyakti', category: 'Cultural', status: 'upcoming', prize: '₹30,000' },
  { id: 6, time: '06:00 PM', title: 'Dron-O-War Quad Racing Under The Lights', venue: 'Sports Complex & Arena', stage: 'grounds', club: 'Dronotics', category: 'Technical', status: 'upcoming', prize: 'FPV Gear + ₹25,000' },
  { id: 7, time: '08:00 PM', title: 'Star Celebrity Concert & EDM Festival Night', venue: 'Main Auditorium', stage: 'audi', club: 'JYC Apex', category: 'Flagship', status: 'upcoming', prize: 'Campus Access Pass' }
];

export function JYCConvergeLive({ data }) {
  const nav = useNavigate();
  const [selectedStage, setSelectedStage] = useState('all');
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'leaderboard' | 'announcements'
  const [now, setNow] = useState(Date.now());

  // Converge target date
  const targetDate = new Date('2027-02-12T09:00:00').getTime();
  const diff = Math.max(0, targetDate - now);
  const cd = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const filteredSchedule = SCHEDULE_ITEMS.filter(item => 
    selectedStage === 'all' || item.stage === selectedStage
  );

  return (
    <section className="section page converge-live-page unified-public-page">
      {/* Fest Header Banner */}
      <div className="converge-live-hero reveal">
        <div className="converge-live-badge">
          <span className="live-pulsar-dot" />
          <span>CONVERGE 2027 · ANNUAL TECHNO-CULTURAL CONCLAVE</span>
        </div>
        <h1>
          Converge Live Arena.<br />
          <em className="title-gold-gradient">JIIT Sector 128 Annual Fest.</em>
        </h1>
        <p className="converge-lead">
          Real-time stage schedules, multi-arena programming, ongoing arena battles, and live campus announcements across Wish Town.
        </p>

        {/* Live Countdown */}
        <div className="converge-countdown-bar">
          <div className="converge-countdown-block">
            <b>{String(cd.days).padStart(2, '0')}</b>
            <span>DAYS</span>
          </div>
          <span className="cd-sep">:</span>
          <div className="converge-countdown-block">
            <b>{String(cd.hours).padStart(2, '0')}</b>
            <span>HOURS</span>
          </div>
          <span className="cd-sep">:</span>
          <div className="converge-countdown-block">
            <b>{String(cd.minutes).padStart(2, '0')}</b>
            <span>MINUTES</span>
          </div>
          <span className="cd-sep">:</span>
          <div className="converge-countdown-block">
            <b>{String(cd.seconds).padStart(2, '0')}</b>
            <span>SECONDS</span>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="converge-nav-pills reveal">
        <button
          type="button"
          className={`converge-pill ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          ⚡ Live Arena Schedule
        </button>
        <button
          type="button"
          className={`converge-pill ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Trophy Leaderboard
        </button>
        <button
          type="button"
          className={`converge-pill ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Flash Updates (Live)
        </button>
      </div>

      {activeTab === 'schedule' && (
        <>
          {/* Stage Filter Chips */}
          <div className="converge-stage-filter reveal">
            <span className="stage-filter-label">Filter Arena:</span>
            {CONVERGE_STAGES.map(s => (
              <button
                key={s.id}
                type="button"
                className={`stage-filter-btn ${selectedStage === s.id ? 'active' : ''}`}
                onClick={() => setSelectedStage(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Schedule Cards Grid */}
          <div className="converge-schedule-grid reveal">
            {filteredSchedule.map(item => (
              <article key={item.id} className="converge-event-card">
                <div className="event-card-top">
                  <span className={`status-tag ${item.status}`}>
                    {item.status === 'live' ? '● LIVE NOW' : 'UPCOMING'}
                  </span>
                  <span className="event-time">◷ {item.time}</span>
                </div>
                <h3>{item.title}</h3>
                <div className="event-meta-line">
                  <span>🏛️ {item.venue}</span>
                  <span>🛡️ {item.club}</span>
                </div>
                <div className="event-footer-action">
                  <span className="prize-badge">Prize: {item.prize}</span>
                  <button
                    type="button"
                    className="converge-action-btn"
                    onClick={() => nav('/events')}
                  >
                    Event Details ↗
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {activeTab === 'leaderboard' && (
        <div className="converge-leaderboard-board reveal">
          <div className="leaderboard-header">
            <h3>Inter-College Championship Standings · Converge 2027</h3>
            <p>Live points tally calculated across technical hackathons, cultural battles, and varsity sports.</p>
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-row head">
              <span>RANK</span>
              <span>INSTITUTE / CAMPUS</span>
              <span>EVENTS WON</span>
              <span>TOTAL POINTS</span>
            </div>
            <div className="leaderboard-row first">
              <span>🥇 01</span>
              <strong>JIIT Sector 128 (Host)</strong>
              <span>7 Golds · 4 Silvers</span>
              <b className="points-highlight">480 PTS</b>
            </div>
            <div className="leaderboard-row">
              <span>🥈 02</span>
              <strong>DTU Delhi</strong>
              <span>5 Golds · 3 Silvers</span>
              <b>395 PTS</b>
            </div>
            <div className="leaderboard-row">
              <span>🥉 03</span>
              <strong>NSUT Delhi</strong>
              <span>4 Golds · 4 Silvers</span>
              <b>340 PTS</b>
            </div>
            <div className="leaderboard-row">
              <span>04</span>
              <strong>IIT Delhi</strong>
              <span>3 Golds · 2 Silvers</span>
              <b>260 PTS</b>
            </div>
            <div className="leaderboard-row">
              <span>05</span>
              <strong>JIIT Sector 62</strong>
              <span>2 Golds · 5 Silvers</span>
              <b>230 PTS</b>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="converge-announcement-stream reveal">
          <article className="announcement-bulletin priority">
            <div className="bulletin-meta">
              <span className="bulletin-tag">URGENT DESK</span>
              <time>5 mins ago</time>
            </div>
            <h3>Robowars Arena Shift Due to Crowd Surge</h3>
            <p>The Heavyweight finals have been expanded to the Main Sports Arena to accommodate student viewing. Entry via Gate 3.</p>
          </article>

          <article className="announcement-bulletin">
            <div className="bulletin-meta">
              <span className="bulletin-tag">CULTURAL DESK</span>
              <time>35 mins ago</time>
            </div>
            <h3>Battle of the Bands Soundchecks Begin</h3>
            <p>All participating teams are requested to complete technical line checks at the OAT audio console by 02:00 PM.</p>
          </article>

          <article className="announcement-bulletin">
            <div className="bulletin-meta">
              <span className="bulletin-tag">REGISTRATION DESK</span>
              <time>1 hr ago</time>
            </div>
            <h3>Star Night Wristbands Distribution</h3>
            <p>Registered attendees can collect concert wristbands from the SAC helpdesk until 06:00 PM with student ID verification.</p>
          </article>
        </div>
      )}
    </section>
  );
}
