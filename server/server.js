const superagent = require('superagent');
exports = {

  events: [
    { event: 'onTicketCreate', callback: 'onTicketCreateHandler' }
  ],

  onTicketCreateHandler: function (args) {
    console.log("****************")
    console.log(args.data.ticket.custom_fields)
    var customerID = args.iparams.customerID;
    console.log(customerID)
    for (const key of Object.entries(args.data.ticket.custom_fields)) {
      // console.log(key[0], customerID)
      if (key[0].includes(customerID)) {
        console.log(args.data.ticket.custom_fields[key[0]]);
        if (args.data.ticket.custom_fields[key[0]] !== null)
          makeRequest(args.data.ticket, args.iparams, args.data.ticket.custom_fields[key[0]], args.data.actor);
        break;
      }
    }
  }

};
function makeRequest(ticket, iparams, customerID, actor) {
  var body = {
    // "CustomerID": 30000499,
    "CustomerID": customerID,
    "Note": `<b>Ticket Details:</b><br/><div>Subject: ${ticket.subject}</div><div>ID: ${ticket.id}</div>
    <div>Created By: ${actor.name} (${actor.email})</div>
    <div>Description: ${ticket.description_text}</div><div>URL: <a href="https://${iparams.domain}/a/tickets/${ticket.id}" target="_blank">https://${iparams.domain}/a/tickets/${ticket.id}</a></div>`,
    "UserName": "Freshworks", "NoteType": "FreshDesk Ticket", "CreatedDate": new Date().toISOString()
  };
  body = JSON.stringify(body);
  console.log(`${iparams.cargo_url}/CreateCustomerNote`)
  console.log(iparams.cargoApiKey)
  superagent.post(`${iparams.cargo_url}/CreateCustomerNote`).send(body)
    .set('APIKey', iparams.cargoApiKey).set('Content-Type', 'application/json').end((err, res) => {
      console.log("error")
      console.error(err)
      console.log("success")
      console.log(res.body)
    });

}