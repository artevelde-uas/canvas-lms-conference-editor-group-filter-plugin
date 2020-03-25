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
                    </div>
                </div>
            `);

            let membersControlGroup = legend.previousElementSibling;

            // Move the relevant controls to the new control group
            membersControlGroup.querySelector('.controls').append(inviteAllUsers.parentNode, removeObservers.parentNode, membersList);

            // Remove the remaining unwanted nodes
            while (membersControlGroup.nextSibling !== null) {
                membersControlGroup.nextSibling.remove();
            }
        });

    });
}
