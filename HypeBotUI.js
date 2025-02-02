// HypeBotUI.js
const HypeBotUI = {
  name: 'HypeBotUI',
  template: `
    <div class="hype-bot-container" v-if="isVisible">
      <div class="hype-bot-header">
        <h2>Hype Bot Chat</h2>
        <button @click="closeHypeBotUI">X</button>
      </div>
      
      <div class="bot-selector">
        <label>Select Hype Bot: </label>
        <select v-model="selectedBotId" @change="switchHypeBot">
          <option v-for="bot in hypeBots" :key="bot.id" :value="bot.id">
            {{ bot.name }}
          </option>
        </select>
      </div>
  
      <div class="chat-window">
        <div v-for="(msg, index) in chatMessages" :key="index" class="chat-message">
          <span class="chat-role">{{ msg.role }}:</span>
          <span class="chat-content">{{ msg.content }}</span>
        </div>
      </div>
      
      <div class="chat-controls">
        <input 
          v-model="userInput" 
          type="text" 
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>
      
      <div class="add-bot-form">
        <h3>Create New Hype Bot</h3>
        <label>Name: <input v-model="newBotName" /></label>
        <label>Personality: <textarea v-model="newBotPersonality"></textarea></label>
        <label>System Prompt: <textarea v-model="newBotSystemPrompt"></textarea></label>
        <button @click="createNewBot">Add Bot</button>
      </div>
    </div>
  `,
  data() {
    return {
      isVisible: false,
      userInput: '',
      chatMessages: [],
      hypeBots: [],
      selectedBotId: null,
      newBotName: '',
      newBotPersonality: '',
      newBotSystemPrompt: ''
    };
  },
  created() {
    // Load existing hype bots from the manager
    this.hypeBots = this.$store.hypeBotManager.getAllHypeBots();
    if (this.hypeBots.length) {
      this.selectedBotId = this.hypeBots[0].id;
    }
    // Watch for changes to the visibility flag in the store
    this.$watch(
      () => this.$store.state.showHypeBotWindow,
      (newValue) => {
        this.isVisible = newValue;
      },
      { immediate: true }
    );
  },
  methods: {
    closeHypeBotUI() {
      this.$store.commit('toggleHypeBotWindow', false);
    },
    switchHypeBot() {
      this.$store.hypeBotManager.setActiveHypeBot(this.selectedBotId);
      this.chatMessages.push({
        role: 'system',
        content: `Switched to hype bot: ${this.selectedBotId}`
      });
    },
    async sendMessage() {
      if (!this.userInput.trim()) return;
      // Append user message
      this.chatMessages.push({
        role: 'user',
        content: this.userInput
      });
      // Send message via the manager
      const botReply = await this.$store.hypeBotManager.sendMessageToHypeBot(this.userInput);
      // Append bot reply
      this.chatMessages.push({
        role: 'assistant',
        content: botReply
      });
      // Clear the input field
      this.userInput = '';
    },
    createNewBot() {
      if (!this.newBotName || !this.newBotPersonality || !this.newBotSystemPrompt) {
        alert('All fields are required!');
        return;
      }
      const id = this.newBotName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
      this.$store.hypeBotManager.addHypeBot({
        id,
        name: this.newBotName,
        personality: this.newBotPersonality,
        systemPrompt: this.newBotSystemPrompt
      });
      this.hypeBots = this.$store.hypeBotManager.getAllHypeBots();
      this.newBotName = '';
      this.newBotPersonality = '';
      this.newBotSystemPrompt = '';
      alert('New hype bot created!');
    }
  }
};

export default HypeBotUI;
