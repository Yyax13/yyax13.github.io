import { unified } from "https://esm.sh/unified@11";
import remarkParse from "https://esm.sh/remark-parse@11";
import remarkGfm from "https://esm.sh/remark-gfm@4";
import remarkRehype from "https://esm.sh/remark-rehype@11";
import rehypeHighlight from "https://esm.sh/rehype-highlight@6";
import rehypeMermaid from "https://esm.sh/rehype-mermaid@2";
import rehypeStringify from "https://esm.sh/rehype-stringify@10";
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs"

import x86asm from "https://esm.sh/highlight.js@11/lib/languages/x86asm";
import armasm from "https://esm.sh/highlight.js@11/lib/languages/armasm";
import avrasm from "https://esm.sh/highlight.js@11/lib/languages/avrasm";
// opcional: WebAssembly (não é assembly “clássico”)
import wasm from "https://esm.sh/highlight.js@11/lib/languages/wasm";

async function renderMarkdown(markdownContent) {
    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight, { ignoreMissing: true,
            languages: {
                x86asm,
                armasm,
                avrasm,
                wasm
            } })
        .use(rehypeMermaid, { strategy: "pre-mermaid" })
        .use(rehypeStringify)
        .process(markdownContent);

    return String(file);
}

function injectCSS() {
    if (!document.querySelector('link[href="../paper.css"]')) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "../paper.css";
        document.head.appendChild(css);
    }
}

async function main() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("paper");

    const listContainer = document.querySelector("#papers");
    const reader = document.querySelector("#reader");

    const res = await fetch("./data.json");
    const papers = await res.json();

    if (!slug) {
        papers.forEach((paper) => {
            const el = document.createElement("article");
            el.innerHTML = `
                <h2><a href="?paper=${paper.slug}">${paper.title}</a></h2>
                <p>${paper.desc}</p>
                <p><i>${paper.author} — ${paper.post_date}</i></p>
            `;
            listContainer.appendChild(el);
        });

        listContainer.style.display = "block";
        reader.style.display = "none";
    } else {
        const paper = papers.find((p) => p.slug === slug);
        if (!paper) {
            reader.innerHTML = `<p>Paper não encontrado.</p>`;
            return;
        }

        const html = await renderMarkdown(paper.content);

        reader.innerHTML = `
            <a href="./">← Voltar</a>
            <h1>${paper.title}</h1>
            <p><i>${paper.author} — ${paper.post_date}</i></p>
            <div class="content">${html}</div>
        `;

        injectCSS();

        listContainer.style.display = "none";
        reader.style.display = "block";

        console.log(">>> Script module iniciado!");
        console.log(">>> Import mermaid funcionou!");

        mermaid.initialize({
            theme: 'dark', // Ou 'default', 'forest', 'neutral', 'base'
        });
        console.log(">>> mermaid.initialize (configuração inicial) efetuado!");

            console.log(">>> DOMContentLoaded disparado - Preparando para renderizar e aplicar zoom aos diagramas.");

            const mermaidBlocks = document.querySelectorAll('pre.mermaid');

            if (mermaidBlocks.length === 0) {
                console.warn(">>> Nenhuma tag <pre class='mermaid'> encontrada. Nenhum diagrama será processado.");
                return;
            }

            // Loop para processar CADA bloco Mermaid encontrado
            for (const [index, block] of mermaidBlocks.entries()) {
                const diagramText = block.textContent.trim();
                if (!diagramText) {
                    console.warn(`>>> Bloco <pre class='mermaid'> vazio no índice ${index}. Pulando.`);
                    continue;
                }

                // Cria um contêiner para cada diagrama e seus controles
                const diagramContainer = document.createElement('div');
                diagramContainer.classList.add('diagram-container');

                // Cria o div para os controles personalizados
                const customControlsDiv = document.createElement('div');
                customControlsDiv.classList.add('custom-controls');
                customControlsDiv.innerHTML = `
                    <button class="zoom-in">+</button>
                    <button class="zoom-out">−</button>
                    <button class="reset">⟲</button>
                `;

                // Adiciona os controles ao contêiner do diagrama
                diagramContainer.appendChild(customControlsDiv);

                // Substitui o bloco <pre> original pelo novo contêiner
                block.parentNode.replaceChild(diagramContainer, block);

                // Renderiza o diagrama Mermaid
                // O ID precisa ser único para cada renderização do Mermaid
                const svgRenderId = `mermaid-svg-${Date.now()}-${index}`;
                console.log(`>>> Tentando renderizar diagrama ${index} para o ID: ${svgRenderId}`);

                try {
                    const { svg } = await mermaid.render(svgRenderId, diagramText);

                    // Cria um wrapper temporário para converter a string SVG em um elemento DOM
                    const svgWrapper = document.createElement('div');
                    svgWrapper.innerHTML = svg;
                    const renderedSvgElement = svgWrapper.querySelector('svg');

                    if (renderedSvgElement) {
                        // Adiciona o SVG renderizado ao contêiner do diagrama
                        diagramContainer.appendChild(renderedSvgElement);

                        // Inicializa svgPanZoom para este SVG específico
                        const panZoomInstance = svgPanZoom(renderedSvgElement, {
                            zoomEnabled: true,
                            controlIconsEnabled: false, // <<<< O ponto chave: DESABILITA OS CONTROLES DEFAULT!
                            fit: true,
                            center: true,
                            minZoom: 0.1,
                            maxZoom: 10,
                            zoomScaleSensitivity: 0.2,
                        });
                        console.log(`>>> svgPanZoom inicializado com sucesso para o SVG com ID: ${renderedSvgElement.id}`);

                        // Conecta os botões personalizados a esta instância específica do svgPanZoom
                        customControlsDiv.querySelector('.zoom-in').addEventListener('click', () => {
                            panZoomInstance.zoomIn();
                        });
                        customControlsDiv.querySelector('.zoom-out').addEventListener('click', () => {
                            panZoomInstance.zoomOut();
                        });
                        customControlsDiv.querySelector('.reset').addEventListener('click', () => {
                            panZoomInstance.reset();
                        });
                        console.log(`>>> Controles personalizados configurados para o diagrama ${index}.`);

                    } else {
                        console.error(`>>> Erro: Elemento SVG não encontrado no container gerado para o diagrama ${index}.`);
                        // Reinsere o bloco original com mensagem de erro se o SVG não for encontrado
                        diagramContainer.innerHTML = `<p style="color: red;">Erro ao renderizar o diagrama.</p><pre>${diagramText}</pre>`;
                    }

                } catch (error) {
                    console.error(`>>> Erro ao renderizar ou processar diagrama ${index}:`, error);
                    // Reinsere o bloco original com mensagem de erro em caso de falha na renderização
                    diagramContainer.innerHTML = `<p style="color: red;">Erro ao renderizar o diagrama.</p><pre>${diagramText}</pre>`;
                }
            }
            console.log(">>> Processamento de todos os diagramas Mermaid concluído.");
    }
}

window.addEventListener("DOMContentLoaded", main);
