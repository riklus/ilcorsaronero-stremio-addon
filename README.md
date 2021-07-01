# ilcorsaronero-stremio-addon

Add-on Stremio *non* ufficale per ilCorSaRoNeRo.  

Questo addon è stato creato, a scopo dimostrativo, solo per procrastinare lo studio di LDP.

## Setup

## Get the files and the needed key

**NOTE:** NodeJs is needed

### Clone the repo

```bash
git clone 'https://github.com/riklus/ilcorsaronero-stremio-addon'
```
Or just hit download

### Get the IMDB key

1. Go to: [OMDb API Website](https://www.omdbapi.com/apikey.aspx)
2. Select: FREE
3. Fill the fields
4. Check your e-mail inbox
5. Activate the key
6. Put the key inside the ```imdbkey.json``` file like this:
```json
{ "apiKey": "INSERT KEY HERE" }
```
and save the file

## Start the Local Server

```bash
cd ilcorsaronero-stremio-addon
node ./addon.js
```

The output will be something like:
```
[i] Can't find database, creating a new one...
[i] Database loaded
HTTP addon accessible at: http://127.0.0.1:7000/manifest.json
```
Now, copy the link http://127.0.0.1:7000/manifest.json

## Add the addon to Stremio
1. Open Stremio
2. Click the "puzzle thingy" in the top right of the screen
3. Click the "Search Addon" bar
4. Paste the link http://127.0.0.1:7000/manifest.json
5. Press enter to add the addon


All Done :)  

---

# Disclaimer

**ATTENTION:**  
I do NOT endorse piracy.  
I am NOT affiliated with ilCorSaRoNeRo in ANY way.  
This project does NOT contain any torrent or copyright protected material. Furthermore it does NOT contain any link to webpages detaining copyright protected material.  

**ATTENZIONE:**  
NON sostengo la pirateria.   
NON sono affiliato in ALCUN modo a ilCorSaRoNeRo.   
Questo progetto NON contiene alcun torrent o materiale protetto da copyright. Inoltre NON contiene alcun link a pagine che conservano materiale protetto da copyright.
