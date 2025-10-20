import React, { useState, useEffect } from 'react';
import { Trophy, Users, Target, BarChart3, RefreshCw, Clock } from 'lucide-react';

const SHEET_ID = '1ucF98nx4O5Pq50JtOwM-HC4npoFtJS9YMR4Oclbb0dw';

const CommissionersCup = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    franchises: [],
    groups: [],
    groupMatchups: [],
    groupStandings: [],
    bracketMatchups: [],
    liveScoring: [],
    allPlayTiers: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSheetData = async () => {
    try {
      const sheets = ['franchises', 'groups', 'group matchups', 'group standings', 'bracket matchups', 'live scoring', 'all play tiers'];
      const promises = sheets.map(sheet => 
        fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}`)
          .then(res => res.text())
          .then(text => {
            const json = JSON.parse(text.substr(47).slice(0, -2));
            return { sheet, data: json.table.rows };
          })
      );

      const results = await Promise.all(promises);
      const newData = {};
      
      results.forEach(({ sheet, data: rows }) => {
        const key = sheet.replace(/ /g, '');
        newData[key] = rows.map(row => {
          const obj = {};
          row.c.forEach((cell, i) => {
            obj[`col${i}`] = cell ? cell.v : null;
          });
          return obj;
        });
      });

      setData({
        franchises: newData.franchises || [],
        groups: newData.groups || [],
        groupMatchups: newData.groupmatchups || [],
        groupStandings: newData.groupstandings || [],
        bracketMatchups: newData.bracketmatchups || [],
        liveScoring: newData.livescoring || [],
        allPlayTiers: newData.allplaytiers || []
      });
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
    const interval = setInterval(fetchSheetData, 300000);
    return () => clearInterval(interval);
  }, []);

  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  };

  const formatScore = (val) => {
    return toNumber(val).toFixed(2);
  };

  const getTeamName = (ccTeamId) => {
    const team = data.franchises.find(f => f.col8 === ccTeamId);
    return team ? team.col1 : 'Unknown';
  };

  const getTeamOwner = (ccTeamId) => {
    const team = data.franchises.find(f => f.col8 === ccTeamId);
    return team ? team.col3 : 'Unknown';
  };

  const Dashboard = () => {
    const currentWeek = 10;
    const phase = currentWeek < 9 ? 'Pre-Tournament' : currentWeek <= 13 ? 'Group Stage' : 'Elimination Bracket';
    
    const liveGames = data.liveScoring.filter(game => toNumber(game.col2) > 0);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ 
          background: 'linear-gradient(to right, #2563eb, #9333ea)', 
          borderRadius: '8px', 
          padding: '32px', 
          color: 'white' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>Commissioner's Cup 2024</h1>
              <p style={{ fontSize: '20px', opacity: 0.9 }}>Week {currentWeek} - {phase}</p>
            </div>
            <img src="https://iili.io/3wiyhl.png" alt="Commissioner's Cup" style={{ height: '96px', width: '96px', objectFit: 'contain' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Total Teams</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937' }}>24</p>
              </div>
              <Users size={48} color="#3b82f6" />
            </div>
          </div>
          
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Prize Pool</p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#16a34a' }}>$600</p>
              </div>
              <Trophy size={48} color="#eab308" />
            </div>
          </div>
          
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>Current Phase</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#9333ea' }}>{phase}</p>
              </div>
              <Target size={48} color="#a855f7" />
            </div>
          </div>
        </div>

        {liveGames.length > 0 && (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
              <Clock size={24} color="#ef4444" style={{ marginRight: '8px' }} />
              Live Scores
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {liveGames.map((game, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9fafb', borderRadius: '4px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{getTeamName(game.col6)}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{getTeamOwner(game.col6)}</p>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', margin: '0 16px' }}>
                    {formatScore(game.col2)}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '14px', color: '#6b7280' }}>
                    <p>{toNumber(game.col4)} yet to play</p>
                    <p>{toNumber(game.col5)} playing</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const Groups = () => {
    const groupNames = ['A', 'B', 'C', 'D'];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '24px' }}>Group Stage - Round Robin</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {groupNames.map(groupName => {
            const standings = data.groupStandings.filter(s => s.col0 === groupName);
            
            return (
              <div key={groupName} style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(to right, #3b82f6, #a855f7)', padding: '16px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Group {groupName}</h2>
                </div>
                <div style={{ padding: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Rank</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Team</th>
                        <th style={{ textAlign: 'center', padding: '8px' }}>W</th>
                        <th style={{ textAlign: 'center', padding: '8px' }}>L</th>
                        <th style={{ textAlign: 'center', padding: '8px' }}>PF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, idx) => {
                        const qualifying = idx < 4;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: qualifying ? '#f0fdf4' : 'white' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{team.col6}</td>
                            <td style={{ padding: '8px' }}>
                              <p style={{ fontWeight: 600 }}>{getTeamName(team.col1)}</p>
                              <p style={{ fontSize: '12px', color: '#6b7280' }}>{getTeamOwner(team.col1)}</p>
                            </td>
                            <td style={{ textAlign: 'center', padding: '8px' }}>{toNumber(team.col2)}</td>
                            <td style={{ textAlign: 'center', padding: '8px' }}>{toNumber(team.col3)}</td>
                            <td style={{ textAlign: 'center', padding: '8px' }}>{formatScore(team.col4)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Bracket = () => {
    const rounds = {
      'Sweet 16': data.bracketMatchups.filter(m => m.col0 === 'Sweet 16'),
      'Elite 8': data.bracketMatchups.filter(m => m.col0 === 'Elite 8'),
      'Final 4': data.bracketMatchups.filter(m => m.col0 === 'Final 4'),
      'Championship': data.bracketMatchups.filter(m => m.col0 === 'Championship')
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '24px' }}>Elimination Bracket</h1>
        
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '32px', minWidth: 'max-content' }}>
            {Object.entries(rounds).map(([roundName, matches]) => (
              <div key={roundName} style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', color: '#9333ea' }}>{roundName}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {matches.map((match, idx) => (
                    <div key={idx} style={{ border: '2px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ 
                        padding: '12px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: match.col10 === match.col6 ? '#dcfce7' : '#f9fafb',
                        fontWeight: match.col10 === match.col6 ? 'bold' : 'normal'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{match.col4}</span>
                        <span>{getTeamName(match.col6)}</span>
                        <span style={{ fontWeight: 'bold' }}>{match.col8 ? formatScore(match.col8) : '-'}</span>
                      </div>
                      <div style={{ borderTop: '2px solid #d1d5db' }}></div>
                      <div style={{ 
                        padding: '12px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: match.col10 === match.col7 ? '#dcfce7' : '#f9fafb',
                        fontWeight: match.col10 === match.col7 ? 'bold' : 'normal'
                      }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>{match.col5}</span>
                        <span>{getTeamName(match.col7)}</span>
                        <span style={{ fontWeight: 'bold' }}>{match.col9 ? formatScore(match.col9) : '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Teams = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '24px' }}>All Teams</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {data.franchises.map((team, idx) => (
            <div key={idx} style={{ 
              background: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
              padding: '16px',
              transition: 'box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '18px' }}>{team.col1}</h3>
                  <p style={{ color: '#6b7280' }}>{team.col3}</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>{team.col7}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={48} color="#2563eb" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '20px', color: '#6b7280' }}>Loading Commissioner's Cup data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <nav style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="https://iili.io/3wiyhl.png" alt="Logo" style={{ height: '48px', width: '48px' }} />
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>Commissioner's Cup 2024</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'groups', label: 'Groups', icon: Users },
                { id: 'bracket', label: 'Bracket', icon: Target },
                { id: 'teams', label: 'Teams', icon: Trophy }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === id ? '#2563eb' : 'transparent',
                    color: activeTab === id ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== id) e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={16} />
                  <span style={{ display: window.innerWidth < 768 ? 'none' : 'inline' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'groups' && <Groups />}
        {activeTab === 'bracket' && <Bracket />}
        {activeTab === 'teams' && <Teams />}
        
        {lastUpdate && (
          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </main>
    </div>
  );
};

export default CommissionersCup;
