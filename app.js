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

function runPrediction(){
  const prog = +document.getElementById('out-prog').textContent;
  const apt = +document.getElementById('out-apt').textContent;
  const comm = +document.getElementById('out-comm').textContent;
  const soft = +document.getElementById('out-soft').textContent;
  const code = +document.getElementById('out-code').textContent;
  const proj = +document.getElementById('in-proj').value;
  const intern = +document.getElementById('in-intern').value;
  const cert = +document.getElementById('in-cert').value;
  const hack = +document.getElementById('in-hack').value;

  // Classifier: raw score feeds a logistic function, giving a confidence (0-1)
  // that the model uses to decide the class label — Placed or Not Placed.
  const raw = (prog+apt+comm+soft+code)/5*7 + proj*3 + intern*6 + cert*2 + hack*3;
  const z = (raw - 62) / 10; // centered around the decision boundary
  const confidence = 1 / (1 + Math.exp(-z));
  const confidencePct = Math.max(3, Math.min(98, Math.round(confidence * 100)));
  const isPlaced = confidence >= 0.5;

  const gaugeVerdict = document.getElementById('gauge-verdict');
  gaugeVerdict.textContent = isPlaced ? 'Placed' : 'Not Placed';
  gaugeVerdict.classList.toggle('placed', isPlaced);
  gaugeVerdict.classList.toggle('notplaced', !isPlaced);

  document.getElementById('gauge-confidence').textContent =
    `${confidencePct}% confidence`;

  const stampEl = document.getElementById('stamp-el');
  if(isPlaced){
    stampEl.textContent = 'Placed';
    stampEl.classList.remove('negative');
  } else {
    stampEl.textContent = 'Not Placed';
    stampEl.classList.add('negative');
  }

  const tips = [];
  if(apt < 7) tips.push('Aptitude score trails the rest of your profile — a weekly mock test would close this fastest.');
  if(intern < 2) tips.push('One more internship would meaningfully raise your placement odds.');
  if(hack < 1) tips.push('Sign up for a coding contest or hackathon; recruiters weight this heavily.');
  if(comm < 7) tips.push('Book a mock-interview slot with the career cell to sharpen communication.');
  if(cert < 2) tips.push('Add a relevant certification in your core stack to round out your profile.');
  if(tips.length === 0) tips.push('Your profile is well balanced — keep attendance and CGPA steady through placement season.');

  document.getElementById('remarks-list').innerHTML = tips.slice(0,3).map(t => `<li>${t}</li>`).join('');
  showView('result');
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