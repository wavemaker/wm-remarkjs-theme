const path = require('path');
const fs = require('fs');
const {execSync} = require('child_process');

require('dotenv').config();

const slidesConfig = {
    "src": process.env.REMARK_SLIDES_SRC || "src/md",
    "output": process.env.REMARK_SLIDES_OUTPUT || "dist/",
    "templateSrc": process.env.REMARK_SLIDES_TEMPLATES_SRC || "src",
    "contentTemplate": process.env.REMARK_SLIDES_TEMPLATES_SRC + "/" + process.env.REMARK_SLIDES_CONTENT_TEMPLATE || "src/index.dynamic.template.html",
    "staticDir": process.env.REMARK_STATIC_DIR || "."
};
const argv = require('optimist').argv;

let isWatchModeEnabled = !!argv.watch;

const srcDirPath = path.join(__dirname, slidesConfig.src);
const templatesSrc = path.join(__dirname, slidesConfig.templateSrc);

const outDirPath = path.join(__dirname, slidesConfig.output);
createDir(outDirPath);

const customTemplate = path.join(__dirname, slidesConfig.contentTemplate);

const distTemplateFile = path.join(__dirname, slidesConfig.output + "/index.template.html");

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
        let command = 'npx markdown-to-slides -l ' + distTemplateFile + ' ' + getSrcFile(file) + ' -o ' + getDestFile(file);
        if (isWatchModeEnabled) {
            command = 'npx markdown-to-slides -w -l ' + distTemplateFile + ' ' + getSrcFile(file) + ' -o ' + getDestFile(file);
        }

        execSync(command);
    });
}

function getSrcFile(mdFileName) {
    const srcFile = path.join(srcDirPath, mdFileName);
    const srcTmpFile = path.join(outDirPath, path.parse(mdFileName).name + ".tmp.md");

    replacePlaceHolders(srcFile, srcTmpFile, {
        "{{header}}": templatesConfigJson.header,
        "{{footer}}": templatesConfigJson.footer
    });

    return srcTmpFile;
}

function getDestFile(mdFileName) {
    return path.join(outDirPath, path.parse(mdFileName).name + ".html");
}

function createDistTemplateFile() {
    replacePlaceHolders(customTemplate, distTemplateFile, {"{{staticPath}}": staticDir});
}

function replacePlaceHolders(srcFile, destFile, placeHolderObj) {
    let data = fs.readFileSync(srcFile, 'utf8');

    for (const plcHldr in placeHolderObj) {
        data = data.replace(new RegExp(plcHldr, "ig"), placeHolderObj[plcHldr]);
    }

    fs.writeFileSync(destFile, data, 'utf8')
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

function cleanUpTmpFiles() {
    let files = fs.readdirSync(outDirPath);
    files.forEach(function (file) {
        if (path.parse(file).name.indexOf("tmp") !== -1) {
            fs.unlinkSync(path.join(outDirPath, file));
        }
    });
}

init();
cleanUpTmpFiles();