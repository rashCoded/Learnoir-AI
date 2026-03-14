// app/demo-preview/page.tsx
"use client";

import React from "react";

export default function DemoPreview() {
    const stats = { tasks: 12, streak: 5, score: 87, matches: 4 };

    return (
        <>
            <style jsx global>{`
        /* Override global styles for demo preview */
        body { 
          margin: 0 !important; 
          padding: 0 !important;
          background: #000 !important; 
          overflow: hidden !important;
        }
        nav, header, footer { display: none !important; }
      `}</style>

            <style jsx>{`
        .frame { 
          padding: 20px; 
          box-sizing: border-box; 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 50%, rgba(139,92,246,0.1) 100%);
          font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
        }
        .card { 
          width: 100%; 
          max-width: 1050px; 
          border-radius: 16px; 
          background: rgba(15,15,20,0.95); 
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05); 
          padding: 24px; 
          backdrop-filter: blur(20px); 
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 20px; 
          padding-bottom: 16px; 
          border-bottom: 1px solid rgba(255,255,255,0.05); 
        }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-circle { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); }
        .logo-text { font-size: 18px; font-weight: 700; color: #fff; }
        .badge { padding: 4px 10px; border-radius: 20px; background: rgba(99,102,241,0.2); color: #a5b4fc; font-size: 11px; font-weight: 600; }
        .row { display: flex; gap: 16px; }
        .sidebar { width: 220px; flex-shrink: 0; }
        .nav-item { 
          padding: 10px 14px; 
          border-radius: 8px; 
          margin-bottom: 6px; 
          font-size: 13px; 
          color: #9ca3af; 
          cursor: pointer; 
          transition: all 0.2s; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .nav-item.active { 
          background: linear-gradient(90deg, rgba(99,102,241,0.2), transparent); 
          color: #a5b4fc; 
          border-left: 2px solid #6366f1; 
        }
        .nav-icon { width: 16px; height: 16px; opacity: 0.7; }
        .main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .stats-row { display: flex; gap: 12px; }
        .stat-card { 
          flex: 1; 
          background: rgba(255,255,255,0.03); 
          border: 1px solid rgba(255,255,255,0.05); 
          border-radius: 12px; 
          padding: 16px; 
        }
        .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .stat-value { 
          font-size: 28px; 
          font-weight: 700; 
          background: linear-gradient(90deg, #fff, #a5b4fc); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-sub { font-size: 11px; color: #4ade80; margin-top: 4px; }
        .panel { 
          background: rgba(255,255,255,0.02); 
          border: 1px solid rgba(255,255,255,0.05); 
          border-radius: 12px; 
          padding: 18px; 
          flex: 1; 
        }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .panel-title { font-size: 14px; font-weight: 600; color: #fff; }
        .panel-action { font-size: 11px; color: #6366f1; cursor: pointer; }
        .activity-item { padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 8px; }
        .activity-title { font-size: 13px; font-weight: 500; color: #fff; margin-bottom: 4px; }
        .activity-meta { font-size: 11px; color: #6b7280; }
        .activity-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; margin-left: 8px; }
        .tag-green { background: rgba(74,222,128,0.15); color: #4ade80; }
        .tag-blue { background: rgba(96,165,250,0.15); color: #60a5fa; }
        .tag-purple { background: rgba(167,139,250,0.15); color: #a78bfa; }
        .roadmap-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .roadmap-week { width: 60px; font-size: 11px; color: #6b7280; }
        .roadmap-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .roadmap-progress { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 3px; }
        .roadmap-percent { width: 40px; text-align: right; font-size: 12px; color: #a5b4fc; }
        .cta-btn { 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
          padding: 10px 20px; 
          border-radius: 10px; 
          background: linear-gradient(90deg, #6366f1, #8b5cf6); 
          color: #fff; 
          font-size: 13px; 
          font-weight: 600; 
          border: none; 
          cursor: pointer; 
          transition: transform 0.2s, box-shadow 0.2s; 
        }
        .cta-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
        
        @media (max-width: 768px) {
          .row { flex-direction: column; }
          .sidebar { width: 100%; }
          .stats-row { flex-wrap: wrap; }
          .stat-card { min-width: calc(50% - 6px); }
        }
      `}</style>

            <div className="frame">
                <div className="card" role="region" aria-label="Learnoir interactive demo">

                    <div className="header">
                        <div className="logo">
                            <div className="logo-circle"></div>
                            <span className="logo-text">Learnoir</span>
                            <span className="badge">Live Demo</span>
                        </div>
                        <button className="cta-btn">
                            Get Started Free
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="row">
                        <div className="sidebar">
                            <div className="nav-item active">
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                                Dashboard
                            </div>
                            <div className="nav-item">
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Resume Analysis
                            </div>
                            <div className="nav-item">
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                Learning Roadmap
                            </div>
                            <div className="nav-item">
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Recruiter Sim
                            </div>
                            <div className="nav-item">
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                Project Builder
                            </div>
                            <div className="nav-item">
                                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                Job Matching
                            </div>
                        </div>

                        <div className="main">
                            <div className="stats-row">
                                <div className="stat-card">
                                    <div className="stat-label">Tasks Completed</div>
                                    <div className="stat-value">{stats.tasks}</div>
                                    <div className="stat-sub">+3 this week</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Learning Streak</div>
                                    <div className="stat-value">{stats.streak}d</div>
                                    <div className="stat-sub">Keep it up!</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Skill Score</div>
                                    <div className="stat-value">{stats.score}%</div>
                                    <div className="stat-sub">+12% improvement</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Role Matches</div>
                                    <div className="stat-value">{stats.matches}</div>
                                    <div className="stat-sub">High compatibility</div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="panel">
                                    <div className="panel-header">
                                        <span className="panel-title">Weekly Progress</span>
                                        <span className="panel-action">View All</span>
                                    </div>
                                    <div className="roadmap-item">
                                        <span className="roadmap-week">Week 1</span>
                                        <div className="roadmap-bar"><div className="roadmap-progress" style={{ width: '100%' }}></div></div>
                                        <span className="roadmap-percent">100%</span>
                                    </div>
                                    <div className="roadmap-item">
                                        <span className="roadmap-week">Week 2</span>
                                        <div className="roadmap-bar"><div className="roadmap-progress" style={{ width: '100%' }}></div></div>
                                        <span className="roadmap-percent">100%</span>
                                    </div>
                                    <div className="roadmap-item">
                                        <span className="roadmap-week">Week 3</span>
                                        <div className="roadmap-bar"><div className="roadmap-progress" style={{ width: '65%' }}></div></div>
                                        <span className="roadmap-percent">65%</span>
                                    </div>
                                    <div className="roadmap-item" style={{ borderBottom: 'none' }}>
                                        <span className="roadmap-week">Week 4</span>
                                        <div className="roadmap-bar"><div className="roadmap-progress" style={{ width: '0%' }}></div></div>
                                        <span className="roadmap-percent">0%</span>
                                    </div>
                                </div>

                                <div className="panel">
                                    <div className="panel-header">
                                        <span className="panel-title">Recent Activity</span>
                                        <span className="panel-action">See More</span>
                                    </div>
                                    <div className="activity-item">
                                        <div className="activity-title">Completed System Design Quiz<span className="activity-tag tag-green">+15 XP</span></div>
                                        <div className="activity-meta">2 hours ago</div>
                                    </div>
                                    <div className="activity-item">
                                        <div className="activity-title">Built REST API Project<span className="activity-tag tag-blue">Backend</span></div>
                                        <div className="activity-meta">Yesterday</div>
                                    </div>
                                    <div className="activity-item">
                                        <div className="activity-title">Resume analyzed by AI<span className="activity-tag tag-purple">87% ATS</span></div>
                                        <div className="activity-meta">2 days ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
