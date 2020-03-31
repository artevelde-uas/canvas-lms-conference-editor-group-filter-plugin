
export function addReadyListener(selector, handler) {
    let elements = document.querySelectorAll(selector);

    elements.forEach(element => {
        handler(element);
    });

    let handledElements = new Set(elements);

    new MutationObserver((mutationRecords) => {
        if (mutationRecords.some(mutation => (mutation.type === 'childList' && mutation.addedNodes.length))) {
            let elements = document.querySelectorAll(selector);

            elements.forEach(element => {
                if (handledElements.has(element)) return;

                handler(element);
            });

            handledElements = new Set(elements);
        }
    }).observe(document, {
        childList: true,
        subtree: true
    });
}
