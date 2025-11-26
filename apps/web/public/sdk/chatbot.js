
(function() {
  function initChatbot() {
    // Get script tag and extract configuration
    var scriptTag = document.currentScript || document.querySelector('script[data-agent-id]');
    if (!scriptTag) {
      console.error('Zypher Chatbot: Script tag with data-agent-id not found.');
      return;
    }

    var agentId = scriptTag.getAttribute('data-agent-id');
    var apiKey = scriptTag.getAttribute('data-api-key');

    if (!agentId) {
      console.error('Zypher Chatbot: data-agent-id attribute is missing.');
      return;
    }

    var rootId = scriptTag.getAttribute('data-root-id') || 'zypher-chatbot-root';
    
    // Extract base URL from script source
    var scriptSrc = scriptTag.src;
    var baseUrl = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;
    window.ZYPHER_BASE_URL = baseUrl;
    console.log('Zypher Chatbot: Using base URL:', baseUrl);
    
    // Ensure root element exists or create it
    var targetElement = document.getElementById(rootId);
    if (!targetElement) {
      targetElement = document.createElement('div');
      targetElement.id = rootId;
      document.body.appendChild(targetElement);
      console.log('Zypher Chatbot: Created root element with id "' + rootId + '"');
    }

    // Load the main SDK bundle (React is bundled inside)
    function loadSDK() {
      var sdkScript = document.createElement('script');
      sdkScript.src = baseUrl + '/sdk/zypher-chatbot-sdk.js';
      sdkScript.onload = function() {
        console.log('Zypher Chatbot SDK script loaded');
        if (window.ZypherChatbotSDK && window.ZypherChatbotSDK.init) {
          window.ZypherChatbotSDK.init(agentId, rootId, apiKey, baseUrl);
        } else {
          console.error('Zypher Chatbot: SDK initialization function not found. window.ZypherChatbotSDK:', window.ZypherChatbotSDK);
        }
      };
      sdkScript.onerror = function() {
        console.error('Zypher Chatbot: Failed to load SDK script from ' + baseUrl + '/sdk/zypher-chatbot-sdk.js');
      };
      document.head.appendChild(sdkScript);
    }

    loadSDK();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
