const fs = require("fs");

const perfJsonFile = "perfs.json";
const likesJsonFile = "likes.json";

const bundles = [
    {
        f: perfJsonFile,
        r: {}
    },
    {
        f: likesJsonFile,
        r: {}
    }
];

let notReady = bundles.length;

class Perfs {
    constructor () {
        this.perfs = [];
        // key is perf id,
        // value is perf index's
        this.preSortedMap = {};
    }

    push (perf) {
        let index = this.preSortedMap[perf.id];
        if (!index) {
            this.perfs.push(perf);
            this.preSortedMap[perf.id] = index = this.perfs.length - 1;
        }

        this.perfs[index].likes++;
    }

    sort () {
        return this.perfs.sort((a, b) => {
            var diff = b.likes - a.likes;
            return diff == 0 ? a.start.localeCompare(b.start) : diff;
        });
    }
}

bundles.forEach(bundle => {
    fs.readFile(bundle.f, (err, data) => {
        if (err)
            throw err;
        notReady--;

        bundle.r = JSON.parse(data);
        next();
    });
})

function next () {
    if (notReady > 0)
        return;

    let perfsById = bundles[0].r;
    let peopleLikes = bundles[1].r;

    const perfsPref = new Perfs();

    Object.values(peopleLikes).forEach(personLikes => {
        personLikes.forEach(likeId => {
            let perf = perfsById[likeId];
            if (perf)
                perfsPref.push(perf);
        })
    });

    filterOrderPerfs(perfsPref);
}

function filterOrderPerfs(perfs) {
    let sortedPerfs = perfs.sort();
    const perDay = {
        27: [],
        28: [],
        29: []
    };
    sortedPerfs.forEach(p => perDay[getDay(p)].push(p));
    console.log("Friday 27", perDay["27"]);
    console.log("Saturday 28", perDay["28"]);
    console.log("Sunday 29", perDay["29"]);
    fs.writeFileSync("result.json", JSON.stringify(perDay));
}

function getDay (perf) {
    return perf.start.split("T")[0].split("-")[2];
}
