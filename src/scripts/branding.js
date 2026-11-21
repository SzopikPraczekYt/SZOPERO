document.addEventListener("DOMContentLoaded", () => {
    const logo = "assets/icons/logo.png";
    const sidebar = document.querySelector(".sidebar");

    // Usuń stare nagłówki marki
    if (sidebar) {
        [...sidebar.children].forEach(el => {
            const text = el.textContent.replace(/\s+/g, "").toUpperCase();

            if (
                text.includes("SZOPERO") &&
                !el.querySelector("nav, button, a")
            ) {
                el.remove();
            }
        });

        // Jeden właściwy nagłówek
        const brand = document.createElement("div");
        brand.className = "szopero-brand";

        const img = document.createElement("img");
        img.src = logo;
        img.alt = "SZOPERO";

        const title = document.createElement("span");
        title.textContent = "SZOPERO";

        brand.append(img, title);
        sidebar.prepend(brand);
    }

    // Zamiana emoji szopa na prawdziwe logo w treści strony
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
        if (!node.nodeValue.includes("🦝")) return;

        const parts = node.nodeValue.split("🦝");
        const fragment = document.createDocumentFragment();

        parts.forEach((part, index) => {
            if (part) fragment.append(document.createTextNode(part));

            if (index < parts.length - 1) {
                const img = document.createElement("img");
                img.src = logo;
                img.alt = "SZOPERO";
                img.className = "inline-brand-logo";
                fragment.append(img);
            }
        });

        node.parentNode?.replaceChild(fragment, node);
    });
});
