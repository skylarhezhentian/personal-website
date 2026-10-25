# Skylar Tian: personal website

A static personal site (plain HTML, CSS, and a little JavaScript) with no build step.

## Files

- `index.html`: all page content (experience, research, education, skills, contact)
- `style.css`: styles, including light and dark themes
- `script.js`: theme toggle and the random-walk hero background
- `assets/`: favicon and any images

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish with GitHub Pages

1. On GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
3. The site will be live at `https://skylarhezhentian.github.io/personal-website/` within a minute or two.

## Adding a resume download

Export your resume as a PDF, save it as `assets/resume.pdf`, and add a button in `index.html` next to "Email me":

```html
<a class="btn" href="assets/resume.pdf">Resume (PDF)</a>
```
