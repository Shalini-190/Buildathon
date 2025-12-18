# ClipVerb
App live at: https://buildathon-verb.onrender.com/
ClipVerb is an intelligent **Video-to-Content Engine** that transforms video files and YouTube links into professional assets like News Articles, Blog Posts, LinkedIn Threads, and AI Podcasts.

## Features

- **Universal Content Engine:** Generate Blogs, News, and Summaries.
- **Agency Reporting:** Create white-labeled PDF reports with branding.
- **Advanced Intelligence:** Persona-based rewriting and Research Mode (Strict vs Enhanced).
- **Multimodal Audio:** Convert generated text into lifelike AI Podcasts.
- **Multilingual:** Support for Hindi, Tamil, Kannada, Spanish, and more.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment to Render

ClipVerb is optimized for deployment on [Render](https://render.com) as a Static Site.

### 1. Push to GitHub
Ensure you have a `.gitignore` file that excludes `.env` to prevent secret leakage.

### 2. Create a new Static Site on Render
1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Static Site**.
3. Connect your GitHub repository.

### 3. Configure Build Settings
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### 4. Set the API Key
1. Go to the **Environment** tab in your Render service settings.
2. Add a new Environment Variable:
   - **Key:** `API_KEY`
   - **Value:** `your_actual_gemini_api_key`
3. Click **Save Changes**. Render will trigger a new deploy automatically.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Google Gemini API (`gemini-3-flash-preview` & `gemini-2.5-flash-preview-tts`)
