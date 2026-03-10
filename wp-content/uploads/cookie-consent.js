(function () {
    var STORAGE_KEY = "msol_cookie_consent_v2";
    var COOKIE_KEY = "msol_cookie_consent_v2";
    var ONE_YEAR_SECONDS = 31536000;

    function readStoredConsent() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (err) {
            return null;
        }
    }

    function writeStoredConsent(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (err) {
            // Ignore storage errors.
        }

        document.cookie = COOKIE_KEY + "=" + value + "; max-age=" + ONE_YEAR_SECONDS + "; path=/; SameSite=Lax";
    }

    function removeComplianzElements() {
        var selectors = [
            "#cmplz-cookiebanner-container",
            "#cmplz-manage-consent",
            ".cmplz-cookiebanner",
            ".cmplz-manage-consent"
        ];

        selectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (el) {
                el.remove();
            });
        });
    }

    function clearGoogleCookies() {
        var cookieNames = ["_ga", "_gid", "_gat", "_ga_5WQRBH598V"];
        var host = location.hostname;
        var parts = host.split(".");
        var domains = [host];

        if (parts.length > 2) {
            domains.push("." + parts.slice(-2).join("."));
        }

        cookieNames.forEach(function (name) {
            domains.forEach(function (domain) {
                document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + domain + "; SameSite=Lax";
                document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
            });
        });
    }

    function runBlockedGoogleScripts() {
        var scripts = document.querySelectorAll(
            'script[type="text/plain"][data-service="google-analytics"], script[type="text/plain"][data-category="statistics"]'
        );

        scripts.forEach(function (script) {
            if (script.dataset.executed === "1") {
                return;
            }

            var runnable = document.createElement("script");
            var source = script.getAttribute("data-src") || script.getAttribute("data-cmplz-src");

            if (source) {
                runnable.src = source;
                if (script.hasAttribute("async")) {
                    runnable.async = true;
                }
                if (script.hasAttribute("defer")) {
                    runnable.defer = true;
                }
            } else {
                runnable.text = script.textContent || "";
            }

            document.head.appendChild(runnable);
            script.dataset.executed = "1";
        });
    }

    function hideBanner() {
        var banner = document.getElementById("msol-cookie-banner");
        if (banner) {
            banner.hidden = true;
        }
    }

    function acceptCookies() {
        writeStoredConsent("accepted");
        runBlockedGoogleScripts();
        hideBanner();
    }

    function denyCookies() {
        writeStoredConsent("denied");
        clearGoogleCookies();
        hideBanner();
    }

    function createBanner() {
        if (document.getElementById("msol-cookie-banner")) {
            return;
        }

        var wrapper = document.createElement("section");
        wrapper.id = "msol-cookie-banner";
        wrapper.className = "msol-cookie-banner";
        wrapper.setAttribute("role", "dialog");
        wrapper.setAttribute("aria-live", "polite");
        wrapper.setAttribute("aria-label", "Cookie settings");

        wrapper.innerHTML = [
            '<h2 class="msol-cookie-banner__title">Cookies Notice</h2>',
            '<p class="msol-cookie-banner__text">We use basic Google cookies (Google Analytics) to understand traffic and improve this website.</p>',
            '<div class="msol-cookie-banner__links">',
            '<a href="/privacy-policy/">Privacy Policy</a>',
            '<a href="/cookie-policy-eu/">Cookie Policy</a>',
            '<a href="/terms-of-use/">Terms of Use</a>',
            "</div>",
            '<div class="msol-cookie-banner__actions">',
            '<button type="button" class="msol-cookie-btn msol-cookie-btn--accept" id="msol-cookie-accept">Accept</button>',
            '<button type="button" class="msol-cookie-btn msol-cookie-btn--deny" id="msol-cookie-deny">Deny</button>',
            "</div>"
        ].join("");

        document.body.appendChild(wrapper);

        var acceptBtn = document.getElementById("msol-cookie-accept");
        var denyBtn = document.getElementById("msol-cookie-deny");

        if (acceptBtn) {
            acceptBtn.addEventListener("click", acceptCookies);
        }
        if (denyBtn) {
            denyBtn.addEventListener("click", denyCookies);
        }
    }

    function initConsentBanner() {
        removeComplianzElements();

        var storedConsent = readStoredConsent();

        if (storedConsent === "accepted") {
            runBlockedGoogleScripts();
            return;
        }

        if (storedConsent === "denied") {
            clearGoogleCookies();
            return;
        }

        createBanner();
    }

    document.addEventListener("DOMContentLoaded", initConsentBanner);
})();
