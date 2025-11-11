async function loadFooter() {
    try {
        const res = await fetch('../site.json').catch(() => fetch('./site.json'));
        const site = await res.json();

        const footerEl = document.querySelector('#footer');
        const linksHtml = site.footer.links
            .map(link => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`)
            .join(' | ');

        footerEl.innerHTML = `
            <p>${linksHtml}</p>
            <small>${site.footer.text}</small>
        `;
    } catch (err) {
        console.error('Erro ao carregar footer:', err);
    }
}

window.addEventListener('DOMContentLoaded', loadFooter);
