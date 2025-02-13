function formatTokenAmount(amount) {
  if (!amount || isNaN(amount)) return "0"; // Handle edge cases
  return Number(amount).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'checkTokenHolder') {
    const walletAddress = message.walletAddress;

    fetch(`https://genyframe.xyz/tokenHolder?walletAddress=${encodeURIComponent(walletAddress)}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === '1') {
          const rawTokenAmount = parseFloat(data.result);
          const formattedTokenAmount = formatTokenAmount(rawTokenAmount);

          console.log(`Raw Token Amount: ${rawTokenAmount}`);
          console.log(`Formatted Token Amount: ${formattedTokenAmount}`);

          const userData = {
            isTokenHolder: true,
            tokenAmount: formattedTokenAmount,
            rawTokenAmount: rawTokenAmount,
            walletAddress: walletAddress,
            displayAvatar: data.displayAvatar,
            userName: data.userName,
            displayName: data.displayName,
            userBio: data.userBio,
            followersCount: data.followersCount,
            followingCount: data.followingCount
          };

          // Store validated data
          chrome.storage.sync.set(userData, () => {
            console.log('Token holder data stored successfully.');
            // Notify popup that data is ready
            chrome.runtime.sendMessage({ type: 'userDataUpdated' });
          });

          sendResponse({ success: true, ...userData });

        } else {
          console.log('User does not have sufficient tokens.');

          const emptyData = {
            isTokenHolder: false,
            tokenAmount: "0",
            rawTokenAmount: 0,
            walletAddress: walletAddress
          };

          chrome.storage.sync.set(emptyData, () => {
            console.log('Token holder status updated to false.');
            chrome.runtime.sendMessage({ type: 'userDataUpdated' });
          });

          sendResponse({ success: false, message: data.message || 'Insufficient balance.', tokenAmount: "0" });
        }
      })
      .catch(error => {
        console.error("Error checking token holder status:", error);
        sendResponse({ success: false, message: 'Error contacting the server. Please try again later.' });
      });

    return true; // Keep the response asynchronous
  }
});
