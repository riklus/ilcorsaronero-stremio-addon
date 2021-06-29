import stremioSDK from 'stremio-addon-sdk';
const { addonBuilder, serveHTTP, publishToCentral } = stremioSDK;
import fs from 'fs'
import rp from 'request-promise'
import cheerio from 'cheerio'
import imdb from 'imdb-api'
import path from 'path';
import { fileURLToPath } from 'url';

// dirname, filename setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// COMMON constants
const COMS = {
    re: {       // regex expressions
        title: /(^[^-]*-+ *)(.+)( *-+[^-]*$)/
    },
    select: {   // cheerio selectors
        title: 'center > b > font',
        seeds: '#body > table:nth-child(8) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(2) > font:nth-child(1)',
        leech: '#body > table:nth-child(8) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(2) > font:nth-child(2)',
        size: '#body > table:nth-child(8) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)'
    },
    path: {     // file paths
        database: path.resolve(__dirname, 'database.json'),
        imdbkey: path.resolve(__dirname, 'imdbkey.json'),
        logo: 'https://lagazzettadelcorsaro.com/sm.svg'
    }
}

// cheerio setup
let $ = cheerio.load('', null, false);

// imdb setup
const cli = (function() {
    let key = JSON.parse(fs.readFileSync(COMS.path.imdbkey, 'utf8'));
    return new imdb.Client(key);
})()


// builder setup
const builder = new addonBuilder({
    id: 'org.ilcorsaronerounofficial',
    version: '1.0.0',
    description: "Add-on Stremio non ufficale per ilCorSaRoNeRo.",
    name: 'ilCorSaRoNeRo UnOfficial',
    logo: COMS.path.logo,

    catalogs: [],
    resources: ['stream'],
    types: ['movie'],
    idPrefixes: ['tt']
})

// load database
let database = (function () {
    let rawdata
    try {
        rawdata = fs.readFileSync(COMS.path.database, 'utf8')
    } catch (error) {
        console.log("[i] Can't find database, creating a new one...")
        fs.writeFileSync(COMS.path.database, '{}', 'utf8');

        return {}
    }

    let database
    try {
        database = JSON.parse(rawdata)
    } catch (error) {
        console.log("[!] Error in parsing the database")
        throw error
    }

    return database
})()
console.log('[i] Database loaded')

builder.defineStreamHandler(function (args) {
    if (args.type === 'movie') {
        console.log('\n==========================')
        return movieHandler(args);
    }
})


async function movieHandler(args) {
    const ID = args.id

    console.log(`Movie id: ${ID}`)
    
    if (database.hasOwnProperty(ID)) {
        console.log(`New Cached Request For: ${database[ID].imdb.title} ${database[ID].imdb.year}`)
        console.log(database[ID].streams)
        return {'streams': database[ID].streams}
    }

    const IMDB = await cli.get({ id: ID })
    let query = `${IMDB.title} ${IMDB.year}`
    console.log(`New Request For: ${query}`)
    
    // searching the site
    let url = `https://ilcorsaronero.pro/torrent-ita/1/${query}.html`
    let html = await rp(url)

    // scraping results
    let promisedStreams = []
    $('.lista > form', html).each((idx, element) => {
        if (idx < 7) { // Max 7 films
            let link = element.attribs.action
            console.log(link)

            // scraping single film info
            promisedStreams.push((async _ => {
                let html = await rp(link)

                $ = cheerio.load(html);

                // hash
                let hash = $('form > input[name=cerca]')[0].attribs.value
                
                // title
                let title = $(COMS.select.title)[0].children[0].data
                title = title.replace(COMS.re.title, '$2')    // repleaces "- title -" -> "title"

                // seeds
                let seeds = $(COMS.select.seeds).text()

                // size
                let size = $(COMS.select.size).text()
                
                // All together
                let streamTitle = `${title}\n 👤${seeds} 💾${size}`

                return { 'pageLink': link, 'infoHash': hash, 'title': streamTitle  }
            })())
        }
    })

    let streams = await Promise.all(promisedStreams)

    console.log({ "streams": streams })

    // Caching
    database[ID] = {
        'cacheDate': Date.now(),
        'imdb': IMDB,
        'streams': streams
    }
    console.log("Cached to database.")

    return { "streams": streams }
}

// Server online
serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })

// SIG Handling
function handleExit(signal) {
    console.log(` Received ${signal}. Closing my server properly...`)
    saveDatabase()
    console.log('\nAll done.')

    process.exit(0);
}
process.on('SIGINT', handleExit);
process.on('SIGQUIT', handleExit);
process.on('SIGTERM', handleExit);

function saveDatabase() {
    console.log('\n=== Database Backup Service ===')
    console.log('Saving database...')
    
    let databaseString
    try {
        databaseString = JSON.stringify(database, null, 2)
    } catch (error) {
        console.log('[!] ERROR in JSON stringify')
        throw error
    }

    try {
        fs.writeFileSync(COMS.path.database, databaseString, 'utf8');
    } catch (error) {
        console.log('[!] ERROR in saving database')
        console.log('[!] Dumping database in console')
        console.log('============ DUMP  START ============')
        console.log(databaseString)
        console.log('============ END OF FILE ============')
        throw error
    }

    console.log('Database saved.')
}

setInterval(function () {
    saveDatabase()
}, 1800000);    // 30 minutes
