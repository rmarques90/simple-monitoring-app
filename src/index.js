#!/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');
const {notifyWithoutCallback} = require('./notify');
const {makeRequest} = require('./fetch');

let systemTitle = null;
let soundOnNotify = true;
let urlToMakeRequest = null;
let headersToMakeRequest = null;
let consecutiveErrorsToNotify = null;
let timeToWaitBetweenRequests = null;
let consecutiveErrorsToExit = null;

const initalizeMonitoring = async () => {
    console.log(chalk.green(figlet.textSync('Monitoring system')));

    let answers = await inquirer.prompt([{
            type: 'confirm',
            name: 'soundOnNotify',
            message: 'Do you wish to play a sound on notification?',
            default: true
        },
        {
            type: 'input',
            name: 'systemTitle',
            message: 'Type a name for this monitoring system:'
        },
        {
            type: 'input',
            name: 'urlToMakeRequest',
            message: 'Type the url to make the request to check the response status:'
        },
        {
            type: 'input',
            name: 'headersToMakeRequest',
            message: 'If has some headers to insert in the request type them splitted by ||. Ex: Header:value||Header:value;...'
        },
        {
            type: 'number',
            name: 'consecutiveErrorsToNotify',
            message: 'How many consecutive errors you want to happen to be notified?',
            default: 1
        },
        {
            type: 'number',
            name: 'timeToWaitBetweenRequests',
            message: 'How much time (in seconds) we must wait to make requests?',
            default: 120
        },
        {
            type: 'number',
            name: 'consecutiveErrorsToExit',
            message: 'How many consecutive errors must happen to stop monitoring?',
            default: 10
        }
    ])

    if (process.env.DEBUG) {
        console.log(answers);
    }

    soundOnNotify = answers['soundOnNotify']
    systemTitle = answers['systemTitle'] && answers['systemTitle'].length ? answers['systemTitle'] : null;
    urlToMakeRequest = answers['urlToMakeRequest']
    let headersToMakeRequestAnswer = answers['headersToMakeRequest']
    consecutiveErrorsToNotify = answers['consecutiveErrorsToNotify']
    timeToWaitBetweenRequests = answers['timeToWaitBetweenRequests']
    consecutiveErrorsToExit = answers['consecutiveErrorsToExit']

    if (!urlToMakeRequest || !urlToMakeRequest.length) {
        console.log(chalk.red('Url must be defined =/'));
        process.exit(0);
    } else {
        let isValid = !!(urlToMakeRequest.includes('http://') || urlToMakeRequest.includes('https://'));
        if (!isValid) {
            console.log(chalk.red('Url is invalid =/'));
            process.exit(0);
        }
    }

    if (headersToMakeRequestAnswer && headersToMakeRequestAnswer.length) {
        headersToMakeRequest = {};
        headersToMakeRequestAnswer.split('||').forEach(obj => {
            if (obj.includes(':')) {
                let [key, value] = obj.split(':');
                if (key && value) {
                    headersToMakeRequest[key] = value;
                }
            }
        })
    }

    console.log(chalk.bgBlue.black('You can exit this anytime with CTRL+C :D'));

    console.log(chalk.bgGreen.black('Starting monitoring...'));

    let errors = 0;
    setInterval(async () => {
        if (process.env.DEBUG) {
            console.log(chalk.bgBlue.black('Requesting...'));
        }
        let isOk = await makeRequest(urlToMakeRequest, headersToMakeRequest);

        if (process.env.DEBUG) {
            console.log(chalk.bgCyan.black(`Response isOk: ${isOk}`));
        }

        if (isOk) {
            errors = 0;
        } else {
            errors++;
        }

        if (errors >= consecutiveErrorsToNotify) {
            notifyWithoutCallback(systemTitle, `The healthcheck has failed for ${errors} times...`, soundOnNotify)
        }

        if (errors >= consecutiveErrorsToExit) {
            console.log(chalk.bgRed.black(`Exiting monitoring system...reached consecutive errors to kill the process...`));
            process.exit(1);
        }

    }, timeToWaitBetweenRequests * 1000)

}

initalizeMonitoring();