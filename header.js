async function loadHeader() {
    try {
        const res = await fetch('../site.json').catch(() => fetch('./site.json'));
        const site = await res.json();

        const path = window.location.pathname;
        const headerEl = document.querySelector('#header');

        // define nome da seção atual
        let current = path !== "/" ? (path.split('/')[1]).charAt(0).toUpperCase() + (path.split('/')[1]).slice(1).toLowerCase() : "Início";

        // esquerda -> link fixo p/ home
        const navLeft = `
            <div class="nav-left">
                <a href="/" class="header_home">${site.nav.home.label}</a>
            </div>
        `;

        // centro -> nome do site + seção atual
        const navCenter = `
            <div class="nav-center">
                ${site.site_name} - ${current}
            </div>
        `;

        console.log(site);
        // direita -> páginas dinâmicas vindas do site.json
        const links = site.nav.sections
            .map(section => {
                const slug = section.url;
                return `<a class="nav-links" href="${slug}">/${section.label.toLowerCase()}</a>`;
            })
            .join('');

        const navRight = `
            <div class="nav-right">
                ${links}
            </div>
        `;

        headerEl.innerHTML = `<nav>${navLeft}${navCenter}${navRight}</nav>`;
    } catch (err) {
        console.error('Erro ao carregar header:', err);
    }
}

window.addEventListener('DOMContentLoaded', loadHeader);
