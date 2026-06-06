/* ==========================================
   FARMA SHIFT - CORE JAVASCRIPT APP LOGIC
   ========================================== */

// --- INITIAL STATE & DATABASE MODULE ---
const DB_KEYS = {
  EMPLOYEES: 'farma_employees',
  SCHEDULES: 'farma_schedules',
  HANDOVERS: 'farma_handovers',
  ATTENDANCE: 'farma_attendance',
  SESSION: 'farma_active_session'
};

// SVG/Canvas generated silhouettes as fallbacks for initial employees
const MOCK_AVATARS = {
  sarah: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2310b981"><circle cx="50" cy="35" r="20"/><path d="M50 60c-20 0-35 12-35 25h70c0-13-15-25-35-25z"/></svg>',
  budi: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%233b82f6"><circle cx="50" cy="35" r="20"/><path d="M50 60c-18 0-32 10-35 22h70c-3-12-17-22-35-22z"/></svg>',
  citra: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23fbbf24"><circle cx="50" cy="35" r="20"/><path d="M50 60c-20 0-35 12-35 25h70c0-13-15-25-35-25z"/></svg>',
  dedi: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23f43f5e"><circle cx="50" cy="35" r="20"/><path d="M50 60c-18 0-32 10-35 22h70c-3-12-17-22-35-22z"/></svg>'
};

// Database Helper with Hybrid PHP API and LocalStorage Sync
const db = {
  state: {
    employees: [],
    schedules: [],
    handovers: [],
    attendance: [],
    session: null
  },

  async loadFromSource() {
    try {
      // Try to load state from the PHP backend API
      const response = await fetch('api.php?action=load');
      if (response.ok) {
        const serverData = await response.json();
        if (serverData && serverData.employees) {
          this.state = serverData;
          localStorage.setItem('farma_state', JSON.stringify(this.state));
          return true;
        }
      }
    } catch (e) {
      console.warn("PHP Backend database not available, using LocalStorage fallback:", e);
    }

    // Local fallback
    const local = localStorage.getItem('farma_state');
    if (local) {
      this.state = JSON.parse(local);
    } else {
      this.initLocalMock();
    }
    return false;
  },

  async saveKey(key, value) {
    this.state[key] = value;
    localStorage.setItem('farma_state', JSON.stringify(this.state));

    try {
      const payload = {};
      payload[key] = value;
      await fetch('api.php?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Failed to sync database state to PHP backend:", e);
    }
  },

  get(key, defaultValue) {
    let stateKey = '';
    if (key === DB_KEYS.EMPLOYEES) stateKey = 'employees';
    else if (key === DB_KEYS.SCHEDULES) stateKey = 'schedules';
    else if (key === DB_KEYS.HANDOVERS) stateKey = 'handovers';
    else if (key === DB_KEYS.ATTENDANCE) stateKey = 'attendance';
    else if (key === DB_KEYS.SESSION) stateKey = 'session';

    if (stateKey && this.state[stateKey] !== undefined) {
      return this.state[stateKey];
    }
    return defaultValue;
  },

  set(key, val) {
    let stateKey = '';
    if (key === DB_KEYS.EMPLOYEES) stateKey = 'employees';
    else if (key === DB_KEYS.SCHEDULES) stateKey = 'schedules';
    else if (key === DB_KEYS.HANDOVERS) stateKey = 'handovers';
    else if (key === DB_KEYS.ATTENDANCE) stateKey = 'attendance';
    else if (key === DB_KEYS.SESSION) stateKey = 'session';

    if (stateKey) {
      this.saveKey(stateKey, val);
    }
  },

  initLocalMock() {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const ystrDate = yesterday.toISOString().split('T')[0];
    const tdyDate = today.toISOString().split('T')[0];
    const tmrDate = tomorrow.toISOString().split('T')[0];

    this.state.employees = [
      { id: 'AP-2026-001', name: 'apt. Sarah Amalia, S.Farm.', role: 'Apoteker Utama', avatar: MOCK_AVATARS.sarah },
      { id: 'AP-2026-002', name: 'Budi Pratama', role: 'Asisten Apoteker', avatar: MOCK_AVATARS.budi },
      { id: 'AP-2026-003', name: 'Citra Dewi', role: 'Kasir Apotek', avatar: MOCK_AVATARS.citra },
      { id: 'AP-2026-004', name: 'Dedi Kurniawan', role: 'Staf Logistik', avatar: MOCK_AVATARS.dedi }
    ];

    this.state.schedules = [
      { id: 'S-1', empId: 'AP-2026-002', empName: 'Budi Pratama', date: ystrDate, shift: 'Pagi', time: '08:00 - 16:00', status: 'Selesai' },
      { id: 'S-2', empId: 'AP-2026-001', empName: 'apt. Sarah Amalia, S.Farm.', date: ystrDate, shift: 'Siang', time: '14:00 - 22:00', status: 'Selesai' },
      { id: 'S-3', empId: 'AP-2026-001', empName: 'apt. Sarah Amalia, S.Farm.', date: tdyDate, shift: 'Pagi', time: '08:00 - 16:00', status: 'Hadir' },
      { id: 'S-4', empId: 'AP-2026-002', empName: 'Budi Pratama', date: tdyDate, shift: 'Siang', time: '14:00 - 22:00', status: 'Siap' },
      { id: 'S-5', empId: 'AP-2026-003', empName: 'Citra Dewi', date: tdyDate, shift: 'Malam', time: '22:00 - 08:00', status: 'Siap' },
      { id: 'S-6', empId: 'AP-2026-003', empName: 'Citra Dewi', date: tmrDate, shift: 'Pagi', time: '08:00 - 16:00', status: 'Siap' },
      { id: 'S-7', empId: 'AP-2026-004', empName: 'Dedi Kurniawan', date: tmrDate, shift: 'Siang', time: '14:00 - 22:00', status: 'Siap' }
    ];

    this.state.handovers = [
      {
        id: 'HO-1',
        date: ystrDate,
        time: '16:00',
        empOutId: 'AP-2026-002',
        empOutName: 'Budi Pratama',
        empInId: 'AP-2026-001',
        empInName: 'apt. Sarah Amalia, S.Farm.',
        notes: 'Serah terima shift pagi ke siang berjalan lancar. Seluruh resep tunai telah diinput. Uang kas laci klop Rp 1.500.000.',
        stocks: [
          { name: 'Amoxicillin 500mg (Tablet)', count: 20, reason: 'Tinggal 2 box di lemari depan, silakan order ke PBF.' }
        ],
        issues: [],
        photo: MOCK_AVATARS.budi
      }
    ];

    this.state.attendance = [
      { id: 'A-1', empId: 'AP-2026-002', empName: 'Budi Pratama', date: ystrDate, time: '07:54:12', type: 'Clock In', shift: 'Pagi', photo: MOCK_AVATARS.budi },
      { id: 'A-2', empId: 'AP-2026-002', empName: 'Budi Pratama', date: ystrDate, time: '16:05:43', type: 'Clock Out', shift: 'Pagi', photo: MOCK_AVATARS.budi },
      { id: 'A-3', empId: 'AP-2026-001', empName: 'apt. Sarah Amalia, S.Farm.', date: ystrDate, time: '13:58:30', type: 'Clock In', shift: 'Siang', photo: MOCK_AVATARS.sarah },
      { id: 'A-4', empId: 'AP-2026-001', empName: 'apt. Sarah Amalia, S.Farm.', date: ystrDate, time: '22:02:11', type: 'Clock Out', shift: 'Siang', photo: MOCK_AVATARS.sarah },
      { id: 'A-5', empId: 'AP-2026-001', empName: 'apt. Sarah Amalia, S.Farm.', date: tdyDate, time: '07:49:52', type: 'Clock In', shift: 'Pagi', photo: MOCK_AVATARS.sarah }
    ];

    this.state.session = {
      empId: 'AP-2026-001',
      empName: 'apt. Sarah Amalia, S.Farm.',
      role: 'Apoteker Utama',
      shiftId: 'S-3',
      shiftName: 'Pagi',
      clockInTime: '07:49:52'
    };

    localStorage.setItem('farma_state', JSON.stringify(this.state));
  }
};

// Start load sequence
db.loadFromSource();

// --- APP NAVIGATION & RUNTIME STATE ---
let currentView = 'dashboard';
let activeCameraStream = null;
let scanMode = 'clock-in'; // 'clock-in' or 'clock-out'
let activeVerificationPhoto = null; // Stored temp image for handover signing

// --- DOM ELEMENTS REFERENCE ---
const els = {
  // Sidebar & Layout
  sidebar: document.getElementById('sidebar'),
  toggleSidebar: document.getElementById('toggleSidebar'),
  pageTitle: document.getElementById('pageTitle'),
  menuItems: document.querySelectorAll('.menu-item'),
  liveClockDate: document.getElementById('liveClockDate'),
  liveClockTime: document.getElementById('liveClockTime'),
  currentActiveShiftTag: document.getElementById('currentActiveShiftTag'),
  activeUserSummary: document.getElementById('activeUserSummary'),
  
  // Dashboard
  statEmployees: document.getElementById('stat-total-employees'),
  statCheckedIn: document.getElementById('stat-checked-in'),
  statStocks: document.getElementById('stat-critical-stocks'),
  statIssues: document.getElementById('stat-open-issues'),
  activeShiftAvatar: document.getElementById('activeShiftAvatar'),
  activeShiftEmployeeName: document.getElementById('activeShiftEmployeeName'),
  activeShiftEmployeeRole: document.getElementById('activeShiftEmployeeRole'),
  activeShiftTime: document.getElementById('activeShiftTime'),
  activeShiftClockIn: document.getElementById('activeShiftClockIn'),
  activeShiftStatusText: document.getElementById('activeShiftStatusText'),
  activeShiftBadge: document.getElementById('activeShiftBadge'),
  dashboardStockAlerts: document.getElementById('dashboard-stock-alerts'),
  dashboardIssueAlerts: document.getElementById('dashboard-issue-alerts'),
  dashboardRecentTable: document.getElementById('dashboard-recent-activity'),
  
  // Scan UI
  webcamVideo: document.getElementById('webcamVideo'),
  scannerOverlayCanvas: document.getElementById('scannerOverlayCanvas'),
  scannerStatusText: document.getElementById('scannerStatusText'),
  scanShiftType: document.getElementById('scanShiftType'),
  scanModeInBtn: document.getElementById('scanModeIn'),
  scanModeOutBtn: document.getElementById('scanModeOut'),
  scanFeedbackContainer: document.getElementById('scanFeedbackContainer'),
  btnStartScan: document.getElementById('btnStartScan'),
  btnResetCamera: document.getElementById('btnResetCamera'),
  capturedFlash: document.getElementById('capturedFlash'),
  
  // Schedule UI
  createScheduleForm: document.getElementById('createScheduleForm'),
  schedEmployee: document.getElementById('schedEmployee'),
  schedShift: document.getElementById('schedShift'),
  schedDate: document.getElementById('schedDate'),
  scheduleSearchInput: document.getElementById('scheduleSearchInput'),
  scheduleFilterDate: document.getElementById('scheduleFilterDate'),
  scheduleTableBody: document.getElementById('schedule-table-body'),
  
  // Handover UI
  handoverForm: document.getElementById('handoverForm'),
  handoverEmployeeOut: document.getElementById('handoverEmployeeOut'),
  handoverEmployeeOutId: document.getElementById('handoverEmployeeOutId'),
  handoverEmployeeIn: document.getElementById('handoverEmployeeIn'),
  handoverNotes: document.getElementById('handoverNotes'),
  stockWatchlistContainer: document.getElementById('stockWatchlistContainer'),
  btnAddStockRow: document.getElementById('btnAddStockRow'),
  issuesListContainer: document.getElementById('issuesListContainer'),
  btnAddIssueRow: document.getElementById('btnAddIssueRow'),
  handoverAuthStatus: document.getElementById('handoverAuthStatus'),
  handoverAuthPhoto: document.getElementById('handoverAuthPhoto'),
  btnVerifyHandoverFace: document.getElementById('btnVerifyHandoverFace'),
  btnSubmitHandover: document.getElementById('btnSubmitHandover'),
  
  // History UI
  logsTimeline: document.getElementById('logsTimeline'),
  historyFilterType: document.getElementById('historyFilterType'),
  historyFilterEmployee: document.getElementById('historyFilterEmployee'),
  historyFilterDate: document.getElementById('historyFilterDate'),
  btnExportCSV: document.getElementById('btnExportCSV'),
  btnClearHistory: document.getElementById('btnClearHistory'),
  
  // Employees UI
  employeesGrid: document.getElementById('employeesGrid'),
  btnOpenAddEmployeeModal: document.getElementById('btnOpenAddEmployeeModal'),
  addEmployeeModal: document.getElementById('addEmployeeModal'),
  addEmployeeForm: document.getElementById('addEmployeeForm'),
  empName: document.getElementById('empName'),
  empRole: document.getElementById('empRole'),
  empId: document.getElementById('empId'),
  registerVideo: document.getElementById('registerVideo'),
  registerCanvas: document.getElementById('registerCanvas'),
  cameraPlaceholderMsg: document.getElementById('cameraPlaceholderMsg'),
  registerPhotoPreview: document.getElementById('registerPhotoPreview'),
  btnStartRegisterCamera: document.getElementById('btnStartRegisterCamera'),
  btnCaptureRegisterPhoto: document.getElementById('btnCaptureRegisterPhoto'),
  btnRetakeRegisterPhoto: document.getElementById('btnRetakeRegisterPhoto'),
  btnSaveEmployee: document.getElementById('btnSaveEmployee'),
  
  // Biometric Verify modal (Handover)
  biometricVerifyModal: document.getElementById('biometricVerifyModal'),
  verifyVideo: document.getElementById('verifyVideo'),
  verifyOverlayCanvas: document.getElementById('verifyOverlayCanvas'),
  verifyMessage: document.getElementById('verifyMessage'),
  verifyProgressContainer: document.getElementById('verifyProgressContainer'),
  verifyProgressBar: document.getElementById('verifyProgressBar'),
  btnTriggerVerifyScan: document.getElementById('btnTriggerVerifyScan'),

  // Session Switcher Dialog Elements
  switchSessionModal: document.getElementById('switchSessionModal'),
  switchSessionSelect: document.getElementById('switchSessionSelect'),
  switchSessionShift: document.getElementById('switchSessionShift'),
  btnConfirmSwitchSession: document.getElementById('btnConfirmSwitchSession')
};


// ==========================================
// 1. DIGITAL LIVE CLOCK & TICKER
// ==========================================
function startLiveClock() {
  const formatTime = (date) => {
    return date.toTimeString().split(' ')[0];
  };
  
  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  setInterval(() => {
    const now = new Date();
    els.liveClockTime.textContent = formatTime(now);
    els.liveClockDate.textContent = formatDate(now);
  }, 1000);
  
  // Set initial text
  const now = new Date();
  els.liveClockTime.textContent = formatTime(now);
  els.liveClockDate.textContent = formatDate(now);
}

// ==========================================
// 2. SPA ROUTER & SIDEBAR ANIMATION
// ==========================================
function initNavigation() {
  // Mobile toggle sidebar
  els.toggleSidebar.addEventListener('click', () => {
    els.sidebar.classList.toggle('active');
  });

  // Close sidebar clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && els.sidebar.classList.contains('active')) {
      if (!els.sidebar.contains(e.target) && !els.toggleSidebar.contains(e.target)) {
        els.sidebar.classList.remove('active');
      }
    }
  });

  els.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = item.getAttribute('data-view');
      navigateToView(targetView);
      
      // Close mobile drawer on item click
      if (window.innerWidth <= 768) {
        els.sidebar.classList.remove('active');
      }
    });
  });

  // Open switch session modal clicking sidebar footer
  els.activeUserSummary.addEventListener('click', (e) => {
    e.preventDefault();
    openSwitchSessionModal();
  });
}

function navigateToView(viewName) {
  // Stop camera streams if active when switching views
  stopAllCameraStreams();
  
  // Remove active from all tabs & panels
  els.menuItems.forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
  
  // Set target active
  const activeMenu = Array.from(els.menuItems).find(item => item.getAttribute('data-view') === viewName);
  if (activeMenu) activeMenu.classList.add('active');
  
  const targetPanel = document.getElementById(`view-${viewName}`);
  if (targetPanel) targetPanel.classList.add('active');
  
  currentView = viewName;
  
  // Set Header Title
  let title = 'Dashboard Overview';
  if (viewName === 'scan') title = 'Verifikasi Scan Wajah';
  else if (viewName === 'schedule') title = 'Jadwal Kerja Karyawan';
  else if (viewName === 'handover') title = 'Serah Terima Shift';
  else if (viewName === 'history') title = 'Riwayat & Aktivitas Log';
  else if (viewName === 'employees') title = 'Kelola Database Karyawan';
  
  els.pageTitle.textContent = title;
  
  // Trigger specific view loaders
  if (viewName === 'dashboard') loadDashboardData();
  else if (viewName === 'scan') initScanView();
  else if (viewName === 'schedule') loadScheduleView();
  else if (viewName === 'handover') loadHandoverView();
  else if (viewName === 'history') loadHistoryView();
  else if (viewName === 'employees') loadEmployeesView();
}


// ==========================================
// 3. WEBCAM INTERFACE UTILS
// ==========================================
async function startWebcam(videoElement, fallbackCallback) {
  stopAllCameraStreams();
  
  try {
    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user"
      },
      audio: false
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    activeCameraStream = stream;
    return true;
  } catch (err) {
    console.warn("Kamera tidak dapat diakses atau diblokir:", err);
    if (fallbackCallback) {
      fallbackCallback();
    }
    return false;
  }
}

function stopAllCameraStreams() {
  if (activeCameraStream) {
    activeCameraStream.getTracks().forEach(track => track.stop());
    activeCameraStream = null;
  }
}


// ==========================================
// 4. CANVAS BIOMETRIC SCANNER ENGINE
// ==========================================
let faceAnimationTimer = null;
let scanningLaserActive = false;

function startCanvasScannerAnimation(canvas, videoElement, statusUpdaterCallback) {
  const ctx = canvas.getContext('2d');
  
  // Match canvas dimensions to video element size
  const updateCanvasDimensions = () => {
    canvas.width = videoElement.clientWidth || 640;
    canvas.height = videoElement.clientHeight || 480;
  };
  updateCanvasDimensions();
  window.addEventListener('resize', updateCanvasDimensions);
  
  // Generate random face landmark mesh vertices
  const vertexCount = 18;
  const vertices = [];
  
  for (let i = 0; i < vertexCount; i++) {
    vertices.push({
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      speed: 0.03 + Math.random() * 0.05
    });
  }

  // Animation Loop
  scanningLaserActive = true;
  document.querySelector('.laser-scanner').style.display = 'block';

  let scanPercent = 0;
  const scanDuration = 180; // ~3 seconds at 60fps
  let step = 0;

  function drawFrame() {
    if (!scanningLaserActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rx = Math.min(canvas.width * 0.25, 120);
    const ry = Math.min(canvas.height * 0.35, 160);
    
    // Draw face template guide (oval)
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.stroke();
    
    // Calculate landmarks floating inside the oval
    step++;
    
    vertices.forEach((v, index) => {
      // If close to target or target is 0, assign a new target inside the ellipse
      const dist = Math.hypot(v.x - v.targetX, v.y - v.targetY);
      if (dist < 5 || (v.targetX === 0 && v.targetY === 0)) {
        // Generate coordinates inside ellipse using polar coordinates
        const theta = Math.random() * 2 * Math.PI;
        const rFactor = 0.2 + Math.random() * 0.7; // Avoid edges
        v.targetX = cx + rx * rFactor * Math.cos(theta);
        v.targetY = cy + ry * rFactor * Math.sin(theta);
      }
      
      // Interpolate towards target
      v.x += (v.targetX - v.x) * v.speed;
      v.y += (v.targetY - v.y) * v.speed;
    });
    
    // Draw facial landmark nodes (dots)
    ctx.fillStyle = 'rgba(52, 211, 153, 0.8)';
    vertices.forEach(v => {
      ctx.beginPath();
      ctx.arc(v.x, v.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Connect nodes into a biometric web (mesh)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const d = Math.hypot(vertices[i].x - vertices[j].x, vertices[i].y - vertices[j].y);
        if (d < 80) { // Connect only close nodes
          ctx.beginPath();
          ctx.moveTo(vertices[i].x, vertices[i].y);
          ctx.lineTo(vertices[j].x, vertices[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Highlight eye regions and nose bridge (simulating focal tracking locks)
    if (step > 30) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 1;
      
      // Left eye region (vertices 0, 1, 2)
      ctx.beginPath();
      ctx.arc(cx - rx*0.4, cy - ry*0.2, 12, 0, 2*Math.PI);
      ctx.stroke();
      
      // Right eye region (vertices 3, 4, 5)
      ctx.beginPath();
      ctx.arc(cx + rx*0.4, cy - ry*0.2, 12, 0, 2*Math.PI);
      ctx.stroke();
    }
    
    if (step > 60) {
      // Nose bridge lock line
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - ry*0.1);
      ctx.lineTo(cx, cy + ry*0.2);
      ctx.stroke();
    }

    if (step > 90) {
      // Mouth target box
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      ctx.strokeRect(cx - 20, cy + ry*0.4, 40, 12);
    }
    
    // Progress calculation & Text Feedbacks
    scanPercent = Math.min(Math.round((step / scanDuration) * 100), 100);
    
    let text = "Mencari Wajah...";
    if (scanPercent > 15 && scanPercent <= 40) {
      text = "Wajah Terdeteksi (86%) - Memetakan Landmark...";
    } else if (scanPercent > 40 && scanPercent <= 70) {
      text = "Mencocokkan Biometrik dengan Database...";
    } else if (scanPercent > 70 && scanPercent < 100) {
      text = "Mengotentikasi Tanda Tangan Digital...";
    } else if (scanPercent === 100) {
      text = "PEMINDAIAN SELESAI!";
    }
    
    if (statusUpdaterCallback) {
      statusUpdaterCallback(text, scanPercent);
    }
    
    if (scanPercent < 100) {
      faceAnimationTimer = requestAnimationFrame(drawFrame);
    } else {
      stopCanvasScannerAnimation(canvas);
    }
  }
  
  drawFrame();
}

function stopCanvasScannerAnimation(canvas) {
  scanningLaserActive = false;
  document.querySelector('.laser-scanner').style.display = 'none';
  if (faceAnimationTimer) {
    cancelAnimationFrame(faceAnimationTimer);
    faceAnimationTimer = null;
  }
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Generate base64 canvas snapshot image of camera feed
function captureCameraFrame(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  
  // Mirror frame to match mirrored preview standard
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  // Revert transformations
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  return canvas.toDataURL('image/jpeg', 0.85);
}


// ==========================================
// 5. DASHBOARD DATA MANAGEMENT
// ==========================================
function loadDashboardData() {
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  const schedules = db.get(DB_KEYS.SCHEDULES, []);
  const logs = db.get(DB_KEYS.ATTENDANCE, []);
  const handovers = db.get(DB_KEYS.HANDOVERS, []);
  const session = db.get(DB_KEYS.SESSION, null);
  const todayDate = new Date().toISOString().split('T')[0];
  
  // 1. Fill Quick Stats Card values
  els.statEmployees.textContent = employees.length;
  
  const presentTodayCount = logs.filter(log => log.date === todayDate && log.type === 'Clock In').length;
  els.statCheckedIn.textContent = presentTodayCount;
  
  // Count critical stock from all handovers
  let stockAlerts = [];
  handovers.forEach(ho => {
    if (ho.stocks && ho.stocks.length > 0) {
      stockAlerts = stockAlerts.concat(ho.stocks);
    }
  });
  els.statStocks.textContent = stockAlerts.length;
  
  let issuesCount = 0;
  handovers.forEach(ho => {
    if (ho.issues && ho.issues.length > 0) {
      issuesCount += ho.issues.length;
    }
  });
  els.statIssues.textContent = issuesCount;
  
  // 2. Render Active Shift Card
  if (session) {
    els.activeShiftEmployeeName.textContent = session.empName;
    els.activeShiftEmployeeRole.textContent = session.role;
    
    // Find active schedule details
    const activeSched = schedules.find(s => s.id === session.shiftId);
    els.activeShiftTime.textContent = activeSched ? activeSched.time : '08:00 - 16:00';
    els.activeShiftClockIn.textContent = session.clockInTime;
    els.activeShiftStatusText.textContent = `Hadir (Shift ${session.shiftName})`;
    els.activeShiftStatusText.className = 'val text-emerald';
    els.activeShiftBadge.textContent = 'Berjalan';
    els.activeShiftBadge.className = 'badge badge-success';
    
    // Try to find employee avatar
    const emp = employees.find(e => e.id === session.empId);
    if (emp && emp.avatar) {
      els.activeShiftAvatar.innerHTML = `<img src="${emp.avatar}" alt="${emp.name}">`;
    } else {
      els.activeShiftAvatar.innerHTML = `<i class="fas fa-user-tie"></i>`;
    }
    
    // Set Header status
    els.currentActiveShiftTag.textContent = `Shift ${session.shiftName}`;
    els.activeUserSummary.innerHTML = `
      <div class="avatar-placeholder">
        <img src="${emp ? emp.avatar : MOCK_AVATARS.sarah}" alt="">
      </div>
      <div class="user-details">
        <span class="user-name">${session.empName}</span>
        <span class="user-role">${session.role}</span>
      </div>
    `;
  } else {
    els.activeShiftEmployeeName.textContent = 'Tidak Ada Karyawan';
    els.activeShiftEmployeeRole.textContent = 'Apotek Belum Buka';
    els.activeShiftTime.textContent = '--:-- - --:--';
    els.activeShiftClockIn.textContent = '--:--';
    els.activeShiftStatusText.textContent = 'Tutup / Shift Kosong';
    els.activeShiftStatusText.className = 'val text-muted';
    els.activeShiftBadge.textContent = 'Offline';
    els.activeShiftBadge.className = 'badge badge-danger';
    els.activeShiftAvatar.innerHTML = `<i class="fas fa-user-slash"></i>`;
    
    els.currentActiveShiftTag.textContent = `Offline`;
    els.activeUserSummary.innerHTML = `
      <div class="avatar-placeholder">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="user-details">
        <span class="user-name">Belum Login</span>
        <span class="user-role">Scan untuk Masuk</span>
      </div>
    `;
  }
  
  // 3. Render Critical Stock alerts list
  els.dashboardStockAlerts.innerHTML = '';
  if (stockAlerts.length > 0) {
    // Show top 3 alerts
    stockAlerts.slice(-3).reverse().forEach(stock => {
      const li = document.createElement('li');
      li.className = 'alert-item alert-warning';
      li.innerHTML = `
        <i class="fas fa-triangle-exclamation text-amber mt-1"></i>
        <div class="alert-item-content">
          <div class="alert-item-title">${stock.name} - Sisa: ${stock.count} unit</div>
          <div class="alert-item-desc">${stock.reason}</div>
        </div>
      `;
      els.dashboardStockAlerts.appendChild(li);
    });
  } else {
    els.dashboardStockAlerts.innerHTML = `<li class="empty-list-msg">Tidak ada peringatan stok obat saat ini.</li>`;
  }
  
  // 4. Render Issues alerts list
  els.dashboardIssueAlerts.innerHTML = '';
  let activeIssues = [];
  handovers.forEach(ho => {
    if (ho.issues) {
      ho.issues.forEach(iss => {
        activeIssues.push({
          ...iss,
          date: ho.date,
          emp: ho.empOutName
        });
      });
    }
  });
  
  if (activeIssues.length > 0) {
    activeIssues.slice(-3).reverse().forEach(issue => {
      const li = document.createElement('li');
      const isCritical = issue.severity === 'Kritis';
      li.className = `alert-item ${isCritical ? 'alert-danger' : 'alert-warning'}`;
      li.innerHTML = `
        <i class="fas ${isCritical ? 'fa-circle-xmark text-rose' : 'fa-triangle-exclamation text-amber'} mt-1"></i>
        <div class="alert-item-content">
          <div class="alert-item-title">${issue.desc} <span class="badge ${isCritical ? 'badge-danger' : 'badge-warning'} btn-xs">${issue.severity}</span></div>
          <div class="alert-item-desc">Dilaporkan oleh ${issue.emp} pada ${issue.date}</div>
        </div>
      `;
      els.dashboardIssueAlerts.appendChild(li);
    });
  } else {
    els.dashboardIssueAlerts.innerHTML = `<li class="empty-list-msg">Tidak ada kendala operasional aktif.</li>`;
  }
  
  // 5. Render Recent Activities Table
  els.dashboardRecentTable.innerHTML = '';
  
  // Merge attendance and handovers into a single timeline sorted chronologically
  const activityTimeline = [];
  
  logs.forEach(log => {
    activityTimeline.push({
      timestamp: new Date(`${log.date}T${log.time}`),
      date: log.date,
      time: log.time,
      name: log.empName,
      type: log.type === 'Clock In' ? 'Presensi Masuk' : 'Presensi Keluar',
      badgeClass: log.type === 'Clock In' ? 'badge-success' : 'badge-danger',
      detail: `Absen ${log.type === 'Clock In' ? 'Masuk' : 'Keluar'} pada Shift ${log.shift}`,
      photo: log.photo
    });
  });
  
  handovers.forEach(ho => {
    activityTimeline.push({
      timestamp: new Date(`${ho.date}T${ho.time}`),
      date: ho.date,
      time: ho.time,
      name: ho.empOutName,
      type: 'Serah Terima',
      badgeClass: 'badge-warning',
      detail: `Melakukan handover shift kepada ${ho.empInName}. Catatan: "${ho.notes.slice(0, 45)}${ho.notes.length > 45 ? '...' : ''}"`,
      photo: ho.photo
    });
  });
  
  // Sort descending (newest first)
  activityTimeline.sort((a, b) => b.timestamp - a.timestamp);
  
  if (activityTimeline.length > 0) {
    activityTimeline.slice(0, 5).forEach(act => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${act.date} <span class="text-muted small">${act.time}</span></td>
        <td><strong>${act.name}</strong></td>
        <td><span class="badge ${act.badgeClass}">${act.type}</span></td>
        <td>${act.detail}</td>
        <td>
          <div class="verification-photo-row p-0 mt-0" style="border: none;">
            <img src="${act.photo}" class="verification-photo-img" style="width: 32px; height: 32px; border-radius: 4px;" alt="Scan">
          </div>
        </td>
      `;
      els.dashboardRecentTable.appendChild(tr);
    });
  } else {
    els.dashboardRecentTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Belum ada aktivitas terekam.</td></tr>`;
  }
}

function switchDashboardTab(tabId) {
  // Toggle header buttons
  const tabHeaderContainer = document.querySelector('.tab-headers');
  tabHeaderContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Find which button was clicked and set it active
  const event = window.event;
  if (event) {
    event.target.classList.add('active');
  }
  
  // Toggle tab contents
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}


// ==========================================
// 6. SCAN ATTENDANCE LOGIC
// ==========================================
let activeScanMode = 'clock-in'; // default

function initScanView() {
  // Populate Shift Selection based on schedules for Today
  const schedules = db.get(DB_KEYS.SCHEDULES, []);
  const todayDate = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(s => s.date === todayDate);
  
  els.scanShiftType.innerHTML = '<option value="">-- Pilih Jadwal Shift Aktif --</option>';
  todaySchedules.forEach(sched => {
    els.scanShiftType.innerHTML += `
      <option value="${sched.id}">${sched.shift} : ${sched.empName} (${sched.time})</option>
    `;
  });
  
  setScanMode('clock-in');
  els.scanFeedbackContainer.innerHTML = `
    <div class="feedback-placeholder">
      <i class="fas fa-shield-halved text-muted mb-2" style="font-size: 2.5rem;"></i>
      <p>Pilih jadwal shift lalu tekan tombol <strong>Mulai Pemindaian Wajah</strong> untuk clock-in/out.</p>
    </div>
  `;
  
  // Stop existing webcam overlays if running
  stopCanvasScannerAnimation(els.scannerOverlayCanvas);
  
  // Reset camera view
  els.webcamVideo.srcObject = null;
  els.scannerStatusText.textContent = "Kamera Siap";
}

function setScanMode(mode) {
  activeScanMode = mode;
  if (mode === 'clock-in') {
    els.scanModeInBtn.classList.add('active');
    els.scanModeOutBtn.classList.remove('active');
  } else {
    els.scanModeInBtn.classList.remove('active');
    els.scanModeOutBtn.classList.add('active');
  }
}

// Camera fallback for testing if user has no webcam or blocks permission
function simulateCameraFeed(videoElement, canvasElement, textElement) {
  textElement.textContent = "SIMULATOR KAMERA AKTIF";
  
  const ctx = canvasElement.getContext('2d');
  canvasElement.width = videoElement.clientWidth || 640;
  canvasElement.height = videoElement.clientHeight || 480;
  
  let frame = 0;
  function drawFallbackBg() {
    if (activeCameraStream) return; // Stop if real webcam starts
    if (!scanningLaserActive) return;
    
    ctx.fillStyle = '#060a0f';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw animated camera target grid
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(canvasElement.width/2, canvasElement.height/2, 100, 0, 2*Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = '#10b981';
    ctx.font = '12px Outfit';
    ctx.fillText("[ SIMULASI KAMERA - WAJAH TERDETEKSI ]", 30, 30);
    
    // Draw a basic vector silhouette face that wiggles
    const cx = canvasElement.width / 2;
    const cy = canvasElement.height / 2;
    const offset = Math.sin(frame * 0.05) * 5;
    
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.beginPath();
    ctx.arc(cx, cy - 10 + offset, 45, 0, 2*Math.PI); // Head
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(cx, cy + 65 + offset, 65, 35, 0, 0, 2*Math.PI); // Shoulders
    ctx.fill();
    ctx.stroke();
    
    frame++;
    requestAnimationFrame(drawFallbackBg);
  }
  
  drawFallbackBg();
}

els.btnStartScan.addEventListener('click', async () => {
  const selectedSchedId = els.scanShiftType.value;
  if (!selectedSchedId) {
    alert("Silakan pilih Jadwal Shift Anda terlebih dahulu!");
    return;
  }
  
  const schedules = db.get(DB_KEYS.SCHEDULES, []);
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  
  const selectedSched = schedules.find(s => s.id === selectedSchedId);
  const employee = employees.find(e => e.id === selectedSched.empId);
  
  if (!employee) {
    alert("Karyawan tidak ditemukan dalam sistem!");
    return;
  }
  
  // Disable button while scanning
  els.btnStartScan.disabled = true;
  els.scannerStatusText.textContent = "Menginisialisasi Kamera...";
  
  // Start webcam
  const hasWebcam = await startWebcam(els.webcamVideo, () => {
    // Fallback: Camera simulator
    simulateCameraFeed(els.webcamVideo, els.scannerOverlayCanvas, els.scannerStatusText);
  });
  
  els.scannerStatusText.textContent = "MEMINDAI WAJAH...";
  
  // Start canvas animation overlay
  startCanvasScannerAnimation(els.scannerOverlayCanvas, els.webcamVideo, (text, percent) => {
    els.scannerStatusText.textContent = `${text} (${percent}%)`;
    
    els.scanFeedbackContainer.innerHTML = `
      <div class="scan-feedback-success" style="animation: none;">
        <i class="fas fa-circle-notch fa-spin text-emerald mb-2" style="font-size: 2rem;"></i>
        <h4>Memproses Biometrik...</h4>
        <p>${text}</p>
        <div class="progress-bar-container mt-2" style="max-width: 200px; margin: 8px auto;">
          <div class="progress-bar" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  });
  
  // Wait 3 seconds for scan to complete
  setTimeout(() => {
    // Capture snapshot (real camera image or mock avatar fallback if camera failed)
    let snapshotImg = employee.avatar; // Default fallback to initial profile avatar
    
    if (activeCameraStream) {
      snapshotImg = captureCameraFrame(els.webcamVideo);
      // Flash animation
      els.capturedFlash.classList.add('flash');
      setTimeout(() => els.capturedFlash.classList.remove('flash'), 200);
    }
    
    stopAllCameraStreams();
    stopCanvasScannerAnimation(els.scannerOverlayCanvas);
    
    // Core Clock-In / Clock-Out state changes
    const today = new Date();
    const curTime = today.toTimeString().split(' ')[0];
    const curDate = today.toISOString().split('T')[0];
    
    const logs = db.get(DB_KEYS.ATTENDANCE, []);
    
    if (activeScanMode === 'clock-in') {
      // 1. Save Attendance Log
      const newLog = {
        id: `A-${Date.now()}`,
        empId: employee.id,
        empName: employee.name,
        date: curDate,
        time: curTime,
        type: 'Clock In',
        shift: selectedSched.shift,
        photo: snapshotImg
      };
      logs.push(newLog);
      db.set(DB_KEYS.ATTENDANCE, logs);
      
      // 2. Update schedule status to "Hadir"
      selectedSched.status = 'Hadir';
      db.set(DB_KEYS.SCHEDULES, schedules);
      
      // 3. Set as Active Session
      db.set(DB_KEYS.SESSION, {
        empId: employee.id,
        empName: employee.name,
        role: employee.role,
        shiftId: selectedSched.id,
        shiftName: selectedSched.shift,
        clockInTime: curTime
      });
      
      // 4. Update UI feedback
      els.scanFeedbackContainer.innerHTML = `
        <div class="scan-feedback-success">
          <div class="feedback-icon"><i class="fas fa-circle-check"></i></div>
          <h4>Clock-In Berhasil!</h4>
          <p>Selamat bertugas, <strong>${employee.name}</strong>.</p>
          <p class="small text-muted mt-1">Shift: ${selectedSched.shift} (${curTime})</p>
        </div>
      `;
    } else {
      // Clock Out
      // Verify if they are clocked in
      const session = db.get(DB_KEYS.SESSION, null);
      
      // Save Clock Out log
      const newLog = {
        id: `A-${Date.now()}`,
        empId: employee.id,
        empName: employee.name,
        date: curDate,
        time: curTime,
        type: 'Clock Out',
        shift: selectedSched.shift,
        photo: snapshotImg
      };
      logs.push(newLog);
      db.set(DB_KEYS.ATTENDANCE, logs);
      
      // Update schedule status to "Selesai"
      selectedSched.status = 'Selesai';
      db.set(DB_KEYS.SCHEDULES, schedules);
      
      // Clear session if the currently clocked-out employee is the session user
      if (session && session.empId === employee.id) {
        localStorage.removeItem(DB_KEYS.SESSION);
      }
      
      els.scanFeedbackContainer.innerHTML = `
        <div class="scan-feedback-success">
          <div class="feedback-icon" style="color: var(--rose); text-shadow: 0 0 15px var(--rose-glow);"><i class="fas fa-circle-arrow-right"></i></div>
          <h4>Clock-Out Berhasil!</h4>
          <p>Terima kasih atas kerja kerasnya, <strong>${employee.name}</strong>.</p>
          <p class="small text-muted mt-1">Shift ${selectedSched.shift} berakhir jam ${curTime}</p>
        </div>
      `;
    }
    
    els.scannerStatusText.textContent = "PEMINDAIAN SELESAI";
    els.btnStartScan.disabled = false;
    
    // Refresh Sidebar profile
    loadDashboardData();
  }, 3200);
});

els.btnResetCamera.addEventListener('click', () => {
  stopAllCameraStreams();
  stopCanvasScannerAnimation(els.scannerOverlayCanvas);
  initScanView();
});


// ==========================================
// 7. SCHEDULE VIEW LOGIC
// ==========================================
function loadScheduleView() {
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  
  // Populate dropdown selection inside scheduling form
  els.schedEmployee.innerHTML = '<option value="">-- Pilih Karyawan --</option>';
  employees.forEach(emp => {
    els.schedEmployee.innerHTML += `<option value="${emp.id}">${emp.name} (${emp.role})</option>`;
  });
  
  // Set default date to today
  els.schedDate.value = new Date().toISOString().split('T')[0];
  els.scheduleFilterDate.value = '';
  els.scheduleSearchInput.value = '';
  
  renderSchedulesTable();
}

function renderSchedulesTable() {
  const schedules = db.get(DB_KEYS.SCHEDULES, []);
  const filterText = els.scheduleSearchInput.value.toLowerCase();
  const filterDate = els.scheduleFilterDate.value;
  
  els.scheduleTableBody.innerHTML = '';
  
  const filtered = schedules.filter(item => {
    const matchName = item.empName.toLowerCase().includes(filterText);
    const matchDate = !filterDate || item.date === filterDate;
    return matchName && matchDate;
  });
  
  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (filtered.length > 0) {
    filtered.forEach(sched => {
      let statusBadge = 'badge-warning'; // Siap
      if (sched.status === 'Hadir') statusBadge = 'badge-success';
      else if (sched.status === 'Selesai') statusBadge = 'badge-outline-success';
      else if (sched.status === 'Mangkir') statusBadge = 'badge-danger';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${sched.empName}</strong></td>
        <td>${sched.date}</td>
        <td>${sched.shift}</td>
        <td>${sched.time}</td>
        <td><span class="badge ${statusBadge}">${sched.status}</span></td>
        <td>
          <button class="btn btn-outline btn-xs" onclick="deleteSchedule('${sched.id}')">
            <i class="fas fa-trash-can text-rose"></i>
          </button>
        </td>
      `;
      els.scheduleTableBody.appendChild(tr);
    });
  } else {
    els.scheduleTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Jadwal tidak ditemukan.</td></tr>`;
  }
}

// Bind search and filter events
els.scheduleSearchInput.addEventListener('input', renderSchedulesTable);
els.scheduleFilterDate.addEventListener('change', renderSchedulesTable);

els.createScheduleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  const schedules = db.get(DB_KEYS.SCHEDULES, []);
  
  const empId = els.schedEmployee.value;
  const shiftType = els.schedShift.value;
  const date = els.schedDate.value;
  
  const employee = employees.find(e => e.id === empId);
  if (!employee) return;
  
  let time = '08:00 - 16:00';
  if (shiftType === 'Siang') time = '14:00 - 22:00';
  else if (shiftType === 'Malam') time = '22:00 - 08:00';
  
  const newSched = {
    id: `S-${Date.now()}`,
    empId: empId,
    empName: employee.name,
    date: date,
    shift: shiftType,
    time: time,
    status: 'Siap'
  };
  
  schedules.push(newSched);
  db.set(DB_KEYS.SCHEDULES, schedules);
  
  els.createScheduleForm.reset();
  els.schedDate.value = new Date().toISOString().split('T')[0];
  
  renderSchedulesTable();
  alert("Jadwal shift berhasil disimpan!");
});

window.deleteSchedule = (id) => {
  if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
    const schedules = db.get(DB_KEYS.SCHEDULES, []);
    const updated = schedules.filter(s => s.id !== id);
    db.set(DB_KEYS.SCHEDULES, updated);
    renderSchedulesTable();
  }
};


// ==========================================
// 8. SHIFT HANDOVER FORM WORKFLOW
// ==========================================
let stockRowCount = 0;
let issueRowCount = 0;

function loadHandoverView() {
  const session = db.get(DB_KEYS.SESSION, null);
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  
  // 1. Populate current logged-in employee (Outgoing)
  if (session) {
    els.handoverEmployeeOut.value = session.empName;
    els.handoverEmployeeOutId.value = session.empId;
  } else {
    els.handoverEmployeeOut.value = '';
    els.handoverEmployeeOutId.value = '';
  }
  
  // 2. Populate next employee list (excluding current)
  els.handoverEmployeeIn.innerHTML = '<option value="">-- Pilih Karyawan Penerus --</option>';
  employees.forEach(emp => {
    if (!session || emp.id !== session.empId) {
      els.handoverEmployeeIn.innerHTML += `<option value="${emp.id}">${emp.name} (${emp.role})</option>`;
    }
  });
  
  // 3. Clear Dynamic lists
  els.stockWatchlistContainer.innerHTML = `<div class="empty-stock-row-msg">Belum ada obat yang ditambahkan. Klik "Tambah Obat" jika ada stok kritis.</div>`;
  els.issuesListContainer.innerHTML = `<div class="empty-issue-row-msg">Belum ada kendala yang dilaporkan. Operasional terpantau aman dan terkendali.</div>`;
  stockRowCount = 0;
  issueRowCount = 0;
  
  // 4. Reset Biometric verification sign-off
  activeVerificationPhoto = null;
  els.handoverAuthStatus.textContent = 'Belum Diverifikasi';
  els.handoverAuthStatus.className = 'badge badge-warning';
  els.handoverAuthPhoto.innerHTML = '<i class="fas fa-face-viewfinder"></i>';
  els.handoverAuthPhoto.className = 'auth-photo-preview';
  els.btnSubmitHandover.disabled = true;
  
  els.handoverForm.reset();
  if (session) {
    els.handoverEmployeeOut.value = session.empName;
  }
}

// Add medicine row to handover form
els.btnAddStockRow.addEventListener('click', () => {
  const container = els.stockWatchlistContainer;
  const emptyMsg = container.querySelector('.empty-stock-row-msg');
  if (emptyMsg) emptyMsg.remove();
  
  stockRowCount++;
  const div = document.createElement('div');
  div.className = 'stock-row';
  div.id = `stock-row-${stockRowCount}`;
  div.innerHTML = `
    <div style="flex: 2;">
      <input type="text" placeholder="Nama Obat (misal: Paracetamol 500mg)" class="form-control handover-stock-name" required>
    </div>
    <div style="width: 100px;">
      <input type="number" placeholder="Sisa" class="form-control handover-stock-count" required min="0">
    </div>
    <div style="flex: 2;">
      <input type="text" placeholder="Keterangan (misal: Sisa 3 botol, order PBF)" class="form-control handover-stock-reason" required>
    </div>
    <button type="button" class="btn-remove-row" onclick="removeStockRow(${stockRowCount})">
      <i class="fas fa-circle-xmark"></i>
    </button>
  `;
  container.appendChild(div);
});

window.removeStockRow = (id) => {
  const row = document.getElementById(`stock-row-${id}`);
  if (row) {
    row.remove();
    // If no rows left, restore placeholder message
    if (els.stockWatchlistContainer.querySelectorAll('.stock-row').length === 0) {
      els.stockWatchlistContainer.innerHTML = `<div class="empty-stock-row-msg">Belum ada obat yang ditambahkan. Klik "Tambah Obat" jika ada stok kritis.</div>`;
    }
  }
};

// Add issues row to handover form
els.btnAddIssueRow.addEventListener('click', () => {
  const container = els.issuesListContainer;
  const emptyMsg = container.querySelector('.empty-issue-row-msg');
  if (emptyMsg) emptyMsg.remove();
  
  issueRowCount++;
  const div = document.createElement('div');
  div.className = 'issue-row';
  div.id = `issue-row-${issueRowCount}`;
  div.innerHTML = `
    <div style="flex: 3;">
      <input type="text" placeholder="Deskripsi kendala (misal: Mesin EDC Mandiri mati)" class="form-control handover-issue-desc" required>
    </div>
    <div style="flex: 1.5;">
      <select class="form-control handover-issue-severity">
        <option value="Ringan">Ringan (Masalah minor)</option>
        <option value="Sedang">Sedang (Butuh perhatian)</option>
        <option value="Kritis">Kritis (Mengganggu pelayanan)</option>
      </select>
    </div>
    <button type="button" class="btn-remove-row" onclick="removeIssueRow(${issueRowCount})">
      <i class="fas fa-circle-xmark"></i>
    </button>
  `;
  container.appendChild(div);
});

window.removeIssueRow = (id) => {
  const row = document.getElementById(`issue-row-${id}`);
  if (row) {
    row.remove();
    if (els.issuesListContainer.querySelectorAll('.issue-row').length === 0) {
      els.issuesListContainer.innerHTML = `<div class="empty-issue-row-msg">Belum ada kendala yang dilaporkan. Operasional terpantau aman dan terkendali.</div>`;
    }
  }
};

// Handover Biometric verification trigger
els.btnVerifyHandoverFace.addEventListener('click', async () => {
  const session = db.get(DB_KEYS.SESSION, null);
  if (!session) {
    alert("Maaf, tidak ada sesi shift aktif yang terdaftar. Silakan scan presensi masuk terlebih dahulu.");
    return;
  }
  
  // Show modal
  els.biometricVerifyModal.classList.add('active');
  els.verifyMessage.textContent = "Mengaktifkan kamera...";
  els.verifyProgressContainer.style.display = 'none';
  els.verifyProgressBar.style.width = '0%';
  
  // Start Camera
  const hasCamera = await startWebcam(els.verifyVideo, () => {
    // Simulator
    els.verifyMessage.textContent = "SIMULATOR KAMERA AKTIF - KLIK PINDAI";
  });
  
  if (hasCamera) {
    els.verifyMessage.textContent = "Kamera Siap. Posisikan wajah Anda lalu klik 'Mulai Pindai'.";
  }
});

function closeVerifyModal() {
  stopAllCameraStreams();
  stopCanvasScannerAnimation(els.verifyOverlayCanvas);
  els.biometricVerifyModal.classList.remove('active');
}

// Start actual scanning inside Verification Dialog
els.btnTriggerVerifyScan.addEventListener('click', () => {
  const session = db.get(DB_KEYS.SESSION, null);
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  const currentEmp = employees.find(e => e.id === session.empId);
  
  els.verifyProgressContainer.style.display = 'block';
  els.btnTriggerVerifyScan.disabled = true;
  
  startCanvasScannerAnimation(els.verifyOverlayCanvas, els.verifyVideo, (text, percent) => {
    els.verifyMessage.innerHTML = `<strong class="text-emerald">${text}</strong>`;
    els.verifyProgressBar.style.width = `${percent}%`;
  });
  
  setTimeout(() => {
    let capturedImg = currentEmp ? currentEmp.avatar : MOCK_AVATARS.sarah;
    
    if (activeCameraStream) {
      capturedImg = captureCameraFrame(els.verifyVideo);
    }
    
    closeVerifyModal();
    els.btnTriggerVerifyScan.disabled = false;
    
    // Save image & authenticate
    activeVerificationPhoto = capturedImg;
    els.handoverAuthStatus.textContent = 'DIVERIFIKASI';
    els.handoverAuthStatus.className = 'badge badge-success';
    
    els.handoverAuthPhoto.innerHTML = `<img src="${capturedImg}" alt="Signature">`;
    els.handoverAuthPhoto.className = 'auth-photo-preview verified';
    
    // Enable submit button
    els.btnSubmitHandover.disabled = false;
    alert("Otentikasi biometrik berhasil! Laporan siap dikirim.");
  }, 3200);
});

// Submit Handover report
els.handoverForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const session = db.get(DB_KEYS.SESSION, null);
  const handovers = db.get(DB_KEYS.HANDOVERS, []);
  const schedules = db.get(DB_KEYS.SCHEDULES, []);
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  
  if (!session || !activeVerificationPhoto) {
    alert("Laporan memerlukan verifikasi scan wajah untuk dikirim!");
    return;
  }
  
  // Fetch incoming employee details
  const empInId = els.handoverEmployeeIn.value;
  const nextEmployee = employees.find(e => e.id === empInId);
  if (!nextEmployee) return;
  
  // Collect Stock watch list data
  const stockRows = els.stockWatchlistContainer.querySelectorAll('.stock-row');
  const stocks = [];
  stockRows.forEach(row => {
    const name = row.querySelector('.handover-stock-name').value;
    const count = parseInt(row.querySelector('.handover-stock-count').value);
    const reason = row.querySelector('.handover-stock-reason').value;
    stocks.push({ name, count, reason });
  });
  
  // Collect Issues list data
  const issueRows = els.issuesListContainer.querySelectorAll('.issue-row');
  const issues = [];
  issueRows.forEach(row => {
    const desc = row.querySelector('.handover-issue-desc').value;
    const severity = row.querySelector('.handover-issue-severity').value;
    issues.push({ desc, severity });
  });
  
  const today = new Date();
  const curTime = today.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
  const curDate = today.toISOString().split('T')[0];
  
  // Create handover object
  const newHandover = {
    id: `HO-${Date.now()}`,
    date: curDate,
    time: curTime,
    empOutId: session.empId,
    empOutName: session.empName,
    empInId: empInId,
    empInName: nextEmployee.name,
    notes: els.handoverNotes.value,
    stocks: stocks,
    issues: issues,
    photo: activeVerificationPhoto
  };
  
  handovers.push(newHandover);
  db.set(DB_KEYS.HANDOVERS, handovers);
  
  // WORKFLOW AUTO-SHIFT SWITCHING:
  // 1. Clock-out current session user
  const logs = db.get(DB_KEYS.ATTENDANCE, []);
  const activeSched = schedules.find(s => s.id === session.shiftId);
  if (activeSched) {
    activeSched.status = 'Selesai';
  }
  
  // Add clock out log
  logs.push({
    id: `A-${Date.now()}`,
    empId: session.empId,
    empName: session.empName,
    date: curDate,
    time: `${curTime}:00`,
    type: 'Clock Out',
    shift: session.shiftName,
    photo: activeVerificationPhoto
  });
  
  // 2. Automically Clock-in next employee if they have a schedule for today
  // Find if they have a schedule today (e.g. next shift)
  const nextSched = schedules.find(s => s.date === curDate && s.empId === empInId && s.status === 'Siap');
  
  if (nextSched) {
    nextSched.status = 'Hadir';
    
    // Add clock in log for new employee
    logs.push({
      id: `A-${Date.now()+1}`,
      empId: nextEmployee.id,
      empName: nextEmployee.name,
      date: curDate,
      time: `${curTime}:00`,
      type: 'Clock In',
      shift: nextSched.shift,
      photo: nextEmployee.avatar // Fallback to registered face template
    });
    
    // Set new session
    db.set(DB_KEYS.SESSION, {
      empId: nextEmployee.id,
      empName: nextEmployee.name,
      role: nextEmployee.role,
      shiftId: nextSched.id,
      shiftName: nextSched.shift,
      clockInTime: `${curTime}:00`
    });
  } else {
    // If no schedule registered, clear active session (waiting for next scan check-in)
    localStorage.removeItem(DB_KEYS.SESSION);
  }
  
  db.set(DB_KEYS.SCHEDULES, schedules);
  db.set(DB_KEYS.ATTENDANCE, logs);
  
  alert(`Laporan Serah Terima Shift berhasil dikirim! Sesi aktif dialihkan ke ${nextEmployee.name}.`);
  
  // Redirect to dashboard
  navigateToView('dashboard');
});


// ==========================================
// 9. HISTORY & ACTIVITY LOG VIEW
// ==========================================
function loadHistoryView() {
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  
  // Populate Employee Filter dropdown
  els.historyFilterEmployee.innerHTML = '<option value="all">Semua Karyawan</option>';
  employees.forEach(emp => {
    els.historyFilterEmployee.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
  });
  
  els.historyFilterType.value = 'all';
  els.historyFilterEmployee.value = 'all';
  els.historyFilterDate.value = '';
  
  renderHistoryTimeline();
}

function renderHistoryTimeline() {
  const logs = db.get(DB_KEYS.ATTENDANCE, []);
  const handovers = db.get(DB_KEYS.HANDOVERS, []);
  
  const filterType = els.historyFilterType.value;
  const filterEmployee = els.historyFilterEmployee.value;
  const filterDate = els.historyFilterDate.value;
  
  els.logsTimeline.innerHTML = '';
  
  // Merge items
  const items = [];
  
  if (filterType === 'all' || filterType === 'absensi') {
    logs.forEach(log => {
      // Apply filters
      const matchEmp = filterEmployee === 'all' || log.empId === filterEmployee;
      const matchDate = !filterDate || log.date === filterDate;
      
      if (matchEmp && matchDate) {
        items.push({
          timestamp: new Date(`${log.date}T${log.time}`),
          date: log.date,
          time: log.time,
          type: 'absensi',
          title: `Presensi ${log.type === 'Clock In' ? 'MASUK' : 'KELUAR'}`,
          name: log.empName,
          detail: `Karyawan melakukan absensi ${log.type === 'Clock In' ? 'masuk' : 'keluar'} untuk shift kerja <strong>${log.shift}</strong>.`,
          photo: log.photo,
          iconClass: log.type === 'Clock In' ? 'fa-sign-in-alt text-emerald' : 'fa-sign-out-alt text-rose',
          cardClass: 'type-absensi'
        });
      }
    });
  }
  
  if (filterType === 'all' || filterType === 'handover') {
    handovers.forEach(ho => {
      const matchEmp = filterEmployee === 'all' || ho.empOutId === filterEmployee || ho.empInId === filterEmployee;
      const matchDate = !filterDate || ho.date === filterDate;
      
      if (matchEmp && matchDate) {
        items.push({
          timestamp: new Date(`${ho.date}T${ho.time}`),
          date: ho.date,
          time: ho.time,
          type: 'handover',
          title: 'Serah Terima Shift (Handover)',
          name: ho.empOutName,
          detail: `Operasional shift diserahterimakan kepada <strong>${ho.empInName}</strong>.`,
          notes: ho.notes,
          stocks: ho.stocks || [],
          issues: ho.issues || [],
          photo: ho.photo,
          iconClass: 'fa-file-signature text-amber',
          cardClass: 'type-handover'
        });
      }
    });
  }
  
  // Sort descending
  items.sort((a, b) => b.timestamp - a.timestamp);
  
  if (items.length > 0) {
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `timeline-card ${item.cardClass}`;
      
      let bodyHtml = `<p>${item.detail}</p>`;
      
      // If handover, render notes, stocks and issues
      if (item.type === 'handover') {
        bodyHtml += `
          <div class="handover-log-sections">
            <div class="handover-log-subsection">
              <h4><i class="fas fa-note-sticky text-emerald"></i> Catatan Handover</h4>
              <p style="font-style: italic;">"${item.notes}"</p>
            </div>
        `;
        
        if (item.stocks && item.stocks.length > 0) {
          bodyHtml += `
            <div class="handover-log-subsection">
              <h4><i class="fas fa-prescription-bottle text-amber"></i> Stok Obat Diawasi</h4>
              <ul>
                ${item.stocks.map(st => `<li><strong>${st.name}</strong> <span>Sisa: ${st.count} (${st.reason})</span></li>`).join('')}
              </ul>
            </div>
          `;
        }
        
        if (item.issues && item.issues.length > 0) {
          bodyHtml += `
            <div class="handover-log-subsection">
              <h4><i class="fas fa-triangle-exclamation text-rose"></i> Kendala Terlapor</h4>
              <ul>
                ${item.issues.map(is => `<li><span>${is.desc}</span> <span class="badge ${is.severity === 'Kritis' ? 'badge-danger' : 'badge-warning'} btn-xs">${is.severity}</span></li>`).join('')}
              </ul>
            </div>
          `;
        }
        
        bodyHtml += `</div>`; // Close sections
      }
      
      card.innerHTML = `
        <div class="timeline-card-header">
          <div class="log-meta">
            <span class="log-title"><i class="fas ${item.iconClass}"></i> ${item.title}</span>
            <span class="log-time">${item.date} Pukul ${item.time}</span>
          </div>
          <span class="badge badge-outline-success">Oleh: ${item.name}</span>
        </div>
        <div class="timeline-card-body">
          ${bodyHtml}
          
          <div class="log-verification-photo-row">
            <img src="${item.photo}" class="verification-photo-img" alt="Scan Wajah">
            <div class="verification-photo-meta">
              <span><i class="fas fa-shield-halved text-emerald"></i> Terverifikasi Scan Wajah</span>
              <span class="auth-time small">${item.date} ${item.time}</span>
            </div>
          </div>
        </div>
      `;
      
      els.logsTimeline.appendChild(card);
    });
  } else {
    els.logsTimeline.innerHTML = `<div class="empty-list-msg">Riwayat aktivitas kosong atau tidak cocok dengan filter.</div>`;
  }
}

// Bind history filters
els.historyFilterType.addEventListener('change', renderHistoryTimeline);
els.historyFilterEmployee.addEventListener('change', renderHistoryTimeline);
els.historyFilterDate.addEventListener('change', renderHistoryTimeline);

// Export logs to CSV
els.btnExportCSV.addEventListener('click', () => {
  const logs = db.get(DB_KEYS.ATTENDANCE, []);
  if (logs.length === 0) {
    alert("Data log kosong!");
    return;
  }
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,NIP,Nama Karyawan,Tanggal,Waktu,Tipe Absen,Shift\r\n";
  
  logs.forEach(log => {
    csvContent += `${log.id},${log.empId},"${log.empName}",${log.date},${log.time},${log.type},${log.shift}\r\n`;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `FarmaShift_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Clear history
els.btnClearHistory.addEventListener('click', () => {
  if (confirm("Apakah Anda yakin ingin menghapus semua riwayat presensi dan handover? Tindakan ini tidak bisa dibatalkan!")) {
    db.set(DB_KEYS.ATTENDANCE, []);
    db.set(DB_KEYS.HANDOVERS, []);
    renderHistoryTimeline();
    loadDashboardData();
  }
});


// ==========================================
// 10. EMPLOYEE REGISTRY & REGISTRATION MODAL
// ==========================================
function loadEmployeesView() {
  renderEmployeesGrid();
}

function renderEmployeesGrid() {
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  els.employeesGrid.innerHTML = '';
  
  employees.forEach(emp => {
    const card = document.createElement('div');
    card.className = 'employee-card glass';
    
    let avatarHtml = `<i class="fas fa-user"></i>`;
    if (emp.avatar) {
      avatarHtml = `<img src="${emp.avatar}" alt="${emp.name}">`;
    }
    
    card.innerHTML = `
      <div class="employee-card-avatar">
        ${avatarHtml}
      </div>
      <div class="employee-card-name">${emp.name}</div>
      <div class="employee-card-role">${emp.role}</div>
      <div class="employee-card-nip">${emp.id}</div>
      <div class="employee-card-actions">
        <button class="btn btn-outline btn-block btn-sm" onclick="deleteEmployee('${emp.id}')">
          <i class="fas fa-user-minus text-rose"></i> Hapus Karyawan
        </button>
      </div>
    `;
    els.employeesGrid.appendChild(card);
  });
}

window.deleteEmployee = (id) => {
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  if (employees.length <= 1) {
    alert("Gagal menghapus! Minimal harus ada 1 karyawan terdaftar di sistem.");
    return;
  }
  
  if (confirm(`Apakah Anda yakin ingin menghapus karyawan dengan NIP ${id}?`)) {
    const updated = employees.filter(e => e.id !== id);
    db.set(DB_KEYS.EMPLOYEES, updated);
    
    // Cleanup active session if it belonged to deleted employee
    const session = db.get(DB_KEYS.SESSION, null);
    if (session && session.empId === id) {
      localStorage.removeItem(DB_KEYS.SESSION);
    }
    
    renderEmployeesGrid();
    loadDashboardData();
  }
};

// Modal functions
els.btnOpenAddEmployeeModal.addEventListener('click', () => {
  els.addEmployeeModal.classList.add('active');
  
  // Reset fields
  els.addEmployeeForm.reset();
  els.registerPhotoPreview.innerHTML = `
    <div class="preview-empty">
      <i class="fas fa-image"></i>
      <span>Pratinjau Foto</span>
    </div>
  `;
  els.btnCaptureRegisterPhoto.disabled = true;
  els.btnRetakeRegisterPhoto.style.display = 'none';
  els.btnStartRegisterCamera.style.display = 'block';
  els.cameraPlaceholderMsg.style.display = 'flex';
  els.btnSaveEmployee.disabled = true;
  
  // Suggest a NIP
  els.empId.value = `AP-2026-${String(db.get(DB_KEYS.EMPLOYEES, []).length + 1).padStart(3, '0')}`;
  
  stopAllCameraStreams();
  els.registerVideo.srcObject = null;
});

function closeEmployeeModal() {
  stopAllCameraStreams();
  els.addEmployeeModal.classList.remove('active');
}

// Camera activation inside registration modal
els.btnStartRegisterCamera.addEventListener('click', async () => {
  els.btnStartRegisterCamera.disabled = true;
  
  const hasWebcam = await startWebcam(els.registerVideo, () => {
    // Simulator fallback
    els.cameraPlaceholderMsg.innerHTML = `
      <i class="fas fa-triangle-exclamation text-amber"></i>
      <p>Menggunakan simulator kamera. Ambil foto wajah simulator di bawah.</p>
    `;
  });
  
  els.cameraPlaceholderMsg.style.display = 'none';
  els.btnCaptureRegisterPhoto.disabled = false;
  els.btnStartRegisterCamera.disabled = false;
  els.btnStartRegisterCamera.style.display = 'none';
});

// Take photo in modal
els.btnCaptureRegisterPhoto.addEventListener('click', () => {
  let snapDataUrl = null;
  
  if (activeCameraStream) {
    snapDataUrl = captureCameraFrame(els.registerVideo);
  } else {
    // Simulator fallback capture - Choose a colored silhouette based on user name input
    const randomColors = ['%2310b981', '%233b82f6', '%23fbbf24', '%23f43f5e', '%238b5cf6'];
    const chosenColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    snapDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${chosenColor}"><circle cx="50" cy="35" r="20"/><path d="M50 60c-20 0-35 12-35 25h70c0-13-15-25-35-25z"/></svg>`;
  }
  
  stopAllCameraStreams();
  
  // Show in preview pane
  els.registerPhotoPreview.innerHTML = `<img src="${snapDataUrl}" id="capturedRegisterPhoto" alt="Snapshot">`;
  
  els.btnCaptureRegisterPhoto.disabled = true;
  els.btnRetakeRegisterPhoto.style.display = 'block';
  els.btnSaveEmployee.disabled = false;
});

// Retake photo
els.btnRetakeRegisterPhoto.addEventListener('click', () => {
  els.btnRetakeRegisterPhoto.style.display = 'none';
  els.btnSaveEmployee.disabled = true;
  els.registerPhotoPreview.innerHTML = `
    <div class="preview-empty">
      <i class="fas fa-image"></i>
      <span>Pratinjau Foto</span>
    </div>
  `;
  
  els.btnStartRegisterCamera.click();
});

// Save employee
els.addEmployeeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  
  // Validate ID uniqueness
  const newId = els.empId.value.trim();
  if (employees.some(emp => emp.id === newId)) {
    alert("NIP karyawan sudah terdaftar di sistem!");
    return;
  }
  
  const imgElem = els.registerPhotoPreview.querySelector('img');
  if (!imgElem) {
    alert("Harap ambil foto wajah karyawan terlebih dahulu!");
    return;
  }
  
  const newEmployee = {
    id: newId,
    name: els.empName.value.trim(),
    role: els.empRole.value,
    avatar: imgElem.src
  };
  
  employees.push(newEmployee);
  db.set(DB_KEYS.EMPLOYEES, employees);
  
  closeEmployeeModal();
  renderEmployeesGrid();
  loadDashboardData();
  
  alert("Registrasi karyawan baru berhasil disimpan!");
});


// ==========================================
// 12. SWITCH ACTIVE SESSION SIMULATION
// ==========================================
function openSwitchSessionModal() {
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  const session = db.get(DB_KEYS.SESSION, null);

  els.switchSessionSelect.innerHTML = '';
  employees.forEach(emp => {
    const isSelected = session && session.empId === emp.id ? 'selected' : '';
    els.switchSessionSelect.innerHTML += `
      <option value="${emp.id}" ${isSelected}>${emp.name} (${emp.role})</option>
    `;
  });

  if (session) {
    els.switchSessionShift.value = session.shiftName || 'Pagi';
  }

  els.switchSessionModal.classList.add('active');
}

function closeSwitchSessionModal() {
  els.switchSessionModal.classList.remove('active');
}

window.closeSwitchSessionModal = closeSwitchSessionModal;

els.btnConfirmSwitchSession.addEventListener('click', () => {
  const employees = db.get(DB_KEYS.EMPLOYEES, []);
  const schedules = db.get(DB_KEYS.SCHEDULES, []);
  const empId = els.switchSessionSelect.value;
  const shiftName = els.switchSessionShift.value;

  const employee = employees.find(e => e.id === empId);
  if (!employee) return;

  const todayDate = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().split(' ')[0];

  // Try to find if there is an active schedule today for this shift and employee
  let sched = schedules.find(s => s.date === todayDate && s.empId === empId && s.shift === shiftName);

  // If no schedule exists, let's create a temporary schedule for them so everything flows correctly
  if (!sched) {
    let time = '08:00 - 16:00';
    if (shiftName === 'Siang') time = '14:00 - 22:00';
    else if (shiftName === 'Malam') time = '22:00 - 08:00';

    sched = {
      id: `S-TEMP-${Date.now()}`,
      empId: empId,
      empName: employee.name,
      date: todayDate,
      shift: shiftName,
      time: time,
      status: 'Hadir'
    };
    schedules.push(sched);
    db.set(DB_KEYS.SCHEDULES, schedules);
  } else {
    sched.status = 'Hadir';
    db.set(DB_KEYS.SCHEDULES, schedules);
  }

  // Set as active session
  db.set(DB_KEYS.SESSION, {
    empId: employee.id,
    empName: employee.name,
    role: employee.role,
    shiftId: sched.id,
    shiftName: shiftName,
    clockInTime: nowTime
  });

  closeSwitchSessionModal();
  loadDashboardData();
  
  // If we are currently on the Handover view, reload it as well to update outgoing worker
  if (currentView === 'handover') {
    loadHandoverView();
  }

  alert(`Sesi kerja berhasil dialihkan ke ${employee.name} (Shift ${shiftName}).`);
});

// ==========================================
// 11. INITIALIZATION ON PAGE LOAD
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
  startLiveClock();
  initNavigation();
  
  // Sync database state from API/LocalStorage first
  await db.loadFromSource();
  
  // Load Default view (Dashboard)
  navigateToView('dashboard');
});
