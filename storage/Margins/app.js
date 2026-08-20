// Initialize Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

/**
 * Radio navigation handler across TM Margin screens
 */
function setupTmMarginRadioNavigation() {
  const radioButtons = document.querySelectorAll('input[name="tm_margin_filter"]');
  radioButtons.forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "total" && !window.location.pathname.endsWith("cm-margin.html")) {
        window.location.href = "cm-margin.html";
      } else if (e.target.value === "security" && !window.location.pathname.endsWith("security-margin.html")) {
        window.location.href = "security-margin.html";
      }
    });
  });
}

/**
 * Sidebar MARGINS Toggle Setup (Dashboard page)
 */
function setupMarginsToggle() {
  const toggleBtn = document.getElementById("margins-toggle-btn");
  const submenu = document.getElementById("margins-submenu");
  const toggleIcon = document.getElementById("margins-toggle-icon");

  if (!toggleBtn || !submenu || !toggleIcon) return;

  toggleIcon.style.transform = "rotate(180deg)";

  toggleBtn.addEventListener("click", () => {
    const isHidden = submenu.classList.contains("hidden");
    if (isHidden) {
      submenu.classList.remove("hidden");
      toggleIcon.style.transform = "rotate(0deg)";
    } else {
      submenu.classList.add("hidden");
      toggleIcon.style.transform = "rotate(180deg)";
    }
  });
}

/**
 * Dashboard Segment Tabs (CM / FO / CD / CO)
 */
function setupMarginTabs() {
  const tabButtons = document.querySelectorAll(".margin-tab-btn");
  const tabContent = document.getElementById("margin-tab-content");

  if (!tabButtons.length || !tabContent) return;

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const segment = btn.dataset.segment;
      tabContent.innerHTML = `<span class="text-[#800000] text-[11px] font-semibold">No Data Available for ${segment}</span>`;
    });
  });
}

/**
 * CM Page Level 2 Controls (cm-margin.html)
 */
function setupCmPageControls() {
  const clientSelect = document.getElementById("client-code-select");
  const btnClearAll = document.getElementById("btn-clear-all");
  const btnShow = document.getElementById("btn-show");

  if (btnClearAll && clientSelect) {
    btnClearAll.addEventListener("click", () => {
      clientSelect.selectedIndex = 0;
    });
  }

  if (btnShow && clientSelect) {
    btnShow.addEventListener("click", () => {
      const selectedValue = clientSelect.value;
      if (!selectedValue) {
        alert("Please select a Client Code first.");
        return;
      }
      console.log("Selected Client Code for query:", selectedValue);
    });
  }
}

// Lifecycle Init
document.addEventListener("DOMContentLoaded", () => {
  setupMarginsToggle();
  setupMarginTabs();
  setupCmPageControls();
  setupTmMarginRadioNavigation();
});