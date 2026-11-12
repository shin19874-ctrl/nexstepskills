// GitHub Pages has no server routing: serving index.html as 404.html makes deep links (e.g. /webinars) work.
import { copyFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
