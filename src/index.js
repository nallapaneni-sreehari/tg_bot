const fs = require("fs");
const ytdl = require("ytdl-core");
const axios = require("axios");

const TelegramBot = require("node-telegram-bot-api");
const { BOT_TOKEN } = require("../config/config");

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
var URL = "";
var videoInfo = "";
var chatId = "";

bot.on("message", async (msg) => {
  console.log(`MSG :: `, msg);
  const message = msg.text;
  chatId = msg.chat.id;
  const username = msg.chat.username;

  console.log(`message ::: `, message);

  if (message.includes("youtube.com") || message.includes("youtu.be")) {
    URL = message;
    let validateURL = ytdl.validateURL(URL);

    console.log(`validateURL :: `, validateURL);

    if (!validateURL) {
      bot.sendMessage(
        chatId,
        `Hey ${username}, Please provide a valid YouTube video link !`
      );
      return;
    }
    videoInfo = await ytdl.getInfo(URL);
    let availableFormats = videoInfo.formats.map((v) => v.qualityLabel);

    let uniqAllFormats = new Set();
    availableFormats.map((item) => {
      if (item != null) {
        uniqAllFormats.add(item);
      }
    });

    let selectionText = "Select the video format to download \n";
    uniqAllFormats = [...uniqAllFormats];

    console.log(`uniqAllFormats :: `, uniqAllFormats);

    let allowedFormats = ["720p", "480p", "360p", "240p", "144p"];

    uniqAllFormats.map((v, i) => {
      if (allowedFormats.includes(v)) {
        selectionText += `${i + 1}. /${v}\n`;
      }
    });
    console.log(`selectionText:::`, selectionText);

    bot.sendMessage(chatId, selectionText);
  } else if (msg.entities[0].type == "bot_command" && URL) {
    let format = message.replace("/", "");

    console.log(`videoInfo.formats :: `, format);

    let selectedFormatVideo = videoInfo.formats.find(
      (v) => v.qualityLabel == format
    );

    console.log(`selectedFormatVideo :: `, selectedFormatVideo);

    if (!selectedFormatVideo) {
      bot.sendMessage(chatId, `Invalid video format selected.`);
      return;
    }

    let downloadURL = selectedFormatVideo.url;

    // console.log(`downloadURL :: `, downloadURL);

    let fileName = `${videoInfo.videoDetails.title}.mp4`;
    // downloadVideoAxios(downloadURL, fileName);
    downloadWithYtdl(URL, selectedFormatVideo);
    // console.log(`Format :: `, URL, format);
    // let writeStream = fs.createWriteStream(fileName);

    // ytdl(videoInfo, { quality: selectedFormatVideo.itag }).pipe(writeStream);

    // writeStream.on("finish", () => {
    //   bot.sendVideo(chatId, fileName).then(() => {
    //     // Delete the downloaded file after sending
    //     // fs.unlink(fileName, (err) => {
    //     //   if (err) {
    //     //     console.error(`Error deleting file: ${fileName}`, err);
    //     //   } else {
    //     //     console.log(`File deleted: ${fileName}`);
    //     //   }
    //     // });
    //   });
    // });
  }

  //   bot.sendMessage(
  //     chatId,
  //     `Hi ${username}, Paste your YouTube link !\n\n 1. /help`
  //   );
});

const downloadVideoAxios = (videoUrl, fileName) => {
  axios({
    url: videoUrl,
    method: "GET",
    responseType: "stream",
  })
    .then((response) => {
      const writeStream = fs.createWriteStream(fileName);
      response.data.pipe(writeStream);

      writeStream.on("finish", () => {
        console.log("Video downloaded successfully!");
        bot.sendVideo(chatId, fileName).then(() => {
          // Delete the downloaded file after sending
          fs.unlink(fileName, (err) => {
            if (err) {
              console.error(`Error deleting file: ${fileName}`, err);
            } else {
              console.log(`File deleted: ${fileName}`);
            }
          });
        });
      });

      writeStream.on("error", (err) => {
        console.error("Error downloading video:", err);
      });
    })
    .catch((err) => {
      console.error("Error fetching video:", err);
    });
};

const downloadWithYtdl = (videoURL, selectedFormat) => {
  console.log(`videoURL :: `, videoURL);

  //   console.log(`desiredFormat ::: `, desiredFormat);

  // Find the format object for the desired quality
  //   const selectedFormat = videoInfo.formats.find(
  //     (format) =>
  //       format.qualityLabel === desiredFormat &&
  //       format.hasVideo &&
  //       format.hasAudio
  //   );

  console.log(`selectedFormat :::: `, selectedFormat);

  if (!selectedFormat) {
    console.error("Desired format not available.");
    return;
  }

  // Assuming the videoDetails.title contains a valid filename
  //   const fileName = `${videoInfo.videoDetails.title}.mp4`;
  const fileName = `video.mp4`;

  // Download the video and audio together
  ytdl(videoURL, { quality: "lowest" })
    .pipe(fs.createWriteStream(fileName))
    .on("finish", () => {
      console.log("Video downloaded successfully!");
      bot.sendVideo(chatId, fileName).then(() => {
        // Delete the downloaded file after sending
        fs.unlink(fileName, (err) => {
          if (err) {
            console.error(`Error deleting file: ${fileName}`, err);
          } else {
            console.log(`File deleted: ${fileName}`);
          }
        });
      });
    })
    .on("error", (err) => {
      console.error("Error downloading video:", err);
    });
};
