# Skylar Tian: personal website

A static site (plain HTML, CSS and a little JavaScript, no build step) laid out like my old site,
with pages for Home, Research, Experience and Music.

## Files

- `index.html`: home page with intro, highlights, and short Research, Experience and Music sections
- `research.html`: a plucked string and its first four normal modes, then a timeline of my research
- `experience.html`: finance, software and other industry-related roles, plus leadership and activities
- `music.html`: a recorded performance, embedded from YouTube
- `style.css`: all styles, with a light theme (default) and a dark theme
- `script.js`: theme toggle, the plucked-string animation (a solution of the wave equation) and the click-to-play video cover
- `assets/img/`: photos and artwork, resized for the web
- `assets/Skylar-Tian-Resume.pdf`: the resume behind the Resume button on the home page

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish with GitHub Pages

1. On GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
3. The site goes live at `https://skylarhezhentian.github.io/personal-website/` within a minute or two.

To use your own domain instead, enter it under **Custom domain** on the same page and point
the domain's DNS at GitHub Pages.

## Editing

All text lives directly in the four HTML files. To update the resume, replace
`assets/Skylar-Tian-Resume.pdf` with a new PDF of the same name.
