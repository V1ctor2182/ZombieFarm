# Assets

This directory contains static assets used in the game.

## Structure

```
assets/
├── sprites/               # Game sprites and sprite sheets
│   ├── zombies/          # Zombie character sprites
│   ├── enemies/          # Enemy character sprites
│   ├── ui/               # UI icons and elements
│   ├── environment/      # Background tiles, structures
│   └── effects/          # Particle effects, animations
├── audio/                # Sound effects and music
│   ├── sfx/              # Sound effects
│   ├── music/            # Background music
│   └── ambient/          # Ambient sounds
├── fonts/                # Custom fonts (pixel-art style)
└── data/                 # Static data files (JSON configs, etc.)
```

## Asset Guidelines

### Sprites

- Use sprite sheets where possible for better performance
- PNG format with transparency
- Consistent size and style (pixel-art aesthetic)
- Organize by category and type
- Name files descriptively: `zombie_shambler_idle_001.png`

### Audio

- Sound effects: Short, impactful (clicks, harvests, attacks)
- Music: Loopable tracks for farm and combat
- Ambient: Background atmosphere (wind, groans, etc.)
- Format: MP3 or OGG for web compatibility
- Keep file sizes reasonable (compress where possible)

### Fonts

- Pixel-art style fonts for retro aesthetic
- TTF or WOFF2 format
- Include license information

### Data

- JSON configuration files
- CSV data tables
- Static content

## Asset Loading

Assets are loaded via:

1. **Vite**: Direct imports in code
   ```typescript
   import zombieSprite from '@assets/sprites/zombies/shambler.png';
   ```
2. **Phaser**: Asset loader in Phaser scenes
   ```typescript
   this.load.image('zombie_shambler', 'sprites/zombies/shambler.png');
   ```
3. **Public Directory**: Large files in `/public/` (not bundled)

## Placeholder Assets

During development, use placeholder assets:

- Simple colored rectangles for sprites
- Silence or basic tones for audio
- System fonts until custom fonts are ready

## Asset Attribution

All assets must have proper attribution and licensing:

- Document source and license in `CREDITS.md` (root directory)
- Only use assets you have rights to use
- Prefer public domain, CC0, or permissive licenses

## Optimization

Before production:

- Compress images (WebP, optimized PNG)
- Compress audio (adjust bitrate)
- Generate sprite atlases
- Lazy load non-critical assets
