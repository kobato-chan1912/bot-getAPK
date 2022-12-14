const puppeteer = require('puppeteer-extra')
const express = require('express')
const app = express()
const port = 3000
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
require('dotenv').config();

// 
let chromePath = process.env.CHROME_PATH;
console.log(chromePath);


app.get('/', (req, res) => {
    res.send('Deploy Successfully!')
})

app.get('/apk/:id', (req, res) => {
    let id = req.params.id;

    puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
        try {
            const page = await browser.newPage()
            await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
            await page.setViewport({ width: 800, height: 600 })
            await page.goto('https://apksos.com/download-app/' + id)
            await page.waitForSelector('div.section.row > div.col-sm-12.col-md-8.text-center > p > a')
            let apkLink = await page.evaluate(() => {
                return document.querySelector('div.section.row > div.col-sm-12.col-md-8.text-center > p > a').href;
            });
            await page.goto('https://apksos.com/app/' + id)
            await page.waitForSelector('div.section.row > div.col-sm-12.col-md-8 > ul > li:nth-child(1)')
            let version =  await page.evaluate(() => {
                let text = document.querySelector('div.section.row > div.col-sm-12.col-md-8 > ul > li:nth-child(1)').innerText;
                return text.replace("Version: ", "");
            });
            await browser.close()
            res.json({ dlink: apkLink, version: version });
        } catch (error) {
            await browser.close()
            res.status(404).json({ dlink: '' });
        }

    })
})

// Port Listen 

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})