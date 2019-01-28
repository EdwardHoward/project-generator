#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const spawn = require('cross-spawn');

const CURR_DIR = process.cwd();

const choiceOrder = [
    'electron-react-typescript',
    'redux-react-webpack-typescript',
    'react-webpack-typescript',
    'webpack-typescript'
]

const CHOICES = fs.readdirSync(`${__dirname}/templates`).sort((a, b) => {
    return choiceOrder.indexOf(b) - choiceOrder.indexOf(a);
});

const QUESTIONS = [
    {
        name: 'project',
        type: 'list',
        message: 'Choose project',
        choices: CHOICES
    },
    {
        name: 'name',
        type: 'input',
        message: 'Project Name',
        validate: input => {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else return 'Project name may only include letters, numbers, underscores and hashes.';
        }
    },
    {
        name: 'runInstall',
        type: 'confirm',
        message: 'Run npm install'
    }
];

inquirer.prompt(QUESTIONS).then(async (answers) => {
    const { project, name, runInstall } = answers;

    const targetPath = `${CURR_DIR}\\${name}`;
    const templatePath = `${__dirname}/templates/${project}`;

    fs.mkdirSync(targetPath);
    createDirectoryContents(templatePath, name);

    if (runInstall) {
        console.log(`> npm --prefix ${targetPath} -i ${targetPath}`);
        try{
            await install(targetPath);
            console.log(chalk`{blue Install finished}`);
        }catch{
            console.log(chalk`{red There was an error installing the project}`);
            console.log(chalk`Install manually with {underline npm install} in {underline ${targetPath}`);
        }
    }

    console.log(chalk`{green Project generated:} {underline ${targetPath}}`);
});

function install(path){
    return new Promise((resolve, reject) => {
        spawn('npm', ['install'], {
            stdio: 'inherit',
            cwd: path
        }).on('close', code => {
            if(code !== 0){
                reject();
                return;
            }
            resolve();
        });
    });
}

function createDirectoryContents(templatePath, targetPath) {
    const encoding = 'utf8';
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const templateFilePath = `${templatePath}/${file}`;
        const targetFilePath = `${targetPath}/${file}`;
        
        const stats = fs.statSync(templateFilePath);

        if (stats.isFile()) {
            const contents = fs.readFileSync(templateFilePath, encoding);

            fs.writeFileSync(targetFilePath, contents, encoding);
        } else if (stats.isDirectory()) {
            fs.mkdirSync(targetFilePath);
            createDirectoryContents(templateFilePath, targetFilePath);
        }
    });
}