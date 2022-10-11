const http = require('http');


const server = http.createServer((req, res) => {
    let body = []
    const { headers, method, url } = req; // parts of the packet

    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
    }).on('error', (err) => {
        console.log(err);
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    const responseBody = { headers, method, url, body };
    res.write(JSON.stringify(responseBody));
    res.end();
})
    
server.listen(3000);

// so, what are we looking at for our banking API?
// business requirements:
// open a bank account
// close a bank account
// withdraw funds
// deposit funds
// transfer funds
// create a log in functionality later
// => api should only be accessible with a unique identifier to denote the account being used