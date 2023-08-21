const { BOT_EMOJI, TEMP_FOLDER } = require("../config");
const { extractDataFromMessage, downloadImage } = require("../utils");
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const pathToFfmpeg = './ffmpeg/bin/ffmpeg'

class Actions {
    constructor(bot, baileysMessage) {
        const { remoteJid, args, isImage } = extractDataFromMessage(baileysMessage);
        this.bot = bot;
        this.remoteJid = remoteJid;
        this.args = args;
        this.isImage = isImage;
        this.baileysMessage = baileysMessage;
    }

    async rolar() {
        if (!this.args || ![5, 6, 7, 8, 9, 10].includes(this.args.length)) {
            await this.bot.sendMessage(this.remoteJid, 
                { text: `${BOT_EMOJI} \nErro \nInformações incompletas\n\nEnvie: \n*/rolar YDX+M*\n\n*Y* número de rolagens\n*X* número de faces\n*M* mofificador` 
            });
            return;
        }


        try {
            const parts = this.args;
            /*const [num_rolls, sides] = parts[1].split('D').map(Number);
            const modifier = Number(parts[3]);
            
            await this.bot.sendMessage(this.remoteJid, {
                text: `${BOT_EMOJI} \n${parts}\n${num_rolls}\n${sides}\n${modifier}`
            })*/
            const match = parts.match(/(\d+)D(\d+)\+(\d+)/);
            /*await this.bot.sendMessage(this.remoteJid, {
                text: `${BOT_EMOJI} \n${match}`
            })*/
           
            const num_rolls = parseInt(match[1]);
            const sides = parseInt(match[2]);
            const modifier = parseInt(match[3]);

            /*await this.bot.sendMessage(this.remoteJid, {
                text: `${BOT_EMOJI} \n${parts}\n${num_rolls}\n${sides}\n${modifier}`
            })*/
            

            const rolls = [];
            let total_rolagem = 0;

            for (let i = 0; i < num_rolls; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                rolls.push(roll);
                total_rolagem += roll;
            }

            const total = total_rolagem + modifier;

            const rolls_str = rolls.join(' + ');
            const response_ind = `_Rolagens:_ (${rolls_str})`;
            const response = `_Total rolagens:_ ${total_rolagem}\nTotal geral: ${total}`;

            console.log(response_ind);
            console.log(response);

            const replyMessage = `${response_ind}\n${response}`; 
            await this.bot.sendMessage(this.remoteJid, 
                { text: `${BOT_EMOJI} \n${replyMessage}` 
            });


            

        } catch (error) {
            console.log(error);
            await this.bot.sendMessage(this.remoteJid, {
                text: `${BOT_EMOJI} \nErro!\nVerifique o código!`
            })

        }
                   


    }

    async sticker() {
        if (!this.isImage) {
            await this.bot.sendMessage(this.remoteJid, { text: `${BOT_EMOJI} \nErro \nSelecione a imagem que deseja transformar em figurinha!` });
            return;
        }

        const inputPath = await downloadImage(this.baileysMessage, 'input');
        const outputPath = path.resolve(TEMP_FOLDER, 'output.webp');

        exec(`${pathToFfmpeg} -i ${inputPath} -vf scale=512:512 ${outputPath}`, async (error) => {
            if (error) {
                await this.bot.sendMessage(this.remoteJid, { text: `${BOT_EMOJI} \nErro ao converter img para figurinha` });
                return;
            }

            await this.bot.sendMessage(this.remoteJid, {
                sticker: { url: outputPath }
            });

            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    }
}

module.exports = Actions;
