# AppIo.AI - The Ultimate Construction AI Assistant

> Your expert AI assistant for all construction trades. Voice-powered, vision-enabled, and always learning.

## 🎯 Vision

AppIo.AI is building the world's largest construction knowledge database - an AI-powered assistant that works like Alexa or Siri, but specialized for construction professionals across all trades. From electricians to plumbers, carpenters to HVAC technicians, AppIo.AI provides instant expert guidance, code compliance checks, and intelligent visual analysis right from the job site.

## ✨ Features

### 🎤 Voice AI Assistant
- Natural conversation with construction-specialized AI
- Ask questions about codes, regulations, and best practices
- Get material recommendations and calculations
- Voice-activated for hands-free operation (perfect for job sites)
- Powered by VAPI for real-time voice interaction

### 📸 Photo Analysis
- AI-powered visual analysis of construction work
- Wire gauge and type identification
- Electrical panel reading and labeling
- Code compliance verification
- Safety concern detection
- Installation quality assessment
- Powered by Claude 3.5 Sonnet for advanced vision capabilities

### 📚 NEC Code Lookup
- Fast search through National Electrical Code
- Bookmark frequently used codes
- Voice or text search
- Expandable to other construction codes and regulations

### 🚀 Coming Soon
- Job tracking and management
- Material cost estimation
- Project collaboration tools
- Multi-trade support (plumbing, HVAC, carpentry, etc.)
- Offline mode for remote job sites

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router & TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Zustand
- **Voice AI**: VAPI SDK
- **Vision AI**: Anthropic Claude API
- **Deployment**: Vercel-ready

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Jenkintownelectricity_time_saver.git
cd Jenkintownelectricity_time_saver

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔑 API Keys Setup

To enable full functionality, you'll need:

1. **VAPI API Key** - For voice AI features
   - Sign up at [vapi.ai](https://vapi.ai)
   - Get your public key
   - Add to environment variables or settings

2. **Anthropic API Key** - For photo analysis
   - Sign up at [anthropic.com](https://anthropic.com)
   - Get your API key
   - Add to environment variables or settings

Create a `.env.local` file:
```env
NEXT_PUBLIC_VAPI_KEY=your_vapi_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

## 🎨 Design Philosophy

- **Mobile-First**: Optimized for smartphones and tablets
- **Touch-Friendly**: Large buttons perfect for gloved hands
- **High Contrast**: Dark mode optimized for outdoor visibility
- **Fast & Responsive**: Built with performance in mind
- **Professional**: Clean, modern UI that inspires confidence

## 📱 Usage

1. **Voice Assistant**: Tap the large "Talk to AI Assistant" button to start a voice conversation
2. **Photo Analysis**: Take or upload photos of your work for instant AI analysis
3. **NEC Lookup**: Search for electrical codes by number or keyword
4. **Bookmarks**: Save frequently used codes for quick access

## 🗺️ Roadmap

- [ ] Integrate existing NEC codes database
- [ ] Add settings page for API key management
- [ ] Implement job tracking functionality
- [ ] Add support for additional construction trades
- [ ] Create offline mode with local storage
- [ ] Build material cost estimation tool
- [ ] Add team collaboration features
- [ ] Integrate with construction project management tools
- [ ] Expand to international building codes
- [ ] Mobile app versions (iOS & Android)

## 🤝 Contributing

AppIo.AI is building the world's largest construction database. Contributions are welcome!

## 📄 License

Copyright © 2024 AppIo.AI. All rights reserved.

## 🙏 Acknowledgments

Built with modern web technologies and AI to revolutionize how construction professionals work.

---

**AppIo.AI** - Making construction smarter, one job at a time.