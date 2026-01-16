(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const toneZones = document.querySelectorAll(".tone-zone[data-tone]");
  const tones = ["ember", "oxide", "cinder"];
  let toneLocked = localStorage.getItem("wepickaxe-tone-lock") === "true";
  let activeTone = root.getAttribute("data-tone") || "ember";

  const applyTone = (tone, persist = false) => {
    root.setAttribute("data-tone", tone);
    if (persist) {
      localStorage.setItem("wepickaxe-tone", tone);
    }
  };

  const setToggleState = () => {
    if (!toggle) {
      return;
    }
    toggle.setAttribute("aria-pressed", toneLocked ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      toneLocked ? "Unlock palette" : "Lock palette and cycle"
    );
  };

  const storedTone = localStorage.getItem("wepickaxe-tone");
  if (storedTone) {
    applyTone(storedTone, false);
    activeTone = storedTone;
  } else {
    applyTone(activeTone, false);
  }

  setToggleState();

  if (toggle) {
    toggle.addEventListener("click", () => {
      const currentTone = root.getAttribute("data-tone") || "ember";
      const nextTone = tones[(tones.indexOf(currentTone) + 1) % tones.length];
      toneLocked = !toneLocked;
      localStorage.setItem("wepickaxe-tone-lock", toneLocked ? "true" : "false");
      if (!toneLocked) {
        localStorage.removeItem("wepickaxe-tone");
        applyTone(activeTone, false);
      } else {
        applyTone(nextTone, true);
        activeTone = nextTone;
      }
      setToggleState();
    });
  }

  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "";
      const email = data.get("email") || "";
      const company = data.get("company") || "";
      const message = data.get("message") || "";
      const subject = encodeURIComponent("WePickaxe inquiry");
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`
      );
      window.location.href = `mailto:hello@wepickaxe.com?subject=${subject}&body=${body}`;
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  if (!toneZones.length) {
    return;
  }

  const toneObserver = new IntersectionObserver(
    (entries) => {
      if (toneLocked) {
        return;
      }
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) {
        return;
      }
      const nextTone = visible.target.dataset.tone;
      if (nextTone && nextTone !== activeTone) {
        activeTone = nextTone;
        applyTone(nextTone, false);
      }
    },
    { threshold: [0.2, 0.45, 0.6] }
  );

  toneZones.forEach((zone) => toneObserver.observe(zone));
})();
