import React, { useState, useEffect } from 'react';
import { Trophy, Users, Target, BarChart3, RefreshCw, Clock } from 'lucide-react';

const SHEET_ID = '1ucF98nx4O5Pq50JtOwM-HC4npoFtJS9YMR4Oclbb0dw';

const CommissionersCup = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    franchises: [],
    groupMatchups: [],
    groupStandings: [],
    bracketMatchups: [],
    liveScoring: [],
    config: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSheetData = async () => {
    try {
      const sheets = ['franchises', 'group matchups', 'group standings', 'bracket matchups', 'live scoring', 'Config'];
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
        const key = sheet.replace(/ /g, '').toLowerCase();
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
        groupMatchups: newData.groupmatchups || [],
        groupStandings: newData.groupstandings || [],
        bracketMatchups: newData.bracketmatchups || [],
        liveScoring: newData.livescoring || [],
        config: newData.config || []
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
    const interval = setInterval(fetchSheetData, 60000);
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
    const configRow = data.config.find(row => row.col0 === 'Current NFL Week');
    const currentNFLWeek = configRow ? toNumber(configRow.col1) : 10;
    const currentGPWeek = currentNFLWeek >= 9 && currentNFLWeek <= 13 ? currentNFLWeek - 8 : null;
    
    let phase = 'Pre-Tournament';
    let phaseDetail = 'Awaiting Start';
    
    if (currentNFLWeek >= 9 && currentNFLWeek <= 13) {
      phase = 'Group Stage';
      phaseDetail = `Week ${currentGPWeek} of 5`;
    } else if (currentNFLWeek === 14) {
      phase = 'Sweet 16';
      phaseDetail = 'Round 1';
    } else if (currentNFLWeek === 15) {
      phase = 'Elite 8';
      phaseDetail = 'Quarterfinals';
    } else if (currentNFLWeek === 16) {
      phase = 'Final 4';
      phaseDetail = 'Semifinals';
    } else if (currentNFLWeek === 17) {
      phase = 'Championship';
      phaseDetail = 'Final';
    } else if (currentNFLWeek > 17) {
      phase = 'Complete';
      phaseDetail = 'Season Ended';
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Commissioner's Cup 2024</h1>
              <p className="text-xl opacity-90">NFL Week {currentNFLWeek}</p>
            </div>
            <img src="https://iili.io/3wiyhl.png" alt="CC Logo" className="h-24 w-24 object-contain" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Current Phase</p>
                <p className="text-2xl font-bold text-purple-600">{phase}</p>
                <p className="text-sm text-gray-600">{phaseDetail}</p>
              </div>
              <Target className="h-12 w-12 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Teams Remaining</p>
                <p className="text-3xl font-bold text-blue-600">24</p>
                <p className="text-sm text-gray-600">of 24 total</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Matchups Complete</p>
                <p className="text-3xl font-bold text-green-600">0/12</p>
                <p className="text-sm text-gray-600">this week</p>
              </div>
              <BarChart3 className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Prize Pool</p>
                <p className="text-3xl font-bold text-green-600">$600</p>
                <p className="text-sm text-gray-600">24 x $25</p>
              </div>
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Standings = () => {
    const groupNames = ['A', 'B', 'C', 'D'];
    
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Group Standings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groupNames.map(groupName => {
            const standings = data.groupStandings
              .filter(s => s.col0 === groupName && s.col1 !== null)
              .sort((a, b) => toNumber(a.col6) - toNumber(b.col6));
            
            return (
              <div key={groupName} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <h2 className="text-2xl font-bold text-white">Group {groupName}</h2>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Rank</th>
                        <th className="text-left py-2">Team</th>
                        <th className="text-center py-2">W</th>
                        <th className="text-center py-2">L</th>
                        <th className="text-center py-2">PF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, idx) => {
                        const qualifying = idx < 4;
                        return (
                          <tr key={idx} className={`border-b ${qualifying ? 'bg-green-50' : ''}`}>
                            <td className="py-2 px-2 font-bold">{team.col6}</td>
                            <td className="py-2">
                              <p className="font-semibold">{getTeamName(team.col1)}</p>
                              <p className="text-xs text-gray-500">{getTeamOwner(team.col1)}</p>
                            </td>
                            <td className="text-center py-2">{team.col2}</td>
                            <td className="text-center py-2">{team.col3}</td>
                            <td className="text-center py-2">{formatScore(team.col4)}</td>
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

  const Matchups = () => {
    const gpWeeks = [1, 2, 3, 4, 5];
    const configRow = data.config.find(row => row.col0 === 'Current NFL Week');
    const currentNFLWeek = configRow ? toNumber(configRow.col1) : 10;
    const currentGPWeek = currentNFLWeek >= 9 && currentNFLWeek <= 13 ? currentNFLWeek - 8 : null;
    
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Group Matchups</h1>
        
        {gpWeeks.map(gpWeek => {
          const weekMatchups = data.groupMatchups.filter(m => toNumber(m.col0) === gpWeek);
          if (weekMatchups.length === 0) return null;
          
          const matchupsByGroup = {};
          weekMatchups.forEach(matchup => {
            const group = matchup.col2;
            if (!matchupsByGroup[group]) matchupsByGroup[group] = [];
            matchupsByGroup[group].push(matchup);
          });
          
          const isCurrentWeek = gpWeek === currentGPWeek;
          
          return (
            <div key={gpWeek} className={`bg-white rounded-lg shadow p-6 ${isCurrentWeek ? 'border-4 border-blue-600' : ''}`}>
              <h3 className={`text-xl font-bold mb-4 ${isCurrentWeek ? 'text-blue-600' : 'text-gray-800'}`}>
                Group Play Week {gpWeek} {isCurrentWeek && '(Current Week)'}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  NFL Week {gpWeek + 8}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(matchupsByGroup).sort().map(([group, matchups]) => (
                  <div key={group} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b-2 border-gray-200">
                      <h4 className="text-base font-bold text-center">Group {group}</h4>
                    </div>
                    <div className="p-3">
                      {matchups.map((matchup, idx) => {
                        const homeTeam = getTeamName(matchup.col6);
                        const awayTeam = getTeamName(matchup.col7);
                        const homeScore = toNumber(matchup.col8);
                        const awayScore = toNumber(matchup.col9);
                        const hasScores = homeScore > 0 || awayScore > 0;
                        const winner = matchup.col10;
                        
                        return (
                          <div key={idx} className={idx < matchups.length - 1 ? "mb-3" : ""}>
                            <div className={`flex justify-between items-center p-2 rounded-t ${winner === matchup.col6 ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                              <span className="text-xs text-gray-600 mr-2">{matchup.col3}</span>
                              <span className="text-sm flex-1">{homeTeam}</span>
                              <span className="text-lg font-bold">
                                {hasScores ? formatScore(homeScore) : '-'}
                              </span>
                            </div>
                            <div className={`flex justify-between items-center p-2 rounded-b border-t ${winner === matchup.col7 ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                              <span className="text-xs text-gray-600 mr-2">{matchup.col4}</span>
                              <span className="text-sm flex-1">{awayTeam}</span>
                              <span className="text-lg font-bold">
                                {hasScores ? formatScore(awayScore) : '-'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const Bracket = () => {
    const rounds = {
      'Sweet 16': data.bracketMatchups.filter(m => toNumber(m.col0) === 1),
      'Elite 8': data.bracketMatchups.filter(m => toNumber(m.col0) === 2),
      'Final 4': data.bracketMatchups.filter(m => toNumber(m.col0) === 3),
      'Championship': data.bracketMatchups.filter(m => toNumber(m.col0) === 4)
    };

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Elimination Bracket</h1>
        
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <div className="flex gap-8" style={{ minWidth: 'max-content' }}>
            {Object.entries(rounds).map(([roundName, matches]) => {
              if (matches.length === 0) return null;
              return (
                <div key={roundName} className="flex-1" style={{ minWidth: '250px' }}>
                  <h3 className="text-xl font-bold mb-4 text-center text-purple-600">{roundName}</h3>
                  <div className="space-y-6">
                    {matches.map((match, idx) => (
                      <div key={idx} className="border-2 border-gray-300 rounded-lg overflow-hidden">
                        <div className={`p-3 flex justify-between items-center ${match.col10 === match.col6 ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                          <span className="text-sm text-gray-600">{match.col4}</span>
                          <span className="flex-1 mx-2">{getTeamName(match.col6)}</span>
                          <span className="font-bold">{match.col8 ? formatScore(match.col8) : '-'}</span>
                        </div>
                        <div className="border-t-2"></div>
                        <div className={`p-3 flex justify-between items-center ${match.col10 === match.col7 ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                          <span className="text-sm text-gray-600">{match.col5}</span>
                          <span className="flex-1 mx-2">{getTeamName(match.col7)}</span>
                          <span className="font-bold">{match.col9 ? formatScore(match.col9) : '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const Teams = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">All Teams</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.franchises.map((team, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{team.col1}</h3>
                  <p className="text-gray-600">{team.col3}</p>
                  <p className="text-sm text-gray-500">{team.col7}</p>
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading Commissioner's Cup data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="https://iili.io/3wiyhl.png" alt="Logo" className="h-12 w-12" />
              <span className="text-xl font-bold text-gray-800">Commissioner's Cup 2024</span>
            </div>
            <div className="flex space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'standings', label: 'Standings', icon: Trophy },
                { id: 'matchups', label: 'Matchups', icon: Users },
                { id: 'bracket', label: 'Bracket', icon: Target },
                { id: 'teams', label: 'Teams', icon: Users }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                    activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'standings' && <Standings />}
        {activeTab === 'matchups' && <Matchups />}
        {activeTab === 'bracket' && <Bracket />}
        {activeTab === 'teams' && <Teams />}
        
        {lastUpdate && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </main>
    </div>
  );
};

export default CommissionersCup;
