# ✈️ Jet Wars

A fast-paced, retro-style 2D arcade shooter built with **HTML5 Canvas, CSS3, and Vanilla JavaScript**. Defend your jet, survive enemy waves, advance through challenging levels, and beat boss encounters!

![Jet Wars Gameplay Banner](jet-war.pnng)

---

## 🌟 Game Features

* **Progressive Waves & Levels**: Face increasingly difficult enemy formations as you advance through each level.
* **Level Complete Milestone Screen**: Smooth level transitions with status alerts to prepare you for the next wave.
* **On-Screen Touch Controls**: Dedicated UI control bar (`⬅️`, `🔫`, `➡️`) designed for mobile and touch compatibility.
* **Pause & Resume**: Quick in-game pause button (`⏸️`) to manage your game state anytime.
* **Dynamic Canvas Rendering**: Lightweight 360x640 portrait viewport optimized for arcade-style play.

---

## 🎮 How to Play

### Game Controls

| Action | Control Bar Button | Keyboard Shortcuts |
| :--- | :--- | :--- |
| **Move Left** | `⬅️` Left Arrow | `A` or `Left Arrow` |
| **Move Right** | `➡️` Right Arrow | `D` or `Right Arrow` |
| **Fire Laser** | `🔫` Shoot Button | `Spacebar` / `J` |
| **Pause Game** | `⏸️` Pause Button | `P` or `Esc` |

### Objective
1. **Survive Waves**: Shoot down incoming enemy jets before they pass or hit your player plane.
2. **Clear Levels**: Eliminate the required number of enemies per level to trigger the **Level Complete** overlay.
3. **Boss Fights**: Prepare for heavy boss jets at key level milestones!

---

## 🛠️ Project Structure

```text
├── index.html     # Game UI, canvas element, and overlay controls
├── style.css      # Portrait game container, control bar, and button styling
└── script.js     # Game loop, movement physics, bullet firing, and collision detection
