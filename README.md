# VELOOP Rewards — Interactive Games Hub & Arcade

An interactive web gaming and rewards ecosystem featuring 13 showcase banners, 2 fully developed arcade games (**Blade Master!** and **Slice Storm!**), 7-day progressive Daily Login Rewards for tokens, mistake detection with Game Over screens, and centralized Game Coin rewards.

---

## 🚀 Running on VS Code (Local Machine)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **VS Code**: ([Download VS Code](https://code.visualstudio.com/))

### 2. Setup
1. Open this project folder in **Visual Studio Code**:
   ```bash
   code .
   ```
2. Open the integrated terminal in VS Code (`Ctrl + ~` or `Cmd + ~` on Mac).
3. Install dependencies:
   ```bash
   npm install
   ```

### 3. Running the App (3 Easy Ways)

#### Option A: Terminal Command
Run either command:
```bash
npm run dev
# or
npm start
```
* **Auto-Open**: The app will automatically launch in your default web browser at `http://localhost:5173/`.
* **Mobile Phone Testing**: The terminal will also display a **Network URL** (e.g., `http://192.168.1.x:5173/`). You can open this link directly in your smartphone's browser on the same Wi-Fi network to test the mobile layout and touch controls!

#### Option B: VS Code 1-Click Debugging (F5)
1. Press `F5` or go to the **Run & Debug** panel (`Ctrl + Shift + D`).
2. Select **"Launch Chrome (http://localhost:5173)"** or **"Launch Edge (http://localhost:5173)"**.
3. VS Code will automatically start Vite and attach the debugger with breakpoints and source maps enabled.

#### Option C: VS Code Task Menu
1. Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac).
2. Type **Tasks: Run Task**.
3. Select **npm: dev**.

---

## 📦 Production Build & Preview

To test the production bundle before deploying:
```bash
# 1. Build optimized bundle into dist/
npm run build

# 2. Preview production build locally
npm run preview
```

---

## ☁️ Deploying to Vercel

This repository is pre-configured with [`vercel.json`](./vercel.json) for 1-click deployment on Vercel:

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Update project"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel will automatically detect:
   - **Framework**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

---

## 🎮 Features Included
- **Daily Login Rewards**: 7-day progressive streak to collect free Arcade Tokens.
- **Stage Clear & Win Token Rewards**: Earn +5 Tokens per stage cleared in Blade Master, and +15 Tokens for surviving Slice Storm.
- **Mistake Detection**: Immediate visual deflection/explosion and Game Over display when hitting a knife or bomb.
- **Responsive Layout**: Fluid clamp sizing and safe areas for mobile viewports, tablets, and desktop displays.