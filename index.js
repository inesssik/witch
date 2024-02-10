import puppeteer from "puppeteer";
import { parse, differenceInHours, addHours } from 'date-fns'
import axios from "axios";

const lastWitchDate = addHours(parse('30/03/2024', 'dd/MM/yyyy', new Date()), 2)
console.log(lastWitchDate)


setInterval(async () => await checkWitch(), 1000 * 60 * 10)

async function checkWitch() {
    try {
        const browser = await puppeteer.launch({ headless: 'new' })
        const page = await browser.newPage()

        await page.goto('http://ft.org.ua/ua/program', { waitUntil: 'domcontentloaded' })
        const dates = await page.evaluate(() => {
            let dates = ''

            let selectors = document.querySelectorAll('.performanceslist_item')
            selectors.forEach(selector => {
                if (selector.innerHTML.includes('Конотопська відьма')) {
                    dates += selector.querySelector('.date').innerHTML
                }
            })

            dates = dates.match(/([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}/g)
            return dates
        })

        for (const date of dates) {
            const parsedDate = addHours(parse(date, 'dd/MM/yyyy', new Date()), 2)
            const difference = differenceInHours(parsedDate, lastWitchDate)

            console.log(difference)

            if (difference > 0) {
                await sendBotMessage()
                return
            }
        }

        await browser.close()
    } catch (error) {
        console.log(error)
    }
}

async function sendBotMessage() {
    await axios.get('https://api.telegram.org/bot6551952618:AAEjQUt27ET6d5msrWjgHGmccjWIXJ7xg8M/sendMessage?chat_id=633180859&text=НОВІ БІЛЕТИ!!!')
}