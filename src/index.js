import watched from 'watched';

import styles from './index.module.css';


export default function (app, options) {
    app.addRouteListener('courses.conferences', params => {
        let groupsMap, sectionsMap;
        let nodeList = watched(document.body).querySelector('#members_list');
        let firstRun = true;

        nodeList.on('added', ([membersList]) => {

            // Do some initialization on the first run
            if (firstRun) {
                firstRun = false;

                // Wait for all data to be fetched
                Promise.all([
                    app.api.get(`/courses/${params.courseId}/users`, {
                        per_page: 100,
                        enrollment_type: 'student',
                        include_inactive: false,
                        include: ['enrollments', 'group_ids']
                    }),
                    app.api.get(`/courses/${params.courseId}/groups`),
                    app.api.get(`/courses/${params.courseId}/sections`)
                ]).then(([users, groups, sections]) => {
                    let userMapper = user => `user_${user.id}`;
                    let groupMapper = group => ([`group_${group.id}`, {
                        name: group.name,
                        members: users.filter(user => user.group_ids.includes(group.id)).map(userMapper)
                    }]);
                    let sectionMapper = section => ([`section_${section.id}`, {
                        name: section.name,
                        members: users.filter(user => user.enrollments.some(enrollment => enrollment.course_section_id === section.id)).map(userMapper)
                    }]);

                    // Get the group subscriptions
                    groupsMap = new Map(groups.map(groupMapper));
                    // Get the section subscriptions
                    sectionsMap = new Map(sections.map(sectionMapper));

                    main();
                });
            } else {
                main();
            }

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

            function main() {
                groupFilter.insertAdjacentHTML('beforeend', `
                    <optgroup label="Group">
                        ${Array.from(groupsMap.entries()).map(([key, group]) => `<option value="${key}">${group.name}</option>`).join('\n')}
                    </optgroup>
                    <optgroup label="Course section">
                        ${Array.from(sectionsMap.entries()).map(([key, section]) => `<option value="${key}">${section.name}</option>`).join('\n')}
                    </optgroup>
                `);
            }
        });

    });
}
