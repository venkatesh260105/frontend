import React, { useState, useEffect } from 'react';
import {
  getGatewayDatabase,
  saveGatewayDatabase,
  downloadGatewayJSON,
  recordGatewayActivity,
  syncWithDiskStorage
} from '../../utils/storage';
import {
  getRateLimitStatus,
  checkAndConsumeRateLimit,
  resetRateLimit,
  generateJWT,
  verifyJWT,
  gatewayRequest,
  runGatewayTestSuites,
  subscribeToRateLimit
} from '../../utils/gatewayEngine';

export function GatewayDashboard({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('monitor'); // monitor, db, jwt, tests
  const [activeDbTable, setActiveDbTable] = useState('users');
  const [dbData, setDbData] = useState(() => getGatewayDatabase());
  const [rateStatus, setRateStatus] = useState(() => getRateLimitStatus());
  const [testResults, setTestResults] = useState([]);
  const [testingRunning, setTestingRunning] = useState(false);
  const [simulatedEndpoint, setSimulatedEndpoint] = useState('/api/products');
  const [simulatedMethod, setSimulatedMethod] = useState('GET');
  const [simulatedAuthMode, setSimulatedAuthMode] = useState('valid');
  const [simulationResponse, setSimulationResponse] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [jwtInput, setJwtInput] = useState('');
  const [jwtDecodeResult, setJwtDecodeResult] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Subscribe to live rate limiting updates
  useEffect(() => {
    const unsubscribe = subscribeToRateLimit((newStatus) => {
      setRateStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  // Refresh DB data periodically when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setDbData(getGatewayDatabase());
      setRateStatus(getRateLimitStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Stats calculations
  const totalRequests = dbData.requests?.length || 0;
  const recentLogs = dbData.logs || [];
  const avgLatency = recentLogs.length > 0
    ? Math.round(recentLogs.reduce((s, l) => s + (l.response_time_ms || 15), 0) / recentLogs.length)
    : 18;
  const activeTokensCount = dbData.tokens?.length || 0;
  const registeredUsersCount = dbData.users?.length || 0;

  // Handle Burst Test (Simulate traffic spike & 429)
  const handleBurstTest = async () => {
    setBursting(true);
    setSimulationResponse(null);
    let blockedCount = 0;
    let allowedCount = 0;

    for (let i = 0; i < 45; i++) {
      const res = checkAndConsumeRateLimit();
      if (res.allowed) allowedCount++;
      else blockedCount++;
    }

    // Refresh rate status & DB
    setRateStatus(getRateLimitStatus());
    recordGatewayActivity({
      user_id: 'burst_tester',
      api_id: 'api_01',
      endpoint: '/api/burst-test',
      status: blockedCount > 0 ? '429 Too Many Requests' : '200 OK',
      response_time_ms: 8,
      details: `Burst Traffic Test completed: ${allowedCount} allowed, ${blockedCount} blocked (HTTP 429)`
    });
    setDbData(getGatewayDatabase());
    setBursting(false);
  };

  // Handle Live Simulated Request
  const handleSendSimulatedRequest = async () => {
    setSimulating(true);
    setSimulationResponse(null);

    let token = '';
    if (simulatedAuthMode === 'valid') {
      token = generateJWT({ sub: 'usr_demo', name: 'Demo Client', role: 'USER' });
    } else if (simulatedAuthMode === 'invalid') {
      token = 'invalid.bearer.token';
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const start = performance.now();
      const res = await gatewayRequest(simulatedEndpoint, {
        method: simulatedMethod,
        headers,
        requireAuth: simulatedAuthMode !== 'none',
        apiId: 'api_sim'
      });
      const latency = Math.round(performance.now() - start);

      setSimulationResponse({
        status: 200,
        statusText: '200 OK',
        latency,
        rateRemaining: rateStatus.remaining,
        data: res
      });
    } catch (err) {
      setSimulationResponse({
        status: err.message.includes('429') ? 429 : err.message.includes('401') ? 401 : 500,
        statusText: err.message,
        latency: 12,
        rateRemaining: rateStatus.remaining,
        error: err.message
      });
    } finally {
      setSimulating(false);
      setDbData(getGatewayDatabase());
      setRateStatus(getRateLimitStatus());
    }
  };

  // Run Test Suites
  const handleRunTests = async () => {
    setTestingRunning(true);
    setTestResults([]);
    const results = await runGatewayTestSuites();
    setTestResults(results);
    setTestingRunning(false);
    setDbData(getGatewayDatabase());
  };

  // Decode JWT Tool
  const handleDecodeJWT = (token) => {
    setJwtInput(token);
    if (!token.trim()) {
      setJwtDecodeResult(null);
      return;
    }
    const result = verifyJWT(token.trim());
    setJwtDecodeResult(result);
  };

  // Filter items in active table
  const currentTableList = (dbData[activeDbTable] || []).filter(row => {
    if (!tableSearch.trim()) return true;
    return JSON.stringify(row).toLowerCase().includes(tableSearch.toLowerCase());
  });

  return (
    <div className="gatewayModalOverlay" onClick={onClose}>
      <div className="gatewayModalContent" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="gwHeader">
          <div className="gwTitleGroup">
            <div className="gwBadgeIcon">🛡️</div>
            <div>
              <div className="gwTitleRow">
                <h2>API Gateway Console & Monitor</h2>
                <span className="gwStatusPill online">
                  <span className="pulseDot"></span> Online (HTTP 200)
                </span>
                <span className="gwJsonPill">💾 JSON DB (3NF Schema)</span>
              </div>
              <p className="gwSubtitle">
                Centralized Single Entry Point • JWT Token Auth • Sliding Window Rate Limiter • Request Routing
              </p>
            </div>
          </div>
          <div className="gwHeaderActions">
            <button className="gwBtn secondary" onClick={() => syncWithDiskStorage()} title="Sync to src/storage.json">
              🔄 Sync Disk
            </button>
            <button className="gwBtn secondary" onClick={downloadGatewayJSON} title="Download Full JSON Database">
              📥 Export JSON
            </button>
            <button className="gwCloseBtn" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        {/* Live Metrics Summary Bar */}
        <div className="gwMetricsGrid">
          <div className="gwMetricCard">
            <div className="metricLabel">Rate Limit Status</div>
            <div className="metricValue" style={{ color: rateStatus.allowed ? '#10b981' : '#ef4444' }}>
              {rateStatus.currentCount} / {rateStatus.maxAllowed}
            </div>
            <div className="metricSub">
              {rateStatus.allowed ? `Remaining: ${rateStatus.remaining} req` : `⛔ Throttled (Reset in ${rateStatus.resetInSec}s)`}
            </div>
          </div>

          <div className="gwMetricCard">
            <div className="metricLabel">Total Requests Logged</div>
            <div className="metricValue">{totalRequests}</div>
            <div className="metricSub">Stored in Requests & Logs Tables</div>
          </div>

          <div className="gwMetricCard">
            <div className="metricLabel">Average Latency</div>
            <div className="metricValue" style={{ color: '#3b82f6' }}>{avgLatency} ms</div>
            <div className="metricSub">Target: &lt; 55ms (PDF Spec)</div>
          </div>

          <div className="gwMetricCard">
            <div className="metricLabel">Security & Users</div>
            <div className="metricValue" style={{ color: '#8b5cf6' }}>{registeredUsersCount} Users</div>
            <div className="metricSub">{activeTokensCount} Active JWT Tokens</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="gwTabsBar">
          <button
            className={`gwTabItem ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            📊 Live Monitor & Request Router
          </button>
          <button
            className={`gwTabItem ${activeTab === 'db' ? 'active' : ''}`}
            onClick={() => setActiveTab('db')}
          >
            🗄️ 6 Database Tables (JSON)
          </button>
          <button
            className={`gwTabItem ${activeTab === 'jwt' ? 'active' : ''}`}
            onClick={() => setActiveTab('jwt')}
          >
            🔐 JWT Token & Security Lab
          </button>
          <button
            className={`gwTabItem ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            🧪 Test Runner (UT01–UT05 & ST01–ST05)
          </button>
        </div>

        {/* Tab Body */}
        <div className="gwTabBody">
          {/* TAB 1: LIVE MONITOR & ROUTER */}
          {activeTab === 'monitor' && (
            <div className="gwMonitorGrid">
              {/* Left Column: Rate Limiter Gauge & Burst Tester */}
              <div className="gwPanel">
                <div className="gwPanelHeader">
                  <h3>⚡ Sliding Window Rate Limiter</h3>
                  <button className="gwBtn mini" onClick={() => { resetRateLimit(); setRateStatus(getRateLimitStatus()); }}>
                    Reset Quota
                  </button>
                </div>

                <div className="rateLimitVisualizer">
                  <div className="rateProgressBar">
                    <div
                      className="rateProgressFill"
                      style={{
                        width: `${Math.min(100, (rateStatus.currentCount / rateStatus.maxAllowed) * 100)}%`,
                        backgroundColor: rateStatus.currentCount / rateStatus.maxAllowed > 0.8 ? '#ef4444' : '#10b981'
                      }}
                    ></div>
                  </div>
                  <div className="rateDetailsRow">
                    <span>Window: <b>60 Seconds</b></span>
                    <span>Used: <b>{rateStatus.currentCount} / {rateStatus.maxAllowed} req</b></span>
                    <span>Reset in: <b>{rateStatus.resetInSec}s</b></span>
                  </div>
                </div>

                <div className="burstActionBox">
                  <h4>Simulate Traffic Spike (DDoS / Overload Test)</h4>
                  <p>Send 45 rapid requests to trigger the <b>HTTP 429 Rate Limit Exceeded</b> policy as specified in Chapter 3.1.2.</p>
                  <button
                    className="gwBtn danger fullWidth"
                    onClick={handleBurstTest}
                    disabled={bursting}
                  >
                    {bursting ? 'Simulating Burst...' : '⚡ Trigger Burst Requests (Exceed Limit)'}
                  </button>
                </div>

                <div className="recentLogsList">
                  <h4>Recent Gateway Logs (Table: `logs`)</h4>
                  <div className="logsScroll">
                    {recentLogs.slice(0, 6).map((log, idx) => (
                      <div key={log.log_id || idx} className="logItemRow">
                        <span className={`logStatus ${log.status?.includes('200') ? 'ok' : 'err'}`}>
                          {log.status}
                        </span>
                        <span className="logLatency">{log.response_time_ms}ms</span>
                        <span className="logDetails">{log.details}</span>
                        <span className="logTime">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Gateway Request Router Simulator */}
              <div className="gwPanel">
                <div className="gwPanelHeader">
                  <h3>🌐 Single Entry Point Request Router</h3>
                </div>
                <p className="gwPanelSub">
                  Send API requests through the gateway procedural pipeline: <b>Auth Check &rarr; Rate Limit &rarr; Route &rarr; Log</b>.
                </p>

                <div className="simForm">
                  <div className="formRow">
                    <label>HTTP Method & Route:</label>
                    <div className="inputGroup">
                      <select value={simulatedMethod} onChange={e => setSimulatedMethod(e.target.value)}>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      <select value={simulatedEndpoint} onChange={e => setSimulatedEndpoint(e.target.value)}>
                        <option value="/api/products">/api/products (Products Catalog)</option>
                        <option value="/api/products/search?q=phone">/api/products/search (Search)</option>
                        <option value="/api/auth/login">/api/auth/login (Auth Verification)</option>
                        <option value="/api/orders/checkout">/api/orders/checkout (Checkout)</option>
                      </select>
                    </div>
                  </div>

                  <div className="formRow">
                    <label>Authentication Token Mode:</label>
                    <div className="radioGroup">
                      <label>
                        <input
                          type="radio"
                          name="authMode"
                          value="valid"
                          checked={simulatedAuthMode === 'valid'}
                          onChange={() => setSimulatedAuthMode('valid')}
                        />
                        Valid JWT Token
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="authMode"
                          value="invalid"
                          checked={simulatedAuthMode === 'invalid'}
                          onChange={() => setSimulatedAuthMode('invalid')}
                        />
                        Invalid Token (401)
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="authMode"
                          value="none"
                          checked={simulatedAuthMode === 'none'}
                          onChange={() => setSimulatedAuthMode('none')}
                        />
                        Anonymous / Public
                      </label>
                    </div>
                  </div>

                  <button
                    className="gwBtn primary fullWidth"
                    onClick={handleSendSimulatedRequest}
                    disabled={simulating}
                  >
                    {simulating ? 'Routing Request...' : '🚀 Dispatch Request Through Gateway'}
                  </button>

                  {/* Simulation Response Output */}
                  {simulationResponse && (
                    <div className={`simResponseBox ${simulationResponse.status === 200 ? 'success' : 'failed'}`}>
                      <div className="simResHeader">
                        <span className="simResStatus">
                          Status: <b>{simulationResponse.statusText}</b>
                        </span>
                        <span className="simResMeta">
                          Latency: <b>{simulationResponse.latency}ms</b> | Remaining Quota: <b>{simulationResponse.rateRemaining}</b>
                        </span>
                      </div>
                      <pre className="simResBody">
                        {JSON.stringify(simulationResponse.data || simulationResponse.error, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 6 DATABASE TABLES IN JSON */}
          {activeTab === 'db' && (
            <div className="gwDbContainer">
              <div className="dbSubNav">
                <div className="dbTablePills">
                  {[
                    { id: 'users', label: '1. Users (Table 3.1)', count: dbData.users?.length || 0 },
                    { id: 'apis', label: '2. APIs (Table 2.3)', count: dbData.apis?.length || 0 },
                    { id: 'requests', label: '3. Requests (Table 3.3)', count: dbData.requests?.length || 0 },
                    { id: 'tokens', label: '4. Tokens (Table 3.5)', count: dbData.tokens?.length || 0 },
                    { id: 'rate_limits', label: '5. Rate Limits (Table 3.4)', count: dbData.rate_limits?.length || 0 },
                    { id: 'logs', label: '6. Logs (Table 2.7)', count: dbData.logs?.length || 0 },
                    { id: 'orders', label: '🛒 Orders (ShopKart)', count: dbData.orders?.length || 0 }
                  ].map(t => (
                    <button
                      key={t.id}
                      className={`dbPillBtn ${activeDbTable === t.id ? 'active' : ''}`}
                      onClick={() => { setActiveDbTable(t.id); setTableSearch(''); }}
                    >
                      {t.label} <span className="pillBadge">{t.count}</span>
                    </button>
                  ))}
                </div>

                <div className="dbSearchBox">
                  <input
                    type="text"
                    placeholder={`Search in ${activeDbTable}...`}
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Table Data View */}
              <div className="dbTableView">
                {currentTableList.length === 0 ? (
                  <div className="emptyDb">No records found in {activeDbTable} table.</div>
                ) : (
                  <div className="tableWrapper">
                    <table className="gwTable">
                      <thead>
                        <tr>
                          {Object.keys(currentTableList[0] || {}).map(key => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentTableList.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {Object.entries(row).map(([k, val], cIdx) => (
                              <td key={cIdx}>
                                {typeof val === 'object' ? (
                                  <span className="jsonTag">{JSON.stringify(val).slice(0, 40)}...</span>
                                ) : String(val).length > 60 ? (
                                  <span title={String(val)}>{String(val).slice(0, 55)}...</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: JWT TOKEN & SECURITY LAB */}
          {activeTab === 'jwt' && (
            <div className="gwJwtContainer">
              <div className="gwPanel">
                <h3>🔐 Issue & Validate JSON Web Tokens (JWT)</h3>
                <p className="gwPanelSub">
                  Standard format <code>header.payload.signature</code> (HS256) used for stateless authentication.
                </p>

                <div className="jwtActionsBar">
                  <button
                    className="gwBtn primary"
                    onClick={() => {
                      const tok = generateJWT({ sub: 'usr_admin_01', name: 'Admin User', role: 'ADMIN' });
                      handleDecodeJWT(tok);
                    }}
                  >
                    Generate Admin JWT
                  </button>
                  <button
                    className="gwBtn secondary"
                    onClick={() => {
                      const tok = generateJWT({ sub: 'usr_client_02', name: 'Demo Client', role: 'USER' });
                      handleDecodeJWT(tok);
                    }}
                  >
                    Generate User JWT
                  </button>
                </div>

                <div className="jwtInputSection">
                  <label>Paste or inspect JWT Token:</label>
                  <textarea
                    rows="3"
                    value={jwtInput}
                    onChange={e => handleDecodeJWT(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>

                {jwtDecodeResult && (
                  <div className="jwtInspectorGrid">
                    <div className="jwtCard headerCard">
                      <h4>Header (Algorithm & Type)</h4>
                      <pre>{JSON.stringify(jwtDecodeResult.header || { alg: 'HS256', typ: 'JWT' }, null, 2)}</pre>
                    </div>
                    <div className="jwtCard payloadCard">
                      <h4>Payload (User Claims & Expiry)</h4>
                      <pre>{JSON.stringify(jwtDecodeResult.payload || {}, null, 2)}</pre>
                    </div>
                    <div className="jwtCard statusCard">
                      <h4>Signature & Verification</h4>
                      <div className={`jwtStatusBadge ${jwtDecodeResult.valid ? 'valid' : 'invalid'}`}>
                        {jwtDecodeResult.valid ? '✅ Valid & Active Signature' : `❌ Verification Failed: ${jwtDecodeResult.reason}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TEST RUNNER (TABLES 3.6 & 3.7) */}
          {activeTab === 'tests' && (
            <div className="gwTestsContainer">
              <div className="testTopBar">
                <div>
                  <h3>🧪 Automated Unit & System Test Runner</h3>
                  <p className="gwPanelSub">
                    Executes all 10 Test Cases directly from <b>Table 3.6 (Unit Tests)</b> and <b>Table 3.7 (System Tests)</b>.
                  </p>
                </div>
                <button
                  className="gwBtn primary"
                  onClick={handleRunTests}
                  disabled={testingRunning}
                >
                  {testingRunning ? 'Running Test Suites...' : '▶ Run All Test Cases'}
                </button>
              </div>

              {testResults.length === 0 ? (
                <div className="testPlaceholder">
                  <div className="testPlaceholderIcon">📋</div>
                  <h4>Ready to execute Table 3.6 & 3.7 Test Cases</h4>
                  <p>Click "Run All Test Cases" above to verify Authentication, Rate Limiting, Request Router, and Error Handling.</p>
                </div>
              ) : (
                <div className="testResultsTableWrapper">
                  <table className="gwTestTable">
                    <thead>
                      <tr>
                        <th>Test ID</th>
                        <th>Type</th>
                        <th>Module</th>
                        <th>Description</th>
                        <th>Input</th>
                        <th>Expected Output</th>
                        <th>Actual Result</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map(t => (
                        <tr key={t.testId}>
                          <td><b>{t.testId}</b></td>
                          <td><span className="typeBadge">{t.category}</span></td>
                          <td>{t.module}</td>
                          <td>{t.description}</td>
                          <td><code>{t.input}</code></td>
                          <td>{t.expected}</td>
                          <td>{t.actual}</td>
                          <td>
                            <span className={`resBadge ${t.passed ? 'pass' : 'fail'}`}>
                              {t.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GatewayDashboard;
