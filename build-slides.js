#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');

require('dotenv').config();

const slidesConfig = {
    "src": process.env.REMARK_SLIDES_SRC || "src/md",
    "output": process.env.REMARK_SLIDES_OUTPUT || "dist/",
    "templateSrc": process.env.REMARK_SLIDES_TEMPLATES_SRC || "src",
    "contentTemplateFile": process.env.REMARK_SLIDES_TEMPLATES_SRC + "/" + process.env.REMARK_SLIDES_CONTENT_TEMPLATE || "src/index.dynamic.template.html",
    "staticDir": process.env.REMARK_STATIC_DIR || "."
};

let cwd = process.cwd();

const argv = require('optimist').argv;
let isWatchModeEnabled = !!argv.watch;

const srcDirPath = path.resolve(cwd, slidesConfig.src);
const templatesSrc = path.resolve(cwd, slidesConfig.templateSrc);

const outDirPath = path.resolve(cwd, slidesConfig.output);
createDir(outDirPath);

const customTemplateFile = path.resolve(cwd, slidesConfig.contentTemplateFile);

const distTemplateFile = path.resolve(cwd, slidesConfig.output + "/" + process.env.REMARK_SLIDES_CONTENT_TEMPLATE);

const staticDir = slidesConfig.staticDir;

let templatesConfigJson = {
    "header": "",
    "footer": ""
};

function init() {
    initHeaderFooterTemplates();

    createDistTemplateFile();

    let files = fs.readdirSync(srcDirPath);

    files.forEach(function (file) {
        let destFile = getDestFile(file), srcFile = getSrcFile(file);
        let command = 'npx markdown-to-slides -l ' + distTemplateFile + ' ' + srcFile + ' -o ' + destFile;

        var convertToSlides = function() {
            execSync(command);
            updateHeaderFooter(destFile);
        };

        if (isWatchModeEnabled) {
            convertToSlides();
            fs.watchFile(srcFile, { interval: 100 }, function () {
                convertToSlides();
            });
        } else {
            convertToSlides();
        }
    });
}

function updateHeaderFooter(file) {
    replacePlaceHolders(file, {
        "{{header}}": templatesConfigJson.header,
        "{{footer}}": templatesConfigJson.footer
    });
}

function getSrcFile(mdFileName) {
    return path.resolve(srcDirPath, mdFileName);
}

function getDestFile(mdFileName) {
    return path.resolve(outDirPath, path.parse(mdFileName).name + ".html");
}

function createDistTemplateFile() {
    fs.copyFileSync(customTemplateFile, distTemplateFile);
    replacePlaceHolders(distTemplateFile, {"{{staticPath}}": staticDir});
}

function replacePlaceHolders(file, placeHolderObj) {
    let data = fs.readFileSync(file, 'utf8');

    for (const plcHldr in placeHolderObj) {
        data = data.replace(new RegExp(plcHldr, "ig"), placeHolderObj[plcHldr]);
    }

    fs.writeFileSync(file, data, 'utf8');
}

function createDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function initHeaderFooterTemplates() {
    templatesConfigJson["header"] = fs.readFileSync(templatesSrc + "/header.template.html", 'utf8');
    templatesConfigJson["footer"] = fs.readFileSync(templatesSrc + "/footer.template.html", 'utf8');
}

init();
