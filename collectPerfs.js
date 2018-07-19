const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");

const htmlFile = 'timetable.html';
const jsonFile = 'perfs.json';

const eventdaysContainerSelector = ".lineup__page--timetable .eventdays";
const eventdayData = "data-eventday-id";
const friDataIdSelector = 39;
const satDataIdSelector = 42;
const sunDataIdSelector = 45;

const perfsById = {};

class Stage {
    constructor (element) {
        let $ = cheerio(element);
        this.name = $.find("h4").text().trim().replace(/\s\s+/g, '');
    }
}

class Perf {
    constructor(element, stage) {
        let $ = cheerio(element);
        this.id = $.data('id');
        this.start = $.data('start');
        this.end = $.data('end');
        this.artist = $.find(".performance__artist").text();
        this.likes = 0;
        this.stage = stage;
    }
}

if (fs.existsSync(htmlFile))
    parseFile();
else {
    console.log("requesting...");
    request
        .get("https://www.tomorrowland.com/en/festival/line-up/friday-27-july-2018")
        .pipe(fs.createWriteStream(htmlFile).on('finish', () => parseFile()));
}

function parseFile () {
    console.log("parsing...");

    const $ = cheerio.load(fs.readFileSync(htmlFile));

    collect(parseDay(
        $(getdaySelector(friDataIdSelector))
    ));

    collect(parseDay(
        $(getdaySelector(satDataIdSelector))
    ));

    collect(parseDay(
        $(getdaySelector(sunDataIdSelector))
    ));

    fs.writeFile(jsonFile, JSON.stringify(perfsById));
    console.log(perfsById);
}

function collect (dayPerfs) {
    dayPerfs.forEach(perf => perfsById[perf.id] = perf);
}

function parseDay (eventday) {
    let stages = eventday.find(".stages .stage").map(handleStage).get();

    let dayPerfs = eventday.find(".stage__performances").map((index, stagPerfsElt) => {
        return cheerio(stagPerfsElt)
                        .find(".performance")
                        .map((i, perfElement) => new Perf(perfElement, stages[index]))
                        .get();
    }).get();
    return dayPerfs;
}

function handleStage (index, stageElement) {
    return new Stage(stageElement);
}

function getdaySelector (dayId) {
    return eventdaysContainerSelector + " [" + eventdayData + "=" + dayId + "]";
}
