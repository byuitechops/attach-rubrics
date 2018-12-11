/*eslint-env node, es6*/

/* Attach rubrics to their assignments when converting from D2L to Canvas */

/* Put dependencies here */
const canvas = require('canvas-api-wrapper')

module.exports = (course, stepCallback) => {
    try {
        let assignmentDropboxFile = course.content.find(file => file.name === 'dropbox_d2l.xml');
        let discussionFiles = course.content.filter(file => file.name.includes('discussion_d2l_'));
        
        if (!assignmentDropboxFile && !discussionFiles) {
            course.warning('Couldn\'t locate assignments or discussions for this course. Going to next Child Module.');
            stepCallback(null, course);
            return;
        }

        let filesToCheck = [
            assignmentDropboxFile,
            ...discussionFiles
        ];

        filesToCheck.forEach(file => {
            let $ = file.dom;
            let items = [];
            if (file.name.includes('discussion')) {
                items = $('topics topic').has('d2l_2p0\\:associations>d2l_2p0\\:rubric');
            } else {
                items = $('dropbox folder').has('d2l_2p0\\:associations>d2l_2p0\\:rubric');
            }
            items.each(item => {
                console.log($(item))
            });
        });

        // Remeber to include AT LEAST ONE course.log in your child module
        course.log('Table description', {column: 'value'});
    
        /* You should never call the stepCallback with an error. We want the
        whole program to run when testing so we can catch all existing errors */
        stepCallback(null, course);

    } catch(err) {
        // catch all uncaught errors. Don't pass errors here on purpose
        course.error(err);
        stepCallback(null, course);
        return;
    }
};
