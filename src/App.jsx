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
    return <div className="text-center text-gray-600">Standings coming soon...</div>;
  };

  const Matchups = () => {
    return <div className="text-center text-gray-600">Matchups coming soon...</div>;
  };

  const Bracket = () => {
    return <div className="text-center text-gray-600">Bracket coming soon...</div>;
  };

  const Teams = () => {
    return <div className="text-center text-gray-600">Teams coming soon...</div>;
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
