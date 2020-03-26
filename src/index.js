import watched from 'watched';

import styles from './index.module.css';


export default function (app, options) {
    app.addRouteListener('courses.conferences', params => {
        let nodeList = watched(document.body).querySelector('#members_list');

        nodeList.on('added', ([membersList]) => {
            let legend = membersList.closest('form').querySelector('legend');
            let inviteAllUsers = document.getElementById('user_all');
            let removeObservers = document.getElementById('observers_remove');

            // Insert a new 'Members' control group after the last one
            legend.insertAdjacentHTML('beforebegin', `
                <div class="control-group">
                    <label class="control-label">${legend.textContent}</label>
                    <div class="controls">
                        <div id="${styles.membersSelector}" class="hidden">
                            <select id="${styles.groupFilter}">
                                <option>No group filter selected</option>
                            </select>
                        </div>
                    </div>
                </div>
            `);

            let membersControlGroup = legend.previousElementSibling;
            let membersSelector = document.getElementById(styles.membersSelector);
            let groupFilter = document.getElementById(styles.groupFilter);

            // Move the relevant controls to the new control group
            membersSelector.parentNode.prepend(inviteAllUsers.parentNode, removeObservers.parentNode);
            groupFilter.parentNode.append(membersList);

            // Remove the remaining unwanted nodes
            while (membersControlGroup.nextSibling !== null) {
                membersControlGroup.nextSibling.remove();
            }

            // Show the list without anaimations
            inviteAllUsers.addEventListener('change', event => {
                membersSelector.classList.toggle('hidden', inviteAllUsers.checked);
            });
        });

    });
}
