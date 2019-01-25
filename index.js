#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');

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
    }
];

inquirer.prompt(QUESTIONS)
    .then(answers => {
        const choice = answers.project;
        const name = answers.name;
        const templatePath = `${__dirname}/templates/${choice}`;

        fs.mkdirSync(`${CURR_DIR}/${name}`);
        createDirectoryContents(templatePath, name);
    });


function createDirectoryContents(templatePath, newProjectPath){
    const filesToCreate = fs.readdirSync(templatePath);

    filesToCreate.forEach(file => {
        const origFilePath = `${templatePath}/${file}`;

        const stats = fs.statSync(origFilePath);

        if(stats.isFile()){
            const contents = fs.readFileSync(origFilePath, 'utf8');
            const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
            
            fs.writeFileSync(writePath, contents, 'utf8');
        }else if (stats.isDirectory()) {
            fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);
            
            createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
          }
    });
}