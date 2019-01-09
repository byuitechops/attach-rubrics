/* Attach rubrics to their assignments when converting from D2L to Canvas as well as copy over points values */
const canvas = require('canvas-api-wrapper');
const asyncLib = require('async');
const {
    promisify
} = require('util');
const asyncEach = promisify(asyncLib.each);

const VERBOSE = false;

module.exports = (course, stepCallback) => {
    (async () => {
        /***************************************************************
         * createRubrics
         * @param {Obj} rubricFile - file retrieved from Canvas object
         * 
         * This function retrieves all of the rubrics and stores the 
         * properties into an object array. This allows the program
         * to match up assignments or discussion boards to the proper
         * rubric.
         * Since the point value is also not transferred over to Canvas
         * during import, this also stores the point values
         ***************************************************************/
        async function createRubrics(rubricFile) {
            let rubrics = [];

            try {
                let $ = rubricFile.dom;

                //iterate through multiple rubrics because courses have multiple rubrics
                await asyncEach($('rubrics rubric'), async rubricAttributes => {
                    let rubricId = rubricAttributes.attribs.id;
                    let rubricName = rubricAttributes.attribs.name;

                    //still need to fix this one since the point values is nested several levels
                    let attributes = $('rubrics rubric > criteria_groups > criteria_group > level_set > levels').children();
                    let pointsArray = [];

                    await asyncEach(attributes, async attr => {
                        pointsArray.push({
                            name: attr.attribs.name,
                            points: attr.attribs.level_value
                        });
                    });

                    rubrics.push({
                        id: rubricId,
                        name: rubricName,
                        points: pointsArray
                    });

                    if (VERBOSE) {
                        console.log('Points:\n-----------------------------------')
                        rubrics[0].points.forEach(r => console.log(r));
                        console.log('-----------------------------------');
                        console.log(rubrics);
                    }
                });
            } catch (err) {
                throw err;
            }
        }

        /***************************************************************
         * parseDiscussions
         * @param {Arr} discussionArray
         * 
         * This function parses all of the discussion board XML files. 
         * In each XML file, it has details about each XML file. If the
         * discussion board contains a rubric, it'll have the following:
         * <d2l_2p0:rubric>1</d2l_2p0:rubric>. In this case, the number 1
         * is the rubric id associated with that rubric. 
         * This function parses them all and creates an array of objects
         * that contains the ID and the name of the discussion board.
         ***************************************************************/
        async function parseDiscussions(discussionArray) {
            let discussionRubrics = []

            try {
                await asyncEach(discussionArray, async discussion => {

                });
            } catch (err) {
                throw err;
            }
        }

        /***************************************************************
         * parseDropboxes
         * @param {Obj} dropboxFile
         * 
         * There is only one XML file that holds all of the dropboxes and
         * if there is a rubric associated with a dropbox, there will be
         * <d2l_2p0:rubric isDefault="false">1</d2l_2p0:rubric>. The 1, in
         * this case, is the rubric ID associated with it. 
         * This function parses through the XML file given in the parameter
         * and creates an object array of all dropboxes that has a rubric
         * associated.
         ***************************************************************/
        async function parseDropboxes(dropboxFile) {

        }

        /*****************************************
         ****************START HERE***************  
         ****************************************/
        try {
            //find XML files inside course object
            let assignmentDropboxFile = course.content.find(file => file.name === 'dropbox_d2l.xml');
            let discussionFiles = course.content.filter(file => file.name.includes('discussion_d2l_'));
            let rubricFile = course.content.find(file => file.name === 'rubrics_d2l.xml');

            //course must be empty or something weird has happened
            if (!assignmentDropboxFile && !discussionFiles && !rubricFile) {
                course.warning('Couldn\'t locate assignments, or discussions or no rubrics exists at all for this course. Going to next Child Module.');
                stepCallback(null, course);
                return;
            }

            //parse through XML files
            let rubrics = await createRubrics(rubricFile);
            let dropboxes = await parseDropboxes(assignmentDropboxFile);
            let discussions = await parseDiscussions(discussionFiles);

            course.log('Table description', {
                column: 'value'
            });
            stepCallback(null, course);

        } catch (err) {
            course.error(err);
            stepCallback(null, course);
            return;
        }
    })();
};