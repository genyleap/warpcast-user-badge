(() => {
  'use strict';

  const SPAM_ICON_CLASS = "spam-risk-icon";
  const usernameSelector = "a.relative.font-semibold";

  // Mapping risk values to shield SVG icons, colors, and tooltips.
  const spamMapping = {
    0: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shield-slash-fill" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M1.093 3.093c-.465 4.275.885 7.46 2.513 9.589a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.3 11.3 0 0 0 1.733-1.525zm12.215 8.215L3.128 1.128A61 61 0 0 1 5.073.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.483 3.626-.332 6.491-1.551 8.616m.338 3.046-13-13 .708-.708 13 13z"/>
      </svg>`,
      color: "#dc3545",
      title: "High Risk – This account exhibits behaviors that are highly indicative of risk."
    },
    1: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shield-fill-exclamation" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m-.55 8.502L7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0M8.002 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
      </svg>`,
      color: "#fd7e14",
      title: "Moderate Risk – This account shows some behaviors that may be concerning."
    },
    2: {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shield-fill-check" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793z"/>
      </svg>`,
      color: "#198754",
      title: "Low Risk – This account is considered safe."
    }
  };

     // Inject restriction message for non-token holders
     function injectRestrictionHeader() {
       const header = document.createElement('div');

       header.innerHTML = `
         <div id="access-restricted-header" style="background-color: #f3f4f6; color: #1f2937; padding: 12px 20px; text-align: center; font-size: 15px; top: 0; left: 0; right: 0; z-index: 9999; margin-left: -110px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #e5e7eb;">
           <img src="https://labels.genyframe.xyz/assets/icon.png" alt="Warning" style="width: 22px; height: 22px; margin-right: 12px;" />
           <a href="https://app.uniswap.org/swap?outputCurrency=0x0D20690154Ab025a5901AeACd304080CaA7D28B8&chain=base" target="_blank" style="color: #4f46e5; font-weight: 600; text-decoration: none; margin-left: 8px;">Unlock exclusive access</a>! To continue, hold at least 10,000,000 $GENY tokens.
         </div>
       `;

       document.body.prepend(header);
     }

  const riskCache = new Map();

  function injectCustomCSS() {
    const style = document.createElement("style");
    style.id = "spam-icon-style";
    style.textContent = `
      .${SPAM_ICON_CLASS} {
        display: inline-flex;
        vertical-align: middle;
        margin-left: 0.5em;
        cursor: default;
        position: relative;
      }
      .${SPAM_ICON_CLASS} svg {
        fill: currentColor;
        width: 1.2em;
        height: 1.2em;
      }
      .${SPAM_ICON_CLASS}::after {
        content: attr(title);
        position: absolute;
        bottom: 125%;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.75);
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease-in-out;
      }
      .${SPAM_ICON_CLASS}:hover::after {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  async function fetchFid(username) {
    const endpoint = `https://hub.pinata.cloud/v1/userNameProofByName?name=${encodeURIComponent(username)}`;
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      return data.fid || null;
    } catch (error) {
      console.error("Error fetching fid for", username, error);
      return null;
    }
  }

  async function fetchSpamLabel(fid) {
    const endpoint = `https://labels.genyframe.xyz/database?fid=${encodeURIComponent(fid)}`;
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data && data.spamRecord?.label_value in spamMapping) {
        return spamMapping[data.spamRecord.label_value];
      }
      return {
        svg: spamMapping[1].svg,
        color: "#6c757d",
        title: "Risk status could not be determined."
      };
    } catch (error) {
      console.error("Error fetching risk label for", fid, error);
      return null;
    }
  }

  function addSpamIcon(usernameAnchor, labelData) {
    if (!usernameAnchor || !labelData) return;

    // Avoid duplicate insertion if the next sibling is already the icon.
    if (usernameAnchor.nextElementSibling?.classList.contains(SPAM_ICON_CLASS)) {
      return;
    }

    const span = document.createElement("span");
    span.classList.add(SPAM_ICON_CLASS);
    span.setAttribute("title", labelData.title);
    span.style.color = labelData.color;
    span.innerHTML = labelData.svg;

    // Insert the badge directly after the username link.
    usernameAnchor.insertAdjacentElement("afterend", span);
  }

  async function processUsernameAnchor(usernameAnchor) {
    if (!usernameAnchor) return;

    const username = usernameAnchor.getAttribute("href")?.match(/^\/([^\/]+)$/)?.[1];
    if (!username) return;

    let labelData;
    if (riskCache.has(username)) {
      labelData = riskCache.get(username);
    } else {
      const fid = await fetchFid(username);
      if (fid !== null) {
        labelData = await fetchSpamLabel(fid);
        if (labelData) {
          riskCache.set(username, labelData);
        }
      }
    }

    if (labelData) {
      addSpamIcon(usernameAnchor, labelData);
    }
  }

  function processAllUsernameAnchors() {
    const usernameAnchors = document.querySelectorAll(usernameSelector);
    usernameAnchors.forEach(processUsernameAnchor);
  }

  function observeUsernameAnchors() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches(usernameSelector)) {
              processUsernameAnchor(node);
            } else {
              node.querySelectorAll(usernameSelector).forEach(processUsernameAnchor);
            }
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Initialize script
   async function init() {
     injectCustomCSS();
     const isTokenHolder = await new Promise((resolve) => {
       chrome.storage.sync.get("isTokenHolder", function (data) {
         resolve(data.isTokenHolder || false);
       });
     });

     if (!isTokenHolder) {
       injectRestrictionHeader(); // Show restriction header if not a token holder
     } else {
       processAllUsernameAnchors(); // Process usernames and display spam icons for token holders
       observeUsernameAnchors();
     }
   }

   if (document.readyState === "loading") {
     document.addEventListener("DOMContentLoaded", init);
   } else {
     init();
   }
 })();
