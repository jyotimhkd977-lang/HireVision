function showView(name){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('nav.tabs button').forEach(b => {
    const isAdminView = name === 'admin' && b.dataset.view === 'admin-login';
    b.classList.toggle('active', b.dataset.view === name || isAdminView);
  });
  window.scrollTo({top:0, behavior:'smooth'});
  if(name === 'admin') requestAnimationFrame(initCharts);
}
document.querySelectorAll('nav.tabs button').forEach(b=>{
  b.addEventListener('click', ()=> showView(b.dataset.view));
});

function setAuth(mode){
  document.getElementById('login-form').style.display = mode==='login' ? 'block':'none';
  document.getElementById('register-form').style.display = mode==='register' ? 'block':'none';
  document.querySelectorAll('.auth-toggle button').forEach(b=> b.classList.toggle('active', b.dataset.auth===mode));
}

function getNumberValue(id, fallback = 0) {
  const el = document.getElementById(id);
  const rawValue = el?.value ?? el?.textContent ?? fallback;
  const value = Number(rawValue);
  return Number.isFinite(value) ? value : fallback;
}

function normalizeBranch(value) {
  const branch = String(value || 'CSE').trim();
  const lookup = {
    cse: 'CSE',
    'cse-aiml': 'CSE-AIML',
    'cse aiml': 'CSE-AIML',
    'cse-ds': 'CSE-DS',
    'cse ds': 'CSE-DS',
    'cse-cybersecurity': 'CSE-CyberSecurity',
    'cse cybersecurity': 'CSE-CyberSecurity',
    ece: 'ECE',
    'ece-vlsi': 'ECE-VLSI',
    'ece vlsi': 'ECE-VLSI',
    eee: 'EEE',
    mechanical: 'Mechanical',
    civil: 'Civil',
    'aircraft & maintainance': 'Aircraft & Maintainance',
    'aircraft and maintainance': 'Aircraft & Maintainance',
    biotech: 'Biotech',
    bca: 'BCA',
    mca: 'MCA',
    bba: 'BBA',
    mba: 'MBA',
    it: 'CSE'
  };
  return lookup[branch.toLowerCase()] || branch;
}

function buildPredictionPayload() {
  return {
    Age: getNumberValue('age', 21),
    Gender: document.getElementById('gender')?.value || 'Female',
    Branch: normalizeBranch(document.getElementById('branch')?.value || 'CSE'),
    CGPA: getNumberValue('cgpa', 8.4),
    Tenth_Percentage: getNumberValue('tenth-percent', 92),
    Twelfth_Percentage: getNumberValue('twelfth-percent', 88),
    Backlogs: getNumberValue('backlogs', 0),
    Attendance: getNumberValue('attendance', 91),
    Programming_Skill: getNumberValue('programming-skill', 7),
    Aptitude_Score: getNumberValue('aptitude-score', 6),
    Communication_Skill: getNumberValue('communication-skill', 6),
    Soft_Skills: getNumberValue('soft-skills', 7),
    Coding_Rating: getNumberValue('coding-rating', 7),
    Projects: getNumberValue('in-proj', 3),
    Internships: getNumberValue('in-intern', 1),
    Certifications: getNumberValue('in-cert', 2),
    Hackathons: getNumberValue('in-hack', 0)
  };
}

function renderPredictionResult(data) {
  const verdict = data.prediction || 'Not Placed';
  const confidence = Math.round(Number(data.confidence || 0));
  const gaugeVerdict = document.getElementById('gauge-verdict');
  const isPlaced = verdict === 'Placed';

  gaugeVerdict.textContent = verdict;
  gaugeVerdict.classList.toggle('placed', isPlaced);
  gaugeVerdict.classList.toggle('notplaced', !isPlaced);
  document.getElementById('gauge-confidence').textContent = `${confidence}% confidence`;

  const stampEl = document.getElementById('stamp-el');
  stampEl.textContent = verdict;
  stampEl.classList.toggle('negative', !isPlaced);

  const remarks = Array.isArray(data.tips) && data.tips.length ? data.tips : ['Your profile is well balanced — keep refinement steady through placement season.'];
  document.getElementById('remarks-list').innerHTML = remarks.slice(0, 3).map(t => `<li>${t}</li>`).join('');
}

async function runPrediction(){
  const payload = buildPredictionPayload();
  const submitBtn = document.querySelector('#view-predict .btn-primary');
  const originalText = submitBtn.textContent;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Evaluating...';

  try {
    const response = await fetch('http://127.0.0.1:5000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Prediction request failed.');
    }

    renderPredictionResult(data);
    showView('result');
  } catch (error) {
    const tips = [error.message || 'The prediction service is currently unavailable.'];
    renderPredictionResult({ prediction: 'Not Placed', confidence: 0, tips });
    showView('result');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

let chartsInit = false;
function initCharts(){
  if(chartsInit) return;
  chartsInit = true;
  const inkSoft = '#48597A', ink='#1C2B45';
  const branchColors = [
    '#A9782F',
    '#2E5233',
    '#8C2F39',
    '#1C2B45',
    '#6E5B9A',
    '#2F6F73',
    '#B45F3A',
    '#547A42',
    '#7C4F35',
    '#476A9C',
    '#9A6B2F',
    '#3E6B52',
    '#8A4778',
    '#5D6F32',
    '#A14E52'
  ];

  new Chart(document.getElementById('branchChart'), {
    type: 'bar',
    data: {
      labels: ['CSE','CSE-AIML','CSE-DS','CSE-CyberSecurity','ECE','ECE-VLSI','EEE','Mechanical','Civil','Aircraft & Maintainance','Biotech','BCA','MCA','BBA','MBA'],
      datasets: [{ data: [82,79,76,73,68,64,62,54,49,46,58,45,52,78,82], backgroundColor: branchColors, borderRadius: 3, maxBarThickness: 28 }]
    },
    options: {
      plugins:{legend:{display:false}},
      scales:{
        y:{ beginAtZero:true, max:100, grid:{color:'#E6DEC7'}, ticks:{color:inkSoft, font:{family:"IBM Plex Mono", size:10}} },
        x:{ grid:{display:false}, ticks:{color:inkSoft, font:{family:"IBM Plex Mono", size:10}, maxRotation:60, minRotation:35} }
      }
    }
  });

  new Chart(document.getElementById('cgpaChart'), {
    type: 'line',
    data: {
      labels: ['<6','6-7','7-8','8-9','9-10'],
      datasets: [{ data: [40,180,410,520,134], borderColor: ink, backgroundColor:'rgba(28,43,69,0.08)', fill:true, tension:.35, pointBackgroundColor: ink }]
    },
    options: {
      plugins:{legend:{display:false}},
      scales:{
        y:{ beginAtZero:true, grid:{color:'#E6DEC7'}, ticks:{color:inkSoft, font:{family:"IBM Plex Mono", size:10}} },
        x:{ grid:{display:false}, ticks:{color:inkSoft, font:{family:"IBM Plex Mono", size:10}} }
      }
    }
  });
}