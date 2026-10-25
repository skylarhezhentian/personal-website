# Skylar Tian: personal website

A static site (plain HTML, CSS and a little JavaScript, no build step). The home page holds
everything in one place, in the order About, Research, Experience, Honors, Skills and Contact,
and Music has its own page.

## Files

- `index.html`: the home page: intro, About (education), Research (a plucked string and its first four
  normal modes, then a timeline), Experience, Honors, Skills and Contact
- `music.html`: a recorded performance, embedded from YouTube
- `research.html`, `experience.html`: the old page addresses, which now forward to those sections of the
  home page (a link to one entry, such as `research.html#routing`, lands on that entry)
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

All text lives directly in `index.html` and `music.html`. To update the resume, replace
`assets/Skylar-Tian-Resume.pdf` with a new PDF of the same name.
