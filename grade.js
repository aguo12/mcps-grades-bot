const token = 'YourToken'
const Discord = require("discord.js");
const fs = require('fs')
const bot = new Discord.Client();
let prefix = 'grade.'
const fetch = require('node-fetch')
const jsdom = require("jsdom");
const linkedAccounts = JSON.parse(fs.readFileSync('./gradeaccounts.json'))
const {
    JSDOM
} = jsdom;


bot.on('ready', () => {
    console.log('This bot is online')
})

bot.on('message', message => {

    let errorEmbed = new Discord.MessageEmbed()
    errorEmbed.setTitle("MCPS Discord Helper")
    errorEmbed.setDescription("`Looks like something went wrong. Please refer to the grade.help command for support or dm me.`")
    errorEmbed.setThumbnail('https://bloximages.newyork1.vip.townnews.com/thesentinel.com/content/tncms/assets/v3/editorial/f/72/f728114c-030f-52a7-8d9e-a124e882670f/5edfca426912a.image.png')
    errorEmbed.setColor(`#0260B9`)
    errorEmbed.setTimestamp()
    errorEmbed.setFooter("Created by unresisting#1337 - @andyguo12")
    errorEmbed.setAuthor(message.author.username, message.author.displayAvatarURL)

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    var args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    console.log("Command receieved. ")
    if (args[1]) {
        var args = args.slice(0).join(' ')
    } else {
        var args = args[0]
    }

    if (command === "user") {
        if (linkedAccounts[message.author.id]) {
            message.reply("You are a verified MCPS nerd.")
        } else {
            message.reply("You are not a verified user!")
        }
    }
    if(command === "login"){
        if(args.split(':')[1]){
            if(linkedAccounts[message.author.id] == null){
                if(message.guild != null){
                    message.reply("You either fucked up the syntax (user:pass) or ur in a server. DM it to me.")
                } else{
                    linkedAccounts[message.author.id] = [args.split(':')[0], args.split(":")[1]];
                    fs.writeFileSync('./gradeaccounts.json', JSON.stringify(linkedAccounts))
                    message.reply("Success. You are now registered.")
                }
            } else{
                message.reply("You are already logged in. -.-")
            }
        } else{
            message.reply("Invalid syntax.")
        }
    }

    if (command === "help"){
        let successEmbed = new Discord.MessageEmbed()
        .setTitle("MCPS Discord Helper")
        .setDescription("`List of commands`")
        successEmbed.addField('Prefix', "`grade.`")
        successEmbed.addField('View user status', "Use `grade.user` to check if you are verified.")
        successEmbed.addField('Get started', "Use `grade.authorize` to recieve login instructions in your messages.")
        successEmbed.addField('Login', "DM `grade.login username:password` with correct MCPS credentials to gain access.")
        successEmbed.addField('Logout', "Use `grade.logout` to remove your login from the bot.")
        successEmbed.addField('Fetch all grades', "Use `grade.all` to fetch all grades.")
        successEmbed.addField('Specific class grade', "Use `grade.get <class keyword>` to fetch the grade for a specific class.")
        successEmbed.addField('View latest class assignments', "Use `grade.class <class keyword>` to fetch assignments for a specific class. (without the <>)")
        successEmbed.addField('View class categories', "Use `grade.filter <class keyword>` to view categories (without the <>).")
        successEmbed.addField('Prefix', "`grade.`")
        .setThumbnail('https://bloximages.newyork1.vip.townnews.com/thesentinel.com/content/tncms/assets/v3/editorial/f/72/f728114c-030f-52a7-8d9e-a124e882670f/5edfca426912a.image.png')
        .setColor(`#0260B9`)
        .setTimestamp()
        .setFooter("Created by unresisting#1337 - @andyguo12")
        .setAuthor(message.author.username, message.author.displayAvatarURL)
        message.channel.send(successEmbed)
    }

    if(command === "authorize"){
        if (linkedAccounts[message.author.id]) {
            message.reply("You are already a MCPS nerd.")
        } else {
            message.reply("Instructions to connect your MCPS account has been messaged to you!")
            message.author.send("Please message me `grade.login username:password`")
        }
    } else{
            if(linkedAccounts[message.author.id] != null){
                if (command === "all") {
                    fetch('https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx', {
                        headers: {
                            "Host": "md-mcps-psv.edupoint.com",
                            "Accept": "*/*",
                            "Content-Type": "text/xml; charset=utf-8",
                            "SOAPAction": "http://edupoint.com/webservices/ProcessWebServiceRequest",
                            "Connection": "keep-alive",
                            "Accept-Language": "en-us",
                            "Content-Length": "621",
                            "Accept-Encoding": "gzip, deflate, br",
                            "User-Agent": "StudentVUE/9.0.9 CFNetwork/1209 Darwin/20.2.0"
                        },
                        method: "POST",
                        body: `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/"><userID>${linkedAccounts[message.author.id][0]}</userID><password>${linkedAccounts[message.author.id][1]}</password><skipLoginLog>1</skipLoginLog><parent>0</parent><webServiceHandleName>PXPWebServices</webServiceHandleName><methodName>Gradebook</methodName><paramStr>&lt;Parms&gt;&lt;ChildIntID&gt;0&lt;/ChildIntID&gt;&lt;ReportPeriod&gt;4&lt;/ReportPeriod&gt;&lt;/Parms&gt;</paramStr></ProcessWebServiceRequest></soap:Body></soap:Envelope>`
                    }).then(resp => resp.text()).catch(err=>{
                        message.channel.send(errorEmbed)
                    }).then(text => {
                        let dom = new JSDOM(text, {
                            contentType: "text/xml"
                        })
                        let gradebook = new JSDOM(dom.window.document.getElementsByTagName('ProcessWebServiceRequestResult')[0].textContent, {
                            textContent: "text/xml"
                        })
                        let successEmbed = new Discord.MessageEmbed()
                            .setTitle("Your Grades")
                            .setDescription("Displaying grades for all courses.")
                            .setThumbnail('https://bloximages.newyork1.vip.townnews.com/thesentinel.com/content/tncms/assets/v3/editorial/f/72/f728114c-030f-52a7-8d9e-a124e882670f/5edfca426912a.image.png')
                            .setColor(`#0260B9`)
                            .setTimestamp()
                            .setFooter("MCPS")
                            .setAuthor(message.author.username, message.author.displayAvatarURL)
                        for (i = 0; i < gradebook.window.document.getElementsByTagName('Course').length; i++) {
                            let course = gradebook.window.document.getElementsByTagName('Course')[i];
                            successEmbed.addField('Course', "`" + course.getAttribute('Title').split(" (")[0] + "`", true);
                            successEmbed.addField('Letter', "`" + course.getElementsByTagName("mark")[0].getAttribute('calculatedscorestring') + "`", true);
                            successEmbed.addField('Percentage', "`%" + course.getElementsByTagName("mark")[0].getAttribute('calculatedscoreraw') + "`", true);
                        }
                        message.reply(successEmbed)
                    }).catch(err=>{
                        message.channel.send(errorEmbed)
                    })
                }

                if(command === "logout"){
                    try{
                        delete linkedAccounts[message.author.id];
                    fs.writeFileSync('./gradeaccounts.json', JSON.stringify(linkedAccounts))
                    message.reply("You've successfully logged out. Have a nice day you nerd.")
                    } catch {
                        message.channel.send(errorEmbed)
                    }
                }
        
                if (command === "get") {
                    fetch('https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx', {
                        headers: {
                            "Host": "md-mcps-psv.edupoint.com",
                            "Accept": "*/*",
                            "Content-Type": "text/xml; charset=utf-8",
                            "SOAPAction": "http://edupoint.com/webservices/ProcessWebServiceRequest",
                            "Connection": "keep-alive",
                            "Accept-Language": "en-us",
                            "Content-Length": "621",
                            "Accept-Encoding": "gzip, deflate, br",
                            "User-Agent": "StudentVUE/9.0.9 CFNetwork/1209 Darwin/20.2.0"
                        },
                        method: "POST",
                        body: `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/"><userID>${linkedAccounts[message.author.id][0]}</userID><password>${linkedAccounts[message.author.id][1]}</password><skipLoginLog>1</skipLoginLog><parent>0</parent><webServiceHandleName>PXPWebServices</webServiceHandleName><methodName>Gradebook</methodName><paramStr>&lt;Parms&gt;&lt;ChildIntID&gt;0&lt;/ChildIntID&gt;&lt;ReportPeriod&gt;4&lt;/ReportPeriod&gt;&lt;/Parms&gt;</paramStr></ProcessWebServiceRequest></soap:Body></soap:Envelope>`
                    }).then(resp => resp.text()).catch(err=>{
                        message.channel.send(errorEmbed)
                    }).then(text => {
                        let dom = new JSDOM(text, {
                            contentType: "text/xml"
                        })
                        let gradebook = new JSDOM(dom.window.document.getElementsByTagName('ProcessWebServiceRequestResult')[0].textContent, {
                            textContent: "text/xml"
                        })
                        let successEmbed = new Discord.MessageEmbed()
                            .setTitle("Your Grades")
                            .setDescription("Displaying grades for search query " + "`" + args.toLowerCase() + "`")
                            .setThumbnail('https://bloximages.newyork1.vip.townnews.com/thesentinel.com/content/tncms/assets/v3/editorial/f/72/f728114c-030f-52a7-8d9e-a124e882670f/5edfca426912a.image.png')
                            .setColor(`#0260B9`)
                            .setTimestamp()
                            .setFooter("MCPS")
                            .setAuthor(message.author.username, message.author.displayAvatarURL)
                        for (i = 0; i < gradebook.window.document.getElementsByTagName('Course').length; i++) {
                            let course = gradebook.window.document.getElementsByTagName('Course')[i];
                            if (course.getAttribute('Title').toLowerCase().includes(args.toLowerCase())) {
                                successEmbed.addField('Course', "`" + course.getAttribute('Title').split(" (")[0] + "`", true);
                                successEmbed.addField('Letter', "`" + course.getElementsByTagName("mark")[0].getAttribute('calculatedscorestring') + "`", true);
                                successEmbed.addField('Percentage', "`%" + course.getElementsByTagName("mark")[0].getAttribute('calculatedscoreraw') + "`", true);
                            }
                        }
                    }).catch(err=>{
                        message.channel.send(errorEmbed)
                    })
                }
            
                if (command === "filter") {
                    fetch('https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx', {
                        headers: {
                            "Host": "md-mcps-psv.edupoint.com",
                            "Accept": "*/*",
                            "Content-Type": "text/xml; charset=utf-8",
                            "SOAPAction": "http://edupoint.com/webservices/ProcessWebServiceRequest",
                            "Connection": "keep-alive",
                            "Accept-Language": "en-us",
                            "Content-Length": "621",
                            "Accept-Encoding": "gzip, deflate, br",
                            "User-Agent": "StudentVUE/9.0.9 CFNetwork/1209 Darwin/20.2.0"
                        },
                        method: "POST",
                        body: `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/"><userID>${linkedAccounts[message.author.id][0]}</userID><password>${linkedAccounts[message.author.id][1]}</password><skipLoginLog>1</skipLoginLog><parent>0</parent><webServiceHandleName>PXPWebServices</webServiceHandleName><methodName>Gradebook</methodName><paramStr>&lt;Parms&gt;&lt;ChildIntID&gt;0&lt;/ChildIntID&gt;&lt;ReportPeriod&gt;4&lt;/ReportPeriod&gt;&lt;/Parms&gt;</paramStr></ProcessWebServiceRequest></soap:Body></soap:Envelope>`
                    }).then(resp => resp.text()).catch(err=>message.channel.send(errorEmbed)).then(text => {
                        let dom = new JSDOM(text, {
                            contentType: "text/xml"
                        })
                        let gradebook = new JSDOM(dom.window.document.getElementsByTagName('ProcessWebServiceRequestResult')[0].textContent, {
                            textContent: "text/xml"
                        })
                        let successEmbed = new Discord.MessageEmbed()
                            .setTitle("Your Grades")
                            .setDescription("Displaying categories for search query " + "`" + args.toLowerCase() + "`")
                            .setThumbnail('https://bloximages.newyork1.vip.townnews.com/thesentinel.com/content/tncms/assets/v3/editorial/f/72/f728114c-030f-52a7-8d9e-a124e882670f/5edfca426912a.image.png')
                            .setColor(`#0260B9`)
                            .setTimestamp()
                            .setFooter("MCPS")
                            .setAuthor(message.author.username, message.author.displayAvatarURL)
                        for (i = 0; i < gradebook.window.document.getElementsByTagName('Course').length; i++) {
                            let course = gradebook.window.document.getElementsByTagName('Course')[i];
                            if (course.getAttribute('Title').toLowerCase().includes(args.toLowerCase())) {
                                 let summary = course.getElementsByTagName('GradeCalculationSummary')[0]
                                 Array.from(summary.getElementsByTagName('AssignmentGradeCalc')).forEach((cat)=>{
                                    successEmbed.addField('Name', "`" + cat.getAttribute('Type') + "`", true);
                                    successEmbed.addField('Weight', "`" + cat.getAttribute('Weight') + "`", true);
                                    successEmbed.addField('Points', "`" + cat.getAttribute('CalculatedMark') + " - " + cat.getAttribute('Points') + "/" + cat.getAttribute('PointsPossible')  + "`", true);
                                 })
                                 message.reply(successEmbed)                                    
                                 }
                            } 
                    }).catch(err=>{console.log(err)}).catch(err=>message.channel.send(errorEmbed))
                }
            
                if (command === "above") {
                    fetch('https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx', {
                        headers: {
                            "Host": "md-mcps-psv.edupoint.com",
                            "Accept": "*/*",
                            "Content-Type": "text/xml; charset=utf-8",
                            "SOAPAction": "http://edupoint.com/webservices/ProcessWebServiceRequest",
                            "Connection": "keep-alive",
                            "Accept-Language": "en-us",
                            "Content-Length": "621",
                            "Accept-Encoding": "gzip, deflate, br",
                            "User-Agent": "StudentVUE/9.0.9 CFNetwork/1209 Darwin/20.2.0"
                        },
                        method: "POST",
                        body: `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/"><userID>${linkedAccounts[message.author.id][0]}</userID><password>${linkedAccounts[message.author.id][1]}</password><skipLoginLog>1</skipLoginLog><parent>0</parent><webServiceHandleName>PXPWebServices</webServiceHandleName><methodName>Gradebook</methodName><paramStr>&lt;Parms&gt;&lt;ChildIntID&gt;0&lt;/ChildIntID&gt;&lt;ReportPeriod&gt;4&lt;/ReportPeriod&gt;&lt;/Parms&gt;</paramStr></ProcessWebServiceRequest></soap:Body></soap:Envelope>`
                    }).then(resp => resp.text()).catch(err=>message.channel.send(errorEmbed)).then(text => {
                        let dom = new JSDOM(text, {
                            contentType: "text/xml"
                        })
                        let gradebook = new JSDOM(dom.window.document.getElementsByTagName('ProcessWebServiceRequestResult')[0].textContent, {
                            textContent: "text/xml"
                        })
                        let successEmbed = new Discord.MessageEmbed()
                            .setTitle("Your Grades")
                            .setDescription("Displaying grades for above " + "`%" + args.toLowerCase() + "`")
                            .setThumbnail('https://bloximages.newyork1.vip.townnews.com/thesentinel.com/content/tncms/assets/v3/editorial/f/72/f728114c-030f-52a7-8d9e-a124e882670f/5edfca426912a.image.png')
                            .setColor(`#0260B9`)
                            .setTimestamp()
                            .setFooter("MCPS")
                            .setAuthor(message.author.username, message.author.displayAvatarURL)
                        for (i = 0; i < gradebook.window.document.getElementsByTagName('Course').length; i++) {
                            let course = gradebook.window.document.getElementsByTagName('Course')[i];
                            if (parseFloat(course.getElementsByTagName("mark")[0].getAttribute('calculatedscoreraw')) > parseFloat(args)) {
                                successEmbed.addField('Course', "`" + course.getAttribute('Title').split(" (")[0] + "`", true);
                                successEmbed.addField('Letter', "`" + course.getElementsByTagName("mark")[0].getAttribute('calculatedscorestring') + "`", true);
                                successEmbed.addField('Percentage', "`%" + course.getElementsByTagName("mark")[0].getAttribute('calculatedscoreraw') + "`", true);
                            }
                        }
                        message.reply(successEmbed)
                    }).catch(err=>message.channel.send(errorEmbed))
                }
            
                if (command === "class") {
            
                    fetch('https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx', {
                        headers: {
                            "Host": "md-mcps-psv.edupoint.com",
                            "Accept": "*/*",
                            "Content-Type": "text/xml; charset=utf-8",
                            "SOAPAction": "http://edupoint.com/webservices/ProcessWebServiceRequest",
                            "Connection": "keep-alive",
                            "Accept-Language": "en-us",
                            "Content-Length": "621",
                            "Accept-Encoding": "gzip, deflate, br",
                            "User-Agent": "StudentVUE/9.0.9 CFNetwork/1209 Darwin/20.2.0"
                        },
                        method: "POST",
                        body: `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/"><userID>${linkedAccounts[message.author.id][0]}</userID><password>${linkedAccounts[message.author.id][1]}</password><skipLoginLog>1</skipLoginLog><parent>0</parent><webServiceHandleName>PXPWebServices</webServiceHandleName><methodName>Gradebook</methodName><paramStr>&lt;Parms&gt;&lt;ChildIntID&gt;0&lt;/ChildIntID&gt;&lt;ReportPeriod&gt;4&lt;/ReportPeriod&gt;&lt;/Parms&gt;</paramStr></ProcessWebServiceRequest></soap:Body></soap:Envelope>`
                    }).then(resp => resp.text()).catch(err=>message.channel.send(errorEmbed)).then(text => {
                        let dom = new JSDOM(text, {
                            contentType: "text/xml"
                        })
                        let gradebook = new JSDOM(dom.window.document.getElementsByTagName('ProcessWebServiceRequestResult')[0].textContent, {
                            textContent: "text/xml"
                        })
                        for (i = 0; i < gradebook.window.document.getElementsByTagName('Course').length; i++) {
                            let course = gradebook.window.document.getElementsByTagName('Course')[i];
                            if (course.getAttribute('Title').toLowerCase().includes(args.toLowerCase())) {
                                let successEmbed = new Discord.MessageEmbed()
                                    .setTitle("Your Grades")
                                    .setDescription("Displaying assignments for class " + "`" + args.toLowerCase() + "`")
                                    .setThumbnail('https://bloximages.newyork1.vip.townnews.com/thesentinel.com/content/tncms/assets/v3/editorial/f/72/f728114c-030f-52a7-8d9e-a124e882670f/5edfca426912a.image.png')
                                    .setColor(`#0260B9`)
                                    .setTimestamp()
                                    .setFooter("MCPS")
                                    .setAuthor(message.author.username, message.author.displayAvatarURL)
                                if (course.getElementsByTagName('Assignment').length >= 8) {
                                    for (i = 0; i < 8; i++) {
                                        let assignment = course.getElementsByTagName('Assignment')[i]
                                        successEmbed.addField('Assignment', assignment.getAttribute('Measure'), true)
                                        successEmbed.addField('Type', assignment.getAttribute('Type'), true)
                                        successEmbed.addField('Score', assignment.getAttribute('Points'), true)
                                    }
                                    message.channel.send(successEmbed)
                                } else {
                                    for (i = 0; i < course.getElementsByTagName('Assignment').length; i++) {
                                        let assignment = course.getElementsByTagName('Assignment')[i]
                                        successEmbed.addField('Assignment', assignment.getAttribute('Measure'), true)
                                        successEmbed.addField('Type', assignment.getAttribute('Type'), true)
                                        successEmbed.addField('Score', assignment.getAttribute('Points'), true)
                                    }
                                    message.channel.send(successEmbed)
                                }
                            }
                        }
                    }).catch(err=>message.channel.send(errorEmbed))
                }
            
                if (command === "below") {
                    fetch('https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx', {
                        headers: {
                            "Host": "md-mcps-psv.edupoint.com",
                            "Accept": "*/*",
                            "Content-Type": "text/xml; charset=utf-8",
                            "SOAPAction": "http://edupoint.com/webservices/ProcessWebServiceRequest",
                            "Connection": "keep-alive",
                            "Accept-Language": "en-us",
                            "Content-Length": "621",
                            "Accept-Encoding": "gzip, deflate, br",
                            "User-Agent": "StudentVUE/9.0.9 CFNetwork/1209 Darwin/20.2.0"
                        },
                        method: "POST",
                        body: `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/"><userID>${linkedAccounts[message.author.id][0]}</userID><password>${linkedAccounts[message.author.id][1]}</password><skipLoginLog>1</skipLoginLog><parent>0</parent><webServiceHandleName>PXPWebServices</webServiceHandleName><methodName>Gradebook</methodName><paramStr>&lt;Parms&gt;&lt;ChildIntID&gt;0&lt;/ChildIntID&gt;&lt;ReportPeriod&gt;4&lt;/ReportPeriod&gt;&lt;/Parms&gt;</paramStr></ProcessWebServiceRequest></soap:Body></soap:Envelope>`
                    }).then(resp => resp.text()).catch(err=>message.channel.send(errorEmbed)).then(text => {
                        let dom = new JSDOM(text, {
                            contentType: "text/xml"
                        })
                        let gradebook = new JSDOM(dom.window.document.getElementsByTagName('ProcessWebServiceRequestResult')[0].textContent, {
                            textContent: "text/xml"
                        })
                        let successEmbed = new Discord.MessageEmbed()
                            .setTitle("Your Grades")
                            .setDescription("Displaying grades for below " + "`%" + args.toLowerCase() + "`")
                            .setThumbnail('https://bloximages.newyork1.vip.townnews.com/thesentinel.com/content/tncms/assets/v3/editorial/f/72/f728114c-030f-52a7-8d9e-a124e882670f/5edfca426912a.image.png')
                            .setColor(`#0260B9`)
                            .setTimestamp()
                            .setFooter("MCPS")
                            .setAuthor(message.author.username, message.author.displayAvatarURL)
                        for (i = 0; i < gradebook.window.document.getElementsByTagName('Course').length; i++) {
                            let course = gradebook.window.document.getElementsByTagName('Course')[i];
                            if (parseFloat(course.getElementsByTagName("mark")[0].getAttribute('calculatedscoreraw')) < parseFloat(args)) {
                                successEmbed.addField('Course', "`" + course.getAttribute('Title').split(" (")[0] + "`", true);
                                successEmbed.addField('Letter', "`" + course.getElementsByTagName("mark")[0].getAttribute('calculatedscorestring') + "`", true);
                                successEmbed.addField('Percentage', "`%" + course.getElementsByTagName("mark")[0].getAttribute('calculatedscoreraw') + "`", true);
                            }
                        }
                        message.reply(successEmbed)
                    }).catch(err=>message.channel.send(errorEmbed))
                }
            } 
    }   
})


bot.login(token);
