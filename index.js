#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const meow = require('meow');
const path = require('path');
const spawn = require('cross-spawn');

const logger = require('./logger')("verbose");
const { CHOICE_ORDER } = require('./constants');
const { asyncForEach, replace } = require('./utils');

const CURR_DIR = process.cwd();
const TEMPLATE_DIR = path.join(__dirname, 'templates');

const CHOICES = getChoices(TEMPLATE_DIR);

const cli = meow(`
        Usage
          $ generate-project <name>
     
        Options
          --dry-run, -n Do not generate project, but show directory and package.json
          --yes, -y Use default values for package.json
          --template, -t Name of the template to use
    `, {
    flags: {
        "dry-run": {
            type: 'boolean',
            alias: 'n'
        },
        "yes": {
            type: 'boolean',
            alias: 'y'
        },
        "template": {
            type: 'string',
            alias: 't'
        },
        "install": {
            type: 'string',
            alias: 'i'
        }
    }
});

const template = getTemplate(cli.flags.template);

function createQuestions() {
    const questions = [];

    if (!cli.input[0]) {
        questions.push({
            name: 'name',
            type: 'input',
            message: 'Project Name:',
            validate: input => /^([A-Za-z\-\_\d])+$/.test(input) || 'Project name may only include letters, numbers, underscores and dashes.'
        });
    }

    if (!template) {
        questions.push({
            name: 'project',
            type: 'list',
            message: 'Choose project',
            choices: CHOICES
        });
    }

    if (!cli.flags.yes) {
        questions.push(
            {
                name: 'version',
                type: 'input',
                message: 'Version:',
                default: '1.0.0'
            },
            {
                name: 'description',
                type: 'input',
                message: 'Description:'
            },
            {
                name: 'author',
                type: 'input',
                message: 'Author:'
            },
            {
                name: 'license',
                type: 'input',
                message: 'License:',
                default: 'ISC'
            });
    }

    if (!cli.flags.install) {
        questions.push(
            {
                name: 'shouldInstall',
                type: 'confirm',
                message: 'Run npm install?'
            }
        );
    }

    questions.push(
        {
            name: 'shouldGitInit',
            type: 'confirm',
            message: 'Create Git Repository?'
        }
    );

    return questions;
}

async function askQuestions(questions) {
    const answers = await inquirer.prompt(questions);
    const {
        project = template,
        name = cli.input[0],
        version = "1.0.0",
        description = "",
        author = "",
        license = "ISC",
        shouldInstall,
        shouldGitInit } = answers;

    const templatePath = path.join(TEMPLATE_DIR, project)
    const targetPath = path.join(CURR_DIR, name);

    if (!await confirmOptions(targetPath, { name, version, description, author, license, project })) {
        return;
    }

    if (!cli.flags.dryRun) {
        const format = formatFromAnswers({ name, version, description, author, license });

        await generateProject(templatePath, targetPath, format);

        if (shouldInstall) {
            await installDependencies(targetPath);
        }

        if (shouldGitInit) {
            await initializeGitRepo(targetPath);
        }
    }

    logger.info(chalk`{green Project generated:} {underline ${targetPath}}`);
}

async function confirmOptions(targetPath, { name, version, description, author, license, project }) {
    logger.info(chalk`About to generate a {underline ${project}} project in {underline ${targetPath}}`);

    logger.info(`
{
    "name": "${name}",
    "version": "${version}",
    "description": "${description}",
    "author": "${author}",
    "license": "${license}"
}`);

    return promptShouldContinue()
}

async function promptShouldContinue() {
    const cont = await inquirer.prompt([
        {
            name: 'confirm',
            type: 'confirm',
            message: 'Is this OK?'
        }
    ]);

    return cont.confirm;
}

function formatFromAnswers({ name, version, description, author, license }) {
    const format = [
        {
            replace: /{title}/,
            value: name
        },
        {
            replace: /{version}/,
            value: version
        },
        {
            replace: /{description}/,
            value: description
        },
        {
            replace: /{author}/,
            value: author
        },
        {
            replace: /{license}/,
            value: license
        }
    ]

    return format;
}

async function generateProject(templatePath, targetPath, format) {
    await fs.promises.mkdir(targetPath);
    await copyDirectoryContents(templatePath, targetPath, format);
}

function spawnPromise(command, args, options) {
    return new Promise((resolve, reject) => {
        spawn(command, args, options)
            .on('close', code => code ? reject() : resolve());
    });
}

async function installDependencies(cwd) {
    logger.info(`> npm install`);

    try {
        await spawnPromise('npm', ['install'], {
            stdio: 'inherit',
            cwd
        });
        logger.info(chalk`{blue Install finished}`);
    } catch {
        logger.info(chalk`{red There was an error installing the project}`);
        logger.info(chalk`Install manually with {underline npm install} in {underline ${targetPath}`);
    }
}

async function initializeGitRepo(cwd) {
    logger.info(`> git init`);

    try {
        await spawnPromise('git', ['init'], {
            stdio: 'inherit',
            cwd
        });
        logger.info(chalk`{blue Git repo created}`);
    } catch (err) {
        logger.info(chalk`{red There was an error initializing the git repo}`);
        logger.info(chalk`Initialize repo manually with {underline git init} in {underline ${targetPath}`);
    }
}

async function formatFile(path, format, output) {
    const file = await fs.promises.readFile(path, 'utf8');
    const content = replace(file, format);

    await fs.promises.writeFile(output ? output : path, content, 'utf8');
}

async function handleFile(templateFilePath, targetFilePath, format) {
    if (templateFilePath.includes('package.json')) {
        await formatFile(templateFilePath, format, targetFilePath);
    } else {
        await fs.promises.copyFile(templateFilePath, targetFilePath);
    }
}

async function handleDirectory(templateFilePath, targetFilePath, format) {
    await fs.promises.mkdir(targetFilePath);
    await copyDirectoryContents(templateFilePath, targetFilePath, format);
}

async function copyDirectoryContents(templatePath, targetPath, format) {
    const files = await fs.promises.readdir(templatePath);

    await asyncForEach(files, async file => {
        const templateFilePath = path.join(templatePath, file);
        const targetFilePath = path.join(targetPath, file);

        const stats = await fs.promises.stat(templateFilePath);

        if (stats.isFile()) {
            await handleFile(templateFilePath, targetFilePath, format);
        } else if (stats.isDirectory()) {
            await handleDirectory(templateFilePath, targetFilePath, format);
        }
    });
}

function getChoices(templatePath) {
    const templates = fs.readdirSync(templatePath).sort((a, b) => CHOICE_ORDER.indexOf(b) - CHOICE_ORDER.indexOf(a));

    return templates;
}

function getTemplate(template) {
    if (template) {
        if (CHOICES.includes(template)) {
            logger.debug("Found template argument", template);
            return template;
        } else {
            return undefined;
        }
    }
}

const questions = createQuestions();
askQuestions(questions);