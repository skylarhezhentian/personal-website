# Skylar Tian: personal website

A static site (plain HTML, CSS and a little JavaScript, no build step) laid out like my old site,
with pages for Home, Experience, Research and Music.

## Files

- `index.html`: home page with intro, highlights, selected work, intro video and photos
- `experience.html`: roles, education and skills from my resume
- `research.html`: write-ups of four research projects
- `music.html`: recorded performances and instruments
- `style.css`: all styles, with a light theme (default) and a dark theme
- `script.js`: theme toggle and the five-line "harmonics" staff drawn on each page
- `assets/img/`: photos and artwork, resized for the web
- `assets/video/`: intro and performance videos, compressed to 720p (one performance is embedded from YouTube)

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

All text lives directly in the four HTML files. To add a resume download, export a PDF to
`assets/resume.pdf` and add `<a class="btn btn-ghost" href="assets/resume.pdf">Resume (PDF)</a>`
next to the "Email me" button in `index.html`.
