#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const spawn = require('cross-spawn');

const CURR_DIR = process.cwd();
const TEMPLATE_DIR = `${__dirname}\\templates`;

const CHOICE_ORDER = [
    'electron-react-typescript',
    'redux-react-webpack-typescript',
    'react-webpack-typescript',
    'webpack-typescript'
]

const CHOICES = fs.readdirSync(TEMPLATE_DIR).sort((a, b) => CHOICE_ORDER.indexOf(b) - CHOICE_ORDER.indexOf(a));

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
        validate: input => /^([A-Za-z\-\_\d])+$/.test(input) || 'Project name may only include letters, numbers, underscores and hashes.'
    },
    {
        name: 'shouldInstall',
        type: 'confirm',
        message: 'Run npm install?'
    }
];

inquirer.prompt(QUESTIONS).then(async (answers) => {
    const { project, name, shouldInstall } = answers;

    const templatePath = `${TEMPLATE_DIR}\\${project}`;
    const targetPath = `${CURR_DIR}\\${name}`;

    fs.mkdirSync(targetPath);
    copyDirectoryContents(templatePath, targetPath);

    if (shouldInstall) {
        console.log(`> npm install`);
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
        }).on('close', code => code ? reject() : resolve());
    });
}

function copyDirectoryContents(templatePath, targetPath) {
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const templateFilePath = `${templatePath}/${file}`;
        const targetFilePath = `${targetPath}/${file}`;
        
        const stats = fs.statSync(templateFilePath);

        if (stats.isFile()) {
            fs.copyFileSync(templateFilePath, targetFilePath);
        } else if (stats.isDirectory()) {
            fs.mkdirSync(targetFilePath);
            copyDirectoryContents(templateFilePath, targetFilePath);
        }
    });
}