# Pixel ID Card Generator

A modern web application that generates pixelated ID cards from photos using AI image processing and stores them in a gallery powered by Supabase.

## Features

- 📸 **Camera Integration** - Capture photos directly in the browser
- 🎨 **AI Pixel Art Generation** - Transform photos into pixel art style
- 💾 **Cloud Storage** - Save and retrieve pixel cards using Supabase
- 🖼️ **Gallery View** - Browse all created pixel cards with pagination
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (Database + Storage)
- **AI Processing**: Google Gemini API
- **Deployment**: Ready for Vercel, Netlify, or similar platforms

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pramodthe/pixel_id.git
   cd pixel_id
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file and add:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── generate_pixel/  # Pixel generation flow
│   └── gallery/         # Gallery and card display
├── services/           # API and data services
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

---

**Built with ❤️ by NO-SPACE**