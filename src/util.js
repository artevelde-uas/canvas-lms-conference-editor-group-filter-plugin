import watched from 'watched';


export function addReadyListener(query, handler) {
    let nodeList = watched(document.body).querySelector(query);
    let element = document.querySelector(query);
    if (element !== null) {
        handler(element);
    }
    nodeList.on('added', ([element]) => {
        handler(element);
    });
}
