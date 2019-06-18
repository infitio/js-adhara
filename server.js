const http = require('http');
const fs = require('fs');

let port = process.argv[2]||4000;

function matchRule(str, rule) {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
}

http.createServer((req, res)=>{
    let rs = Date.now();
    let sp = req.url.split("?")[0].split("/");
    if(sp[sp.length-1].indexOf(".") !== -1){
        try{
            let file_name = sp[sp.length-1];
            // let ssp = file_name.split(".");
            // let fe = ssp[ssp.length-1];
            let headers = {};
            if(matchRule(file_name, "(.*).(eot|otf|ttf|ttc|woff|woff2|font.css)")){
                headers["Access-Control-Allow-Origin"] = "*";
            }else if(matchRule(file_name, "(.*).map")){
                headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            }else if(matchRule(file_name, "(.*).css")){
                headers["Content-Type"] = "text/css; charset=UTF-8";
            }else if(matchRule(file_name, "(.*).js")){
                headers["Content-Type"] = "application/javascript; charset=UTF-8";
            }else if(matchRule(file_name, "(.*).svg")){
                headers["Content-Type"] = "image/svg+xml svg svgz";
            }else if(matchRule(file_name, "(.*).png")){
                headers["Content-Type"] = "image/png";
            }else if(matchRule(file_name, "(.*).jpg")){
                headers["Content-Type"] = "image/jpg";
            }
            if(req.headers.origin){
                headers["Access-Control-Allow-Origin"] = req.headers.origin;
                headers["Access-Control-Allow-Credentials"] = true;
                // headers["Access-Control-Allow-Headers"] = "X-CSRF-Token";
            }
            res.writeHead(200, headers);
            if(req.method === "OPTIONS"){
                res.write("OK");
                console.log("--------------------------------", req.headers.origin);
            }else{
                res.write(fs.readFileSync(sp.join("/").substring(1)));
            }
        }catch(e){
            console.error(e.message);
            res.writeHead(404, {'Content-Type': 'text/plain'});
        }
    }else{
        // res.writeHead(200, {'Content-Type': 'text/html'});
        try{
            res.write(fs.readFileSync("index.html"));
        }catch (e) {
            console.error(e.message);
            res.writeHead(404, {'Content-Type': 'text/plain'});
        }
    }
    console.log(`${Date.now()-rs} ms | ${new Date()} | "200" | ${req.url}`);
    res.end();
}).listen(port, {host:"0.0.0.0"});
console.info(`App listening on ${port}`);