const { MessageEmbed, Message, MessageAttachment } = require("discord.js");
const Discord = require("discord.js")
const { MessageButton, MessageActionRow } = require("gcommands/src");
const ticketModel = require('../models/model.js');

const userModel = require('../models/userModel.js');

module.exports = {
    name: "clickButton",
    once: false,
    run: async(client, button) => {
        await button.defer();

        let buttonMember = button.clicker.member;
        let guild = button.guild;

        if(button.id == "support_ticket_create") {
            let allChannels = client.channels.cache.filter(m => m.type == "text" && m.name.includes("talep-")).map(m => m.name.split("talep-")[1]);
            let zatenmevcutembed = new MessageEmbed()
            .setDescription("Üzgünüm Zaten Bir Destek Talebin Mevcut.")
            .setColor("#0023b0")
            .setImage("https://awmbilisim.com/assets/img/logo.png")
            .setFooter("Awm Bilişim Hizmetleri | 2021")
            let already = allChannels.some(v => buttonMember.user.id == v)
            if(already === true) {
                return buttonMember.send(zatenmevcutembed)
            }
            let ticketChannel = await guild.channels.create(`talep-${buttonMember.user.id}`, {
                type: "text",
                topic: `Destek Talebinin Sahibi: ${buttonMember.user.username}`,
                parent: client.tickets.category,
                permissionOverwrites: [
                    {
                        id: buttonMember.id,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            let supportEmbed = new MessageEmbed()
                .setDescription("İlgili ekip kısa sürede cevap verecektir.\nTalebi kapatmak için :lock: butonuna basmanız yeterli olacaktır.")
                .setColor("#0023b0")
                .setImage("https://awmbilisim.com/assets/img/logo.png")
                .setFooter("Awm Bilişim Hizmetleri | 2021")

            let supportButton = new MessageButton()
                .setLabel("Kapat")
                .setEmoji("🔒")
                .setStyle("red")
                .setID(`ticket_close_${ticketChannel.id}`)
 
            
            ticketChannel.send({
                content: `${buttonMember.user} Hoşgeldin! <@&775669240791171072> Rolündeki Kişiler Sizinle En Kısa Sürede İlgilenecektir.`, 
                embeds: supportEmbed, 
                components: new MessageActionRow().addComponent(supportButton)
            }).then(a => {
                ticketModel.create({ID: ticketChannel.id, TicketAuthor: buttonMember.user.id, TicketAuthorTag: buttonMember.user.tag, TicketOpenDate: Date.now()}, (err) =>
                {
                    if(err) {
                        throw err;
                    }
                })
            })
            let talepolusturulduembed = new MessageEmbed()
            .setDescription("Talebin oluşturuldu. "+ ticketChannel)
            .setColor("#0023b0")
            .setImage("https://awmbilisim.com/assets/img/logo.png")
            .setFooter("Awm Bilişim Hizmetleri | 2021")
            buttonMember.send(talepolusturulduembed)
        }

        if(button.id == `ticket_close_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("talep-")[1]) || client.users.cache.get(ticketChannel.name.split("kapali-")[1])

            let yes = new MessageButton().setLabel("").setEmoji("✅").setStyle("gray").setID(`ticket_close_yes_${buttonMember.user.id}`)
            let no = new MessageButton().setLabel("").setEmoji("❌").setStyle("gray").setID(`ticket_close_no_${buttonMember.user.id}`)

            let msg = await ticketChannel.send({content: `${buttonMember.user} Talebi kapatmak istiyormusun?`, components: new MessageActionRow().addComponent(yes).addComponent(no)})
            let filter = (button) => buttonMember.user.id == button.clicker.user.id
            let collector = await ticketChannel.createButtonCollector(msg, filter, { max: 1, time: 60000, errors: ["time"] })

            collector.on("collect", button => {
                if(button.id == `ticket_close_yes_${button.clicker.user.id}`) {
                    msg.delete();

                    let closedEmbed = new MessageEmbed()
                        .setColor("#4287f5")
                        .setDescription(`Talep ${button.clicker.user} adlı kişi tarafından kapatıldı.\nTalebin Sahibi: ${createdBy}\n\n🔓 Talebi Tekrar Aç\n📛 Talebi Sil\n💫 Talebi Yazdır`)

                    let reopen = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_reopen_${ticketChannel.id}`)
                        .setEmoji("🔓")
                        .setStyle("green")
                   
                    let deleteButton = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_delete_${ticketChannel.id}`)
                        .setEmoji("📛")
                        .setStyle("red")


                    let transcriptButton = new MessageButton()
                        .setLabel("")
                        .setID(`ticket_transcript_${ticketChannel.id}`)
                        .setEmoji("💫")
                        .setStyle("gray")

                    let ownButton = new MessageButton()
                    .setLabel("")
                    .setID(`ticket_benim_${ticketChannel.id}`)
                    .setEmoji("👷")
                    .setStyle("green")

                    button.channel.edit({
                        name: `kapali-${createdBy}`,
                        parentID: client.tickets.closedCategory,
                        permissionOverwrites: [
                            {
                                id: createdBy.id,
                                deny: ["VIEW_CHANNEL"] 
                            },
                            {
                                id: guild.roles.everyone,
                                deny: ["VIEW_CHANNEL"]
                            },
                            {
                                id: client.tickets.moderatorRole,
                                allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                            }
                        ]
                    })

                    button.channel.send({embeds: closedEmbed, components: new MessageActionRow().addComponent(reopen).addComponent(deleteButton).addComponent(transcriptButton).addComponent(ownButton)}).then(a => {
                        button.channel.messages.fetch({ limit: 100 }).then(b => {
                            
                            var bff = Buffer.from(b.map(y => y.author.id + ' -> [ '+ y.author.tag + '] ' + y.content).reverse().join('<br>'))
                            ticketModel.findOneAndUpdate({ID: button.channel.id}, {TicketClosedDate: Date.now(), TicketContent: bff}, (err) =>
                            {
                                if(err) {
                                    throw err;
                                }
                            })
                        })
                           

                        
                    })
                } else {
                    msg.delete();
                }
            })
        }

        if(button.id == `ticket_reopen_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("talep-")[1]) || client.users.cache.get(ticketChannel.name.split("kapali-")[1])

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            systemMessages.forEach(msg => {msg.delete()})

            let supportEmbed = new MessageEmbed()
                .setColor("#32a852")
                .setDescription("İlgili ekip kısa sürede cevap verecektir.\nTalebi kapatmak için :lock: butonuna basmanız yeterli olacaktır.")
                .setColor("#0023b0")
                .setImage("https://awmbilisim.com/assets/img/logo.png")
                .setFooter("Awm Bilişim Hizmetleri | 2021")

            let supportButton = new MessageButton()
                .setLabel("Kapat")
                .setEmoji("🔒")
                .setStyle("red")
                .setID(`ticket_close_${ticketChannel.id}`)


            
            ticketChannel.edit({
                name: `talep-${createdBy}`,
                parentID: client.tickets.category,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        allow: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            ticketChannel.send({content: `${createdBy} Talebin Tekrar Açıldı.`, embeds: supportEmbed, components: new MessageActionRow().addComponent(supportButton)}).then(a => {
                ticketModel.findOneAndUpdate({ID: a.id, TicketAuthor: buttonMember.user.id}, {TicketOpenDate: Date.now(), TicketClosedDate: null}, (err) =>
                {
                    if(err) {
                        throw err;
                    }
                })

            })
        }

        if(button.id == `ticket_delete_${button.channel.id}`) {
            let ticketChannel = button.channel;

            ticketChannel.delete();
        }
        if(button.id == `ticket_benim_${button.channel.id}`) {
            let ticketChannel = button.channel;
            ticketModel.findOne({ID: ticketChannel.id}, (err, data) => {
                if (err) {
                    throw err;
                }
                if (data.TicketStaff == null) {
                    userModel.findOne({ID: buttonMember.user.id}, (err, data) => {
                        if (err) {
                          throw err;
                        }
                        if (data == null) {
                          userModel.create({ID: buttonMember.user.id, UserTag: buttonMember.user.tag, TotalTickets: 1})
                          ticketModel.findOneAndUpdate({ID: ticketChannel.id}, {TicketStaff: buttonMember.user.id}, (err) => {
                            if (err) {
                                throw err;
                              }
                          })
                          return ticketChannel.send('Bu Talep Senin Listene Eklendi! <@'+ buttonMember + '>')
                        } else {
                          var currentTickets = data.TotalTickets + 1;
                          userModel.findOneAndUpdate({ID: buttonMember.user.id}, {TotalTickets: currentTickets}, (err) => {
                            if (err) {
                              throw err;
                            }
                          })
                          ticketModel.findOneAndUpdate({ID: ticketChannel.id}, {TicketStaff: buttonMember.user.id}, (err) => {
                            if (err) {
                                throw err;
                              }
                          })
                          return ticketChannel.send('Bu Talep Senin Listene Eklendi! <@'+ buttonMember + '>') 
                    
                        }
                      })
                }
                if (data.TicketStaff != null) {
                    return ticketChannel.send('Bu Talebin Sahibi Zaten Mevcut! <@'+ buttonMember + '>')
                }



            })

        }


        if(button.id == `ticket_transcript_${button.channel.id}`) {
            let ticketChannel = button.channel;

            ticketChannel.messages.fetch({ limit: 100 }).then(b => {
                var bff = Buffer.from(b.map(y => y.author.id + ' -> [ '+ y.author.tag + '] ' + y.content).reverse().join('<br>'))
                ticketChannel.send(new Discord.MessageAttachment(bff, `${ticketChannel.name}.html`))
            })
        }

        function msToTime(ms) {
            let fullFill = (a, limit) => ("0".repeat(69) + a.toString()).slice(limit ? -limit : -2);

            let daet = new Date(ms);
            
            let day = fullFill(daet.getDate());
            let month = fullFill(daet.getMonth());
            let year = fullFill(daet.getFullYear(), 4);
            
            let hours = fullFill(daet.getHours());
            let mins = fullFill(daet.getMinutes());
            let secs = fullFill(daet.getSeconds());
            
            return `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
        }
    }
}
