// HypeBotManager.js
export default class HypeBotManager {
  constructor(store) {
    this.store = store;
    this.hypeBots = [
      {
        id: 'goosebot',
        name: 'Goose Bot',
        personality: 'A loud goose who honks constantly. Very hyped!',
        systemPrompt: 'You are a goose that loves to hype everyone up!'
      }
    ];
    this.activeHypeBotId = 'goosebot';
  }
  
  addHypeBot({ id, name, personality, systemPrompt }) {
    this.hypeBots.push({ id, name, personality, systemPrompt });
  }
  
  getAllHypeBots() {
    return this.hypeBots;
  }
  
  setActiveHypeBot(botId) {
    this.activeHypeBotId = botId;
  }
  
  getActiveHypeBot() {
    return this.hypeBots.find(bot => bot.id === this.activeHypeBotId);
  }
  
  buildRequestMessages(userMessage) {
    const activeBot = this.getActiveHypeBot();
    return [
      {
        role: 'system',
        content: activeBot.systemPrompt
      },
      {
        role: 'user',
        content: userMessage
      }
    ];
  }
  
  async sendMessageToHypeBot(userMessage) {
    const messages = this.buildRequestMessages(userMessage);
    const apiUrl = this.store.state.currentAPIEndpoint;
    const payload = {
      messages: messages
      // include other parameters as needed
    };
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Hype Bot request failed');
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response from Hype Bot.';
    } catch (err) {
      console.error(err);
      return 'Sorry, something went wrong with the Hype Bot request.';
    }
  }
}
