#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const meow = require('meow');
const path = require('path');
const spawn = require('cross-spawn');

const logger = require('./logger')("verbose");
const { CHOICE_ORDER } = require('./constants');

const CURR_DIR = process.cwd();
const TEMPLATE_DIR = path.join(__dirname, 'templates');

const CHOICES = getChoices(TEMPLATE_DIR);

const cli = meow(`
        Usage
          $ generate-project <name>
     
        Options
          --dry-run, -n Do not generate project, but show directory and package.json
          --install, -i Install dependencies after project generation
          --yes, -y Use default values for package.json
          --template, -t Name of the template to use
          --version, -v Get current version
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
            type: 'boolean',
            alias: 'i'
        },
        "version": {
            type: 'boolean',
            alias: 'v'
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
                message: 'Run install?'
            }
        )
    }

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
        shouldInstall = true
    } = answers;

    const templatePath = path.join(TEMPLATE_DIR, project)
    const targetPath = path.join(CURR_DIR, name);

    const { installer } = shouldInstall ? await askAboutInstaller() : { installer: 'npm' };

    const { shouldGitInit } = await inquirer.prompt([
        {
            name: 'shouldGitInit',
            type: 'confirm',
            message: 'Create Git Repository?'
        }
    ])

    if (!await confirmOptions(targetPath, { name, version, description, author, license, project })) {
        return;
    }

    if (!cli.flags.dryRun) {
        await generateProject(templatePath, targetPath);

        await spawnPromise('npm', ['pkg', 'set', `name=${name}`, `version=${version}`, `description=${description}`, `author=${author}`, `license=${license}`], {
            stdio: 'inherit',
            cwd: targetPath
        });

        if (shouldInstall) {
            await installDependencies(targetPath, installer);
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

function askAboutInstaller() {
    return inquirer.prompt([
        {
            name: 'installer',
            type: 'list',
            message: 'Choose Installer',
            choices: ['npm', 'yarn']
        }
    ])
}

async function generateProject(templatePath, targetPath) {
    await fs.promises.mkdir(targetPath);
    await copyDirectoryContents(templatePath, targetPath);
}

function spawnPromise(command, args, options) {
    return new Promise((resolve, reject) => {
        spawn(command, args, options)
            .on('close', code => code ? reject() : resolve());
    });
}

async function installNpm(cwd) {
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

async function installYarn(cwd) {
    logger.info(`> yarn`);

    try {
        await spawnPromise('yarn', {
            stdio: 'inherit',
            cwd
        });
        logger.info(chalk`{blue Install finished}`);
    } catch {
        logger.info(chalk`{red There was an error installing the project}`);
        logger.info(chalk`Install manually with {underline yarn} in {underline ${targetPath}`);
    }
}

async function installDependencies(cwd, installer) {
    const installers = {
        'npm': installNpm,
        'yarn': installYarn
    }

    await installers[installer]?.(cwd) ?? logger.error('Invalid installer')
}

async function initializeGitRepo(cwd) {
    logger.info(`> git init`);

    try {
        await spawnPromise('git', ['init'], {
            stdio: 'inherit',
            cwd
        });

        logger.info(`> git add .`);
        await spawnPromise('git', ['add', '.'], {
            stdio: 'inherit',
            cwd
        });

        logger.info(`> git commit -m "Initial commit"`);
        await spawnPromise('git', ['commit', '-m', '"Initial commit"'], {
            stdio: 'inherit',
            cwd
        });

        logger.info(chalk`{blue Git repo created}`);
    } catch (err) {
        logger.info(chalk`{red There was an error initializing the git repo}`);
        logger.info(chalk`Initialize repo manually with {underline git init} in {underline ${targetPath}`);
    }
}

async function copyDirectory(templateFilePath, targetFilePath) {
    await fs.promises.mkdir(targetFilePath);
    await copyDirectoryContents(templateFilePath, targetFilePath);
}

async function copyDirectoryContents(source, dest) {
    const files = await fs.promises.readdir(source);

    await Promise.all(files.map(async file => {
        const sourcePath = path.join(source, file);
        const destPath = path.join(dest, file);

        const stats = await fs.promises.stat(sourcePath);

        if (stats.isFile()) {
            await fs.promises.copyFile(sourcePath, destPath);
        } else if (stats.isDirectory()) {
            await copyDirectory(sourcePath, destPath);
        }
    }));
}

function getChoices(templatePath) {
    const templates = fs.readdirSync(templatePath).sort((a, b) => CHOICE_ORDER.indexOf(b) - CHOICE_ORDER.indexOf(a));

    return templates;
}

function getTemplate(template) {
    if (template && CHOICES.includes(template)) {
        logger.debug("Using template: ", template);
        return template;
    }
}

if (cli.flags.version) {
    logger.info(process.env.npm_package_version)
} else {
    const questions = createQuestions();
    askQuestions(questions);
}
