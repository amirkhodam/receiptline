const http = require('http');
const net = require('net');
const url = require('url');
const receiptline = require('receiptline');

// ReceiptLine
const text = `{image:iVBORw0KGgoAAAANSUhEUgAAAQAAAAA8AgMAAAD004yXAAAACVBMVEVwAJsAAAD///+esS7BAAAAAXRSTlMAQObYZgAAAZtJREFUSMftlkGOwyAMRW0J76kE97GlZu9KcP+rzCekKak6bWdGmrZS6KIG/7yAbQhEe+tN6qUpDZ1KPHT8SnhpeaP6FlA2wicBsgOeBpTF6gDfZHgj9Jt1sAMeAYYE/RFQngYMuX49gD8fMObjkwB+++h+DeB3x/qdvfD/AP4QwPXX+ceAUdV6Y7K/3Vr7rWhv73ZN9XVHzOUdlm6v9ay3pM1eLT+Ppv63BWjz8jJU0vpUWgGs5yfihrN451G+lq7i2bkF8Bagw3Qv0hEQKGTPPjnGxJtZrSIcJy5ciJ3JStbarjrgwOtVK7Z1iLFOOgOSR3WstTqMqCcVFlITDnhhNhMKzJNIA3iEBr1uaAfArA7bSWdAkRrIsJSMrwXbJBowEhogwe9F+NilC8D1oIyg43fA+1WwKpoktXUmsiOCjxFMR+gEBfwcaJ7qDBBWNTVSxKsZZhwkUgkppEiJ1VOIQdCFtAmNBQg9QWj9POQWFW4Bh0HVipRIHlpEUVzUAmslpgQpVcS0SklcrBqf03u/UvVhLd8H5Hffil/ia4Io3warBgAAAABJRU5ErkJggg==}

市ヶ谷駅前店
東京都千代田区九段1-Y-X
2021年 2月 7日(日) 21:00
{border:line; width:29}
^領　収　証
{border:space; width:*,2,10}
ビール                 | 2|    ¥1,300
千鳥コース             | 2|   ¥17,280
-------------------------------------
{width:*,20}
^合計             |          ^¥18,580
現　　金          |           ¥20,000
お 釣 り          |            ¥1,420
{code:20210207210001; option:48,hri}`;
const svg = receiptline.transform(text, { cpl: 35, encoding: 'cp932', spacing: true });

// HTML
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt</title>
<style type="text/css">
div {
    float: left;
    padding: 24px;
    transform-origin: top left;
    box-shadow: 0 6px 12px rgba(0, 0, 0, .5);
    /*background: linear-gradient(lavender, ghostwhite);*/
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAADAQMAAACplL1tAAAABlBMVEWQ7pD///+SGxGEAAAAFElEQVQI12M4l/+AYf/mCQyFdwoAJNIF3T0xRTsAAAAASUVORK5CYII=);
}
</style>
<script type="text/javascript">
window.onload = () => {
    document.getElementsByName('bg').forEach(el => {
        el.onchange = event => {
            document.querySelector('div').className = event.target.value;
        };
    });
    document.getElementById('zoom').onchange = event => {
        document.querySelector('div').style.transform = 'scale(' + event.target.value + ')';
    };
};
</script>
</head>
<body>
<a href="/print">Print</a>
<hr>
<div>${svg}</div>
</body>
</html>`;

// Printer
const printer = {
    "host": "127.0.0.1",
    "port": 9100,
    "cpl": 35,
    "encoding": "cp932",
    "spacing": true,
    "command": "escpos"
};

// Server
const server = http.createServer((req, res) => {
    switch (req.method) {
        case 'GET':
            if (url.parse(req.url).pathname === `/print`) {
                const socket = net.connect(printer.port, printer.host, () => {
                    socket.end(receiptline.transform(text, printer), 'binary');
                });
            }
            res.end(html);
            break;
        default:
            res.end();
            break;
    }
});
server.listen(8080, "127.0.0.1", () => {
    console.log('Server running at http://127.0.0.1:8080/');
});