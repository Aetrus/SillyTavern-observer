// HypeBotExtension.js
import HypeBotUI from './HypeBotUI.js';
import HypeBotManager from './HypeBotManager.js';
import { renderExtensionTemplateAsync } from '../../../extensions.js';

// Use a MODULE_NAME that reflects your folder name.
const MODULE_NAME = 'third-party/Extension-Goose';

const HypeBotExtension = {
  init(store, app) {
    // Instantiate the manager to handle hype bot logic
    const hypeBotManager = new HypeBotManager(store);

    // Register the HypeBot UI component with the Vue app
    app.component('HypeBotUI', HypeBotUI);

    // Add an extension button to the extensions dropdown
    store.commit('addExtensionButton', {
      label: 'Goose',
      onClick: () => {
        store.commit('toggleHypeBotWindow', true);
      }
    });

    // Expose the hypeBotManager on the store so that your UI component can access it
    store.hypeBotManager = hypeBotManager;

    // Load and append the settings template and bot bar using jQuery as in the original extension
    jQuery(async () => {
      // If extension_settings.hypebot is not set, initialize it with default settings.
      if (!window.extension_settings || !extension_settings.hypebot) {
        extension_settings.hypebot = {
          enabled: false,
          name: 'Goose'
        };
      }
      // Merge stored settings with defaults
      const settings = Object.assign({ enabled: false, name: 'Goose' }, extension_settings.hypebot);

      // Find the container for settings; try 'hypebot_container' or fallback to 'extensions_settings2'
      const $container = jQuery(document.getElementById('hypebot_container') ?? document.getElementById('extensions_settings2'));
      if ($container.length) {
        $container.append(await renderExtensionTemplateAsync(MODULE_NAME, 'settings'));
      }

      // Create the hypeBotBar element and append it to the send form.
      // This bar is used by the extension to display dynamic status.
      const $sendForm = jQuery('#send_form');
      if ($sendForm.length) {
        window.hypeBotBar = jQuery('<div id="hypeBotBar"></div>').toggle(settings.enabled);
        $sendForm.append(window.hypeBotBar);
      }

      // Set up event listeners for the settings UI
      jQuery('#hypebot_enabled').prop('checked', settings.enabled).on('input', () => {
        settings.enabled = jQuery('#hypebot_enabled').prop('checked');
        window.hypeBotBar.toggle(settings.enabled);
        // Abort any pending requests if the bot is disabled
        if (window.abortController) {
          window.abortController.abort();
        }
        Object.assign(extension_settings.hypebot, settings);
        // Save settings (debounced)
        if (typeof saveSettingsDebounced === 'function') {
          saveSettingsDebounced();
        }
      });

      jQuery('#hypebot_name').val(settings.name).on('input', () => {
        settings.name = String(jQuery('#hypebot_name').val());
        Object.assign(extension_settings.hypebot, settings);
        if (typeof saveSettingsDebounced === 'function') {
          saveSettingsDebounced();
        }
      });

      // Register event listeners for chat events as in the original extension
      const eventSource = window.eventSource;
      const event_types = window.event_types;
      function onChatEvent(clear) {
        if (clear && window.hypeBotBar) {
          window.hypeBotBar.html('');
        }
        if (window.abortController) {
          window.abortController.abort();
        }
        // You may add a debounced generate function here if needed.
      }
      eventSource.on(event_types.CHAT_CHANGED, () => onChatEvent(true));
      eventSource.on(event_types.MESSAGE_DELETED, () => onChatEvent(true));
      eventSource.on(event_types.MESSAGE_EDITED, () => onChatEvent(true));
      eventSource.on(event_types.MESSAGE_SENT, () => onChatEvent(false));
      eventSource.on(event_types.MESSAGE_RECEIVED, () => onChatEvent(false));
      eventSource.on(event_types.MESSAGE_SWIPED, () => onChatEvent(false));
    });
  }
};

export default HypeBotExtension;
