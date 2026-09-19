
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = $(".menu-btn");
  const mobileMenu = $(".mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      document.body.classList.toggle("menu-open");
      menuBtn.textContent = mobileMenu.classList.contains("open") ? "×" : "☰";
    });
    $$(".mobile-menu a").forEach(a => a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      document.body.classList.remove("menu-open");
      menuBtn.textContent = "☰";
    }));
  }

  const path = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a, .mobile-menu a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
  }, {threshold:.12});
  $$(".reveal").forEach(el => observer.observe(el));

  const toast = (message) => {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
    t.textContent = message; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3200);
  };
  window.MSA = {toast};

  // Workshop enquiry buttons
  $$(".js-workshop").forEach(btn => btn.addEventListener("click", () => {
    const name = btn.dataset.name || "Workshop";
    const msg = encodeURIComponent(`Hi Max Spotlight Atelier, I’d like to enquire about the ${name} workshop.`);
    window.open(`https://wa.me/919960628820?text=${msg}`, "_blank");
  }));

  // Enrollment wizard
  const form = $("#enrollmentForm");
  if (form) {
    const steps = $$(".form-step", form);
    const stepLabels = $$(".step", form);
    let current = 0;

    const selected = () => {
      const program = $('input[name="program"]:checked', form);
      const batch = $('input[name="batch"]:checked', form);
      return {
        program: program ? program.value : "Not selected",
        batch: batch ? batch.value : "Not selected",
        amount: program ? Number(program.dataset.price || 0) : 0
      };
    };
    const render = () => {
      steps.forEach((s,i)=>s.classList.toggle("active",i===current));
      stepLabels.forEach((s,i)=>s.classList.toggle("active",i===current));
      const back = $("#backStep"), next = $("#nextStep");
      if (back) back.style.visibility = current===0 ? "hidden" : "visible";
      if (next) next.textContent = current===steps.length-1 ? "Submit Enrollment" : "Continue";
      updateSummary();
    };
    const updateSummary = () => {
      const s = selected();
      const name = $("#studentName")?.value || "Your name";
      $("#summaryName") && ($("#summaryName").textContent = name);
      $("#summaryProgram") && ($("#summaryProgram").textContent = s.program);
      $("#summaryBatch") && ($("#summaryBatch").textContent = s.batch);
      $("#summaryAmount") && ($("#summaryAmount").textContent = s.amount ? `₹${s.amount.toLocaleString("en-IN")}` : "—");
    };
    $$('input,select,textarea',form).forEach(el => el.addEventListener("input", updateSummary));
    $("#nextStep")?.addEventListener("click", () => {
      if (current < steps.length-1) {
        const active = steps[current];
        const required = $$("[required]", active);
        for (const field of required) {
          if (!field.value && field.type !== "radio") { field.focus(); toast("Please complete the required details."); return; }
        }
        if (active.querySelectorAll('input[type="radio"][required]').length && !active.querySelector('input[type="radio"]:checked')) {
          toast("Please choose an option to continue."); return;
        }
        current++; render();
      } else {
        if (!$("#terms")?.checked) { toast("Please accept the enrollment terms."); return; }
        const data = Object.fromEntries(new FormData(form).entries());
        const ref = "MSA-" + Math.random().toString(36).slice(2,7).toUpperCase();
        localStorage.setItem("msaEnrollment", JSON.stringify({...data, reference:ref, createdAt:new Date().toISOString()}));
        $("#successRef").textContent = ref;
        $("#successModal").classList.add("open");
      }
    });
    $("#backStep")?.addEventListener("click",()=>{ if(current>0){current--;render();} });
    $$('input[name="program"]').forEach(r=>r.addEventListener("change",updateSummary));
    render();
  }

  $$(".modal-close, [data-close-modal]").forEach(btn => btn.addEventListener("click", () => {
    btn.closest(".modal")?.classList.remove("open");
  }));
  $$(".modal").forEach(m => m.addEventListener("click", e => {
    if(e.target===m) m.classList.remove("open");
  }));
});
