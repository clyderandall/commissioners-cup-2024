import React, { useState, useEffect } from 'react';
import { Trophy, Users, Target, BarChart3, RefreshCw, Clock, Calendar, Award, BookOpen } from 'lucide-react';

const SHEET_ID = '1ucF98nx4O5Pq50JtOwM-HC4npoFtJS9YMR4Oclbb0dw';

const CommissionersCup = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    franchises: [],
    groupMatchups: [],
    groupStandings: [],
    bracketMatchups: [],
    liveScoring: [],
    config: [],
    history: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSheetData = async () => {
    try {
      const sheets = ['franchises', 'group matchups', 'group standings', 'bracket matchups', 'live scoring', 'Config', 'cc history'];
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
        config: newData.config || [],
        history: newData.cchistory || []
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

  const getTeamLogo = (ccTeamId) => {
    const team = data.franchises.find(f => f.col8 === ccTeamId);
    return team ? team.col6 : null;
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="https://iili.io/3wiyhl.png" alt="Logo" className="h-8 w-8 sm:h-12 sm:w-12" />
              <span className="text-sm sm:text-xl font-bold text-gray-800">CC 2024</span>
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'standings', label: 'Standings', icon: Award },
                { id: 'matchups', label: 'Matchups', icon: Calendar },
                { id: 'bracket', label: 'Bracket', icon: Target },
                { id: 'teams', label: 'Teams', icon: Users },
                { id: 'history', label: 'History', icon: Trophy },
                { id: 'rules', label: 'Rules', icon: BookOpen }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`p-2 rounded-lg transition ${
                    activeTab === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Active: {activeTab}</h1>
          <p className="text-sm text-gray-500">
            Navigation updated with unique icons and mobile-responsive design
          </p>
        </div>
        
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
