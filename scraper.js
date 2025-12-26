import puppeteer from 'puppeteer';
import fs from 'fs';

const CHANNEL_URL = 'https://www.youtube.com/@zi8gzag/videos';

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
    const maxRetries = 5;

    console.log('Scrolling to load all videos...');
    // Scroll loop until we reach the bottom
    while (retries < maxRetries) {
        items = await page.$$('ytd-rich-item-renderer');
        console.log(`Found ${items.length} videos so far...`);

        previousHeight = await page.evaluate('document.documentElement.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');

        try {
            // Wait for height to change
            await page.waitForFunction(
                `document.documentElement.scrollHeight > ${previousHeight}`,
                { timeout: 5000 }
            );
            retries = 0; // Reset retries if we loaded more content
        } catch (e) {
            retries++;
            console.log(`Waiting for more content... (Retry ${retries}/${maxRetries})`);
            // Wait a bit more to be sure
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    console.log(`Extracting data for all ${items.length} videos found...`);

    // Extract handles again to ensure we have the latest set
    const handles = await page.$$('ytd-rich-item-renderer');
    const processedData = [];

    for (let i = 0; i < handles.length; i++) {
        const handle = handles[i];

        // Scroll into view to trigger lazy loading of thumbnails/data
        await handle.evaluate(el => el.scrollIntoView({ block: 'center' }));
        // Brief wait for content to load
        await new Promise(r => setTimeout(r, 100));

        const data = await handle.evaluate(el => {
            const titleEl = el.querySelector('#video-title');
            const metaSpans = el.querySelectorAll('span.inline-metadata-item.style-scope.ytd-video-meta-block');

            let viewText = '0 views';
            for (const span of metaSpans) {
                if (span.innerText.includes('view')) {
                    viewText = span.innerText;
                    break;
                }
            }

            const imgEl = el.querySelector('ytd-thumbnail img');
            let thumb = imgEl ? imgEl.src : '';

            // Handle lazy loaded images (src might be empty or a placeholder)
            if (!thumb || thumb.startsWith('data:')) {
                const blobThumb = el.querySelector('ytd-thumbnail #thumbnail img');
                if (blobThumb) thumb = blobThumb.src;
            }

            // Fix resolution
            if (thumb && thumb.includes('mqdefault')) {
                thumb = thumb.replace('mqdefault.jpg', 'maxresdefault.jpg');
            } else if (thumb && thumb.includes('hqdefault')) {
                thumb = thumb.replace('hqdefault.jpg', 'maxresdefault.jpg');
            }

            return {
                title: titleEl ? titleEl.innerText.trim() : 'Unknown',
                viewsRaw: viewText,
                thumbnail: thumb
            };
        });

        processedData.push({ id: i + 1, ...data });

        if (i % 50 === 0) {
            console.log(`Processed ${i} / ${handles.length} videos...`);
        }
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

export const getRandomSet = (count) => {
  const shuffled = [...videoData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
`;

    if (!fs.existsSync('src/data')) {
        fs.mkdirSync('src/data', { recursive: true });
    }

    fs.writeFileSync('src/data/videoData.js', fileContent);
    console.log(`Successfully scraped ${finalData.length} videos and updated src/data/videoData.js`);

    await browser.close();
})();
