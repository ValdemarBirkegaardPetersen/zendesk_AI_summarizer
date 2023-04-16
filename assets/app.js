var client = ZAFClient.init();
client.invoke('resize', {
    width: '100%',
    height: '600px'
});

client.on('app.registered', () => {
    loadTicketDetails();
});



function loadTicketDetails() {
    const ticketContent = document.getElementById('ticket-content');
    client.get('ticket').then((ticket) => {
        const ticketId = ticket.ticket.id;
        const ticketSubject = ticket.ticket.subject;
        const ticketAssignee = ticket.ticket.assignee.user.alias;
        const ticketRequester = ticket.ticket.requester.name + " " + ticket.ticket.requester.email;
        
        const ticketComments = ticket.ticket.comments; 
        
        var x = ticketComments;

        var allComments = ""
        var messageCounter = ticketComments.length;

        ticketComments.forEach((comment) => {
            allComments += "Message author: " + comment.author.name + " (" + comment.author.role + ")<br>" + "Message " + messageCounter + ": " + comment.value.replace(/(<([^>]+)>)/gi, "") + "<br><br>";

            messageCounter -= 1
        }); 

        ticketContent.innerHTML = allComments;


    });
}
