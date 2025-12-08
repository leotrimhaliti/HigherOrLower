import puppeteer from 'puppeteer';
import fs from 'fs';

const CHANNEL_URL = 'https://www.youtube.com/@zi8gzag/videos';
const TARGET_COUNT = 100;

const parseViews = (viewText) => {
    if (!viewText) return 0;
    const cleanBox = viewText.replace(/views?/i, '').trim();
    const numberPart = parseFloat(cleanBox.replace(/[^0-9.]/g, ''));
    let multiplier = 1;

    if (cleanBox.toUpperCase().includes('K')) multiplier = 1000;
    else if (cleanBox.toUpperCase().includes('M')) multiplier = 1000000;
    else if (cleanBox.toUpperCase().includes('B')) multiplier = 1000000000;

    return Math.floor(numberPart * multiplier);
};

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    console.log(`Navigating to ${CHANNEL_URL}...`);
    await page.goto(CHANNEL_URL, { waitUntil: 'networkidle2' });

    // Accept cookies if needed
    try {
        const acceptBtn = await page.$('button[aria-label="Accept all"]');
        if (acceptBtn) await acceptBtn.click();
    } catch (e) { }

    let items = [];
    let previousHeight = 0;
    let retries = 0;

    console.log('Scrolling to load videos...');
    // Scroll loop
    while (items.length < TARGET_COUNT && retries < 15) {
        items = await page.$$('ytd-rich-item-renderer');
        console.log(`Found ${items.length} videos so far...`);

        previousHeight = await page.evaluate('document.documentElement.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');

        try {
            await page.waitForFunction(
                `document.documentElement.scrollHeight > ${previousHeight}`,
                { timeout: 3000 }
            );
            retries = 0;
        } catch (e) {
            retries++;
            console.log('Waiting for more content...');
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    console.log(`Extracting data for up to ${TARGET_COUNT} videos...`);

    // Lazy load handling: scroll each item into view
    const handles = await page.$$('ytd-rich-item-renderer');
    const processedData = [];
    const count = Math.min(handles.length, TARGET_COUNT);

    for (let i = 0; i < count; i++) {
        const handle = handles[i];

        // Scroll into view
        await handle.evaluate(el => el.scrollIntoView({ block: 'center' }));
        // Brief wait for image load
        await new Promise(r => setTimeout(r, 200));

        const data = await handle.evaluate(el => {
            const titleEl = el.querySelector('#video-title');
            const metaSpans = el.querySelectorAll('span.inline-metadata-item.style-scope.ytd-video-meta-block');

            let viewText = '0 views';
            // Find "views" text
            for (const span of metaSpans) {
                if (span.innerText.includes('view')) {
                    viewText = span.innerText;
                    break;
                }
            }

            const imgEl = el.querySelector('ytd-thumbnail img');
            let thumb = imgEl ? imgEl.src : '';

            // Fix resolution
            if (thumb && thumb.includes('hqdefault')) {
                thumb = thumb.replace('hqdefault.jpg', 'maxresdefault.jpg');
            }

            return {
                title: titleEl ? titleEl.innerText.trim() : 'Unknown',
                viewsRaw: viewText,
                thumbnail: thumb
            };
        });

        processedData.push({ id: i + 1, ...data });
    }

    console.log('Processing view counts...');
    const finalData = processedData.map(v => ({
        ...v,
        views: v.viewsRaw ? parseViews(v.viewsRaw) : 0
    })).filter(v => v.title !== 'Unknown' && v.views > 0);

    const fileContent = `export const videoData = ${JSON.stringify(finalData.map(({ id, title, views, thumbnail }) => ({ id, title, views, thumbnail })), null, 4)};

export const formatViews = (views) => {
  return new Intl.NumberFormat('en-US').format(views);
};

export const getRandomPair = () => {
  const shuffled = [...videoData].sort(() => 0.5 - Math.random());
  return [shuffled[0], shuffled[1]];
};
`;

    fs.writeFileSync('src/data/videoData.js', fileContent);
    console.log(`Successfully scraped ${finalData.length} videos and updated src/data/videoData.js`);

    await browser.close();
})();
