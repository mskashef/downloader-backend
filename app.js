const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded());
// download('https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.10.1.tar.xz');
// download('https://cdn.kernel.org/pub/linux/libs/ieee1394/libiec61883-1.0.0.tar.gz');
app.get('/', (req, res) => {
    const url = req.query.url;

    const fileChunks = [];
    let responseRanges = [];

    let i = 0;
    const done = () => {
        if (i === 8)
            res.status(200).json({chunks: fileChunks, ranges: responseRanges});
    };
    const download = (link) => {
        axios.head(link).then(res => {
            if (!res.headers['accept-ranges'] || res.headers['accept-ranges'] === 'none')
                return console.log("No Range Support!\nDownload Failed: This Downloader is just for Parallel Download!!!");
            console.log("Started Downloading");
            const length = Number(res.headers['content-length']);
            const chunkSize = Math.round(length / 8);
            const ranges = [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                return `bytes=${i === 0 ? 0 : 1 + i * chunkSize}-${i === 7 ? length - 1 : ((i + 1) * chunkSize)}`
            });
            console.log(ranges);
            responseRanges = ranges;
            ranges.map((range, index) => {
                console.log("Starting:", index);
                axios.get(link, {headers: {'range': range}, responseType: 'arraybuffer'}).then(res => {
                    fileChunks[index] = Buffer.from(res.data, 'binary').toString('base64');
                    // fileChunks[index] = res.data;
                    console.log("Done:", index);
                    i++;
                    done();
                }).catch(console.log);
            });
        }).catch(console.log)
    };
    download(url);
});
const port = 7000;
app.listen(port, () => console.log(`Server started on port: ${port}`));
