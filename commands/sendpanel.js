const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("gcommands");

module.exports = {
    name: "sendpanel",
    description: "Send panel :O",
    guildOnly: "646690105020514305",
    slash: false,
    userRequiredPermissions: "ADMINISTRATOR",
    run: async({client, respond}) => {
      let embed = new MessageEmbed()
        .setTitle("Awm Bilişim Hizmetleri | Destek Talebi")
        .setDescription("**Lütfen Destek Talebi açmadan önce aşağıdaki kuralları okuyunuz.**\n1-> Talep içerisinde destek ekibini veya yetkilileri etiketlemek yasaktır!\n2-> Sadece talep üzerinden yardımcı olunur hiç bir yetkili özelden yardım etmek zorunda değildir ısrar etmeyiniz.\n3-> Destek sağlamadığımız alanlarda destek için ısrarcı olmak yasaktır.\n4-> Destek talebinde argo ve küfür içerikli konuşmak, küçük düşürücü, alay ederek konuşmak yasaktır!\n5-> Sadece hizmet sahibi sahip olduğu hizmet için talep açabilir. Farklı kişi veya farklı hizmetlerde destek sağlanmaz.\n**Destek Talebi açan herkes kuralları okumuş kabul edilir!**")
        .setColor("#fffff")
        .setImage("https://cdn.discordapp.com/attachments/856258043539750952/924322945109745734/Varlk_54x.png")
        .setFooter("Awm Bilişim Hizmetleri | 2022")

      let button = new MessageButton()
        .setLabel("Talep Aç")
        .setStyle("gray")
        .setID("support_ticket_create")
        .setEmoji("🎫")
      respond({
        content: embed,
        inlineReply: false,
        components: new MessageActionRow().addComponent(button)
      })
  }
};
