$(document).ready(() => {
    /*///////////////////////////////////////////
                TOKEN
    //////////////////////////////////////////*/

    let locale;
    if (!localStorage.getItem("locale") || localStorage.getItem("locale") === "" || localStorage.getItem("locale") === null) {
        localStorage.setItem("locale", "en");
    }
    locale = localStorage.getItem("locale");
    let localeFile = locales[locale];

    let token;
    if (!localStorage.getItem("token") || localStorage.getItem("token") === "" || localStorage.getItem("token") === null) {
        token = prompt(localeFile.token.prompt, "");
        localStorage.setItem("token", token);
    }
    token = localStorage.getItem("token");

    const client = new Discord.Client();
    client.login(token).catch(() => {
        alert(localeFile.token.invalid);
    });

    const guilds = $("#guilds");
    const channels = $("#channels");
    const channelNameLabel = $("#channelNameLabel");
    const channelName = $("#channelName");
    const chat = $("#chat");
    const toSend = $("#toSend");
    const lastMessages = $("#lastMessages");
    const clearChat = $("#clearChat");
    const send = $("#send");
    const guildName = $("#guildName");
    const leaveGuild = $("#leaveGuild");
    const inviteBtn = $("#inviteBtn");
    const refreshToken = $("#refreshToken");
    const refreshChat = $("#refreshChat");

    /*///////////////////////////////////////////
                    LOADING TRANSLATION
    //////////////////////////////////////////*/
    $("#lastMessagesHead").html(`<img class="avatarIMG" src='./img/icon/clock.png'> ${localeFile.headings.lastMessages}`);
    clearChat.html(`♻ ${localeFile.text.clearLastMessages}`);
    toSend.attr("placeholder", localeFile.text.sendPlaceholder);
    send.html(`↩ ${localeFile.buttons.send}`);
    guildName.html(`<img class="avatarIMG" src="./img/icon/info.png"> ${localeFile.headings.guildName}`);
    leaveGuild.html(`🚪 ${localeFile.buttons.leave}`);
    inviteBtn.html(`✉ ${localeFile.buttons.invite}`);
    $("#autoScrollHead").html(localeFile.headings.autoScroll);
    $("#last").html(localeFile.headings.lastMessages);
    channelNameLabel.html(localeFile.text.channelNameLabel);
    $("#animCheck").html(localeFile.text.scrollCheck);
    channelName.html(`<img class="avatarIMG" src='./img/icon/chat.png'> ${localeFile.text.channelNameLabel}`);
    refreshToken.html(`🔑 ${localeFile.buttons.editToken}`);
    refreshChat.html(`🔁 ${localeFile.buttons.refreshChat}`);
    $("#language").html(`🏳️ ${localeFile.buttons.changeLanguage}`);

    /*///////////////////////////////////////////
                    FUNCTIONS
    //////////////////////////////////////////*/

    function createMessage(message) {
        let userTag = escapeHtml(message.author.tag);
        let userId = message.author.id;
        let avatarUrl = message.author.avatarURL() || `./img/discord_defaults_avatars/${message.author.discriminator % 5}.png`;
        let userAvatar = `<a href="${avatarUrl}" target="_blank"><img alt="" src="${avatarUrl}" class="avatarIMG"></a>`;
        let creationDate = new Date(message.createdAt);
        let timestamp = `${leadingZero(creationDate.getDate())}/${leadingZero(creationDate.getMonth() + 1)}/${creationDate.getFullYear()} ${leadingZero(creationDate.getHours() + 1)}:${leadingZero(creationDate.getMinutes())}`;
        let html;
        let attachments = [];

        Array.from(message.attachments).forEach((attachment) => {
            let attachmentTxt = `<a href="${escapeHtml(attachment[1].url)}" target="_blank">`;
            if (attachment[1].url.endsWith(".jpg") || attachment[1].url.endsWith(".jpeg") || attachment[1].url.endsWith(".png")) {
                attachmentTxt += localeFile.fileType.img;
            } else if (attachment[1].url.endsWith(".docx") || attachment[1].url.endsWith(".odt")) {
                attachmentTxt += localeFile.fileType.doc;
            } else if (attachment[1].url.endsWith(".pdf")) {
                attachmentTxt += localeFile.fileType.pdf;
            } else {
                attachmentTxt += localeFile.fileType.unknown;
            }
            attachmentTxt += "</a>";
            attachments.push(attachmentTxt);
        });

        html = `<p>${userAvatar} ${escapeHtml(userTag)} `;

        if (message.type === "GUILD_MEMBER_JOIN") {
            html += `${localeFile.text.serverJoin}`;
        } else if (message.content === "") {
            html += `${localeFile.text.fileSent}`;
        } else {
            html += `<span class="font-size-mini">${timestamp}</span> `;
        }

        html += `<button class="mini" value="<@!${userId}>" onclick="addText(this.value)">@</button>`;

        if (message.content !== "") {
            html += `<br><span class="messageContent">${escapeHtml(message.content)}</span>`
        }

        if (attachments.length > 0) {
            html += `<br><span class="messageContent">${localeFile.text.attachmentTxt} : ${attachments.join(', ')}</span>`;
        }

        return `${html} <span class="messageId">${message.id}</span></p>`;
    }

    function deleteMessage(message) {
        chat.html().split("<p>").forEach((msg) => {
            if (msg.includes(`<span class="messageId">${message.id}</span>`)) {
                chat.html(chat.html().replace(`<p>${msg}`, ""));
            }
        });
    }

    function editMessage(oldMessage, newMessage) {
        chat.html().split("<p>").forEach((msg) => {
            if (msg.includes(`<span class="messageId">${oldMessage.id}</span>`)) {
                chat.html(chat.html().replace("<p>" + msg, "<p>" + msg.replace(`<span class="messageContent">${oldMessage.content}</span>`, `<span class="messageContent">${escapeHtml(newMessage.content)}</span>`)));
            }
        });
    }

    function updateChannel() {
        let channel;
        let user;

        chat.empty();
        if (guilds.val() === "DM") {
            user = client.users.cache.find((user) => user.id === channels.val());

            channel = client.channels.cache.find((channel) => channel.type === "dm" && channel.recipient.id === user.id);
            let avatarUrl = user.avatarURL() || `./img/discord_defaults_avatars/${user.discriminator % 5}.png`;
            guildName.html(`<a href="${avatarUrl}" target="_blank"><img alt="" src="${avatarUrl}" class="avatarIMG"/></a> ${escapeHtml(user.username)}`);
            $("#guildInfo").html(`${localeFile.text.userId} : (${user.id}) <button class="mini" value="<@!${user.id}>" onclick="addText(this.value)">@</button>`);

            channelNameLabel.text(`${localeFile.text.channelNameLabel} [${user.username}]`);
            channelName.html(`<img alt="" src="./img/icon/chat.png" class="avatarIMG"/> #${escapeHtml(user.username)}`);

            if (channel !== null) {
                channel.messages.fetch().then((messages) => {
                    Array.from(messages).reverse().forEach((msg) => {
                        chat.html(chat.html() + createMessage(msg[1]));
                    });
                });
            }
        } else {
            channel = client.channels.cache.find((c) => c.id === channels.val());

            if (channel === null) {
                return;
            }

            channelNameLabel.text(`${localeFile.text.channelNameLabel} [${channel.name}]`);
            channelName.html(`<img alt="" src="./img/icon/chat.png" class="avatarIMG"/> #${escapeHtml(channel.name)}`);
            channel.messages.fetch().then((messages) => {
                Array.from(messages).reverse().forEach((msg) => {
                    chat.html(chat.html() + createMessage(msg[1]));
                });
            });
        }
    }

    function updateGuild() {
        let usersArray = [];
        let guildEmojis = [];
        let guildMembers = [];
        let guild;
        let html = "";

        channels.children("option").remove();
        if (guilds.val() === "DM") {
            // includes client self user and clyde
            if (client.users.cache.size <= 2) {
                return;
            }

            client.users.cache.forEach((user) => {
                if (!user.bot) {
                    usersArray.push([escapeHtml(user.username.toLowerCase()), user.id, escapeHtml(user.tag)]);
                }
            });

            usersArray.sort();

            for (let i = 0; i < usersArray.length; i++) {
                channels.append(`<option value="${usersArray[i][1]}">${escapeHtml(usersArray[i][2])}</option>`);
            }
        } else {
            guild = client.guilds.cache.find((g) => g.id === guilds.val());

            if (guild.channels.cache.filter((chan) => chan.type === "text").size > 0) {
                guild.channels.cache.filter((chan) => chan.type === "text").forEach((channel) => {
                    if (channel.permissionsFor(guild.me).has("VIEW_CHANNEL")) {
                        channels.append(`<option value="${channel.id}">#${escapeHtml(channel.name)}</option>`);
                    }
                });
            }

            guildName.html(`<a href="${guild.iconURL() || "./img/icon/info.png"}" target="_blank"><img alt="" src="${guild.iconURL() || "./img/icon/info.png"}" class="avatarIMG"/></a> ${escapeHtml(guild.name)}`);

            // General informations

            html += `<br>${localeFile.infos.owner}: ${guild.owner.user.tag} <button value="<@!${guild.owner.user.id}>" class="mini" onclick="addText(this.value)">@</button><br>`;
            html += `${localeFile.infos.members}: ${guild.members.cache.filter((member) => !member.user.bot).size}<br>`;
            html += `${localeFile.infos.vChannels}: ${guild.channels.cache.filter((chan) => chan.type === "voice").size}<br>`;
            html += `${localeFile.infos.tChannels}: ${guild.channels.cache.filter((chan) => chan.type === "text").size}<br><br>`;

            // Members button
            guild.members.cache.filter((member) => !member.user.bot).forEach((member) => {
                let avatarUrl = member.user.avatarURL() || `./img/discord_defaults_avatars/${member.user.discriminator % 5}.png`;
                guildMembers.push(`<a href="${avatarUrl}" target="_blank"><img alt="" style="display: inline;" class="avatarIMG" src="${avatarUrl}"/></a> ${member.user.tag} <button value="<@!${member.user.id}>" onclick="addText(this.value)" class="mini">@</button>`);
            });
            html += `<button onclick='toggleVisibilityHeight("#guildMembers")'>${localeFile.infos.members}</button>`;
            html += `<div id="guildMembers" style="display:none; opacity: 0;">${guildMembers.join("<br>")}</div>`;

            // Roles button
            html += `<button onclick='toggleVisibilityHeight("#guildRoles")'>${localeFile.infos.roles}</button>`;
            html += `<div id="guildRoles" style="display:none; opacity: 0;">${guild.roles.cache.map((role) => `${escapeHtml(role.name)} (${role.id})`).join("<br>")}</div>`;

            // Channels button
            if (guild.channels.cache.size > 0) {
                html += `<button onclick='toggleVisibilityHeight("#guildChannels")'>${localeFile.infos.channels}</button>`;
                html += `<div id="guildChannels" style="display:none; opacity: 0;">${guild.channels.cache.map((channels) => `${escapeHtml(channels.name)} (${channels.id})`).join("<br>")}</div>`;
            }

            // Emoji button
            if (guild.emojis.cache.size > 0) {
                guild.emojis.cache.forEach((emoji) => {
                    if (emoji.animated) {
                        guildEmojis.push(`<img alt="" class="emojiImg" src="${emoji.url}" onclick="addText('<a:${emoji.identifier}>')"/>`);
                    } else {
                        guildEmojis.push(`<img alt="" class="emojiImg" src="${emoji.url}" onclick="addText('<:${emoji.identifier}>')"/>`);
                    }
                });
                html += `<button onclick='toggleVisibilityWidth("#guildEmojis")'>${localeFile.infos.emojis}</button>`;
                html += `<div id="guildEmojis" style="display:none; opacity: 0;">${guildEmojis.join(" ")}</div>`;
            }

            $("#guildInfo").html(html);
        }

        updateChannel();
    }

    function fetchGuilds() {
        channels.children("option").remove();
        guilds.children("option").remove();

        if (client.guilds.cache.size === 0) {
            return;
        }

        client.guilds.cache.forEach((guild) => {
            guilds.append(`<option value="${guild.id}">${escapeHtml(guild.name)}</option>`);
        });
        guilds.append(`<option value="DM">[${localeFile.text.privateMessages}]</option>`);

        updateGuild();
    }

    function sendMessage() {
        let user;

        if (toSend.val() === "") {
            tempChange("#send", `[${localeFile.errors.emptyMsg}]`, 2000);
        } else {
            if (guilds.val() === "DM") {
                user = client.users.cache.find((user) => user.id === channels.val());
                user.send(toSend.val());
            } else {
                client.channels.cache.find((channel) => channel.id === channels.val()).send(toSend.val()).catch(() => {
                    tempChange("#send", `[${localeFile.errors.missingPermissions}]`, 2000);
                });
            }
            toSend.val("");
        }
    }

    function scrollAnim(DOM1, DOM2, time) {
        if (document.querySelector(DOM1).checked) {
            if (document.querySelector("#chk3").checked) {
                $(DOM2).animate({
                    scrollTop: $(DOM2)[0].scrollHeight - $(DOM2).height()
                }, time);
            } else {
                $(DOM2).scrollTop($(DOM2)[0].scrollHeight - $(DOM2).height());
            }
        }
    }

    /*///////////////////////////////////////////
                    DISCORD EVENTS
    //////////////////////////////////////////*/
    client.on("message", (message) => {
        if (Number(message.channel.id) === Number(channels.val())) {
            chat.html(chat.html() + createMessage(message));
        }

        if ((Number(message.author.id) === Number(channels.val()) || message.author.id === client.user.id) && message.channel.type === "dm") {
            updateChannel();
        }

        if (message.channel.type !== "dm" && (Number(message.author.id) === Number(client.user.id) || !message.author.bot)) {
            lastMessages.html(lastMessages.html() + `<br>[<b>#${escapeHtml(message.channel.name)} | ${escapeHtml(message.author.tag)}]</b> ${escapeHtml(message.content)}`);
        } else if (message.channel.type === "dm" && !message.author.bot) {
            lastMessages.html(lastMessages.html() + `<br><b>[DM] ${escapeHtml(message.author.tag)}</b> ${escapeHtml(message.content)}`);
        }

        localStorage.setItem("lastMessages", $("#lastMessages").html());
    });

    client.on("ready", () => {
        lastMessages.html(localStorage.getItem("lastMessages") || "");
        fetchGuilds();
    });

    client.on("messageDelete", (message) => {
        if (Number(message.channel.id) === Number(channels.val())) {
            deleteMessage(message);
        }

        if ((Number(message.author.id) === Number(channels.val()) || message.author.id === client.user.id) && message.channel.type === "dm") {
            updateChannel();
        }
    });

    client.on("messageUpdate", (oldMessage, newMessage) => {
        if (Number(oldMessage.channel.id) === Number(channels.val())) {
            editMessage(oldMessage, newMessage);
        }

        if ((Number(oldMessage.author.id) === Number(channels.val()) || oldMessage.author.id === client.user.id) && oldMessage.channel.type === "dm") {
            updateChannel();
        }
    });

    client.on("guildCreate", (guild) => {
        fetchGuilds();
    });

    client.on("guildDelete", (guild) => {
        fetchGuilds();
    });

    client.on("guildUpdate", (oldGuild) => {
        if (oldGuild.id === guilds.val()) {
            updateGuild();
        }
    });

    client.on("guildMemberAdd", (member) => {
        if (member.guild.id === guilds.val()) {
            updateGuild();
        }
    });

    client.on("guildMemberRemove", (member) => {
        if (member.guild.id === guilds.val()) {
            updateGuild();
        }
    });

    client.on("channelCreate", (channel) => {
        if (guilds.val() === "[DM]" || channel.type === "dm") {
            return;
        }

        if (channel.guild.id === guilds.val()) {
            updateGuild();
        }
    });

    client.on("channelDelete", (channel) => {
        if (channel.guild.id === guilds.val()) {
            updateGuild();
        }
    });

    client.on("channelUpdate", (oldChannel) => {
        if (oldChannel.guild.id === guilds.val()) {
            updateGuild();
        }
    });

    client.on("emojiCreate", (emoji) => {
        if (emoji.guild.id === guilds.val()) {
            updateGuild();
        }
    });

    client.on("emojiDelete", (emoji) => {
        if (emoji.guild.id === guilds.val()) {
            updateGuild();
        }
    });

    client.on("emojiUpdate", (oldEmoji) => {
        if (oldEmoji.guild.id === guilds.val()) {
            updateGuild();
        }
    });

    /*///////////////////////////////////////////
                    DOCUMENT EVENTS
    //////////////////////////////////////////*/

    $(document).on("change", "#guilds", () => {
        updateGuild();
    });

    $(document).on("change", "#channels", () => {
        updateChannel();
    });

    /*///////////////////////////////////////////
                    BUTTONS EVENTS
    //////////////////////////////////////////*/

    refreshToken.click(() => {
        if (window.confirm(localeFile.token.confirmation)) {
            localStorage.setItem("token", "");
            window.location.reload();
        }
    });

    send.click(() => {
        sendMessage();
    });

    /* TODO Fix code apparently not working in this version of discord.js
    $("#delLast").click(() => {
        console.log(client.user);
        if (client.user.lastMessage === null) {
            tempChange("#delLast", "[ERROR]", 2000);
            return;
        } else {
            try {
                client.user.lastMessage.delete();
                updateChannel();
            } catch (error) {
                return;
            }
        }
    });
    */

    clearChat.click(() => {
        localStorage.setItem("lastMessages", "");
        $("#lastMessages").empty();
    });

    leaveGuild.click(() => {
        if (guilds.val() !== "DM") {
            if (window.confirm(localeFile.token.confirmation)) {
                client.guilds.cache.find((guild) => guild.id === guilds.val()).leave().catch(() => {
                    tempChange("#leaveGuild", `[${localeFile.errors.error}]`, 2000);
                });
            }
        }
    });

    inviteBtn.click(() => {
        if (guilds.val() !== "DM") {
            client.channels.cache.find((channel) => channel.id === channels.val()).createInvite().then((invite) => {
                alert(`discord.gg/${invite.code}`);
            }).catch(() => {
                tempChange("#inviteBtn", `[${localeFile.errors.missingPermissions}]`, 2000);
            });
        } else {
            tempChange("#inviteBtn", `[${localeFile.errors.dm}]`, 2000);
        }

    });

    refreshChat.click(() => {
        updateChannel();
    });

    /*///////////////////////////////////////////
                    KEYUP EVENTS
    //////////////////////////////////////////*/

    toSend.keyup((event) => {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode === 13) {
            event.preventDefault();
            send.click();
        }
        event.stopPropagation();
    });

    document.addEventListener("keyup", (event) => {
        if (event.code === "Escape") {
            event.preventDefault();
            closeNav();
        }
        event.stopPropagation();
    });

    /*///////////////////////////////////////////
                    AUTO-SCROLL
    //////////////////////////////////////////*/

    lastMessages.bind("mousewheel", (event) => {
        if (event.originalEvent.wheelDelta >= 0) {
            $("#chk1")[0].checked = false;
        } else if ($("#lastMessages")[0].scrollHeight - 500 < $("#lastMessages").scrollTop()) {
            $("#chk1")[0].checked = true;
        }
    });

    chat.bind("mousewheel", (event) => {
        if (event.originalEvent.wheelDelta >= 0) {
            $("#chk2")[0].checked = false;
        } else if ($("#chat")[0].scrollHeight - 500 < $("#chat").scrollTop()) {
            $("#chk2")[0].checked = true;
        }
    });

    setInterval(() => {
        scrollAnim("#chk1", "#lastMessages", 1000);
        scrollAnim("#chk2", "#chat", 250);
    }, 500);
});