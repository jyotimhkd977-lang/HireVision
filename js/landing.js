/**
 * HireVision AI — Landing Page View
 */

function renderLandingPage() {
  const main = document.getElementById('app-main');
  main.innerHTML = `

    <!-- ===== HERO ===== -->
    <section class="hero" aria-label="Hero section">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="hero-overlay" aria-hidden="true"></div>
      <div class="container hero-inner">

        <!-- Left copy -->
        <div class="hero-content reveal">
          <p class="hero-eyebrow">Placement Season, Decoded</p>
          <h1 class="hero-headline">
            Know your odds before the<br>
            <em>interview panel</em> does.
          </h1>
          <div class="hero-copy">
            <p>Enter your academics, skills and internship record. The model reads your
            file the way a placement officer would — and tells you exactly which line to
            fix before recruiters see it.</p>
          </div>
          <div class="hero-actions">
            <button class="btn btn-primary" data-view="predict" aria-label="Get my prediction">
              Get my prediction →
            </button>
            <button class="btn btn-outline" data-view="auth" aria-label="Login or Register">
              Login / Register
            </button>
          </div>
        </div>

        <!-- Prediction ticket -->
        <div class="hero-ticket reveal" style="transition-delay:0.15s;" aria-label="Sample placement prediction ticket">
          <div class="hero-ticket-header">
            <span class="label">Placement Prediction Slip</span>
            <span class="seal" aria-hidden="true">HV</span>
          </div>
          <div class="hero-ticket-body">
            <div class="ticket-row">
              <span class="ticket-label">Candidate</span>
              <span class="ticket-value">Jyotiranjan</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Branch</span>
              <span class="ticket-value">CSE-AIML, Final Yr</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">CGPA</span>
              <span class="ticket-value">9.02</span>
            </div>
            <div class="ticket-row">
              <span class="ticket-label">Backlogs</span>
              <span class="ticket-value">0</span>
            </div>
            <div class="ticket-outcome">
              <p class="outcome-label">Predicted Outcome</p>
              <p class="outcome-value">
                Placed ✓
                <span class="confidence">82% Confidence</span>
              </p>
            </div>
          </div>
          <div class="hero-ticket-footer">
            HireVision AI · Model v1.0 · GIET University
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FEATURES ROW ===== -->
    <section class="features-row" aria-label="Platform features overview">
      <div class="container features-grid">
        <div class="feature-col reveal">
          <p class="feature-num">SEC. A</p>
          <h3>One form, one verdict</h3>
          <p>Sixteen inputs compressed into a single probability in under two seconds.</p>
        </div>
        <div class="feature-col reveal" style="transition-delay:0.1s;">
          <p class="feature-num">SEC. B</p>
          <h3>Remarks, not just a score</h3>
          <p>Each result includes actionable improvement suggestions tailored to your weak areas.</p>
        </div>
        <div class="feature-col reveal" style="transition-delay:0.2s;">
          <p class="feature-num">SEC. C</p>
          <h3>A record the cell can use</h3>
          <p>Coordinators can view branch-wise readiness and student standings at a glance.</p>
        </div>
      </div>
    </section>

    <!-- ===== HOW IT WORKS ===== -->
    <section class="how-it-works" aria-label="How HireVision works">
      <div class="container text-center">
        <p class="eyebrow">The Process</p>
        <h2 class="section-title">How HireVision Works</h2>
        <p class="section-sub">Four simple steps from registration to a personalized placement readiness report.</p>

        <div class="steps-row" role="list">
          ${[
            { num:'01', icon:'📝', title:'Register Account', desc:'Create a free student account using your college email address.' },
            { num:'02', icon:'📋', title:'Fill Evaluation Form', desc:'Provide academics, skills, experience, and aptitude details.' },
            { num:'03', icon:'🤖', title:'AI Analysis', desc:'Our ML model evaluates your complete profile in under 2 seconds.' },
            { num:'04', icon:'📊', title:'Get Detailed Report', desc:'Receive a placement prediction with confidence score and suggestions.' },
          ].map(s => `
            <div class="step-item reveal" role="listitem">
              <div class="step-icon" aria-hidden="true">${s.icon}</div>
              <p class="step-num">${s.num}</p>
              <h4>${s.title}</h4>
              <p>${s.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- ===== ADVANCED FEATURES ===== -->
    <section style="background:var(--color-card);border-top:1.5px solid var(--color-border);" aria-label="Advanced features">
      <div class="container text-center">
        <p class="eyebrow">Platform Capabilities</p>
        <h2 class="section-title">Advanced Features</h2>
        <p class="section-sub">Everything a student and a placement cell needs, in one intelligent system.</p>

        <div class="features-grid-adv">
          ${[
            { icon:'🧠', title:'AI-Based Prediction',         desc:'ML model trained on real placement datasets for accurate outcome forecasting.' },
            { icon:'💡', title:'Personalized Suggestions',    desc:'Targeted improvement tips based on your specific weak areas and scores.' },
            { icon:'📈', title:'Performance Dashboard',       desc:'Track your academic, skill, and experience profile in one visual overview.' },
            { icon:'📚', title:'Placement History Tracking',  desc:'Full ledger of all past predictions with confidence trends over time.' },
            { icon:'🌿', title:'Branch-Wise Analytics',       desc:'Coordinators see branch readiness rates, CGPA distribution, and more.' },
            { icon:'🛡️', title:'Admin Monitoring System',     desc:'Restricted admin panel for career services staff with full data visibility.' },
            { icon:'🔍', title:'Skill Gap Analysis',          desc:'Identifies exactly which technical and soft skills are holding you back.' },
            { icon:'🎯', title:'Interview Readiness Score',   desc:'Composite score from mock interviews, communication, and technical rounds.' },
          ].map(f => `
            <div class="feat-card reveal">
              <div class="feat-icon" aria-hidden="true">${f.icon}</div>
              <h4>${f.title}</h4>
              <p>${f.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- ===== STATS ===== -->
    <section class="stats-section" aria-label="Platform statistics">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number" data-counter="95" data-suffix="%" aria-live="polite">95%</span>
            <span class="stat-label">Prediction Accuracy</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" data-counter="5000" data-suffix="+" aria-live="polite">5,000+</span>
            <span class="stat-label">Evaluations Completed</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" data-counter="1200" data-suffix="+" aria-live="polite">1,200+</span>
            <span class="stat-label">Students Assessed</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" data-counter="50" data-suffix="+" aria-live="polite">50+</span>
            <span class="stat-label">Recruiters Supported</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== WHY CHOOSE ===== -->
    <section class="why-section" aria-label="Why choose HireVision">
      <div class="container why-grid">
        <!-- Left: evaluation card -->
        <div class="why-eval-card reveal">
          <div class="why-eval-header">
            <span class="title">System Evaluation Report</span>
            <span class="grade">A+</span>
          </div>
          <div class="why-eval-body">
            <div class="eval-row">
              <span class="key">Readiness</span>
              <span class="val"><span class="pill pill-green">Monitored</span></span>
            </div>
            <div class="eval-row">
              <span class="key">Access Level</span>
              <span class="val">Student + Admin</span>
            </div>
            <div class="eval-row">
              <span class="key">Turnaround</span>
              <span class="val">&lt; 2 seconds</span>
            </div>
            <div class="eval-row">
              <span class="key">Accuracy</span>
              <span class="val">95% validated</span>
            </div>
            <div class="eval-row">
              <span class="key">Data Security</span>
              <span class="val"><span class="pill pill-green">Secured</span></span>
            </div>
            <div class="eval-row">
              <span class="key">Overall Rating</span>
              <span class="val" style="color:var(--color-gold);font-weight:700;">A+</span>
            </div>
          </div>
          <div class="why-eval-footer">
            HireVision AI · Evaluation Sheet · v1.0 · GIET University, Gunupur
          </div>
        </div>

        <!-- Right: checklist -->
        <div class="why-right reveal" style="transition-delay:0.1s;">
          <p class="eyebrow">Why Choose HireVision</p>
          <h2 class="section-title" style="text-align:left">The only placement tool built for placement cells.</h2>
          <div class="why-list">
            ${[
              { title: 'Data-Driven Prediction',       desc: 'ML model trained on real campus placement outcomes — not guesswork.' },
              { title: 'Fast Evaluation',              desc: 'Complete evaluation with breakdown in under 2 seconds.' },
              { title: 'Personalized Recommendations', desc: 'Targeted, actionable suggestions, not generic advice.' },
              { title: 'Easy-to-use Dashboard',        desc: 'Visual overview with identity card, scores, and history.' },
              { title: 'Student and Admin Access',     desc: 'Role-based views for students and career services staff.' },
              { title: 'Placement Readiness Monitor',  desc: 'Branch-wise analytics for coordinators to act early.' },
            ].map(item => `
              <div class="why-item">
                <div class="check" aria-hidden="true">✓</div>
                <div>
                  <h5>${item.title}</h5>
                  <p>${item.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ===== TESTIMONIALS ===== -->
    <section class="testimonials-section" aria-label="Student testimonials">
      <div class="container text-center">
        <p class="eyebrow">Student Voices</p>
        <h2 class="section-title">What Students Say</h2>
        <p class="section-sub" style="color:rgba(241,236,224,0.65)">Real feedback from students who used HireVision during placement season.</p>

        <div class="testimonials-grid">
          ${[
            {
              initials: 'RS',
              name: 'Riya Sahoo',
              role: 'Student, CSE-AIML',
              text: 'HireVision told me exactly what recruiters would flag on my profile. I improved my aptitude score and cleared my backlog — I got placed two weeks later.'
            },
            {
              initials: 'AK',
              name: 'Ankit Kumar',
              role: 'Student, ECE',
              text: 'The confidence score made me take the prediction seriously. It showed 61% and identified communication as my weak area. After mock interview training, it went up to 84%.'
            },
            {
              initials: 'PC',
              name: 'Placement Coordinator',
              role: 'Career Services Office',
              text: 'As a coordinator, the branch-wise readiness panel is invaluable. I can now prioritize intervention sessions for students who need the most support before the placement drive.'
            },
          ].map(t => `
            <div class="testimonial-card reveal">
              <div class="testimonial-quote" aria-hidden="true">"</div>
              <p class="testimonial-text">${t.text}</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar" aria-hidden="true">${t.initials}</div>
                <div>
                  <p class="testimonial-name">${t.name}</p>
                  <p class="testimonial-role">${t.role}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <section class="faq-section" aria-label="Frequently asked questions">
      <div class="container text-center">
        <p class="eyebrow">Questions Answered</p>
        <h2 class="section-title">Frequently Asked Questions</h2>
        <p class="section-sub">Everything you need to know before your first evaluation.</p>

        <div class="faq-list" role="list">
          ${[
            { q: 'How accurate is HireVision?', a: 'HireVision AI achieves approximately 95% accuracy on our validation dataset, which includes records from multiple placement seasons across engineering branches.' },
            { q: 'What factors affect placement prediction?', a: 'CGPA, 10th and 12th percentage, active backlogs, programming and aptitude scores, communication, internships, projects, hackathons, certifications, and attendance all feed into the model.' },
            { q: 'Can I improve my score?', a: 'Yes — and that\'s the point. HireVision gives you specific, ranked suggestions. Act on them, re-evaluate, and track your improvement over time.' },
            { q: 'Is my data secure?', a: 'Your data is stored locally in your browser session. No personally identifiable information is shared externally without your consent.' },
            { q: 'Can placement coordinators access analytics?', a: 'Yes. Admin accounts have access to branch-wise placement analytics, CGPA distribution charts, and a student monitoring table.' },
            { q: 'Does HireVision work for all branches?', a: 'Currently optimized for engineering branches: CSE, ECE, EEE, Mechanical, and Civil. Support for MCA and MBA is in development.' },
          ].map((faq, i) => `
            <div class="faq-item" role="listitem">
              <button class="faq-question"
                      aria-expanded="false"
                      aria-controls="faq-answer-${i}"
                      id="faq-question-${i}">
                ${faq.q}
                <span class="faq-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-answer"
                   id="faq-answer-${i}"
                   role="region"
                   aria-labelledby="faq-question-${i}">
                <div class="faq-answer-inner"><p>${faq.a}</p></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section class="cta-section" aria-label="Call to action">
      <div class="container reveal">
        <p class="eyebrow">Get Started</p>
        <h2 class="section-title">Ready to Know Your Placement Potential?</h2>
        <p class="section-sub">
          Evaluate your profile and discover what recruiters might see before your next placement drive.
        </p>
        <div class="cta-actions">
          <button class="btn btn-primary" data-view="predict" style="font-size:var(--text-sm);padding:var(--space-4) var(--space-8);">
            Start Prediction →
          </button>
          <button class="btn btn-outline" data-view="auth">
            Create Account
          </button>
        </div>
      </div>
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="footer" aria-label="Site footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <div class="nav-brand" style="cursor:default;margin-bottom:var(--space-4);">
              <div class="brand-seal" style="color:var(--color-paper);border-color:var(--color-paper);">HV</div>
              <div class="nav-brand-text">
                <span class="nav-brand-eyebrow">Est. 2026</span>
                <span class="nav-brand-name">HireVision AI</span>
              </div>
            </div>
            <p>AI-powered campus placement prediction platform for students and placement coordinators at GIET University, Gunupur.</p>
            <p style="font-family:var(--font-mono);font-size:10px;color:rgba(241,236,224,0.4);margin-top:var(--space-3);">"See Your Placement Potential"</p>
          </div>

          <!-- Navigation -->
          <div class="footer-col">
            <h5>Platform</h5>
            <div class="footer-links">
              <a href="#" data-view="home">Home</a>
              <a href="#" data-view="auth">Login / Register</a>
              <a href="#" data-view="predict">Predict</a>
              <a href="#" data-view="history">History</a>
              <a href="#" data-view="dashboard">Dashboard</a>
            </div>
          </div>

          <!-- Info -->
          <div class="footer-col">
            <h5>Information</h5>
            <div class="footer-links">
              <a href="#">About HireVision</a>
              <a href="#">How it Works</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Academic Use</a>
            </div>
          </div>

          <!-- Contact -->
          <div class="footer-col">
            <h5>Contact</h5>
            <div class="footer-contact">
              <a href="mailto:hello@hirevision.ai">✉ hello@hirevision.ai</a>
              <a href="#">🏛 GIET University, Gunupur, Rayagada</a>
            </div>
            <div class="footer-social">
              <a href="#" aria-label="GitHub" title="GitHub">⌨</a>
              <a href="#" aria-label="LinkedIn" title="LinkedIn">in</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copy">
            © 2026 HireVision AI · Model v1.0 · All rights reserved
          </p>
          <p class="footer-credits">
            Crafted by Abhi, Jyoti & Shubhankar · GIET University, Gunupur, Rayagada
          </p>
        </div>
      </div>
    </footer>
  `;

  // Bind CTA buttons and footer links
  main.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const view = btn.dataset.view;
      if (view === 'predict' && !HV.currentUser) {
        showToast('Please log in to access the prediction form.', 'info');
        Router.navigate('auth');
        return;
      }
      Router.navigate(view);
    });
  });
}
