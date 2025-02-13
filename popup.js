document.addEventListener('DOMContentLoaded', async () => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const alertBox = document.getElementById('alert');
  const alertMessage = document.getElementById('alertMessage');
  const loginSection = document.getElementById('loginSection');
  const logoutSection = document.getElementById('logoutSection');
  const userDataSection = document.getElementById('userDataSection');
  const displayNameElement = document.getElementById('displayName');
  const userNameElement = document.getElementById('userName');
  const mineAddress = document.getElementById('mineAddress');
  const mineAmount = document.getElementById('mineAmount');
  const totalGENY = document.getElementById('totalGENY');
  const displayAvatar = document.getElementById('displayAvatar');
  const userBio = document.getElementById('userBio');
  const followersCount = document.getElementById('followersCount');
  const followingCount = document.getElementById('followingCount');
  const userNameDisplayLogout = document.getElementById('userNameDisplay');
  const spinner = document.getElementById('spinner');

  const browserAPI = window.chrome || window.browser;

  /**
   * Updates UI sections based on user login state
   */
  const updateUI = (isLoggedIn) => {
    loginSection.style.display = isLoggedIn ? 'none' : 'block';
    logoutSection.style.display = isLoggedIn ? 'block' : 'none';
    userDataSection.style.display = isLoggedIn ? 'block' : 'none';
  };

  /**
   * Shortens a wallet address
   */
  const shortenAddress = (address) => {
    return address.length < 10 ? address : `${address.slice(0, 6)}....${address.slice(-4)}`;
  };

  /**
   * Displays an alert message
   */
  const showAlert = (message, type) => {
    alertMessage.textContent = message;
    alertBox.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning');
    alertBox.classList.add(`alert-${type}`);
    alertBox.style.display = 'block';

    setTimeout(() => {
      alertBox.classList.add('d-none');
      alertBox.style.display = 'none';
    }, 5000);
  };

  /**
   * Loads user data into UI
   */
  const loadUserData = (data) => {
    if (data.isTokenHolder && data.walletAddress) {
      displayNameElement.textContent = data.displayName;
      userNameElement.textContent = data.userName;
      mineAddress.textContent = shortenAddress(data.walletAddress);
      mineAmount.textContent = data.tokenAmount;
      totalGENY.textContent = '100B $GENY';
      displayAvatar.src = data.displayAvatar;
      userBio.textContent = data.userBio;
      followersCount.textContent = data.followersCount;
      followingCount.textContent = data.followingCount;
      if (userNameDisplayLogout) userNameDisplayLogout.textContent = data.displayName;
      updateUI(true);
    } else {
      updateUI(false);
    }
  };

  /**
   * Listen for storage update event
   */
  browserAPI.runtime.onMessage.addListener((message) => {
    if (message.type === 'userDataUpdated') {
      console.log("User data updated, reloading UI...");
      browserAPI.storage.sync.get(null, (data) => {
        loadUserData(data);
      });
    }
  });

  /**
   * Initialize UI: Load from storage
   */
  browserAPI.storage.sync.get(null, (data) => {
    if (data.walletAddress) {
      loadUserData(data);
    } else {
      updateUI(false);
    }
  });

  /**
   * Handles wallet connection and validation.
   */
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'WALLET_CONNECTED') {
      const { walletAddress } = event.data;
      console.log('Wallet Address received:', walletAddress);

      if (walletAddress) {
        spinner.classList.remove('d-none');
        loginBtn.disabled = true;
        loginBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...`;

        browserAPI.runtime.sendMessage({ type: 'checkTokenHolder', walletAddress });
      } else {
        showAlert('Invalid wallet address.', 'danger');
      }
    }
  });

  /**
   * Login button: Opens wallet connection
   */
  loginBtn.addEventListener('click', () => {
    spinner.classList.remove('d-none');
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...`;

    const returnUrl = window.location.href;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://genyframe.xyz/wallet-redirection';
    form.target = 'WalletRedirectionWindow';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'returnUrl';
    input.value = returnUrl;
    form.appendChild(input);

    document.body.appendChild(form);
    window.open('', 'WalletRedirectionWindow', 'width=600,height=600');
    form.submit();
    document.body.removeChild(form);
  });

  /**
   * Logout button: Clears storage & resets UI
   */
  logoutBtn.addEventListener('click', () => {
    browserAPI.storage.sync.remove([
      'userName', 'displayName', 'isTokenHolder', 'walletAddress',
      'tokenAmount', 'displayAvatar', 'userBio', 'followersCount', 'followingCount'
    ], () => {
      showAlert('Logged out successfully.', 'warning');
      updateUI(false);
    });
  });
});
