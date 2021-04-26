const TelegramBot = require('node-telegram-bot-api')
const libre = require('libreoffice-convert');
const path = require('path');
const fs = require('fs');
const token = '1742254806:AAHAgC8TFhp-HS2Ki0OwDTxU4zrH5_cSlUk'
const bot = new TelegramBot(token, {
    polling: true
})
const fetch = require('node-fetch');
const request = require('request');


bot.on("message", async msg=>{
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const text = msg.text;
  const name = msg.chat.first_name;
  const username = msg.chat.username;

  // this is used to download the file from the link
  const  download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
      request(url).pipe(fs.createWriteStream(path)).on('close', callback);
    });
    
  };

  var ready = false
  bot.on('message', async (msg) => {
    let doc = ''  
    if (msg.document){
        console.log('Document:\n')
        console.log(msg.document)
        console.log('Begin')
        doc = msg.document
        const fileId = doc.file_id;
        const fileName = doc.file_name

        const newFilePath = 'pdfs/' + fileName.split('.')[0] + '.pdf'
        // there's other ways to get the file_id we just need it to get the download link an api request to get the "file directory" (file path)
        const res = await fetch(
          `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
        );
        // extract the file path
        const res2 = await res.json();
        const filePath = res2.result.file_path;

        // now that we've "file path" we can generate the download link
        const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;
        // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)

        download(downloadURL, path.join(__dirname, `${filePath}`), () =>{
            // Read file
            const extend = '.pdf'
            const FilePath = path.join(__dirname, `./${filePath}`);
            const outputPath = path.join(__dirname, `./${newFilePath}`);
            console.log(filePath);
            console.log('\n');
            console.log(outputPath);
            // Read file
            const enterPath = fs.readFileSync(FilePath);
            // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
            libre.convert(enterPath, extend, undefined, (err, done) => {
                if (err) {
                  console.log(`Error converting file: ${err}`);
                }
                // Here in done you have pdf file which you can save or transfer in another stream
                fs.writeFileSync(outputPath, done);
                bot.sendDocument(chatId, newFilePath);
            });

        });
    }
    if (msg.photo){
        console.log('Document:\n')
        console.log(msg.photo)
        console.log('Begin')
        photo = msg.photo[2]
        const fileId = photo.file_id
        const res = await fetch(
          `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
        );
        const res2 = await res.json();
        const filePath = res2.result.file_path;
        
        const newFilePath = 'pdfs/' + filePath.split('/')[1].split('.')[0] + '.pdf'
        const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;
 
        download(downloadURL, path.join(__dirname, `${filePath}`), async () => {  
            const imagesToPdf = require("images-to-pdf")
            await imagesToPdf([filePath], newFilePath)
            bot.sendDocument(chatId, newFilePath);
        });
    }  

  });    
})