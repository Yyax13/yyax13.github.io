async function main() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('paper');

    const listContainer = document.querySelector('#papers');
    const reader = document.querySelector('#reader');

    const res = await fetch('./data.json');
    const papers = await res.json();

    if (!slug) {
        // Listagem de papers
        papers.forEach(paper => {
            const el = document.createElement('article');
            el.innerHTML = `
                <h2><a href="?paper=${paper.slug}">${paper.title}</a></h2>
                <p>${paper.desc}</p>
                <p><i>${paper.author} — ${paper.post_date}</i></p>
            `;
            listContainer.appendChild(el);
        });

        listContainer.style.display = 'block';
        reader.style.display = 'none';
    } else {
        // Visualização individual
        const paper = papers.find(p => p.slug === slug);

        if (!paper) {
            reader.innerHTML = `<p>Paper não encontrado.</p>`;
            return;
        }

        const html = marked.parse(paper.content);

        reader.innerHTML = `
            <a href="./">← Voltar</a>
            <h1>${paper.title}</h1>
            <p><i>${paper.author} — ${paper.post_date}</i></p>
            <div class="content">${html}</div>
        `;

        listContainer.style.display = 'none';
        reader.style.display = 'block';
    }
}

window.addEventListener('DOMContentLoaded', main);
