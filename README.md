# 🎬 ReelRoom

**Synchronized video watching across streaming platforms**

ReelRoom is a Chrome extension that enables synchronized video watching experiences across popular streaming platforms like Netflix, Prime Video, Disney+ Hotstar, YouTube, and more. Watch movies and shows together with friends and family, no matter where you are.

## ✨ Features

- **🎥 Multi-platform support**: Works with Netflix, Prime Video, Disney+ Hotstar, JioCinema, YouTube
- **⚡ Real-time synchronization**: Play, pause, and seek events are synchronized across all participants
- **🔐 Secure authentication**: Google OAuth integration for secure user authentication
- **👥 Room-based sessions**: Create or join rooms with unique codes
- **🎯 Smart video detection**: Automatically detects and monitors the main video element
- **🔄 Persistent sync**: Maintains synchronization even after page refreshes
- **🚫 Privacy-focused**: No video content is transmitted - only playback control events

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vue Router** - Client-side routing
- **TailwindCSS 4** - Utility-first CSS framework
- **Vite** - Fast build tool and development server

### Backend & Services
- **Supabase** - Backend-as-a-service for real-time database and authentication
- **Chrome Extensions API** - Manifest V3 with service workers
- **Google OAuth 2.0** - Secure authentication

### Development Tools
- **ESLint** - Code linting with Vue and Prettier configs
- **Prettier** - Code formatting
- **GitHub Actions** - CI/CD pipeline for automated builds

## 🚀 Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation (Development)
1. Clone the repository:
   ```bash
   git clone https://github.com/PrerithSubramanya/ReelRoom.git
   cd ReelRoom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## 🎯 How It Works

### Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Content       │    │   Background    │    │   Supabase      │
│   Script        │◄──►│   Service       │◄──►│   Real-time     │
│                 │    │   Worker        │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Video         │    │   Extension     │    │   Room          │
│   Element       │    │   Popup         │    │   Management    │
│   Monitoring    │    │   (Vue App)     │    │   & Sync        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Synchronization Process
1. **Video Detection**: Content script automatically detects the main video element on streaming platforms
2. **Event Capture**: Monitors play, pause, and seek events from the video element
3. **Real-time Broadcasting**: Events are sent via Chrome messaging to the background script
4. **Supabase Relay**: Background script broadcasts events to Supabase real-time channels
5. **Cross-device Sync**: All participants receive events and sync their video playback accordingly

### Platform-Specific Optimizations
- **Netflix**: Uses API calls due to platform restrictions
- **Disney+ Hotstar**: Implements keyboard simulation for enhanced compatibility
- **YouTube**: Direct video API integration
- **Generic platforms**: Universal video element detection and control

## 📖 Usage

### Creating a Room
1. Click the ReelRoom extension icon
2. Sign in with your Google account
3. Click "Create Room"
4. Share the generated room code with friends

### Joining a Room
1. Click the ReelRoom extension icon
2. Sign in with your Google account
3. Enter the room code shared by the host
4. Click "Join Room"

### Synchronized Watching
- **Host controls**: The room creator can control playback for all participants
- **Automatic sync**: Play, pause, and seek events are automatically synchronized
- **Persistent sessions**: Rooms remain active even if participants refresh the page
- **Leave anytime**: Use the "Leave Room" button to exit the session

## 🔧 Development

### Prerequisites
- Node.js 16+ and npm
- Chrome browser for testing
- Supabase account for backend services

### Setup
1. Clone and install dependencies:
   ```bash
   git clone https://github.com/PrerithSubramanya/ReelRoom.git
   cd ReelRoom
   npm install
   ```

2. Create a Supabase project and configure environment variables
3. Set up Google OAuth credentials for Chrome extension

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Production build with secrets injection
npm run build:prod

# Run linting with auto-fix
npm run lint

# Format code
npm run format

# Preview production build
npm run preview
```

### Project Structure
```
ReelRoom/
├── src/                    # Vue.js frontend source
│   ├── components/         # Vue components
│   ├── router/            # Vue Router configuration
│   ├── supabase.js        # Supabase client setup
│   └── main.js            # App entry point
├── public/                # Static assets and extension files
│   ├── background.js      # Chrome extension background script
│   ├── content-script.js  # Content script for video monitoring
│   └── manifest.json      # Chrome extension manifest
├── scripts/               # Build and deployment scripts
├── .github/workflows/     # CI/CD GitHub Actions
└── dist/                  # Built extension files
```

## 🔒 Privacy & Security

- **No video content transmission**: Only playback control events are shared
- **Secure authentication**: Google OAuth 2.0 integration
- **Encrypted communications**: All data transmitted via HTTPS
- **Minimal permissions**: Extension only accesses necessary streaming platform domains
- **Local storage**: Room information stored locally with Chrome storage API

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues & Limitations

- Some streaming platforms may have additional restrictions
- Requires active internet connection for real-time synchronization
- Video quality and buffering may affect sync accuracy

## 📞 Support

For issues and questions:
- Create an issue on [GitHub](https://github.com/PrerithSubramanya/ReelRoom/issues)
- Check existing issues for common problems and solutions

---

**Made with ❤️ for better shared viewing experiences**
