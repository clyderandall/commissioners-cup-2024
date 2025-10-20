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
    const interval = setInterval(fetchSheetData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getTeamName = (ccTeamId) => {
    const team = data.franchises.find(f => f.col8 === ccTeamId);
    return team ? team.col1 : 'Unknown';
  };

  const getTeamOwner = (ccTeamId) => {
    const team = data.franchises.find(f => f.col8 === ccTeamId);
    return team ? team.col3 : 'Unknown';
  };

  const Dashboard = () => {
    const currentWeek = 10; // From your config
    const phase = currentWeek < 9 ? 'Pre-Tournament' : currentWeek <= 13 ? 'Group Stage' : 'Elimination Bracket';
    
    const liveGames = data.liveScoring.filter(game => game.col3 > 0);
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Commissioner's Cup 2024</h1>
              <p className="text-xl opacity-90">Week {currentWeek} - {phase}</p>
            </div>
            <img src="https://iili.io/3wiyhl.png" alt="Commissioner's Cup" className="h-24 w-24 object-contain" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Teams</p>
                <p className="text-3xl font-bold text-gray-800">24</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Prize Pool</p>
                <p className="text-3xl font-bold text-green-600">$600</p>
              </div>
              <Trophy className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Current Phase</p>
                <p className="text-2xl font-bold text-purple-600">{phase}</p>
              </div>
              <Target className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        {liveGames.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Clock className="mr-2 text-red-500" />
              Live Scores
            </h2>
            <div className="space-y-3">
              {liveGames.map((game, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-semibold">{getTeamName(game.col6)}</p>
                    <p className="text-sm text-gray-500">{getTeamOwner(game.col6)}</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mx-4">
                    {game.col2?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{game.col4 || 0} yet to play</p>
                    <p>{game.col5 || 0} playing</p>
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Group Stage - Round Robin</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groupNames.map(groupName => {
            const standings = data.groupStandings.filter(s => s.col0 === groupName);
            
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
                            <td className="text-center py-2">{team.col4?.toFixed(1)}</td>
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Elimination Bracket</h1>
        
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {Object.entries(rounds).map(([roundName, matches]) => (
              <div key={roundName} className="flex-1 min-w-[250px]">
                <h3 className="text-xl font-bold mb-4 text-center text-purple-600">{roundName}</h3>
                <div className="space-y-6">
                  {matches.map((match, idx) => (
                    <div key={idx} className="border-2 border-gray-300 rounded-lg overflow-hidden">
                      <div className={`p-3 flex justify-between items-center ${match.col10 === match.col6 ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                        <span className="text-sm text-gray-600">{match.col4}</span>
                        <span>{getTeamName(match.col6)}</span>
                        <span className="font-bold">{match.col8?.toFixed(1) || '-'}</span>
                      </div>
                      <div className="border-t-2"></div>
                      <div className={`p-3 flex justify-between items-center ${match.col10 === match.col7 ? 'bg-green-100 font-bold' : 'bg-gray-50'}`}>
                        <span className="text-sm text-gray-600">{match.col5}</span>
                        <span>{getTeamName(match.col7)}</span>
                        <span className="font-bold">{match.col9?.toFixed(1) || '-'}</span>
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
                { id: 'groups', label: 'Groups', icon: Users },
                { id: 'bracket', label: 'Bracket', icon: Target },
                { id: 'teams', label: 'Teams', icon: Trophy }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition ${
                    activeTab === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
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
        {activeTab === 'groups' && <Groups />}
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
