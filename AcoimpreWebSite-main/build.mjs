// Script de build sin dependencias: node build.mjs  (o: npm run build:html)
// Inyecta head, header y footer compartidos en las 9 páginas y genera robots.txt / sitemap.xml.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const cfg = JSON.parse(read('site.config.json'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : `{{${k}}}`));
const baseUrl = (cfg.siteUrl || '').replace(/\/+$/, '');

const partial = {
  head: read('partials/head.html').trimEnd(),
  header: read('partials/header.html').trimEnd(),
  footer: read('partials/footer.html').trimEnd(),
};

const hasCompiledCss = fs.existsSync(path.join(root, 'css/tailwind.css'));
const styles = hasCompiledCss
  ? '<link rel="stylesheet" href="css/tailwind.css">'
  : '<!-- css/tailwind.css no existe aún: usando CDN temporal. Ejecuta `npm run build` para compilarlo. -->\n<script src="https://cdn.tailwindcss.com/3.4.17"></script>';

const ACTIVE = 'text-[#0052A5] font-semibold border-b-2 border-[#0052A5] pb-1';
const navLink = (item, page, mobile) => {
  const active = item.href === page;
  const label = mobile ? (item.short || item.label) : item.label;
  const cls = mobile
    ? 'text-gray-700 hover:text-blue-600 font-medium py-3 border-b border-gray-100'
    : `${active ? ACTIVE : 'text-gray-700'} hover:text-blue-600 font-medium whitespace-nowrap transition-colors text-[15px] xl:text-base`;
  const cur = active ? ' aria-current="page"' : '';
  return `        <a href="${item.href}"${cur} class="${mobile && active ? 'text-[#0052A5] font-semibold py-3 border-b border-gray-100' : cls}">${esc(label)}</a>`;
};

const socialIcons = ['facebook', 'instagram', 'linkedin'];
const socialLinks = () => {
  const links = socialIcons
    .filter((n) => cfg.social?.[n])
    .map((n) => `          <a href="${esc(cfg.social[n])}" target="_blank" rel="noopener noreferrer" aria-label="${n}" class="text-gray-400 hover:text-white"><i data-lucide="${n}" class="w-5 h-5"></i></a>`);
  return links.length ? `        <div class="flex gap-3 mt-4">\n${links.join('\n')}\n        </div>` : '';
};

const replaceBetween = (html, open, close, inner, file) => {
  const re = new RegExp(`${open}[\\s\\S]*?${close}`);
  if (!re.test(html)) throw new Error(`${file}: no encontré ${open}`);
  return html.replace(re, () => inner);
};

const pages = Object.keys(cfg.pages);
for (const file of pages) {
  const meta = cfg.pages[file];
  const vars = {
    title: esc(meta.title),
    description: esc(meta.description),
    siteName: esc(cfg.siteName),
    styles,
    extraHead: meta.extraHead || '',
    canonical: baseUrl ? `<link rel="canonical" href="${baseUrl}/${file === 'index.html' ? '' : file}">` : '',
    ogAbsolute: baseUrl
      ? `<meta property="og:url" content="${baseUrl}/${file === 'index.html' ? '' : file}">\n<meta property="og:image" content="${baseUrl}/${cfg.ogImage}">`
      : '',
  };
  let head = fill(partial.head, vars).replace(/^\s*\n/gm, '');
  const header = fill(partial.header, {
    navDesktop: cfg.nav.map((i) => navLink(i, file, false)).join('\n'),
    navMobile: cfg.nav.map((i) => navLink(i, file, true)).join('\n'),
    ctaHref: cfg.cta.href,
    ctaLabel: esc(cfg.cta.label),
  });
  const social = socialLinks();
  const footer = fill(partial.footer, {
    socialLinks: social,
    phoneTel: esc(cfg.phoneTel),
    phoneDisplay: esc(cfg.phoneDisplay),
    email: esc(cfg.email),
  }).replace(/\n\s*\n(?=\s*<\/div>\n\s*<div>)/g, '\n');

  let html = read(file);
  html = replaceBetween(html, '<head>', '</head>', head, file);
  html = replaceBetween(html, '<!-- build:header -->', '<!-- /build:header -->', `<!-- build:header -->\n${header}\n  <!-- /build:header -->`, file);
  html = replaceBetween(html, '<!-- build:footer -->', '<!-- /build:footer -->', `<!-- build:footer -->\n${footer}\n  <!-- /build:footer -->`, file);
  fs.writeFileSync(path.join(root, file), html);
  console.log('✔', file);
}

// robots.txt y sitemap.xml
const robots = baseUrl
  ? `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`
  : `User-agent: *\nAllow: /\n`;
fs.writeFileSync(path.join(root, 'robots.txt'), robots);
if (baseUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((f) => `  <url>\n    <loc>${baseUrl}/${f === 'index.html' ? '' : f}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  console.log('✔ robots.txt + sitemap.xml');
} else {
  console.warn('⚠ siteUrl vacío en site.config.json: no se generó sitemap.xml ni canonical/og:image.');
}
// El formulario de contacto lee estos datos desde js/config.js
fs.writeFileSync(
  path.join(root, 'js/config.js'),
  `// Generado por build.mjs desde site.config.json. No editar a mano.\nwindow.SITE = ${JSON.stringify({ email: cfg.email, formEndpoint: cfg.formEndpoint, whatsappNumber: cfg.whatsappNumber }, null, 2)};\n`
);
