const app = require("./app"); 

const port = 5500;
const ip = "127.0.0.1";

app.listen(port,ip, (err) => {
    if (err) {
        console.log("Unable to listen for connections", err);
        throw err;
      }
    console.log(`Server started on port http://${ip}:${port}`);
});
