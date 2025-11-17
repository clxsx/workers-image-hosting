import {
    Application,
    Router,
    normalizePathnameMiddleware
} from '@cfworker/web';
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

const router = new Router();

async function randomString(len) {
    len = len || 6;
    let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; 
    let maxPos = chars.length;
    let result = '';
    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
}

// Static resource routing
addEventListener("fetch", async (event) => {
    let pathname = new URL(event.request.url);
    let asset = new RegExp('/assets/.*', 'i');
    let index = new RegExp('/index.*', 'i');

    if (asset.test(pathname.pathname) || index.test(pathname.pathname)) {
        event.respondWith(handleEvent(event));
    }
});

async function handleEvent(event) {
  return getAssetFromKV(event);
}

router.get('/', ({ res }) => {
    res.redirect('/index.html');
});

let header = new Headers();
header.set('access-control-allow-origin', '*');

router.post('/api', async ({ req, res }) => {
    let form = req.body.formData();
    let img = (await form).get('img');
    const img_check = new RegExp("(.*?)\\.(png|jpe?g|gif|bmp|psd|tiff|tga|webp)", "i");

    // File format validation
    if (img_check.test(img.name)) {
        let url = await randomString();
        let check = await LINK.get(url);
        if (check !== null) {
            url = await randomString();
        }

        let stream = img.stream();
        await LINK.put(url, stream, {
            metadata: {
                size: img.size,
                name: url,
                type: img.type,
                date: new Date().getTime()
            }
        });

        res.headers = header;
        res.body = {
            link: req.url + '/img/' + url
        };
    } else {
        res.status = 400;
        res.headers = header;
        res.body = { info: 'File is not an image (404)' };
    }
});

router.get('/api/img/:p', async ({ req, res }) => {
  let body = await LINK.get(req.params.p, { cacheTtl: 864000, type: "stream" });
  let { metadata: { type, date, size } } = await LINK.getWithMetadata(req.params.p, { type: "text" });
  if (req.headers.has('If-None-Match')) {
      return res.status = 304;
  }
  res.headers = header;
  res.headers.set('Cache-Control', 'public, max-age=864000');
  res.type = type;
  res.etag = size;
  res.body = body;
});

new Application()
    .use(normalizePathnameMiddleware)
    .use(router.middleware)
    .listen();
