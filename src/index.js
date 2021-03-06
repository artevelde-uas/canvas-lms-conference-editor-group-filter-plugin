import styles from './index.module.css';

import translations from './i18n.json';


export default function ({ router, dom, api, i18n, i18n: { translate: __ } }) {
    router.addListener('courses.conferences', params => {
        i18n.setTranslations(translations);

        let groupsMap, sectionsMap;
        let firstRun = true;

        dom.onElementAdded('#members_list', membersList => {
            let legend = membersList.closest('form').querySelector('legend');
            let inviteAllUsers = document.getElementById('user_all');
            let removeObservers = document.getElementById('observers_remove');
            let checkboxes = membersList.querySelectorAll('.member input[type="checkbox"][id^="user_"]');

            // Insert a new 'Members' control group after the last one
            legend.insertAdjacentHTML('beforebegin', `
                <div class="control-group">
                    <label class="control-label">${legend.textContent}</label>
                    <div class="controls">
                        <div id="${styles.membersSelector}">
                            <select id="${styles.groupFilter}">
                                <option>${__('no_filter_selected')}</option>
                                <optgroup class="loading" label="${__('loading')}"></optgroup>
                            </select>
                            <button id="${styles.selectAll}" class="btn">${__('select_all')}</button>
                        </div>
                    </div>
                </div>
            `);

            let membersControlGroup = legend.previousElementSibling;
            let membersSelector = document.getElementById(styles.membersSelector);
            let groupFilter = document.getElementById(styles.groupFilter);
            let selectAll = document.getElementById(styles.selectAll);

            // Move the relevant controls to the new control group
            membersSelector.parentNode.prepend(inviteAllUsers.previousElementSibling);
            membersSelector.parentNode.append(removeObservers.parentNode);
            groupFilter.parentNode.append(membersList);

            // Remove the remaining unwanted nodes
            while (membersControlGroup.nextSibling !== null) {
                membersControlGroup.nextSibling.remove();
            }

            function main() {

                /**
                 * @returns TRUE if all checkboxes are selected
                 */
                function isAllSelected() {
                    let checkboxes = membersList.querySelectorAll('.member:not([hidden]) input[type="checkbox"][id^="user_"]');

                    return !Array.from(checkboxes).some(checkbox => !checkbox.checked);
                }

                /**
                 * Sets the correct label text on the 'Select all' checkbox
                 */
                function updateSelectAllLabel() {
                    selectAll.textContent = isAllSelected() ? __('deselect_all') : __('select_all');
                }

                // Remove the 'Loading...' text from the drop-down
                groupFilter.querySelector('optgroup.loading').remove();

                // Populate the drop-down with the groups and sections
                groupFilter.insertAdjacentHTML('beforeend', `
                    <optgroup label="${__('groups')}">
                        ${Array.from(groupsMap.entries()).map(([key, group]) => `<option value="${key}">${group.name}</option>`).join('\n')}
                    </optgroup>
                    <optgroup label="${__('sections')}">
                        ${Array.from(sectionsMap.entries()).map(([key, section]) => `<option value="${key}">${section.name}</option>`).join('\n')}
                    </optgroup>
                `);

                // Update the 'Select all' label on members list changes
                membersList.addEventListener('change', updateSelectAllLabel);

                // Filter the users on selection change
                groupFilter.addEventListener('change', event => {
                    let match = event.target.value.match(/^(section|group)_\d+$/);

                    // Show all users if no group selected
                    if (match === null) {
                        checkboxes.forEach(checkbox => {
                            checkbox.closest('li').removeAttribute('hidden');
                        });

                        // Update the 'Select all' label on group filter change
                        updateSelectAllLabel();

                        return;
                    }

                    let [key, type] = match;
                    let map = (type === 'group') ? groupsMap : sectionsMap;
                    let members = map.get(key).members;

                    // Show only members of the selected group
                    checkboxes.forEach(checkbox => {
                        checkbox.closest('li').toggleAttribute('hidden', !members.includes(checkbox.id));
                    });

                    // Update the 'Select all' label on group filter change
                    updateSelectAllLabel();
                });

                selectAll.addEventListener('click', event => {
                    let checkboxes = membersList.querySelectorAll('.member:not([hidden]) input[type="checkbox"][id^="user_"]:not([disabled])');
                    let checked = !isAllSelected();

                    event.preventDefault();

                    // Check/uncheck all the users
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = checked;
                    });

                    // Update the label on 'Select all' checkbox change
                    updateSelectAllLabel();
                });
            }

            // Do some initialization on the first run
            if (firstRun) {
                firstRun = false;

                // Wait for all data to be fetched
                Promise.all([
                    api.get(`/courses/${params.courseId}/users`, {
                        per_page: 100,
                        enrollment_type: 'student',
                        include_inactive: false,
                        include: ['enrollments', 'group_ids']
                    }),
                    api.get(`/courses/${params.courseId}/groups`),
                    api.get(`/courses/${params.courseId}/sections`)
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

        });

    });
}
